const config = require('./utils/config');
const express = require('express');

require('express-async-errors');

const app = express();

const mongoose = require('mongoose');
const cors = require('cors');

const blogRouter = require('./controllers/blog');
const userRouter = require('./controllers/user');
const loginRouter = require('./controllers/login');

const logger = require('./utils/logger');
const middleware = require('./utils/middleware');
const TestRouter = require('./controllers/test');

mongoose.set('strictQuery', false);

const mongoUrl = config.URI;

logger.info('connecting to ', mongoUrl);

mongoose
  .connect(mongoUrl)
  .then(() => {
    logger.info('connected to mongoDB');
  })
  .catch((err) => logger.error(err.message));

app.use(cors());
app.use(express.json());

app.use(middleware.requestLogger);
app.use(middleware.tokenExtractor);

app.use('/api/blogs', blogRouter);

app.use('/api/user', userRouter);

app.use('/api/login', loginRouter);

app.use('/api/testing', TestRouter);

app.use(middleware.unknownEndpoint);

app.use(middleware.errorHandler);

module.exports = app;
