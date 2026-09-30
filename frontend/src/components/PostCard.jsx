import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import Avatar from './Avatar.jsx';
import { HeartIcon, CommentIcon, EditIcon, TrashIcon } from './Icons.jsx';
import { timeAgo } from '../utils.js';

// One post: author, text, like button, comments link, edit/delete (owner only).
// `detail` = true on the details page (hides the "comments" link).
export default function PostCard({ post, onLike, onDelete, detail = false }) {
  const { user } = useAuth();
  const isOwner = post.author?._id === user._id;   // edit/delete only for the author
  const liked = post.likes.includes(user._id);      // has the current user liked it?

  return (
    <article className="post">
      <Avatar name={post.author?.username} />
      <div className="post-main">
        <div className="post-head">
          <strong>{post.author?.username}</strong>
          <span className="muted">{timeAgo(post.createdAt)}</span>
        </div>

        <p className="post-text">{post.content}</p>

        <div className="post-actions">
          <button
            className={`action ${liked ? 'liked' : ''}`}
            onClick={() => onLike(post._id)}
            aria-label={liked ? 'Unlike post' : 'Like post'}
          >
            <HeartIcon filled={liked} /> {post.likes.length}
          </button>

          {!detail && (
            <Link className="action" to={`/posts/${post._id}`}>
              <CommentIcon /> {post.commentCount ?? 0}
            </Link>
          )}

          <span className="spacer" />

          {isOwner && (
            <>
              <Link className="action" to={`/posts/${post._id}/edit`}><EditIcon /> Edit</Link>
              <button className="action danger" onClick={() => onDelete(post._id)}><TrashIcon /> Delete</button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
