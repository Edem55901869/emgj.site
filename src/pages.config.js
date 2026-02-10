/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AdminAI from './pages/AdminAI';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminBlog from './pages/AdminBlog';
import AdminBulletins from './pages/AdminBulletins';
import AdminConferences from './pages/AdminConferences';
import AdminCourses from './pages/AdminCourses';
import AdminDashboard from './pages/AdminDashboard';
import AdminGroups from './pages/AdminGroups';
import AdminHomeVideo from './pages/AdminHomeVideo';
import AdminHosting from './pages/AdminHosting';
import AdminLibrary from './pages/AdminLibrary';
import AdminManagement from './pages/AdminManagement';
import AdminQuestions from './pages/AdminQuestions';
import AdminSettings from './pages/AdminSettings';
import AdminStudents from './pages/AdminStudents';
import AdminTuition from './pages/AdminTuition';
import AdminViewAsStudent from './pages/AdminViewAsStudent';
import Connexion from './pages/Connexion';
import Contact from './pages/Contact';
import Home from './pages/Home';
import MaintenanceMode from './pages/MaintenanceMode';
import StudentBulletins from './pages/StudentBulletins';
import StudentConferences from './pages/StudentConferences';
import StudentCourses from './pages/StudentCourses';
import StudentDashboard from './pages/StudentDashboard';
import StudentGroups from './pages/StudentGroups';
import StudentHelp from './pages/StudentHelp';
import StudentLibrary from './pages/StudentLibrary';
import StudentMore from './pages/StudentMore';
import StudentNotifications from './pages/StudentNotifications';
import StudentProfile from './pages/StudentProfile';
import StudentSettings from './pages/StudentSettings';
import StudentTuition from './pages/StudentTuition';


export const PAGES = {
    "AdminAI": AdminAI,
    "AdminAnalytics": AdminAnalytics,
    "AdminBlog": AdminBlog,
    "AdminBulletins": AdminBulletins,
    "AdminConferences": AdminConferences,
    "AdminCourses": AdminCourses,
    "AdminDashboard": AdminDashboard,
    "AdminGroups": AdminGroups,
    "AdminHomeVideo": AdminHomeVideo,
    "AdminHosting": AdminHosting,
    "AdminLibrary": AdminLibrary,
    "AdminManagement": AdminManagement,
    "AdminQuestions": AdminQuestions,
    "AdminSettings": AdminSettings,
    "AdminStudents": AdminStudents,
    "AdminTuition": AdminTuition,
    "AdminViewAsStudent": AdminViewAsStudent,
    "Connexion": Connexion,
    "Contact": Contact,
    "Home": Home,
    "MaintenanceMode": MaintenanceMode,
    "StudentBulletins": StudentBulletins,
    "StudentConferences": StudentConferences,
    "StudentCourses": StudentCourses,
    "StudentDashboard": StudentDashboard,
    "StudentGroups": StudentGroups,
    "StudentHelp": StudentHelp,
    "StudentLibrary": StudentLibrary,
    "StudentMore": StudentMore,
    "StudentNotifications": StudentNotifications,
    "StudentProfile": StudentProfile,
    "StudentSettings": StudentSettings,
    "StudentTuition": StudentTuition,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
};