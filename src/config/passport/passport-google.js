/* eslint-disable no-underscore-dangle, camelcase */
import debug from 'debug';
import { config } from 'dotenv';
import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';
import MockStrategy from 'passport-mocked';

import User from '../../models/user.model';

const DEBUG = debug('dev');

config();

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
  NODE_ENV,
} = process.env;

let Strategy;

if (NODE_ENV === 'test') {
  Strategy = MockStrategy.Strategy;
} else {
  Strategy = GoogleStrategy;
}

passport.use(
  'google',
  new Strategy(
    {
      name: 'google',
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
    },

    (accessToken, refreshToken, profile, done) => {
      try {
        User.findBySocialID(profile.id, 'google.id')
          .then(async currentUser => {
            if (currentUser) {
              return done(null, currentUser, { statusCode: 200 });
            }

            const name = `${profile.name.givenName} ${profile.name.familyName}`;
            const email = profile.emails[0].value;

            const checkEmail = await User.checkExistingEmail(email);

            if (checkEmail) {
              const user = await User.findByIdAndUpdate(
                checkEmail._id,
                { 'google.id': profile.id, 'google.email': email },
                { new: true },
              );
              return done(null, user, { statusCode: 200 });
            }

            const usrObj = {
              google: { id: profile.id, email },
              name,
              local: { email },
            };
            const user = await User.create(usrObj);

            return done(null, user, { statusCode: 201 });
          })
          .catch(err => {
            DEBUG(err);
            done(null, false);
          });
      } catch (err) {
        DEBUG(err);
        done(err, false);
      }
    },
  ),
);
