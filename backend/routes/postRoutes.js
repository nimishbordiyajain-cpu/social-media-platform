// ---------- routes/postRoutes.js : all routes are PROTECTED ----------
const express = require('express');
const protect = require('../middleware/auth');
const checkOwnership = require('../middleware/ownership');
const { validatePost, validateComment } = require('../middleware/validate');
const Post = require('../models/Post');
const post = require('../controllers/postController');
const comment = require('../controllers/commentController');

const router = express.Router();

router.use(protect); // JWT check applied to EVERY route below this line

router.get('/', post.getPosts);
router.post('/', validatePost, post.createPost);
router.get('/:id', post.getPostById);

// Order matters: authenticate -> authorize (owner?) -> validate -> controller
router.patch('/:id', checkOwnership(Post, 'Post'), validatePost, post.updatePost);
router.delete('/:id', checkOwnership(Post, 'Post'), post.deletePost);

router.post('/:id/like', post.toggleLike);

router.get('/:id/comments', comment.getComments);
router.post('/:id/comments', validateComment, comment.addComment);

module.exports = router;
