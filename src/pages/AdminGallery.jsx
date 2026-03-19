import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Upload, Image as ImageIcon, Video, Calendar, Loader2, X, Trash2, Edit, Search } from 'lucide-react';
import AdminTopNav from '../components/admin/AdminTopNav';
import AdminGuard from '../components/admin/AdminGuard';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const EVENT_TYPES = [
  'Cérémonie de remise de diplômes',
  'Conférence',
  'Culte',
  'Sortie académique',
  'Séminaire',
  'Retraite spirituelle',
  'Activité communautaire',
  'Formation spéciale',
  'Célébration',
  'Autre'
];

export default function AdminGallery() {
  const queryClient = useQueryClient();
  const [createDialog, setCreateDialog] = useState(false);
  const [viewDialog, setViewDialog] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [eventName, setEventName] = useState('');
  const [eventType, setEventType] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [mediaType, setMediaType] = useState('photo');
  const [status, setStatus] = useState('brouillon');
  const [description, setDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['galleryPosts'],
    queryFn: () => base44.entities.GalleryPost.list('-created_date')
  });

  const { data: allMedia = [] } = useQuery({
    queryKey: ['galleryMedia'],
    queryFn: () => base44.entities.GalleryMedia.list()
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const post = await base44.entities.GalleryPost.create({
        event_name: eventName,
        event_type: eventType,
        event_date: eventDate,
        media_type: mediaType,
        status: status,
        description: description,
        cover_image: '',
        media_count: selectedFiles.length
      });

      for (const file of selectedFiles) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        await base44.entities.GalleryMedia.create({
          post_id: post.id,
          media_url: file_url,
          media_type: mediaType
        });
      }

      return post;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['galleryPosts']);
      queryClient.invalidateQueries(['galleryMedia']);
      toast.success('Publication créée avec succès');
      resetForm();
      setCreateDialog(false);
    },
    onError: () => toast.error('Erreur lors de la création')
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, newStatus }) => base44.entities.GalleryPost.update(id, { status: newStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries(['galleryPosts']);
      toast.success('Statut mis à jour');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (postId) => {
      const media = allMedia.filter(m => m.post_id === postId);
      await Promise.all(media.map(m => base44.entities.GalleryMedia.delete(m.id)));
      await base44.entities.GalleryPost.delete(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['galleryPosts']);
      queryClient.invalidateQueries(['galleryMedia']);
      toast.success('Publication supprimée');
      setViewDialog(false);
    }
  });

  const addMediaMutation = useMutation({
    mutationFn: async ({ postId, files, currentMediaType }) => {
      const uploadPromises = [];
      for (const file of files) {
        uploadPromises.push(
          base44.integrations.Core.UploadFile({ file }).then(({ file_url }) =>
            base44.entities.GalleryMedia.create({
              post_id: postId,
              media_url: file_url,
              media_type: currentMediaType
            })
          )
        );
      }
      await Promise.all(uploadPromises);
      
      // Recompter les médias après ajout
      const updatedMedia = await base44.entities.GalleryMedia.filter({ post_id: postId });
      await base44.entities.GalleryPost.update(postId, {
        media_count: updatedMedia.length
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['galleryMedia']);
      queryClient.invalidateQueries(['galleryPosts']);
      toast.success('Médias ajoutés avec succès');
    },
    onError: () => {
      toast.error('Erreur lors de l\'ajout des médias');
    }
  });

  const deleteMediaMutation = useMutation({
    mutationFn: async ({ mediaId, postId }) => {
      await base44.entities.GalleryMedia.delete(mediaId);
      const currentCount = getPostMedia(postId).length;
      await base44.entities.GalleryPost.update(postId, {
        media_count: currentCount - 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['galleryMedia']);
      toast.success('Média supprimé');
    }
  });

  const resetForm = () => {
    setEventName('');
    setEventType('');
    setEventDate('');
    setMediaType('photo');
    setStatus('brouillon');
    setDescription('');
    setSelectedFiles([]);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const maxFiles = mediaType === 'photo' ? 50 : 20;
    
    if (files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} fichiers autorisés`);
      return;
    }
    
    setSelectedFiles(files);
    toast.success(`${files.length} fichier(s) sélectionné(s)`);
  };

  const handleSubmit = () => {
    if (!eventName || !eventType || !eventDate || selectedFiles.length === 0) {
      toast.error('Veuillez remplir tous les champs requis');
      return;
    }
    createMutation.mutate();
  };

  const getPostMedia = (postId) => {
    return allMedia.filter(m => m.post_id === postId);
  };

  const filteredPosts = posts.filter(post => 
    post.event_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.event_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        <AdminTopNav />
        
        <div className="pt-20 px-4 pb-12 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-black text-gray-900 mb-2">Galerie d'Événements</h1>
              <p className="text-gray-600 text-sm">Gérez les publications photo et vidéo</p>
            </div>
            <Button 
              onClick={() => setCreateDialog(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle publication
            </Button>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Rechercher un événement..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 rounded-xl"
              />
            </div>
          </div>

          {/* Posts Grid */}
          {filteredPosts.length === 0 ? (
            <Card className="bg-white border-gray-200 text-center py-16">
              <CardContent>
                <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune publication</h3>
                <p className="text-gray-500">Créez votre première publication pour commencer</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => {
                const media = getPostMedia(post.id);
                return (
                  <Card 
                    key={post.id} 
                    className="bg-white border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                    onClick={() => {
                      setSelectedPost(post);
                      setViewDialog(true);
                    }}
                  >
                    <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 relative overflow-hidden">
                      {media[0] ? (
                        <img src={media[0].media_url} alt={post.event_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          {post.media_type === 'photo' ? (
                            <ImageIcon className="w-12 h-12 text-blue-400/50" />
                          ) : (
                            <Video className="w-12 h-12 text-purple-400/50" />
                          )}
                        </div>
                      )}
                      <Badge className={`absolute top-3 right-3 ${post.status === 'publié' ? 'bg-green-500' : 'bg-amber-500'}`}>
                        {post.status}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-1">{post.event_name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(post.event_date), 'dd MMMM yyyy', { locale: fr })}
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs border-gray-300 text-gray-700">
                          {post.event_type}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {media.length} {post.media_type === 'photo' ? 'photo(s)' : 'vidéo(s)'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Create Dialog */}
        <Dialog open={createDialog} onOpenChange={(open) => { if (!open) resetForm(); setCreateDialog(open); }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 to-slate-800 border-white/10 text-white">
            <DialogHeader>
              <DialogTitle className="text-white text-xl">Créer une publication</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium text-white/70 mb-2 block">Nom de l'événement *</label>
                <Input
                  placeholder="Ex: Cérémonie de remise de diplômes 2026"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-white/70 mb-2 block">Type d'événement *</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full h-11 rounded-lg bg-white/5 border border-white/10 text-white px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" className="bg-slate-900">Sélectionnez un type</option>
                  {EVENT_TYPES.map(type => (
                    <option key={type} value={type} className="bg-slate-900">{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-white/70 mb-2 block">Date de l'événement *</label>
                <Input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-white/70 mb-2 block">Type de média *</label>
                <select
                  value={mediaType}
                  onChange={(e) => setMediaType(e.target.value)}
                  className="w-full h-11 rounded-lg bg-white/5 border border-white/10 text-white px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="photo" className="bg-slate-900">Photos (max 50)</option>
                  <option value="video" className="bg-slate-900">Vidéos (max 20)</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-white/70 mb-2 block">Statut *</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full h-11 rounded-lg bg-white/5 border border-white/10 text-white px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="brouillon" className="bg-slate-900">Brouillon</option>
                  <option value="publié" className="bg-slate-900">Publié</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-white/70 mb-2 block">Description</label>
                <Textarea
                  placeholder="Description de l'événement..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-white/70 mb-2 block">
                  Ajouter des {mediaType === 'photo' ? 'photos' : 'vidéos'} *
                  <span className="text-white/40 text-xs ml-2">
                    (Max {mediaType === 'photo' ? '50' : '20'})
                  </span>
                </label>
                <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-blue-500/50 transition-colors cursor-pointer bg-white/5">
                  <input
                    type="file"
                    multiple
                    accept={mediaType === 'photo' ? 'image/*' : 'video/*'}
                    onChange={handleFileSelect}
                    className="hidden"
                    id="media-upload"
                  />
                  <label htmlFor="media-upload" className="cursor-pointer">
                    <Upload className="w-10 h-10 text-white/40 mx-auto mb-3" />
                    <p className="text-sm text-white/60">
                      Cliquez pour sélectionner des {mediaType === 'photo' ? 'photos' : 'vidéos'}
                    </p>
                    {selectedFiles.length > 0 && (
                      <p className="text-sm text-blue-400 mt-2 font-medium">
                        ✓ {selectedFiles.length} fichier(s) sélectionné(s)
                      </p>
                    )}
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => { resetForm(); setCreateDialog(false); }}
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                >
                  Annuler
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={createMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Création...
                    </>
                  ) : (
                    'Créer la publication'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Dialog */}
        <Dialog open={viewDialog} onOpenChange={setViewDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 to-slate-800 border-white/10 text-white">
            <DialogHeader>
              <DialogTitle className="text-white text-xl">{selectedPost?.event_name}</DialogTitle>
            </DialogHeader>
            {selectedPost && (
              <div className="space-y-4 mt-4">
                <div className="flex gap-2 flex-wrap">
                  <Badge className={selectedPost.status === 'publié' ? 'bg-green-500' : 'bg-amber-500'}>
                    {selectedPost.status}
                  </Badge>
                  <Badge variant="outline" className="border-white/20 text-white/70">
                    {selectedPost.event_type}
                  </Badge>
                  <Badge variant="outline" className="border-white/20 text-white/70">
                    <Calendar className="w-3 h-3 mr-1" />
                    {format(new Date(selectedPost.event_date), 'dd MMMM yyyy', { locale: fr })}
                  </Badge>
                </div>

                {selectedPost.description && (
                  <p className="text-white/70 text-sm">{selectedPost.description}</p>
                )}

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">
                      Médias ({getPostMedia(selectedPost.id).length})
                    </h4>
                    <div>
                      <input
                        type="file"
                        multiple
                        accept={selectedPost.media_type === 'photo' ? 'image/*' : 'video/*'}
                        className="hidden"
                        id={`add-media-${selectedPost.id}`}
                        onChange={(e) => {
                          const files = Array.from(e.target.files);
                          if (files.length > 0) {
                            toast.success(`Upload de ${files.length} fichier(s)...`);
                            addMediaMutation.mutate({ 
                              postId: selectedPost.id, 
                              files, 
                              currentMediaType: selectedPost.media_type 
                            });
                            e.target.value = '';
                          }
                        }}
                      />
                      <label htmlFor={`add-media-${selectedPost.id}`}>
                        <Button 
                          size="sm"
                          type="button"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          disabled={addMediaMutation.isPending}
                          asChild
                        >
                          <span className="cursor-pointer">
                            {addMediaMutation.isPending ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Upload...
                              </>
                            ) : (
                              <>
                                <Plus className="w-4 h-4 mr-2" />
                                Ajouter
                              </>
                            )}
                          </span>
                        </Button>
                      </label>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                    {getPostMedia(selectedPost.id).map((media) => (
                      <div key={media.id} className="aspect-square rounded-lg overflow-hidden bg-gray-100 relative group">
                        {media.media_type === 'photo' ? (
                          <img src={media.media_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <video src={media.media_url} className="w-full h-full object-cover" />
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Supprimer ce média ?')) {
                              deleteMediaMutation.mutate({ mediaId: media.id, postId: selectedPost.id });
                            }
                          }}
                          className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const newStatus = selectedPost.status === 'publié' ? 'brouillon' : 'publié';
                      updateStatusMutation.mutate({ id: selectedPost.id, newStatus });
                    }}
                    className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    {selectedPost.status === 'publié' ? 'Mettre en brouillon' : 'Publier'}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (confirm('Êtes-vous sûr de vouloir supprimer cette publication ?')) {
                        deleteMutation.mutate(selectedPost.id);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    {deleteMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Supprimer
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminGuard>
  );
}