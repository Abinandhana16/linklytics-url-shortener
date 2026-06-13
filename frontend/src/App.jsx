import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import NotFound from './pages/NotFound';
import Expired from './pages/Expired';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Guest Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/not-found" element={<NotFound />} />
          <Route path="/expired" element={<Expired />} />

          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/analytics/:id" 
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            } 
          />

          {/* Catch-all redirect to NotFound */}
          <Route path="*" element={<Navigate to="/not-found" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
