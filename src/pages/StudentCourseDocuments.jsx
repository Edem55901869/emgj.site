import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Lock, Download, DollarSign, Loader2, Key, Check, ExternalLink, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import StudentBottomNav from '../components/student/StudentBottomNav';

export default function StudentCourseDocuments() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchaseDialog, setPurchaseDialog] = useState(false);
  const [codeDialog, setCodeDialog] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [txRef, setTxRef] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [downloadCode, setDownloadCode] = useState('');

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const adminView = localStorage.getItem('admin_student_view');
    if (adminView) {
      const viewData = JSON.parse(adminView);
      setUser({ email: 'admin@preview.emgj' });
      setStudent({ domain: viewData.domain, formation_type: viewData.formation_type });
      setLoading(false);
      return;
    }
    try {
      const u = await base44.auth.me();
      setUser(u);
      const students = await base44.entities.Student.filter({ user_email: u.email });
      if (students.length > 0) setStudent(students[0]);
    } catch {}
    setLoading(false);
  };

  const isPreview = user?.email === 'admin@preview.emgj';

  const { data: documents = [] } = useQuery({
    queryKey: ['courseDocuments', student?.domain, student?.formation_type],
    queryFn: () => base44.entities.CourseDocument.filter({
      domain: student?.domain,
      formation_type: student?.formation_type,
      status: 'publié'
    }),
    enabled: !!student
  });

  const { data: myRequests = [] } = useQuery({
    queryKey: ['myDocumentPurchases', user?.email],
    queryFn: () => base44.entities.DocumentPurchaseRequest.filter({ student_email: user?.email }),
    enabled: !!user && !isPreview
  });

  const submitPurchaseMutation = useMutation({
    mutationFn: async () => {
      let proofUrl = '';
      if (proofFile) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: proofFile });
        proofUrl = file_url;
      }

      await base44.entities.DocumentPurchaseRequest.create({
        document_id: selectedDoc.id,
        document_title: selectedDoc.title,
        student_email: user.email,
        student_name: student.first_name + ' ' + student.last_name,
        amount: selectedDoc.price,
        transaction_reference: txRef,
        payment_method: paymentMethod,
        payment_proof_url: proofUrl,
        status: 'en_attente'
      });

      const admins = await base44.entities.AdminUser.list();
      for (const admin of admins) {
        if (admin.email) {
          await base44.entities.Notification.create({
            recipient_email: admin.email,
            type: 'info',
            title: '📄 Nouvelle demande d\'achat de document',
            message: `${student.first_name} ${student.last_name} demande "${selectedDoc.title}" - ${selectedDoc.price} XOF`
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['myDocumentPurchases']);
      toast.success('Demande envoyée ! En attente de validation.');
      setPurchaseDialog(false);
      setTxRef('');
      setPaymentMethod('');
      setProofFile(null);
      setSelectedDoc(null);
    },
    onError: () => toast.error('Erreur lors de l\'envoi')
  });

  const downloadWithCodeMutation = useMutation({
    mutationFn: async ({ docId, code }) => {
      const request = myRequests.find(r => r.document_id === docId && r.download_code === code && !r.code_used);
      if (!request) {
        throw new Error('Code invalide ou déjà utilisé');
      }

      await base44.entities.DocumentPurchaseRequest.update(request.id, { code_used: true });
      
      const doc = documents.find(d => d.id === docId);
      await base44.entities.CourseDocument.update(docId, {
        download_count: (doc.download_count || 0) + 1
      });

      return doc.document_url;
    },
    onSuccess: (fileUrl) => {
      queryClient.invalidateQueries(['myDocumentPurchases']);
      window.open(fileUrl, '_blank');
      toast.success('Document téléchargé avec succès !');
      setCodeDialog(false);
      setDownloadCode('');
      setSelectedDoc(null);
    },
    onError: (error) => toast.error(error.message || 'Code invalide')
  });

  const handleBuyClick = (doc) => {
    setSelectedDoc(doc);
    window.open(doc.payment_link, '_blank');
    setPurchaseDialog(true);
  };

  const handleDownloadClick = (doc) => {
    if (doc.is_locked) {
      const validatedRequest = myRequests.find(r => r.document_id === doc.id && r.status === 'validé' && !r.code_used);
      if (validatedRequest) {
        setSelectedDoc(doc);
        setCodeDialog(true);
      } else {
        toast.error('Aucun code de téléchargement disponible');
      }
    } else {
      window.open(doc.document_url, '_blank');
      toast.success('Document téléchargé !');
    }
  };

  const getDocStatus = (doc) => {
    const request = myRequests.find(r => r.document_id === doc.id);
    if (!request) return null;
    return request;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-8 text-white">
        <h1 className="text-2xl font-bold mb-1">Documents de Cours</h1>
        <p className="text-white/80 text-sm">Accédez aux ressources pédagogiques</p>
      </div>

      <div className="px-4 py-6 space-y-4">
        {documents.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">Aucun document disponible pour votre formation</p>
          </div>
        ) : (
          documents.map(doc => {
            const request = getDocStatus(doc);
            const isPending = request?.status === 'en_attente';
            const isValidated = request?.status === 'validé' && !request?.code_used;
            const isUsed = request?.code_used;

            return (
              <div key={doc.id} className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 relative">
                  {doc.cover_image ? (
                    <img src={doc.cover_image} alt={doc.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <FileText className="w-12 h-12 text-blue-400/50" />
                    </div>
                  )}
                  {doc.is_locked && (
                    <Badge className="absolute top-3 right-3 bg-amber-500">
                      <Lock className="w-3 h-3 mr-1" />
                      Payant
                    </Badge>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-2">{doc.title}</h3>
                  {doc.description && <p className="text-sm text-gray-600 mb-3">{doc.description}</p>}
                  
                  {doc.is_locked && (
                    <div className="flex items-center gap-2 text-sm font-bold text-amber-700 mb-3 bg-amber-50 px-3 py-2 rounded-lg">
                      <DollarSign className="w-4 h-4" />
                      {doc.price?.toLocaleString()} XOF
                    </div>
                  )}

                  {isPending && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3 text-sm text-amber-700">
                      ⏳ En attente de validation...
                    </div>
                  )}

                  {isValidated && (
                    <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-3 text-sm text-green-700 font-medium">
                      ✅ Code disponible ! Téléchargez maintenant.
                    </div>
                  )}

                  {isUsed && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 mb-3 text-sm text-gray-600">
                      ✓ Document déjà téléchargé
                    </div>
                  )}

                  {doc.is_locked ? (
                    <div className="flex gap-2">
                      {!request ? (
                        <Button onClick={() => handleBuyClick(doc)} className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-xl">
                          <DollarSign className="w-4 h-4 mr-1" />
                          Acheter
                        </Button>
                      ) : isValidated ? (
                        <Button onClick={() => handleDownloadClick(doc)} className="flex-1 bg-green-600 hover:bg-green-700 rounded-xl">
                          <Key className="w-4 h-4 mr-1" />
                          Entrer le code
                        </Button>
                      ) : null}
                    </div>
                  ) : (
                    <Button onClick={() => handleDownloadClick(doc)} className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl">
                      <Download className="w-4 h-4 mr-1" />
                      Télécharger gratuitement
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Purchase Dialog */}
      <Dialog open={purchaseDialog} onOpenChange={setPurchaseDialog}>
        <DialogContent className="max-w-sm bg-white rounded-3xl mx-4">
          <DialogHeader>
            <DialogTitle>Confirmer l'achat</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="bg-blue-50 rounded-2xl p-4 text-center border border-blue-200">
              <p className="text-sm text-blue-700 mb-1">Montant</p>
              <p className="text-2xl font-bold text-blue-900">{selectedDoc?.price?.toLocaleString()} XOF</p>
              <p className="text-xs text-blue-600 mt-1">{selectedDoc?.title}</p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Méthode de paiement *</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full h-11 rounded-xl border border-gray-300 px-3">
                <option value="">Sélectionner...</option>
                <option value="Wave">Wave</option>
                <option value="FedaPay">FedaPay</option>
                <option value="Mobile Money">Mobile Money</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Référence de transaction *</label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input value={txRef} onChange={(e) => setTxRef(e.target.value)} placeholder="TXN-XXXXXX" className="pl-10 rounded-xl" />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Preuve de paiement (optionnel)</label>
              <input type="file" accept="image/*,.pdf" onChange={(e) => setProofFile(e.target.files[0])} className="w-full border rounded-xl p-2 text-sm" />
            </div>

            <Button
              onClick={() => submitPurchaseMutation.mutate()}
              disabled={submitPurchaseMutation.isPending || !txRef || !paymentMethod}
              className="w-full bg-blue-600 hover:bg-blue-700 rounded-2xl h-12"
            >
              {submitPurchaseMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmer l\'achat'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Code Dialog */}
      <Dialog open={codeDialog} onOpenChange={setCodeDialog}>
        <DialogContent className="max-w-sm bg-white rounded-3xl mx-4">
          <DialogHeader>
            <DialogTitle>Code de téléchargement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="bg-green-50 rounded-2xl p-4 text-center border border-green-200">
              <Key className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-green-700">Entrez le code reçu par notification</p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Code de téléchargement</label>
              <Input
                value={downloadCode}
                onChange={(e) => setDownloadCode(e.target.value.toUpperCase())}
                placeholder="XXXX-XXXX"
                className="rounded-xl h-12 text-center text-lg font-mono tracking-wider"
                maxLength={9}
              />
            </div>

            <Button
              onClick={() => downloadWithCodeMutation.mutate({ docId: selectedDoc?.id, code: downloadCode })}
              disabled={downloadWithCodeMutation.isPending || !downloadCode}
              className="w-full bg-green-600 hover:bg-green-700 rounded-2xl h-12"
            >
              {downloadWithCodeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Télécharger'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <StudentBottomNav />
    </div>
  );
}