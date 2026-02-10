import React, { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import moment from 'moment';
import 'moment/locale/fr';
moment.locale('fr');

export default function HostingBanner() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const adminData = localStorage.getItem('emgj_admin');
    setIsAdmin(!!adminData);
  }, []);

  const { data: hostingPlans = [] } = useQuery({
    queryKey: ['hostingPlans'],
    queryFn: () => base44.entities.HostingPlan.list(),
    enabled: isAdmin,
  });

  const activePlan = hostingPlans.find(p => p.is_active);

  const getDaysRemaining = () => {
    if (!activePlan) return null;
    const today = moment();
    const endDate = moment(activePlan.end_date);
    return endDate.diff(today, 'days');
  };

  const daysRemaining = getDaysRemaining();

  if (!isAdmin || dismissed || daysRemaining === null || daysRemaining > 30) {
    return null;
  }

  const getMessage = () => {
    if (daysRemaining < 0) {
      return {
        text: `🚨 HÉBERGEMENT EXPIRÉ ! Votre plateforme risque d'être désactivée. Renouvelez immédiatement.`,
        color: 'from-red-600 to-red-700',
        urgent: true
      };
    }
    if (daysRemaining === 0) {
      return {
        text: `⚠️ DERNIER JOUR ! Votre hébergement expire aujourd'hui. Action requise maintenant.`,
        color: 'from-red-600 to-orange-600',
        urgent: true
      };
    }
    if (daysRemaining <= 7) {
      return {
        text: `🔴 URGENT : Plus que ${daysRemaining} jour${daysRemaining > 1 ? 's' : ''} avant expiration ! Renouvelez maintenant.`,
        color: 'from-red-500 to-red-600',
        urgent: true
      };
    }
    if (daysRemaining <= 30) {
      return {
        text: `⏰ Attention : ${daysRemaining} jours avant expiration de votre hébergement. Pensez à renouveler.`,
        color: 'from-orange-500 to-red-500',
        urgent: false
      };
    }
  };

  const message = getMessage();

  return (
    <div className={`fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r ${message.color} shadow-2xl ${message.urgent ? 'animate-pulse' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <AlertTriangle className={`w-6 h-6 text-white flex-shrink-0 ${message.urgent ? 'animate-bounce' : ''}`} />
            <p className="text-white font-bold text-sm md:text-base">
              {message.text}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link to={createPageUrl('AdminHosting')}>
              <button className="bg-white text-red-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-100 transition-colors">
                Renouveler
              </button>
            </Link>
            <button 
              onClick={() => setDismissed(true)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}