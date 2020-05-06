import crypto from 'crypto';
import passport from 'passport';
import debug from 'debug';

import passportLocal from '../config/passport/passport-local';
import { ApplicationError, NotFoundError } from '../helpers/errors';
import User from '../models/user.model';
import Email from '../services/emails';

const DEBUG = debug('dev');
/**
 * @function createCookieFromToken
 * @description creates cookie from user obj
 *
 * @param  {Object} user - the user object
 * @param  {response} statusCode - response status code
 * @param  {Object} req - the request object
 * @param  {Object} res - the response object
 *
 * @returns  {Object} response object
 */
const createCookieFromToken = (user, statusCode, req, res) => {
  const token = user.generateVerificationToken();

  const cookieOptions = {
    expires: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  };

  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

export default {
  /**
   * @function signinup
   * @description handles user signup
   *
   * @param {Object} request - the request object
   * @param {Object} response - the response object
   *
   * @returns {Function} creates a cookie from the response
   */
  signup: async (req, res, next) => {
    passport.authenticate(
      'signup',
      { session: false },
      async (err, user, info) => {
        try {
          if (err || !user) {
            const { statusCode, message } = info;
            return res.status(statusCode).json({
              status: 'error',
              error: {
                message,
              },
            });
          }

          const url = `${req.protocol}://${req.get('host')}/me`;

          await new Email(user, url).sendWelcomeMail(user, url);
          createCookieFromToken(user, 201, req, res);
        } catch (error) {
          DEBUG(error);
          throw new ApplicationError(500, error);
        }
      },
    )(req, res, next);
  },

  /**
   * @function login
   * @description handles user signup
   *
   * @param {Object} request - the request object
   * @param {Object} response - the response object
   *
   * @returns {Function} creates a cookie from the response
   */
  login: (req, res, next) => {
    passport.authenticate('login', { session: false }, (err, user, info) => {
      if (err || !user) {
        const { message } = info;
        return res.status(401).json({
          status: 'error',
          error: {
            message,
          },
        });
      }
      // generate a signed son web token with the contents of user object and return it in the response
      createCookieFromToken(user, 200, req, res);
    })(req, res, next);
  },

  /**
   * @function socialAuth
   * @description handles user signup
   *
   * @param {Object} request - the request object
   * @param {Object} response - the response object
   *
   * @returns {Function} creates a cookie from the response
   */
  socialAuth: async (req, res) => {
    try {
      // const user = req.user;
      const { authInfo, user } = req;

      createCookieFromToken(user, authInfo.statusCode || 201, req, res);
    } catch (err) {
      res.status(500).json({
        status: 'error',
        error: {
          message: err.message,
        },
      });
    }
  },

  /**
   * @function forgotPassword
   * @description handles user signup
   *
   * @param {Object} request - the request object
   * @param {Object} response - the response object
   *
   * @returns {Object} response object
   */
  forgotPassword: async (req, res) => {
    const { email } = req.body;

    const user = await User.checkExistingEmail(email);

    if (!user) throw new NotFoundError('Email not found');

    const resetToken = user.resetPasswordToken();
    await user.save({ validateBeforeSave: false });

    try {
      const resetURL = `${req.protocol}://${req.get(
        'host',
      )}/auth/reset-password/${resetToken}`;

      await new Email(user, resetURL).sendPasswordResetMail();

      const data = {
        message: 'Token sent to email',
      };

      if (process.env.NODE_ENV !== 'production') {
        data.token = resetToken;
      }

      res.status(200).json({
        status: 'success',
        data,
      });
    } catch (err) {
      DEBUG(err);
      user.passwordResetToken = undefined;
      user.passwordResetTokenExpires = undefined;
      await user.save({ validateBeforeSave: false });
      throw new ApplicationError(500, 'Problem sending mail, try again later');
    }
  },

  /**
   * @function signinUser
   * @description handles user signup
   *
   * @param {Object} request - the request object
   * @param {Object} response - the response object
   *
   * @returns {Function} creates a cookie from the response
   */
  resetPassword: async (req, res) => {
    const { resetToken } = req.params;

    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetTokenExpires: { $gt: Date.now() },
    });

    // Check if token has not expired if user exists, then set password,
    if (!user) {
      throw new ApplicationError(401, 'Reset Token is invalid or expired');
    }
    // update passwordLastChanged passwordLastChanged property for user

    user.local.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;

    await user.save();

    // Log user in, send jwt
    createCookieFromToken(user, 200, req, res);
  },
};
