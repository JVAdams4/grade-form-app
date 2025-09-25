import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import MasterDashboard from './components/master/MasterDashboard';
import Navbar from './components/layout/Navbar';

const PrivateRoute = ({ children, isMasterRoute = false }) => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" />;
    if (isMasterRoute && !user.isMaster) return <Navigate to="/" />;
    if (!isMasterRoute && user.isMaster) return <Navigate to="/master" />;
    return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
      <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/master" element={<PrivateRoute isMasterRoute={true}><MasterDashboard /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App = () => (
  <AuthProvider>
    <Router>
      <Navbar />
      <div className="container mt-5"><AppRoutes /></div>
    </Router>
  </AuthProvider>
);

export default App;
