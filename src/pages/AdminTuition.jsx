import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DollarSign, Plus, Trash2, Loader2, Check, X, Eye, ExternalLink, TrendingUp, Clock, CheckCircle2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import AdminTopNav from '../components/admin/AdminTopNav';
import AdminGuard from '../components/admin/AdminGuard';

const DOMAINS = ['THÉOLOGIE', 'LEADERSHIP ET ADMINISTRATION CHRÉTIENNE', 'MISSIOLOGIE', 'ÉCOLE PROPHETIQUES', 'ENTREPRENEURIAT', 'AUMÔNERIE', 'MINISTÈRE APOSTOLIQUE'];
const FORMATIONS = ['Brevet', 'Baccalauréat', 'Licence', 'Master', 'Doctorat'];

const FORMATION_BY_DOMAIN = {
  'THÉOLOGIE': ['Brevet', 'Baccalauréat', 'Licence', 'Doctorat'],
  'LEADERSHIP ET ADMINISTRATION CHRÉTIENNE': ['Licence', 'Master', 'Doctorat'],
  'MISSIOLOGIE': ['Licence', 'Master', 'Doctorat'],
  'ÉCOLE PROPHETIQUES': ['Brevet', 'Baccalauréat', 'Licence', 'Doctorat'],
  'ENTREPRENEURIAT': ['Licence', 'Master', 'Doctorat'],
  'AUMÔNERIE': ['Brevet', 'Baccalauréat', 'Licence', 'Doctorat'],
  'MINISTÈRE APOSTOLIQUE': ['Brevet', 'Baccalauréat', 'Licence', 'Doctorat']
};

export default function AdminTuition() {
  const [configDialog, setConfigDialog] = useState(false);
  const [configForm, setConfigForm] = useState({ domain: '', formation_type: '', amount: '', currency: 'XOF', payment_link: '' });
  const [statusFilter, setStatusFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: configs = [] } = useQuery({ queryKey: ['tuitionConfigs'], queryFn: () => base44.entities.TuitionConfig.list() });
  const { data: tuitions = [] } = useQuery({ queryKey: ['tuitions'], queryFn: () => base44.entities.Tuition.list('-created_date', 500) });
  const { data: paymentProofs = [] } = useQuery({ queryKey: ['paymentProofs'], queryFn: () => base44.entities.PaymentProof.list('-created_date', 500) });
  const { data: students = [] } = useQuery({ queryKey: ['students'], queryFn: () => base44.entities.Student.list() });

  const createConfigMutation = useMutation({
    mutationFn: (data) => base44.entities.TuitionConfig.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tuitionConfigs'] });
      setConfigDialog(false);
      setConfigForm({ domain: '', formation_type: '', amount: '', currency: 'XOF', payment_link: '' });
      toast.success('Configuration créée');
    },
  });

  const deleteConfigMutation = useMutation({
    mutationFn: (id) => base44.entities.TuitionConfig.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tuitionConfigs'] });
      toast.success('Configuration supprimée');
    },
  });

  const updateProofMutation = useMutation({
    mutationFn: async ({ id, status, studentEmail, studentName, amount }) => {
      await base44.entities.PaymentProof.update(id, { status });
      
      if (status === 'validé') {
        await base44.entities.Tuition.create({
          student_email: studentEmail,
          student_name: studentName,
          amount,
          currency: 'XOF',
          status: 'payé',
          period: new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
        });
        
        await base44.entities.Notification.create({
          recipient_email: studentEmail,
          type: 'success',
          title: '✅ Paiement validé',
          message: 'Votre preuve de paiement a été validée. Votre scolarité est à jour !'
        });
      } else if (status === 'rejeté') {
        await base44.entities.Notification.create({
          recipient_email: studentEmail,
          type: 'warning',
          title: '❌ Paiement rejeté',
          message: 'Votre preuve de paiement a été rejetée. Veuillez soumettre une nouvelle preuve valide.'
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentProofs'] });
      queryClient.invalidateQueries({ queryKey: ['tuitions'] });
      toast.success('Statut mis à jour');
    },
  });

  // Calculs statistiques
  const totalRevenue = tuitions.filter(t => t.status === 'payé').reduce((sum, t) => sum + (t.amount || 0), 0);
  const pendingAmount = paymentProofs.filter(p => p.status === 'en_attente').reduce((sum, p) => sum + (p.amount || 0), 0);
  
  const unpaidAmount = students.reduce((sum, student) => {
    const config = configs.find(c => c.domain === student.domain && c.formation_type === student.formation_type);
    const hasPaid = tuitions.some(t => t.student_email === student.user_email && t.status === 'payé') || 
                    paymentProofs.some(p => p.student_email === student.user_email && p.status === 'validé');
    return hasPaid ? sum : sum + (config?.amount || 0);
  }, 0);

  const pendingProofs = paymentProofs.filter(p => p.status === 'en_attente');
  const filteredProofs = statusFilter === 'all' ? paymentProofs : paymentProofs.filter(p => p.status === statusFilter);

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <AdminTopNav />
        <div className="pt-20 px-4 pb-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Scolarité & Paiements</h1>
              <p className="text-gray-600 mt-1">Gestion financière de la plateforme</p>
            </div>
            <Button onClick={() => setConfigDialog(true)} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg">
              <Plus className="w-4 h-4 mr-2" /> Configuration
            </Button>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-green-500 flex items-center justify-center shadow-lg">
                    <TrendingUp className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-green-700 font-medium mb-1">Revenus encaissés</p>
                    <p className="text-3xl font-bold text-green-900">{totalRevenue.toLocaleString()}</p>
                    <p className="text-xs text-green-600 mt-1">XOF</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-100 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center shadow-lg">
                    <Clock className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-amber-700 font-medium mb-1">En attente</p>
                    <p className="text-3xl font-bold text-amber-900">{pendingAmount.toLocaleString()}</p>
                    <p className="text-xs text-amber-600 mt-1">{pendingProofs.length} preuve(s)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-100 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-red-500 flex items-center justify-center shadow-lg">
                    <DollarSign className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-red-700 font-medium mb-1">Non payé</p>
                    <p className="text-3xl font-bold text-red-900">{unpaidAmount.toLocaleString()}</p>
                    <p className="text-xs text-red-600 mt-1">XOF</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>



          {/* Configurations */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6 mb-6">
            <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
              Configurations de scolarité
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {configs.map(config => (
                <div key={config.id} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{config.amount.toLocaleString()} {config.currency}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <Badge className="bg-blue-500 text-white text-xs">{config.domain}</Badge>
                        <Badge className="bg-indigo-500 text-white text-xs">{config.formation_type}</Badge>
                      </div>
                    </div>
                    <Button onClick={() => deleteConfigMutation.mutate(config.id)} variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  {config.payment_link && (
                    <a href={config.payment_link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-2">
                      <ExternalLink className="w-3 h-3" /> Lien de paiement
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Preuves de paiement en attente */}
          {pendingProofs.length > 0 && (
            <div className="mb-6 bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl p-5 shadow-lg">
              <h3 className="font-bold text-amber-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Preuves de paiement en attente ({pendingProofs.length})
              </h3>
              <div className="grid gap-3">
                {pendingProofs.map(proof => (
                  <div key={proof.id} className="bg-white rounded-xl p-4 flex items-center gap-4 shadow-sm">
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{proof.student_name}</p>
                      <p className="text-sm text-gray-600">{proof.student_email}</p>
                      <p className="text-sm font-medium text-amber-700 mt-1">{proof.amount.toLocaleString()} XOF • {proof.period}</p>
                    </div>
                    <a href={proof.proof_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="rounded-xl">
                        <Eye className="w-4 h-4 mr-1" /> Voir
                      </Button>
                    </a>
                    <Button
                      onClick={() => updateProofMutation.mutate({ id: proof.id, status: 'validé', studentEmail: proof.student_email, studentName: proof.student_name, amount: proof.amount })}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 rounded-xl"
                    >
                      <Check className="w-4 h-4 mr-1" /> Valider
                    </Button>
                    <Button
                      onClick={() => updateProofMutation.mutate({ id: proof.id, status: 'rejeté', studentEmail: proof.student_email })}
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50 rounded-xl"
                    >
                      <X className="w-4 h-4 mr-1" /> Rejeter
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Liste des preuves avec filtre */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-lg">Historique des preuves de paiement</h3>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48 h-10 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="en_attente">En attente</SelectItem>
                  <SelectItem value="validé">Validé</SelectItem>
                  <SelectItem value="rejeté">Rejeté</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
              {filteredProofs.map(p => (
                <div key={p.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{p.student_name}</p>
                    <p className="text-sm text-gray-500">{p.student_email}</p>
                  </div>
                  <div className="text-right mr-4">
                    <p className="font-bold text-gray-900">{p.amount.toLocaleString()} XOF</p>
                    <p className="text-xs text-gray-500">{p.period}</p>
                  </div>
                  <Badge className={
                    p.status === 'validé' ? 'bg-green-50 text-green-700 border-green-200' : 
                    p.status === 'rejeté' ? 'bg-red-50 text-red-700 border-red-200' : 
                    'bg-amber-50 text-amber-700 border-amber-200'
                  }>
                    {p.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Dialog open={configDialog} onOpenChange={setConfigDialog}>
          <DialogContent className="max-w-md rounded-3xl bg-white">
            <DialogHeader><DialogTitle className="text-xl">Nouvelle configuration</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <Select value={configForm.domain} onValueChange={(v) => setConfigForm({ ...configForm, domain: v })}>
                <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="Domaine" /></SelectTrigger>
                <SelectContent>{DOMAINS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={configForm.formation_type} onValueChange={(v) => setConfigForm({ ...configForm, formation_type: v })}>
                <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="Type de formation" /></SelectTrigger>
                <SelectContent>{FORMATIONS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
              </Select>
              <Input
                type="number"
                value={configForm.amount}
                onChange={(e) => setConfigForm({ ...configForm, amount: e.target.value })}
                placeholder="Montant"
                className="rounded-xl h-11"
              />
              <Input
                value={configForm.payment_link}
                onChange={(e) => setConfigForm({ ...configForm, payment_link: e.target.value })}
                placeholder="Lien de paiement (optionnel)"
                className="rounded-xl h-11"
              />
              <Button
                onClick={() => createConfigMutation.mutate(configForm)}
                disabled={!configForm.domain || !configForm.formation_type || !configForm.amount || createConfigMutation.isPending}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl h-11"
              >
                {createConfigMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Créer'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminGuard>
  );
}