import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, Image as ImageIcon, Mic, Loader2, X, Palette, Trash2, Video, Music, File, Smile, Paperclip } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const THEMES = [
  { 
    name: 'Bleu', 
    header: 'from-blue-600 to-indigo-600', 
    bubbleSelf: 'bg-blue-600', 
    bubbleOther: 'bg-white',
    pattern: `data:image/svg+xml,%3Csvg width='80' height='80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%234b5563' fill-opacity='0.03'%3E%3Cpath d='M0 0h40v40H0zM40 40h40v40H40z'/%3E%3Cpath d='M20 20m-8 0a8 8 0 1 0 16 0a8 8 0 1 0 -16 0M60 60m-8 0a8 8 0 1 0 16 0a8 8 0 1 0 -16 0'/%3E%3C/g%3E%3C/svg%3E`,
    bgColor: '#e8f4f8'
  },
  { 
    name: 'Vert', 
    header: 'from-green-600 to-emerald-600', 
    bubbleSelf: 'bg-green-600', 
    bubbleOther: 'bg-white',
    pattern: `data:image/svg+xml,%3Csvg width='80' height='80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%234b5563' fill-opacity='0.03'%3E%3Ccircle cx='20' cy='20' r='5'/%3E%3Ccircle cx='60' cy='20' r='5'/%3E%3Ccircle cx='20' cy='60' r='5'/%3E%3Ccircle cx='60' cy='60' r='5'/%3E%3Cpath d='M40 0v80M0 40h80'/%3E%3C/g%3E%3C/svg%3E`,
    bgColor: '#dcfce7'
  },
  { 
    name: 'Rose', 
    header: 'from-pink-600 to-rose-600', 
    bubbleSelf: 'bg-pink-600', 
    bubbleOther: 'bg-white',
    pattern: `data:image/svg+xml,%3Csvg width='80' height='80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%234b5563' fill-opacity='0.03'%3E%3Cpath d='M40 10l5 15h16l-13 10 5 15-13-10-13 10 5-15-13-10h16z'/%3E%3Ccircle cx='20' cy='60' r='8'/%3E%3Ccircle cx='60' cy='20' r='6'/%3E%3C/g%3E%3C/svg%3E`,
    bgColor: '#fce7f3'
  },
  { 
    name: 'Violet', 
    header: 'from-purple-600 to-violet-600', 
    bubbleSelf: 'bg-purple-600', 
    bubbleOther: 'bg-white',
    pattern: `data:image/svg+xml,%3Csvg width='80' height='80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%234b5563' fill-opacity='0.03'%3E%3Crect x='15' y='15' width='20' height='20' rx='3'/%3E%3Crect x='45' y='15' width='20' height='20' rx='3'/%3E%3Crect x='15' y='45' width='20' height='20' rx='3'/%3E%3Crect x='45' y='45' width='20' height='20' rx='3'/%3E%3C/g%3E%3C/svg%3E`,
    bgColor: '#ede9fe'
  },
  { 
    name: 'Orange', 
    header: 'from-orange-600 to-amber-600', 
    bubbleSelf: 'bg-orange-600', 
    bubbleOther: 'bg-white',
    pattern: `data:image/svg+xml,%3Csvg width='80' height='80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%234b5563' fill-opacity='0.03'%3E%3Cpath d='M40 15l8 15-8 15-8-15zM15 40l15 8-15 8-15-8zM65 40l15 8-15 8-15-8z'/%3E%3Ccircle cx='40' cy='65' r='6'/%3E%3C/g%3E%3C/svg%3E`,
    bgColor: '#fed7aa'
  },
];

export default function GroupChat({ group, open, onClose }) {
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [themeIndex, setThemeIndex] = useState(0);
  const [showThemes, setShowThemes] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        
        // Vérifier si l'utilisateur est admin du groupe
        const admins = await base44.entities.GroupAdmin.filter({ 
          group_id: group?.id, 
          student_email: u.email 
        });
        setIsAdmin(admins.length > 0);
      } catch {}
    };
    if (group?.id) loadUser();
  }, [group?.id]);

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
    queryKey: ['groupMessages', group?.id],
    queryFn: () => base44.entities.GroupMessage.filter({ group_id: group.id }, '-created_date', 200),
    enabled: !!group && open,
    refetchInterval: 2000,
  });

  const { data: reactions = [] } = useQuery({
    queryKey: ['groupReactions', group?.id],
    queryFn: () => base44.entities.MessageReaction.filter({ message_type: 'group' }),
    enabled: !!group && open,
    refetchInterval: 2000,
  });

  const addReaction = async (messageId, emoji) => {
    const existing = reactions.find(r => r.message_id === messageId && r.user_email === user.email && r.reaction === emoji);
    if (existing) {
      await base44.entities.MessageReaction.delete(existing.id);
    } else {
      await base44.entities.MessageReaction.create({
        message_id: messageId,
        message_type: 'group',
        user_email: user.email,
        user_name: user.full_name,
        reaction: emoji
      });
    }
    queryClient.invalidateQueries({ queryKey: ['groupReactions', group?.id] });
  };

  const getReactionCount = (messageId, emoji) => {
    return reactions.filter(r => r.message_id === messageId && r.reaction === emoji).length;
  };

  const hasReacted = (messageId, emoji) => {
    return reactions.some(r => r.message_id === messageId && r.user_email === user.email && r.reaction === emoji);
  };

  const sendMutation = useMutation({
    mutationFn: (data) => base44.entities.GroupMessage.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groupMessages', group?.id] });
      setMessage('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.GroupMessage.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groupMessages', group?.id] });
      toast.success('Message supprimé');
    },
  });

  const handleSend = () => {
    if (!message.trim() || !user) return;
    sendMutation.mutate({
      group_id: group.id,
      sender_email: user.email,
      sender_name: user.full_name,
      content: message.trim(),
      message_type: 'text'
    });
  };

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
        group_id: group.id,
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
          group_id: group.id,
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

  const sortedMessages = [...messages].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!user) return null;

  const currentTheme = THEMES[themeIndex];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-full sm:max-w-2xl h-[90vh] sm:h-[80vh] flex flex-col p-0 rounded-none sm:rounded-2xl">
        <DialogHeader className={`p-3 sm:p-4 border-b border-gray-100 bg-gradient-to-r ${currentTheme.header} text-white rounded-t-2xl`}>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-white">
              💬 {group?.name}
            </DialogTitle>
            <button onClick={() => setShowThemes(!showThemes)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
              <Palette className="w-4 h-4 text-white" />
            </button>
          </div>
          {showThemes && isAdmin && (
            <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
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
        </DialogHeader>

        <div className={`flex-1 overflow-y-auto p-3 sm:p-4 space-y-2`} style={{
          backgroundImage: `url("${currentTheme.pattern}")`,
          backgroundColor: currentTheme.bgColor
        }}>
          {sortedMessages.map(msg => (
            <div key={msg.id} className={`flex gap-2 ${msg.sender_email === user.email ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-3 py-2 shadow-md ${msg.sender_email === user.email ? currentTheme.bubbleSelf + ' text-white' : currentTheme.bubbleOther + ' border border-gray-100'}`}>
                {msg.sender_email !== user.email && (
                  <p className={`text-xs font-semibold mb-1 ${msg.sender_email === user.email ? 'text-white/80' : 'text-blue-600'}`}>{msg.sender_name}</p>
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
                  <a href={msg.media_url} download target="_blank" rel="noreferrer" className={`flex items-center gap-2 p-2 rounded-lg mb-2 hover:opacity-80 transition-opacity ${msg.sender_email === user.email ? 'bg-white/10' : 'bg-gray-100'}`}>
                    <File className="w-4 h-4" />
                    <span className="text-xs underline">Télécharger le document</span>
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
                    <button 
                      onClick={() => deleteMutation.mutate(msg.id)} 
                      className={`text-[10px] hover:opacity-70 ${msg.sender_email === user.email ? 'text-white/70' : 'text-gray-400'}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-3 border-t border-gray-100 bg-white rounded-b-2xl">
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 hover:bg-gray-100 rounded-xl transition-all hover:scale-105 flex-shrink-0">
                  <Paperclip className="w-5 h-5 text-gray-600" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem onClick={() => sendMedia('image')} className="gap-2 cursor-pointer">
                  <ImageIcon className="w-4 h-4 text-blue-600" />
                  <span>Image</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => sendMedia('video')} className="gap-2 cursor-pointer">
                  <Video className="w-4 h-4 text-purple-600" />
                  <span>Vidéo</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => sendMedia('audio')} className="gap-2 cursor-pointer">
                  <Music className="w-4 h-4 text-green-600" />
                  <span>Musique</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => sendMedia('document')} className="gap-2 cursor-pointer">
                  <File className="w-4 h-4 text-orange-600" />
                  <span>Document</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {!recording ? (
              <button onClick={startRecording} className="p-2 hover:bg-gray-100 rounded-xl transition-all hover:scale-105 flex-shrink-0" title="Message vocal">
                <Mic className="w-5 h-5 text-gray-600" />
              </button>
            ) : (
              <button onClick={stopRecording} className="p-2 bg-red-500 rounded-xl animate-pulse flex-shrink-0">
                <Mic className="w-5 h-5 text-white" />
              </button>
            )}
            
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !recording && handleSend()}
              placeholder={recording ? "🔴 Enregistrement..." : "Écrivez votre message..."}
              disabled={recording}
              className="flex-1 h-10 rounded-full bg-gray-50 border-gray-200"
            />
            
            <Button onClick={handleSend} disabled={!message.trim() || sendMutation.isPending || recording} size="icon" className={`${currentTheme.bubbleSelf} hover:opacity-90 rounded-full h-10 w-10 flex-shrink-0 shadow-lg`}>
              {sendMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}