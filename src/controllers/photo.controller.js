import { ApplicationError } from '../helpers/errors';
import deleteImage from '../helpers/deleteImage';
import Photo from '../models/photo.model';
import filterObj from '../helpers/filterObject';
import dbqueries from '../utils/dbqueries';

const {
  getAll,
  updateOne,
  deleteOne,
  getOne,
} = dbqueries;

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

  getAllPhotos: getAll(Photo),

  getOnePhoto: getOne(Photo),

  updatePhoto: updateOne(Photo, 'description', 'tags'),

  deletePhoto: deleteOne(Photo),
};
