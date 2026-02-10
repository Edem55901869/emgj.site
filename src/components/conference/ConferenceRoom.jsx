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

  // Setup media
  useEffect(() => {
    if (isConferenceActive && (micEnabled || videoEnabled) && !localStream) {
      setupMedia();
    } else if ((!micEnabled && !videoEnabled) && localStream) {
      stopMedia();
    }
  }, [micEnabled, videoEnabled, isConferenceActive]);

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const setupMedia = async () => {
    try {
      const constraints = {
        audio: micEnabled,
        video: conference.conference_type === 'video' && videoEnabled ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        } : false
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
    } catch (error) {
      toast.error('Impossible d\'accéder au microphone/caméra');
      setMicEnabled(false);
      setVideoEnabled(false);
    }
  };

  const stopMedia = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
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
    if (localStream) {
      localStream.getAudioTracks().forEach(track => track.enabled = newState);
    }
    if (participantId) {
      await base44.entities.ConferenceParticipant.update(participantId, { mic_enabled: newState });
    }
  };

  const toggleVideo = async () => {
    if (!isConferenceActive || conference.conference_type !== 'video') return;
    const newState = !videoEnabled;
    setVideoEnabled(newState);
    if (localStream) {
      localStream.getVideoTracks().forEach(track => track.enabled = newState);
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
            {/* Participants Grid */}
            <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-50 to-white">
              {conference.conference_type === 'video' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Local Video */}
                  {isConferenceActive && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative bg-gray-900 rounded-2xl overflow-hidden aspect-video border-2 border-green-400 shadow-lg"
                    >
                      <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                      {!videoEnabled && (
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-2">
                              <span className="text-3xl font-bold text-white">{userName[0]}</span>
                            </div>
                            <p className="text-white font-semibold">{userName} (Vous)</p>
                          </div>
                        </div>
                      )}
                      <div className="absolute bottom-3 left-3 flex items-center gap-2">
                        <Badge className="bg-black/50 text-white backdrop-blur-sm">Vous</Badge>
                        {micEnabled ? (
                          <Volume2 className="w-4 h-4 text-green-400" />
                        ) : (
                          <VolumeX className="w-4 h-4 text-red-400" />
                        )}
                      </div>
                    </motion.div>
                  )}
                  {/* Other Participants Videos */}
                  {connectedParticipants.filter(p => p.user_email !== userEmail).map((p) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`relative bg-gray-900 rounded-2xl overflow-hidden aspect-video border-2 ${
                        p.mic_enabled ? 'border-green-400 shadow-lg' : 'border-gray-600'
                      }`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                        <div className="text-center">
                          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-2 ${
                            p.is_admin ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gray-600'
                          }`}>
                            <span className="text-3xl font-bold text-white">{p.user_name[0]}</span>
                          </div>
                          <p className="text-white font-semibold">{p.user_name}</p>
                          {p.is_admin && (
                            <Badge className="bg-blue-500 text-white text-xs mt-1">
                              <Shield className="w-3 h-3 mr-1" />
                              Admin
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="absolute bottom-3 left-3 flex items-center gap-2">
                        {p.mic_enabled ? (
                          <Volume2 className="w-4 h-4 text-green-400" />
                        ) : (
                          <VolumeX className="w-4 h-4 text-gray-400" />
                        )}
                        {p.hand_raised && (
                          <Hand className="w-4 h-4 text-amber-400 animate-bounce" />
                        )}
                      </div>
                      {isAdmin && !p.is_admin && (
                        <div className="absolute top-3 right-3">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => blockMic(p.id)}
                            className="text-xs h-7 bg-black/50 text-white hover:bg-black/70"
                          >
                            {p.mic_blocked ? 'Débloquer' : 'Bloquer'}
                          </Button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {connectedParticipants.map((p) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`relative bg-white rounded-2xl border-2 p-4 ${
                        p.mic_enabled ? 'border-green-400 shadow-lg shadow-green-100' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex flex-col items-center text-center gap-2">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl ${
                          p.is_admin ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white' :
                          'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700'
                        }`}>
                          {p.user_name[0]}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-sm">{p.user_name}</p>
                          {p.is_admin && (
                            <Badge className="bg-blue-100 text-blue-700 text-xs mt-1">
                              <Shield className="w-3 h-3 mr-1" />
                              Admin
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {p.mic_enabled ? (
                            <Volume2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <VolumeX className="w-4 h-4 text-gray-400" />
                          )}
                          {p.hand_raised && (
                            <Hand className="w-4 h-4 text-amber-600 animate-bounce" />
                          )}
                          {p.mic_blocked && (
                            <Badge className="bg-red-100 text-red-700 text-xs">Bloqué</Badge>
                          )}
                        </div>
                        {isAdmin && !p.is_admin && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => blockMic(p.id)}
                            className="text-xs h-7"
                          >
                            {p.mic_blocked ? 'Débloquer' : 'Bloquer'}
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Floating Reactions */}
              <AnimatePresence>
                {recentReactions.map((r, i) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 1, y: 0, x: Math.random() * 200 - 100 }}
                    animate={{ opacity: 0, y: -200 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 3 }}
                    className="fixed bottom-32 left-1/2 text-4xl pointer-events-none"
                    style={{ marginLeft: i * 30 }}
                  >
                    {r.reaction}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="shrink-0 bg-white border-t border-gray-200 px-6 py-4">
              {isConferenceActive ? (
                <>
                  <div className="flex items-center justify-center gap-3 flex-wrap">
                    <Button
                      onClick={toggleMic}
                      size="lg"
                      disabled={myParticipant?.mic_blocked}
                      className={`rounded-2xl h-14 px-6 ${
                        micEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                      }`}
                    >
                      {micEnabled ? <Mic className="w-5 h-5 mr-2" /> : <MicOff className="w-5 h-5 mr-2" />}
                      {micEnabled ? 'Micro' : 'Micro'}
                    </Button>

                    {conference.conference_type === 'video' && (
                      <Button
                        onClick={toggleVideo}
                        size="lg"
                        className={`rounded-2xl h-14 px-6 ${
                          videoEnabled ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'
                        }`}
                      >
                        {videoEnabled ? <Video className="w-5 h-5 mr-2" /> : <VideoOff className="w-5 h-5 mr-2" />}
                        Caméra
                      </Button>
                    )}

                    <Button
                      onClick={toggleHand}
                      size="lg"
                      variant={handRaised ? 'default' : 'outline'}
                      className={`rounded-2xl h-14 px-6 ${handRaised ? 'bg-amber-600 hover:bg-amber-700 text-white' : ''}`}
                    >
                      <Hand className="w-5 h-5 mr-2" />
                      Main
                    </Button>

                    <Button
                      onClick={() => setChatOpen(!chatOpen)}
                      size="lg"
                      variant="outline"
                      className="rounded-2xl h-14 px-6"
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Chat
                      {messages.length > 0 && (
                        <Badge className="ml-2 bg-blue-600 text-white">{messages.length}</Badge>
                      )}
                    </Button>

                    <Button
                      onClick={onClose}
                      size="lg"
                      variant="destructive"
                      className="rounded-2xl h-14 px-6"
                    >
                      <PhoneOff className="w-5 h-5 mr-2" />
                      Quitter
                    </Button>
                  </div>
                </>
              ) : (
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

              {/* Reactions Bar */}
              {isConferenceActive && (
                <div className="flex items-center justify-center gap-2 mt-3">
                  {['👍', '❤️', '👏', '🎉', '🔥'].map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => sendReaction(emoji)}
                      className="text-2xl hover:scale-125 transition-transform"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Chat Sidebar */}
          {chatOpen && (
            <motion.div
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              className="w-80 bg-white border-l border-gray-200 flex flex-col"
            >
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                <h3 className="font-bold text-gray-900">Discussion</h3>
                <Button onClick={() => setChatOpen(false)} variant="ghost" size="icon" className="h-8 w-8">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-400 text-sm py-8">
                    Aucun message pour le moment
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-2 ${msg.sender_email === userEmail ? 'justify-end' : ''}`}>
                      <div className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                        msg.sender_email === userEmail
                          ? 'bg-blue-600 text-white'
                          : msg.is_admin
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className="text-xs font-semibold mb-1 opacity-80">{msg.sender_name}</p>
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {format(new Date(msg.created_date), 'HH:mm')}
                        </p>
                      </div>
                    </div>
                  ))
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