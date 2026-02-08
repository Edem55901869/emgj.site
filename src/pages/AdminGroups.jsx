import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Plus, Edit3, Trash2, Check, X, UserPlus, Crown, Loader2, Circle, MessageCircle, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import AdminTopNav from '../components/admin/AdminTopNav';
import AdminGuard from '../components/admin/AdminGuard';
import GroupChat from '../components/groups/GroupChat';

const DOMAINS = ['THÉOLOGIE', 'LEADERSHIP', 'MISSIOLOGIE', 'PROPHÉTIQUE', 'ENTREPRENEURIAT', 'AUMÔNERIE', 'MINISTÈRE APOSTOLIQUE'];
const FORMATIONS = ['Discipola', 'Brevet', 'Baccalauréat', 'Licence', 'Master', 'Doctorat'];

export default function AdminGroups() {
  const [createOpen, setCreateOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(null);
  const [chatOpen, setChatOpen] = useState(null);
  const [editingGroup, setEditingGroup] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', domain: '', formation_type: '' });
  const queryClient = useQueryClient();

  const { data: groups = [], isLoading } = useQuery({ queryKey: ['adminGroups'], queryFn: () => base44.entities.Group.list('-created_date', 100) });
  const { data: memberships = [] } = useQuery({ queryKey: ['allMemberships'], queryFn: () => base44.entities.GroupMembership.list('-created_date', 500) });
  const { data: groupAdmins = [] } = useQuery({ queryKey: ['groupAdmins'], queryFn: () => base44.entities.GroupAdmin.list() });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Group.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminGroups'] });
      setCreateOpen(false);
      setForm({ name: '', description: '', domain: '', formation_type: '' });
      toast.success('Groupe créé');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Group.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminGroups'] });
      toast.success('Groupe mis à jour');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Group.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminGroups'] });
      setManageOpen(null);
      toast.success('Groupe supprimé');
    },
  });

  const updateMembershipMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.GroupMembership.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allMemberships'] });
      toast.success('Statut mis à jour');
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (id) => base44.entities.GroupMembership.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allMemberships'] });
      toast.success('Membre retiré');
    },
  });

  const setGroupAdminMutation = useMutation({
    mutationFn: (data) => base44.entities.GroupAdmin.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groupAdmins'] });
      toast.success('Admin de groupe nommé');
    },
  });

  const uploadGroupPhoto = async (groupId, file) => {
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    updateMutation.mutate({ id: groupId, data: { cover_image: file_url } });
  };

  const groupMembers = manageOpen ? memberships.filter(m => m.group_id === manageOpen.id) : [];
  const groupAdminList = manageOpen ? groupAdmins.filter(ga => ga.group_id === manageOpen.id) : [];

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
        <AdminTopNav />
        <div className="pt-20 px-4 pb-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Groupes</h1>
              <p className="text-gray-500 mt-1">Gérez les groupes d'étudiants</p>
            </div>
            <Button onClick={() => setCreateOpen(true)} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg">
              <Plus className="w-4 h-4 mr-2" /> Créer un groupe
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map(group => {
                const members = memberships.filter(m => m.group_id === group.id && m.status === 'accepté');
                const hasOnline = false; // Simulate online status
                return (
                  <div key={group.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-all relative group">
                    {hasOnline && <div className="absolute top-4 right-4 w-3 h-3 bg-green-500 rounded-full animate-pulse" />}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900">{group.name}</h3>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{group.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mb-3">
                      {group.domain && <Badge className="bg-blue-50 text-blue-700 border-blue-100 text-xs">{group.domain}</Badge>}
                      {group.formation_type && <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 text-xs">{group.formation_type}</Badge>}
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span>{members.length} membres</span>
                      {memberships.filter(m => m.group_id === group.id && m.status === 'en_attente').length > 0 && (
                        <Badge className="bg-amber-50 text-amber-700 text-xs">{memberships.filter(m => m.group_id === group.id && m.status === 'en_attente').length} demandes</Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => setChatOpen(group)} variant="outline" className="flex-1 rounded-xl text-green-600 border-green-200 hover:bg-green-50">
                        <MessageCircle className="w-4 h-4 mr-1" /> Discussion
                      </Button>
                      <Button onClick={() => setManageOpen(group)} variant="outline" className="flex-1 rounded-xl text-blue-600 border-blue-200 hover:bg-blue-50">
                        Gérer
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Create Dialog */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader><DialogTitle>Créer un groupe</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nom du groupe" className="rounded-xl h-11" />
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description..." className="rounded-xl" />
              <Select value={form.domain} onValueChange={(v) => setForm({ ...form, domain: v })}>
                <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="Domaine (optionnel)" /></SelectTrigger>
                <SelectContent>{DOMAINS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={form.formation_type} onValueChange={(v) => setForm({ ...form, formation_type: v })}>
                <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="Formation (optionnel)" /></SelectTrigger>
                <SelectContent>{FORMATIONS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
              </Select>
              <Button onClick={() => createMutation.mutate(form)} disabled={!form.name || createMutation.isPending} className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl h-11">
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Créer'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Manage Dialog */}
        <Dialog open={!!manageOpen} onOpenChange={() => setManageOpen(null)}>
          <DialogContent className="max-w-2xl rounded-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Gérer : {manageOpen?.name}</DialogTitle></DialogHeader>
            {manageOpen && (
              <div className="space-y-4 pt-2">
                <div className="flex gap-2 flex-wrap">
                  <Input
                    value={editingGroup?.name || manageOpen.name}
                    onChange={(e) => setEditingGroup({ ...manageOpen, name: e.target.value })}
                    placeholder="Nom du groupe"
                    className="flex-1 rounded-xl h-9"
                  />
                  {editingGroup && (
                    <Button onClick={() => {
                      updateMutation.mutate({ id: manageOpen.id, data: { name: editingGroup.name } });
                      setEditingGroup(null);
                    }} size="sm" className="bg-green-600 hover:bg-green-700 rounded-xl">
                      <Check className="w-3 h-3" />
                    </Button>
                  )}
                  <Button onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e) => uploadGroupPhoto(manageOpen.id, e.target.files[0]);
                    input.click();
                  }} size="sm" variant="outline" className="rounded-xl">
                    <Upload className="w-3 h-3 mr-1" /> Photo
                  </Button>
                  <Button onClick={() => deleteMutation.mutate(manageOpen.id)} variant="outline" size="sm" className="text-red-600 border-red-200 rounded-xl">
                    <Trash2 className="w-3 h-3 mr-1" /> Supprimer
                  </Button>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">Demandes d'adhésion</h4>
                  {groupMembers.filter(m => m.status === 'en_attente').length === 0 ? (
                    <p className="text-sm text-gray-500">Aucune demande</p>
                  ) : (
                    <div className="space-y-2">
                      {groupMembers.filter(m => m.status === 'en_attente').map(m => (
                        <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                          <span className="text-sm font-medium">{m.student_name}</span>
                          <div className="flex gap-1">
                            <Button size="sm" onClick={() => updateMembershipMutation.mutate({ id: m.id, status: 'accepté' })} className="bg-green-600 hover:bg-green-700 rounded-lg h-8">
                              <Check className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => updateMembershipMutation.mutate({ id: m.id, status: 'rejeté' })} className="border-red-200 text-red-600 rounded-lg h-8">
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">Membres ({groupMembers.filter(m => m.status === 'accepté').length})</h4>
                  <div className="space-y-2">
                    {groupMembers.filter(m => m.status === 'accepté').map(m => {
                      const isAdmin = groupAdminList.some(ga => ga.student_email === m.user_email);
                      return (
                        <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{m.student_name}</span>
                            {isAdmin && <Crown className="w-4 h-4 text-amber-500" />}
                          </div>
                          <div className="flex gap-1">
                            {!isAdmin && (
                              <Button size="sm" variant="ghost" onClick={() => setGroupAdminMutation.mutate({ group_id: manageOpen.id, student_email: m.user_email, student_name: m.student_name })} className="text-xs">
                                <UserPlus className="w-3 h-3 mr-1" /> Admin
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" onClick={() => removeMemberMutation.mutate(m.id)} className="text-red-500 hover:text-red-600">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Group Chat */}
        {chatOpen && <GroupChat group={chatOpen} open={!!chatOpen} onClose={() => setChatOpen(null)} />}
      </div>
    </AdminGuard>
  );
}