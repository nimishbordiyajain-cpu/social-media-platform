// ---------- models/Post.js ----------
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, 'Post content is required'],
      trim: true,
      minlength: [1, 'Post cannot be empty'],
      maxlength: [500, 'Post cannot exceed 500 characters'],
    },
    // REFERENCE to the User who wrote the post (referenced collection)
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // likes[] holds the IDs of users who liked this post.
    // Like count = likes.length. One user can appear only once -> like/unlike toggle.
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', postSchema);
