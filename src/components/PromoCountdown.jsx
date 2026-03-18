import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function PromoCountdown({ endDate }) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!endDate) return;

    const calculateTimeLeft = () => {
      const difference = new Date(endDate) - new Date();
      
      if (difference <= 0) {
        setTimeLeft(null);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  if (!timeLeft) return null;

  return (
    <div className="flex items-center gap-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-xl px-3 py-2">
      <Clock className="w-4 h-4 text-red-400 animate-pulse" />
      <div className="flex items-center gap-1.5 text-xs font-mono font-bold">
        {timeLeft.days > 0 && (
          <>
            <div className="flex flex-col items-center">
              <span className="text-red-300 text-sm">{String(timeLeft.days).padStart(2, '0')}</span>
              <span className="text-red-400/60 text-[9px] uppercase">j</span>
            </div>
            <span className="text-red-400">:</span>
          </>
        )}
        <div className="flex flex-col items-center">
          <span className="text-red-300 text-sm">{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className="text-red-400/60 text-[9px] uppercase">h</span>
        </div>
        <span className="text-red-400">:</span>
        <div className="flex flex-col items-center">
          <span className="text-red-300 text-sm">{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span className="text-red-400/60 text-[9px] uppercase">m</span>
        </div>
        <span className="text-red-400">:</span>
        <div className="flex flex-col items-center">
          <span className="text-red-300 text-sm">{String(timeLeft.seconds).padStart(2, '0')}</span>
          <span className="text-red-400/60 text-[9px] uppercase">s</span>
        </div>
      </div>
    </div>
  );
}