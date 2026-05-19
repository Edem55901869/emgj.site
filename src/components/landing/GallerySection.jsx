import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Calendar, Image as ImageIcon, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function GallerySection() {
  const { data: posts = [] } = useQuery({
    queryKey: ['publicGalleryPostsHome'],
    queryFn: () => base44.entities.GalleryPost.filter({ status: 'publié' }, '-event_date', 6)
  });

  const { data: allMedia = [] } = useQuery({
    queryKey: ['publicGalleryMediaHome'],
    queryFn: () => base44.entities.GalleryMedia.list()
  });

  const getPostMedia = (postId) => allMedia.filter(m => m.post_id === postId);

  if (posts.length === 0) return null;

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-black text-gray-900 mb-2">Galerie d'Événements</h2>
            <p className="text-gray-500">Nos moments forts en images</p>
          </div>
          <Link
            to="/PublicGallery"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
          >
            Voir tous les albums
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map((post) => {
            const media = getPostMedia(post.id);
            return (
              <Link
                key={post.id}
                to="/PublicGallery"
                className="bg-gray-50 rounded-2xl overflow-hidden hover:shadow-lg transition-all group border border-gray-100"
              >
                <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 relative overflow-hidden">
                  {media[0] ? (
                    <img
                      src={media[0].media_url}
                      alt={post.event_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ImageIcon className="w-10 h-10 text-blue-300" />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-3">
                    <span className="text-white text-xs font-medium">{media.length} photo{media.length > 1 ? 's' : ''}</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{post.event_name}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(post.event_date), 'dd MMM yyyy', { locale: fr })}
                    <span className="text-gray-300">•</span>
                    <span>{post.event_type}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}