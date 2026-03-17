import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { LayoutDashboard, BookOpen, Users, Library, MoreHorizontal, Eye, MessagesSquare, Image } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import PublicChat from '../PublicChat';

const navItems = [
  { name: 'Accueil', icon: LayoutDashboard, page: 'StudentDashboard' },
  { name: 'Cours', icon: BookOpen, page: 'StudentCourses' },
  { name: 'Biblio', icon: Library, page: 'StudentLibrary' },
  { name: 'Galerie', icon: Image, page: 'StudentGallery' },
  { name: 'Plus', icon: MoreHorizontal, page: 'StudentMore' },
];

export default function StudentBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [adminView, setAdminView] = useState(false);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const adminViewData = localStorage.getItem('admin_student_view');
    if (adminViewData) {
      setAdminView(true);
      return;
    }
    try {
      const u = await base44.auth.me();
      setUser(u);
    } catch {}
  };

  const [unreadMessages, setUnreadMessages] = React.useState(0);
  const [lastReadTime, setLastReadTime] = React.useState(localStorage.getItem('lastReadMessageTime') || new Date().toISOString());

  const { data: publicMessages = [] } = useQuery({
    queryKey: ['publicMessagesCount'],
    queryFn: () => base44.entities.PublicMessage.list('-created_date', 50),
    refetchInterval: 5000,
  });

  React.useEffect(() => {
    const count = publicMessages.filter(m => new Date(m.created_date) > new Date(lastReadTime)).length;
    setUnreadMessages(count);
  }, [publicMessages, lastReadTime]);



  const handleAdminReturn = () => {
    localStorage.removeItem('admin_student_view');
    navigate(createPageUrl('AdminDashboard'));
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 border-t border-blue-700/30 shadow-lg">
        {adminView && (
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white text-sm font-medium">
              <Eye className="w-4 h-4" />
              Mode prévisualisation admin
            </div>
            <Button onClick={handleAdminReturn} size="sm" variant="ghost" className="text-white hover:bg-white/20 rounded-lg">
              Retour admin
            </Button>
          </div>
        )}
        <div className="flex items-center justify-around py-2 max-w-screen-sm mx-auto">
          {navItems.map((item) => {
            const isActive = location.pathname.includes(item.page);
            const hasNewMessages = item.name === 'Groupes' && publicMessages.length > 0;

            return (
              <Link
                key={item.name}
                to={createPageUrl(item.page)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                  isActive ? 'text-white bg-white/20' : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="relative">
                  <item.icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
                </div>
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bouton de chat flottant - seulement sur StudentDashboard */}
      {location.pathname.includes('StudentDashboard') && (
        <>
          <button
            onClick={() => {
              setShowChat(!showChat);
              if (!showChat) {
                localStorage.setItem('lastReadMessageTime', new Date().toISOString());
                setLastReadTime(new Date().toISOString());
                setUnreadMessages(0);
              }
            }}
            className="fixed bottom-20 right-6 z-[60] w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full shadow-xl shadow-green-500/30 flex items-center justify-center text-white hover:scale-110 transition-transform"
          >
            <MessagesSquare className="w-6 h-6" />
          </button>

          {showChat && <PublicChat isAdmin={false} open={showChat} onClose={() => setShowChat(false)} />}
        </>
      )}
    </>
  );
}