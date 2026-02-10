import React from 'react';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function NotificationBadge({ userEmail }) {
  const { data: notifications = [] } = useQuery({
    queryKey: ['studentNotifications', userEmail],
    queryFn: () => base44.entities.Notification.filter({ recipient_email: userEmail, is_read: false }),
    enabled: !!userEmail,
    refetchInterval: 10000,
  });

  if (!userEmail || notifications.length === 0) return null;

  return (
    <Link to={createPageUrl('StudentNotifications')} className="fixed top-4 right-4 z-50">
      <button className="relative p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110">
        <Bell className="w-5 h-5 text-blue-600" />
        {notifications.length > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 px-2 min-w-5 text-xs bg-red-500 text-white border-2 border-white">
            {notifications.length}
          </Badge>
        )}
      </button>
    </Link>
  );
}