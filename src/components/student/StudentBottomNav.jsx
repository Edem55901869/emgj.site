import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, BookOpen, Users, Library, MoreHorizontal } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';

const navItems = [
  { name: 'Accueil', icon: Home, page: 'StudentDashboard' },
  { name: 'Cours', icon: BookOpen, page: 'StudentCourses' },
  { name: 'Groupes', icon: Users, page: 'StudentGroups' },
  { name: 'Biblio', icon: Library, page: 'StudentLibrary' },
  { name: 'Plus', icon: MoreHorizontal, page: 'StudentMore' },
];

export default function StudentBottomNav() {
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
      } catch {}
    };
    loadUser();
  }, []);

  const { data: publicMessages = [] } = useQuery({
    queryKey: ['publicMessages'],
    queryFn: () => base44.entities.PublicMessage.list('-created_date', 100),
    enabled: !!user,
    refetchInterval: 5000,
  });

  const readMessagesStr = localStorage.getItem('read_public_messages') || '[]';
  let readMessages = [];
  try {
    readMessages = JSON.parse(readMessagesStr);
  } catch {}
  const unreadCount = publicMessages.filter(m => !readMessages.includes(m.id)).length;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 border-t border-blue-700/30 shadow-lg shadow-blue-900/20">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const url = createPageUrl(item.page);
          const isActive = location.pathname.includes(item.page) || 
            (item.page === 'StudentDashboard' && location.pathname.includes('StudentDashboard'));
          const showBadge = item.name === 'Groupes' && unreadCount > 0;
          
          return (
            <Link
              key={item.name}
              to={url}
              className={`relative flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? 'text-white bg-white/20 backdrop-blur-sm'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : ''}`} />
              <span className="text-[10px] font-medium">{item.name}</span>
              {showBadge && (
                <Badge className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center bg-red-500 text-white text-[10px] px-1.5 rounded-full border-2 border-blue-600">
                  {unreadCount}
                </Badge>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}