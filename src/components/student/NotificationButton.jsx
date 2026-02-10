import React from 'react';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function NotificationButton({ userEmail }) {
  const navigate = useNavigate();
  
  const { data: notifications = [] } = useQuery({
    queryKey: ['studentNotifications', userEmail],
    queryFn: () => base44.entities.Notification.filter({ recipient_email: userEmail, is_read: false }),
    enabled: !!userEmail,
    refetchInterval: 10000,
  });

  if (!userEmail) return null;

  return (
    <button
      onClick={() => navigate(createPageUrl('StudentNotifications'))}
      className="relative p-2.5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all"
    >
      <Bell className="w-5 h-5 text-blue-600" />
      {notifications.length > 0 && (
        <Badge className="absolute -top-1 -right-1 h-5 px-1.5 min-w-5 text-xs bg-red-500 text-white border-2 border-white">
          {notifications.length}
        </Badge>
      )}
    </button>
  );
}