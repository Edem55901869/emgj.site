import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DollarSign, Plus, Trash2, Loader2, Check, X, TrendingUp, Clock, Users, Zap, Hash, AlertTriangle, RefreshCw, Edit, ToggleLeft, ToggleRight, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import AdminTopNav from '../components/admin/AdminTopNav';
import AdminGuard from '../components/admin/AdminGuard';
import { getAllFormations } from '../components/domainFormationMapping';

const ALL_FORMATIONS = getAllFormations();

export default function AdminTuition() {
  const [configDialog, setConfigDialog] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [configForm, setConfigForm] = useState({
    formation_type: '',
    fee_type: 'Frais de diplôme',
    payment_link: '',
    is_promotion: false,
    normal_price: '',
    promo_price: '',
    is_active: true,
    description: ''
  });
  const [statusFilter, setStatusFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: configs = [] } = useQuery({ queryKey: ['tuitionConfigs'], queryFn: () => base44.entities.TuitionConfig.list('-created_date', 100) });
  const { data: paymentProofs = [], isLoading: loadingProofs } = useQuery({ queryKey: ['paymentProofs'], queryFn: () => base44.entities.PaymentProof.list('-created_date', 500), refetchInterval: 10000 });
  const { data: students = [] } = useQuery({ queryKey: ['students'], queryFn: () => base44.entities.Student.list() });

  const createConfigMutation = useMutation({
    mutationFn: async (data) => {
      if (editingConfig) {
        return base44.entities.TuitionConfig.update(editingConfig.id, data);
      } else {
        return base44.entities.TuitionConfig.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tuitionConfigs'] });
      resetForm();
      toast.success(editingConfig ? 'Configuration mise à jour' : 'Configuration créée');
    },
  });

  const deleteConfigMutation = useMutation({
    mutationFn: (id) => base44.entities.TuitionConfig.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tuitionConfigs'] }); toast.success('Supprimée'); },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }) => base44.entities.TuitionConfig.update(id, { is_active: isActive }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tuitionConfigs'] }); toast.success('Statut mis à jour'); },
  });

  const validateMutation = useMutation({
    mutationFn: async ({ proof }) => {
      try {
        await base44.entities.PaymentProof.update(proof.id, { status: 'validé' });
        await base44.entities.Notification.create({
          recipient_email: proof.student_email,
          type: 'success',
          title: '✅ Paiement validé !',
          message: `Votre paiement de ${proof.amount?.toLocaleString()} XOF (${proof.fee_type}) a été confirmé !`
        });
      } catch (error) {
        console.error('Erreur validation paiement:', error);
        throw new Error(`Échec de validation: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentProofs'] });
      toast.success('Paiement validé ✅');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ proof }) => {
      try {
        await base44.entities.PaymentProof.update(proof.id, { status: 'rejeté' });
        await base44.entities.Notification.create({
          recipient_email: proof.student_email,
          type: 'warning',
          title: '❌ Référence invalide',
          message: `La référence "${proof.transaction_reference}" n'a pas pu être vérifiée. Contactez l'administration.`
        });
      } catch (error) {
        console.error('Erreur rejet paiement:', error);
        throw new Error(`Échec de rejet: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentProofs'] });
      toast.error('Transaction rejetée');
    },
  });

  const resetForm = () => {
    setConfigDialog(false);
    setEditingConfig(null);
    setConfigForm({
      formation_type: '',
      fee_type: 'Frais de diplôme',
      payment_link: '',
      is_promotion: false,
      normal_price: '',
      promo_price: '',
      is_active: true,
      description: ''
    });
  };

  const handleEdit = (config) => {
    setEditingConfig(config);
    setConfigForm({
      formation_type: config.formation_type,
      fee_type: config.fee_type,
      payment_link: config.payment_link,
      is_promotion: config.is_promotion || false,
      normal_price: config.normal_price?.toString() || '',
      promo_price: config.promo_price?.toString() || '',
      is_active: config.is_active ?? true,
      description: config.description || ''
    });
    setConfigDialog(true);
  };

  const handleSubmit = () => {
    if (!configForm.formation_type || !configForm.fee_type || !configForm.payment_link || !configForm.normal_price) {
      toast.error('Veuillez remplir tous les champs requis');
      return;
    }
    if (configForm.is_promotion && !configForm.promo_price) {
      toast.error('Prix de promotion requis');
      return;
    }

    createConfigMutation.mutate({
      ...configForm,
      normal_price: parseFloat(configForm.normal_price),
      promo_price: configForm.is_promotion ? parseFloat(configForm.promo_price) : null
    });
  };

  // Stats
  const totalRevenue = paymentProofs.filter(p => p.status === 'validé').reduce((s, p) => s + (p.amount || 0), 0);
  const pendingProofs = paymentProofs.filter(p => p.status === 'en_attente');
  const pendingAmount = pendingProofs.reduce((s, p) => s + (p.amount || 0), 0);
  const paidStudents = new Set(paymentProofs.filter(p => p.status === 'validé').map(p => p.student_email)).size;
  const unpaidStudents = students.filter(s => !paymentProofs.some(p => p.student_email === s.user_email && p.status === 'validé')).length;

  const filteredProofs = statusFilter === 'all' ? paymentProofs : paymentProofs.filter(p => p.status === statusFilter);

  const statusColors = {
    'en_attente': 'bg-amber-50 text-amber-700 border-amber-200',
    'validé': 'bg-green-50 text-green-700 border-green-200',
    'rejeté': 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-[#0f172a]">
        <AdminTopNav />
        <div className="pt-20 px-4 pb-8 max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-black text-white">Frais de Diplômes & Graduation</h1>
              <p className="text-white/40 text-sm mt-1">Gestion des paiements par formation</p>
            </div>
            <Button onClick={() => { resetForm(); setConfigDialog(true); }} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl shadow-lg shadow-blue-500/20">
              <Plus className="w-4 h-4 mr-2" /> Nouveau lien
            </Button>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-green-900/50 to-emerald-900/30 border border-green-500/20 rounded-2xl p-5">
              <TrendingUp className="w-6 h-6 text-green-400 mb-3" />
              <p className="text-2xl font-black text-white">{totalRevenue.toLocaleString()}</p>
              <p className="text-green-400/70 text-xs mt-1">XOF encaissés</p>
            </div>
            <div className={`bg-gradient-to-br from-amber-900/50 to-yellow-900/30 border rounded-2xl p-5 relative ${pendingProofs.length > 0 ? 'border-amber-400/50 animate-pulse' : 'border-amber-500/20'}`}>
              {pendingProofs.length > 0 && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{pendingProofs.length}</span>
                </div>
              )}
              <Clock className="w-6 h-6 text-amber-400 mb-3" />
              <p className="text-2xl font-black text-white">{pendingAmount.toLocaleString()}</p>
              <p className="text-amber-400/70 text-xs mt-1">XOF à vérifier</p>
            </div>
            <div className="bg-gradient-to-br from-blue-900/50 to-indigo-900/30 border border-blue-500/20 rounded-2xl p-5">
              <Users className="w-6 h-6 text-blue-400 mb-3" />
              <p className="text-2xl font-black text-white">{paidStudents}</p>
              <p className="text-blue-400/70 text-xs mt-1">Étudiants à jour</p>
            </div>
            <div className="bg-gradient-to-br from-red-900/50 to-rose-900/30 border border-red-500/20 rounded-2xl p-5">
              <AlertTriangle className="w-6 h-6 text-red-400 mb-3" />
              <p className="text-2xl font-black text-white">{unpaidStudents}</p>
              <p className="text-red-400/70 text-xs mt-1">Non payés</p>
            </div>
          </div>

          {/* Preuves en attente */}
          {pendingProofs.length > 0 && (
            <div className="bg-gradient-to-br from-amber-900/30 to-yellow-900/20 border border-amber-500/30 rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-lg">Transactions à vérifier</h2>
                    <p className="text-amber-400/70 text-xs">{pendingProofs.length} en attente de confirmation</p>
                  </div>
                </div>
                <button onClick={() => queryClient.invalidateQueries({ queryKey: ['paymentProofs'] })} className="text-amber-400/50 hover:text-amber-400 transition-colors">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                {pendingProofs.map(proof => (
                  <div key={proof.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">{proof.student_name?.charAt(0)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold truncate">{proof.student_name}</p>
                          <p className="text-white/40 text-xs truncate">{proof.student_email}</p>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">{proof.fee_type}</Badge>
                            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">{proof.formation_type}</Badge>
                            <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg px-2 py-0.5">
                              <Hash className="w-3 h-3 text-white/40" />
                              <span className="text-white/70 text-xs font-mono">{proof.transaction_reference}</span>
                            </div>
                            <span className="text-amber-400 font-bold text-sm">{proof.amount?.toLocaleString()} XOF</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          onClick={() => validateMutation.mutate({ proof })}
                          disabled={validateMutation.isPending}
                          size="sm"
                          className="bg-green-500 hover:bg-green-600 rounded-xl h-9 px-4 shadow-lg shadow-green-500/20"
                        >
                          {validateMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                          <span className="ml-1 hidden sm:inline">Valider</span>
                        </Button>
                        <Button
                          onClick={() => rejectMutation.mutate({ proof })}
                          disabled={rejectMutation.isPending}
                          size="sm"
                          variant="outline"
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl h-9 px-3"
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Configurations de paiement */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
            <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-400" />
              Liens de paiement par formation
            </h3>
            {configs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-white/30 text-sm mb-4">Aucune configuration. Créez des liens pour chaque formation.</p>
                <Button onClick={() => { resetForm(); setConfigDialog(true); }} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl">
                  <Plus className="w-4 h-4 mr-2" /> Créer un lien
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {configs.map(config => (
                  <div key={config.id} className={`bg-gradient-to-br ${config.is_active ? 'from-blue-900/40 to-indigo-900/20 border-blue-500/20' : 'from-gray-800/40 to-gray-900/20 border-white/5'} border rounded-xl p-5 relative`}>
                    {config.is_promotion && (
                      <div className="absolute -top-2 -right-2">
                        <Badge className="bg-red-500 text-white border-0 shadow-lg">PROMO</Badge>
                      </div>
                    )}
                    <div className="mb-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <p className="text-xs text-white/40 uppercase mb-1">{config.fee_type}</p>
                          <p className="text-white font-bold text-base">{config.formation_type}</p>
                        </div>
                        <button
                          onClick={() => toggleActiveMutation.mutate({ id: config.id, isActive: !config.is_active })}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                            config.is_active 
                              ? 'bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/30' 
                              : 'bg-gray-500/20 text-gray-400 border border-gray-500/20 hover:bg-gray-500/30'
                          }`}
                        >
                          {config.is_active ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                          {config.is_active ? 'Actif' : 'Inactif'}
                        </button>
                      </div>

                      {config.is_promotion ? (
                        <div className="flex items-center gap-2">
                          <span className="text-white/40 text-sm line-through">{config.normal_price?.toLocaleString()} XOF</span>
                          <span className="text-red-400 font-bold text-lg">{config.promo_price?.toLocaleString()} XOF</span>
                          <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-xs">
                            -{Math.round(((config.normal_price - config.promo_price) / config.normal_price) * 100)}%
                          </Badge>
                        </div>
                      ) : (
                        <p className="text-white font-bold text-lg">{config.normal_price?.toLocaleString()} XOF</p>
                      )}
                    </div>

                    <a href={config.payment_link} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-blue-200 text-xs truncate block mb-3">
                      {config.payment_link}
                    </a>

                    {config.description && <p className="text-white/30 text-xs mb-3">{config.description}</p>}

                    <div className="flex gap-2 pt-2 border-t border-white/10">
                      <Button onClick={() => handleEdit(config)} variant="ghost" size="sm" className="text-blue-400 hover:bg-blue-500/10 rounded-xl flex-1">
                        <Edit className="w-3.5 h-3.5 mr-1" /> Modifier
                      </Button>
                      <Button onClick={() => deleteConfigMutation.mutate(config.id)} variant="ghost" size="sm" className="text-red-400 hover:bg-red-500/10 rounded-xl">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Historique complet */}
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-bold text-white text-lg">Historique des transactions</h3>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-44 h-9 rounded-xl bg-white/10 border-white/20 text-white text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="en_attente">En attente</SelectItem>
                  <SelectItem value="validé">Validés</SelectItem>
                  <SelectItem value="rejeté">Rejetés</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="divide-y divide-white/5 max-h-96 overflow-y-auto">
              {loadingProofs ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-white/30" /></div>
              ) : filteredProofs.length === 0 ? (
                <div className="py-12 text-center text-white/30 text-sm">Aucune transaction</div>
              ) : (
                filteredProofs.map(p => (
                  <div key={p.id} className="p-4 flex items-center gap-4 hover:bg-white/3 transition-colors">
                    <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-white/70 font-bold text-sm">{p.student_name?.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm truncate">{p.student_name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">{p.fee_type}</Badge>
                        <div className="flex items-center gap-1">
                          <Hash className="w-3 h-3 text-white/20" />
                          <span className="text-white/30 text-xs font-mono truncate">{p.transaction_reference}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-white font-bold text-sm">{p.amount?.toLocaleString()} XOF</p>
                      <p className="text-white/30 text-xs">{p.formation_type}</p>
                    </div>
                    <Badge className={`flex-shrink-0 text-xs ${statusColors[p.status] || 'bg-gray-100 text-gray-700'}`}>
                      {p.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Dialog configuration */}
        <Dialog open={configDialog} onOpenChange={resetForm}>
          <DialogContent className="max-w-lg rounded-3xl bg-[#1e293b] border border-white/10 text-white max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="text-white">{editingConfig ? 'Modifier' : 'Nouveau'} lien de paiement</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <label className="text-white/60 text-sm mb-2 block">Type de formation *</label>
                <Select value={configForm.formation_type} onValueChange={(v) => setConfigForm({ ...configForm, formation_type: v })}>
                  <SelectTrigger className="rounded-xl h-11 bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_FORMATIONS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-white/60 text-sm mb-2 block">Type de frais *</label>
                <Select value={configForm.fee_type} onValueChange={(v) => setConfigForm({ ...configForm, fee_type: v })}>
                  <SelectTrigger className="rounded-xl h-11 bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Frais de diplôme">Frais de diplôme</SelectItem>
                    <SelectItem value="Frais de graduation">Frais de graduation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-white/60 text-sm mb-2 block">Lien de paiement externe *</label>
                <Input value={configForm.payment_link} onChange={(e) => setConfigForm({ ...configForm, payment_link: e.target.value })} placeholder="https://wave.com/... ou FedaPay..." className="rounded-xl h-11 bg-white/10 border-white/20 text-white placeholder:text-white/30" />
              </div>

              <div className="flex items-center justify-between bg-white/5 rounded-xl p-4">
                <div>
                  <p className="text-white text-sm font-medium">Promotion active</p>
                  <p className="text-white/40 text-xs">Afficher un prix réduit</p>
                </div>
                <Switch checked={configForm.is_promotion} onCheckedChange={(v) => setConfigForm({ ...configForm, is_promotion: v })} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/60 text-sm mb-2 block">Prix normal (XOF) *</label>
                  <Input type="number" value={configForm.normal_price} onChange={(e) => setConfigForm({ ...configForm, normal_price: e.target.value })} placeholder="50000" className="rounded-xl h-11 bg-white/10 border-white/20 text-white placeholder:text-white/30" />
                </div>
                {configForm.is_promotion && (
                  <div>
                    <label className="text-white/60 text-sm mb-2 block">Prix promo (XOF) *</label>
                    <Input type="number" value={configForm.promo_price} onChange={(e) => setConfigForm({ ...configForm, promo_price: e.target.value })} placeholder="35000" className="rounded-xl h-11 bg-white/10 border-white/20 text-white placeholder:text-white/30" />
                  </div>
                )}
              </div>

              <div>
                <label className="text-white/60 text-sm mb-2 block">Instructions (optionnel)</label>
                <Textarea value={configForm.description} onChange={(e) => setConfigForm({ ...configForm, description: e.target.value })} placeholder="Ex: Utilisez votre nom complet comme référence" className="rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/30 resize-none" rows={3} />
              </div>

              <div className="flex items-center justify-between bg-white/5 rounded-xl p-4">
                <div>
                  <p className="text-white text-sm font-medium">Lien actif</p>
                  <p className="text-white/40 text-xs">Visible pour les étudiants</p>
                </div>
                <Switch checked={configForm.is_active} onCheckedChange={(v) => setConfigForm({ ...configForm, is_active: v })} />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={createConfigMutation.isPending}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl h-11 font-bold"
              >
                {createConfigMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingConfig ? 'Mettre à jour' : 'Créer')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminGuard>
  );
}