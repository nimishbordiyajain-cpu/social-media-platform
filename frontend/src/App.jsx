import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Feed from './pages/Feed.jsx';
import PostForm from './pages/PostForm.jsx';
import PostDetails from './pages/PostDetails.jsx';

export default function App() {
  const { pathname } = useLocation();
  const isAuthPage = pathname === '/login' || pathname === '/register';

  return (
    <>
      {!isAuthPage && <Navbar />}
      <main className={isAuthPage ? '' : 'container'}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Only logged-in users can open these pages */}
          <Route path="/" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
          <Route path="/posts/new" element={<ProtectedRoute><PostForm /></ProtectedRoute>} />
          <Route path="/posts/:id/edit" element={<ProtectedRoute><PostForm /></ProtectedRoute>} />
          <Route path="/posts/:id" element={<ProtectedRoute><PostDetails /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </>
  );
}
