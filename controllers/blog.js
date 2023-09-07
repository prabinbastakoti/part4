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

blogRouter.delete('/:id', async (request, response) => {
  const id = request.params.id;

  await Blog.findByIdAndRemove(id);
  response.status(204).end();
});

blogRouter.put('/:id', async (request, response) => {
  const id = request.params.id;
  const body = request.body;

  const update = await Blog.findByIdAndUpdate(id, body, { new: true });
  response.json(update);
});

module.exports = blogRouter;
