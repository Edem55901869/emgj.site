import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1200&q=80',
    title: 'Un cadre d\'apprentissage inspirant',
    subtitle: 'Formez-vous dans un environnement dédié à l\'excellence spirituelle'
  },
  {
    image: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1200&q=80',
    title: 'Des enseignants qualifiés',
    subtitle: 'Apprenez auprès de pasteurs et docteurs expérimentés'
  },
  {
    image: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=1200&q=80',
    title: 'Une communauté mondiale',
    subtitle: 'Rejoignez des étudiants du monde entier dans la foi'
  },
  {
    image: 'https://images.unsplash.com/photo-1529390079861-591de354faf5?w=1200&q=80',
    title: 'Formation pratique et spirituelle',
    subtitle: 'Alliez connaissance théorique et expérience pratique du ministère'
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
    <section className="py-24 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">Notre établissement</span>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mt-3">Découvrez EMGJ</h2>
        </div>

        <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/10 aspect-[16/7]">
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
                className="w-full h-full object-cover"
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