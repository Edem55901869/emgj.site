import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, Bookmark, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import CommentThread from './CommentThread';
import { toast } from 'sonner';

export default function BlogPostFull({
  post,
  isLiked,
  isBookmarked,
  likesCount,
  comments,
  currentUser,
  isAdmin,
  onToggleLike,
  onToggleBookmark,
  onAddComment,
  onDeleteComment,
}) {
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState('');

  const handleAddComment = () => {
    if (commentInput.trim()) {
      onAddComment(post.id, commentInput);
      setCommentInput('');
    }
  };

  const topLevelComments = comments.filter(c => !c.parent_comment_id);

  return (
    <motion.div
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
        <button onClick={() => onToggleLike(post.id)} className={`flex items-center gap-1.5 text-sm transition-colors ${isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}>
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500' : ''}`} />
          <span className="font-semibold">{likesCount || ''}</span>
        </button>
        <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-blue-500 transition-colors">
          <MessageCircle className="w-4 h-4" />
          <span className="font-semibold">{comments.length || ''}</span>
        </button>
        <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Lien copié !'); }} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-green-500 transition-colors">
          <Share2 className="w-4 h-4" />
        </button>
        <button onClick={() => onToggleBookmark(post.id)} className={`ml-auto text-sm transition-colors ${isBookmarked ? 'text-blue-600' : 'text-gray-400 hover:text-blue-500'}`}>
          <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-blue-600' : ''}`} />
        </button>
      </div>

      {showComments && (
        <div className="px-5 pb-4 border-t border-gray-50">
          <div className="max-h-96 overflow-y-auto space-y-3 py-3">
            {topLevelComments.map(c => (
              <CommentThread
                key={c.id}
                comment={c}
                replies={comments.filter(r => r.parent_comment_id === c.id)}
                currentUserEmail={currentUser?.email}
                isAdmin={isAdmin}
                onReply={(parentId, content) => onAddComment(post.id, content, parentId)}
                onDelete={onDeleteComment}
              />
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <Textarea
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="Écrire un commentaire..."
              className="min-h-[40px] h-10 rounded-xl text-sm resize-none"
            />
            <Button onClick={handleAddComment} size="sm" className="bg-blue-600 hover:bg-blue-700 rounded-xl h-10 px-4">
              Envoyer
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}