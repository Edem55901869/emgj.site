import React, { useEffect } from 'react';
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
  'AdminFormationChanges': 'students',
  'AdminCourseQuestions': 'questions',
  'AdminGallery': 'admin',
  'AdminHomeVideo': 'admin',
};

// Durée de session : 8 heures
const SESSION_DURATION = 8 * 60 * 60 * 1000;
// Timeout d'inactivité : 2 heures
const INACTIVITY_TIMEOUT = 2 * 60 * 60 * 1000;

function getAdminSession() {
  try {
    const raw = localStorage.getItem('emgj_admin');
    if (!raw) return null;
    const admin = JSON.parse(raw);

    // Vérifier l'expiration absolue de session
    if (admin.expiresAt && Date.now() > admin.expiresAt) {
      localStorage.removeItem('emgj_admin');
      return null;
    }

    // Vérifier le timeout d'inactivité
    const lastActivity = parseInt(localStorage.getItem('emgj_last_activity') || '0');
    if (lastActivity && Date.now() - lastActivity > INACTIVITY_TIMEOUT) {
      localStorage.removeItem('emgj_admin');
      localStorage.removeItem('emgj_last_activity');
      return null;
    }

    return admin;
  } catch {
    localStorage.removeItem('emgj_admin');
    return null;
  }
}

function updateLastActivity() {
  localStorage.setItem('emgj_last_activity', String(Date.now()));
}

export default function AdminGuard({ children }) {
  const location = useLocation();
  const admin = getAdminSession();

  useEffect(() => {
    if (!admin) return;

    // Mettre à jour l'activité à chaque interaction
    updateLastActivity();
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, updateLastActivity, { passive: true }));

    // Vérifier toutes les 5 minutes si la session est toujours valide
    const interval = setInterval(() => {
      const current = getAdminSession();
      if (!current) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        window.location.href = createPageUrl('Connexion');
      }
    }, 5 * 60 * 1000);

    return () => {
      events.forEach(e => window.removeEventListener(e, updateLastActivity));
      clearInterval(interval);
    };
  }, [admin?.email]);

  if (!admin || !admin.loggedIn) {
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