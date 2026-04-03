import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function TeachersSection() {
  const { data: teachers = [] } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => base44.entities.Teacher.filter({ is_active: true }, 'order', 50),
  });

  return (
    <section id="teachers" className="py-24 px-6 bg-gradient-to-b from-slate-900 to-slate-800 scroll-mt-16">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-white/10 text-white font-medium text-xs uppercase tracking-wider rounded-full mb-4">EXCELLENCE</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mt-3 mb-4">
            Corps Enseignant
          </h2>
          <p className="text-blue-200 text-lg">Des docteurs et pasteurs expérimentés venus de plusieurs nations</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {teachers.map((teacher, i) => (
            <motion.div
              key={teacher.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group"
            >
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  {teacher.profile_photo ? (
                    <img src={teacher.profile_photo} alt={teacher.name} className="w-full h-full object-cover" />
                  ) : (
                    <GraduationCap className="w-8 h-8 text-white" />
                  )}
                </div>
                <h3 className="text-white font-bold text-center text-sm leading-tight mb-1">
                  {teacher.title ? `${teacher.title} ` : ''}{teacher.name}
                </h3>
                <p className="text-blue-300 text-xs text-center">{teacher.country}</p>
                {teacher.speciality && <p className="text-blue-400/70 text-xs text-center mt-1">{teacher.speciality}</p>}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}