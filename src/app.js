import express from 'express';
import { config } from 'dotenv';
import logger from 'morgan';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import swaggerUI from 'swagger-ui-express';

import docs from '../docs/docs.json';
import errorHandler from './middleware/errorHandler';
import routes from './routes/index.route';

config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());

if (['development', 'production'].includes(process.env.NODE_ENV)) {
  app.use(logger('dev'));
}

app.use(passport.initialize());
app.use('/api/v1', routes);
app.use('/docs', swaggerUI.serve, swaggerUI.setup(docs));

app.get('/', (_, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to the Naijafotos API',
  });
});

app.all('*', (_, res) => {
  res.status(404).json({
    status: 'error',
    error: 'resource not found',
  });
});

app.use(errorHandler);

export default app;
