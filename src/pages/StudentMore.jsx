import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tantml/react-query';
import { Bell, User, Settings, HelpCircle, LogOut, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import StudentBottomNav from '../components/student/StudentBottomNav';

export default function StudentMore() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const u = await base44.auth.me();
    setUser(u);
    const students = await base44.entities.Student.filter({ user_email: u.email });
    if (students.length > 0) setStudent(students[0]);
    setLoading(false);
  };

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => base44.entities.Notification.filter({ recipient_email: user?.email }),
    enabled: !!user,
  });

  const unreadCount = notifications.filter(n => n.status === 'nouveau').length;

  const handleLogout = () => {
    base44.auth.logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-4 pt-8 pb-6">
        <h1 className="text-2xl font-bold text-white">Plus</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-2">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
          <button
            onClick={() => navigate(createPageUrl('StudentProfile') + `?id=${student?.id}`)}
            className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-gray-900">Mon profil</p>
              <p className="text-sm text-gray-500">Voir mes informations</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          <button className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors relative">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <Bell className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-gray-900">Notifications</p>
              <p className="text-sm text-gray-500">{unreadCount} non lue(s)</p>
            </div>
            {unreadCount > 0 && (
              <Badge className="bg-red-500 text-white">{unreadCount}</Badge>
            )}
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          <button className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
              <Settings className="w-6 h-6 text-gray-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-gray-900">Paramètres</p>
              <p className="text-sm text-gray-500">Préférences du compte</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          <button className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <HelpCircle className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-gray-900">Aide & Support</p>
              <p className="text-sm text-gray-500">Centre d'aide</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {notifications.length > 0 && (
          <div className="mt-4 space-y-2">
            <h2 className="text-sm font-bold text-gray-700 px-2">Notifications récentes</h2>
            {notifications.slice(0, 5).map(notif => (
              <div key={notif.id} className={`bg-white rounded-xl border p-4 ${notif.status === 'nouveau' ? 'border-blue-200' : 'border-gray-100'}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    notif.type === 'success' ? 'bg-green-500' : notif.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{notif.title}</p>
                    <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {notif.created_date && format(new Date(notif.created_date), "d MMM 'à' HH:mm", { locale: fr })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Button onClick={handleLogout} variant="outline" className="w-full mt-6 rounded-xl h-12 text-red-600 border-red-200 hover:bg-red-50">
          <LogOut className="w-4 h-4 mr-2" />
          Déconnexion
        </Button>
      </div>

      <StudentBottomNav />
    </div>
  );
}