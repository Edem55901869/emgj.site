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
    const u = await base44.auth.me();
    setUser(u);
    setLoading(false);
  };

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => base44.entities.Notification.filter({ recipient_email: user?.email }),
    enabled: !!user,
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
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-amber-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
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
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-4 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <Button onClick={() => navigate(createPageUrl('StudentMore'))} variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-white flex-1">Notifications</h1>
          {unreadCount > 0 && (
            <Badge className="bg-red-500 text-white">{unreadCount}</Badge>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-2">
        {unreadCount > 0 && (
          <Button 
            onClick={() => markAllReadMutation.mutate()} 
            disabled={markAllReadMutation.isPending}
            variant="outline" 
            size="sm" 
            className="w-full mb-4 rounded-xl"
          >
            {markAllReadMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Tout marquer comme lu
          </Button>
        )}

        {notifications.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">Aucune notification</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(notif => (
              <div 
                key={notif.id} 
                onClick={() => notif.status === 'nouveau' && markReadMutation.mutate(notif.id)}
                className={`bg-white rounded-xl border p-4 transition-all cursor-pointer ${
                  notif.status === 'nouveau' ? 'border-blue-200 shadow-sm' : 'border-gray-100'
                }`}
              >
                <div className="flex items-start gap-3">
                  {getIcon(notif.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-gray-900 text-sm">{notif.title}</p>
                      <Button 
                        onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(notif.id); }} 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 rounded-lg flex-shrink-0"
                      >
                        <Trash2 className="w-3 h-3 text-gray-400" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">{notif.message}</p>
                    <div className="flex items-center gap-2 mt-2">
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