import { Router } from 'express';
import authRoutes from './auth.route';
import userRouter from './user.route';
import photoRouter from './photo.route';
import collectionRouter from './collection.route';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRouter);
router.use('/photos', photoRouter);
router.use('/collections', collectionRouter);

export default router;
