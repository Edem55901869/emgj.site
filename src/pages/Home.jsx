import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import HeroSection from '../components/landing/HeroSection';
import VideoSection from '../components/landing/VideoSection';
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
  useEffect(() => {
    localStorage.removeItem('admin_student_view');
    // Tracker la visite (utilisateurs non inscrits inclus)
    trackVisit();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <VideoSection />
      <DomainsSection />
      <CarouselSection />
      <TeachersSection />
      <TestimonialsSection />
      <ContactSection />
      <FooterSection />
    </div>
  );
}