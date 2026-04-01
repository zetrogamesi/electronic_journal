import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import LoginPage        from './pages/LoginPage';
import RegisterPage     from './pages/RegisterPage';
import HomePage         from './pages/HomePage';
import ProfilePage      from './pages/ProfilePage';
import CreateJournalPage from './pages/CreateJournalPage';
import JournalPage      from './pages/JournalPage';
import AdminPage        from './pages/AdminPage';
import NotFoundPage     from './pages/NotFoundPage';

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout><HomePage /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <Layout><ProfilePage /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/journal/new" element={
            <ProtectedRoute adminOnly>
              <Layout><CreateJournalPage /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/journal/:id" element={
            <ProtectedRoute>
              <Layout><JournalPage /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute adminOnly>
              <Layout><AdminPage /></Layout>
            </ProtectedRoute>
          } />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
