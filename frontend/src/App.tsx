import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, Spin } from 'antd';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SymptomChecker from './pages/SymptomChecker';
import DiseaseLibrary from './pages/DiseaseLibrary';
import DiseaseDetail from './pages/DiseaseDetail';
import HospitalFinder from './pages/HospitalFinder';
import Profile from './pages/Profile';
import HealthHistory from './pages/HealthHistory';
import { useAuthStore } from './store/authStore';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const App: React.FC = () => {
  const { loadSession } = useAuthStore();

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#0057D9',
          borderRadius: 8,
          fontFamily: 'DM Sans, system-ui, sans-serif',
        },
      }}
    >
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/symptom-checker" element={<ProtectedRoute><SymptomChecker /></ProtectedRoute>} />
          <Route path="/disease-library" element={<ProtectedRoute><DiseaseLibrary /></ProtectedRoute>} />
          <Route path="/disease/:id" element={<ProtectedRoute><DiseaseDetail /></ProtectedRoute>} />
          <Route path="/hospital-finder" element={<ProtectedRoute><HospitalFinder /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><HealthHistory /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
};

export default App;
