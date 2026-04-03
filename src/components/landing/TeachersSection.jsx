import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, MapPin } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function TeachersSection() {
  const { data: teachers = [] } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => base44.entities.Teacher.filter({ is_active: true }, 'order', 50),
  });

  const gradients = [
    'from-blue-500 to-indigo-600',
    'from-purple-500 to-pink-600',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-red-500',
    'from-cyan-500 to-blue-600',
    'from-violet-500 to-purple-600',
    'from-rose-500 to-pink-600',
    'from-amber-500 to-orange-600',
    'from-teal-500 to-emerald-600',
  ];

  return (
    <section id="teachers" className="py-28 px-6 bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 scroll-mt-16 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/10 rounded-full mb-6">
            <GraduationCap className="w-4 h-4 text-blue-400" />
            <span className="text-blue-300 font-semibold text-xs uppercase tracking-widest">Corps Enseignant</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-5 leading-tight">
            Nos <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Professeurs</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Des docteurs et pasteurs expérimentés venus de plusieurs nations pour former la prochaine génération
          </p>
        </motion.div>

        {/* Teachers Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {teachers.map((teacher, i) => (
            <motion.div
              key={teacher.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.5 }}
            >
              <div className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/25 rounded-3xl p-5 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/20 cursor-default">
                {/* Glow effect on hover */}
                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${gradients[i % gradients.length]} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                {/* Photo */}
                <div className="relative mx-auto mb-4">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradients[i % gradients.length]} p-0.5 mx-auto shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                    <div className="w-full h-full rounded-2xl overflow-hidden bg-slate-800">
                      {teacher.profile_photo ? (
                        <img
                          src={teacher.profile_photo}
                          alt={teacher.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${gradients[i % gradients.length]} flex items-center justify-center`}>
                          <span className="text-white font-black text-2xl">
                            {teacher.name?.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Title badge */}
                  {teacher.title && (
                    <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-gradient-to-r ${gradients[i % gradients.length]} rounded-full text-white text-xs font-bold shadow-lg whitespace-nowrap`}>
                      {teacher.title}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="mt-3 relative z-10">
                  <h3 className="text-white font-bold text-xs leading-tight mb-2 line-clamp-2">
                    {teacher.name}
                  </h3>
                  <div className="flex items-center justify-center gap-1 text-slate-400">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="text-xs">{teacher.country}</span>
                  </div>
                  {teacher.speciality && (
                    <p className="text-slate-500 text-xs mt-1 line-clamp-1">{teacher.speciality}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom stats */}
        {teachers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-16 flex flex-wrap justify-center gap-8"
          >
            {[
              { value: `${teachers.length}+`, label: 'Enseignants qualifiés' },
              { value: `${[...new Set(teachers.map(t => t.country))].length}+`, label: 'Nations représentées' },
              { value: '7+', label: 'Domaines d\'enseignement' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{stat.value}</p>
                <p className="text-slate-500 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}