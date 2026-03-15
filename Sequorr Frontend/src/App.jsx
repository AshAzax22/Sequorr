import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';

import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import WaitlistAdmin from './pages/admin/WaitlistAdmin';
import BlogAdmin from './pages/admin/BlogAdmin';
import ContactAdmin from './pages/admin/ContactAdmin';
import BlogEditor from './pages/admin/BlogEditor';
import FindrrMap from './pages/public/FindrrMap';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public / Generic redirect */}
          <Route path="/" element={<Navigate to="/admin" replace />} />
          
          {/* Admin Login (unprotected) */}
          <Route path="/admin" element={<AdminLogin />} />

          {/* Public Findrr (unprotected) */}
          <Route path="/findrr" element={<FindrrMap />} />

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<Dashboard />} />
              <Route path="/admin/waitlist" element={<WaitlistAdmin />} />
              <Route path="/admin/blogs" element={<BlogAdmin />} />
              <Route path="/admin/contact" element={<ContactAdmin />} />
              <Route path="/admin/blogs/new" element={<BlogEditor />} />
              <Route path="/admin/blogs/edit/:id" element={<BlogEditor />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
