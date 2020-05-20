import { NotFoundError, ApplicationError } from '../helpers/errors';
import Collection from '../models/collection.model';
import Photo from '../models/photo.model';

export default {
  /**
   * @description check if an item exist in a collection
   *
   * @param {mongoose.Model} Model - Model to be queried
   * @param {string} id - id of item to be modified

   */
  checkIfExists: async (Model, id) => {
    const modelName = await Model.collection.collectionName.slice(0, -1);

    const item = await Model.findById(id);

    if (!item) {
      throw new NotFoundError(`${modelName} not found`);
    }
  },

  /**
   * @description check if user can add/remove photo to/from a collection
   *
   * @param {string} collectionId
   * @param {string} photoId
   * @param {string} userId
   *
   */
  verify: async (collectionId, photoId, userId) => {
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
  },

  /**
   * @description update a field total in a collection
   *
   * @param {mongoose.Model} Model - Model to be queried
   * @param {string} id - id of item to be updated
   * @param {string} val - value to increase or decrease field by
   * @param {field} field - field to be updated in item
   *
   */
  updateCount: async (Model, id, val, field) => {
    const doc = await Model.findOneAndUpdate(
      { _id: id },
      { $inc: { [`${field}`]: val } },
      {
        new: true,
        runValidators: true,
      },
    ).select('name imageURL description user upvoteCount');

    return doc;
  },
};
