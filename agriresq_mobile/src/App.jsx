import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AIVision from './pages/AIVision';
import Splash from './pages/Splash';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import BatchDetail from './pages/BatchDetail';
import NewBatch from './pages/NewBatch';
import Marketplace from './pages/Marketplace';
import ProduceDetail from './pages/ProduceDetail';
import Messages from './pages/Messages';
import Chat from './pages/Chat';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import AccountSettings from './pages/AccountSettings';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="app-shell page"><p>Loading...</p></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/home" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicRoute><Splash /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
          
          {/* AI Testing Route (Public) */}
          <Route path="/ai-test" element={<AIVision />} />
          
          {/* Private Routes */}
          <Route path="/account-settings" element={<PrivateRoute><AccountSettings /></PrivateRoute>} />
          <Route path="/home" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/batch/new" element={<PrivateRoute><NewBatch /></PrivateRoute>} />
          <Route path="/batch/:id" element={<PrivateRoute><BatchDetail /></PrivateRoute>} />
          <Route path="/marketplace" element={<PrivateRoute><Marketplace /></PrivateRoute>} />
          <Route path="/produce/:id" element={<PrivateRoute><ProduceDetail /></PrivateRoute>} />
          <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
          <Route path="/chat/:id" element={<PrivateRoute><Chat /></PrivateRoute>} />
          <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}``