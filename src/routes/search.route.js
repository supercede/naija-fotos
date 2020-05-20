import { Router } from 'express';
import searchContoller from '../controllers/search.controller';
import catchAsync from '../middleware/catchAsync';
import searchValidation from '../validations/search.validation';
import validator from '../middleware/validator';

const { search } = searchContoller;
const { searchSchema } = searchValidation;

const searchRouter = Router();

searchRouter.post('/', validator(searchSchema), catchAsync(search));

export default searchRouter;
