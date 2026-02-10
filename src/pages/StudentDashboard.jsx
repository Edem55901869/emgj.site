import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Bookmark, Search, SlidersHorizontal, Clock, Loader2, GraduationCap, CheckCircle2 } from 'lucide-react';
import NotificationButton from '../components/student/NotificationButton';
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
import CommentThread from '../components/blog/CommentThread';
import NotificationService from '../components/NotificationService';

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
    // Vérifier si on est en mode admin preview
    const adminView = localStorage.getItem('admin_student_view');
    if (adminView) {
      const viewData = JSON.parse(adminView);
      // Créer un profil virtuel pour l'admin
      setUser({ email: 'admin@preview.emgj' });
      setStudentProfile({
        first_name: 'Admin',
        last_name: 'Preview',
        domain: viewData.domain,
        formation_type: viewData.formation_type,
        status: 'certifié',
        profile_completed: true,
        user_email: 'admin@preview.emgj'
      });
      setLoading(false);
      return;
    }

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
    refetchInterval: 5000,
  });

  const { data: allLikes = [] } = useQuery({
    queryKey: ['allBlogLikes'],
    queryFn: () => base44.entities.BlogLike.list('-created_date', 1000),
    enabled: studentProfile?.status === 'certifié',
    refetchInterval: 5000,
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
    refetchInterval: 5000,
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

  const addComment = async (postId, parentId = null) => {
    const content = parentId ? commentInputs[`${postId}-${parentId}`] : commentInputs[postId];
    if (!content?.trim()) return;
    
    const comment = await base44.entities.BlogComment.create({
      post_id: postId,
      content: content.trim(),
      author_name: `${studentProfile.first_name} ${studentProfile.last_name}`,
      author_email: user.email,
      parent_comment_id: parentId
    });

    if (parentId) {
      const parentComment = allComments.find(c => c.id === parentId);
      if (parentComment && parentComment.author_email !== user.email) {
        await base44.entities.Notification.create({
          recipient_email: parentComment.author_email,
          type: 'info',
          title: 'Nouvelle réponse à votre commentaire',
          message: `${studentProfile.first_name} ${studentProfile.last_name} a répondu: "${content.trim()}"`
        });
      }
      setCommentInputs({ ...commentInputs, [`${postId}-${parentId}`]: '' });
    } else {
      setCommentInputs({ ...commentInputs, [postId]: '' });
    }
    
    queryClient.invalidateQueries({ queryKey: ['blogComments'] });
    toast.success('Commentaire ajouté');
  };

  const deleteComment = async (commentId) => {
    await base44.entities.BlogComment.delete(commentId);
    queryClient.invalidateQueries({ queryKey: ['blogComments'] });
    toast.success('Commentaire supprimé');
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
    .sort((a, b) => {
      const dateA = new Date(a.created_date);
      const dateB = new Date(b.created_date);
      return sortBy === 'recent' ? dateB - dateA : dateA - dateB;
    });

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header with Cover */}
      <div className="relative mb-4">
        <div className="h-32 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-300 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
            <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-300 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
                              radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)`
          }} />
        </div>
        <div className="max-w-2xl mx-auto px-4 -mt-8 relative">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/50 p-5 transform hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg">
                  {studentProfile.profile_photo ? (
                    <img src={studentProfile.profile_photo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {studentProfile.first_name?.[0]}{studentProfile.last_name?.[0]}
                      </span>
                    </div>
                  )}
                </div>
                {studentProfile.status === 'certifié' && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-2 border-white flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-gray-900 font-bold text-lg">{studentProfile.first_name} {studentProfile.last_name}</h2>
                <p className="text-gray-500 text-xs mt-0.5">{studentProfile.formation_type}</p>
                <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 text-xs mt-1.5">
                  {studentProfile.domain}
                </Badge>
              </div>
              <NotificationButton userEmail={user?.email} />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-4">
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
            const postLikes = allLikes.filter(l => l.post_id === post.id).length;

            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm"
              >
                {post.media_url && post.media_type === 'image' && (
                  <img src={post.media_url} alt="" className="w-full h-96 object-cover" />
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
                      {post.media_url && post.media_type === 'link' && (
                        <a href={post.media_url} target="_blank" rel="noreferrer" className="text-blue-600 text-sm underline mt-2 block">{post.media_url}</a>
                      )}
                    </>
                  )}
                  {!post.theme_id && (
                    <div className="text-xs text-gray-400 mt-3">
                      {post.created_date && format(new Date(post.created_date), "d MMM yyyy 'à' HH:mm", { locale: fr })}
                    </div>
                  )}
                </div>

                <div className="px-5 py-3 border-t border-gray-50 flex items-center gap-4">
                  <button onClick={() => toggleLike(post.id)} className={`flex items-center gap-1.5 text-sm transition-colors ${isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}>
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500' : ''}`} />
                    <span className="font-semibold">{postLikes || ''}</span>
                  </button>
                  <button onClick={() => setShowComments({ ...showComments, [post.id]: !showComments[post.id] })} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-blue-500 transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    <span className="font-semibold">{postComments.length || ''}</span>
                  </button>

                  <button onClick={() => toggleBookmark(post.id)} className={`ml-auto text-sm transition-colors ${isBookmarked ? 'text-blue-600' : 'text-gray-400 hover:text-blue-500'}`}>
                    <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-blue-600' : ''}`} />
                  </button>
                </div>

                {showComments[post.id] && (
                  <div className="px-5 pb-4 border-t border-gray-50">
                    <div className="max-h-96 overflow-y-auto space-y-3 py-3">
                      {postComments.filter(c => !c.parent_comment_id).map(c => (
                        <CommentThread
                          key={c.id}
                          comment={c}
                          replies={postComments.filter(r => r.parent_comment_id === c.id)}
                          currentUserEmail={user.email}
                          isAdmin={false}
                          onReply={(parentId, content) => {
                            setCommentInputs({ ...commentInputs, [`${post.id}-${parentId}`]: content });
                            addComment(post.id, parentId);
                          }}
                          onDelete={deleteComment}
                        />
                      ))}
                    </div>
                    <div className="flex gap-2 mt-3">
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
      <NotificationService userEmail={user?.email} enabled={studentProfile?.status === 'certifié'} />
    </div>
  );
}