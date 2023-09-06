const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');

const api = supertest(app);

const Blog = require('../models/blog');

mongoose.set('bufferTimeoutMS', 300000);

const initialBlogs = [
  {
    title: 'This is title1',
    author: 'This is author1',
    url: 'This is URL1',
    likes: 100,
  },
  {
    title: 'This is title2',
    author: 'This is author2',
    url: 'This is URL2',
    likes: 200,
  },
];

beforeEach(async () => {
  await Blog.deleteMany({});
  let blogObject = new Blog(initialBlogs[0]);
  await blogObject.save();
  blogObject = new Blog(initialBlogs[1]);
  await blogObject.save();
}, 100000);

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/);
}, 100000);

test('returns the correct amount of blog posts', async () => {
  const response = await api.get('/api/blogs');
  expect(response.body).toHaveLength(initialBlogs.length);
}, 100000);

test('unique identifier property of the blog posts is named id', async () => {
  const response = await api.get('/api/blogs');
  response.body.forEach((blog) => {
    expect(blog.id).toBeDefined();
  });
});

test('successfully creates a blog', async () => {
  const newBlog = {
    title: 'This is title3',
    author: 'This is author3',
    url: 'This is URL3',
    likes: 300,
  };

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  const response = await api.get('/api/blogs');

  expect(response.body).toHaveLength(initialBlogs.length + 1);
});

test('if the likes property is missing from the request, it will default to the value 0.', async () => {
  await Blog.deleteMany({});
  const newBlog = {
    title: 'This is Title',
    author: 'This is Author',
    url: 'This is URL',
  };

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/);

  const response = await api.get('/api/blogs');

  expect(response.body[0].likes).toBe(0);
});

test('if the title or url properties are missing from the request data, status code 400', async () => {
  await Blog.deleteMany({});
  const newBlog = {
    author: 'This is Author',
    likes: 69,
  };

  await api.post('/api/blogs').send(newBlog).expect(400);
});

afterAll(async () => {
  await mongoose.connection.close();
});
