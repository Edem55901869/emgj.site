import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Loader2, Heart, MessageCircle, Image as ImageIcon, Video, Headphones, Link2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import AdminTopNav from '../components/admin/AdminTopNav';
import AdminGuard from '../components/admin/AdminGuard';
import ThemeSelector, { themes } from '../components/blog/ThemeSelector';

export default function AdminBlog() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [form, setForm] = useState({ title: '', content: '', media_type: 'text', theme_id: null, theme_bg: null, theme_text: null });
  const [selectedTheme, setSelectedTheme] = useState(themes[0]);
  const [mediaFile, setMediaFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [commentReplies, setCommentReplies] = useState({});
  const [showComments, setShowComments] = useState({});
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['adminPosts'],
    queryFn: () => base44.entities.BlogPost.list('-created_date', 200),
  });

  const { data: allLikes = [] } = useQuery({
    queryKey: ['allLikes'],
    queryFn: () => base44.entities.BlogLike.list('-created_date', 2000),
  });

  const { data: allComments = [] } = useQuery({
    queryKey: ['allComments'],
    queryFn: () => base44.entities.BlogComment.list('-created_date', 2000),
    refetchInterval: 15000,
  });

  const replyToCommentMutation = useMutation({
    mutationFn: async ({ postId, parentId, content }) => {
      return await base44.entities.BlogComment.create({
        post_id: postId,
        content,
        author_name: 'Administration',
        author_email: 'admin@emgj.com',
        parent_comment_id: parentId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allComments'] });
      setCommentReplies({});
      toast.success('Réponse envoyée');
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (id) => base44.entities.BlogComment.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allComments'] });
      toast.success('Commentaire supprimé');
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      let media_url = data.media_url || '';
      if (mediaFile && data.media_type !== 'link') {
        setUploading(true);
        const { file_url } = await base44.integrations.Core.UploadFile({ file: mediaFile });
        media_url = file_url;
        setUploading(false);
      }
      if (data.media_type === 'link') media_url = data.media_url || '';

      if (editingPost) {
        return base44.entities.BlogPost.update(editingPost.id, { ...data, media_url });
      } else {
        return base44.entities.BlogPost.create({ ...data, media_url });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPosts'] });
      resetForm();
      toast.success(editingPost ? 'Publication modifiée' : 'Publication créée');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BlogPost.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPosts'] });
      toast.success('Publication supprimée');
    },
  });

  const resetForm = () => {
    setDialogOpen(false);
    setEditingPost(null);
    setForm({ title: '', content: '', media_type: 'text', theme_id: null, theme_bg: null, theme_text: null });
    setSelectedTheme(themes[0]);
    setMediaFile(null);
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setForm(post);
    if (post.theme_id) {
      const theme = themes.find(t => t.id === post.theme_id) || themes[0];
      setSelectedTheme(theme);
    }
    setDialogOpen(true);
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <AdminTopNav />
        <div className="pt-20 px-4 pb-8 max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Publications</h1>
              <p className="text-gray-500 text-sm mt-1">Partagez du contenu avec les étudiants</p>
            </div>
            <Button onClick={() => { resetForm(); setDialogOpen(true); }} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg shadow-blue-500/20">
              <Plus className="w-4 h-4 mr-2" /> Publier
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
          ) : (
            <div className="space-y-4">
              {posts.map(post => {
                const postLikes = allLikes.filter(l => l.post_id === post.id);
                const postComments = allComments.filter(c => c.post_id === post.id);
                
                return (
                  <div key={post.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg transition-all">
                    {post.media_url && post.media_type === 'image' && (
                      <img src={post.media_url} alt="" className="w-full h-80 object-cover" />
                    )}
                    <div className={post.theme_id && post.media_type === 'text' ? `p-8 min-h-[200px] flex flex-col justify-center ${post.theme_bg}` : 'p-5'}>
                      {post.theme_id && post.media_type === 'text' ? (
                        <div className={`text-center ${post.theme_text}`}>
                          <h3 className="font-bold text-2xl mb-3">{post.title}</h3>
                          <p className="text-lg leading-relaxed">{post.content}</p>
                        </div>
                      ) : (
                        <>
                          <h3 className="font-bold text-gray-900 text-xl mb-2">{post.title}</h3>
                          <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                          {post.media_url && post.media_type === 'video' && (
                            <video src={post.media_url} controls className="w-full rounded-xl mt-3" />
                          )}
                          {post.media_url && post.media_type === 'audio' && (
                            <audio src={post.media_url} controls className="w-full mt-3" />
                          )}
                        </>
                      )}
                    </div>
                    <div className="px-5 py-3 border-t border-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex gap-4">
                          <span className="flex items-center gap-1.5 text-sm">
                            <Heart className={`w-4 h-4 ${postLikes.length > 0 ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
                            <span className="font-semibold text-gray-700">{postLikes.length}</span>
                          </span>
                          <span className="flex items-center gap-1.5 text-sm">
                            <MessageCircle className={`w-4 h-4 ${postComments.length > 0 ? 'text-blue-500' : 'text-gray-400'}`} />
                            <span className="font-semibold text-gray-700">{postComments.length}</span>
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => handleEdit(post)} variant="ghost" size="sm" className="rounded-xl">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button onClick={() => deleteMutation.mutate(post.id)} variant="ghost" size="sm" className="rounded-xl text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      {postComments.length > 0 && (
                        <div className="border-t border-gray-100 pt-3">
                          <button onClick={() => setShowComments({ ...showComments, [post.id]: !showComments[post.id] })} className="text-xs font-semibold text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            Voir les commentaires ({postComments.length})
                          </button>
                          {showComments[post.id] && (
                            <div className="space-y-3 max-h-64 overflow-y-auto mt-2">
                              {postComments.filter(c => !c.parent_comment_id).map(comment => (
                                <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                                  <div className="flex items-start gap-2 mb-2">
                                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 flex-shrink-0">
                                      {comment.author_name?.[0]}
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-xs font-semibold text-gray-800">{comment.author_name}</p>
                                      <p className="text-sm text-gray-700">{comment.content}</p>
                                    </div>
                                    <Button onClick={() => deleteCommentMutation.mutate(comment.id)} variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50 rounded flex-shrink-0">
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                  {postComments.filter(r => r.parent_comment_id === comment.id).map(reply => (
                                   <div key={reply.id} className="ml-8 mt-2 bg-white rounded-lg p-2 border border-gray-100 flex items-start justify-between gap-2">
                                     <div className="flex-1">
                                       <p className="text-xs font-semibold text-blue-600">{reply.author_name}</p>
                                       <p className="text-xs text-gray-600">{reply.content}</p>
                                     </div>
                                     <Button onClick={() => deleteCommentMutation.mutate(reply.id)} variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50 rounded">
                                       <Trash2 className="w-3 h-3" />
                                     </Button>
                                   </div>
                                  ))}
                                  <div className="ml-8 mt-2 flex gap-2">
                                    <Input
                                      value={commentReplies[comment.id] || ''}
                                      onChange={(e) => setCommentReplies({ ...commentReplies, [comment.id]: e.target.value })}
                                      placeholder="Répondre..."
                                      className="h-8 text-xs rounded-lg"
                                    />
                                    <Button
                                      onClick={() => replyToCommentMutation.mutate({ postId: post.id, parentId: comment.id, content: commentReplies[comment.id] })}
                                      disabled={!commentReplies[comment.id]}
                                      size="sm"
                                      className="h-8 px-3 rounded-lg"
                                    >
                                      <Send className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <Dialog open={dialogOpen} onOpenChange={resetForm}>
          <DialogContent className="max-w-lg rounded-2xl">
            <DialogHeader><DialogTitle>{editingPost ? 'Modifier' : 'Nouvelle publication'}</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Titre" className="rounded-xl h-11" />
              <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Votre message..." className="rounded-xl min-h-[100px]" maxLength={500} />
              {form.media_type === 'text' && form.content.length <= 200 && (
                <ThemeSelector 
                  selected={selectedTheme} 
                  onSelect={(theme) => {
                    setSelectedTheme(theme);
                    setForm({ ...form, theme_id: theme.id, theme_bg: theme.bg, theme_text: theme.text });
                  }} 
                />
              )}
              <Select value={form.media_type} onValueChange={(v) => setForm({ ...form, media_type: v })}>
                <SelectTrigger className="rounded-xl h-11"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">📝 Texte</SelectItem>
                  <SelectItem value="image">🖼️ Image</SelectItem>
                  <SelectItem value="video">🎥 Vidéo</SelectItem>
                  <SelectItem value="audio">🎵 Audio</SelectItem>
                  <SelectItem value="link">🔗 Lien</SelectItem>
                </SelectContent>
              </Select>
              {form.media_type === 'link' && (
                <Input value={form.media_url || ''} onChange={(e) => setForm({ ...form, media_url: e.target.value })} placeholder="https://..." className="rounded-xl h-11" />
              )}
              {['image', 'video', 'audio'].includes(form.media_type) && (
                <Input type="file" accept={form.media_type === 'image' ? 'image/*' : form.media_type === 'video' ? 'video/*' : 'audio/*'} onChange={(e) => setMediaFile(e.target.files[0])} className="rounded-xl" />
              )}
              <Button
                onClick={() => saveMutation.mutate(form)}
                disabled={!form.title || !form.content || saveMutation.isPending || uploading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl h-11"
              >
                {(saveMutation.isPending || uploading) ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingPost ? 'Mettre à jour' : 'Publier')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminGuard>
  );
}