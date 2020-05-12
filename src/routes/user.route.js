import { Router } from 'express';
import userController from '../controllers/user.controller';
import validator from '../middleware/validator';
import catchAsync from '../utils/catchAsync';
import userSchema from '../validations/user.validation';
import { AvatarUploads } from '../services/imageUpload';
import authentication from '../middleware/authenticate';
import photoController from '../controllers/photo.controller';
import collectionController from '../controllers/collection.controller';

const { userUpdateSchema } = userSchema;

const { authenticate } = authentication;
const {
  uploadAvatar,
  updateMe,
  getAllUsers,
  getMe,
  getUser,
  deleteMe,
  followOrUnfollow,
  getUserFollowers,
  getUserFollowing,
} = userController;

const { getAllPhotos } = photoController;

const { getAllCollections } = collectionController;

const userRouter = Router();

userRouter.get('/', getAllUsers);

// userRouter.use(authenticate);

userRouter.get('/me', authenticate, getMe, catchAsync(getUser));
userRouter.get('/myPhotos', authenticate, getMe, catchAsync(getAllPhotos));
userRouter.get(
  '/myCollections',
  authenticate,
  getMe,
  catchAsync(getAllCollections),
);
userRouter.get(
  '/myFollowers',
  authenticate,
  getMe,
  catchAsync(getUserFollowers),
);
userRouter.get(
  '/myFollowing',
  authenticate,
  getMe,
  catchAsync(getUserFollowing),
);

userRouter.get('/:userId', catchAsync(getUser));
userRouter.get('/:userId/photos', catchAsync(getAllPhotos));
userRouter.get('/:userId/collections', catchAsync(getAllCollections));

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

userRouter.patch(
  '/profile/:userId/following',
  authenticate,
  catchAsync(followOrUnfollow),
);

userRouter.get(
  '/:userId/followers',
  authenticate,
  catchAsync(getUserFollowers),
);

userRouter.get(
  '/:userId/following',
  authenticate,
  catchAsync(getUserFollowing),
);

userRouter.delete('/deleteMe', authenticate, catchAsync(deleteMe));

export default userRouter;
