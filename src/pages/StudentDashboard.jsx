import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, Bookmark, Search, SlidersHorizontal, Clock, Loader2, GraduationCap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import StudentBottomNav from '../components/student/StudentBottomNav';
import ProfileSetupForm from '../components/student/ProfileSetupForm';
import PublicChat from '../components/PublicChat';

export default function StudentDashboard() {
  const [user, setUser] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [commentInputs, setCommentInputs] = useState({});
  const [showComments, setShowComments] = useState({});
  const queryClient = useQueryClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const u = await base44.auth.me();
    setUser(u);
    const students = await base44.entities.Student.filter({ user_email: u.email });
    if (students.length > 0) setStudentProfile(students[0]);
    setLoading(false);
  };

  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['blogPosts'],
    queryFn: () => base44.entities.BlogPost.list('-created_date', 50),
    enabled: !!studentProfile?.status && studentProfile.status === 'certifié',
  });

  const { data: likes = [] } = useQuery({
    queryKey: ['blogLikes'],
    queryFn: () => base44.entities.BlogLike.filter({ user_email: user?.email }),
    enabled: !!user && studentProfile?.status === 'certifié',
  });

  const { data: bookmarks = [] } = useQuery({
    queryKey: ['blogBookmarks'],
    queryFn: () => base44.entities.BlogBookmark.filter({ user_email: user?.email }),
    enabled: !!user && studentProfile?.status === 'certifié',
  });

  const { data: allComments = [] } = useQuery({
    queryKey: ['blogComments'],
    queryFn: () => base44.entities.BlogComment.list('-created_date', 200),
    enabled: studentProfile?.status === 'certifié',
  });

  const createProfileMutation = useMutation({
    mutationFn: (data) => base44.entities.Student.create({ ...data, user_email: user.email, status: 'en_attente', profile_completed: true }),
    onSuccess: (data) => {
      setStudentProfile(data);
      toast.success('Profil créé ! En attente de validation par l\'administration.');
    },
  });

  const toggleLike = async (postId) => {
    const existing = likes.find(l => l.post_id === postId);
    if (existing) {
      await base44.entities.BlogLike.delete(existing.id);
    } else {
      await base44.entities.BlogLike.create({ post_id: postId, user_email: user.email });
    }
    queryClient.invalidateQueries({ queryKey: ['blogLikes'] });
  };

  const toggleBookmark = async (postId) => {
    const existing = bookmarks.find(b => b.post_id === postId);
    if (existing) {
      await base44.entities.BlogBookmark.delete(existing.id);
    } else {
      await base44.entities.BlogBookmark.create({ post_id: postId, user_email: user.email });
    }
    queryClient.invalidateQueries({ queryKey: ['blogBookmarks'] });
  };

  const addComment = async (postId) => {
    const content = commentInputs[postId];
    if (!content?.trim()) return;
    await base44.entities.BlogComment.create({
      post_id: postId,
      content: content.trim(),
      author_name: `${studentProfile.first_name} ${studentProfile.last_name}`,
      author_email: user.email
    });
    setCommentInputs({ ...commentInputs, [postId]: '' });
    queryClient.invalidateQueries({ queryKey: ['blogComments'] });
    toast.success('Commentaire ajouté');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Profile not completed
  if (!studentProfile || !studentProfile.profile_completed) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-6">
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Complétez votre profil</h1>
            <p className="text-gray-500 text-sm mt-2">Remplissez ces informations pour accéder à la plateforme</p>
          </div>
          <ProfileSetupForm onSubmit={(data) => createProfileMutation.mutate(data)} loading={createProfileMutation.isPending} />
        </div>
      </div>
    );
  }

  // Pending validation
  if (studentProfile.status === 'en_attente') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-6">
        <div className="text-center max-w-md bg-white rounded-3xl shadow-xl p-10 border border-gray-100">
          <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">En attente de validation</h2>
          <p className="text-gray-500 leading-relaxed">
            Votre profil a été soumis avec succès. L'administration de l'EMGJ examinera votre demande bientôt.
          </p>
          <Badge className="mt-4 bg-amber-100 text-amber-700 border-amber-200">
            {studentProfile.domain} • {studentProfile.formation_type}
          </Badge>
        </div>
      </div>
    );
  }

  if (studentProfile.status === 'rejeté') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-6">
        <div className="text-center max-w-md bg-white rounded-3xl shadow-xl p-10 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Inscription rejetée</h2>
          <p className="text-gray-500">Contactez l'administration pour plus d'informations.</p>
        </div>
      </div>
    );
  }

  if (studentProfile.status === 'bloqué') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-6">
        <div className="text-center max-w-md bg-white rounded-3xl shadow-xl p-10 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Compte bloqué</h2>
          <p className="text-gray-500">Votre compte a été bloqué. Contactez l'administration.</p>
        </div>
      </div>
    );
  }

  const filteredPosts = posts
    .filter(p => !searchQuery || p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || p.content?.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => sortBy === 'recent' ? new Date(b.created_date) - new Date(a.created_date) : new Date(a.created_date) - new Date(b.created_date));

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-gray-900">Fil d'actualité</h1>
            <Badge className="bg-blue-50 text-blue-700 border-blue-100">
              {studentProfile.domain}
            </Badge>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher..."
                className="pl-10 h-10 rounded-xl bg-gray-50 border-gray-200"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSortBy(s => s === 'recent' ? 'oldest' : 'recent')}
              className="h-10 w-10 rounded-xl"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {postsLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Aucune publication pour le moment
          </div>
        ) : (
          filteredPosts.map((post) => {
            const isLiked = likes.some(l => l.post_id === post.id);
            const isBookmarked = bookmarks.some(b => b.post_id === post.id);
            const postComments = allComments.filter(c => c.post_id === post.id);
            const postLikes = likes.filter(l => l.post_id === post.id).length;

            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm"
              >
                {post.media_url && post.media_type === 'image' && (
                  <img src={post.media_url} alt="" className="w-full h-48 object-cover" />
                )}
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{post.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
                  {post.media_url && post.media_type === 'video' && (
                    <video src={post.media_url} controls className="w-full rounded-xl mt-3" />
                  )}
                  {post.media_url && post.media_type === 'audio' && (
                    <audio src={post.media_url} controls className="w-full mt-3" />
                  )}
                  {post.media_url && post.media_type === 'link' && (
                    <a href={post.media_url} target="_blank" rel="noreferrer" className="text-blue-600 text-sm underline mt-2 block">{post.media_url}</a>
                  )}
                  <div className="text-xs text-gray-400 mt-3">
                    {post.created_date && format(new Date(post.created_date), "d MMM yyyy 'à' HH:mm", { locale: fr })}
                  </div>
                </div>

                {/* Actions */}
                <div className="px-5 py-3 border-t border-gray-50 flex items-center gap-4">
                  <button onClick={() => toggleLike(post.id)} className={`flex items-center gap-1.5 text-sm transition-colors ${isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}>
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500' : ''}`} />
                    <span>{postLikes || ''}</span>
                  </button>
                  <button onClick={() => setShowComments({ ...showComments, [post.id]: !showComments[post.id] })} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-blue-500 transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    <span>{postComments.length || ''}</span>
                  </button>
                  <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Lien copié !'); }} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-green-500 transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => toggleBookmark(post.id)} className={`ml-auto text-sm transition-colors ${isBookmarked ? 'text-blue-600' : 'text-gray-400 hover:text-blue-500'}`}>
                    <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-blue-600' : ''}`} />
                  </button>
                </div>

                {/* Comments */}
                {showComments[post.id] && (
                  <div className="px-5 pb-4 border-t border-gray-50">
                    <div className="max-h-40 overflow-y-auto space-y-2 py-3">
                      {postComments.map(c => (
                        <div key={c.id} className="text-sm">
                          <span className="font-semibold text-gray-800">{c.author_name}</span>
                          <span className="text-gray-600 ml-2">{c.content}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Textarea
                        value={commentInputs[post.id] || ''}
                        onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                        placeholder="Écrire un commentaire..."
                        className="min-h-[40px] h-10 rounded-xl text-sm resize-none"
                      />
                      <Button onClick={() => addComment(post.id)} size="sm" className="bg-blue-600 hover:bg-blue-700 rounded-xl h-10 px-4">
                        Envoyer
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>

      <StudentBottomNav />
      <PublicChat isAdmin={false} />
    </div>
  );
}