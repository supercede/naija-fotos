import { ApplicationError, NotFoundError } from '../helpers/errors';
/**
 * @description restricts a request to a logged in user (for a personalized request)
 * or an admin or moderator (otherwise), for update and delete actions
 *
 * @export
 * @param {mongoose.Model} Model - Model to be queried
 * @param {string} itemId - id of item to be modified
 * @param {string} id - request user id
 * @param {role} role - request user role
 * @returns
 */
export default async function authorize(Model, itemId, id, role) {
  const doc = await Model.findOne({ _id: itemId });

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
