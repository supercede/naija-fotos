import { ApplicationError, NotFoundError } from '../helpers/errors';

export default async function authorize(Model, photoId, id, role) {
  const doc = await Model.findOne({ _id: photoId });

  if (!doc) {
    throw new NotFoundError('Item not found');
  }
  let userId;

  if (Model.collection.collectionName === 'users') {
    userId = doc.id;
  } else {
    userId = doc.user.id;
  }

  if (userId !== id && role === 'user') {
    throw new ApplicationError(
      403,
      'You are not permitted to perform this operation',
    );
  }

  return doc;
}
