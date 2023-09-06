const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  const likes = (total, item) => {
    return total + item.likes;
  };

  return blogs.reduce(likes, 0);
};

const favouriteBlog = (blogs) => {
  const favourite = (prev, next) => {
    return prev.likes > next.likes ? prev : next;
  };

  return blogs.reduce(favourite, []);
};

const mostBlogs = (blogs) => {
  const mostBlogsItem = blogs.reduce((prev, next) => {
    return prev.blogs > next.blogs ? prev : next;
  });

  return { author: mostBlogsItem.author, blogs: mostBlogsItem.blogs };
};

const mostLikes = (blogs) => {
  const likes = blogs.reduce((prev, next) => {
    return prev.likes > next.likes ? prev : next;
  }, []);

  return { author: likes.author, likes: likes.likes };
};

module.exports = { dummy, totalLikes, favouriteBlog, mostBlogs, mostLikes };
