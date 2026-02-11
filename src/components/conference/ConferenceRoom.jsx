import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Mic, MicOff, MessageCircle, X, Hand, Users, Radio, Send, Smile, PhoneOff, Volume2, VolumeX, Shield, Loader2, Video, VideoOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function ConferenceRoom({ conference, userEmail, userName, isAdmin, onClose }) {
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(conference.conference_type === 'video');
  const [handRaised, setHandRaised] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [messageInput, setMessageInput] = useState('');
  const [localStream, setLocalStream] = useState(null);
  const [participantId, setParticipantId] = useState(null);
  const localVideoRef = useRef(null);
  const jitsiContainerRef = useRef(null);
  const jitsiApiRef = useRef(null);
  const queryClient = useQueryClient();
  const isConferenceActive = conference.status === 'en_cours';

  // Fetch participants
  const { data: participants = [] } = useQuery({
    queryKey: ['conferenceParticipants', conference.id],
    queryFn: () => base44.entities.ConferenceParticipant.filter({ conference_id: conference.id }),
    refetchInterval: 2000,
  });

  // Fetch messages
  const { data: messages = [] } = useQuery({
    queryKey: ['conferenceMessages', conference.id],
    queryFn: () => base44.entities.ConferenceMessage.filter({ conference_id: conference.id }),
    refetchInterval: 1000,
  });

  // Fetch reactions
  const { data: reactions = [] } = useQuery({
    queryKey: ['conferenceReactions', conference.id],
    queryFn: () => base44.entities.ConferenceReaction.list('-created_date', 50),
    refetchInterval: 2000,
  });

  const recentReactions = reactions
    .filter(r => r.conference_id === conference.id)
    .filter(r => Date.now() - new Date(r.created_date).getTime() < 5000);

  // Join conference
  useEffect(() => {
    joinConference();
    return () => leaveConference();
  }, []);

  // Setup Jitsi Meet
  useEffect(() => {
    if (isConferenceActive && jitsiContainerRef.current && !jitsiApiRef.current) {
      const domain = 'meet.jit.si';
      const options = {
        roomName: conference.access_code,
        width: '100%',
        height: '100%',
        parentNode: jitsiContainerRef.current,
        userInfo: {
          displayName: userName,
          email: userEmail
        },
        configOverwrite: {
          startWithAudioMuted: !micEnabled,
          startWithVideoMuted: conference.conference_type === 'audio',
          prejoinPageEnabled: false,
          disableDeepLinking: true,
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'desktop', 'fullscreen',
            'fodeviceselection', 'hangup', 'chat', 'raisehand',
            'videoquality', 'tileview', 'settings'
          ],
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
        }
      };

      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.async = true;
      script.onload = () => {
        jitsiApiRef.current = new window.JitsiMeetExternalAPI(domain, options);
        
        jitsiApiRef.current.addEventListener('participantRoleChanged', (event) => {
          if (event.role === 'moderator' && isAdmin) {
            jitsiApiRef.current.executeCommand('toggleLobby', true);
          }
        });
      };
      document.body.appendChild(script);

      return () => {
        if (jitsiApiRef.current) {
          jitsiApiRef.current.dispose();
          jitsiApiRef.current = null;
        }
        const scriptTag = document.querySelector('script[src="https://meet.jit.si/external_api.js"]');
        if (scriptTag) scriptTag.remove();
      };
    }
  }, [isConferenceActive]);

  const stopMedia = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.dispose();
      jitsiApiRef.current = null;
    }
  };

  const joinConference = async () => {
    const participant = await base44.entities.ConferenceParticipant.create({
      conference_id: conference.id,
      user_email: userEmail,
      user_name: userName,
      is_admin: isAdmin,
      mic_enabled: true,
      is_connected: true
    });
    setParticipantId(participant.id);
  };

  const leaveConference = async () => {
    if (participantId) {
      await base44.entities.ConferenceParticipant.update(participantId, { is_connected: false });
    }
    stopMedia();
  };

  const toggleMic = async () => {
    if (!isConferenceActive) return;
    const myParticipant = participants.find(p => p.user_email === userEmail);
    if (myParticipant?.mic_blocked) {
      toast.error('Votre micro est bloqué par l\'administrateur');
      return;
    }
    const newState = !micEnabled;
    setMicEnabled(newState);
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand('toggleAudio');
    }
    if (participantId) {
      await base44.entities.ConferenceParticipant.update(participantId, { mic_enabled: newState });
    }
  };

  const toggleVideo = async () => {
    if (!isConferenceActive || conference.conference_type !== 'video') return;
    const newState = !videoEnabled;
    setVideoEnabled(newState);
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand('toggleVideo');
    }
  };

  const toggleHand = async () => {
    const newState = !handRaised;
    setHandRaised(newState);
    if (participantId) {
      await base44.entities.ConferenceParticipant.update(participantId, { hand_raised: newState });
    }
    queryClient.invalidateQueries({ queryKey: ['conferenceParticipants'] });
  };

  const sendMessage = async () => {
    if (!messageInput.trim()) return;
    if (!isConferenceActive) {
      toast.error('La conférence est terminée');
      return;
    }
    await base44.entities.ConferenceMessage.create({
      conference_id: conference.id,
      sender_email: userEmail,
      sender_name: userName,
      content: messageInput.trim(),
      is_admin: isAdmin
    });
    setMessageInput('');
    queryClient.invalidateQueries({ queryKey: ['conferenceMessages'] });
  };

  const sendReaction = async (reaction) => {
    await base44.entities.ConferenceReaction.create({
      conference_id: conference.id,
      user_email: userEmail,
      user_name: userName,
      reaction
    });
    queryClient.invalidateQueries({ queryKey: ['conferenceReactions'] });
  };

  const blockMic = async (participantIdToBlock) => {
    const participant = participants.find(p => p.id === participantIdToBlock);
    await base44.entities.ConferenceParticipant.update(participantIdToBlock, { 
      mic_blocked: !participant.mic_blocked,
      mic_enabled: participant.mic_blocked ? participant.mic_enabled : false
    });
    queryClient.invalidateQueries({ queryKey: ['conferenceParticipants'] });
    toast.success(participant.mic_blocked ? 'Micro débloqué' : 'Micro bloqué');
  };

  const connectedParticipants = participants.filter(p => p.is_connected);
  const myParticipant = participants.find(p => p.user_email === userEmail);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] rounded-3xl p-0 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Radio className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">{conference.title}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge className="bg-white/20 text-white border-0 text-xs">
                  <Users className="w-3 h-3 mr-1" />
                  {connectedParticipants.length} en ligne
                </Badge>
                <Badge className="bg-red-500 text-white border-0 text-xs animate-pulse">
                  🔴 EN DIRECT
                </Badge>
              </div>
            </div>
          </div>
          <Button onClick={onClose} variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-xl">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Jitsi Meet Container */}
            <div className="flex-1 bg-gray-900 relative">
              {isConferenceActive ? (
                <div ref={jitsiContainerRef} className="w-full h-full" />
              ) : (
                <div className="flex items-center justify-center h-full bg-gradient-to-b from-gray-800 to-gray-900">
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center mx-auto mb-4">
                      <Radio className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-300 mb-2">Conférence terminée</h3>
                    <p className="text-gray-500">Vous pouvez consulter le chat</p>
                  </div>
                </div>
              )}

            </div>

            {/* Controls - Chat only when inactive */}
            <div className="shrink-0 bg-white border-t border-gray-200 px-6 py-4">
              {!isConferenceActive && (
                <div className="flex items-center justify-center gap-3">
                  <Button
                    onClick={() => setChatOpen(!chatOpen)}
                    size="lg"
                    variant="outline"
                    className="rounded-2xl h-14 px-6"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Voir les discussions
                    {messages.length > 0 && (
                      <Badge className="ml-2 bg-blue-600 text-white">{messages.length}</Badge>
                    )}
                  </Button>
                  <Button
                    onClick={onClose}
                    size="lg"
                    variant="outline"
                    className="rounded-2xl h-14 px-6"
                  >
                    <X className="w-5 h-5 mr-2" />
                    Fermer
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Chat Sidebar - Always visible when conference is inactive */}
          {(chatOpen || !isConferenceActive) && (
            <motion.div
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              className="w-80 bg-white border-l border-gray-200 flex flex-col"
            >
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                <h3 className="font-bold text-gray-900">Discussion</h3>
                {isConferenceActive && (
                  <Button onClick={() => setChatOpen(false)} variant="ghost" size="icon" className="h-8 w-8">
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-400 text-sm py-8">
                    Aucun message pour le moment
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMine = msg.sender_email === userEmail;
                    return (
                      <div key={msg.id} className={`flex gap-2 ${isMine ? 'justify-end' : ''}`}>
                        {!isMine && (
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                            msg.is_admin ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white' : 'bg-gray-300 text-gray-700'
                          }`}>
                            {msg.sender_name[0]}
                          </div>
                        )}
                        <div className={`max-w-[75%] rounded-2xl px-3 py-2 ${
                          isMine
                            ? 'bg-blue-600 text-white'
                            : msg.is_admin
                            ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-xs font-semibold opacity-90">{msg.sender_name}</p>
                            {msg.is_admin && !isMine && (
                              <Badge className="bg-white/20 text-white border-0 text-[10px] px-1 py-0">
                                <Shield className="w-2.5 h-2.5 mr-0.5" />
                                Admin
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm">{msg.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {format(new Date(msg.created_date), 'HH:mm')}
                          </p>
                        </div>
                        {isMine && (
                          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                            {userName[0]}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {isConferenceActive ? (
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex gap-2">
                    <Input
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Votre message..."
                      className="rounded-xl"
                    />
                    <Button onClick={sendMessage} size="icon" className="rounded-xl bg-blue-600 hover:bg-blue-700">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-4 border-t border-gray-200 bg-amber-50 text-amber-700 text-sm text-center">
                  La conférence est terminée
                </div>
              )}
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}