import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Pasteur Emmanuel K.',
    role: 'Diplômé en Théologie',
    text: 'EMGJ a transformé ma compréhension des Écritures. Les enseignements sont profonds, bien structurés et ancrés dans la Parole de Dieu.',
    avatar: 'EK'
  },
  {
    name: 'Sœur Marie-Claire A.',
    role: 'Étudiante en Missiologie',
    text: 'Grâce à cette école, j\'ai pu approfondir mon appel missionnaire. La qualité des cours et l\'accompagnement sont exceptionnels.',
    avatar: 'MA'
  },
  {
    name: 'Frère David O.',
    role: 'Étudiant en Leadership',
    text: 'La formation en leadership m\'a donné les outils nécessaires pour mieux servir dans mon église locale. Je recommande vivement EMGJ.',
    avatar: 'DO'
  }
];

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 px-6 bg-white" aria-labelledby="testimonials-title">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">Témoignages</span>
          <h2 id="testimonials-title" className="text-3xl md:text-5xl font-bold text-gray-900 mt-3">
            Ce qu'ils en disent
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative bg-gradient-to-br from-blue-50/50 to-white rounded-2xl p-8 border border-blue-100/50 hover:shadow-lg transition-all duration-300"
            >
              <Quote className="w-8 h-8 text-blue-200 mb-4" />
              <p className="text-gray-600 leading-relaxed mb-6 text-sm">{t.text}</p>
              <div className="flex items-center gap-2 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-bold">
                  {t.avatar}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                  <div className="text-gray-500 text-xs">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}