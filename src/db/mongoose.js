import mongoose from 'mongoose';
import { config } from 'dotenv';
import debug from 'debug';

config();
const DEBUG = debug('dev');

const {
  NODE_ENV,
  TEST_DB,
  DEV_DB,
  PROD_DB,
} = process.env;
let db;

if (NODE_ENV === 'development') {
  db = DEV_DB;
} else if (NODE_ENV === 'test') {
  db = TEST_DB;
} else {
  db = PROD_DB;
}

const options = {
  autoIndex: false, // Don't build indexes
  reconnectTries: 10, // Retry up to 10 times
  reconnectInterval: 500, // Reconnect every 500ms
  poolSize: 10, // Maintain up to 10 socket connections
  // If not connected, return errors immediately rather than waiting for reconnect
  bufferMaxEntries: 0,
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
};

const connectWithRetry = () => {
  DEBUG('MongoDB connection with retry');
  mongoose
    .connect(db, options)
    .then(() => {
      DEBUG('MongoDB is connected');
    })
    .catch(err => {
      DEBUG('MongoDB connection unsuccessful, retry after 5 seconds.');
      setTimeout(connectWithRetry, 5000);
    });
};

connectWithRetry();
