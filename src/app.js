import express from 'express';
import { config } from 'dotenv';
import logger from 'morgan';
import passport from 'passport';
import path from 'path';
import cookieParser from 'cookie-parser';
import swaggerUI from 'swagger-ui-express';
import mongoSanitize from 'express-mongo-sanitize';
import xssFilter from 'x-xss-protection';
import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';

import docs from '../docs/docs.json';
import errorHandler from './middleware/errorHandler';
import routes from './routes/index.route';

config();

const app = express();

app.enable('trust proxy');

const staticPath = path.join(__dirname, '../public');

app.use(express.static(staticPath));
app.use(helmet());

if (['development', 'production'].includes(process.env.NODE_ENV)) {
  app.use(logger('dev'));
}

app.use(cors());
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());

app.use(mongoSanitize());
app.use(xssFilter());


app.use(passport.initialize());

app.use(compression());

app.use('/api/v1', routes);
app.use('/docs', swaggerUI.serve, swaggerUI.setup(docs));

app.get('/', (_, res) => {
  res.render('index');
});

app.all('*', (_, res) => {
  res.status(404).json({
    status: 'error',
    error: 'resource not found',
  });
});

app.use(errorHandler);

export default app;
