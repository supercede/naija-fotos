import { Router } from 'express';
import collectionController from '../controllers/collection.controller';
import authentication from '../middleware/authenticate';
import collectionSchema from '../validations/collection.validation';
import catchAsync from '../utils/catchAsync';
import validator from '../middleware/validator';

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
const { authenticate, isLoggedIn } = authentication;
const { createCollectionSchema, collectionUpdateSchema } = collectionSchema;

collectionRouter
  .route('/')
  .post(
    authenticate,
    validator(createCollectionSchema),
    catchAsync(createCollection),
  )
  .get(isLoggedIn, getAllCollections);

collectionRouter
  .route('/:itemId')
  .get(isLoggedIn, getOneCollection)
  .patch(authenticate, validator(collectionUpdateSchema), updateCollection)
  .delete(authenticate, deleteCollection);

collectionRouter
  .route('/:collectionId/:photoId')
  .post(authenticate, catchAsync(addPhotoToCollection))
  .delete(authenticate, catchAsync(removePhotoFromCollection));

export default collectionRouter;
