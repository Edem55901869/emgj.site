import React, { useEffect } from 'react';
import HeroSection from '../components/landing/HeroSection';
import VideoSection from '../components/landing/VideoSection';
import DomainsSection from '../components/landing/DomainsSection';
import CarouselSection from '../components/landing/CarouselSection';
import TeachersSection from '../components/landing/TeachersSection';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import ContactSection from '../components/landing/ContactSection';
import FooterSection from '../components/landing/FooterSection';

export default function Home() {
  useEffect(() => {
    // Désactiver le mode prévisualisation admin sur la page d'accueil
    localStorage.removeItem('admin_student_view');
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