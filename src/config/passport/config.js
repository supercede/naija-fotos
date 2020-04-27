import passport from 'passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { config } from 'dotenv';
import User from '../../models/user.model';

config();

const jwtPublicSecret = process.env.JWT_PUBLIC_SECRET.replace(/\\n/g, '\n');

// export const findBySocialID = async (socialID, provider) =>
//   User.findOne({
//     where: { socialID, provider },
//   });

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtPublicSecret,
  algorithms: ['RS256'],
};

passport.use(
  new Strategy(options, (jwtPayload, done) => {
    User.findOne({ _id: jwtPayload.id })
      .then(user => {
        if (user) {
          done(null, user);
        } else {
          done(null, false);
        }
      })
      .catch(err => {
        if (err) {
          return done(err, false);
        }
      });
  }),
);

export default passport;
