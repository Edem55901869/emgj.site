import React from 'react';
import { Navigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function AdminGuard({ children }) {
  const admin = JSON.parse(localStorage.getItem('emgj_admin') || '{}');
  
  if (!admin.loggedIn) {
    return <Navigate to={createPageUrl('Connexion')} replace />;
  }
  
  return <>{children}</>;
}