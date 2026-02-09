import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Plus, Edit3, Trash2, Check, X, UserPlus, Crown, Loader2, Circle, MessageCircle, Upload, Lock, Unlock, Image as ImageIcon, Globe } from 'lucide-react';
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
  const [form, setForm] = useState({ name: '', description: '', domain: '', formation_type: '', is_public: false });
  const [photoFile, setPhotoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const { data: groups = [], isLoading } = useQuery({ queryKey: ['adminGroups'], queryFn: () => base44.entities.Group.list('-created_date', 100) });
  const { data: memberships = [] } = useQuery({ queryKey: ['allMemberships'], queryFn: () => base44.entities.GroupMembership.list('-created_date', 500) });
  const { data: groupAdmins = [] } = useQuery({ queryKey: ['groupAdmins'], queryFn: () => base44.entities.GroupAdmin.list() });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Group.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminGroups'] });
      setCreateOpen(false);
      setForm({ name: '', description: '', domain: '', formation_type: '', is_public: false });
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
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.Group.update(groupId, { cover_image: file_url });
      queryClient.invalidateQueries({ queryKey: ['adminGroups'] });
      toast.success('Photo mise à jour');
    } catch (error) {
      toast.error('Erreur lors du téléchargement');
    }
    setUploading(false);
  };

  const groupMembers = manageOpen ? memberships.filter(m => m.group_id === manageOpen.id) : [];
  const groupAdminList = manageOpen ? groupAdmins.filter(ga => ga.group_id === manageOpen.id) : [];

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <AdminTopNav />
        <div className="pt-20 px-4 pb-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestion des groupes</h1>
              <p className="text-gray-600 mt-1">Créez et gérez les communautés d'étudiants</p>
            </div>
            <Button onClick={() => setCreateOpen(true)} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg">
              <Plus className="w-4 h-4 mr-2" /> Créer un groupe
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {groups.map(group => {
                const members = memberships.filter(m => m.group_id === group.id && m.status === 'accepté');
                const pendingCount = memberships.filter(m => m.group_id === group.id && m.status === 'en_attente').length;
                return (
                  <div key={group.id} className="bg-white rounded-3xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300 group/card">
                    {/* Cover Image */}
                    <div className="h-36 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 relative overflow-hidden">
                      {group.cover_image ? (
                        <img src={group.cover_image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Users className="w-16 h-16 text-white/30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute top-3 right-3 flex gap-1.5">
                        {group.is_public ? (
                          <Badge className="bg-green-500/90 text-white border-0 backdrop-blur-sm">
                            <Globe className="w-3 h-3 mr-1" /> Public
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-500/90 text-white border-0 backdrop-blur-sm">
                            <Lock className="w-3 h-3 mr-1" /> Privé
                          </Badge>
                        )}
                        {pendingCount > 0 && (
                          <Badge className="bg-red-500 text-white border-0">{pendingCount}</Badge>
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="font-bold text-gray-900 text-lg mb-2">{group.name}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{group.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {group.domain && <Badge className="bg-blue-50 text-blue-700 border-blue-100 text-xs">{group.domain}</Badge>}
                        {group.formation_type && <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 text-xs">{group.formation_type}</Badge>}
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4 pb-4 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span className="font-medium">{members.length} membres</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={() => setChatOpen(group)} variant="outline" size="sm" className="flex-1 rounded-xl border-green-200 text-green-600 hover:bg-green-50">
                          <MessageCircle className="w-4 h-4 mr-1" /> Chat
                        </Button>
                        <Button onClick={() => { setManageOpen(group); setEditingGroup(group); }} variant="outline" size="sm" className="flex-1 rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50">
                          <Edit3 className="w-4 h-4 mr-1" /> Gérer
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Create Dialog */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="max-w-md rounded-3xl">
            <DialogHeader><DialogTitle className="text-xl">Créer un groupe</DialogTitle></DialogHeader>
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
              
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={form.is_public} 
                    onChange={(e) => setForm({ ...form, is_public: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <p className="font-medium text-gray-900 flex items-center gap-2">
                      {form.is_public ? <Globe className="w-4 h-4 text-green-600" /> : <Lock className="w-4 h-4 text-amber-600" />}
                      Groupe {form.is_public ? 'public' : 'privé'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {form.is_public ? 'Les étudiants peuvent rejoindre librement' : 'Les étudiants doivent faire une demande'}
                    </p>
                  </div>
                </label>
              </div>

              <Button onClick={() => createMutation.mutate(form)} disabled={!form.name || createMutation.isPending} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl h-11">
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Créer le groupe'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Manage Dialog */}
        <Dialog open={!!manageOpen} onOpenChange={() => { setManageOpen(null); setEditingGroup(null); }}>
          <DialogContent className="max-w-3xl rounded-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Gérer le groupe</DialogTitle>
            </DialogHeader>
            {manageOpen && editingGroup && (
              <div className="space-y-5 pt-2">
                {/* Photo de couverture */}
                <div className="relative h-40 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-2xl overflow-hidden group/cover">
                  {editingGroup.cover_image ? (
                    <img src={editingGroup.cover_image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-16 h-16 text-white/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/cover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = (e) => uploadGroupPhoto(manageOpen.id, e.target.files[0]);
                      input.click();
                    }} size="sm" className="bg-white/90 text-gray-900 hover:bg-white rounded-xl">
                      <Upload className="w-4 h-4 mr-2" /> {uploading ? 'Upload...' : 'Changer la photo'}
                    </Button>
                  </div>
                </div>

                {/* Informations du groupe */}
                <div className="bg-gray-50 rounded-2xl p-5 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Nom du groupe</label>
                    <Input
                      value={editingGroup.name}
                      onChange={(e) => setEditingGroup({ ...editingGroup, name: e.target.value })}
                      placeholder="Nom du groupe"
                      className="rounded-xl h-11"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Description</label>
                    <Textarea
                      value={editingGroup.description || ''}
                      onChange={(e) => setEditingGroup({ ...editingGroup, description: e.target.value })}
                      placeholder="Description..."
                      className="rounded-xl"
                    />
                  </div>
                  
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={editingGroup.is_public || false} 
                        onChange={(e) => setEditingGroup({ ...editingGroup, is_public: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <p className="font-medium text-gray-900 flex items-center gap-2">
                          {editingGroup.is_public ? <Globe className="w-4 h-4 text-green-600" /> : <Lock className="w-4 h-4 text-amber-600" />}
                          Groupe {editingGroup.is_public ? 'public' : 'privé'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {editingGroup.is_public ? 'Adhésion libre pour tous' : 'Adhésion sur demande uniquement'}
                        </p>
                      </div>
                    </label>
                  </div>

                  <Button 
                    onClick={() => {
                      updateMutation.mutate({ id: manageOpen.id, data: editingGroup });
                      setEditingGroup({ ...editingGroup });
                    }} 
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl h-11"
                  >
                    <Check className="w-4 h-4 mr-2" /> Enregistrer les modifications
                  </Button>
                </div>

                {/* Actions dangereuses */}
                <div className="bg-red-50 rounded-2xl p-4 border border-red-200">
                  <Button onClick={() => {
                    if (confirm('Êtes-vous sûr de vouloir supprimer ce groupe ?')) {
                      deleteMutation.mutate(manageOpen.id);
                    }
                  }} variant="outline" className="w-full text-red-600 border-red-300 hover:bg-red-100 rounded-xl">
                    <Trash2 className="w-4 h-4 mr-2" /> Supprimer le groupe
                  </Button>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-600" />
                    Demandes d'adhésion
                  </h4>
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