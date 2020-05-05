import { ApplicationError, NotFoundError } from '../helpers/errors';
import deleteImage from '../helpers/deleteImage';
import Photo from '../models/photo.model';
import filterObj from '../helpers/filterObject';
import SearchFeatures from '../utils/searchFeatures';

const authorize = async (photoId, id, role) => {
  const photo = await Photo.findOne({ _id: photoId });
  if (!photo) {
    throw new NotFoundError('Picture not found');
  }

  if (photo.user.id !== id && role === 'user') {
    throw new ApplicationError(
      403,
      'You are not permitted to perform this operation',
    );
  }

  return photo;
};

export default {
  uploadImage: async (req, res) => {
    if (req.file) {
      const { height, width, secure_url } = req.file;

      if (height < 500 || width < 500) {
        deleteImage(secure_url);
        throw new ApplicationError(
          400,
          'File size should be at least than 500px * 500px',
        );
      }

      req.body.imageURL = req.file.secure_url;

      req.body.user = req.user._id;

      const photoObj = filterObj(
        req.body,
        'imageURL',
        'description',
        'user',
        'tags',
      );

      const photo = await Photo.create(photoObj);

      res.status(201).json({
        status: 'success',
        data: {
          photo,
        },
      });
    } else {
      throw new ApplicationError(400, 'Please upload an image');
    }
  },

  getAllPhotos: async (req, res) => {
    const filter = {};
    if (req.query.tag) {
      filter.tags = req.query.tag;
    }

    if (req.params.userId) {
      filter.user = req.params.userId;
    }

    const photosQuery = new SearchFeatures(Photo.find(filter), req.query)
      .filter()
      .sort()
      .fieldLimit()
      .pagination();

    const photos = await photosQuery.query;

    res.status(200).json({
      status: 'success',
      data: {
        photos,
      },
    });
  },

  getOnePhoto: async (req, res) => {
    const { photoId } = req.params;

    const photo = await Photo.findById({ _id: photoId }).populate('user', {
      userName: 1,
      name: 1,
      avatar: 1,
      local: 1,
    });

    if (!photo) {
      throw new NotFoundError('Photo not found');
    }

    res.status(200).json({
      status: 'success',
      data: {
        photo,
      },
    });
  },

  updatePhoto: async (req, res) => {
    const { id, role } = req.user;

    const { photoId } = req.params;

    await authorize(photoId, id, role);

    const updates = filterObj(req.body, 'description', 'tags');
    const updatedPhoto = await Photo.findByIdAndUpdate(photoId, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: {
        photo: updatedPhoto,
      },
    });
  },

  deletePhoto: async (req, res) => {
    const { id, role } = req.user;

    const { photoId } = req.params;

    await authorize(photoId, id, role);

    const deletedPhoto = await Photo.findByIdAndRemove(photoId);

    deleteImage(deletedPhoto.imageURL);

    res.status(204).json({
      status: 'success',
    });
  },
};
