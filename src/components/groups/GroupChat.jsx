import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, Image as ImageIcon, Mic, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function GroupChat({ group, open, onClose }) {
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
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
    queryKey: ['groupMessages', group?.id],
    queryFn: () => base44.entities.GroupMessage.filter({ group_id: group.id }, '-created_date', 200),
    enabled: !!group && open,
    refetchInterval: 2000,
  });

  const sendMutation = useMutation({
    mutationFn: (data) => base44.entities.GroupMessage.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groupMessages', group?.id] });
      setMessage('');
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
    input.accept = type === 'image' ? 'image/*' : type === 'video' ? 'video/*' : 'audio/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      sendMutation.mutate({
        group_id: group.id,
        sender_email: user.email,
        sender_name: user.full_name,
        content: type === 'image' ? '📷 Image' : type === 'video' ? '🎥 Vidéo' : '🎵 Audio',
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-full sm:max-w-2xl h-[90vh] sm:h-[80vh] flex flex-col p-0 rounded-none sm:rounded-2xl">
        <DialogHeader className="p-3 sm:p-4 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-2xl">
          <DialogTitle className="flex items-center gap-2 text-white">
            💬 {group?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 bg-gray-50">
          {sortedMessages.map(msg => (
            <div key={msg.id} className={`flex gap-2 ${msg.sender_email === user.email ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-3 py-2 ${msg.sender_email === user.email ? 'bg-blue-600 text-white' : 'bg-white border border-gray-100 shadow-sm'}`}>
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
                  <audio src={msg.media_url} controls className="mb-2" />
                )}
                <p className={`text-sm ${msg.sender_email === user.email ? 'text-white' : 'text-gray-700'}`}>{msg.content}</p>
                <p className={`text-[10px] mt-1 ${msg.sender_email === user.email ? 'text-blue-200' : 'text-gray-400'}`}>
                  {msg.created_date && format(new Date(msg.created_date), 'HH:mm', { locale: fr })}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-2 sm:p-3 border-t border-gray-100 bg-white rounded-b-2xl">
          <div className="flex items-center gap-1 sm:gap-2">
            <button onClick={() => sendMedia('image')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
              <ImageIcon className="w-4 h-4 text-gray-500" />
            </button>
            {!recording ? (
              <button onClick={startRecording} className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
                <Mic className="w-4 h-4 text-gray-500" />
              </button>
            ) : (
              <button onClick={stopRecording} className="p-2 bg-red-500 rounded-lg animate-pulse flex-shrink-0">
                <Mic className="w-4 h-4 text-white" />
              </button>
            )}
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !recording && handleSend()}
              placeholder={recording ? "Enregistrement..." : "Message..."}
              disabled={recording}
              className="flex-1 h-9 rounded-full bg-gray-50 border-gray-200 text-sm"
            />
            <Button onClick={handleSend} disabled={!message.trim() || sendMutation.isPending || recording} size="icon" className="bg-blue-600 hover:bg-blue-700 rounded-full h-9 w-9 flex-shrink-0">
              {sendMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}