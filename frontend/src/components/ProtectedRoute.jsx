import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading, refreshUser } = useAuth();
  // rechecked = has at least one DB refresh been attempted for this render
  const [rechecked, setRechecked] = useState(false);

  useEffect(() => {
    // If this is an admin-only route and the cached user doesn't show admin,
    // do ONE silent DB refresh before deciding to block.
    // This covers: make-admin.js run after login, tab was left open, etc.
    if (!loading && !rechecked) {
      if (adminOnly && user && !user.isAdmin) {
        refreshUser().finally(() => setRechecked(true));
      } else {
        setRechecked(true);
      }
    }
  }, [loading, adminOnly, user, rechecked, refreshUser]);

  // Spinner during initial auth load or admin recheck
  if (loading || !rechecked) {
    return (
      <div className="loader-wrap" style={{ minHeight: '100vh' }}>
        <div className="spinner" />
        <span style={{ color: 'var(--text3)', fontSize: '0.9rem' }}>Загрузка...</span>
      </div>
    );
  }

  // Not logged in → login page
  if (!user) return <Navigate to="/login" replace />;

  // Still not admin after recheck → redirect home
  if (adminOnly && !user.isAdmin) return <Navigate to="/" replace />;

  return children;
}
