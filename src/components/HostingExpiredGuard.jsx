import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import moment from 'moment';

export default function HostingExpiredGuard({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);

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

  const isExpired = activePlan && moment().isAfter(moment(activePlan.end_date));

  useEffect(() => {
    if (isAdmin && isExpired && !location.pathname.includes('AdminHosting')) {
      navigate(createPageUrl('AdminHosting'));
    }
  }, [isAdmin, isExpired, location.pathname, navigate]);

  return <>{children}</>;
}