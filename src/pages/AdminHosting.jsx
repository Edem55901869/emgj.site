import React, { useState, useEffect } from 'react';
import { Crown, Check, Zap, Shield, Headphones, Upload, Loader2, CheckCircle2, Clock, XCircle, Sparkles, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminTopNav from '../components/admin/AdminTopNav';
import AdminGuard from '../components/admin/AdminGuard';
import { toast } from 'sonner';
import moment from 'moment';
import 'moment/locale/fr';
moment.locale('fr');

export default function AdminHosting() {
  const [showProofDialog, setShowProofDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [proofFile, setProofFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [admin, setAdmin] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const adminData = JSON.parse(localStorage.getItem('emgj_admin') || '{}');
    setAdmin(adminData);
  }, []);

  const { data: hostingPlans = [] } = useQuery({
    queryKey: ['hostingPlans'],
    queryFn: () => base44.entities.HostingPlan.list(),
  });

  const { data: myProofs = [] } = useQuery({
    queryKey: ['myHostingProofs', admin?.email],
    queryFn: () => base44.entities.HostingPaymentProof.filter({ admin_email: admin?.email }, '-created_date'),
    enabled: !!admin?.email,
  });

  const activePlan = hostingPlans.find(p => p.is_active);
  const latestProof = myProofs[0];

  const getDaysRemaining = () => {
    if (!activePlan) return null;
    const today = moment();
    const endDate = moment(activePlan.end_date);
    return endDate.diff(today, 'days');
  };

  const daysRemaining = getDaysRemaining();

  const handlePlanClick = (plan) => {
    if (plan.payment_link) {
      window.open(plan.payment_link, '_blank');
      setSelectedPlan(plan);
      setTimeout(() => setShowProofDialog(true), 1000);
    }
  };

  const submitProofMutation = useMutation({
    mutationFn: async () => {
      if (!proofFile) throw new Error('Veuillez sélectionner un fichier');

      setUploading(true);
      const { file_url } = await base44.integrations.Core.UploadFile({ file: proofFile });

      const proofData = {
        admin_email: admin.email,
        admin_name: `${admin.first_name} ${admin.last_name}`,
        plan_name: selectedPlan.plan_name,
        amount: selectedPlan.price,
        proof_url: file_url,
        status: 'en_attente'
      };

      await base44.entities.HostingPaymentProof.create(proofData);
      await base44.functions.invoke('sendHostingPaymentNotification', proofData);
      return proofData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myHostingProofs'] });
      setShowProofDialog(false);
      setProofFile(null);
      setSelectedPlan(null);
      setUploading(false);
      toast.success('✅ Preuve soumise avec succès !');
    },
    onError: () => {
      toast.error('Erreur lors de la soumission');
      setUploading(false);
    }
  });

  const plans = [
    { 
      name: 'Basic', 
      price: '29,000', 
      period: 'mois',
      description: 'Parfait pour démarrer votre plateforme',
      features: [
        '100 étudiants maximum',
        '10 GB de stockage cloud',
        'Support par email',
        '1 domaine personnalisé',
        'Certificat SSL gratuit'
      ],
      icon: Zap,
      gradient: 'from-blue-500 to-cyan-500',
      popular: false
    },
    { 
      name: 'Pro', 
      price: '79,000', 
      period: 'mois',
      description: 'Pour une croissance accélérée',
      features: [
        '500 étudiants maximum',
        '50 GB de stockage cloud',
        'Support prioritaire 24/7',
        '3 domaines personnalisés',
        'Analytics avancé',
        'Sauvegarde quotidienne'
      ],
      icon: Crown,
      gradient: 'from-purple-500 to-pink-500',
      popular: true,
      badge: 'Le plus populaire'
    },
    { 
      name: 'Enterprise', 
      price: '149,000', 
      period: 'mois',
      description: 'Solution complète sans limites',
      features: [
        'Étudiants illimités',
        '200 GB de stockage cloud',
        'Support VIP dédié 24/7',
        'Domaines illimités',
        'API complète & webhooks',
        'Sauvegarde en temps réel',
        'Migration gratuite'
      ],
      icon: Star,
      gradient: 'from-amber-500 to-orange-500',
      popular: false
    },
  ];

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <AdminTopNav />
        
        <div className="pt-24 px-4 pb-16 max-w-7xl mx-auto">
          
          {/* Alerte de statut actif */}
          {latestProof?.status === 'vérifié' && activePlan && (
            <div className="mb-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-6 text-white relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="relative flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-1">🎉 Hébergement actif</h3>
                    <p className="text-white/90 mb-4">Plan <strong>{latestProof.plan_name}</strong> validé avec succès</p>
                    <div className="flex flex-wrap gap-4">
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                        <p className="text-white/80 text-xs mb-1">Date de validation</p>
                        <p className="font-bold">{moment(latestProof.verified_date).format('DD MMM YYYY')}</p>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                        <p className="text-white/80 text-xs mb-1">Expire le</p>
                        <p className="font-bold">{moment(activePlan.end_date).format('DD MMM YYYY')}</p>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                        <p className="text-white/80 text-xs mb-1">Jours restants</p>
                        <p className="font-bold">{daysRemaining} jours</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2 rounded-full text-sm font-semibold mb-6 shadow-lg">
              <Sparkles className="w-4 h-4" />
              Offre de lancement - Économisez 8%
            </div>
            <h1 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 bg-clip-text text-transparent">
              Hébergement Premium
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Propulsez votre plateforme éducative avec notre infrastructure cloud professionnelle
            </p>
          </div>

          {/* Plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {plans.map((plan, idx) => {
              const planConfig = hostingPlans.find(p => p.plan_name === plan.name);
              const Icon = plan.icon;
              
              return (
                <div key={idx} className={`relative ${plan.popular ? 'md:-mt-4' : ''}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                      <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1.5 text-xs font-bold shadow-xl">
                        ⭐ {plan.badge}
                      </Badge>
                    </div>
                  )}
                  
                  <Card className={`relative overflow-hidden border-2 ${plan.popular ? 'border-purple-300 shadow-2xl scale-105' : 'border-gray-200 shadow-lg hover:shadow-xl'} transition-all duration-300 hover:scale-105 bg-white`}>
                    {/* Background gradient decoration */}
                    <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${plan.gradient} opacity-10 rounded-full blur-3xl`}></div>
                    
                    <CardContent className="p-8 relative">
                      {/* Icon */}
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-6 shadow-lg`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>

                      {/* Plan name */}
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                      <p className="text-gray-600 text-sm mb-6">{plan.description}</p>

                      {/* Price */}
                      <div className="mb-6">
                        <div className="flex items-baseline gap-2">
                          <span className={`text-5xl font-black bg-gradient-to-r ${plan.gradient} bg-clip-text text-transparent`}>
                            {plan.price}
                          </span>
                          <span className="text-gray-500 font-medium">XOF</span>
                        </div>
                        <p className="text-gray-500 text-sm">par {plan.period}</p>
                      </div>

                      {/* Features */}
                      <div className="space-y-3 mb-8">
                        {plan.features.map((feature, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${plan.gradient} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                              <Check className="w-3 h-3 text-white" />
                            </div>
                            <span className="text-gray-700 text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>

                      {/* CTA */}
                      <Button 
                        onClick={() => planConfig && handlePlanClick(planConfig)}
                        disabled={!planConfig?.payment_link}
                        className={`w-full h-12 font-bold text-white bg-gradient-to-r ${plan.gradient} hover:opacity-90 rounded-xl shadow-lg transition-all`}
                      >
                        {planConfig?.payment_link ? 'Choisir ce plan' : 'Bientôt disponible'}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>

          {/* Trust Section */}
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-16 border border-gray-100">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Pourquoi nous faire confiance ?</h2>
              <p className="text-gray-600">Infrastructure professionnelle pour votre réussite</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Sécurité maximale</h3>
                <p className="text-gray-600 text-sm">Certificat SSL, firewall avancé et sauvegardes quotidiennes pour protéger vos données</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Performance optimale</h3>
                <p className="text-gray-600 text-sm">Serveurs ultra-rapides avec CDN global pour un temps de chargement minimal</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Headphones className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Support dédié</h3>
                <p className="text-gray-600 text-sm">Équipe d'experts disponible 24/7 pour vous accompagner dans votre projet</p>
              </div>
            </div>
          </div>

          {/* Historique des demandes */}
          {myProofs.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Historique des paiements</h2>
              <div className="space-y-3">
                {myProofs.map((proof) => (
                  <div key={proof.id} className={`flex items-center justify-between p-4 rounded-xl border-2 ${
                    proof.status === 'vérifié' ? 'bg-green-50 border-green-200' :
                    proof.status === 'rejeté' ? 'bg-red-50 border-red-200' :
                    'bg-blue-50 border-blue-200'
                  }`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        proof.status === 'vérifié' ? 'bg-green-500' :
                        proof.status === 'rejeté' ? 'bg-red-500' :
                        'bg-blue-500'
                      }`}>
                        {proof.status === 'vérifié' ? <CheckCircle2 className="w-5 h-5 text-white" /> :
                         proof.status === 'rejeté' ? <XCircle className="w-5 h-5 text-white" /> :
                         <Clock className="w-5 h-5 text-white" />}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{proof.plan_name} - {proof.amount} XOF</p>
                        <p className="text-sm text-gray-600">
                          Soumis le {moment(proof.created_date).format('DD MMMM YYYY à HH:mm')}
                        </p>
                      </div>
                    </div>
                    <Badge className={
                      proof.status === 'vérifié' ? 'bg-green-600 text-white' :
                      proof.status === 'rejeté' ? 'bg-red-600 text-white' :
                      'bg-blue-600 text-white'
                    }>
                      {proof.status === 'en_attente' ? 'En vérification' : 
                       proof.status === 'vérifié' ? 'Validé' : 'Rejeté'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialog proof */}
      <Dialog open={showProofDialog} onOpenChange={setShowProofDialog}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Preuve de paiement</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-100">
              <p className="text-sm text-gray-700 mb-1">
                <strong>Plan:</strong> {selectedPlan?.plan_name}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Montant:</strong> {selectedPlan?.price} XOF
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Joindre votre justificatif
              </label>
              <Input 
                type="file" 
                accept="image/*,.pdf"
                onChange={(e) => setProofFile(e.target.files[0])}
                className="cursor-pointer h-11 rounded-xl"
              />
              <p className="text-xs text-gray-500 mt-2">Formats acceptés: JPG, PNG, PDF</p>
            </div>

            <Button 
              onClick={() => submitProofMutation.mutate()}
              disabled={!proofFile || uploading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 h-12 font-bold rounded-xl"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-2" />
                  Soumettre
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminGuard>
  );
}