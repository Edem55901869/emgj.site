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
import AdminBlog from './pages/AdminBlog';
import AdminConferences from './pages/AdminConferences';
import AdminCourses from './pages/AdminCourses';
import AdminDashboard from './pages/AdminDashboard';
import AdminLibrary from './pages/AdminLibrary';
import AdminStudents from './pages/AdminStudents';
import Connexion from './pages/Connexion';
import Home from './pages/Home';
import StudentConferences from './pages/StudentConferences';
import StudentCourses from './pages/StudentCourses';
import StudentDashboard from './pages/StudentDashboard';
import StudentGroups from './pages/StudentGroups';
import StudentLibrary from './pages/StudentLibrary';
import StudentMore from './pages/StudentMore';
import AdminGroups from './pages/AdminGroups';
import AdminBulletins from './pages/AdminBulletins';
import AdminQuestions from './pages/AdminQuestions';
import AdminTuition from './pages/AdminTuition';


export const PAGES = {
    "AdminBlog": AdminBlog,
    "AdminConferences": AdminConferences,
    "AdminCourses": AdminCourses,
    "AdminDashboard": AdminDashboard,
    "AdminLibrary": AdminLibrary,
    "AdminStudents": AdminStudents,
    "Connexion": Connexion,
    "Home": Home,
    "StudentConferences": StudentConferences,
    "StudentCourses": StudentCourses,
    "StudentDashboard": StudentDashboard,
    "StudentGroups": StudentGroups,
    "StudentLibrary": StudentLibrary,
    "StudentMore": StudentMore,
    "AdminGroups": AdminGroups,
    "AdminBulletins": AdminBulletins,
    "AdminQuestions": AdminQuestions,
    "AdminTuition": AdminTuition,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
};