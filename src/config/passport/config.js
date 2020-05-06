import passport from 'passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { config } from 'dotenv';
import User from '../../models/user.model';

config();

const jwtPublicSecret = process.env.JWT_PUBLIC_SECRET.replace(/\\n/g, '\n');

const options = {
  secretOrKey: jwtPublicSecret,
  algorithms: ['RS256'],
  passReqToCallback: true,
};

const cookieExtractor = req => {
  let token = null;
  if (req && req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  return token;
};

options.jwtFromRequest = ExtractJwt.fromExtractors([
  ExtractJwt.fromAuthHeaderAsBearerToken(),
  req => cookieExtractor(req),
]);

passport.use(
  new Strategy(options, (req, jwtPayload, done) => {
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
