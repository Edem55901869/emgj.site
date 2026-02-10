import React, { useState, useEffect } from 'react';
import { Crown, Check, Upload, Loader2, Clock, CheckCircle2, XCircle, ExternalLink, Shield, Zap, Globe, Star } from 'lucide-react';
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
      toast.success('✅ Preuve soumise avec succès !', {
        description: 'Votre demande sera traitée sous 48h.',
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
      price: '29,000 XOF', 
      period: 'mois',
      features: ['100 étudiants max', '10 GB stockage', 'Support email', '1 domaine personnalisé'],
      icon: Star,
      popular: false,
      gradient: 'from-slate-600 to-slate-800'
    },
    { 
      name: 'Pro', 
      price: '79,000 XOF', 
      period: 'mois',
      features: ['500 étudiants max', '50 GB stockage', 'Support prioritaire', '3 domaines personnalisés', 'Analytics avancé'],
      icon: Zap,
      popular: true,
      gradient: 'from-blue-600 to-indigo-700'
    },
    { 
      name: 'Enterprise', 
      price: '149,000 XOF', 
      period: 'mois',
      features: ['Étudiants illimités', '200 GB stockage', 'Support 24/7', 'Domaines illimités', 'API complète', 'Sauvegarde automatique'],
      icon: Crown,
      popular: false,
      gradient: 'from-emerald-600 to-teal-700'
    },
  ];

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <AdminTopNav />
        
        <div className="pt-20 px-4 pb-12 max-w-7xl mx-auto">
          
          {/* Alerte hébergement actif */}
          {latestProof?.status === 'vérifié' && activePlan && (
            <div className="mb-8 relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-600 p-8 shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
              <div className="relative z-10">
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-10 h-10 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-3xl font-bold text-white mb-2">🎉 Hébergement Actif</h3>
                    <p className="text-white/90 text-lg mb-4">Votre plan <strong>{latestProof.plan_name}</strong> est opérationnel</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                        <p className="text-white/70 text-sm mb-1">Date d'activation</p>
                        <p className="text-white font-bold text-lg">{moment(latestProof.verified_date).format('DD MMM YYYY')}</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                        <p className="text-white/70 text-sm mb-1">Expire le</p>
                        <p className="text-white font-bold text-lg">{moment(activePlan.end_date).format('DD MMM YYYY')}</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                        <p className="text-white/70 text-sm mb-1">Jours restants</p>
                        <p className="text-white font-bold text-lg">{daysRemaining} jours</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Alerte expiration proche */}
          {daysRemaining !== null && daysRemaining <= 7 && daysRemaining > 0 && (
            <div className="mb-8 bg-gradient-to-r from-amber-500 to-orange-600 rounded-3xl p-6 shadow-xl">
              <div className="flex items-center gap-4 text-white">
                <Clock className="w-8 h-8 flex-shrink-0 animate-pulse" />
                <div>
                  <h3 className="text-xl font-bold">⚠️ Attention : Expiration proche</h3>
                  <p className="text-white/90">Votre hébergement expire dans {daysRemaining} jours. Renouvelez dès maintenant !</p>
                </div>
              </div>
            </div>
          )}

          {/* Hero Section */}
          <div className="text-center mb-16 relative">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-slate-700 to-slate-900 text-white px-6 py-3 rounded-full text-sm font-bold mb-6 shadow-lg">
              <Star className="w-4 h-4" />
              Offre spéciale - Économisez 8% sur tous les plans
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 bg-clip-text text-transparent">
              Hébergement Premium
            </h1>
            <p className="text-gray-600 text-xl max-w-3xl mx-auto leading-relaxed">
              Une infrastructure cloud professionnelle pour votre plateforme éducative. 
              <br className="hidden md:block" />
              Fiable, rapide et sécurisée.
            </p>
          </div>

          {/* Plans Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {plans.map((plan, i) => {
              const planConfig = hostingPlans.find(p => p.plan_name === plan.name);
              const Icon = plan.icon;
              
              return (
                <div key={i} className={`relative ${plan.popular ? 'md:-mt-6' : ''}`}>
                  {plan.popular && (
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10">
                      <Badge className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-2 text-sm font-bold shadow-xl animate-bounce">
                        🔥 Le plus populaire
                      </Badge>
                    </div>
                  )}
                  
                  <Card className={`relative overflow-hidden border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 ${plan.popular ? 'ring-4 ring-blue-500 ring-offset-4' : ''}`}>
                    {/* Background gradient */}
                    <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${plan.gradient}`}></div>
                    
                    <CardContent className="p-8">
                      {/* Icon */}
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-6 shadow-lg`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>

                      {/* Plan Name */}
                      <h3 className="text-3xl font-black text-gray-900 mb-2">{plan.name}</h3>
                      
                      {/* Price */}
                      <div className="mb-8">
                        <div className="flex items-baseline gap-2">
                          <span className={`text-5xl font-black bg-gradient-to-r ${plan.gradient} bg-clip-text text-transparent`}>
                            {plan.price.split(' ')[0]}
                          </span>
                          <span className="text-gray-500 text-lg">XOF</span>
                        </div>
                        <p className="text-gray-500 text-sm">par {plan.period}</p>
                      </div>

                      {/* Features */}
                      <div className="space-y-4 mb-8">
                        {plan.features.map((feature, j) => (
                          <div key={j} className="flex items-start gap-3">
                            <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${plan.gradient} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                              <Check className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>

                      {/* Button */}
                      <Button 
                        onClick={() => planConfig && handlePlanClick(planConfig)}
                        disabled={!planConfig?.payment_link}
                        className={`w-full h-14 text-lg font-bold bg-gradient-to-r ${plan.gradient} hover:opacity-90 shadow-lg transition-all`}
                      >
                        {planConfig?.payment_link ? (
                          <>Choisir ce plan <ExternalLink className="w-5 h-5 ml-2" /></>
                        ) : (
                          'Bientôt disponible'
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>

          {/* Features Section */}
          <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-3xl p-12 mb-16 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 1px, transparent 1px)',
                backgroundSize: '30px 30px'
              }}></div>
            </div>
            
            <div className="relative z-10">
              <h2 className="text-4xl font-black text-white text-center mb-4">
                Pourquoi choisir notre hébergement ?
              </h2>
              <p className="text-center text-blue-200 mb-12 text-lg max-w-3xl mx-auto">
                Nous offrons une infrastructure cloud de classe mondiale, optimisée spécialement pour les plateformes éducatives. 
                Vos étudiants bénéficieront d'une expérience fluide et rapide, où qu'ils soient dans le monde.
              </p>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all">
                  <Shield className="w-14 h-14 text-blue-400 mb-4" />
                  <h3 className="text-white font-bold text-xl mb-3">Sécurité maximale</h3>
                  <p className="text-blue-200 leading-relaxed">
                    Certificat SSL gratuit, protection anti-DDoS, sauvegardes quotidiennes automatiques et conformité RGPD.
                  </p>
                </div>
                
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all">
                  <Zap className="w-14 h-14 text-yellow-400 mb-4" />
                  <h3 className="text-white font-bold text-xl mb-3">Performance ultra-rapide</h3>
                  <p className="text-blue-200 leading-relaxed">
                    CDN global, cache optimisé, temps de chargement &lt; 1 seconde. Vos cours se chargent instantanément.
                  </p>
                </div>
                
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all">
                  <Globe className="w-14 h-14 text-green-400 mb-4" />
                  <h3 className="text-white font-bold text-xl mb-3">Disponibilité garantie</h3>
                  <p className="text-blue-200 leading-relaxed">
                    99.9% de disponibilité, scaling automatique et support technique 24/7 pour une tranquillité totale.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Historique */}
          {myProofs.length > 0 && (
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Clock className="w-8 h-8 text-blue-600" />
                Historique de vos demandes
              </h2>
              <div className="space-y-4">
                {myProofs.map((proof) => (
                  <div key={proof.id} className={`p-6 rounded-2xl border-2 transition-all hover:shadow-lg ${
                    proof.status === 'vérifié' ? 'bg-emerald-50 border-emerald-200' :
                    proof.status === 'rejeté' ? 'bg-red-50 border-red-200' :
                    'bg-blue-50 border-blue-200'
                  }`}>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <p className="font-bold text-gray-900 text-lg">{proof.plan_name}</p>
                        <p className="text-gray-600">Montant : {proof.amount}</p>
                        <p className="text-sm text-gray-500">
                          Soumis le {moment(proof.created_date).format('DD MMMM YYYY à HH:mm')}
                        </p>
                        {proof.verified_date && (
                          <p className="text-sm text-gray-500">
                            Traité le {moment(proof.verified_date).format('DD MMMM YYYY à HH:mm')}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {proof.status === 'vérifié' && <CheckCircle2 className="w-6 h-6 text-emerald-600" />}
                        {proof.status === 'rejeté' && <XCircle className="w-6 h-6 text-red-600" />}
                        {proof.status === 'en_attente' && <Clock className="w-6 h-6 text-blue-600" />}
                        <Badge className={`text-sm px-4 py-2 ${
                          proof.status === 'vérifié' ? 'bg-emerald-500 text-white' :
                          proof.status === 'rejeté' ? 'bg-red-500 text-white' :
                          'bg-blue-500 text-white'
                        }`}>
                          {proof.status === 'en_attente' ? 'En attente' : 
                           proof.status === 'vérifié' ? 'Validé' : 'Rejeté'}
                        </Badge>
                      </div>
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
        <DialogContent className="max-w-lg rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
              Soumettre votre preuve
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-6 rounded-2xl border-2 border-slate-200">
              <p className="text-gray-700 mb-2">
                <strong>Plan sélectionné :</strong> {selectedPlan?.plan_name}
              </p>
              <p className="text-gray-700">
                <strong>Montant :</strong> {selectedPlan?.price}
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                📎 Joindre votre justificatif de paiement
              </label>
              <Input 
                type="file" 
                accept="image/*,.pdf"
                onChange={(e) => setProofFile(e.target.files[0])}
                className="cursor-pointer h-14 rounded-xl border-2"
              />
              <p className="text-xs text-gray-500 mt-2">
                Formats acceptés : Images (JPG, PNG) ou PDF
              </p>
            </div>

            <Button 
              onClick={() => submitProofMutation.mutate()}
              disabled={!proofFile || uploading}
              className="w-full bg-gradient-to-r from-slate-700 to-slate-900 hover:opacity-90 h-16 text-lg font-bold rounded-xl shadow-lg"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-2" />
                  Soumettre ma preuve
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminGuard>
  );
}