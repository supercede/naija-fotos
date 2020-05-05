import { Router } from 'express';
import userController from '../controllers/user.controller';
import validator from '../middleware/validator';
import catchAsync from '../utils/catchAsync';
import userSchema from '../validations/user.validation';
import { AvatarUploads } from '../services/imageUpload';
import authentication from '../middleware/authenticate';
import photoController from '../controllers/photo.controller';

const { userUpdateSchema } = userSchema;

const { authenticate } = authentication;
const {
  uploadAvatar,
  updateMe,
  getAllUsers,
  getMe,
  getUser,
  deleteMe,
} = userController;

const { getAllPhotos } = photoController;

const userRouter = Router();

userRouter.get('/', getAllUsers);

// userRouter.use(authenticate);

userRouter.get('/me', authenticate, getMe, catchAsync(getUser));
userRouter.get('/myPhotos', authenticate, getMe, catchAsync(getAllPhotos));

userRouter.get('/:userId', catchAsync(getUser));

userRouter.get('/:userId/photos', catchAsync(getAllPhotos));

userRouter.patch(
  '/avatar',
  authenticate,
  AvatarUploads.single('avatar'),
  catchAsync(uploadAvatar),
);

userRouter.patch(
  '/updateMe',
  authenticate,
  validator(userUpdateSchema),
  catchAsync(updateMe),
);

userRouter.delete('/deleteMe', authenticate, catchAsync(deleteMe));

export default userRouter;
