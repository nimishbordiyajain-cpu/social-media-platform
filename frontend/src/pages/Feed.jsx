import { useEffect, useState } from 'react';
import api, { errorMessage } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import Avatar from '../components/Avatar.jsx';
import PostCard from '../components/PostCard.jsx';

// Main list / dashboard view: a composer on top, then all posts (newest first)
export default function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const loadPosts = async () => {
    try {
      const { data } = await api.get('/posts');
      setPosts(data);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPosts(); }, []);

  const handlePublish = async (e) => {
    e.preventDefault();
    setError('');
    setPosting(true);
    try {
      await api.post('/posts', { content });
      setContent('');
      await loadPosts();
    } catch (err) {
      setError(errorMessage(err));   // e.g. "Post content cannot exceed 500 characters"
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (id) => {
    try {
      await api.post(`/posts/${id}/like`);
      loadPosts();      // reload so the like count comes from the server
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this post and its comments?')) return;
    try {
      await api.delete(`/posts/${id}`);
      loadPosts();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <>
      <form className="composer" onSubmit={handlePublish}>
        <Avatar name={user.username} />
        <div className="composer-main">
          <textarea
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`What's on your mind, ${user.username}?`}
            aria-label="Write a post"
          />
          <div className="composer-foot">
            <span className={`counter ${content.length > 500 ? 'over' : ''}`}>{content.length} / 500</span>
            <button className="btn btn-primary" type="submit" disabled={posting}>
              {posting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </form>

      {error && <p className="error">{error}</p>}
      {loading && <p className="muted">Loading feed...</p>}
      {!loading && posts.length === 0 && (
        <p className="muted empty">No posts yet. Yours could be the first.</p>
      )}

      {posts.map((p) => (
        <PostCard key={p._id} post={p} onLike={handleLike} onDelete={handleDelete} />
      ))}
    </>
  );
}
