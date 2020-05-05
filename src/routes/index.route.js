import { Router } from 'express';
import authRoutes from './auth.route';
import userRouter from './user.route';
import photoRouter from './photo.route';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRouter);
router.use('/photos', photoRouter);

export default router;
