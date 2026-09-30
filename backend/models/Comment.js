// ---------- models/Comment.js ----------
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, 'Comment text is required'],
      trim: true,
      minlength: [1, 'Comment cannot be empty'],
      maxlength: [200, 'Comment cannot exceed 200 characters'],
    },
    // REFERENCE to the Post this comment belongs to
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    // REFERENCE to the User who wrote the comment
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Comment', commentSchema);
