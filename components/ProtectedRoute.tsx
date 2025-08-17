
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-screen bg-primary dark:bg-dark-primary">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-highlight dark:border-dark-highlight"></div>
        </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;