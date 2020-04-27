/* eslint-disable no-underscore-dangle, camelcase */
import debug from 'debug';
import { config } from 'dotenv';
import passport from 'passport';
import FacebookStrategy from 'passport-facebook';
import MockStrategy from 'passport-mocked';
import { Types } from 'mongoose';

import User from '../../models/user.model';

const DEBUG = debug('dev');

config();

const {
  FACEBOOK_APP_ID,
  FACEBOOK_APP_SECRET,
  FACEBOOK_CALLBACK_URL,
  NODE_ENV,
} = process.env;

let Strategy;

if (NODE_ENV === 'test') {
  Strategy = MockStrategy.Strategy;
} else {
  Strategy = FacebookStrategy;
}

passport.use(
  new Strategy(
    {
      name: 'facebook',
      clientID: FACEBOOK_APP_ID,
      clientSecret: FACEBOOK_APP_SECRET,
      callbackURL: FACEBOOK_CALLBACK_URL,
      profileFields: ['id', 'emails', 'name'],
    },

    (accessToken, refreshToken, profile, done) => {
      try {
        User.findBySocialID(profile.id, 'facebook.id')
          .then(async currentUser => {
            if (currentUser) {
              return done(null, currentUser, {
                statusCode: 200,
                message: 'Logged in successfully',
              });
            }
            const profileObj = profile._json;
            const {
              id, email = '', first_name, last_name = '',
            } = profileObj;
            const name = `${first_name} ${last_name}`;

            if (email !== '') {
              const checkEmail = await User.checkExistingEmail(email);
              if (checkEmail) {
                const user = await User.findByIdAndUpdate(
                  checkEmail._id,
                  { 'facebook.id': profile.id, 'facebook.email': email },
                  { new: true },
                );
                return done(null, user, {
                  statusCode: 200,
                  message: 'Logged in successfully',
                });
              }
            }

            const usrObj = {
              facebook: { id, email },
              name,
              local: { email },
            };
            const user = await User.create(usrObj);

            return done(null, user, {
              statusCode: 201,
              message: 'Account Created',
            });
          })
          .catch(err => {
            DEBUG(err);
            done(null, false, { message: err });
          });
      } catch (err) {
        DEBUG(err);
        done(err, false);
      }
    },
  ),
);

export default passport;
