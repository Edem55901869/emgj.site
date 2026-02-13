import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Upload, Image as ImageIcon, Video, Calendar, Eye, Edit, Trash2, Loader2, X } from 'lucide-react';
import AdminTopNav from '../components/admin/AdminTopNav';
import AdminGuard from '../components/admin/AdminGuard';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function AdminGallery() {
  const queryClient = useQueryClient();
  const [openCreate, setOpenCreate] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    event_name: '',
    event_type: '',
    event_date: '',
    media_type: 'photo',
    status: 'brouillon',
    description: '',
    cover_image: ''
  });

  const [mediaFiles, setMediaFiles] = useState([]);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['galleryPosts'],
    queryFn: () => base44.entities.GalleryPost.list('-created_date')
  });

  const { data: allMedia = [] } = useQuery({
    queryKey: ['galleryMedia'],
    queryFn: () => base44.entities.GalleryMedia.list()
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const post = await base44.entities.GalleryPost.create(data);
      
      // Upload media files
      const mediaPromises = mediaFiles.map(async (file) => {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        return base44.entities.GalleryMedia.create({
          post_id: post.id,
          media_url: file_url,
          media_type: data.media_type
        });
      });
      
      await Promise.all(mediaPromises);
      
      // Update media count
      await base44.entities.GalleryPost.update(post.id, {
        media_count: mediaFiles.length
      });

      return post;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['galleryPosts']);
      queryClient.invalidateQueries(['galleryMedia']);
      toast.success('Publication créée avec succès');
      setOpenCreate(false);
      resetForm();
    },
    onError: () => toast.error('Erreur lors de la création')
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.GalleryPost.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['galleryPosts']);
      toast.success('Publication mise à jour');
    },
    onError: () => toast.error('Erreur lors de la mise à jour')
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      // Delete associated media first
      const media = allMedia.filter(m => m.post_id === id);
      await Promise.all(media.map(m => base44.entities.GalleryMedia.delete(m.id)));
      await base44.entities.GalleryPost.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['galleryPosts']);
      queryClient.invalidateQueries(['galleryMedia']);
      toast.success('Publication supprimée');
      setOpenView(false);
    },
    onError: () => toast.error('Erreur lors de la suppression')
  });

  const resetForm = () => {
    setFormData({
      event_name: '',
      event_type: '',
      event_date: '',
      media_type: 'photo',
      status: 'brouillon',
      description: '',
      cover_image: ''
    });
    setMediaFiles([]);
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    const maxFiles = formData.media_type === 'photo' ? 50 : 20;

    if (files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} ${formData.media_type === 'photo' ? 'photos' : 'vidéos'} autorisées`);
      return;
    }

    setMediaFiles(files);
    
    // Set cover image from first file
    if (files.length > 0 && formData.media_type === 'photo') {
      const reader = new FileReader();
      reader.onload = (e) => setFormData({ ...formData, cover_image: e.target.result });
      reader.readAsDataURL(files[0]);
    }

    toast.success(`${files.length} fichier(s) sélectionné(s)`);
  };

  const handleSubmit = () => {
    if (!formData.event_name || !formData.event_type || !formData.event_date || mediaFiles.length === 0) {
      toast.error('Veuillez remplir tous les champs requis et ajouter des médias');
      return;
    }
    createMutation.mutate(formData);
  };

  const getPostMedia = (postId) => {
    return allMedia.filter(m => m.post_id === postId);
  };

  const toggleStatus = (post) => {
    const newStatus = post.status === 'publié' ? 'brouillon' : 'publié';
    updateMutation.mutate({ id: post.id, data: { status: newStatus } });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        <AdminTopNav />
        
        <div className="pt-20 px-6 pb-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Galerie</h1>
                <p className="text-gray-600 mt-1">Gérez les publications de la galerie</p>
              </div>
              <div className="flex gap-3 items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher un événement..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Dialog open={openCreate} onOpenChange={setOpenCreate}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Nouvelle publication
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Créer une publication</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Nom de l'événement *</label>
                      <Input
                        placeholder="Ex: Cérémonie de remise de diplômes 2025"
                        value={formData.event_name}
                        onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Type d'événement *</label>
                      <Select value={formData.event_type} onValueChange={(value) => setFormData({ ...formData, event_type: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Cérémonie de remise de diplômes">Cérémonie de remise de diplômes</SelectItem>
                          <SelectItem value="Conférence">Conférence</SelectItem>
                          <SelectItem value="Culte">Culte</SelectItem>
                          <SelectItem value="Sortie académique">Sortie académique</SelectItem>
                          <SelectItem value="Séminaire">Séminaire</SelectItem>
                          <SelectItem value="Retraite spirituelle">Retraite spirituelle</SelectItem>
                          <SelectItem value="Activité communautaire">Activité communautaire</SelectItem>
                          <SelectItem value="Formation spéciale">Formation spéciale</SelectItem>
                          <SelectItem value="Célébration">Célébration</SelectItem>
                          <SelectItem value="Autre">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Date de l'événement *</label>
                      <Input
                        type="date"
                        value={formData.event_date}
                        onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Type de média *</label>
                      <Select value={formData.media_type} onValueChange={(value) => setFormData({ ...formData, media_type: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="photo">Photos (max 50)</SelectItem>
                          <SelectItem value="video">Vidéos (max 20)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Statut *</label>
                      <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="brouillon">Brouillon</SelectItem>
                          <SelectItem value="publié">Publié</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Description</label>
                      <Textarea
                        placeholder="Description de l'événement..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Ajouter des {formData.media_type === 'photo' ? 'photos' : 'vidéos'} *
                        <span className="text-gray-500 text-xs ml-2">
                          (Max {formData.media_type === 'photo' ? '50 photos' : '20 vidéos'})
                        </span>
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
                        <input
                          type="file"
                          multiple
                          accept={formData.media_type === 'photo' ? 'image/*' : 'video/*'}
                          onChange={handleFileSelect}
                          className="hidden"
                          id="media-upload"
                        />
                        <label htmlFor="media-upload" className="cursor-pointer">
                          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-sm text-gray-600">
                            Cliquez pour sélectionner des {formData.media_type === 'photo' ? 'photos' : 'vidéos'}
                          </p>
                          {mediaFiles.length > 0 && (
                            <p className="text-sm text-blue-600 mt-2 font-medium">
                              {mediaFiles.length} fichier(s) sélectionné(s)
                            </p>
                          )}
                        </label>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button variant="outline" onClick={() => setOpenCreate(false)} className="flex-1">
                        Annuler
                      </Button>
                      <Button 
                        onClick={handleSubmit} 
                        disabled={createMutation.isPending}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
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
            </div>

            {posts.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune publication</h3>
                  <p className="text-gray-600">Créez votre première publication pour commencer</p>
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
                    <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {
                      setSelectedPost(post);
                      setOpenView(true);
                    }}>
                      <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 relative overflow-hidden">
                        {post.media_type === 'photo' && media[0] ? (
                          <img src={media[0].media_url} alt={post.event_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            {post.media_type === 'photo' ? (
                              <ImageIcon className="w-16 h-16 text-blue-400" />
                            ) : (
                              <Video className="w-16 h-16 text-purple-400" />
                            )}
                          </div>
                        )}
                        <Badge className={`absolute top-3 right-3 ${post.status === 'publié' ? 'bg-green-500' : 'bg-gray-500'}`}>
                          {post.status}
                        </Badge>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">{post.event_name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(post.event_date), 'dd MMMM yyyy', { locale: fr })}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {post.event_type}
                        </Badge>
                        <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                          {post.media_type === 'photo' ? (
                            <ImageIcon className="w-4 h-4" />
                          ) : (
                            <Video className="w-4 h-4" />
                          )}
                          {media.length} {post.media_type === 'photo' ? 'photo(s)' : 'vidéo(s)'}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* View Dialog */}
        <Dialog open={openView} onOpenChange={setOpenView}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedPost?.event_name}</DialogTitle>
            </DialogHeader>
            {selectedPost && (
              <div className="space-y-4 mt-4">
                <div className="flex gap-2">
                  <Badge className={selectedPost.status === 'publié' ? 'bg-green-500' : 'bg-gray-500'}>
                    {selectedPost.status}
                  </Badge>
                  <Badge variant="outline">{selectedPost.event_type}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Date:</span>
                    <p className="font-medium">{format(new Date(selectedPost.event_date), 'dd MMMM yyyy', { locale: fr })}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Type de média:</span>
                    <p className="font-medium capitalize">{selectedPost.media_type}</p>
                  </div>
                </div>

                {selectedPost.description && (
                  <div>
                    <span className="text-gray-600 text-sm">Description:</span>
                    <p className="text-gray-900 mt-1">{selectedPost.description}</p>
                  </div>
                )}

                <div>
                  <h4 className="font-medium mb-3">
                    Médias ({getPostMedia(selectedPost.id).length})
                  </h4>
                  <div className="grid grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                    {getPostMedia(selectedPost.id).map((media) => (
                      <div key={media.id} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                        {media.media_type === 'photo' ? (
                          <img src={media.media_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <video src={media.media_url} controls className="w-full h-full object-cover" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => toggleStatus(selectedPost)}
                    className="flex-1"
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