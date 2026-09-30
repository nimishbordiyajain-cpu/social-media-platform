import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

// If not logged in, send the visitor to the login page
export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}
