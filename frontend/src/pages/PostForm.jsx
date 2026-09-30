import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { errorMessage } from '../api.js';

// One form used for BOTH "Add post" (/posts/new) and "Update post" (/posts/:id/edit)
export default function PostForm() {
  const { id } = useParams();          // id exists only in edit mode
  const isEdit = Boolean(id);
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // In edit mode, load the existing text into the box
  useEffect(() => {
    if (!isEdit) return;
    api.get(`/posts/${id}`)
      .then(({ data }) => setContent(data.content))
      .catch((err) => setError(errorMessage(err)));
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isEdit) await api.patch(`/posts/${id}`, { content });
      else await api.post('/posts', { content });
      navigate('/');
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <div className="panel">
      <h2>{isEdit ? 'Edit your post' : 'Write a new post'}</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit} className="stack">
        <textarea
          rows={7}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What do you want to share?"
          aria-label="Post content"
        />
        <span className={`counter ${content.length > 500 ? 'over' : ''}`}>{content.length} / 500</span>
        <div className="row">
          <button className="btn btn-primary" type="submit">{isEdit ? 'Save changes' : 'Publish'}</button>
          <button className="btn" type="button" onClick={() => navigate(-1)}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
