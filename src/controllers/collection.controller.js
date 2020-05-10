import { ApplicationError, NotFoundError } from '../helpers/errors';
import Photo from '../models/photo.model';
import filterObj from '../helpers/filterObject';
import Collection from '../models/collection.model';
import dbqueries from '../utils/dbqueries';

const {
  getAll,
  updateOne,
  deleteOne,
  getOne,
} = dbqueries;

const verify = async (collectionId, photoId, userId) => {
  const collection = await Collection.findById(collectionId);

  if (!collection) {
    throw new NotFoundError('Collection not found');
  }

  if (collection.user.id !== userId) {
    throw new ApplicationError(
      403,
      'You are not permitted to perform this operation',
    );
  }

  const photo = await Photo.findById(photoId);

  if (!photo) {
    throw new NotFoundError('Photo not found');
  }
  return { photo, collection };
};

export default {
  createCollection: async (req, res) => {
    req.body.user = req.user._id;

    const collectionObj = filterObj(
      req.body,
      'name',
      'description',
      'user',
      'private',
    );

    const collection = await Collection.create(collectionObj);

    res.status(201).json({
      status: 'success',
      data: {
        collection,
      },
    });
  },

  getAllCollections: getAll(Collection),

  getOneCollection: getOne(Collection),

  updateCollection: updateOne(Collection, 'name', 'description', 'private'),

  deleteCollection: deleteOne(Collection),

  addPhotoToCollection: async (req, res) => {
    const { collectionId, photoId } = req.params;

    const result = await verify(collectionId, photoId, req.user.id);

    const { photo } = result;

    const newCollection = await Collection.findByIdAndUpdate(
      collectionId,
      { $addToSet: { photos: photoId, tags: photo.tags } },
      {
        new: true,
        runValidators: true,
      },
    );

    res.status(200).json({
      status: 'success',
      data: {
        collection: newCollection,
      },
    });
  },

  removePhotoFromCollection: async (req, res) => {
    const { collectionId, photoId } = req.params;

    const result = await verify(collectionId, photoId, req.user.id);

    const { collection } = result;

    collection.photos = collection.photos.filter(photo => photo.id !== photoId);

    const newCollection = await collection.save();

    res.status(200).json({
      status: 'success',
      data: {
        collection: newCollection,
      },
    });
  },
};
