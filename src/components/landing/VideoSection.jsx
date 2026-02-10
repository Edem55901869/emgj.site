import React from 'react';
import { Play } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';

export default function VideoSection() {
  const { data: videos = [] } = useQuery({
    queryKey: ['homeVideos'],
    queryFn: () => base44.entities.HomeVideo.filter({ is_active: true }),
  });

  const activeVideo = videos[0];

  if (!activeVideo) return null;

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-white via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.4) 2px, transparent 2px)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Decorative blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-slate-700 to-slate-900 text-white px-6 py-2.5 rounded-full text-sm font-bold mb-6 shadow-xl">
            <Play className="w-4 h-4" />
            Vidéo de présentation
          </div>
          
          {activeVideo.title && (
            <h2 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 bg-clip-text text-transparent">
              {activeVideo.title}
            </h2>
          )}
          {activeVideo.description && (
            <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
              {activeVideo.description}
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative group"
        >
          {/* Glow effect on hover */}
          <div className="absolute -inset-1 bg-gradient-to-r from-slate-600 via-slate-700 to-slate-800 rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
          
          {/* Video container */}
          <div className="relative aspect-video bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl overflow-hidden shadow-2xl ring-4 ring-slate-500/20 ring-offset-4">
            <video
              src={activeVideo.video_url}
              controls
              controlsList="nodownload"
              className="w-full h-full"
            >
              Votre navigateur ne supporte pas la lecture de vidéos.
            </video>
            
            {/* Subtle overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none"></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}