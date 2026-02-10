import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Video, Upload, Trash2, Loader2, Eye, EyeOff, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import AdminTopNav from '../components/admin/AdminTopNav';
import AdminGuard from '../components/admin/AdminGuard';

export default function AdminHomeVideo() {
  const [form, setForm] = useState({ video_url: '', title: '', description: '', is_active: true });
  const [editing, setEditing] = useState(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const queryClient = useQueryClient();

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ['homeVideos'],
    queryFn: () => base44.entities.HomeVideo.list('-created_date'),
  });

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadingVideo(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm({ ...form, video_url: file_url });
      toast.success('Vidéo uploadée avec succès');
    } catch (error) {
      toast.error('Erreur lors de l\'upload');
    }
    setUploadingVideo(false);
  };

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.HomeVideo.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homeVideos'] });
      setForm({ video_url: '', title: '', description: '', is_active: true });
      toast.success('Vidéo ajoutée');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.HomeVideo.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homeVideos'] });
      setEditing(null);
      toast.success('Vidéo mise à jour');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.HomeVideo.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homeVideos'] });
      toast.success('Vidéo supprimée');
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }) => base44.entities.HomeVideo.update(id, { is_active: !isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homeVideos'] });
      toast.success('Statut mis à jour');
    },
  });

  const activeVideo = videos.find(v => v.is_active);

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <AdminTopNav />
        <div className="pt-20 px-4 pb-8 max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Vidéo de présentation</h1>
            <p className="text-gray-600">Gérez la vidéo affichée sur la page d'accueil publique</p>
          </div>

          {/* Formulaire d'ajout */}
          <Card className="mb-8 shadow-xl border-2 border-blue-100">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardTitle className="flex items-center gap-2">
                <Video className="w-6 h-6 text-blue-600" />
                Ajouter une vidéo
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL de la vidéo (YouTube, Vimeo, etc.)
                </label>
                <Input
                  value={form.video_url}
                  onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                  placeholder="https://www.youtube.com/embed/..."
                  className="h-11 rounded-xl"
                />
              </div>
              
              <div className="relative">
                <div className="flex items-center gap-3 my-3">
                  <div className="flex-1 border-t border-gray-300"></div>
                  <span className="text-sm text-gray-500 font-medium">OU</span>
                  <div className="flex-1 border-t border-gray-300"></div>
                </div>
                
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Uploader une vidéo depuis votre appareil
                </label>
                <div className="relative">
                  <Input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    disabled={uploadingVideo}
                    className="h-11 rounded-xl cursor-pointer"
                  />
                  {uploadingVideo && (
                    <div className="absolute inset-0 bg-white/90 flex items-center justify-center rounded-xl">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre (optionnel)
                </label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Découvrez notre école"
                  className="h-11 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optionnel)
                </label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Une courte description..."
                  className="rounded-xl"
                />
              </div>
              <Button 
                onClick={() => createMutation.mutate(form)}
                disabled={!form.video_url || createMutation.isPending}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 h-12 rounded-xl"
              >
                {createMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Ajout...</>
                ) : (
                  <><Upload className="w-4 h-4 mr-2" />Ajouter la vidéo</>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Liste des vidéos */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border-2 border-gray-100">
              <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucune vidéo ajoutée</p>
            </div>
          ) : (
            <div className="space-y-4">
              {videos.map((video) => (
                <Card key={video.id} className={`shadow-lg ${video.is_active ? 'border-2 border-green-500' : 'border border-gray-200'}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Aperçu vidéo */}
                      <div className="w-48 h-32 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                        {video.video_url.includes('youtube.com') || video.video_url.includes('vimeo.com') ? (
                          <iframe
                            src={video.video_url}
                            className="w-full h-full"
                            allowFullScreen
                          />
                        ) : (
                          <video
                            src={video.video_url}
                            className="w-full h-full object-cover"
                            controls
                          />
                        )}
                      </div>

                      {/* Infos */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">
                              {video.title || 'Sans titre'}
                            </h3>
                            {video.description && (
                              <p className="text-gray-600 text-sm mt-1">{video.description}</p>
                            )}
                            <a href={video.video_url} target="_blank" rel="noreferrer" className="text-blue-600 text-xs hover:underline mt-2 inline-block">
                              {video.video_url}
                            </a>
                          </div>
                          <Badge className={video.is_active ? 'bg-green-500' : 'bg-gray-500'}>
                            {video.is_active ? '✓ Active' : 'Inactive'}
                          </Badge>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mt-4">
                          <Button
                            onClick={() => toggleActiveMutation.mutate({ id: video.id, isActive: video.is_active })}
                            variant="outline"
                            size="sm"
                            className="rounded-lg"
                          >
                            {video.is_active ? (
                              <><EyeOff className="w-4 h-4 mr-1" />Désactiver</>
                            ) : (
                              <><Eye className="w-4 h-4 mr-1" />Activer</>
                            )}
                          </Button>
                          <Button
                            onClick={() => {
                              if (confirm('Supprimer cette vidéo ?')) {
                                deleteMutation.mutate(video.id);
                              }
                            }}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />Supprimer
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminGuard>
  );
}