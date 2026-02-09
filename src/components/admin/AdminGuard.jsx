import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

const PAGE_PERMISSIONS = {
  'AdminDashboard': 'dashboard',
  'AdminStudents': 'students',
  'AdminCourses': 'courses',
  'AdminBlog': 'blog',
  'AdminLibrary': 'library',
  'AdminGroups': 'groups',
  'AdminTuition': 'tuition',
  'AdminBulletins': 'bulletins',
  'AdminQuestions': 'questions',
  'AdminConferences': 'conferences',
  'AdminAnalytics': 'analytics',
  'AdminSettings': 'settings',
  'AdminManagement': 'admin',
  'AdminViewAsStudent': 'admin',
  'AdminAI': 'admin',
  'AdminHosting': 'admin',
};

export default function AdminGuard({ children }) {
  const location = useLocation();
  const admin = JSON.parse(localStorage.getItem('emgj_admin') || '{}');
  
  if (!admin.loggedIn) {
    return <Navigate to={createPageUrl('Connexion')} replace />;
  }

  // Admin principal a accès à tout
  if (admin.role === 'admin_principal') {
    return <>{children}</>;
  }

  // Vérifier les permissions pour les admins secondaires
  const currentPage = location.pathname.split('/').pop();
  const requiredPermission = PAGE_PERMISSIONS[currentPage];
  
  if (requiredPermission && !admin.permissions?.includes(requiredPermission)) {
    toast.error('Accès non autorisé à cette fonctionnalité');
    return <Navigate to={createPageUrl('AdminDashboard')} replace />;
  }
  
  return <>{children}</>;
}