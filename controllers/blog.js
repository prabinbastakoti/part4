const blogRouter = require('express').Router();
const jwt = require('jsonwebtoken');
const Blog = require('../models/blog');
const User = require('../models/user');

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', {
    username: 1,
    name: 1,
    id: 1,
  });
  response.json(blogs);
});

blogRouter.post('/', async (request, response) => {
  const blog = request.body;

  const decodedToken = jwt.verify(request.token, process.env.SECRET);
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' });
  }

  const user = await User.findById(decodedToken.id);

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

blogRouter.delete('/:id', async (request, response) => {
  const id = request.params.id;
  const decodedToken = jwt.verify(request.token, process.env.SECRET);
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' });
  }
  const blog = await Blog.findById(id);
  if (blog.user.toString() !== decodedToken.id) {
    return response.status(401).json({ error: 'Invalid user' });
  }
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
