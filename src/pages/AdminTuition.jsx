import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DollarSign, Plus, Edit3, Trash2, Loader2, Check, X, Eye, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import AdminTopNav from '../components/admin/AdminTopNav';
import AdminGuard from '../components/admin/AdminGuard';

const DOMAINS = ['THÉOLOGIE', 'LEADERSHIP', 'MISSIOLOGIE', 'PROPHÉTIQUE', 'ENTREPRENEURIAT', 'AUMÔNERIE', 'MINISTÈRE APOSTOLIQUE'];
const FORMATIONS = ['Discipola', 'Brevet', 'Baccalauréat', 'Licence', 'Master', 'Doctorat'];

export default function AdminTuition() {
  const [configDialog, setConfigDialog] = useState(false);
  const [configForm, setConfigForm] = useState({ domain: '', formation_type: '', amount: '', currency: 'XOF', payment_link: '' });
  const queryClient = useQueryClient();

  const { data: configs = [], isLoading } = useQuery({ queryKey: ['tuitionConfigs'], queryFn: () => base44.entities.TuitionConfig.list() });
  const { data: tuitions = [] } = useQuery({ queryKey: ['tuitions'], queryFn: () => base44.entities.Tuition.list('-created_date', 500) });
  const { data: paymentProofs = [] } = useQuery({ queryKey: ['paymentProofs'], queryFn: () => base44.entities.PaymentProof.list('-created_date', 500) });

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

  const pendingProofs = paymentProofs.filter(p => p.status === 'en_attente');

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
        <AdminTopNav />
        <div className="pt-20 px-4 pb-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Scolarité</h1>
              <p className="text-gray-500 mt-1">Gestion des paiements et configurations</p>
            </div>
            <Button onClick={() => setConfigDialog(true)} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg">
              <Plus className="w-4 h-4 mr-2" /> Nouvelle configuration
            </Button>
          </div>

          {pendingProofs.length > 0 && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <h3 className="font-bold text-amber-900 mb-3">Preuves de paiement en attente ({pendingProofs.length})</h3>
              <div className="grid gap-3">
                {pendingProofs.map(proof => (
                  <div key={proof.id} className="bg-white rounded-xl p-4 flex items-start gap-4">
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{proof.student_name}</p>
                      <p className="text-sm text-gray-600">{proof.student_email}</p>
                      <p className="text-sm text-gray-500 mt-1">{proof.amount} XOF • {proof.period}</p>
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
                      className="text-red-600 border-red-200 rounded-xl"
                    >
                      <X className="w-4 h-4 mr-1" /> Rejeter
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {configs.map(config => (
              <div key={config.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{config.amount} {config.currency}</h3>
                    <div className="flex gap-2 mt-2">
                      <Badge className="bg-blue-50 text-blue-700 border-blue-100 text-xs">{config.domain}</Badge>
                      <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 text-xs">{config.formation_type}</Badge>
                    </div>
                  </div>
                  <Button onClick={() => deleteConfigMutation.mutate(config.id)} variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                {config.payment_link && (
                  <a href={config.payment_link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" /> Lien de paiement
                  </a>
                )}
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Paiements enregistrés ({tuitions.length})</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {tuitions.map(t => (
                <div key={t.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="font-medium text-gray-900">{t.student_name}</p>
                    <p className="text-sm text-gray-500">{t.student_email}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{t.amount} {t.currency}</p>
                    <p className="text-xs text-gray-500">{t.period}</p>
                  </div>
                  <Badge className={t.status === 'payé' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}>
                    {t.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Dialog open={configDialog} onOpenChange={setConfigDialog}>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader><DialogTitle>Nouvelle configuration de scolarité</DialogTitle></DialogHeader>
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
                className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl h-11"
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