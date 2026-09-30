import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import Avatar from './Avatar.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link to="/" className="brand">
          <span className="brand-mark" />
          PostBoard
        </Link>
        {user && (
          <nav>
            <span className="user-chip">
              <Avatar name={user.username} size={30} />
              <span className="user-name">{user.username}</span>
            </span>
            <Link to="/posts/new" className="btn btn-sun">New post</Link>
            <button className="btn btn-outline-light" onClick={handleLogout}>Log out</button>
          </nav>
        )}
      </div>
    </header>
  );
}
