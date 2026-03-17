import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DollarSign, Plus, Trash2, Loader2, Check, X, TrendingUp, Clock, CheckCircle2, Users, Zap, Hash, AlertTriangle, ArrowUpRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import AdminTopNav from '../components/admin/AdminTopNav';
import AdminGuard from '../components/admin/AdminGuard';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';



export default function AdminTuition() {
  const [configDialog, setConfigDialog] = useState(false);
  const [configForm, setConfigForm] = useState({ payment_link: '', description: '' });
  const [statusFilter, setStatusFilter] = useState('en_attente');
  const queryClient = useQueryClient();

  const { data: configs = [] } = useQuery({ queryKey: ['tuitionConfigs'], queryFn: () => base44.entities.TuitionConfig.list() });
  const { data: tuitions = [] } = useQuery({ queryKey: ['tuitions'], queryFn: () => base44.entities.Tuition.list('-created_date', 500) });
  const { data: paymentProofs = [], isLoading: loadingProofs } = useQuery({ queryKey: ['paymentProofs'], queryFn: () => base44.entities.PaymentProof.list('-created_date', 500), refetchInterval: 10000 });
  const { data: students = [] } = useQuery({ queryKey: ['students'], queryFn: () => base44.entities.Student.list() });

  const createConfigMutation = useMutation({
    mutationFn: async (data) => {
      // Supprimer les anciennes configs avant d'en créer une nouvelle
      for (const c of configs) {
        await base44.entities.TuitionConfig.delete(c.id);
      }
      return base44.entities.TuitionConfig.create({ ...data, is_active: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tuitionConfigs'] });
      setConfigDialog(false);
      setConfigForm({ payment_link: '', description: '' });
      toast.success('Lien de paiement mis à jour');
    },
  });

  const deleteConfigMutation = useMutation({
    mutationFn: (id) => base44.entities.TuitionConfig.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tuitionConfigs'] }); toast.success('Supprimé'); },
  });

  const validateMutation = useMutation({
    mutationFn: async ({ proof }) => {
      await base44.entities.PaymentProof.update(proof.id, { status: 'validé' });
      await base44.entities.Tuition.create({
        student_email: proof.student_email,
        student_name: proof.student_name,
        amount: proof.amount,
        currency: 'XOF',
        status: 'payé',
        period: proof.period || format(new Date(), 'MMMM yyyy', { locale: fr }),
        notes: `Réf. transaction: ${proof.proof_url}`
      });
      await base44.entities.Notification.create({
        recipient_email: proof.student_email,
        type: 'success',
        title: '✅ Paiement validé !',
        message: `Votre paiement de ${proof.amount?.toLocaleString()} XOF a été confirmé. Votre scolarité est à jour !`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentProofs'] });
      queryClient.invalidateQueries({ queryKey: ['tuitions'] });
      toast.success('Paiement validé ✅');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ proof }) => {
      await base44.entities.PaymentProof.update(proof.id, { status: 'rejeté' });
      await base44.entities.Notification.create({
        recipient_email: proof.student_email,
        type: 'warning',
        title: '❌ Référence invalide',
        message: `La référence de transaction "${proof.proof_url}" n'a pas pu être vérifiée. Veuillez recontacter l'administration.`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentProofs'] });
      toast.error('Transaction rejetée');
    },
  });

  // Stats
  const totalRevenue = tuitions.filter(t => t.status === 'payé').reduce((s, t) => s + (t.amount || 0), 0);
  const pendingProofs = paymentProofs.filter(p => p.status === 'en_attente');
  const pendingAmount = pendingProofs.reduce((s, p) => s + (p.amount || 0), 0);
  const paidStudents = new Set(tuitions.filter(t => t.status === 'payé').map(t => t.student_email)).size;
  const unpaidStudents = students.filter(s => {
    const paid = tuitions.some(t => t.student_email === s.user_email && t.status === 'payé') ||
                 paymentProofs.some(p => p.student_email === s.user_email && p.status === 'validé');
    return !paid;
  }).length;

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
              <h1 className="text-3xl font-black text-white">Scolarité & Paiements</h1>
              <p className="text-white/40 text-sm mt-1">Suivi financier en temps réel</p>
            </div>
            <Button onClick={() => setConfigDialog(true)} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl shadow-lg shadow-blue-500/20">
              <Plus className="w-4 h-4 mr-2" /> Nouvelle config
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

          {/* Preuves en attente - Zone d'action prioritaire */}
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
                          <div className="flex items-center gap-2 mt-1.5">
                            <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg px-2 py-0.5">
                              <Hash className="w-3 h-3 text-white/40" />
                              <span className="text-white/70 text-xs font-mono">{proof.proof_url}</span>
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
                    {proof.payment_type && (
                      <div className="mt-2 ml-13">
                        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs ml-0">{proof.payment_type}</Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lien de paiement global */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
            <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-400" />
              Lien de paiement global
            </h3>
            {configs.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-white/30 text-sm mb-4">Aucun lien configuré. Cliquez sur "Configurer" pour ajouter un lien de paiement.</p>
                <Button onClick={() => setConfigDialog(true)} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl">
                  <Plus className="w-4 h-4 mr-2" /> Configurer le lien
                </Button>
              </div>
            ) : (
              configs.map(config => (
                <div key={config.id} className="bg-gradient-to-br from-blue-900/40 to-indigo-900/20 border border-blue-500/20 rounded-xl p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-white/40 text-xs uppercase mb-1">Lien de paiement actif</p>
                      <a href={config.payment_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-300 hover:text-blue-200 transition-colors text-sm font-medium truncate">
                        <ArrowUpRight className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{config.payment_link}</span>
                      </a>
                      {config.description && <p className="text-white/30 text-xs mt-2">{config.description}</p>}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button onClick={() => { setConfigForm({ payment_link: config.payment_link, description: config.description || '' }); setConfigDialog(true); }} variant="ghost" size="sm" className="text-blue-400 hover:bg-blue-500/10 rounded-xl">
                        Modifier
                      </Button>
                      <Button onClick={() => deleteConfigMutation.mutate(config.id)} variant="ghost" size="icon" className="h-9 w-9 text-red-400/50 hover:text-red-400 hover:bg-red-500/10 rounded-xl">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
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
                      <div className="flex items-center gap-1 mt-0.5">
                        <Hash className="w-3 h-3 text-white/20" />
                        <span className="text-white/30 text-xs font-mono truncate">{p.proof_url}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-white font-bold text-sm">{p.amount?.toLocaleString()} XOF</p>
                      <p className="text-white/30 text-xs">{p.period}</p>
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
        <Dialog open={configDialog} onOpenChange={setConfigDialog}>
          <DialogContent className="max-w-md rounded-3xl bg-[#1e293b] border border-white/10 text-white">
            <DialogHeader><DialogTitle className="text-white">Lien de paiement global</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <label className="text-white/60 text-sm mb-2 block">Lien de paiement *</label>
                <Input value={configForm.payment_link} onChange={(e) => setConfigForm({ ...configForm, payment_link: e.target.value })} placeholder="https://wave.com/... ou FedaPay..." className="rounded-xl h-11 bg-white/10 border-white/20 text-white placeholder:text-white/30" />
                <p className="text-white/30 text-xs mt-1">Ce lien sera affiché à tous les étudiants, quel que soit leur domaine ou formation.</p>
              </div>
              <div>
                <label className="text-white/60 text-sm mb-2 block">Instructions (optionnel)</label>
                <Input value={configForm.description} onChange={(e) => setConfigForm({ ...configForm, description: e.target.value })} placeholder="Ex: Utilisez votre nom complet comme référence" className="rounded-xl h-11 bg-white/10 border-white/20 text-white placeholder:text-white/30" />
              </div>
              <Button
                onClick={() => createConfigMutation.mutate(configForm)}
                disabled={!configForm.payment_link || createConfigMutation.isPending}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl h-11 font-bold"
              >
                {createConfigMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminGuard>
  );
}