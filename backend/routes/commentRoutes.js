// ---------- routes/commentRoutes.js : all routes are PROTECTED ----------
const express = require('express');
const protect = require('../middleware/auth');
const checkOwnership = require('../middleware/ownership');
const { validateComment } = require('../middleware/validate');
const Comment = require('../models/Comment');
const { updateComment, deleteComment } = require('../controllers/commentController');

const router = express.Router();

router.use(protect);

router.patch('/:id', checkOwnership(Comment, 'Comment'), validateComment, updateComment);
router.delete('/:id', checkOwnership(Comment, 'Comment'), deleteComment);

module.exports = router;
