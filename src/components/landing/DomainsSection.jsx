import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, Globe, Sparkles, Briefcase, Heart, Crown } from 'lucide-react';

const domains = [
  { 
    name: 'Théologie', 
    icon: BookOpen, 
    desc: 'Étude approfondie des Écritures et de la doctrine chrétienne',
    levels: ['Discipolat', 'Brevet', 'Baccalauréat'],
    color: 'from-blue-500 to-cyan-500',
    bgGradient: 'bg-gradient-to-br from-blue-50 to-cyan-50'
  },
  { 
    name: 'Leadership et Administration', 
    icon: Crown, 
    desc: 'Former des leaders chrétiens efficaces et visionnaires',
    levels: ['Licence', 'Master', 'Doctorat'],
    color: 'from-purple-500 to-pink-500',
    bgGradient: 'bg-gradient-to-br from-purple-50 to-pink-50'
  },
  { 
    name: 'Missiologie', 
    icon: Globe, 
    desc: 'Équiper pour l\'évangélisation et les missions transculturell',
    levels: ['Licence', 'Master', 'Doctorat'],
    color: 'from-green-500 to-teal-500',
    bgGradient: 'bg-gradient-to-br from-green-50 to-teal-50'
  },
  { 
    name: 'École Prophétique', 
    icon: Sparkles, 
    desc: 'Développer et encadrer le don prophétique et la sensibilité spirituelle',
    levels: ['Brevet', 'Baccalauréat', 'Licence'],
    color: 'from-amber-500 to-orange-500',
    bgGradient: 'bg-gradient-to-br from-amber-50 to-orange-50'
  },
  { 
    name: 'Entrepreneuriat', 
    icon: Briefcase, 
    desc: 'Créer des entreprises selon les principes bibliques',
    levels: ['Licence', 'Master', 'Doctorat'],
    color: 'from-indigo-500 to-blue-500',
    bgGradient: 'bg-gradient-to-br from-indigo-50 to-blue-50'
  },
  { 
    name: 'Aumônerie', 
    icon: Heart, 
    desc: 'Accompagner spirituellement dans les hôpitaux, prisons et institutions',
    levels: ['Brevet', 'Baccalauréat', 'Licence'],
    color: 'from-red-500 to-rose-500',
    bgGradient: 'bg-gradient-to-br from-red-50 to-rose-50'
  },
  { 
    name: 'Ministère Apostolique', 
    icon: Users, 
    desc: 'Développer et implanter des œuvres apostoliques et églises',
    levels: ['Brevet', 'Baccalauréat', 'Licence'],
    color: 'from-slate-600 to-gray-700',
    bgGradient: 'bg-gradient-to-br from-slate-50 to-gray-100'
  },
];

const formations = ['Discipolat', 'Brevet', 'Baccalauréat', 'Licence', 'Master', 'Doctorat'];

export default function DomainsSection() {
  return (
    <section id="domaines" className="py-24 px-6 bg-gradient-to-b from-white via-blue-50/30 to-white scroll-mt-16">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-blue-600 text-white font-medium text-xs uppercase tracking-wider rounded-full mb-4">✨ NOS FORMATIONS D'EXCELLENCE</span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-3">
            7 Domaines de Formation
          </h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto text-lg">
            Des programmes académiques complets du Discipolat au Doctorat
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
              className={`group relative overflow-hidden rounded-2xl ${domain.bgGradient} border border-gray-200 p-6 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2`}
            >
              <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${domain.color} mb-4 shadow-lg`}>
                <domain.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{domain.name}</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">{domain.desc}</p>
              <div className="flex flex-wrap gap-1.5">
                {domain.levels.map(level => (
                  <span key={level} className="text-xs px-2.5 py-1 bg-white/80 backdrop-blur-sm rounded-full text-gray-700 font-medium border border-gray-200">
                    {level}
                  </span>
                ))}
              </div>
              <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/30 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl border border-gray-200 p-8 shadow-xl"
        >
          <div className="grid grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-3 shadow-lg">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">7</div>
              <div className="text-sm text-gray-600 font-medium">Domaines d'études</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">5000+</div>
              <div className="text-sm text-gray-600 font-medium">Étudiants formés</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">17</div>
              <div className="text-sm text-gray-600 font-medium">Pays représentés</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}