import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Newspaper, Plus, Trash2, Loader2, Image, Video, Headphones, Link2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import AdminTopNav from '../components/admin/AdminTopNav';
import AdminGuard from '../components/admin/AdminGuard';

const mediaIcons = { text: FileText, image: Image, video: Video, audio: Headphones, link: Link2 };

export default function AdminBlog() {
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', media_type: 'text' });
  const [mediaFile, setMediaFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['adminPosts'],
    queryFn: () => base44.entities.BlogPost.list('-created_date', 100),
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      let media_url = '';
      if (mediaFile && data.media_type !== 'link') {
        setUploading(true);
        const { file_url } = await base44.integrations.Core.UploadFile({ file: mediaFile });
        media_url = file_url;
        setUploading(false);
      }
      if (data.media_type === 'link') media_url = data.media_url || '';
      return base44.entities.BlogPost.create({ ...data, media_url });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPosts'] });
      setCreateOpen(false);
      setForm({ title: '', content: '', media_type: 'text' });
      setMediaFile(null);
      toast.success('Publication créée');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BlogPost.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPosts'] });
      toast.success('Publication supprimée');
    },
  });

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        <AdminTopNav />
        <div className="pt-20 px-4 pb-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Blog</h1>
            <Button onClick={() => setCreateOpen(true)} className="bg-blue-600 hover:bg-blue-700 rounded-xl">
              <Plus className="w-4 h-4 mr-2" /> Nouvelle publication
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
          ) : (
            <div className="space-y-3">
              {posts.map(post => {
                const Icon = mediaIcons[post.media_type] || FileText;
                return (
                  <div key={post.id} className="bg-white rounded-xl border border-gray-100 p-5 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900">{post.title}</h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{post.content}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge className="bg-purple-50 text-purple-700 border-purple-100 text-xs">{post.media_type}</Badge>
                        <span className="text-xs text-gray-400">
                          {post.created_date && format(new Date(post.created_date), 'd MMM yyyy', { locale: fr })}
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteMutation.mutate(post.id)}>
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader><DialogTitle>Nouvelle publication</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Titre" className="rounded-xl h-11" />
              <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Contenu..." className="rounded-xl min-h-[100px]" />
              <Select value={form.media_type} onValueChange={(v) => setForm({ ...form, media_type: v })}>
                <SelectTrigger className="rounded-xl h-11"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Texte seul</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Vidéo</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="link">Lien</SelectItem>
                </SelectContent>
              </Select>
              {form.media_type === 'link' && (
                <Input value={form.media_url || ''} onChange={(e) => setForm({ ...form, media_url: e.target.value })} placeholder="URL du lien" className="rounded-xl h-11" />
              )}
              {['image', 'video', 'audio'].includes(form.media_type) && (
                <Input type="file" accept={form.media_type === 'image' ? 'image/*' : form.media_type === 'video' ? 'video/*' : 'audio/*'} onChange={(e) => setMediaFile(e.target.files[0])} className="rounded-xl" />
              )}
              <Button
                onClick={() => createMutation.mutate(form)}
                disabled={!form.title || !form.content || createMutation.isPending || uploading}
                className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl h-11"
              >
                {(createMutation.isPending || uploading) ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Publier'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminGuard>
  );
}