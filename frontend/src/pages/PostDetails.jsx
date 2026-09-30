import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { errorMessage } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import Avatar, { avatarColor } from '../components/Avatar.jsx';
import CommentSection from '../components/CommentSection.jsx';
import { HeartIcon, CommentIcon, EditIcon, TrashIcon } from '../components/Icons.jsx';
import { timeAgo } from '../utils.js';

// Details page: one post shown large, with like button, stats and its comments
export default function PostDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [commentCount, setCommentCount] = useState(0);
  const [error, setError] = useState('');

  const loadPost = async () => {
    try {
      const { data } = await api.get(`/posts/${id}`);
      setPost(data);
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  useEffect(() => { loadPost(); }, [id]);

  const handleLike = async () => {
    try {
      await api.post(`/posts/${id}/like`);
      loadPost();     // reload so the count comes from the server
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post and its comments?')) return;
    try {
      await api.delete(`/posts/${id}`);
      navigate('/');
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  if (error) return <p className="error">{error}</p>;
  if (!post) return <p className="muted">Loading...</p>;

  const author = post.author?.username;
  const isOwner = post.author?._id === user._id;
  const liked = post.likes.includes(user._id);
  const likeCount = post.likes.length;
  const fullDate = new Date(post.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <>
      <Link to="/" className="back">Back to feed</Link>

      {/* The top border takes the colour of the author's avatar */}
      <article className="detail" style={{ borderTopColor: avatarColor(author) }}>
        <header className="detail-head">
          <Avatar name={author} size={52} />
          <div className="detail-who">
            <strong className="detail-name">{author}</strong>
            <span className="muted">{timeAgo(post.createdAt)} &middot; {fullDate}</span>
          </div>
          {isOwner && (
            <div className="detail-tools">
              <Link className="action" to={`/posts/${post._id}/edit`}><EditIcon /> Edit</Link>
              <button className="action danger" onClick={handleDelete}><TrashIcon /> Delete</button>
            </div>
          )}
        </header>

        <p className={`detail-text ${post.content.length > 140 ? 'long' : ''}`}>{post.content}</p>

        <div className="detail-stats">
          <span><strong>{likeCount}</strong> {likeCount === 1 ? 'like' : 'likes'}</span>
          <span><strong>{commentCount}</strong> {commentCount === 1 ? 'comment' : 'comments'}</span>
        </div>

        <div className="detail-actions">
          <button className={`pill ${liked ? 'pill-liked' : ''}`} onClick={handleLike}>
            <HeartIcon filled={liked} /> {liked ? 'Liked' : 'Like'}
          </button>
          <button className="pill" onClick={() => document.getElementById('comment-input')?.focus()}>
            <CommentIcon /> Comment
          </button>
        </div>
      </article>

      <CommentSection postId={id} postAuthorId={post.author?._id} onCount={setCommentCount} />
    </>
  );
}
