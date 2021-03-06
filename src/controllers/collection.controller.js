import Collection from '../models/collection.model';
import dbqueries from '../utils/dbqueries';
import utils from '../utils/utils';

const {
  getAll,
  updateOne,
  deleteOne,
  getOne,
  createOne,
} = dbqueries;

const { verify } = utils;

export default {
  createCollection: createOne(
    Collection,
    'name',
    'description',
    'user',
    'private',
  ),

  getAllCollections: getAll(Collection),

  getOneCollection: getOne(Collection),

  updateCollection: updateOne(Collection, 'name', 'description', 'private'),

  deleteCollection: deleteOne(Collection),

  /**
   * @function addPhotoToCollection
   * @description handles adding a photo to a collection
   *
   * @param {Object} request - the request object
   * @param {Object} response - the response object
   *
   * @returns {Object} response - the response object
   */
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

  /**
   * @function removePhotoFromCollection
   * @description handles removing a photo from a collection
   *
   * @param {Object} request - the request object
   * @param {Object} response - the response object
   *
   * @returns {Object} response - the response object
   */
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
