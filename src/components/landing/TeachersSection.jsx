import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';

const teachers = [
  { name: 'Dr NESTOR NKOSIKA (VODA)', country: '(CAMEROUN)', image: 'https://i.pravatar.cc/150?img=12' },
  { name: 'Dr GERMAIN NOUDOFININ (ADJIMOTI)', country: '(BENIN)', image: 'https://i.pravatar.cc/150?img=13' },
  { name: 'Dr CORINE LUKALA (CAMEROUN)', country: '(RDC)', image: 'https://i.pravatar.cc/150?img=9' },
  { name: 'Dr DJADJOGBO EDOUARD (CAMEROUN)', country: '(BENIN)', image: 'https://i.pravatar.cc/150?img=14' },
  { name: 'Dr NYANTEU PARAISO ELVIS (NYANTEU)', country: '(CAMEROUN)', image: 'https://i.pravatar.cc/150?img=15' },
  { name: 'Dr BABA WILFRIED (BENIN)', country: '(CAMEROUN)', image: 'https://i.pravatar.cc/150?img=16' },
  { name: 'Dr TCHENDJE JÉRÉMIE (BEMBE)', country: '(BENIN)', image: 'https://i.pravatar.cc/150?img=17' },
  { name: 'Dr TCHOSSE OBEE (BENIN)', country: '(BENIN)', image: 'https://i.pravatar.cc/150?img=18' },
  { name: 'Dr DESIRE JEAN HUBERT (HAITI)', country: '(HAITI)', image: 'https://i.pravatar.cc/150?img=19' },
];

export default function TeachersSection() {
  return (
    <section className="py-24 px-6 bg-gradient-to-b from-slate-900 to-slate-800">
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
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group"
            >
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-white font-bold text-center text-sm leading-tight mb-1">
                  {teacher.name}
                </h3>
                <p className="text-blue-300 text-xs text-center">{teacher.country}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}