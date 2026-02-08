import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, MoreVertical, Trash2, Edit3, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const mediaIcons = { text: '📝', image: '🖼️', video: '🎥', audio: '🎵', link: '🔗' };

export default function BlogPostCard({ 
  post, 
  user, 
  isLiked, 
  isBookmarked, 
  comments = [], 
  onLike, 
  onBookmark, 
  onComment,
  onReply,
  onDelete,
  onEdit,
  isAdmin = false 
}) {
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [showComments, setShowComments] = useState(false);

  const handleComment = () => {
    if (commentText.trim()) {
      onComment(post.id, commentText);
      setCommentText('');
      setShowComments(true);
    }
  };

  const handleReply = (commentId) => {
    if (replyText.trim()) {
      onReply(commentId, replyText);
      setReplyText('');
      setReplyTo(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
            {post.created_by?.[0] || 'A'}
          </div>
          <div>
            <p className="font-semibold text-gray-900">Administrateur</p>
            <p className="text-xs text-gray-500">{post.created_date && format(new Date(post.created_date), 'd MMM yyyy', { locale: fr })}</p>
          </div>
        </div>
        {isAdmin && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(post)}>
                <Edit3 className="w-4 h-4 mr-2" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete?.(post.id)} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <h3 className="font-bold text-lg text-gray-900 mb-2">{post.title}</h3>
        <p className="text-gray-700 leading-relaxed">{post.content}</p>
        <Badge className="mt-2 bg-purple-50 text-purple-700 border-purple-100 text-xs">{mediaIcons[post.media_type]} {post.media_type}</Badge>
      </div>

      {/* Media */}
      {post.media_type === 'image' && post.media_url && (
        <img src={post.media_url} alt="" className="w-full object-cover max-h-96" />
      )}
      {post.media_type === 'video' && post.media_url && (
        <video src={post.media_url} controls className="w-full max-h-96" />
      )}
      {post.media_type === 'audio' && post.media_url && (
        <div className="px-4 pb-3">
          <audio src={post.media_url} controls className="w-full" />
        </div>
      )}
      {post.media_type === 'link' && post.media_url && (
        <div className="px-4 pb-3">
          <a href={post.media_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm">
            {post.media_url}
          </a>
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-1">
        <Button onClick={() => onLike(post.id)} variant="ghost" size="sm" className={`flex items-center gap-1 ${isLiked ? 'text-red-500' : 'text-gray-600'}`}>
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          <span className="text-sm">{post.likes_count || 0}</span>
        </Button>
        <Button onClick={() => setShowComments(!showComments)} variant="ghost" size="sm" className="flex items-center gap-1 text-gray-600">
          <MessageCircle className="w-4 h-4" />
          <span className="text-sm">{post.comments_count || 0}</span>
        </Button>
        <Button variant="ghost" size="sm" className="flex items-center gap-1 text-gray-600">
          <Share2 className="w-4 h-4" />
        </Button>
        <Button onClick={() => onBookmark(post.id)} variant="ghost" size="sm" className={`ml-auto ${isBookmarked ? 'text-amber-500' : 'text-gray-600'}`}>
          <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
        </Button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-100 bg-gray-50 p-4 space-y-3">
          {comments.map(comment => (
            <div key={comment.id} className="space-y-2">
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {comment.author_name?.[0]}
                </div>
                <div className="flex-1 bg-white rounded-xl p-3">
                  <p className="font-semibold text-sm text-gray-900">{comment.author_name}</p>
                  <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => setReplyTo(comment.id)} className="text-xs text-blue-600 hover:underline">
                      Répondre
                    </button>
                    <span className="text-xs text-gray-400">{comment.created_date && format(new Date(comment.created_date), 'HH:mm', { locale: fr })}</span>
                  </div>
                </div>
              </div>
              {replyTo === comment.id && (
                <div className="ml-10 flex gap-2">
                  <Textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Répondre..."
                    className="flex-1 rounded-xl text-sm h-20"
                  />
                  <Button onClick={() => handleReply(comment.id)} size="sm" className="bg-blue-600 hover:bg-blue-700 rounded-xl">
                    <Send className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Comment */}
      <div className="border-t border-gray-100 p-4 flex gap-2">
        <Textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Ajouter un commentaire..."
          className="flex-1 rounded-xl text-sm h-20"
        />
        <Button onClick={handleComment} disabled={!commentText.trim()} size="sm" className="bg-blue-600 hover:bg-blue-700 rounded-xl px-6">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}