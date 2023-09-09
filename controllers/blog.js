const blogRouter = require('express').Router();
const jwt = require('jsonwebtoken');
const Blog = require('../models/blog');
const middleware = require('../utils/middleware');

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', {
    username: 1,
    name: 1,
    id: 1,
  });
  response.json(blogs);
});

blogRouter.post('/', middleware.userExtractor, async (request, response) => {
  const blog = request.body;

  const user = request.user;

  const newBlog = new Blog({
    ...blog,
    user: user.id,
  });

  if (!blog.likes) {
    blog.likes = 0;
  }
  if (!blog.title || !blog.url) {
    return response.status(400).send({ error: 'Title or URL is missing' });
  }

  const result = await newBlog.save();

  user.blogs = user.blogs.concat(result._id);
  await user.save();

  response.status(201).json(result);
});

blogRouter.delete(
  '/:id',
  middleware.userExtractor,
  async (request, response) => {
    const id = request.params.id;
    const user = request.user;
    const blog = await Blog.findById(id);
    if (blog.user.toString() !== user.id) {
      return response.status(401).json({ error: 'Invalid user' });
    }
    await Blog.findByIdAndRemove(id);
    response.status(204).end();
  }
);

blogRouter.put('/:id', async (request, response) => {
  const id = request.params.id;
  const body = request.body;

  const update = await Blog.findByIdAndUpdate(id, body, { new: true });
  response.json(update);
});

module.exports = blogRouter;
