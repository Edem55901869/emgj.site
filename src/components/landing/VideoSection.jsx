import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

export default function VideoSection() {
  const { data: videos = [] } = useQuery({
    queryKey: ['homeVideos'],
    queryFn: () => base44.entities.HomeVideo.filter({ is_active: true }),
  });

  const activeVideo = videos[0];

  if (!activeVideo) return null;

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-blue-50 via-white to-red-50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          {activeVideo.title && (
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 bg-clip-text text-transparent">
                {activeVideo.title}
              </span>
            </h2>
          )}
          {activeVideo.description && (
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              {activeVideo.description}
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white group"
        >
          {/* Overlay avec effet */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-red-600/20 group-hover:opacity-0 transition-opacity duration-300 z-10 pointer-events-none" />
          
          {/* Icône Play décorative */}
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-20 h-20 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center">
              <Play className="w-10 h-10 text-blue-600 ml-1" />
            </div>
          </div>

          {/* Vidéo */}
          <div className="aspect-video bg-black">
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