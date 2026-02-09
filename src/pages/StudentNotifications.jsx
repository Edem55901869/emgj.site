import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Bell, CheckCircle, AlertCircle, Info, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import StudentBottomNav from '../components/student/StudentBottomNav';

export default function StudentNotifications() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const adminView = localStorage.getItem('admin_student_view');
    if (adminView) {
      setUser({ email: 'admin@preview.emgj' });
      setLoading(false);
      return;
    }

    const u = await base44.auth.me();
    setUser(u);
    setLoading(false);
  };

  const isPreview = user?.email === 'admin@preview.emgj';

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => base44.entities.Notification.filter({ recipient_email: user?.email }),
    enabled: !!user && !isPreview,
    refetchInterval: 5000,
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { status: 'lu' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification supprimée');
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      for (const notif of notifications.filter(n => n.status === 'nouveau')) {
        await base44.entities.Notification.update(notif.id, { status: 'lu' });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Toutes les notifications marquées comme lues');
    },
  });

  const unreadCount = notifications.filter(n => n.status === 'nouveau').length;

  const getIcon = (type) => {
    switch(type) {
      case 'success': return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'warning': return <AlertCircle className="w-6 h-6 text-amber-500" />;
      default: return <Info className="w-6 h-6 text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24">
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-4 pt-12 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20" />
        <div className="flex items-center gap-3 mb-2 relative z-10">
          <Button onClick={() => navigate(createPageUrl('StudentMore'))} variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-blue-100 text-sm">{unreadCount} non lue(s)</p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-16 relative z-10">
        {unreadCount > 0 && (
          <Button 
            onClick={() => markAllReadMutation.mutate()} 
            disabled={markAllReadMutation.isPending}
            variant="outline" 
            size="sm" 
            className="w-full mb-4 rounded-xl bg-white hover:bg-gray-50"
          >
            {markAllReadMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Tout marquer comme lu
          </Button>
        )}

        {notifications.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">Aucune notification</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map(notif => (
              <div 
                key={notif.id} 
                onClick={() => notif.status === 'nouveau' && markReadMutation.mutate(notif.id)}
                className={`bg-white rounded-2xl p-4 transition-all cursor-pointer shadow-sm hover:shadow-md ${
                  notif.status === 'nouveau' ? 'ring-2 ring-blue-200' : 'border border-gray-100'
                }`}
              >
                <div className="flex items-start gap-4">
                  {getIcon(notif.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-bold text-gray-900">{notif.title}</p>
                      <Button 
                        onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(notif.id); }} 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-lg flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4 text-gray-400" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed mb-2">{notif.message}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-400">
                        {notif.created_date && format(new Date(notif.created_date), "d MMM 'à' HH:mm", { locale: fr })}
                      </p>
                      {notif.status === 'nouveau' && (
                        <Badge className="bg-blue-100 text-blue-700 text-xs">Nouveau</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <StudentBottomNav />
    </div>
  );
}