import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, Globe, Sparkles, Briefcase, Heart, Crown } from 'lucide-react';

const domains = [
  { name: 'THÉOLOGIE', icon: BookOpen, desc: 'Approfondissez votre connaissance de la Parole de Dieu', color: 'from-blue-500 to-blue-700' },
  { name: 'LEADERSHIP', icon: Crown, desc: 'Développez vos compétences de leader chrétien', color: 'from-indigo-500 to-indigo-700' },
  { name: 'MISSIOLOGIE', icon: Globe, desc: 'Préparez-vous pour la mission mondiale', color: 'from-sky-500 to-sky-700' },
  { name: 'PROPHÉTIQUE', icon: Sparkles, desc: 'Cultivez le don prophétique avec sagesse', color: 'from-violet-500 to-violet-700' },
  { name: 'ENTREPRENEURIAT', icon: Briefcase, desc: 'Entreprenez avec une vision biblique', color: 'from-cyan-500 to-cyan-700' },
  { name: 'AUMÔNERIE', icon: Heart, desc: 'Accompagnez et soutenez les âmes en besoin', color: 'from-blue-400 to-blue-600' },
  { name: 'MINISTÈRE APOSTOLIQUE', icon: Users, desc: 'Marchez dans l\'appel apostolique', color: 'from-slate-500 to-slate-700' },
];

const formations = ['Discipola', 'Brevet', 'Baccalauréat', 'Licence', 'Master', 'Doctorat'];

export default function DomainsSection() {
  return (
    <section id="domaines" className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">Nos domaines</span>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mt-3">
            7 Domaines de Formation
          </h2>
          <p className="text-gray-500 mt-4 max-w-xl mx-auto">
            Choisissez votre voie parmi nos domaines d'excellence et progressez à votre rythme.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {domains.map((domain, i) => (
            <motion.div
              key={domain.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 p-6 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500 hover:-translate-y-1"
            >
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${domain.color} mb-4`}>
                <domain.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{domain.name}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{domain.desc}</p>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.div>
          ))}
        </div>

        {/* Formation Types */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">Types de formation</span>
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mt-3 mb-8">
            6 Niveaux de Progression
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {formations.map((f, i) => (
              <motion.div
                key={f}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative px-6 py-3 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 text-blue-800 font-medium text-sm hover:shadow-md transition-all"
              >
                <span className="absolute -top-2 -left-1 text-xs bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {i + 1}
                </span>
                {f}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}