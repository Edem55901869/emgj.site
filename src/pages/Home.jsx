import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import HeroSection from '../components/landing/HeroSection';

import DomainsSection from '../components/landing/DomainsSection';
import CarouselSection from '../components/landing/CarouselSection';
import TeachersSection from '../components/landing/TeachersSection';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import ContactSection from '../components/landing/ContactSection';
import FooterSection from '../components/landing/FooterSection';

async function trackVisit() {
  try {
    // Détection appareil
    const ua = navigator.userAgent;
    const device_type = /tablet|ipad/i.test(ua) ? 'tablet' : /mobile|android|iphone/i.test(ua) ? 'mobile' : 'desktop';

    // Géolocalisation via IP (API gratuite, pas de clé requise)
    let country = 'Inconnu';
    try {
      const geo = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(4000) });
      const data = await geo.json();
      country = data.country_name || data.country || 'Inconnu';
    } catch {}

    await base44.entities.SiteVisitor.create({
      country,
      device_type,
      page_visited: 'Accueil',
    });
  } catch {}
}

export default function Home() {
  const { data: videos = [] } = useQuery({
    queryKey: ['homeVideos'],
    queryFn: () => base44.entities.HomeVideo.list(),
  });

  const activeVideo = videos.find(v => v.is_active);

  useEffect(() => {
    localStorage.removeItem('admin_student_view');
    // Tracker la visite (utilisateurs non inscrits inclus)
    trackVisit();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      {activeVideo && (
        <section className="py-16 px-4 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-5xl mx-auto">
            {activeVideo.title && (
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">{activeVideo.title}</h2>
            )}
            {activeVideo.description && (
              <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">{activeVideo.description}</p>
            )}
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <video
                src={activeVideo.video_url}
                controls
                className="w-full"
              />
            </div>
          </div>
        </section>
      )}

      <DomainsSection />
      <CarouselSection />
      <TeachersSection />
      <TestimonialsSection />
      <ContactSection />
      <FooterSection />
    </div>
  );
}