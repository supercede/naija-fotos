import { Router } from 'express';
import collectionController from '../controllers/collection.controller';
import commentController from '../controllers/comment.controller';
import authentication from '../middleware/authenticate';
import collectionSchema from '../validations/collection.validation';
import commentSchema from '../validations/comment.validation';
import catchAsync from '../utils/catchAsync';
import validator from '../middleware/validator';
import upvoteController from '../controllers/upvote.controller';

const collectionRouter = Router();
const {
  createCollection,
  getAllCollections,
  updateCollection,
  deleteCollection,
  getOneCollection,
  addPhotoToCollection,
  removePhotoFromCollection,
} = collectionController;
const { likeOrUnlikeResource, getResourceLikes } = upvoteController;

const { authenticate, isLoggedIn } = authentication;

const { createCollectionSchema, collectionUpdateSchema } = collectionSchema;
const { createCommentSchema } = commentSchema;
const { postComment, getPhotoCollectionComments } = commentController;

collectionRouter
  .route('/')
  .post(authenticate, validator(createCollectionSchema), createCollection)
  .get(isLoggedIn, getAllCollections);

collectionRouter
  .route('/:itemId')
  .get(isLoggedIn, getOneCollection)
  .patch(authenticate, validator(collectionUpdateSchema), updateCollection)
  .delete(authenticate, deleteCollection);

collectionRouter
  .route('/:collectionId/comments')
  .get(catchAsync(getPhotoCollectionComments))
  .post(authenticate, validator(createCommentSchema), postComment);

collectionRouter
  .route('/:collectionId/vote')
  .post(authenticate, catchAsync(likeOrUnlikeResource))
  .get(authenticate, getResourceLikes);

collectionRouter
  .route('/:collectionId/:photoId')
  .post(authenticate, catchAsync(addPhotoToCollection))
  .delete(authenticate, catchAsync(removePhotoFromCollection));

export default collectionRouter;
