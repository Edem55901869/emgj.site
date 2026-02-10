import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, Send, X, Image as ImageIcon, Mic, Trash2, Pin, Star, Loader2, Palette, Video, Music, File, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const THEMES = [
  { 
    name: 'Bleu', 
    gradient: 'from-blue-900/95 via-indigo-900/95 to-purple-900/95', 
    bubbleSelf: 'bg-blue-600', 
    bubbleOther: 'bg-white',
    pattern: `data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M30 15l-7.5 7.5L15 15l7.5-7.5L30 15zM15 30l-7.5 7.5L0 30l7.5-7.5L15 30z'/%3E%3C/g%3E%3C/svg%3E`
  },
  { 
    name: 'Vert', 
    gradient: 'from-green-900/95 via-emerald-900/95 to-teal-900/95', 
    bubbleSelf: 'bg-green-600', 
    bubbleOther: 'bg-white',
    pattern: `data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='15' cy='15' r='3'/%3E%3Ccircle cx='45' cy='15' r='3'/%3E%3Ccircle cx='15' cy='45' r='3'/%3E%3Ccircle cx='45' cy='45' r='3'/%3E%3C/g%3E%3C/svg%3E`
  },
  { 
    name: 'Rose', 
    gradient: 'from-pink-900/95 via-rose-900/95 to-red-900/95', 
    bubbleSelf: 'bg-pink-600', 
    bubbleOther: 'bg-white',
    pattern: `data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M30 0l5 15h16l-13 10 5 15-13-10-13 10 5-15-13-10h16z'/%3E%3C/g%3E%3C/svg%3E`
  },
  { 
    name: 'Violet', 
    gradient: 'from-purple-900/95 via-violet-900/95 to-indigo-900/95', 
    bubbleSelf: 'bg-purple-600', 
    bubbleOther: 'bg-white',
    pattern: `data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Crect x='10' y='10' width='15' height='15'/%3E%3Crect x='35' y='10' width='15' height='15'/%3E%3Crect x='10' y='35' width='15' height='15'/%3E%3Crect x='35' y='35' width='15' height='15'/%3E%3C/g%3E%3C/svg%3E`
  },
  { 
    name: 'Orange', 
    gradient: 'from-orange-900/95 via-amber-900/95 to-yellow-900/95', 
    bubbleSelf: 'bg-orange-600', 
    bubbleOther: 'bg-white',
    pattern: `data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M30 10l5 10-5 10-5-10zM10 30l10 5-10 5-10-5zM50 30l10 5-10 5-10-5z'/%3E%3C/g%3E%3C/svg%3E`
  },
];

export default function PublicChat({ isAdmin = false, open: externalOpen, onClose }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = onClose ? (val) => { if (!val) onClose(); } : setInternalOpen;
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [themeIndex, setThemeIndex] = useState(0);
  const [showThemes, setShowThemes] = useState(false);
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

  // Charger le thème global configuré par l'admin
  const { data: themeConfig } = useQuery({
    queryKey: ['chatThemeConfig'],
    queryFn: async () => {
      const configs = await base44.entities.ChatThemeConfig.filter({ is_active: true });
      return configs[0] || { theme_index: 0 };
    },
  });

  useEffect(() => {
    if (themeConfig) {
      setThemeIndex(themeConfig.theme_index || 0);
    }
  }, [themeConfig]);

  const { data: messages = [] } = useQuery({
    queryKey: ['publicMessages'],
    queryFn: () => base44.entities.PublicMessage.list('-created_date', 200),
    enabled: open,
    refetchInterval: 3000,
  });

  const { data: reactions = [] } = useQuery({
    queryKey: ['messageReactions'],
    queryFn: () => base44.entities.MessageReaction.filter({ message_type: 'public' }),
    enabled: open,
    refetchInterval: 3000,
  });

  const addReaction = async (messageId, emoji) => {
    const existing = reactions.find(r => r.message_id === messageId && r.user_email === user.email && r.reaction === emoji);
    if (existing) {
      await base44.entities.MessageReaction.delete(existing.id);
    } else {
      await base44.entities.MessageReaction.create({
        message_id: messageId,
        message_type: 'public',
        user_email: user.email,
        user_name: user.full_name,
        reaction: emoji
      });
    }
    queryClient.invalidateQueries({ queryKey: ['messageReactions'] });
  };

  const getReactionCount = (messageId, emoji) => {
    return reactions.filter(r => r.message_id === messageId && r.reaction === emoji).length;
  };

  const hasReacted = (messageId, emoji) => {
    return reactions.some(r => r.message_id === messageId && r.user_email === user.email && r.reaction === emoji);
  };

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
    input.accept = type === 'image' ? 'image/*' : type === 'video' ? 'video/*' : type === 'audio' ? 'audio/*' : '*/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const contentMap = {
        image: '📷 Image',
        video: '🎥 Vidéo',
        audio: '🎵 Audio',
        document: '📄 Document'
      };
      sendMutation.mutate({
        sender_email: user.email,
        sender_name: user.full_name,
        content: contentMap[type] || 'Fichier',
        message_type: type,
        media_url: file_url
      });
    };
    input.click();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const file = new File([blob], 'voice.webm', { type: 'audio/webm' });
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        sendMutation.mutate({
          sender_email: user.email,
          sender_name: user.full_name,
          content: '🎤 Message vocal',
          message_type: 'audio',
          media_url: file_url
        });
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
    } catch (err) {
      toast.error('Erreur d\'accès au microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
      setMediaRecorder(null);
    }
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

  const currentTheme = THEMES[themeIndex];

  return (
    <>
      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-20 right-6 w-[95vw] max-w-md h-[70vh] max-h-[550px] bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50" style={{
          backgroundImage: `url("${currentTheme.pattern}")`,
          backgroundColor: '#0a1628'
        }}>
          <div className={`absolute inset-0 bg-gradient-to-br ${currentTheme.gradient} rounded-2xl`} />
          
          {/* Header */}
          <div className="relative p-4 border-b border-white/10 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">💬 Discussion publique</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowThemes(!showThemes)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                  <Palette className="w-4 h-4 text-white/70" />
                </button>
                {isAdmin && (
                  <Button onClick={() => deleteAllMutation.mutate()} variant="ghost" size="sm" className="text-white hover:bg-white/10 rounded-lg h-7">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
                <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                  <X className="w-4 h-4 text-white/70" />
                </button>
              </div>
            </div>
            
            {/* Theme Selector */}
            {showThemes && isAdmin && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                {THEMES.map((theme, i) => (
                  <button 
                    key={i} 
                    onClick={async () => { 
                      setThemeIndex(i); 
                      setShowThemes(false);
                      // Sauvegarder le thème pour tous les utilisateurs
                      const configs = await base44.entities.ChatThemeConfig.filter({ is_active: true });
                      if (configs.length > 0) {
                        await base44.entities.ChatThemeConfig.update(configs[0].id, { theme_index: i });
                      } else {
                        await base44.entities.ChatThemeConfig.create({ theme_index: i, is_active: true });
                      }
                      queryClient.invalidateQueries({ queryKey: ['chatThemeConfig'] });
                      toast.success('Thème appliqué pour tous');
                    }} 
                    className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${i === themeIndex ? 'bg-white text-gray-900' : 'bg-white/20 text-white hover:bg-white/30'}`}
                  >
                    {theme.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Pinned Messages */}
          {pinnedMessages.length > 0 && (
            <div className="relative p-2 border-b border-white/10 bg-white/5 overflow-x-auto">
              <div className="flex gap-2">
                {pinnedMessages.map(msg => (
                  <div key={msg.id} className="flex-shrink-0 bg-white/10 backdrop-blur-md rounded-lg p-2 border border-white/20 min-w-[200px]">
                    <div className="flex items-start gap-2">
                      <Pin className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{msg.sender_name}</p>
                        <p className="text-xs text-white/70 truncate">{msg.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="relative flex-1 overflow-y-auto p-4 space-y-3">
            {regularMessages.map(msg => (
              <div key={msg.id} className={`flex gap-2 ${msg.sender_email === user.email ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2 shadow-md ${msg.sender_email === user.email ? currentTheme.bubbleSelf + ' text-white' : currentTheme.bubbleOther + ' border border-gray-100'} ${msg.is_important ? 'border-2 border-amber-400 shadow-lg' : ''}`}>
                  {msg.sender_email !== user.email && (
                    <p className="text-xs font-semibold text-blue-600 mb-1">{msg.sender_name}</p>
                  )}
                  {msg.message_type === 'image' && msg.media_url && (
                    <img src={msg.media_url} alt="" className="rounded-xl max-w-full mb-2" />
                  )}
                  {msg.message_type === 'video' && msg.media_url && (
                    <video src={msg.media_url} controls className="rounded-xl max-w-full mb-2" />
                  )}
                  {msg.message_type === 'audio' && msg.media_url && (
                    <audio src={msg.media_url} controls className="mb-2 w-full" />
                  )}
                  {msg.message_type === 'document' && msg.media_url && (
                    <a href={msg.media_url} target="_blank" rel="noreferrer" className={`flex items-center gap-2 p-2 rounded-lg mb-2 ${msg.sender_email === user.email ? 'bg-white/10' : 'bg-gray-100'}`}>
                      <File className="w-4 h-4" />
                      <span className="text-xs">Télécharger le document</span>
                    </a>
                  )}
                  <p className={`text-sm ${msg.sender_email === user.email ? 'text-white' : 'text-gray-700'}`}>{msg.content}</p>
                  
                  {/* Réactions */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {['❤️', '👍', '😂', '😮', '😢', '🙏'].map(emoji => {
                      const count = getReactionCount(msg.id, emoji);
                      const reacted = hasReacted(msg.id, emoji);
                      if (count === 0 && !reacted) return null;
                      return (
                        <button
                          key={emoji}
                          onClick={() => addReaction(msg.id, emoji)}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all ${
                            reacted 
                              ? msg.sender_email === user.email ? 'bg-white/30' : 'bg-blue-100' 
                              : msg.sender_email === user.email ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          <span>{emoji}</span>
                          <span className={`font-medium ${msg.sender_email === user.email ? 'text-white' : 'text-gray-700'}`}>{count}</span>
                        </button>
                      );
                    })}
                    <button
                      onClick={() => {
                        const emoji = prompt('Choisissez une réaction : ❤️ 👍 😂 😮 😢 🙏');
                        if (emoji && ['❤️', '👍', '😂', '😮', '😢', '🙏'].includes(emoji)) {
                          addReaction(msg.id, emoji);
                        }
                      }}
                      className={`p-0.5 rounded-full transition-all ${msg.sender_email === user.email ? 'hover:bg-white/20' : 'hover:bg-gray-200'}`}
                      title="Ajouter une réaction"
                    >
                      <Smile className={`w-3 h-3 ${msg.sender_email === user.email ? 'text-white/50' : 'text-gray-400'}`} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <p className={`text-[10px] ${msg.sender_email === user.email ? 'text-white/70' : 'text-gray-400'}`}>
                      {msg.created_date && format(new Date(msg.created_date), 'HH:mm', { locale: fr })}
                    </p>
                    {(isAdmin || msg.sender_email === user.email) && (
                      <div className="flex gap-1">
                        {isAdmin && (
                          <>
                            <button onClick={() => pinMutation.mutate({ id: msg.id, isPinned: msg.is_pinned })} className={`text-[10px] ${msg.is_pinned ? 'text-amber-400' : msg.sender_email === user.email ? 'text-white/70' : 'text-gray-400'}`}>
                              <Pin className="w-3 h-3" />
                            </button>
                            <button onClick={() => markImportantMutation.mutate({ id: msg.id, isImportant: msg.is_important })} className={`text-[10px] ${msg.is_important ? 'text-amber-400' : msg.sender_email === user.email ? 'text-white/70' : 'text-gray-400'}`}>
                              <Star className="w-3 h-3" />
                            </button>
                          </>
                        )}
                        {(isAdmin || msg.sender_email === user.email) && (
                          <button onClick={() => deleteMutation.mutate(msg.id)} className={`text-[10px] ${msg.sender_email === user.email ? 'text-white/70' : 'text-gray-400'}`}>
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="relative p-3 border-t border-white/10">
            <div className="flex items-center gap-1">
              <button onClick={() => sendMedia('image')} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Image">
                <ImageIcon className="w-4 h-4 text-white/70" />
              </button>
              <button onClick={() => sendMedia('video')} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Vidéo">
                <Video className="w-4 h-4 text-white/70" />
              </button>
              <button onClick={() => sendMedia('audio')} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Musique">
                <Music className="w-4 h-4 text-white/70" />
              </button>
              <button onClick={() => sendMedia('document')} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Document">
                <File className="w-4 h-4 text-white/70" />
              </button>
              {!recording ? (
                <button onClick={startRecording} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Vocal">
                  <Mic className="w-4 h-4 text-white/70" />
                </button>
              ) : (
                <button onClick={stopRecording} className="p-2 bg-red-500 rounded-lg animate-pulse">
                  <Mic className="w-4 h-4 text-white" />
                </button>
              )}
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !recording && handleSend()}
                placeholder={recording ? "Enregistrement..." : "Message..."}
                disabled={recording}
                className="flex-1 h-9 rounded-full bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
              <Button onClick={handleSend} disabled={!message.trim() || sendMutation.isPending || recording} size="icon" className="bg-blue-600 hover:bg-blue-700 rounded-full h-9 w-9">
                {sendMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}