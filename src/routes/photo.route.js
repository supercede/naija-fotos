import { Router } from 'express';
import photoController from '../controllers/photo.controller';
import commentController from '../controllers/comment.controller';
import { PhotoUploads } from '../services/imageUpload';
import photoSchema from '../validations/photo.validation';
import commentSchema from '../validations/comment.validation';
import catchAsync from '../middleware/catchAsync';
import validator from '../middleware/validator';
import authentication from '../middleware/authenticate';
import upvoteController from '../controllers/upvote.controller';

const { authenticate } = authentication;
const {
  uploadImage,
  getAllPhotos,
  deletePhoto,
  getOnePhoto,
  updatePhoto,
} = photoController;

const { likeOrUnlikeResource, getResourceLikes } = upvoteController;

const { postComment, getPhotoCollectionComments } = commentController;

const { photoUploadSchema, photoUpdateSchema } = photoSchema;
const { createCommentSchema } = commentSchema;
const photoRouter = Router();

photoRouter
  .route('/')
  .post(
    authenticate,
    PhotoUploads.single('photo'),
    validator(photoUploadSchema),
    catchAsync(uploadImage),
  )
  .get(getAllPhotos);

photoRouter
  .route('/:itemId')
  .get(getOnePhoto)
  .patch(authenticate, validator(photoUpdateSchema), catchAsync(updatePhoto))
  .delete(authenticate, catchAsync(deletePhoto));

photoRouter
  .route('/:photoId/comments')
  .get(catchAsync(getPhotoCollectionComments))
  .post(authenticate, validator(createCommentSchema), postComment);

photoRouter
  .route('/:photoId/vote')
  .post(authenticate, catchAsync(likeOrUnlikeResource))
  .get(authenticate, getResourceLikes);

// photoRouter.route('/:photoId/tag');

export default photoRouter;
