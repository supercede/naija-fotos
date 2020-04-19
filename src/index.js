import http from 'http';
import debug from 'debug';
import { config } from 'dotenv';
import './db/mongoose';
import app from './app';

config();

const DEBUG = debug('dev');
const PORT = process.env.NODE_ENV === 'test' ? 6378 : process.env.PORT || 5000;

const server = http.createServer(app);

process.on('uncaughtException', error => {
  DEBUG(`uncaught exception: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  DEBUG(`unhandled rejection at ${promise} reason: ${reason}`);
  process.exit(1);
});

server.listen(PORT, () => {
  DEBUG(
    `server running on http://localhost:${PORT} in ${process.env.NODE_ENV} mode.\nPress CTRL-C to stop`,
  );
});
