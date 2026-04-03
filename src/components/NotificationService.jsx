import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

const playNotificationSound = () => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = 800;
  oscillator.type = 'sine';
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
};

const requestNotificationPermission = async () => {
  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission();
  }
};

export default function NotificationService({ userEmail, enabled = true }) {
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', userEmail],
    queryFn: () => base44.entities.Notification.filter({ recipient_email: userEmail }),
    enabled: !!userEmail && enabled,
    refetchInterval: 3000,
  });

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    if (!enabled || !userEmail) return;

    const lastNotifId = localStorage.getItem('last_notif_id');
    const newNotifications = notifications.filter(n => 
      !n.is_read && (!lastNotifId || n.id > lastNotifId)
    );

    if (newNotifications.length > 0) {
      const latestNotif = newNotifications[0];
      
      // Son de notification
      playNotificationSound();

      // Notification push (même hors application)
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(latestNotif.title, {
          body: latestNotif.message,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: latestNotif.id,
        });
      }

      localStorage.setItem('last_notif_id', latestNotif.id);
    }
  }, [notifications, userEmail, enabled]);

  return null;
}