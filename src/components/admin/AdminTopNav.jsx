import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { LayoutDashboard, BookOpen, Users, Newspaper, Library, Radio, MoreHorizontal, LogOut, GraduationCap, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { name: 'Tableau de bord', icon: LayoutDashboard, page: 'AdminDashboard' },
  { name: 'Cours', icon: BookOpen, page: 'AdminCourses' },
  { name: 'Étudiants', icon: Users, page: 'AdminStudents' },
  { name: 'Blog', icon: Newspaper, page: 'AdminBlog' },
  { name: 'Bibliothèque', icon: Library, page: 'AdminLibrary' },
  { name: 'Conférences', icon: Radio, page: 'AdminConferences' },
];

export default function AdminTopNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('emgj_admin');
    navigate(createPageUrl('Connexion'));
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-gray-900 hidden sm:block">EMGJ Admin</span>
            </div>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map(item => {
                const isActive = location.pathname.includes(item.page);
                return (
                  <Link
                    key={item.name}
                    to={createPageUrl(item.page)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={handleLogout} variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl hidden md:flex">
                <LogOut className="w-4 h-4 mr-1" /> Déconnexion
              </Button>
              <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-xl hover:bg-gray-100">
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg p-4 space-y-1" onClick={(e) => e.stopPropagation()}>
            {navItems.map(item => {
              const isActive = location.pathname.includes(item.page);
              return (
                <Link
                  key={item.name}
                  to={createPageUrl(item.page)}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                    isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 w-full">
              <LogOut className="w-4 h-4" /> Déconnexion
            </button>
          </div>
        </div>
      )}
    </>
  );
}