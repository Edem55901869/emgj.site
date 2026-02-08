import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, Send, X, Image as ImageIcon, Mic, Trash2, Pin, Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function PublicChat({ isAdmin = false }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
      } catch {}
    };
    loadUser();
  }, []);

  const { data: messages = [] } = useQuery({
    queryKey: ['publicMessages'],
    queryFn: () => base44.entities.PublicMessage.list('-created_date', 200),
    enabled: open,
    refetchInterval: 3000,
  });

  const sendMutation = useMutation({
    mutationFn: (data) => base44.entities.PublicMessage.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publicMessages'] });
      setMessage('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PublicMessage.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publicMessages'] });
      toast.success('Message supprimé');
    },
  });

  const deleteAllMutation = useMutation({
    mutationFn: async () => {
      for (const msg of messages) {
        await base44.entities.PublicMessage.delete(msg.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publicMessages'] });
      toast.success('Tous les messages supprimés');
    },
  });

  const pinMutation = useMutation({
    mutationFn: ({ id, isPinned }) => base44.entities.PublicMessage.update(id, { is_pinned: !isPinned }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publicMessages'] });
    },
  });

  const markImportantMutation = useMutation({
    mutationFn: ({ id, isImportant }) => base44.entities.PublicMessage.update(id, { is_important: !isImportant }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publicMessages'] });
    },
  });

  const sendMedia = async (type) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = type === 'image' ? 'image/*' : 'audio/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      sendMutation.mutate({
        sender_email: user.email,
        sender_name: user.full_name,
        content: type === 'image' ? '📷 Image' : '🎵 Audio',
        message_type: type,
        media_url: file_url
      });
    };
    input.click();
  };

  const handleSend = () => {
    if (!message.trim()) return;
    sendMutation.mutate({
      sender_email: user.email,
      sender_name: user.full_name,
      content: message.trim(),
      message_type: 'text'
    });
  };

  const sortedMessages = [...messages].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
  const pinnedMessages = sortedMessages.filter(m => m.is_pinned).slice(0, 3);
  const regularMessages = sortedMessages.filter(m => !m.is_pinned);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!user) return null;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg hover:shadow-xl transition-all flex items-center justify-center text-white z-50"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        {!open && messages.length > 0 && (
          <Badge className="absolute -top-1 -right-1 bg-red-500 text-white border-none text-xs w-5 h-5 flex items-center justify-center p-0">
            {messages.length > 99 ? '99+' : messages.length}
          </Badge>
        )}
      </button>

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">Discussion publique</h3>
              {isAdmin && (
                <Button onClick={() => deleteAllMutation.mutate()} variant="ghost" size="sm" className="text-white hover:bg-white/20 rounded-lg h-7">
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Pinned Messages */}
          {pinnedMessages.length > 0 && (
            <div className="p-2 border-b border-gray-100 bg-amber-50 overflow-x-auto">
              <div className="flex gap-2">
                {pinnedMessages.map(msg => (
                  <div key={msg.id} className="flex-shrink-0 bg-white rounded-lg p-2 border border-amber-200 min-w-[200px]">
                    <div className="flex items-start gap-2">
                      <Pin className="w-3 h-3 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">{msg.sender_name}</p>
                        <p className="text-xs text-gray-600 truncate">{msg.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {regularMessages.map(msg => (
              <div key={msg.id} className={`flex gap-2 ${msg.sender_email === user.email ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${msg.sender_email === user.email ? 'bg-blue-600 text-white' : 'bg-gray-100'} ${msg.is_important ? 'border-2 border-amber-400' : ''}`}>
                  {msg.sender_email !== user.email && (
                    <p className="text-xs font-semibold text-blue-600 mb-1">{msg.sender_name}</p>
                  )}
                  {msg.message_type === 'image' && msg.media_url && (
                    <img src={msg.media_url} alt="" className="rounded-xl max-w-full mb-2" />
                  )}
                  {msg.message_type === 'audio' && msg.media_url && (
                    <audio src={msg.media_url} controls className="mb-2" />
                  )}
                  <p className={`text-sm ${msg.sender_email === user.email ? 'text-white' : 'text-gray-700'}`}>{msg.content}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className={`text-[10px] ${msg.sender_email === user.email ? 'text-blue-200' : 'text-gray-400'}`}>
                      {msg.created_date && format(new Date(msg.created_date), 'HH:mm', { locale: fr })}
                    </p>
                    {isAdmin && (
                      <div className="flex gap-1">
                        <button onClick={() => pinMutation.mutate({ id: msg.id, isPinned: msg.is_pinned })} className={`text-[10px] ${msg.is_pinned ? 'text-amber-400' : msg.sender_email === user.email ? 'text-blue-200' : 'text-gray-400'}`}>
                          <Pin className="w-3 h-3" />
                        </button>
                        <button onClick={() => markImportantMutation.mutate({ id: msg.id, isImportant: msg.is_important })} className={`text-[10px] ${msg.is_important ? 'text-amber-400' : msg.sender_email === user.email ? 'text-blue-200' : 'text-gray-400'}`}>
                          <Star className="w-3 h-3" />
                        </button>
                        <button onClick={() => deleteMutation.mutate(msg.id)} className={`text-[10px] ${msg.sender_email === user.email ? 'text-blue-200' : 'text-gray-400'}`}>
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <button onClick={() => sendMedia('image')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ImageIcon className="w-4 h-4 text-gray-500" />
              </button>
              <button onClick={() => sendMedia('audio')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Mic className="w-4 h-4 text-gray-500" />
              </button>
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Message..."
                className="flex-1 h-9 rounded-full bg-gray-50 border-gray-200"
              />
              <Button onClick={handleSend} disabled={!message.trim() || sendMutation.isPending} size="icon" className="bg-blue-600 hover:bg-blue-700 rounded-full h-9 w-9">
                {sendMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}