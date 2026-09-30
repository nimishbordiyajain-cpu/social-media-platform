import Avatar from './Avatar.jsx';
import { HeartIcon } from './Icons.jsx';

// Split screen used by Login and Register: brand panel on the left, form on the right
export default function AuthLayout({ children }) {
  return (
    <div className="auth-page">
      <aside className="auth-brand">
        <div className="brand brand-light"><span className="brand-mark" />PostBoard</div>
        <div>
          <h1>Say it in 500 characters.</h1>
          <p>Share a thought, like what you enjoy and reply to someone. Your posts stay yours to edit or delete.</p>
        </div>
        <div className="sample-post" aria-hidden="true">
          <Avatar name="Riya" size={36} />
          <div>
            <strong>Riya</strong>
            <p>Finished my backend project. JWT finally makes sense!</p>
            <span className="sample-like"><HeartIcon filled /> 12</span>
          </div>
        </div>
      </aside>
      <div className="auth-form-wrap">{children}</div>
    </div>
  );
}
