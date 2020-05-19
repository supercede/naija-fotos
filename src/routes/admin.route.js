import { Router } from 'express';
import userController from '../controllers/user.controller';
import validator from '../middleware/validator';
import userSchema from '../validations/user.validation';
import authentication from '../middleware/authenticate';

const { userUpdateSchema } = userSchema;

const { deleteUser, updateUser } = userController;

const { authenticate, restrict } = authentication;

const adminRouter = Router();

adminRouter.use(authenticate);
adminRouter.use(restrict('admin'));

adminRouter
  .route('/users/:itemId')
  .delete(deleteUser)
  .patch(validator(userUpdateSchema), updateUser);

export default adminRouter;
