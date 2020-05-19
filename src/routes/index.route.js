import { Router } from 'express';
import authRoutes from './auth.route';
import userRouter from './user.route';
import photoRouter from './photo.route';
import collectionRouter from './collection.route';
import commentRouter from './comment.route';
import adminRouter from './admin.route';
import searchRouter from './search.route';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRouter);
router.use('/photos', photoRouter);
router.use('/collections', collectionRouter);
router.use('/comments', commentRouter);
router.use('/admin', adminRouter);
router.use('/search', searchRouter);

export default router;
