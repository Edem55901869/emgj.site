import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Image as ImageIcon, Video, Loader2, X, Search } from 'lucide-react';
import StudentBottomNav from '../components/student/StudentBottomNav';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function StudentGallery() {
  const [selectedPost, setSelectedPost] = useState(null);
  const [openView, setOpenView] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [openMedia, setOpenMedia] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['galleryPosts'],
    queryFn: async () => {
      const allPosts = await base44.entities.GalleryPost.filter({ status: 'publié' }, '-created_date');
      return allPosts;
    }
  });

  const { data: allMedia = [] } = useQuery({
    queryKey: ['galleryMedia'],
    queryFn: () => base44.entities.GalleryMedia.list()
  });

  const getPostMedia = (postId) => {
    return allMedia.filter(m => m.post_id === postId);
  };

  const openMediaViewer = (media) => {
    setSelectedMedia(media);
    setOpenMedia(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-4 pt-8 pb-6">
        <h1 className="text-2xl font-bold text-white mb-4">Galerie</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Rechercher un événement..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {posts.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune publication</h3>
              <p className="text-gray-600">Les publications apparaîtront ici</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.filter(post => 
              post.event_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              post.event_type.toLowerCase().includes(searchQuery.toLowerCase())
            ).map((post) => {
              const media = getPostMedia(post.id);
              return (
                <Card 
                  key={post.id} 
                  className="overflow-hidden hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1"
                  onClick={() => {
                    setSelectedPost(post);
                    setOpenView(true);
                  }}
                >
                  <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 relative overflow-hidden">
                    {post.media_type === 'photo' && media[0] ? (
                      <img 
                        src={media[0].media_url} 
                        alt={post.event_name} 
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        {post.media_type === 'photo' ? (
                          <ImageIcon className="w-16 h-16 text-blue-400" />
                        ) : (
                          <Video className="w-16 h-16 text-purple-400" />
                        )}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <Badge className="bg-white/90 text-gray-900 backdrop-blur-sm">
                        {media.length} {post.media_type === 'photo' ? 'photo(s)' : 'vidéo(s)'}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{post.event_name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(post.event_date), 'dd MMMM yyyy', { locale: fr })}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {post.event_type}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* View Dialog */}
      <Dialog open={openView} onOpenChange={setOpenView}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPost?.event_name}</DialogTitle>
          </DialogHeader>
          {selectedPost && (
            <div className="space-y-4 mt-4">
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline">{selectedPost.event_type}</Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(selectedPost.event_date), 'dd MMMM yyyy', { locale: fr })}
                </Badge>
              </div>

              {selectedPost.description && (
                <p className="text-gray-700">{selectedPost.description}</p>
              )}

              <div>
                <h4 className="font-medium mb-3 text-gray-900">
                  {selectedPost.media_type === 'photo' ? 'Photos' : 'Vidéos'} 
                  <span className="text-gray-500 text-sm ml-2">
                    ({getPostMedia(selectedPost.id).length})
                  </span>
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                  {getPostMedia(selectedPost.id).map((media, index) => (
                    <div 
                      key={media.id} 
                      className="aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 cursor-pointer group relative transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-xl"
                      onClick={() => openMediaViewer(media)}
                    >
                      {media.media_type === 'photo' ? (
                        <>
                          <img 
                            src={media.media_url} 
                            alt="" 
                            className="w-full h-full object-cover" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="absolute bottom-3 left-3 right-3 text-white">
                              <p className="text-xs font-medium">Photo {index + 1}</p>
                              <p className="text-[10px] text-white/70">Cliquez pour agrandir</p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="relative w-full h-full">
                          <video src={media.media_url} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
                            <div className="text-center text-white">
                              <Video className="w-10 h-10 mx-auto mb-2" />
                              <p className="text-xs font-medium">Vidéo {index + 1}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Media Viewer Dialog - Fullscreen */}
      <Dialog open={openMedia} onOpenChange={setOpenMedia}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 backdrop-blur-xl border-0">
          <div className="relative w-full h-[95vh]">
            <button
              onClick={() => setOpenMedia(false)}
              className="absolute top-6 right-6 z-50 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-all hover:scale-110 shadow-2xl"
            >
              <X className="w-6 h-6" />
            </button>
            
            {selectedMedia && (
              <div className="w-full h-full flex items-center justify-center p-8">
                {selectedMedia.media_type === 'photo' ? (
                  <div className="relative max-w-full max-h-full">
                    <img 
                      src={selectedMedia.media_url} 
                      alt="" 
                      className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-300" 
                    />
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full">
                      <p className="text-white text-sm font-medium">📸 Photo HD</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative max-w-full max-h-full">
                    <video 
                      src={selectedMedia.media_url} 
                      controls 
                      autoPlay
                      className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <StudentBottomNav />
    </div>
  );
}