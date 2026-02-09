import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Plus, Edit, Trash2, Loader2, Eye, Upload, Shield, History, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import AdminTopNav from '../components/admin/AdminTopNav';
import AdminGuard from '../components/admin/AdminGuard';

const PERMISSIONS = [
  { id: 'dashboard', label: 'Tableau de bord' },
  { id: 'students', label: 'Gestion des étudiants' },
  { id: 'courses', label: 'Gestion des cours' },
  { id: 'blog', label: 'Publications blog' },
  { id: 'library', label: 'Bibliothèque' },
  { id: 'groups', label: 'Groupes' },
  { id: 'tuition', label: 'Scolarité' },
  { id: 'bulletins', label: 'Bulletins & Diplômes' },
  { id: 'questions', label: 'Questions étudiants' },
  { id: 'conferences', label: 'Conférences' },
  { id: 'analytics', label: 'Analyses' },
  { id: 'settings', label: 'Paramètres' },
];

export default function AdminManagement() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [historyDialog, setHistoryDialog] = useState(null);
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', country: '', whatsapp: '', 
    password: '', permissions: [], role: 'admin_secondaire'
  });
  const [photoFile, setPhotoFile] = useState(null);
  const queryClient = useQueryClient();

  const { data: admins = [], isLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => base44.entities.AdminUser.list('-created_date', 100),
  });

  const { data: actions = [] } = useQuery({
    queryKey: ['adminActions'],
    queryFn: () => base44.entities.AdminAction.list('-created_date', 500),
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      let profile_photo = '';
      if (photoFile) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: photoFile });
        profile_photo = file_url;
      }
      return await base44.entities.AdminUser.create({ ...data, profile_photo });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      resetForm();
      toast.success('Administrateur créé');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      if (photoFile) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: photoFile });
        data.profile_photo = file_url;
      }
      return await base44.entities.AdminUser.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      resetForm();
      toast.success('Administrateur mis à jour');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.AdminUser.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast.success('Administrateur supprimé');
    },
  });

  const resetForm = () => {
    setDialogOpen(false);
    setEditingAdmin(null);
    setForm({ first_name: '', last_name: '', email: '', country: '', whatsapp: '', password: '', permissions: [], role: 'admin_secondaire' });
    setPhotoFile(null);
  };

  const handleEdit = (admin) => {
    setEditingAdmin(admin);
    setForm({ ...admin, password: '' });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingAdmin) {
      const updateData = { ...form };
      if (!updateData.password) delete updateData.password;
      updateMutation.mutate({ id: editingAdmin.id, data: updateData });
    } else {
      createMutation.mutate(form);
    }
  };

  const togglePermission = (permId) => {
    setForm(f => ({
      ...f,
      permissions: f.permissions.includes(permId) 
        ? f.permissions.filter(p => p !== permId)
        : [...f.permissions, permId]
    }));
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
        <AdminTopNav />
        <div className="pt-20 px-4 pb-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Gérer les administrateurs</h1>
              <p className="text-gray-500 mt-1">Gestion des comptes administrateurs secondaires</p>
            </div>
            <Button onClick={() => { resetForm(); setDialogOpen(true); }} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg">
              <Plus className="w-4 h-4 mr-2" /> Ajouter un administrateur
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {admins.map(admin => (
                <div key={admin.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-lg transition-all">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-blue-50 flex items-center justify-center flex-shrink-0">
                      {admin.profile_photo ? (
                        <img src={admin.profile_photo} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-lg font-bold text-blue-600">{admin.first_name?.[0]}{admin.last_name?.[0]}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900">{admin.first_name} {admin.last_name}</h3>
                      <p className="text-xs text-gray-500 truncate">{admin.email}</p>
                      <Badge className={`mt-1 text-xs ${admin.role === 'admin_principal' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                        {admin.role === 'admin_principal' ? 'Principal' : 'Secondaire'}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2 mb-3">
                    {admin.country && <p className="text-xs text-gray-600">📍 {admin.country}</p>}
                    {admin.whatsapp && <p className="text-xs text-gray-600">📱 {admin.whatsapp}</p>}
                    <p className="text-xs text-gray-500">{admin.permissions?.length || 0} fonctionnalités autorisées</p>
                  </div>
                  {admin.role === 'admin_secondaire' && (
                    <div className="flex gap-2">
                      <Button onClick={() => setHistoryDialog(admin)} variant="outline" size="sm" className="flex-1 rounded-xl text-xs">
                        <History className="w-3 h-3 mr-1" /> Historique
                      </Button>
                      <Button onClick={() => handleEdit(admin)} variant="outline" size="sm" className="rounded-xl">
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button onClick={() => deleteMutation.mutate(admin.id)} variant="outline" size="sm" className="rounded-xl text-red-600 border-red-200">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <Dialog open={dialogOpen} onOpenChange={resetForm}>
          <DialogContent className="max-w-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editingAdmin ? 'Modifier' : 'Nouvel administrateur'}</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <Input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} placeholder="Prénom" className="rounded-xl h-10" />
                <Input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} placeholder="Nom" className="rounded-xl h-10" />
              </div>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" type="email" className="rounded-xl h-10" />
              <div className="grid grid-cols-2 gap-3">
                <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="Pays" className="rounded-xl h-10" />
                <Input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="WhatsApp" className="rounded-xl h-10" />
              </div>
              <div>
                <label className="text-sm text-gray-700 mb-2 block">Photo de profil</label>
                <Input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files[0])} className="rounded-xl" />
              </div>
              <Input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={editingAdmin ? "Nouveau mot de passe (laisser vide pour garder l'ancien)" : "Mot de passe"} type="password" className="rounded-xl h-10" />
              
              <div>
                <label className="text-sm font-semibold text-gray-900 mb-3 block">Fonctionnalités autorisées</label>
                <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto p-3 bg-gray-50 rounded-xl">
                  {PERMISSIONS.map(perm => (
                    <div key={perm.id} className="flex items-center gap-2">
                      <Checkbox
                        checked={form.permissions.includes(perm.id)}
                        onCheckedChange={() => togglePermission(perm.id)}
                        id={perm.id}
                      />
                      <label htmlFor={perm.id} className="text-sm text-gray-700 cursor-pointer">{perm.label}</label>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!form.first_name || !form.last_name || !form.email || (!form.password && !editingAdmin) || createMutation.isPending || updateMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl h-11"
              >
                {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingAdmin ? 'Mettre à jour' : 'Créer')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={!!historyDialog} onOpenChange={() => setHistoryDialog(null)}>
          <DialogContent className="max-w-2xl rounded-2xl">
            <DialogHeader><DialogTitle>Historique des actions - {historyDialog?.first_name} {historyDialog?.last_name}</DialogTitle></DialogHeader>
            <div className="max-h-96 overflow-y-auto space-y-2 pt-2">
              {actions.filter(a => a.admin_email === historyDialog?.email).length === 0 ? (
                <p className="text-center text-gray-500 py-8">Aucune action enregistrée</p>
              ) : (
                actions.filter(a => a.admin_email === historyDialog?.email).map(action => (
                  <div key={action.id} className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-blue-600 mt-1" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{action.action_type}</p>
                        <p className="text-xs text-gray-600">{action.description}</p>
                        {action.target && <p className="text-xs text-gray-500 mt-1">Cible: {action.target}</p>}
                        <p className="text-xs text-gray-400 mt-1">
                          {action.created_date && format(new Date(action.created_date), "d MMM yyyy 'à' HH:mm", { locale: fr })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminGuard>
  );
}