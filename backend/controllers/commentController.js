// ---------- controllers/commentController.js ----------
const Comment = require('../models/Comment');
const Post = require('../models/Post');

// POST /api/posts/:id/comments  -> add a comment to a post
exports.addComment = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = await Comment.create({
      text: req.body.text,
      post: post._id,
      author: req.user._id,
    });
    await comment.populate('author', 'username');
    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
};

// GET /api/posts/:id/comments  -> all comments of a post (oldest first)
exports.getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .populate('author', 'username')
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/comments/:id  -> edit comment (owner only)
exports.updateComment = async (req, res, next) => {
  try {
    const comment = req.doc;
    comment.text = req.body.text;
    await comment.save();
    await comment.populate('author', 'username');
    res.json(comment);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/comments/:id  -> delete comment (owner only)
exports.deleteComment = async (req, res, next) => {
  try {
    await req.doc.deleteOne();
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    next(error);
  }
};
