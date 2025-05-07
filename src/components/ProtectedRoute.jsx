// ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner'; // Add a proper loading component

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner />;

  if (!user) 
    return <Navigate to="/login" state={{ from: location }} replace />;
  
  if (requireAdmin && role !== 'admin') 
    return <Navigate to="/unauthorized" replace />;
  
  if (!requireAdmin && role === 'unassigned') 
    return <Navigate to="/profile-setup" replace />; // New route for unassigned users

  return children;
}