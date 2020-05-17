import debug from 'debug';
import passportJWT from '../services/passport/config';
import { ApplicationError } from '../helpers/errors';

// export default function authenticate(req, res, next) {
//   ;
// }

const DEBUG = debug('dev');
export default {
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
