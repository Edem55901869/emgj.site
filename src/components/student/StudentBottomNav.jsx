import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, BookOpen, Users, Library, Radio, MoreHorizontal } from 'lucide-react';

const navItems = [
  { name: 'Accueil', icon: Home, page: 'StudentDashboard' },
  { name: 'Cours', icon: BookOpen, page: 'StudentCourses' },
  { name: 'Groupes', icon: Users, page: 'StudentGroups' },
  { name: 'Biblio', icon: Library, page: 'StudentLibrary' },
  { name: 'Plus', icon: MoreHorizontal, page: 'StudentMore' },
];

export default function StudentBottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 border-t border-blue-700/30 shadow-lg shadow-blue-900/20">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const url = createPageUrl(item.page);
          const isActive = location.pathname.includes(item.page) || 
            (item.page === 'StudentDashboard' && location.pathname.includes('StudentDashboard'));
          
          return (
            <Link
              key={item.name}
              to={url}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? 'text-white bg-white/20 backdrop-blur-sm'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : ''}`} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}