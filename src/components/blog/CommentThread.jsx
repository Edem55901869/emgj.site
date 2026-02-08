import React, { useState } from 'react';
import { Reply, MoreVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function CommentThread({ comment, replies, currentUserEmail, isAdmin, onReply, onDelete }) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleReply = () => {
    if (replyText.trim()) {
      onReply(comment.id, replyText);
      setReplyText('');
      setShowReplyBox(false);
    }
  };

  const canDelete = isAdmin || comment.author_email === currentUserEmail;

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {comment.author_name?.charAt(0) || 'U'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="bg-gray-100 rounded-2xl px-4 py-2">
            <p className="font-semibold text-gray-900 text-sm">{comment.author_name}</p>
            <p className="text-gray-700 text-sm">{comment.content}</p>
          </div>
          <div className="flex items-center gap-3 mt-1 px-2">
            <button onClick={() => setShowReplyBox(!showReplyBox)} className="text-xs font-semibold text-gray-500 hover:text-blue-600">
              <Reply className="w-3 h-3 inline mr-1" />
              Répondre
            </button>
            <span className="text-xs text-gray-400">
              {comment.created_date && format(new Date(comment.created_date), "d MMM 'à' HH:mm", { locale: fr })}
            </span>
          </div>
        </div>
        {canDelete && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onDelete(comment.id)} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {showReplyBox && (
        <div className="ml-11 flex gap-2">
          <Textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Écrire une réponse..."
            className="min-h-[60px] rounded-xl text-sm"
          />
          <div className="flex flex-col gap-1">
            <Button onClick={handleReply} size="sm" className="bg-blue-600 hover:bg-blue-700 rounded-xl">
              Envoyer
            </Button>
            <Button onClick={() => setShowReplyBox(false)} variant="outline" size="sm" className="rounded-xl">
              Annuler
            </Button>
          </div>
        </div>
      )}

      {replies.length > 0 && (
        <div className="ml-11 space-y-2">
          {replies.map(reply => (
            <CommentThread
              key={reply.id}
              comment={reply}
              replies={[]}
              currentUserEmail={currentUserEmail}
              isAdmin={isAdmin}
              onReply={onReply}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}