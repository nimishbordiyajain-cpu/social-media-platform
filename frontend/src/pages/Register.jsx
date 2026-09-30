import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { errorMessage } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import AuthLayout from '../components/AuthLayout.jsx';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/register', form);
      login(data);          // registration also logs the user in
      navigate('/');
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <AuthLayout>
      <div className="auth-box">
        <h2>Create your account</h2>
        <p className="muted">It takes a few seconds.</p>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit} className="stack">
          <label>Username<input name="username" value={form.username} onChange={handleChange} required minLength={3} /></label>
          <label>Email<input type="email" name="email" value={form.email} onChange={handleChange} required /></label>
          <label>Password<input type="password" name="password" value={form.password} onChange={handleChange} required minLength={6} /></label>
          <button className="btn btn-primary btn-block" type="submit">Sign up</button>
        </form>
        <p className="muted switch">Already registered? <Link to="/login">Log in</Link></p>
      </div>
    </AuthLayout>
  );
}
