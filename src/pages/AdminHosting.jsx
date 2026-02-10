import React, { useState, useEffect } from 'react';
import { Cloud, Check, Upload, Loader2, AlertCircle, Clock, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminTopNav from '../components/admin/AdminTopNav';
import AdminGuard from '../components/admin/AdminGuard';
import toast from 'react-hot-toast';
import moment from 'moment';

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
    queryFn: () => base44.entities.HostingPaymentProof.filter({ admin_email: admin?.email }),
    enabled: !!admin?.email,
  });

  const activePlan = hostingPlans.find(p => p.is_active);

  const getDaysRemaining = () => {
    if (!activePlan) return null;
    const today = moment();
    const endDate = moment(activePlan.end_date);
    return endDate.diff(today, 'days');
  };

  const daysRemaining = getDaysRemaining();

  const getStatusColor = () => {
    if (!daysRemaining || daysRemaining < 0) return 'bg-red-600';
    if (daysRemaining <= 30) return 'bg-red-600';
    if (daysRemaining <= 60) return 'bg-orange-500';
    if (daysRemaining <= 90) return 'bg-yellow-500';
    return 'bg-blue-600';
  };

  const getStatusMessage = () => {
    if (!daysRemaining || daysRemaining < 0) {
      return '🚨 Hébergement expiré ! Veuillez renouveler immédiatement.';
    }
    if (daysRemaining <= 30) {
      return `⚠️ Attention ! Votre hébergement expire dans ${daysRemaining} jours. Renouvelez dès maintenant !`;
    }
    if (daysRemaining <= 60) {
      return `⏰ Il reste ${daysRemaining} jours avant l'expiration. Préparez votre renouvellement.`;
    }
    if (daysRemaining <= 90) {
      return `📅 ${daysRemaining} jours restants. Pensez à anticiper votre renouvellement.`;
    }
    return `✅ Hébergement actif jusqu'au ${moment(activePlan.end_date).format('DD/MM/YYYY')}`;
  };

  const handlePlanClick = (plan) => {
    if (plan.payment_link) {
      window.open(plan.payment_link, '_blank');
      setSelectedPlan(plan);
      setTimeout(() => setShowProofDialog(true), 1000);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProofFile(file);
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
      
      // Envoyer la notification par email
      await base44.functions.invoke('sendHostingPaymentNotification', proofData);

      return proofData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myHostingProofs'] });
      setShowProofDialog(false);
      setProofFile(null);
      setSelectedPlan(null);
      toast.success('Preuve de paiement soumise avec succès !');
    },
    onError: (error) => {
      toast.error('Erreur lors de la soumission');
    },
    onSettled: () => {
      setUploading(false);
    }
  });

  const plans = [
    { name: 'Basic', price: '29,000 XOF', features: ['100 étudiants max', '10 GB stockage', 'Support email', '1 domaine personnalisé'], color: 'from-blue-500 to-blue-600' },
    { name: 'Pro', price: '79,000 XOF', features: ['500 étudiants max', '50 GB stockage', 'Support prioritaire', '3 domaines personnalisés', 'Analytics avancé'], color: 'from-white to-red-500', popular: true },
    { name: 'Enterprise', price: '149,000 XOF', features: ['Étudiants illimités', '200 GB stockage', 'Support 24/7', 'Domaines illimités', 'API complète', 'Sauvegarde automatique'], color: 'from-red-600 to-blue-600' },
  ];

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-red-50">
        <AdminTopNav />
        <div className="pt-20 px-4 pb-8 max-w-7xl mx-auto">
          
          {/* Bannière d'alerte si expiration proche ou dépassée */}
          {daysRemaining !== null && (
            <div className={`${getStatusColor()} text-white p-6 rounded-2xl shadow-xl mb-6 animate-pulse`}>
              <div className="flex items-center gap-3">
                {daysRemaining < 0 ? <AlertCircle className="w-8 h-8" /> : <Clock className="w-8 h-8" />}
                <div className="flex-1">
                  <h3 className="font-bold text-xl">{getStatusMessage()}</h3>
                  {daysRemaining >= 0 && (
                    <p className="text-white/90 text-sm mt-1">
                      Date d'expiration : {moment(activePlan.end_date).format('DD MMMM YYYY')}
                    </p>
                  )}
                </div>
                {daysRemaining >= 0 && (
                  <div className="text-right">
                    <div className="text-4xl font-bold">{daysRemaining}</div>
                    <div className="text-sm">jours restants</div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-white to-red-600 bg-clip-text text-transparent">
              Plans d'Hébergement FTGJ
            </h1>
            <p className="text-gray-600 mt-2">Choisissez le plan adapté à vos besoins - Couleurs officielles : Bleu, Blanc, Rouge</p>
          </div>

          {/* Plans d'hébergement */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {plans.map((plan, i) => {
              const planConfig = hostingPlans.find(p => p.plan_name === plan.name);
              return (
                <Card key={i} className={`border-2 shadow-2xl relative overflow-hidden transform hover:scale-105 transition-all duration-300 ${plan.popular ? 'ring-4 ring-blue-500 border-blue-500' : 'border-gray-200'}`}>
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-red-600 text-white px-6 py-1 text-sm shadow-lg">
                      ⭐ Populaire
                    </Badge>
                  )}
                  <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 via-white to-red-600" />
                  <CardHeader className="text-center pb-4 pt-8">
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                      <Cloud className="w-10 h-10 text-white" />
                    </div>
                    <CardTitle className="text-3xl font-bold text-gray-900">{plan.name}</CardTitle>
                    <p className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent mt-3">
                      {plan.price}
                      <span className="text-lg text-gray-500 font-normal">/mois</span>
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {plan.features.map((feature, j) => (
                      <div key={j} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-gray-700 font-medium">{feature}</span>
                      </div>
                    ))}
                    <Button 
                      onClick={() => planConfig && handlePlanClick(planConfig)}
                      disabled={!planConfig?.payment_link}
                      className={`w-full mt-6 h-12 text-base font-bold bg-gradient-to-r ${plan.color} hover:opacity-90 rounded-xl shadow-lg transform hover:scale-105 transition-all`}
                    >
                      {planConfig?.payment_link ? (
                        <>Choisir ce plan <ExternalLink className="w-4 h-4 ml-2" /></>
                      ) : (
                        'Non disponible'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Mes preuves de paiement */}
          {myProofs.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">📋 Mes demandes de renouvellement</h2>
              <div className="space-y-3">
                {myProofs.map((proof) => (
                  <div key={proof.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-red-50 rounded-xl border border-blue-200">
                    <div>
                      <p className="font-semibold text-gray-900">{proof.plan_name} - {proof.amount}</p>
                      <p className="text-sm text-gray-600">Soumis le {moment(proof.created_date).format('DD/MM/YYYY à HH:mm')}</p>
                    </div>
                    <Badge className={
                      proof.status === 'vérifié' ? 'bg-green-500' :
                      proof.status === 'rejeté' ? 'bg-red-500' :
                      'bg-yellow-500'
                    }>
                      {proof.status === 'en_attente' ? '⏳ En vérification' : proof.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialog pour soumettre la preuve */}
      <Dialog open={showProofDialog} onOpenChange={setShowProofDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent">
              Soumettre votre preuve de paiement
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="bg-gradient-to-r from-blue-50 to-red-50 p-4 rounded-xl border-2 border-blue-200">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Plan sélectionné:</strong> {selectedPlan?.plan_name}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Montant:</strong> {selectedPlan?.price}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📎 Joindre la preuve de paiement
              </label>
              <Input 
                type="file" 
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
            </div>

            <Button 
              onClick={() => submitProofMutation.mutate()}
              disabled={!proofFile || uploading}
              className="w-full bg-gradient-to-r from-blue-600 to-red-600 hover:opacity-90 h-12 text-base font-bold rounded-xl"
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

            <div className="bg-green-50 border-2 border-green-200 p-4 rounded-xl">
              <p className="text-sm text-green-800 text-center font-medium">
                ✅ Votre preuve sera vérifiée dans les 48h par votre hébergeur
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminGuard>
  );
}