// ---------- controllers/postController.js ----------
const Post = require('../models/Post');
const Comment = require('../models/Comment');

// GET /api/posts  -> feed (newest first). populate() replaces author id with author's username.
exports.getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find()
      .populate('author', 'username')
      .sort({ createdAt: -1 });

    // Add comment count for each post
    const withCounts = await Promise.all(
      posts.map(async (p) => ({
        ...p.toObject(),
        commentCount: await Comment.countDocuments({ post: p._id }),
      }))
    );
    res.json(withCounts);
  } catch (error) {
    next(error);
  }
};

// GET /api/posts/:id  -> single post (details page)
exports.getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'username');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (error) {
    next(error);
  }
};

// POST /api/posts  -> create a post (author = logged-in user, taken from token, NOT from body)
exports.createPost = async (req, res, next) => {
  try {
    const post = await Post.create({ content: req.body.content, author: req.user._id });
    await post.populate('author', 'username');
    res.status(201).json(post);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/posts/:id  -> edit post (owner only; ownership middleware already loaded req.doc)
exports.updatePost = async (req, res, next) => {
  try {
    const post = req.doc;
    post.content = req.body.content;
    await post.save();                       // save() runs schema validators again
    await post.populate('author', 'username');
    res.json(post);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/posts/:id  -> delete post (owner only) + its comments
exports.deletePost = async (req, res, next) => {
  try {
    await Comment.deleteMany({ post: req.doc._id }); // avoid orphan comments
    await req.doc.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (error) {
    next(error);
  }
};

// POST /api/posts/:id/like  -> TOGGLE like / unlike
exports.toggleLike = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const userId = req.user._id;
    const alreadyLiked = post.likes.some((id) => id.toString() === userId.toString());

    if (alreadyLiked) {
      post.likes.pull(userId);   // unlike: remove user id from array
    } else {
      post.likes.push(userId);   // like: add user id to array
    }
    await post.save();

    res.json({
      liked: !alreadyLiked,
      likesCount: post.likes.length,   // count is always calculated from the array -> always accurate
      message: alreadyLiked ? 'Post unliked' : 'Post liked',
    });
  } catch (error) {
    next(error);
  }
};
