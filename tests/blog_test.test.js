const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');

const api = supertest(app);

const Blog = require('../models/blog');
const User = require('../models/user');

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
  await User.deleteMany({});
  const user = {
    username: 'prabinbastakoti',
    name: 'Prabin Bastakoti',
    password: 'acerswift3',
  };
  await api.post('/api/user').send(user);

  let blogObject = new Blog(initialBlogs[0]);
  await blogObject.save();
  blogObject = new Blog(initialBlogs[1]);
  await blogObject.save();
}, 100000);

describe('When there is initially some blogs saved', () => {
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
});

describe('Addition of a new blog', () => {
  test('successfully creates a blog', async () => {
    const token = await api.post('/api/login').send({
      username: 'prabinbastakoti',
      password: 'acerswift3',
    });

    const newBlog = {
      title: 'This is title3',
      author: 'This is author3',
      url: 'This is URL3',
      likes: 300,
    };

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set({ Authorization: 'bearer ' + token.body.token })
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const response = await api.get('/api/blogs');

    expect(response.body).toHaveLength(initialBlogs.length + 1);
  });

  test('if the likes property is missing from the request, it will default to the value 0.', async () => {
    await Blog.deleteMany({});
    const token = await api.post('/api/login').send({
      username: 'prabinbastakoti',
      password: 'acerswift3',
    });
    const newBlog = {
      title: 'This is Title',
      author: 'This is Author',
      url: 'This is URL',
    };

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set({ Authorization: 'bearer ' + token.body.token })
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const response = await api.get('/api/blogs');

    expect(response.body[0].likes).toBe(0);
  });

  test('if the title or url properties are missing from the request data, status code 400', async () => {
    await Blog.deleteMany({});

    const token = await api.post('/api/login').send({
      username: 'prabinbastakoti',
      password: 'acerswift3',
    });

    const newBlog = {
      author: 'This is Author',
      likes: 69,
    };

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set({ Authorization: 'bearer ' + token.body.token })
      .expect(400);
  });

  test('if token is not provided , 401 unauthorized', async () => {
    const newBlog = {
      title: 'This is title3',
      author: 'This is author3',
      url: 'This is URL3',
      likes: 300,
    };

    await api.post('/api/blogs').send(newBlog).expect(401);
  });
});

describe('Deletion of a blog post', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    await Blog.deleteMany({});

    const token = await api.post('/api/login').send({
      username: 'prabinbastakoti',
      password: 'acerswift3',
    });

    await api
      .post('/api/blogs')
      .send(initialBlogs[0])
      .set({ Authorization: 'bearer ' + token.body.token });
    await api
      .post('/api/blogs')
      .send(initialBlogs[1])
      .set({ Authorization: 'bearer ' + token.body.token });

    const blogAtStart = await Blog.find({});
    const blogToDelete = blogAtStart[0];

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set({ Authorization: 'bearer ' + token.body.token })
      .expect(204);

    const blogAtEnd = await Blog.find({});

    expect(blogAtEnd).toHaveLength(initialBlogs.length - 1);

    const title = blogAtEnd.map((t) => t.title);

    expect(title).not.toContain(blogToDelete.title);
  });
  test('if token is not provided , 401 unauthorized', async () => {
    await Blog.deleteMany({});

    const token = await api.post('/api/login').send({
      username: 'prabinbastakoti',
      password: 'acerswift3',
    });

    await api
      .post('/api/blogs')
      .send(initialBlogs[0])
      .set({ Authorization: 'bearer ' + token.body.token });
    await api
      .post('/api/blogs')
      .send(initialBlogs[1])
      .set({ Authorization: 'bearer ' + token.body.token });

    const blogAtStart = await Blog.find({});
    const blogToDelete = blogAtStart[0];

    await api.delete(`/api/blogs/${blogToDelete.id}`).expect(401);
  });
});

describe('Update a blog Post', () => {
  test('successfully updates a blog post', async () => {
    const blogAtStart = await Blog.find({});
    const blogToUpdate = blogAtStart[0];

    const newBlog = {
      title: 'This is title1',
      author: 'This is author1',
      url: 'This is URL1',
      likes: 500,
    };

    const response = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(newBlog);
    const blogAtEnd = await Blog.find({});

    expect(blogAtEnd).toHaveLength(initialBlogs.length);

    const updatedBlogLikes = blogAtEnd[0].likes;
    expect(updatedBlogLikes).toBe(500);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
