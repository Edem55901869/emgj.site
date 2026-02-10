import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { LayoutDashboard, BookOpen, Users, Newspaper, Library, Radio, MoreHorizontal, LogOut, GraduationCap, Menu, X, MessageCircle, FileText, HelpCircle, DollarSign, BarChart3, Bot, Cloud, Settings, Shield, Eye, MessagesSquare, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import PublicChat from '../PublicChat';

const navItems = [
  { name: 'Tableau de bord', icon: LayoutDashboard, page: 'AdminDashboard' },
  { name: 'Cours', icon: BookOpen, page: 'AdminCourses' },
  { name: 'Étudiants', icon: Users, page: 'AdminStudents' },
  { name: 'Blog', icon: Newspaper, page: 'AdminBlog' },
  { name: 'Bibliothèque', icon: Library, page: 'AdminLibrary' },
  { name: 'Conférences', icon: Radio, page: 'AdminConferences' },
];

const moreItems = [
  { name: 'Groupes', icon: MessageCircle, page: 'AdminGroups' },
  { name: 'Bulletins', icon: FileText, page: 'AdminBulletins' },
  { name: 'Questions', icon: HelpCircle, page: 'AdminQuestions' },
  { name: 'Scolarité', icon: DollarSign, page: 'AdminTuition' },
  { name: 'Analytique', icon: BarChart3, page: 'AdminAnalytics' },
  { name: 'Gérer administrateurs', icon: Shield, page: 'AdminManagement' },
  { name: 'Voir en tant qu\'étudiant', icon: Eye, page: 'AdminViewAsStudent' },
  { name: 'Assistant IA', icon: Bot, page: 'AdminAI' },
  { name: 'Hébergement', icon: Cloud, page: 'AdminHosting' },
  { name: 'Vidéo d\'accueil', icon: Video, page: 'AdminHomeVideo' },
  { name: 'Paramètres', icon: Settings, page: 'AdminSettings' },
];

const PERMISSION_MAP = {
  'AdminDashboard': 'dashboard',
  'AdminCourses': 'courses',
  'AdminStudents': 'students',
  'AdminBlog': 'blog',
  'AdminLibrary': 'library',
  'AdminConferences': 'conferences',
  'AdminGroups': 'groups',
  'AdminBulletins': 'bulletins',
  'AdminQuestions': 'questions',
  'AdminTuition': 'tuition',
  'AdminAnalytics': 'analytics',
  'AdminManagement': 'admin',
  'AdminViewAsStudent': 'admin',
  'AdminAI': 'admin',
  'AdminHosting': 'admin',
  'AdminHomeVideo': 'admin',
  'AdminSettings': 'settings',
};

export default function AdminTopNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const adminData = JSON.parse(localStorage.getItem('emgj_admin') || '{}');
    setAdmin(adminData);
  }, []);

  const hasPermission = (page) => {
    if (!admin) return false;
    if (admin.role === 'admin_principal') return true;
    const permission = PERMISSION_MAP[page];
    return admin.permissions?.includes(permission);
  };

  const handleLogout = () => {
    localStorage.removeItem('emgj_admin');
    localStorage.removeItem('admin_student_view');
    navigate(createPageUrl('Connexion'));
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 border-b border-blue-700/30 shadow-lg shadow-blue-900/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6988dd24f34fbffabf6f6551/4d6e0c9a2_IMG_4736.jpeg" 
                alt="FTGJ Logo" 
                className="w-9 h-9 rounded-xl object-contain bg-white/10 backdrop-blur-sm p-1"
              />
              <span className="font-bold text-white hidden sm:block">FTGJ Admin</span>
            </div>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.filter(item => hasPermission(item.page)).map(item => {
                const isActive = location.pathname.includes(item.page);
                return (
                  <Link
                    key={item.name}
                    to={createPageUrl(item.page)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      isActive ? 'bg-white/20 text-white backdrop-blur-sm' : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-white/90 hover:text-white hover:bg-white/10 rounded-xl hidden md:flex">
                    <MoreHorizontal className="w-4 h-4 mr-1" /> Plus
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {moreItems.filter(item => hasPermission(item.page)).map(item => (
                    <DropdownMenuItem key={item.name} onClick={() => navigate(createPageUrl(item.page))}>
                      <item.icon className="w-4 h-4 mr-2" />
                      {item.name}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-xl hover:bg-white/10 text-white">
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute top-16 left-0 right-0 bg-gradient-to-b from-indigo-600 to-indigo-700 border-b border-indigo-800/30 shadow-lg p-4 space-y-1 backdrop-blur-md" onClick={(e) => e.stopPropagation()}>
            {navItems.filter(item => hasPermission(item.page)).map(item => {
              const isActive = location.pathname.includes(item.page);
              return (
                <Link
                  key={item.name}
                  to={createPageUrl(item.page)}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                    isActive ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
            <div className="border-t border-white/10 pt-2 mt-2">
              {moreItems.filter(item => hasPermission(item.page)).map(item => {
                const isActive = location.pathname.includes(item.page);
                return (
                  <Link
                    key={item.name}
                    to={createPageUrl(item.page)}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                      isActive ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/90 hover:bg-white/10 hover:text-white w-full mt-2">
              <LogOut className="w-4 h-4" /> Déconnexion
            </button>
          </div>
        </div>
      )}

      {/* Bouton de discussion flottant - seulement sur AdminDashboard */}
      {location.pathname.includes('AdminDashboard') && (
        <>
          <button
            onClick={() => setShowChat(!showChat)}
            className="fixed bottom-6 right-6 z-[60] w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full shadow-lg shadow-green-500/30 flex items-center justify-center text-white hover:scale-110 transition-transform"
          >
            <MessagesSquare className="w-6 h-6" />
          </button>

          {showChat && <PublicChat isAdmin={true} open={showChat} onClose={() => setShowChat(false)} />}
        </>
      )}
    </>
  );
}