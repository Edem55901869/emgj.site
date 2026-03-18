import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Zap, CheckCircle, Clock, AlertCircle, Loader2, ExternalLink, Hash, Sparkles, Shield, BookOpen, Tag, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import StudentBottomNav from '../components/student/StudentBottomNav';
import PromoCountdown from '../components/PromoCountdown';

export default function StudentTuition() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [txRef, setTxRef] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      const adminView = localStorage.getItem('admin_student_view');
      if (adminView) {
        const viewData = JSON.parse(adminView);
        setUser({ email: 'admin@preview.emgj' });
        setStudent({ first_name: 'Admin', last_name: 'Preview', domain: viewData.domain, formation_type: viewData.formation_type, user_email: 'admin@preview.emgj' });
        setLoading(false);
        return;
      }
      const u = await base44.auth.me();
      setUser(u);
      const students = await base44.entities.Student.filter({ user_email: u.email });
      if (students.length > 0) setStudent(students[0]);
      setLoading(false);
    };
    load();
  }, []);

  const isPreview = user?.email === 'admin@preview.emgj';

  const { data: configs = [] } = useQuery({
    queryKey: ['tuitionConfigs'],
    queryFn: () => base44.entities.TuitionConfig.list(),
    enabled: true,
  });

  const { data: paymentProofs = [] } = useQuery({
    queryKey: ['paymentProofs'],
    queryFn: () => base44.entities.PaymentProof.filter({ student_email: user?.email }),
    enabled: !!user && !isPreview,
  });

  // Filtrer les configs actives qui correspondent à la formation de l'étudiant
  const myConfigs = configs.filter(c => c.is_active && c.formation_type === student?.formation_type);

  const openPayment = (config) => {
    if (config.payment_link) {
      window.open(config.payment_link, '_blank');
    }
    setSelectedConfig(config);
    setConfirmDialog(true);
  };

  const confirmPayment = async () => {
    if (!txRef.trim()) {
      toast.error('Veuillez entrer votre référence de transaction');
      return;
    }
    if (!paymentMethod) {
      toast.error('Veuillez sélectionner la méthode de paiement');
      return;
    }
    if (!student || !user || !selectedConfig) {
      toast.error('Session invalide');
      return;
    }

    setSubmitting(true);

    try {
      const paymentDate = new Date().toISOString();
      const amount = selectedConfig.is_promotion ? selectedConfig.promo_price : selectedConfig.normal_price;

      await base44.entities.PaymentProof.create({
        student_email: user.email,
        student_name: `${student.first_name} ${student.last_name}`,
        formation_type: student.formation_type,
        fee_type: selectedConfig.fee_type,
        amount: amount,
        transaction_reference: txRef.trim(),
        payment_method: paymentMethod,
        status: 'en_attente'
      });

      // Notifier les admins
      const adminUsers = await base44.entities.AdminUser.list();
      for (const admin of adminUsers) {
        if (admin.email) {
          await base44.entities.Notification.create({
            recipient_email: admin.email,
            type: 'info',
            title: '💰 Nouveau paiement à confirmer',
            message: `${student.first_name} ${student.last_name} — ${selectedConfig.fee_type} (${student.formation_type}) — Réf: ${txRef.trim()}`
          });
        }
      }

      queryClient.invalidateQueries({ queryKey: ['paymentProofs'] });
      setConfirmDialog(false);
      setTxRef('');
      setPaymentMethod('');
      setSelectedConfig(null);

      sessionStorage.setItem('payment_success_data', JSON.stringify({
        student_name: `${student.first_name} ${student.last_name}`,
        domain: student.domain,
        formation_type: student.formation_type,
        payment_type: selectedConfig.fee_type,
        payment_date: paymentDate,
      }));
      navigate(createPageUrl('PaymentSuccess'));
    } catch (error) {
      console.error('Erreur confirmation paiement:', error);
      toast.error(`Erreur: ${error.message || 'Impossible de confirmer le paiement'}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] pb-24">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-transparent" />
        <div className="relative px-4 pt-12 pb-8">
          <div className="flex items-center gap-3 mb-6">
            <Button onClick={() => navigate(createPageUrl('StudentMore'))} variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10 rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-white">Frais Académiques</h1>
              <p className="text-white/50 text-xs">Diplômes & Graduations</p>
            </div>
          </div>

          {/* Carte formation */}
          <div className="bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 rounded-3xl p-6 shadow-2xl shadow-blue-900/50">
            <div className="mb-4">
              <p className="text-blue-100 text-xs font-medium uppercase tracking-widest mb-1">Ma Formation</p>
              <p className="text-2xl font-bold text-white">{student?.formation_type}</p>
            </div>
            <div className="flex items-center gap-2 border-t border-white/10 pt-4">
              <BookOpen className="w-4 h-4 text-blue-300" />
              <span className="text-blue-200 text-xs truncate">{student?.domain}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {myConfigs.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
            <Sparkles className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/50 text-sm">Aucun frais disponible pour votre formation.</p>
            <p className="text-white/30 text-xs mt-1">Contactez l'administration pour plus d'informations.</p>
          </div>
        ) : (
          <>
            <p className="text-white/40 text-xs uppercase tracking-widest px-1">Paiements disponibles</p>

            {myConfigs.map(config => {
              const myProof = paymentProofs.find(p => p.fee_type === config.fee_type && p.formation_type === config.formation_type);
              const isPaid = myProof?.status === 'validé';
              const isPending = myProof?.status === 'en_attente';
              const isRejected = myProof?.status === 'rejeté';
              const promoExpired = config.is_promotion && config.promo_end_date && new Date(config.promo_end_date) < new Date();
              const showPromo = config.is_promotion && !promoExpired;

              return (
                <div key={config.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                  <div className="p-5 border-b border-white/5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-white font-bold text-lg">{config.fee_type}</h3>
                          {showPromo && (
                            <Badge className="bg-red-500 text-white border-0 shadow-lg text-xs animate-pulse">PROMO</Badge>
                          )}
                        </div>
                        {showPromo ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-white/40 text-sm line-through">{config.normal_price?.toLocaleString()} XOF</span>
                              <span className="text-red-400 font-bold text-xl">{config.promo_price?.toLocaleString()} XOF</span>
                              <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-xs">
                                <Percent className="w-3 h-3 mr-0.5" />
                                -{Math.round(((config.normal_price - config.promo_price) / config.normal_price) * 100)}%
                              </Badge>
                            </div>
                            {config.promo_end_date && <PromoCountdown endDate={config.promo_end_date} />}
                          </div>
                        ) : (
                          <p className="text-white font-bold text-xl">{config.normal_price?.toLocaleString()} XOF</p>
                        )}
                      </div>
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                        isPaid ? 'bg-green-400/20 text-green-300 border border-green-400/30' :
                        isPending ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' :
                        isRejected ? 'bg-red-400/20 text-red-300 border border-red-400/30' :
                        'bg-white/10 text-white/60 border border-white/20'
                      }`}>
                        {isPaid ? <><CheckCircle className="w-3 h-3" /> Payé</> :
                         isPending ? <><Clock className="w-3 h-3" /> En cours</> :
                         isRejected ? <><AlertCircle className="w-3 h-3" /> Rejeté</> :
                         'Non payé'}
                      </div>
                    </div>
                    {config.description && <p className="text-white/40 text-xs">{config.description}</p>}
                  </div>

                  {isPaid ? (
                    <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/20 px-5 py-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <p className="text-green-300 text-sm font-semibold">Paiement validé ✅</p>
                      </div>
                    </div>
                  ) : isPending ? (
                    <div className="bg-gradient-to-br from-amber-900/30 to-yellow-900/20 px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-amber-400" />
                        <div className="flex-1">
                          <p className="text-amber-300 text-sm font-semibold">En vérification...</p>
                          <p className="text-amber-400/60 text-xs mt-0.5">Réf: {myProof.transaction_reference}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => openPayment(config)}
                      className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                          <Zap className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-left">
                          <p className="text-white font-medium">Payer maintenant</p>
                          <p className="text-white/40 text-xs">Paiement en ligne sécurisé</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-blue-500 group-hover:bg-blue-600 px-4 py-2 rounded-xl transition-colors">
                        <span className="text-white text-sm font-semibold">Continuer</span>
                        <ExternalLink className="w-3.5 h-3.5 text-white" />
                      </div>
                    </button>
                  )}
                </div>
              );
            })}

            {/* Badge sécurité */}
            <div className="flex items-center justify-center gap-2 py-2">
              <Shield className="w-4 h-4 text-white/20" />
              <p className="text-white/20 text-xs">Paiement 100% sécurisé • Validation sous 24h</p>
            </div>
          </>
        )}

        {/* Historique */}
        {paymentProofs.filter(p => p.status === 'validé' || p.status === 'rejeté').length > 0 && (
          <div>
            <p className="text-white/40 text-xs uppercase tracking-widest mb-3 px-1">Historique</p>
            <div className="space-y-2">
              {paymentProofs.filter(p => p.status === 'validé').map(p => (
                <div key={p.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{p.fee_type}</p>
                      <p className="text-white/40 text-xs">{p.amount?.toLocaleString()} XOF</p>
                    </div>
                  </div>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Validé</Badge>
                </div>
              ))}
              {paymentProofs.filter(p => p.status === 'rejeté').map(p => (
                <div key={p.id} className="bg-white/5 border border-red-500/20 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{p.fee_type}</p>
                      <p className="text-white/40 text-xs">{p.amount?.toLocaleString()} XOF</p>
                    </div>
                  </div>
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Rejeté</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Dialog confirmation */}
      <Dialog open={confirmDialog} onOpenChange={() => { setConfirmDialog(false); setTxRef(''); setPaymentMethod(''); setSelectedConfig(null); }}>
        <DialogContent className="max-w-sm rounded-3xl bg-[#1e293b] border border-white/10 text-white mx-4">
          <DialogHeader>
            <DialogTitle className="text-white text-center text-lg">Confirmer le paiement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/10">
              <p className="text-white/50 text-xs uppercase mb-1">Montant à confirmer</p>
              <p className="text-2xl font-bold text-white">{selectedConfig?.is_promotion ? selectedConfig?.promo_price : selectedConfig?.normal_price} XOF</p>
              <p className="text-white/40 text-xs mt-1">{selectedConfig?.fee_type}</p>
            </div>

            <div>
              <label className="text-white/60 text-sm mb-2 block">Méthode de paiement *</label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="rounded-xl h-11 bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Wave">Wave</SelectItem>
                  <SelectItem value="FedaPay">FedaPay</SelectItem>
                  <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                  <SelectItem value="Virement bancaire">Virement bancaire</SelectItem>
                  <SelectItem value="Autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-white/60 text-sm mb-2 block">Référence de transaction *</label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  value={txRef}
                  onChange={(e) => setTxRef(e.target.value)}
                  placeholder="Ex: TXN-2024-XXXXXX"
                  className="pl-10 h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-blue-400"
                />
              </div>
              <p className="text-white/30 text-xs mt-2">Visible sur votre reçu de paiement</p>
            </div>

            <Button
              onClick={confirmPayment}
              disabled={submitting || !txRef.trim() || !paymentMethod}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-2xl h-12 text-base font-bold shadow-lg shadow-blue-500/30"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
              {submitting ? 'Envoi...' : 'Confirmer le paiement'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <StudentBottomNav />
    </div>
  );
}