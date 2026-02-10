import React from 'react';
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
    <section className="py-20 px-4 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          {activeVideo.title && (
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-white">
              {activeVideo.title}
            </h2>
          )}
          {activeVideo.description && (
            <p className="text-blue-200 text-lg max-w-3xl mx-auto">
              {activeVideo.description}
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-30"></div>
          
          {/* Video container */}
          <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10">
            <video
              src={activeVideo.video_url}
              controls
              controlsList="nodownload"
              className="w-full h-full"
            >
              Votre navigateur ne supporte pas la lecture de vidéos.
            </video>
          </div>
        </motion.div>
      </div>
    </section>
  );
}