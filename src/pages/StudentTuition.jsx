import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, DollarSign, Calendar, CheckCircle, Clock, AlertCircle, Loader2, ExternalLink, Upload, CreditCard, Award, X } from 'lucide-react';
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
  const [proofDialog, setProofDialog] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const adminView = localStorage.getItem('admin_student_view');
      if (adminView) {
        const viewData = JSON.parse(adminView);
        setUser({ email: 'admin@preview.emgj' });
        setStudent({
          first_name: 'Admin',
          last_name: 'Preview',
          domain: viewData.domain,
          formation_type: viewData.formation_type,
          user_email: 'admin@preview.emgj'
        });
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
    enabled: !!student,
  });

  const { data: paymentProofs = [] } = useQuery({
    queryKey: ['paymentProofs'],
    queryFn: () => base44.entities.PaymentProof.filter({ student_email: user?.email }),
    enabled: !!user && !isPreview,
  });

  const myConfig = configs.find(c => c.domain === student?.domain && c.formation_type === student?.formation_type);
  const hasPaid = tuitions.some(t => t.status === 'payé') || paymentProofs.some(p => p.status === 'validé');

  const submitProof = async () => {
    if (!receiptFile || !transactionId.trim()) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: receiptFile });
      
      await base44.entities.PaymentProof.create({
        student_email: user.email,
        student_name: `${student.first_name} ${student.last_name}`,
        amount: myConfig.amount,
        proof_url: file_url,
        period: format(new Date(), 'MMMM yyyy', { locale: fr }),
        status: 'en_attente'
      });

      queryClient.invalidateQueries({ queryKey: ['paymentProofs'] });
      setProofDialog(false);
      setTransactionId('');
      setReceiptFile(null);
      toast.success('Preuve de paiement envoyée !');
    } catch (error) {
      toast.error('Erreur lors de l\'envoi');
    }
    setUploading(false);
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'payé': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'en_attente': return <Clock className="w-5 h-5 text-amber-500" />;
      case 'en_retard': return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'payé': case 'validé': return 'bg-green-50 text-green-700 border-green-200';
      case 'en_attente': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'en_retard': case 'rejeté': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700';
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24">
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 px-4 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <Button onClick={() => navigate(createPageUrl('StudentMore'))} variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">Scolarité</h1>
            <p className="text-green-100 text-sm">Paiements et factures</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-2">
        {hasPaid && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 mb-4 border-2 border-green-200">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-green-900 text-xl mb-2">Scolarité réglée !</h3>
                <p className="text-sm text-green-700 mb-3">
                  Votre paiement a été validé. Vous êtes à jour pour la période en cours.
                </p>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-10 h-10 text-green-600" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Étudiant inscrit</p>
                      <p className="font-bold text-gray-900">{student.first_name} {student.last_name}</p>
                      <p className="text-xs text-gray-600">{student.domain} - {student.formation_type}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {myConfig && !hasPaid && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 mb-4 border border-blue-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-blue-900 mb-1">Frais de scolarité</h3>
                <p className="text-2xl font-bold text-blue-600 mb-2">{myConfig.amount} {myConfig.currency}</p>
                <p className="text-sm text-blue-700 mb-3">{myConfig.domain} - {myConfig.formation_type}</p>
                
                {myConfig.payment_link && (
                  <a href={myConfig.payment_link} target="_blank" rel="noopener noreferrer" className="block mb-3">
                    <Button variant="outline" className="w-full rounded-xl border-blue-300 text-blue-700 hover:bg-blue-50">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Payer en ligne
                    </Button>
                  </a>
                )}

                <Button onClick={() => setProofDialog(true)} className="bg-blue-600 hover:bg-blue-700 rounded-xl w-full">
                  <Upload className="w-4 h-4 mr-2" />
                  Envoyer une preuve de paiement
                </Button>
              </div>
            </div>
          </div>
        )}

        {paymentProofs.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-bold text-gray-700 mb-2 px-2">Preuves de paiement</h3>
            <div className="space-y-2">
              {paymentProofs.map(proof => (
                <div key={proof.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-bold text-gray-900">{proof.amount} {myConfig?.currency || 'XOF'}</p>
                      <p className="text-xs text-gray-500">{proof.period}</p>
                    </div>
                    <Badge className={getStatusColor(proof.status)}>
                      {proof.status}
                    </Badge>
                  </div>
                  <a href={proof.proof_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                    Voir le reçu
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {tuitions.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-700 px-2">Historique</h3>
            {tuitions.map(tuition => (
              <div key={tuition.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(tuition.status)}
                    <div>
                      <p className="font-bold text-gray-900">{tuition.amount} {tuition.currency}</p>
                      <p className="text-sm text-gray-500">{tuition.period}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(tuition.status)}>
                    {tuition.status}
                  </Badge>
                </div>
                {tuition.notes && (
                  <p className="text-xs text-gray-600 mt-2">{tuition.notes}</p>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  {tuition.created_date && format(new Date(tuition.created_date), "d MMMM yyyy", { locale: fr })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={proofDialog} onOpenChange={setProofDialog}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Preuve de paiement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm text-gray-700 mb-2 block">Numéro de transaction</label>
              <Input
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Ex: TRX123456789"
                className="rounded-xl h-11"
              />
            </div>
            <div>
              <label className="text-sm text-gray-700 mb-2 block">Capture d'écran du reçu</label>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setReceiptFile(e.target.files[0])}
                  className="hidden"
                  id="receipt-upload"
                />
                <label htmlFor="receipt-upload" className="cursor-pointer">
                  {receiptFile ? (
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-green-700">{receiptFile.name}</span>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Cliquez pour charger</p>
                    </div>
                  )}
                </label>
              </div>
            </div>
            <Button
              onClick={submitProof}
              disabled={uploading || !receiptFile || !transactionId.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl h-11"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {uploading ? 'Envoi...' : 'Envoyer'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <StudentBottomNav />
    </div>
  );
}