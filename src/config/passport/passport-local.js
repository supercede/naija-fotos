import debug from 'debug';
import { Strategy } from 'passport-local';
import passport from 'passport';

import User from '../../models/user.model';

const DEBUG = debug('dev');

const authFields = {
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true,
};

passport.use(
  'login',
  new Strategy(authFields, async (req, email, password, cb) => {
    try {
      const user = await User.findOne({
        $or: [{ 'local.email': email }, { userName: email }],
      });

      if (!user) {
        return cb(null, false, { message: 'Incorrect email or password.' });
      }

      const checkPassword = await user.comparePassword(password);

      if (!checkPassword) {
        return cb(null, false, { message: 'Incorrect email or password.' });
      }

      return cb(null, user, { message: 'Logged In Successfully' });
    } catch (err) {
      DEBUG(err);
      cb(err);
    }
  }),
);

passport.use(
  'signup',
  new Strategy(authFields, async (req, email, password, cb) => {
    try {
      const checkEmail = await User.checkExistingEmail(email);
      if (checkEmail) {
        return cb(null, false, {
          statusCode: 409,
          message: 'Email already registered, log in instead',
        });
      }

      const checkUserName = await User.checkExistingUserName(req.body.userName);
      if (checkUserName) {
        return cb(null, false, {
          statusCode: 409,
          message: 'Username exists, please try another',
        });
      }

      const newUser = new User();
      newUser.local.email = req.body.email;
      newUser.local.password = req.body.password;
      newUser.name = req.body.name;
      newUser.userName = req.body.userName;

      await newUser.save();
      return cb(null, newUser);
    } catch (err) {
      return cb(err);
    }
  }),
);
