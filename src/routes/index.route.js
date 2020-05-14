import { Router } from 'express';
import authRoutes from './auth.route';
import userRouter from './user.route';
import photoRouter from './photo.route';
import collectionRouter from './collection.route';
import commentRouter from './comment.route';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRouter);
router.use('/photos', photoRouter);
router.use('/collections', collectionRouter);
router.use('/comments', commentRouter);

export default router;
