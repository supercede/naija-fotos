import { Router } from 'express';
import passport from 'passport';
import passportJWT from '../services/passport/config';
import authController from '../controllers/auth.controller';
import authSchema from '../validations/auth.validation';
import validator from '../middleware/validator';
import catchAsync from '../middleware/catchAsync';
import passportGoogle from '../services/passport/passport-google';
import passportFacebook from '../services/passport/passport-facebook';

const {
  signup,
  login,
  resetPassword,
  forgotPassword,
  socialAuth,
  logout,
} = authController;

const {
  userSignUpSchema,
  userLogInSchema,
  userForgotPasswordSchema,
  userResetPasswordSchema,
} = authSchema;

const authRouter = Router();

authRouter.post('/signup', validator(userSignUpSchema), catchAsync(signup));
authRouter.post('/login', validator(userLogInSchema), catchAsync(login));
authRouter.post('/logout', catchAsync(logout));
authRouter.post(
  '/forgot-password',
  validator(userForgotPasswordSchema),
  catchAsync(forgotPassword),
);
authRouter.patch(
  '/reset-password/:resetToken',
  validator(userResetPasswordSchema),
  catchAsync(resetPassword),
);

authRouter.get(
  '/google',
  passport.authenticate('google', {
    session: false,
    scope: ['profile', 'email'],
  }),
);

// callback route for google
authRouter.get(
  '/google/redirect',
  passport.authenticate('google', {
    session: false,
    scope: ['profile', 'email'],
  }),
  socialAuth,
);

authRouter.get(
  '/facebook/',
  passportFacebook.authenticate('facebook', {
    session: false,
    scope: ['email'],
  }),
);

// callback route for facebook
authRouter.get(
  '/facebook/redirect',
  passportFacebook.authenticate('facebook', {
    session: false,
  }),
  socialAuth,
);

export default authRouter;
