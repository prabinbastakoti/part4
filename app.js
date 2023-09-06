const config = require('./utils/config');
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const blogRouter = require('./controllers/blog');
const logger = require('./utils/logger');
const middleware = require('./utils/middleware');

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

app.use('/api/blogs', blogRouter);

app.use(middleware.unknownEndpoint);

app.use(middleware.errorHandler);

module.exports = app;