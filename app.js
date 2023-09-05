const config = require('./utils/config');
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const blogRouter = require('./controllers/blog');

mongoose.set('strictQuery', false);

const mongoUrl = config.URI;

mongoose
  .connect(mongoUrl)
  .then(() => {
    console.log('connected to mongoDB');
  })
  .catch((err) => console.error(err.message));

app.use(cors());
app.use(express.json());

app.use('/api/blogs', blogRouter);

module.exports = app;
