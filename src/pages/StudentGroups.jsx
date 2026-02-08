import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Send, Image, Mic, Loader2, Check, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import StudentBottomNav from '../components/student/StudentBottomNav';

export default function StudentGroups() {
  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const load = async () => {
      const u = await base44.auth.me();
      setUser(u);
      const students = await base44.entities.Student.filter({ user_email: u.email });
      if (students.length > 0) setStudent(students[0]);
      setLoading(false);
    };
    load();
  }, []);

  const { data: groups = [] } = useQuery({
    queryKey: ['groups'],
    queryFn: () => base44.entities.Group.list(),
    enabled: !loading,
  });

  const { data: memberships = [] } = useQuery({
    queryKey: ['memberships', user?.email],
    queryFn: () => base44.entities.GroupMembership.filter({ user_email: user.email }),
    enabled: !!user,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['groupMessages', selectedGroup?.id],
    queryFn: () => base44.entities.GroupMessage.filter({ group_id: selectedGroup.id }, '-created_date', 100),
    enabled: !!selectedGroup,
    refetchInterval: 3000,
  });

  const joinMutation = useMutation({
    mutationFn: (groupId) => base44.entities.GroupMembership.create({
      group_id: groupId,
      user_email: user.email,
      student_name: `${student.first_name} ${student.last_name}`,
      status: 'en_attente'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memberships'] });
      toast.success('Demande envoyée !');
    },
  });

  const sendMessage = async () => {
    if (!message.trim()) return;
    await base44.entities.GroupMessage.create({
      group_id: selectedGroup.id,
      sender_email: user.email,
      sender_name: `${student.first_name} ${student.last_name}`,
      content: message.trim(),
      message_type: 'text'
    });
    setMessage('');
    queryClient.invalidateQueries({ queryKey: ['groupMessages'] });
  };

  const sendMedia = async (type) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = type === 'image' ? 'image/*' : 'audio/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.GroupMessage.create({
        group_id: selectedGroup.id,
        sender_email: user.email,
        sender_name: `${student.first_name} ${student.last_name}`,
        content: type === 'image' ? '📷 Photo' : '🎵 Audio',
        message_type: type,
        media_url: file_url
      });
      queryClient.invalidateQueries({ queryKey: ['groupMessages'] });
    };
    input.click();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  const getMembershipStatus = (groupId) => {
    const m = memberships.find(m => m.group_id === groupId);
    return m?.status;
  };

  if (selectedGroup) {
    const membership = memberships.find(m => m.group_id === selectedGroup.id);
    const isAccepted = membership?.status === 'accepté';
    const sortedMessages = [...messages].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
          <Button variant="ghost" size="sm" onClick={() => setSelectedGroup(null)} className="rounded-xl">←</Button>
          <div>
            <h2 className="font-semibold text-gray-900">{selectedGroup.name}</h2>
            <p className="text-xs text-gray-500">{selectedGroup.members_count || 0} membres</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-32">
          {sortedMessages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender_email === user.email ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${msg.sender_email === user.email ? 'bg-blue-600 text-white' : 'bg-white border border-gray-100'}`}>
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
                <p className={`text-[10px] mt-1 ${msg.sender_email === user.email ? 'text-blue-200' : 'text-gray-400'}`}>
                  {msg.created_date && format(new Date(msg.created_date), 'HH:mm', { locale: fr })}
                </p>
              </div>
            </div>
          ))}
        </div>

        {isAccepted && (
          <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3">
            <div className="max-w-2xl mx-auto flex items-center gap-2">
              <button onClick={() => sendMedia('image')} className="p-2 text-gray-400 hover:text-blue-600"><Image className="w-5 h-5" /></button>
              <button onClick={() => sendMedia('audio')} className="p-2 text-gray-400 hover:text-blue-600"><Mic className="w-5 h-5" /></button>
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Écrire un message..."
                className="flex-1 h-10 rounded-full bg-gray-50"
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              />
              <Button onClick={sendMessage} size="icon" className="bg-blue-600 hover:bg-blue-700 rounded-full h-10 w-10">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        <StudentBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">Groupes</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
        {groups.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucun groupe disponible</p>
          </div>
        ) : (
          groups.map(group => {
            const status = getMembershipStatus(group.id);
            return (
              <div
                key={group.id}
                className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => status === 'accepté' ? setSelectedGroup(group) : null}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{group.name}</h3>
                    <p className="text-gray-500 text-sm">{group.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{group.members_count || 0} membres</p>
                  </div>
                  {!status && (
                    <Button onClick={(e) => { e.stopPropagation(); joinMutation.mutate(group.id); }} size="sm" className="bg-blue-600 hover:bg-blue-700 rounded-xl">
                      Rejoindre
                    </Button>
                  )}
                  {status === 'en_attente' && <Badge className="bg-amber-50 text-amber-700 border-amber-200"><Clock className="w-3 h-3 mr-1" />En attente</Badge>}
                  {status === 'accepté' && <Badge className="bg-green-50 text-green-700 border-green-200"><Check className="w-3 h-3 mr-1" />Membre</Badge>}
                  {status === 'rejeté' && <Badge className="bg-red-50 text-red-700 border-red-200"><X className="w-3 h-3 mr-1" />Rejeté</Badge>}
                </div>
              </div>
            );
          })
        )}
      </div>

      <StudentBottomNav />
    </div>
  );
}