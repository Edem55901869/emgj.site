import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6988dd24f34fbffabf6f6551/801d201e6_IMG-20260212-WA0014.jpg',
    title: 'École Missionnaire Génération Joël (EMGJ)',
    subtitle: 'Former, équiper et envoyer pour l\'œuvre de Dieu'
  },
  {
    image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6988dd24f34fbffabf6f6551/c078b0bdc_IMG-20260212-WA0013.jpg',
    title: 'Formations Théologiques & Pastorales',
    subtitle: 'École des Évangélistes, Disciples Engagés, Ministère Pastoral'
  },
  {
    image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6988dd24f34fbffabf6f6551/0f1897b65_IMG-20260212-WA0010.jpg',
    title: 'Contactez-Nous',
    subtitle: 'Faculté Théologique Génération Joël - Lomé, Togo'
  },
  {
    image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6988dd24f34fbffabf6f6551/ca0f91d98_IMG-20260212-WA0011.jpg',
    title: 'École Prophétique',
    subtitle: 'Brevet, Baccalauréat, Licence, Master, Doctorat'
  },
  {
    image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6988dd24f34fbffabf6f6551/76d606d8e_IMG-20260212-WA0012.jpg',
    title: 'Diplômes Académiques Reconnus',
    subtitle: 'Licence, Master et Doctorat en Théologie, Leadership et Missiologie'
  }
];

export default function CarouselSection() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const goTo = (dir) => {
    setCurrent((prev) => (prev + dir + slides.length) % slides.length);
  };

  return (
    <section id="about" className="py-24 px-6 bg-gradient-to-b from-white to-blue-50/30 scroll-mt-16">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium text-xs uppercase tracking-wider rounded-full mb-4">🎓 Présence Internationale</span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-3 mb-4">Présence Internationale</h2>
          <p className="text-gray-600 text-lg">Nos étudiants viennent de 17 pays différents</p>
        </div>

        <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/10 aspect-[9/16] md:aspect-[3/4] max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0"
            >
              <img
                src={slides[current].image}
                alt={slides[current].title}
                className="w-full h-full object-contain bg-gradient-to-br from-blue-50 to-purple-50"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                <motion.h3
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl md:text-4xl font-bold text-white mb-2"
                >
                  {slides[current].title}
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-white/70 text-lg"
                >
                  {slides[current].subtitle}
                </motion.p>
              </div>
            </motion.div>
          </AnimatePresence>

          <button
            onClick={() => goTo(-1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => goTo(1)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === current ? 'w-8 bg-white' : 'w-3 bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}