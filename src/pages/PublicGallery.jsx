import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, Image as ImageIcon, X, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Link } from 'react-router-dom';

export default function PublicGallery() {
  const [selectedPost, setSelectedPost] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['publicGalleryPosts'],
    queryFn: () => base44.entities.GalleryPost.filter({ status: 'publié' }, '-event_date')
  });

  const { data: allMedia = [] } = useQuery({
    queryKey: ['publicGalleryMedia'],
    queryFn: () => base44.entities.GalleryMedia.list()
  });

  const getPostMedia = (postId) => allMedia.filter(m => m.post_id === postId);

  const currentMedia = selectedPost ? getPostMedia(selectedPost.id) : [];

  const openLightbox = (index) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const prevImage = () => setLightboxIndex((i) => (i > 0 ? i - 1 : currentMedia.length - 1));
  const nextImage = () => setLightboxIndex((i) => (i < currentMedia.length - 1 ? i + 1 : 0));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-700 to-purple-800 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6 text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </Link>
          <h1 className="text-4xl font-black mb-3">Galerie d'Événements</h1>
          <p className="text-blue-100 text-lg">Découvrez nos moments forts en photos</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow animate-pulse">
                <div className="aspect-video bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">Aucun album disponible pour le moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => {
              const media = getPostMedia(post.id);
              return (
                <div
                  key={post.id}
                  className="bg-white rounded-2xl overflow-hidden shadow hover:shadow-xl transition-all cursor-pointer group"
                  onClick={() => setSelectedPost(post)}
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
                        <ImageIcon className="w-12 h-12 text-blue-300" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                      <span className="text-white text-xs font-medium">{media.length} photo{media.length > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{post.event_name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <Calendar className="w-3.5 h-3.5" />
                      {format(new Date(post.event_date), 'dd MMMM yyyy', { locale: fr })}
                    </div>
                    <Badge variant="outline" className="text-xs border-gray-200 text-gray-600">{post.event_type}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Album Dialog */}
      <Dialog open={!!selectedPost} onOpenChange={(open) => !open && setSelectedPost(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white p-0">
          {selectedPost && (
            <div>
              {/* Album Header */}
              <div className="bg-gradient-to-br from-blue-700 to-purple-800 text-white p-6">
                <button
                  onClick={() => setSelectedPost(null)}
                  className="flex items-center gap-2 text-white/70 hover:text-white text-sm mb-4 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour aux albums
                </button>
                <h2 className="text-2xl font-black mb-1">{selectedPost.event_name}</h2>
                <div className="flex items-center gap-3 text-blue-100 text-sm flex-wrap">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {format(new Date(selectedPost.event_date), 'dd MMMM yyyy', { locale: fr })}
                  </span>
                  <span>•</span>
                  <span>{selectedPost.event_type}</span>
                  <span>•</span>
                  <span>{currentMedia.length} photo{currentMedia.length > 1 ? 's' : ''}</span>
                </div>
                {selectedPost.description && (
                  <p className="mt-3 text-blue-100 text-sm">{selectedPost.description}</p>
                )}
              </div>

              {/* Photos Grid */}
              <div className="p-6">
                {currentMedia.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Aucune photo dans cet album</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {currentMedia.map((media, idx) => (
                      <div
                        key={media.id}
                        className="aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => openLightbox(idx)}
                      >
                        {media.media_type === 'photo' ? (
                          <img src={media.media_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <video src={media.media_url} className="w-full h-full object-cover" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Lightbox */}
      {lightboxIndex !== null && currentMedia[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button onClick={(e) => { e.stopPropagation(); closeLightbox(); }} className="absolute top-4 right-4 text-white/70 hover:text-white">
            <X className="w-8 h-8" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute left-4 text-white/70 hover:text-white p-2">
            <ChevronLeft className="w-10 h-10" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-4 text-white/70 hover:text-white p-2">
            <ChevronRight className="w-10 h-10" />
          </button>
          <img
            src={currentMedia[lightboxIndex].media_url}
            alt=""
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-4 text-white/60 text-sm">
            {lightboxIndex + 1} / {currentMedia.length}
          </div>
        </div>
      )}
    </div>
  );
}