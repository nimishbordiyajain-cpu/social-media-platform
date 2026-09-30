import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { errorMessage } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import AuthLayout from '../components/AuthLayout.jsx';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/login', form);
      login(data);          // save token + user
      navigate('/');
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <AuthLayout>
      <div className="auth-box">
        <h2>Welcome back</h2>
        <p className="muted">Log in to see what everyone is posting.</p>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit} className="stack">
          <label>Email<input type="email" name="email" value={form.email} onChange={handleChange} required /></label>
          <label>Password<input type="password" name="password" value={form.password} onChange={handleChange} required /></label>
          <button className="btn btn-primary btn-block" type="submit">Log in</button>
        </form>
        <p className="muted switch">New here? <Link to="/register">Create an account</Link></p>
      </div>
    </AuthLayout>
  );
}
