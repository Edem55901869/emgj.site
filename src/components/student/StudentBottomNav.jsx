import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '../../utils';
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
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
                  ? 'text-blue-600'
                  : 'text-gray-400 hover:text-gray-600'
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