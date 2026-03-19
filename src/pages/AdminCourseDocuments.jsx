import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Plus, Lock, Unlock, Trash2, Edit, Search, Loader2, Check, X, Key, DollarSign, TrendingUp, ShoppingCart, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import AdminTopNav from '../components/admin/AdminTopNav';
import AdminGuard from '../components/admin/AdminGuard';
import { DOMAINS, FORMATION_BY_DOMAIN } from '@/components/domainFormationMapping';

const ALL_FORMATIONS = [
  'École des évangélistes',
  'Discipolat',
  'Brevet',
  'Baccalauréat',
  'Licence',
  'Master',
  'Doctorat'
];

export default function AdminCourseDocuments() {
  const queryClient = useQueryClient();
  const [createDialog, setCreateDialog] = useState(false);
  const [requestsDialog, setRequestsDialog] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [domain, setDomain] = useState('');
  const [formationType, setFormationType] = useState('');
  const [documentFile, setDocumentFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [paymentLink, setPaymentLink] = useState('');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState('publié');

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['courseDocuments'],
    queryFn: () => base44.entities.CourseDocument.list('-created_date')
  });

  const { data: purchaseRequests = [] } = useQuery({
    queryKey: ['documentPurchaseRequests'],
    queryFn: () => base44.entities.DocumentPurchaseRequest.list('-created_date'),
    refetchInterval: 10000
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      let docUrl = editingDoc?.document_url || '';
      let coverUrl = editingDoc?.cover_image || '';

      if (documentFile) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: documentFile });
        docUrl = file_url;
      }

      if (coverFile) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: coverFile });
        coverUrl = file_url;
      }

      const data = {
        title,
        description,
        domain,
        formation_type: formationType,
        document_url: docUrl,
        cover_image: coverUrl,
        is_locked: isLocked,
        payment_link: isLocked ? paymentLink : null,
        price: isLocked ? parseFloat(price) : null,
        status
      };

      if (editingDoc) {
        return base44.entities.CourseDocument.update(editingDoc.id, data);
      } else {
        return base44.entities.CourseDocument.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['courseDocuments']);
      toast.success(editingDoc ? 'Document mis à jour' : 'Document créé');
      resetForm();
    },
    onError: () => toast.error('Erreur lors de la création')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CourseDocument.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['courseDocuments']);
      toast.success('Document supprimé');
    }
  });

  const validateRequestMutation = useMutation({
    mutationFn: async ({ requestId, studentEmail, documentTitle }) => {
      const code = generateDownloadCode();
      await base44.entities.DocumentPurchaseRequest.update(requestId, {
        status: 'validé',
        download_code: code
      });
      await base44.entities.Notification.create({
        recipient_email: studentEmail,
        type: 'success',
        title: '✅ Achat validé !',
        message: `Votre achat de "${documentTitle}" a été validé. Code de téléchargement : ${code}`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['documentPurchaseRequests']);
      toast.success('Demande validée avec code généré');
    }
  });

  const rejectRequestMutation = useMutation({
    mutationFn: async ({ requestId, studentEmail, documentTitle }) => {
      await base44.entities.DocumentPurchaseRequest.update(requestId, { status: 'rejeté' });
      await base44.entities.Notification.create({
        recipient_email: studentEmail,
        type: 'warning',
        title: '❌ Achat rejeté',
        message: `Votre demande d'achat pour "${documentTitle}" a été rejetée. Contactez l'administration.`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['documentPurchaseRequests']);
      toast.error('Demande rejetée');
    }
  });

  const generateDownloadCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
      if (i === 3) code += '-';
    }
    return code;
  };

  const resetForm = () => {
    setCreateDialog(false);
    setEditingDoc(null);
    setTitle('');
    setDescription('');
    setDomain('');
    setFormationType('');
    setDocumentFile(null);
    setCoverFile(null);
    setIsLocked(false);
    setPaymentLink('');
    setPrice('');
    setStatus('publié');
  };

  const handleEdit = (doc) => {
    setEditingDoc(doc);
    setTitle(doc.title);
    setDescription(doc.description || '');
    setDomain(doc.domain);
    setFormationType(doc.formation_type);
    setIsLocked(doc.is_locked || false);
    setPaymentLink(doc.payment_link || '');
    setPrice(doc.price?.toString() || '');
    setStatus(doc.status);
    setCreateDialog(true);
  };

  const handleSubmit = () => {
    if (!title || !domain || !formationType) {
      toast.error('Veuillez remplir tous les champs requis');
      return;
    }
    if (!editingDoc && !documentFile) {
      toast.error('Veuillez sélectionner un document PDF');
      return;
    }
    if (isLocked && (!paymentLink || !price)) {
      toast.error('Lien de paiement et prix requis pour un document verrouillé');
      return;
    }
    createMutation.mutate();
  };

  const filteredDocs = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.domain.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingRequests = purchaseRequests.filter(r => r.status === 'en_attente');
  const validatedRequests = purchaseRequests.filter(r => r.status === 'validé');
  const totalRevenue = validatedRequests.reduce((sum, req) => sum + (req.amount || 0), 0);
  const totalPurchases = validatedRequests.length;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        <AdminTopNav />
        <div className="pt-20 px-4 pb-12 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-black text-gray-900 mb-2">Documents de Cours</h1>
              <p className="text-gray-600 text-sm">Gérez les documents payants et gratuits</p>
            </div>
            <div className="flex gap-3">
              {pendingRequests.length > 0 && (
                <Button onClick={() => setRequestsDialog(true)} variant="outline" className="border-amber-500 text-amber-700 hover:bg-amber-50 relative">
                  <Key className="w-4 h-4 mr-2" />
                  Demandes ({pendingRequests.length})
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {pendingRequests.length}
                  </div>
                </Button>
              )}
              <Button onClick={() => { resetForm(); setCreateDialog(true); }} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl">
                <Plus className="w-4 h-4 mr-2" />
                Nouveau document
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
              <TrendingUp className="w-8 h-8 mb-3 opacity-80" />
              <p className="text-3xl font-black mb-1">{totalRevenue.toLocaleString()} XOF</p>
              <p className="text-green-100 text-sm">Revenus générés</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
              <ShoppingCart className="w-8 h-8 mb-3 opacity-80" />
              <p className="text-3xl font-black mb-1">{totalPurchases}</p>
              <p className="text-blue-100 text-sm">Achats validés</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg">
              <FileText className="w-8 h-8 mb-3 opacity-80" />
              <p className="text-3xl font-black mb-1">{documents.length}</p>
              <p className="text-purple-100 text-sm">Documents publiés</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Rechercher un document..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocs.map(doc => (
              <div key={doc.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all">
                <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 relative">
                  {doc.cover_image ? (
                    <img src={doc.cover_image} alt={doc.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <FileText className="w-12 h-12 text-blue-400/50" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex gap-2">
                    <Badge className={doc.status === 'publié' ? 'bg-green-500' : 'bg-gray-500'}>
                      {doc.status}
                    </Badge>
                    {doc.is_locked && (
                      <Badge className="bg-amber-500">
                        <Lock className="w-3 h-3 mr-1" />
                        Payant
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-1">{doc.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <Badge variant="outline" className="text-xs">{doc.domain}</Badge>
                    <Badge variant="outline" className="text-xs">{doc.formation_type}</Badge>
                  </div>
                  {doc.is_locked && (
                    <div className="flex items-center gap-2 text-sm text-amber-700 mb-3 bg-amber-50 px-3 py-2 rounded-lg">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-bold">{doc.price?.toLocaleString()} XOF</span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button onClick={() => handleEdit(doc)} size="sm" variant="outline" className="flex-1 rounded-lg">
                      <Edit className="w-3 h-3 mr-1" />
                      Modifier
                    </Button>
                    <Button
                      onClick={() => {
                        if (confirm('Supprimer ce document ?')) {
                          deleteMutation.mutate(doc.id);
                        }
                      }}
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Create/Edit Dialog */}
        <Dialog open={createDialog} onOpenChange={(open) => { if (!open) resetForm(); }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle>{editingDoc ? 'Modifier' : 'Nouveau'} document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Titre *</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre du document" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Description..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Domaine *</label>
                  <select value={domain} onChange={(e) => { setDomain(e.target.value); setFormationType(''); }} className="w-full h-11 rounded-lg border border-gray-300 px-3">
                    <option value="">Sélectionner...</option>
                    {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Formation *</label>
                  <select value={formationType} onChange={(e) => setFormationType(e.target.value)} disabled={!domain} className="w-full h-11 rounded-lg border border-gray-300 px-3">
                    <option value="">Sélectionner...</option>
                    {ALL_FORMATIONS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Document PDF {!editingDoc && '*'}</label>
                <input type="file" accept=".pdf" onChange={(e) => setDocumentFile(e.target.files[0])} className="w-full border rounded-lg p-2" />
                {editingDoc && <p className="text-xs text-gray-500 mt-1">Laissez vide pour conserver le document actuel</p>}
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Image de couverture</label>
                <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files[0])} className="w-full border rounded-lg p-2" />
              </div>
              
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <label className="text-sm font-bold">Verrouiller le document (Payant)</label>
                    <p className="text-xs text-gray-500">Nécessite un paiement et un code</p>
                  </div>
                  <input type="checkbox" checked={isLocked} onChange={(e) => setIsLocked(e.target.checked)} className="w-10 h-6 accent-amber-500" />
                </div>
                
                {isLocked && (
                  <div className="space-y-3 bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Prix (XOF) *</label>
                      <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="5000" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Lien de paiement externe *</label>
                      <Input value={paymentLink} onChange={(e) => setPaymentLink(e.target.value)} placeholder="https://..." />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Statut</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full h-11 rounded-lg border border-gray-300 px-3">
                  <option value="brouillon">Brouillon</option>
                  <option value="publié">Publié</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={resetForm} className="flex-1">Annuler</Button>
                <Button onClick={handleSubmit} disabled={createMutation.isPending} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingDoc ? 'Mettre à jour' : 'Créer')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Purchase Requests Dialog */}
        <Dialog open={requestsDialog} onOpenChange={setRequestsDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Demandes d'achat de documents</DialogTitle>
            </DialogHeader>
            
            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200 pb-2 mt-4">
              <button className="px-4 py-2 rounded-t-lg bg-amber-100 text-amber-700 font-medium text-sm border-b-2 border-amber-500">
                En attente ({pendingRequests.length})
              </button>
              <button 
                onClick={() => {}}
                className="px-4 py-2 rounded-t-lg text-gray-600 hover:bg-gray-50 font-medium text-sm"
              >
                Validés ({validatedRequests.length})
              </button>
            </div>

            <div className="space-y-4 mt-4">
              {pendingRequests.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Key className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Aucune demande en attente</p>
                </div>
              ) : (
                pendingRequests.map(req => (
                  <div key={req.id} className="border border-amber-200 rounded-xl overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50">
                    <div className="p-5">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-lg">{req.student_name?.charAt(0)}</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-900 text-lg">{req.student_name}</p>
                          <p className="text-sm text-gray-600">{req.student_email}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className="bg-purple-100 text-purple-700 border-purple-200">{req.document_title}</Badge>
                            <Badge className="bg-green-600 text-white">{req.amount?.toLocaleString()} XOF</Badge>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/70 backdrop-blur rounded-lg p-4 mb-4 border border-amber-200">
                        <p className="text-xs text-gray-500 mb-2 font-medium uppercase">Détails du paiement</p>
                        <div className="space-y-1 text-sm">
                          <p className="text-gray-700">
                            <span className="font-semibold">Référence:</span> 
                            <span className="ml-2 font-mono bg-gray-100 px-2 py-1 rounded">{req.transaction_reference}</span>
                          </p>
                        </div>
                      </div>

                      {/* Preuve de paiement */}
                      {req.payment_proof_url && (
                        <div className="mb-4">
                          <p className="text-xs text-gray-500 mb-2 font-medium uppercase">Preuve de paiement</p>
                          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <img 
                              src={req.payment_proof_url} 
                              alt="Preuve de paiement" 
                              className="w-full max-h-64 object-contain cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => window.open(req.payment_proof_url, '_blank')}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1 text-center">Cliquez pour agrandir</p>
                        </div>
                      )}

                      <div className="flex gap-3">
                        <Button
                          onClick={() => validateRequestMutation.mutate({
                            requestId: req.id,
                            studentEmail: req.student_email,
                            documentTitle: req.document_title
                          })}
                          disabled={validateRequestMutation.isPending}
                          size="sm"
                          className="bg-green-500 hover:bg-green-600 flex-1 h-11 rounded-xl font-semibold"
                        >
                          {validateRequestMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              Valider & Générer code
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => rejectRequestMutation.mutate({
                            requestId: req.id,
                            studentEmail: req.student_email,
                            documentTitle: req.document_title
                          })}
                          disabled={rejectRequestMutation.isPending}
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-300 hover:bg-red-50 px-6 h-11 rounded-xl font-semibold"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Rejeter
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* Historique validé */}
              {validatedRequests.length > 0 && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Key className="w-5 h-5 text-green-600" />
                    Achats validés ({validatedRequests.length})
                  </h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {validatedRequests.map(req => (
                      <div key={req.id} className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-sm">{req.student_name}</p>
                          <p className="text-xs text-gray-600">{req.document_title}</p>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-green-600 text-white mb-1">{req.amount?.toLocaleString()} XOF</Badge>
                          <p className="text-xs text-gray-500 font-mono">Code: {req.download_code}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminGuard>
  );
}