import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DollarSign, Plus, Trash2, Loader2, Check, X, TrendingUp, Clock, Users, Zap, Hash, AlertTriangle, RefreshCw, Edit, Tag, Percent, Copy, MessageCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import AdminTopNav from '../components/admin/AdminTopNav';
import AdminGuard from '../components/admin/AdminGuard';

const ALL_FORMATIONS = [
  'École des évangélistes',
  'Discipolat',
  'Brevet',
  'Baccalauréat',
  'Licence',
  'Master',
  'Doctorat'
];

export default function AdminTuition() {
  const [configDialog, setConfigDialog] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [formationType, setFormationType] = useState('');
  const [feeType, setFeeType] = useState('Frais de diplôme');
  const [paymentLink, setPaymentLink] = useState('');
  const [isPromotion, setIsPromotion] = useState(false);
  const [normalPrice, setNormalPrice] = useState('');
  const [promoPrice, setPromoPrice] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [description, setDescription] = useState('');
  const [promoEndDate, setPromoEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [securityDialog, setSecurityDialog] = useState(false);
  const [securityAction, setSecurityAction] = useState(null);
  const [securityPassword, setSecurityPassword] = useState('');
  const [securityTarget, setSecurityTarget] = useState(null);
  const queryClient = useQueryClient();

  const VIP_PASSWORD = 'Agnimaka2001.com';

  const { data: configs = [] } = useQuery({ 
    queryKey: ['tuitionConfigs'], 
    queryFn: () => base44.entities.TuitionConfig.list('-created_date', 100) 
  });
  
  const { data: paymentProofs = [], isLoading: loadingProofs } = useQuery({ 
    queryKey: ['paymentProofs'], 
    queryFn: () => base44.entities.PaymentProof.list('-created_date', 500), 
    refetchInterval: 10000 
  });
  
  const { data: students = [] } = useQuery({ 
    queryKey: ['students'], 
    queryFn: () => base44.entities.Student.list() 
  });

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

  const handleDelete = (config) => {
    setSecurityAction('delete');
    setSecurityTarget(config);
    setSecurityDialog(true);
  };

  const proceedDelete = () => {
    if (!securityTarget) return;
    deleteConfigMutation.mutate(securityTarget.id);
    setSecurityDialog(false);
    setSecurityPassword('');
    setSecurityTarget(null);
  };

  const deleteConfigMutation = useMutation({
    mutationFn: (id) => base44.entities.TuitionConfig.delete(id),
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['tuitionConfigs'] }); 
      toast.success('Supprimée'); 
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }) => base44.entities.TuitionConfig.update(id, { is_active: isActive }),
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['tuitionConfigs'] }); 
      toast.success('Statut mis à jour'); 
    },
  });

  const validateMutation = useMutation({
    mutationFn: async ({ proof }) => {
      await base44.entities.PaymentProof.update(proof.id, { status: 'validé' });
      await base44.entities.Notification.create({
        recipient_email: proof.student_email,
        type: 'success',
        title: '✅ Paiement validé !',
        message: `Votre paiement de ${proof.amount?.toLocaleString()} XOF (${proof.fee_type}) a été confirmé !`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentProofs'] });
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
        message: `La référence "${proof.transaction_reference}" n'a pas pu être vérifiée. Contactez l'administration.`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentProofs'] });
      toast.error('Transaction rejetée');
    },
  });

  const resetForm = () => {
    setConfigDialog(false);
    setEditingConfig(null);
    setFormationType('');
    setFeeType('Frais de diplôme');
    setPaymentLink('');
    setIsPromotion(false);
    setNormalPrice('');
    setPromoPrice('');
    setIsActive(true);
    setDescription('');
    setPromoEndDate('');
  };

  const handleEdit = (config) => {
    setSecurityAction('edit');
    setSecurityTarget(config);
    setSecurityDialog(true);
  };

  const proceedEdit = () => {
    if (!securityTarget) return;
    setEditingConfig(securityTarget);
    setFormationType(securityTarget.formation_type);
    setFeeType(securityTarget.fee_type);
    setPaymentLink(securityTarget.payment_link);
    setIsPromotion(securityTarget.is_promotion || false);
    setNormalPrice(securityTarget.normal_price?.toString() || '');
    setPromoPrice(securityTarget.promo_price?.toString() || '');
    setIsActive(securityTarget.is_active ?? true);
    setDescription(securityTarget.description || '');
    setPromoEndDate(securityTarget.promo_end_date || '');
    setSecurityDialog(false);
    setSecurityPassword('');
    setSecurityTarget(null);
    setConfigDialog(true);
  };

  const handleDuplicate = (config) => {
    setEditingConfig(null);
    setFormationType(config.formation_type);
    setFeeType(config.fee_type);
    setPaymentLink(config.payment_link);
    setIsPromotion(config.is_promotion || false);
    setNormalPrice(config.normal_price?.toString() || '');
    setPromoPrice(config.promo_price?.toString() || '');
    setIsActive(config.is_active ?? true);
    setDescription(config.description || '');
    setPromoEndDate(config.promo_end_date || '');
    setConfigDialog(true);
    toast.success('Prêt à dupliquer');
  };

  const handleSecuritySubmit = () => {
    if (securityPassword === VIP_PASSWORD) {
      if (securityAction === 'edit') {
        proceedEdit();
      } else if (securityAction === 'delete') {
        proceedDelete();
      }
    } else {
      toast.error('Mot de passe incorrect');
    }
  };

  const handleSubmit = () => {
    if (!formationType || !feeType || !paymentLink || !normalPrice) {
      toast.error('Veuillez remplir tous les champs requis');
      return;
    }
    if (isPromotion && !promoPrice) {
      toast.error('Prix de promotion requis');
      return;
    }
    if (isPromotion && !promoEndDate) {
      toast.error('Date de fin de promotion requise');
      return;
    }

    createConfigMutation.mutate({
      formation_type: formationType,
      fee_type: feeType,
      payment_link: paymentLink,
      is_promotion: isPromotion,
      normal_price: parseFloat(normalPrice),
      promo_price: isPromotion ? parseFloat(promoPrice) : null,
      promo_end_date: isPromotion ? promoEndDate : null,
      is_active: isActive,
      description: description
    });
  };

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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
        <AdminTopNav />
        <div className="pt-20 px-4 pb-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-black text-white">Frais de Diplômes & Graduation</h1>
              <p className="text-white/40 text-sm mt-1">Gestion des paiements par formation</p>
            </div>
            <Button onClick={() => { resetForm(); setConfigDialog(true); }} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl shadow-lg shadow-blue-500/20">
              <Plus className="w-4 h-4 mr-2" /> Nouveau lien
            </Button>
          </div>

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

          {pendingProofs.length > 0 && (
            <div className="bg-gradient-to-br from-amber-900/30 to-yellow-900/20 border border-amber-500/30 rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-lg">Transactions à vérifier</h2>
                    <p className="text-amber-400/70 text-xs">{pendingProofs.length} en attente</p>
                  </div>
                </div>
                <button onClick={() => queryClient.invalidateQueries({ queryKey: ['paymentProofs'] })} className="text-amber-400/50 hover:text-amber-400">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                {pendingProofs.map(proof => (
                  <div key={proof.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
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
                          className="bg-green-500 hover:bg-green-600 rounded-xl h-9 px-4"
                        >
                          {validateMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
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

          <div className="bg-gradient-to-br from-slate-800/50 via-slate-900/50 to-indigo-900/30 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6 shadow-2xl">
            <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
              Liens de paiement par formation
            </h3>
            {configs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-white/30 text-sm mb-4">Aucune configuration</p>
                <Button onClick={() => { resetForm(); setConfigDialog(true); }} className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                  <Plus className="w-4 h-4 mr-2" /> Créer
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {configs.map(config => (
                  <div key={config.id} className={`${config.is_active ? 'bg-gradient-to-br from-blue-900/40 to-indigo-900/20 border-blue-500/20' : 'bg-gradient-to-br from-gray-800/40 to-gray-900/20 border-white/5'} border rounded-xl p-5 relative`}>
                    {config.is_promotion && (
                      <div className="absolute -top-2 -right-2">
                        <Badge className="bg-red-500 text-white">PROMO</Badge>
                      </div>
                    )}
                    <div className="mb-3">
                      <p className="text-xs text-white/40 uppercase mb-1">{config.fee_type}</p>
                      <p className="text-white font-bold text-base mb-2">{config.formation_type}</p>
                      
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

                    <div className="flex gap-2 pt-2 border-t border-white/10">
                      <Button 
                        onClick={() => toggleActiveMutation.mutate({ id: config.id, isActive: !config.is_active })} 
                        variant="ghost" 
                        size="sm" 
                        className={`${config.is_active ? 'text-green-400' : 'text-gray-400'} hover:bg-white/10 rounded-xl flex-1`}
                      >
                        {config.is_active ? 'Actif' : 'Inactif'}
                      </Button>
                      <Button onClick={() => handleDuplicate(config)} variant="ghost" size="sm" className="text-purple-400 hover:bg-purple-500/10 rounded-xl" title="Dupliquer">
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                      <Button onClick={() => handleEdit(config)} variant="ghost" size="sm" className="text-blue-400 hover:bg-blue-500/10 rounded-xl" title="Modifier">
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button onClick={() => handleDelete(config)} variant="ghost" size="sm" className="text-red-400 hover:bg-red-500/10 rounded-xl" title="Supprimer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-slate-800/50 via-slate-900/50 to-indigo-900/30 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-slate-800/50 to-indigo-900/30">
              <h3 className="font-bold text-white text-lg">Historique</h3>
              <div className="flex gap-2">
                {['all', 'en_attente', 'validé', 'rejeté'].map(status => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      statusFilter === status 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white/5 text-white/50 hover:bg-white/10'
                    }`}
                  >
                    {status === 'all' ? 'Tous' : status}
                  </button>
                ))}
              </div>
            </div>
            <div className="divide-y divide-white/5 max-h-96 overflow-y-auto bg-slate-900/30">
              {loadingProofs ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-white/30" /></div>
              ) : filteredProofs.length === 0 ? (
                <div className="py-12 text-center text-white/30 text-sm">Aucune transaction</div>
              ) : (
                filteredProofs.map(p => (
                  <div key={p.id} className="p-4 flex items-center gap-4 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10 transition-all duration-200">
                    <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-white/70 font-bold text-sm">{p.student_name?.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm truncate">{p.student_name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">{p.fee_type}</Badge>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-white font-bold text-sm">{p.amount?.toLocaleString()} XOF</p>
                    </div>
                    <Badge className={`flex-shrink-0 text-xs ${statusColors[p.status]}`}>
                      {p.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Dialog sécurité VIP */}
        <Dialog open={securityDialog} onOpenChange={(open) => { if (!open) { setSecurityDialog(false); setSecurityPassword(''); setSecurityTarget(null); } }}>
          <DialogContent className="max-w-md rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 border border-amber-500/30 text-white shadow-2xl backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-400" />
                Sécurité VIP
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/20 border border-amber-500/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-amber-300 font-semibold text-sm mb-1">Action protégée</p>
                    <p className="text-amber-400/70 text-xs mb-3">
                      Cette action nécessite un mot de passe VIP. Si vous ne possédez pas le mot de passe, contactez le développeur pour assistance.
                    </p>
                    <a
                      href="https://wa.me/2290147659277"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Contacter sur WhatsApp
                    </a>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-white/60 text-sm mb-2 block">Mot de passe VIP</label>
                <Input
                  type="password"
                  value={securityPassword}
                  onChange={(e) => setSecurityPassword(e.target.value)}
                  placeholder="Entrez le mot de passe VIP"
                  className="rounded-xl h-11 bg-gradient-to-br from-slate-800 to-slate-900 border-white/30 text-white placeholder:text-white/40 focus:border-amber-500 shadow-lg"
                  onKeyDown={(e) => e.key === 'Enter' && handleSecuritySubmit()}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => { setSecurityDialog(false); setSecurityPassword(''); setSecurityTarget(null); }}
                  variant="outline"
                  className="flex-1 rounded-xl h-11 border-white/20 text-white hover:bg-white/10"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleSecuritySubmit}
                  disabled={!securityPassword}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 rounded-xl h-11 font-bold shadow-lg shadow-amber-500/30 transition-all"
                >
                  Confirmer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={configDialog} onOpenChange={(open) => !open && resetForm()}>
          <DialogContent className="max-w-lg rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 border border-white/20 text-white max-h-[90vh] overflow-y-auto shadow-2xl backdrop-blur-xl">
            <DialogHeader><DialogTitle className="text-white">{editingConfig ? 'Modifier' : 'Nouveau'} lien</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <label className="text-white/60 text-sm mb-2 block">Formation *</label>
                <select 
                  value={formationType} 
                  onChange={(e) => setFormationType(e.target.value)}
                  className="w-full h-11 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/30 text-white px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-lg [&>option]:bg-slate-900 [&>option]:text-white"
                >
                  <option value="" className="bg-slate-900">Sélectionner...</option>
                  {ALL_FORMATIONS.map(f => <option key={f} value={f} className="bg-slate-900">{f}</option>)}
                </select>
              </div>

              <div>
                <label className="text-white/60 text-sm mb-2 block">Type de frais *</label>
                <select 
                  value={feeType} 
                  onChange={(e) => setFeeType(e.target.value)}
                  className="w-full h-11 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/30 text-white px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-lg [&>option]:bg-slate-900 [&>option]:text-white"
                >
                  <option value="Frais de diplôme" className="bg-slate-900">Frais de diplôme</option>
                  <option value="Frais de graduation" className="bg-slate-900">Frais de graduation</option>
                </select>
              </div>

              <div>
                <label className="text-white/60 text-sm mb-2 block">Lien de paiement *</label>
                <Input value={paymentLink} onChange={(e) => setPaymentLink(e.target.value)} placeholder="https://..." className="rounded-xl h-11 bg-gradient-to-br from-slate-800 to-slate-900 border-white/30 text-white placeholder:text-white/40 focus:border-blue-500 shadow-lg" />
              </div>

              <div className="flex items-center justify-between bg-gradient-to-r from-slate-800/50 to-indigo-900/30 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-purple-400" />
                  <p className="text-white text-sm font-medium">Promotion</p>
                </div>
                <input type="checkbox" checked={isPromotion} onChange={(e) => setIsPromotion(e.target.checked)} className="w-10 h-6 accent-purple-500" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/60 text-sm mb-2 block">Prix normal *</label>
                  <Input type="number" value={normalPrice} onChange={(e) => setNormalPrice(e.target.value)} placeholder="50000" className="rounded-xl h-11 bg-gradient-to-br from-slate-800 to-slate-900 border-white/30 text-white placeholder:text-white/40 focus:border-blue-500 shadow-lg" />
                </div>
                {isPromotion && (
                  <div>
                    <label className="text-white/60 text-sm mb-2 block">Prix promo *</label>
                    <Input type="number" value={promoPrice} onChange={(e) => setPromoPrice(e.target.value)} placeholder="35000" className="rounded-xl h-11 bg-gradient-to-br from-slate-800 to-slate-900 border-white/30 text-white placeholder:text-white/40 focus:border-blue-500 shadow-lg" />
                  </div>
                )}
              </div>

              {isPromotion && (
                <div>
                  <label className="text-white/60 text-sm mb-2 block">Date de fin de promotion *</label>
                  <Input 
                    type="datetime-local" 
                    value={promoEndDate} 
                    onChange={(e) => setPromoEndDate(e.target.value)} 
                    className="rounded-xl h-11 bg-gradient-to-br from-slate-800 to-slate-900 border-white/30 text-white focus:border-blue-500 shadow-lg" 
                  />
                </div>
              )}

              <div>
                <label className="text-white/60 text-sm mb-2 block">Instructions</label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Instructions..." className="rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border-white/30 text-white placeholder:text-white/40 resize-none focus:border-blue-500 shadow-lg" rows={3} />
              </div>

              <div className="flex items-center justify-between bg-gradient-to-r from-slate-800/50 to-indigo-900/30 rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-green-400" />
                  <p className="text-white text-sm font-medium">Actif</p>
                </div>
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="w-10 h-6 accent-green-500" />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={createConfigMutation.isPending}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl h-11 font-bold shadow-lg shadow-blue-500/30 transition-all"
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