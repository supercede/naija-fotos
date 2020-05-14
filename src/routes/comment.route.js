import { Router } from 'express';
import commentController from '../controllers/comment.controller';
import authentication from '../middleware/authenticate';
import commentSchema from '../validations/comment.validation';
import validator from '../middleware/validator';

const { authenticate, restrict } = authentication;

const {
  getAllComments,
  getOneComment,
  updateComment,
  deleteComment,
} = commentController;

const commentRouter = Router();
const { CommentUpdateSchema } = commentSchema;

commentRouter
  .route('/')
  .get(authenticate, restrict('admin', 'moderator'), getAllComments);

commentRouter
  .route('/:itemId')
  .get(authenticate, getOneComment)
  .patch(authenticate, validator(CommentUpdateSchema), updateComment)
  .delete(authenticate, deleteComment);

export default commentRouter;
