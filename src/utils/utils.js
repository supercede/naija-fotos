import { NotFoundError, ApplicationError } from '../helpers/errors';
import Collection from '../models/collection.model';
import Photo from '../models/photo.model';

export default {
  checkIfExists: async (Model, id) => {
    const modelName = await Model.collection.collectionName.slice(0, -1);

    const item = await Model.findById(id);

    if (!item) {
      throw new NotFoundError(`${modelName} not found`);
    }
  },

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
};
