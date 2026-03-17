import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Zap, CheckCircle, Clock, AlertCircle, Loader2, ExternalLink, CreditCard, Award, ChevronRight, Hash, Sparkles, Shield, TrendingUp, GraduationCap, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import StudentBottomNav from '../components/student/StudentBottomNav';

export default function StudentTuition() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [txRef, setTxRef] = useState('');
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

  const { data: tuitions = [] } = useQuery({
    queryKey: ['studentTuitions'],
    queryFn: () => base44.entities.Tuition.filter({ student_email: user?.email }),
    enabled: !!user && !isPreview,
  });

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

  const myConfig = configs.find(c => c.is_active) || configs[0];
  const hasPaid = tuitions.some(t => t.status === 'payé') || paymentProofs.some(p => p.status === 'validé');
  const pendingProof = paymentProofs.find(p => p.status === 'en_attente');

  const confirmPayment = async () => {
    if (!txRef.trim()) {
      toast.error('Veuillez entrer votre référence de transaction');
      return;
    }
    setSubmitting(true);

    const paymentDate = new Date().toISOString();

    await base44.entities.PaymentProof.create({
      student_email: user.email,
      student_name: `${student.first_name} ${student.last_name}`,
      amount: myConfig.amount,
      proof_url: txRef.trim(),
      period: format(new Date(), 'MMMM yyyy', { locale: fr }),
      payment_type: 'Frais de scolarité',
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
          message: `${student.first_name} ${student.last_name} — Réf: ${txRef.trim()} — ${myConfig.amount.toLocaleString()} XOF`
        });
      }
    }

    queryClient.invalidateQueries({ queryKey: ['paymentProofs'] });
    setConfirmDialog(false);
    setTxRef('');
    setSubmitting(false);

    sessionStorage.setItem('payment_success_data', JSON.stringify({
      student_name: `${student.first_name} ${student.last_name}`,
      domain: student.domain,
      formation_type: student.formation_type,
      payment_type: 'Frais de scolarité',
      payment_date: paymentDate,
    }));
    navigate(createPageUrl('PaymentSuccess'));
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
      {/* Header sombre premium */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-transparent" />
        <div className="relative px-4 pt-12 pb-8">
          <div className="flex items-center gap-3 mb-6">
            <Button onClick={() => navigate(createPageUrl('StudentMore'))} variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10 rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-white">Ma Scolarité</h1>
              <p className="text-white/50 text-xs">Paiements & Finances</p>
            </div>
          </div>

          {/* Carte principale du solde */}
          <div className="bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 rounded-3xl p-6 shadow-2xl shadow-blue-900/50 mb-2">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-blue-100 text-xs font-medium uppercase tracking-widest mb-1">Frais de scolarité</p>
                {myConfig ? (
                  <p className="text-2xl font-bold text-white">Paiement en ligne disponible</p>
                ) : (
                  <p className="text-2xl font-bold text-white/70">Non configuré</p>
                )}
              </div>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                hasPaid ? 'bg-green-400/20 text-green-300 border border-green-400/30' :
                pendingProof ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' :
                'bg-red-400/20 text-red-300 border border-red-400/30'
              }`}>
                {hasPaid ? <><CheckCircle className="w-3 h-3" /> Payé</> :
                 pendingProof ? <><Clock className="w-3 h-3" /> En vérification</> :
                 <><AlertCircle className="w-3 h-3" /> Non payé</>}
              </div>
            </div>

            {/* Formation info */}
            {student && (
              <div className="flex items-center gap-4 border-t border-white/10 pt-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-300" />
                  <span className="text-blue-100 text-xs">{student.formation_type}</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-white/20" />
                <span className="text-blue-200 text-xs truncate">{student.domain}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4">

        {/* Statut principal */}
        {hasPaid ? (
          <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/20 border border-green-500/30 rounded-2xl p-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30 flex-shrink-0">
                <Award className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-green-300 text-lg">Scolarité à jour ! ✅</h3>
                <p className="text-green-400/70 text-sm">Votre paiement a été validé par l'administration.</p>
              </div>
            </div>
          </div>
        ) : pendingProof ? (
          <div className="bg-gradient-to-br from-amber-900/30 to-yellow-900/20 border border-amber-500/30 rounded-2xl p-5">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30 flex-shrink-0">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-amber-300 text-lg">Paiement en vérification</h3>
                <p className="text-amber-400/70 text-sm mb-2">L'administration vérifie votre transaction sous 24h.</p>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                  <p className="text-xs text-amber-400/60 uppercase mb-1">Référence transmise</p>
                  <p className="text-amber-200 font-mono text-sm font-bold">{pendingProof.proof_url}</p>
                </div>
              </div>
            </div>
          </div>
        ) : myConfig ? (
          /* Flux de paiement en 2 étapes */
          <div className="space-y-3">
            {/* Étape 1 : Payer */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/5">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">1</div>
                  <p className="text-white font-semibold">Effectuez votre paiement</p>
                </div>
                <p className="text-white/40 text-sm ml-8">Cliquez pour accéder à la plateforme de paiement sécurisée</p>
              </div>
              {myConfig.payment_link ? (
                <a href={myConfig.payment_link} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Accéder au paiement</p>
                      <p className="text-white/40 text-xs">Paiement en ligne sécurisé</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-xl transition-colors">
                    <span className="text-white text-sm font-semibold">Payer</span>
                    <ExternalLink className="w-3.5 h-3.5 text-white" />
                  </div>
                </a>
              ) : (
                <div className="px-5 py-4">
                  <p className="text-white/40 text-sm">Contactez l'administration pour les modalités de paiement.</p>
                </div>
              )}
            </div>

            {/* Étape 2 : Confirmer */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/5">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">2</div>
                  <p className="text-white font-semibold">Confirmez votre paiement</p>
                </div>
                <p className="text-white/40 text-sm ml-8">Après paiement, entrez votre référence de transaction</p>
              </div>
              <button
                onClick={() => setConfirmDialog(true)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <Hash className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-white font-medium">J'ai payé, confirmer</p>
                    <p className="text-white/40 text-xs">Entrez votre réf. de transaction</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white/60 transition-colors" />
              </button>
            </div>

            {/* Badge sécurité */}
            <div className="flex items-center justify-center gap-2 py-2">
              <Shield className="w-4 h-4 text-white/20" />
              <p className="text-white/20 text-xs">Paiement 100% sécurisé • Validation sous 24h</p>
            </div>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
            <Sparkles className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/50 text-sm">Aucune configuration de scolarité pour votre formation.</p>
            <p className="text-white/30 text-xs mt-1">Contactez l'administration pour plus d'informations.</p>
          </div>
        )}

        {/* Historique des paiements */}
        {(tuitions.length > 0 || paymentProofs.filter(p => p.status === 'validé').length > 0) && (
          <div>
            <p className="text-white/40 text-xs uppercase tracking-widest mb-3 px-1">Historique</p>
            <div className="space-y-2">
              {tuitions.filter(t => t.status === 'payé').map(t => (
                <div key={t.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{t.amount?.toLocaleString()} XOF</p>
                      <p className="text-white/40 text-xs">{t.period}</p>
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
                      <p className="text-white font-medium text-sm">{p.amount?.toLocaleString()} XOF</p>
                      <p className="text-white/40 text-xs">{p.period}</p>
                    </div>
                  </div>
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Rejeté</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Dialog confirmation référence */}
      <Dialog open={confirmDialog} onOpenChange={setConfirmDialog}>
        <DialogContent className="max-w-sm rounded-3xl bg-[#1e293b] border border-white/10 text-white mx-4">
          <DialogHeader>
            <DialogTitle className="text-white text-center text-lg">Confirmer le paiement</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 pt-2">
            <div className="bg-white/5 rounded-2xl p-4 text-center border border-white/10">
              <p className="text-white/50 text-xs uppercase mb-1">Montant payé</p>
              <p className="text-3xl font-black text-white">{myConfig?.amount?.toLocaleString()} <span className="text-lg text-white/50">XOF</span></p>
            </div>

            <div>
              <label className="text-white/60 text-sm mb-2 block">Référence / ID de transaction *</label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  value={txRef}
                  onChange={(e) => setTxRef(e.target.value)}
                  placeholder="Ex: TXN-2024-XXXXXX"
                  className="pl-10 h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-blue-400"
                />
              </div>
              <p className="text-white/30 text-xs mt-2">Visible sur votre reçu de paiement Wave, FedaPay, Mobile Money...</p>
            </div>

            <Button
              onClick={confirmPayment}
              disabled={submitting || !txRef.trim()}
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