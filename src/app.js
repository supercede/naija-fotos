import express from 'express';
import { config } from 'dotenv';
import logger from 'morgan';
import swaggerUI from 'swagger-ui-express';

import docs from '../docs/docs.json';

config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

if (['development', 'production'].includes(process.env.NODE_ENV)) {
  app.use(logger('dev'));
}

app.use('/docs', swaggerUI.serve, swaggerUI.setup(docs));

app.get('/', (_, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to the Naijaphotos API',
  });
});

app.all('*', (_, res) => {
  res.status(404).json({
    status: 'error',
    error: 'resource not found',
  });
});

export default app;
