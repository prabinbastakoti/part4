const blogRouter = require('express').Router();

const Blog = require('../models/blog');

blogRouter.get('/', (request, response) => {
  Blog.find({}).then((blogs) => {
    response.json(blogs);
  });
});

blogRouter.post('/', (request, response) => {
  const blog = new Blog(request.body);

  if (!blog.likes) {
    blog.likes = 0;
  }
  if (!blog.title || !blog.url) {
    return response.status(400).send({ error: 'Title or URL is missing' });
  }

  blog.save().then((result) => {
    response.status(201).json(result);
  });
});

module.exports = blogRouter;
