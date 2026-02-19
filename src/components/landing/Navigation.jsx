import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';

const navItems = [
  { label: 'Accueil', href: '#hero' },
  { label: 'Formations', href: '#domaines' },
  { label: 'À propos', href: '#about' },
  { label: 'Enseignants', href: '#teachers' },
  { label: 'Témoignages', href: '#testimonials' },
];

export default function Navigation() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollTo = (id) => {
    const element = document.querySelector(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setMobileOpen(false);
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button 
              onClick={() => scrollTo('#hero')}
              aria-label="Retour à l'accueil - École Missionnaire Génération Joël"
              className="flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                <GraduationCap className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
              <div className="hidden sm:block">
                <div className="font-bold text-gray-900 text-sm leading-tight">EMGJ</div>
                <div className="text-xs text-gray-500">Génération Joël</div>
              </div>
            </button>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => scrollTo(item.href)}
                  aria-label={`Naviguer vers ${item.label}`}
                  className="px-4 py-3 min-h-[44px] text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  {item.label}
                </button>
              ))}
              <Button
                onClick={() => navigate(createPageUrl('Contact'))}
                aria-label="Nous contacter"
                className="ml-2 min-h-[44px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl"
              >
                Contact
              </Button>
              <Button
                onClick={() => navigate(createPageUrl('Connexion'))}
                variant="outline"
                aria-label="Se connecter à votre compte"
                className="ml-2 min-h-[44px] rounded-xl"
              >
                Se connecter
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={mobileOpen}
              className="md:hidden p-3 min-h-[44px] min-w-[44px] rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center"
            >
              {mobileOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-white border-t border-gray-200"
          >
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => scrollTo(item.href)}
                  aria-label={`Naviguer vers ${item.label}`}
                  className="block w-full text-left px-4 py-3 min-h-[44px] text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  {item.label}
                </button>
              ))}
              <Button
                onClick={() => { navigate(createPageUrl('Contact')); setMobileOpen(false); }}
                aria-label="Nous contacter"
                className="w-full min-h-[44px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl mt-2"
              >
                Contact
              </Button>
              <Button
                onClick={() => { navigate(createPageUrl('Connexion')); setMobileOpen(false); }}
                variant="outline"
                aria-label="Se connecter à votre compte"
                className="w-full min-h-[44px] rounded-xl"
              >
                Se connecter
              </Button>
            </div>
          </motion.div>
        )}
      </nav>
      <div className="h-16" /> {/* Spacer */}
    </>
  );
}