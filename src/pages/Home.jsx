import React from 'react';
import HeroSection from '../components/landing/HeroSection';
import DomainsSection from '../components/landing/DomainsSection';
import CarouselSection from '../components/landing/CarouselSection';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import ContactSection from '../components/landing/ContactSection';
import FooterSection from '../components/landing/FooterSection';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <DomainsSection />
      <CarouselSection />
      <TestimonialsSection />
      <ContactSection />
      <FooterSection />
    </div>
  );
}