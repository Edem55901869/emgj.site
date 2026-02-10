import React, { useState, useEffect } from 'react';
import { Sparkles, Check, Upload, Loader2, AlertTriangle, Calendar, ExternalLink, Shield, Zap, TrendingUp } from 'lucide-react';
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
      toast.success('✅ Preuve soumise avec succès ! Votre demande sera traitée sous 48h.', {
        duration: 5000,
      });
    },
    onError: (error) => {
      toast.error('Erreur lors de la soumission');
      setUploading(false);
    }
  });

  const plans = [
    { 
      name: 'Basic', 
      originalPrice: '31,522',
      price: '29,000', 
      features: ['100 étudiants max', '10 GB stockage', 'Support email', '1 domaine personnalisé'], 
      color: 'from-blue-600 to-blue-700',
      gradient: 'from-blue-500 via-blue-600 to-blue-700',
      icon: '🚀'
    },
    { 
      name: 'Pro', 
      originalPrice: '85,870',
      price: '79,000', 
      features: ['500 étudiants max', '50 GB stockage', 'Support prioritaire', '3 domaines personnalisés', 'Analytics avancé'], 
      color: 'from-red-600 to-red-700',
      gradient: 'from-red-500 via-red-600 to-red-700',
      popular: true, 
      icon: '⭐'
    },
    { 
      name: 'Enterprise', 
      originalPrice: '161,957',
      price: '149,000', 
      features: ['Étudiants illimités', '200 GB stockage', 'Support 24/7', 'Domaines illimités', 'API complète', 'Sauvegarde automatique'], 
      color: 'from-blue-700 to-red-700',
      gradient: 'from-blue-600 via-purple-600 to-red-600',
      icon: '👑'
    },
  ];

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-red-50">
        <AdminTopNav />
        <div className="pt-20 px-4 pb-8 max-w-7xl mx-auto">
          
          {/* Carte de statut en haut si validation */}
          {latestProof?.status === 'vérifié' && (
            <div className="mb-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl shadow-2xl overflow-hidden transform hover:scale-[1.01] transition-all">
              <div className="p-6 text-white">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Check className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-1">🎉 Hébergement Validé !</h3>
                    <p className="text-white/90">Votre plan <strong>{latestProof.plan_name}</strong> est maintenant actif</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/20">
                  <div>
                    <p className="text-white/70 text-sm">Date de validation</p>
                    <p className="font-bold">{moment(latestProof.verified_date).format('DD MMMM YYYY')}</p>
                  </div>
                  <div>
                    <p className="text-white/70 text-sm">Expire le</p>
                    <p className="font-bold">{activePlan && moment(activePlan.end_date).format('DD MMMM YYYY')}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Hero Section */}
          <div className="text-center mb-12 relative">
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <Sparkles className="w-64 h-64 text-blue-600" />
            </div>
            <div className="relative">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-red-600 text-white px-6 py-2 rounded-full text-sm font-bold mb-4 shadow-lg">
                <Sparkles className="w-4 h-4" />
                Offre Spéciale VIP - Réduction de 8%
              </div>
              <h1 className="text-5xl md:text-6xl font-black mb-4">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 bg-clip-text text-transparent">
                  Plans d'Hébergement Premium
                </span>
              </h1>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Solution d'hébergement professionnelle pour votre plateforme éducative
              </p>
            </div>
          </div>

          {/* Plans d'hébergement */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {plans.map((plan, i) => {
              const planConfig = hostingPlans.find(p => p.plan_name === plan.name);
              const discount = Math.round(((parseInt(plan.originalPrice.replace(/,/g, '')) - parseInt(plan.price.replace(/,/g, ''))) / parseInt(plan.originalPrice.replace(/,/g, ''))) * 100);
              
              return (
                <div key={i} className={`relative group ${plan.popular ? 'md:-mt-4' : ''}`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 text-sm font-bold shadow-2xl border-2 border-white animate-pulse">
                        ⭐ PLUS POPULAIRE
                      </Badge>
                    </div>
                  )}
                  
                  <Card className={`border-0 shadow-2xl overflow-hidden bg-white transform hover:scale-105 transition-all duration-300 ${plan.popular ? 'ring-4 ring-red-500' : ''}`}>
                    {/* Header */}
                    <div className={`h-40 bg-gradient-to-br ${plan.gradient} relative overflow-hidden`}>
                      <div className="absolute inset-0 opacity-20">
                        <div className="absolute inset-0" style={{
                          backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.4) 0%, transparent 60%)'
                        }} />
                      </div>
                      <div className="relative h-full flex flex-col items-center justify-center text-white">
                        <div className="text-6xl mb-2 animate-bounce">{plan.icon}</div>
                        <h3 className="text-3xl font-black tracking-tight">{plan.name}</h3>
                      </div>
                      
                      {/* Badge réduction */}
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-yellow-400 text-gray-900 font-bold text-xs px-3 py-1">
                          -{discount}%
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      {/* Prix */}
                      <div className="text-center mb-6 pb-6 border-b-2 border-gray-100">
                        <div className="text-sm text-gray-400 line-through mb-1">
                          {plan.originalPrice} XOF
                        </div>
                        <div className={`text-5xl font-black bg-gradient-to-r ${plan.gradient} bg-clip-text text-transparent mb-1`}>
                          {plan.price}
                        </div>
                        <div className="text-gray-500 font-semibold">XOF / mois</div>
                      </div>

                      {/* Fonctionnalités */}
                      <div className="space-y-3 mb-6">
                        {plan.features.map((feature, j) => (
                          <div key={j} className="flex items-start gap-3">
                            <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${plan.gradient} flex items-center justify-center flex-shrink-0`}>
                              <Check className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-sm text-gray-700 leading-tight font-medium">{feature}</span>
                          </div>
                        ))}
                      </div>

                      {/* Bouton */}
                      <Button 
                        onClick={() => planConfig && handlePlanClick(planConfig)}
                        disabled={!planConfig?.payment_link}
                        className={`w-full h-14 text-lg font-black bg-gradient-to-r ${plan.gradient} hover:opacity-90 rounded-2xl shadow-xl transition-all transform hover:scale-105`}
                      >
                        {planConfig?.payment_link ? (
                          <span className="flex items-center justify-center gap-2">
                            Souscrire <ExternalLink className="w-5 h-5" />
                          </span>
                        ) : (
                          'Non disponible'
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>

          {/* Section VIP Features */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 rounded-3xl p-8 mb-12 shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)`
              }} />
            </div>
            <div className="relative">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-white mb-2 font-mono">
                  &gt; FONCTIONNALITÉS VIP INCLUSES
                </h2>
                <p className="text-blue-300 font-mono text-sm">{'{'} Technologie de pointe pour votre plateforme {'}'}</p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all">
                  <Shield className="w-12 h-12 text-blue-400 mb-4" />
                  <h3 className="text-white font-bold text-lg mb-2 font-mono">&gt; Sécurité Maximale</h3>
                  <p className="text-blue-200 text-sm font-mono">
                    {'{'} SSL + Firewall + Protection DDoS + Sauvegardes quotidiennes {'}'}
                  </p>
                </div>
                
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all">
                  <Zap className="w-12 h-12 text-yellow-400 mb-4" />
                  <h3 className="text-white font-bold text-lg mb-2 font-mono">&gt; Performance Ultra-Rapide</h3>
                  <p className="text-blue-200 text-sm font-mono">
                    {'{'} CDN Global + Cache Optimisé + Temps de chargement &lt; 1s {'}'}
                  </p>
                </div>
                
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all">
                  <TrendingUp className="w-12 h-12 text-green-400 mb-4" />
                  <h3 className="text-white font-bold text-lg mb-2 font-mono">&gt; Évolutivité Illimitée</h3>
                  <p className="text-blue-200 text-sm font-mono">
                    {'{'} Scaling automatique + 99.9% uptime + Support 24/7 {'}'}
                  </p>
                </div>
              </div>

              <div className="mt-8 text-center">
                <p className="text-yellow-400 font-mono text-sm">
                  &gt;&gt; ÉCONOMISEZ <span className="text-2xl font-black">8%</span> SUR TOUS LES PLANS &lt;&lt;
                </p>
              </div>
            </div>
          </div>

          {/* Mes preuves */}
          {myProofs.length > 0 && (
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-blue-600" />
                Historique de mes demandes
              </h2>
              <div className="space-y-3">
                {myProofs.map((proof) => (
                  <div key={proof.id} className={`p-5 rounded-2xl border-2 ${
                    proof.status === 'vérifié' ? 'bg-green-50 border-green-200' :
                    proof.status === 'rejeté' ? 'bg-red-50 border-red-200' :
                    'bg-blue-50 border-blue-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-gray-900">{proof.plan_name} - {proof.amount}</p>
                        <p className="text-sm text-gray-600">Soumis le {moment(proof.created_date).format('DD/MM/YYYY à HH:mm')}</p>
                        {proof.verified_date && (
                          <p className="text-sm text-gray-600">Traité le {moment(proof.verified_date).format('DD/MM/YYYY à HH:mm')}</p>
                        )}
                      </div>
                      <Badge className={
                        proof.status === 'vérifié' ? 'bg-green-500 text-white' :
                        proof.status === 'rejeté' ? 'bg-red-500 text-white' :
                        'bg-blue-500 text-white'
                      }>
                        {proof.status === 'en_attente' ? '⏳ En vérification' : 
                         proof.status === 'vérifié' ? '✅ Validé' : '❌ Rejeté'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={showProofDialog} onOpenChange={setShowProofDialog}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent">
              Soumettre votre preuve de paiement
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="bg-gradient-to-r from-blue-50 to-red-50 p-5 rounded-2xl border-2 border-blue-200">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Plan:</strong> {selectedPlan?.plan_name}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Montant:</strong> {selectedPlan?.price}
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                📎 Joindre la preuve de paiement
              </label>
              <Input 
                type="file" 
                accept="image/*,.pdf"
                onChange={(e) => setProofFile(e.target.files[0])}
                className="cursor-pointer h-12 rounded-xl"
              />
            </div>

            <Button 
              onClick={() => submitProofMutation.mutate()}
              disabled={!proofFile || uploading}
              className="w-full bg-gradient-to-r from-blue-600 to-red-600 hover:opacity-90 h-14 text-lg font-bold rounded-xl"
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