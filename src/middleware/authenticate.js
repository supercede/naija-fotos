import debug from 'debug';
import passportJWT from '../services/passport/config';
import { ApplicationError } from '../helpers/errors';

const DEBUG = debug('dev');
export default {
  /**
   * @description middleware to allow only authenticated users proceed to authenticated routes
   *
   * @param {Object} request express request object
   * @param {Object} response express response object
   * @param {Function} next callback to call next middleware
   *
   * @returns {Function} next callback to call next middleware
   */
  authenticate: (req, res, next) => {
    passportJWT.authenticate('jwt', { session: false }, (err, user, info) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        throw new ApplicationError(
          401,
          'invalid token, please log in or sign up',
        );
      }

      req.user = user;
      // DEBUG(user.userName);
      return next();
    })(req, res, next);
  },

  /**
   * @description middleware to indicate a user is logged in (for unprotected routes).
   * It does not prevent unauthenticated requests but saves logged in users to request session
   *
   * @param {Object} request express request object
   * @param {Object} response express response object
   * @param {Function} next callback to call next middleware
   *
   * @returns {Function} next callback to call next middleware
   */
  isLoggedIn: (req, res, next) => {
    passportJWT.authenticate('jwt', { session: false }, (err, user, info) => {
      if (err || !user) {
        return next();
      }

      req.user = user;
      DEBUG(user.userName);
      return next();
    })(req, res, next);
  },

  /**
   * @description middleware restrict certain routes to users with certain roles
   *
   * @param {string} roles - roles to be permitted
   *
   * @returns {Function} - a callback that executes the controller
   */
  restrict: (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApplicationError(
          403,
          'You are not authorized to perform this operation',
        ),
      );
    }
    next();
  },
};
