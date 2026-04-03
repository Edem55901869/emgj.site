import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Plus, Edit, Trash2, Loader2, Shield, History, GraduationCap, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import AdminTopNav from '../components/admin/AdminTopNav';
import AdminGuard from '../components/admin/AdminGuard';

const PERMISSIONS = [
  { id: 'dashboard', label: '📊 Tableau de bord', description: 'Vue d\'ensemble statistiques' },
  { id: 'students', label: '👥 Gestion des étudiants', description: 'Valider, bloquer, gérer profils' },
  { id: 'courses', label: '📚 Gestion des cours', description: 'Créer et modifier les cours' },
  { id: 'blog', label: '📰 Publications blog', description: 'Créer et gérer les posts' },
  { id: 'library', label: '📖 Bibliothèque', description: 'Documents et ressources' },
  { id: 'groups', label: '💬 Groupes', description: 'Gestion des groupes étudiants' },
  { id: 'tuition', label: '💰 Scolarité', description: 'Paiements et frais' },
  { id: 'bulletins', label: '🎓 Bulletins & Diplômes', description: 'Résultats académiques' },
  { id: 'questions', label: '❓ Questions étudiants', description: 'Support et réponses' },
  { id: 'conferences', label: '📻 Conférences', description: 'Conférences en direct' },
  { id: 'analytics', label: '📈 Analyses', description: 'Statistiques détaillées' },
  { id: 'settings', label: '⚙️ Paramètres', description: 'Configuration système' },
  { id: 'admin', label: '🔐 Gestion admin', description: 'Gérer administrateurs' },
];

// ─────────────────────────────────────────────
// Sous-section : Gestion des Enseignants
// ─────────────────────────────────────────────
function TeachersManager() {
  const queryClient = useQueryClient();
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', country: '', title: '', speciality: '', order: 0, is_active: true });
  const [photoFile, setPhotoFile] = useState(null);

  const { data: teachers = [], isLoading } = useQuery({
    queryKey: ['teachersAdmin'],
    queryFn: () => base44.entities.Teacher.list('order', 100),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      let profile_photo = editing?.profile_photo || '';
      if (photoFile) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: photoFile });
        profile_photo = file_url;
      }
      const data = { ...form, order: Number(form.order), profile_photo };
      if (editing) return base44.entities.Teacher.update(editing.id, data);
      return base44.entities.Teacher.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachersAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      toast.success(editing ? 'Enseignant mis à jour' : 'Enseignant ajouté');
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Teacher.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachersAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      toast.success('Enseignant supprimé');
    },
  });

  const resetForm = () => {
    setDialog(false);
    setEditing(null);
    setForm({ name: '', country: '', title: '', speciality: '', order: 0, is_active: true });
    setPhotoFile(null);
  };

  const openEdit = (t) => {
    setEditing(t);
    setForm({ name: t.name, country: t.country, title: t.title || '', speciality: t.speciality || '', order: t.order || 0, is_active: t.is_active !== false });
    setDialog(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-indigo-600" />
          Corps Enseignant ({teachers.length})
        </h2>
        <Button onClick={() => { resetForm(); setDialog(true); }} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl">
          <Plus className="w-4 h-4 mr-2" /> Ajouter un enseignant
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>
      ) : teachers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Aucun enseignant. Ajoutez le premier !</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {teachers.map(t => (
            <div key={t.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-3">
                {t.profile_photo ? (
                  <img src={t.profile_photo} alt={t.name} className="w-full h-full object-cover" />
                ) : (
                  <GraduationCap className="w-8 h-8 text-white" />
                )}
              </div>
              <h3 className="font-bold text-gray-900 text-sm text-center">{t.title ? `${t.title} ` : ''}{t.name}</h3>
              <p className="text-xs text-indigo-600 text-center mt-1">{t.country}</p>
              {t.speciality && <p className="text-xs text-gray-500 text-center mt-0.5">{t.speciality}</p>}
              <div className="flex items-center justify-center gap-1 mt-1">
                <Badge className={t.is_active !== false ? 'bg-green-100 text-green-700 text-xs' : 'bg-gray-100 text-gray-500 text-xs'}>
                  {t.is_active !== false ? 'Visible' : 'Masqué'}
                </Badge>
              </div>
              <div className="flex gap-2 mt-3">
                <Button onClick={() => openEdit(t)} size="sm" variant="outline" className="flex-1 rounded-xl text-xs">
                  <Edit className="w-3 h-3 mr-1" /> Modifier
                </Button>
                <Button
                  onClick={() => { if (confirm('Supprimer cet enseignant ?')) deleteMutation.mutate(t.id); }}
                  size="sm" variant="outline"
                  className="rounded-xl text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialog} onOpenChange={(open) => { if (!open) resetForm(); }}>
        <DialogContent className="max-w-md bg-white rounded-3xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Modifier l\'enseignant' : 'Nouvel enseignant'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Titre (Dr, Pasteur…)</label>
                <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Dr" className="rounded-xl h-10" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Ordre d'affichage</label>
                <Input type="number" value={form.order} onChange={e => setForm({ ...form, order: e.target.value })} placeholder="0" className="rounded-xl h-10" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Nom complet *</label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nom de l'enseignant" className="rounded-xl h-10" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Pays *</label>
              <Input value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} placeholder="(BÉNIN)" className="rounded-xl h-10" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Spécialité</label>
              <Input value={form.speciality} onChange={e => setForm({ ...form, speciality: e.target.value })} placeholder="Théologie, Leadership…" className="rounded-xl h-10" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Photo de profil</label>
              <input type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files[0])} className="w-full border rounded-xl p-2 text-sm" />
              {editing?.profile_photo && !photoFile && (
                <div className="mt-2 flex items-center gap-2">
                  <img src={editing.profile_photo} alt="" className="w-10 h-10 rounded-full object-cover" />
                  <span className="text-xs text-gray-500">Photo actuelle</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
              <Checkbox
                id="is_active"
                checked={form.is_active}
                onCheckedChange={v => setForm({ ...form, is_active: v })}
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700 cursor-pointer">
                Visible sur la page d'accueil
              </label>
            </div>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={!form.name || !form.country || saveMutation.isPending}
              className="w-full bg-indigo-600 hover:bg-indigo-700 rounded-xl h-11"
            >
              {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : (editing ? 'Mettre à jour' : 'Ajouter')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─────────────────────────────────────────────
// Page principale AdminManagement
// ─────────────────────────────────────────────
export default function AdminManagement() {
  const [activeSection, setActiveSection] = useState('admins');
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
      return base44.entities.AdminUser.create({ ...data, profile_photo });
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
      return base44.entities.AdminUser.update(id, data);
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
          <div className="mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Gestion Générale</h1>
            <p className="text-gray-500 mt-1">Administrateurs et corps enseignant</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-3 mb-8">
            <button
              onClick={() => setActiveSection('admins')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeSection === 'admins' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30' : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'}`}
            >
              <Shield className="w-4 h-4" /> Administrateurs
            </button>
            <button
              onClick={() => setActiveSection('teachers')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeSection === 'teachers' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300'}`}
            >
              <GraduationCap className="w-4 h-4" /> Corps Enseignant
            </button>
          </div>

          {/* Section Admins */}
          {activeSection === 'admins' && (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-blue-600" />
                  Administrateurs ({admins.length})
                </h2>
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
                      <div className="space-y-1 mb-3">
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
            </>
          )}

          {/* Section Enseignants */}
          {activeSection === 'teachers' && <TeachersManager />}
        </div>

        {/* Dialog Admin Create/Edit */}
        <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetForm(); }}>
          <DialogContent className="max-w-3xl rounded-3xl max-h-[92vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle className="text-2xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {editingAdmin ? '✏️ Modifier l\'administrateur' : '✨ Nouvel administrateur'}
              </DialogTitle>
            </DialogHeader>
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
                <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto p-4 bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl border border-gray-100">
                  {PERMISSIONS.map(perm => (
                    <div key={perm.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/80 transition-colors border border-transparent hover:border-blue-100">
                      <Checkbox
                        checked={form.permissions.includes(perm.id)}
                        onCheckedChange={() => togglePermission(perm.id)}
                        id={perm.id}
                        className="mt-1"
                      />
                      <label htmlFor={perm.id} className="flex-1 cursor-pointer">
                        <p className="text-sm font-medium text-gray-900">{perm.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{perm.description}</p>
                      </label>
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

        {/* Dialog Historique */}
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