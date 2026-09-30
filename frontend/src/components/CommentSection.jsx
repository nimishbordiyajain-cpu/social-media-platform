import { useEffect, useState } from 'react';
import api, { errorMessage } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import Avatar from './Avatar.jsx';
import { CommentIcon } from './Icons.jsx';
import { timeAgo } from '../utils.js';

// List of comments + add form. Edit/delete buttons only appear on your own comments.
// postAuthorId -> used to show an "Author" tag on comments written by the post's owner.
// onCount      -> tells the parent page how many comments there are.
export default function CommentSection({ postId, postAuthorId, onCount }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  const load = async () => {
    try {
      const { data } = await api.get(`/posts/${postId}/comments`);
      setComments(data);
      onCount?.(data.length);
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  useEffect(() => { load(); }, [postId]);

  const addComment = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post(`/posts/${postId}/comments`, { text });
      setText('');
      load();
    } catch (err) {
      setError(errorMessage(err));   // e.g. "Comment text is required and cannot be empty"
    }
  };

  const saveEdit = async (id) => {
    setError('');
    try {
      await api.patch(`/comments/${id}`, { text: editText });
      setEditingId(null);
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await api.delete(`/comments/${id}`);
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <section className="comments">
      <div className="comments-head">
        <h3>Comments</h3>
        <span className="badge">{comments.length}</span>
      </div>

      {error && <p className="error">{error}</p>}

      <form onSubmit={addComment} className="comment-form">
        <Avatar name={user.username} size={38} />
        <input
          id="comment-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment..."
          aria-label="Write a comment"
        />
        {text.length > 0 && (
          <span className={`counter ${text.length > 200 ? 'over' : ''}`}>{text.length}/200</span>
        )}
        <button className="btn btn-primary" type="submit">Reply</button>
      </form>

      {comments.length === 0 && (
        <div className="no-comments">
          <span className="icon-circle"><CommentIcon /></span>
          <strong>No comments yet</strong>
          Be the first to reply.
        </div>
      )}

      {comments.map((c) => {
        const mine = c.author?._id === user._id;
        return (
          <div className="comment" key={c._id}>
            <Avatar name={c.author?.username} size={38} />
            <div className="comment-body">
              <div className="bubble">
                <div className="bubble-head">
                  <strong>{c.author?.username}</strong>
                  {c.author?._id === postAuthorId && <span className="tag">Author</span>}
                  {mine && <span className="tag you">You</span>}
                  <span className="muted">{timeAgo(c.createdAt)}</span>
                </div>

                {editingId === c._id ? (
                  <div className="comment-form inline">
                    <input value={editText} onChange={(e) => setEditText(e.target.value)} aria-label="Edit comment" />
                    <button className="btn btn-primary" onClick={() => saveEdit(c._id)}>Save</button>
                    <button className="btn" onClick={() => setEditingId(null)}>Cancel</button>
                  </div>
                ) : (
                  <p className="comment-text">{c.text}</p>
                )}
              </div>

              {mine && editingId !== c._id && (
                <div className="post-actions small">
                  <button className="action" onClick={() => { setEditingId(c._id); setEditText(c.text); }}>Edit</button>
                  <button className="action danger" onClick={() => remove(c._id)}>Delete</button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}
