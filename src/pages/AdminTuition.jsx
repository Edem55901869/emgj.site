import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DollarSign, Plus, Check, X, ExternalLink, Loader2, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import AdminTopNav from '../components/admin/AdminTopNav';
import AdminGuard from '../components/admin/AdminGuard';

const DOMAINS = ['THÉOLOGIE', 'LEADERSHIP', 'MISSIOLOGIE', 'PROPHÉTIQUE', 'ENTREPRENEURIAT', 'AUMÔNERIE', 'MINISTÈRE APOSTOLIQUE'];
const FORMATIONS = ['Discipola', 'Brevet', 'Baccalauréat', 'Licence', 'Master', 'Doctorat'];

export default function AdminTuition() {
  const [configOpen, setConfigOpen] = useState(false);
  const [form, setForm] = useState({ domain: '', formation_type: '', amount: '', payment_link: '' });
  const queryClient = useQueryClient();

  const { data: configs = [], isLoading: cLoading } = useQuery({ queryKey: ['tuitionConfigs'], queryFn: () => base44.entities.TuitionConfig.list() });
  const { data: proofs = [], isLoading: pLoading } = useQuery({ queryKey: ['paymentProofs'], queryFn: () => base44.entities.PaymentProof.list('-created_date', 100) });

  const createConfigMutation = useMutation({
    mutationFn: (data) => base44.entities.TuitionConfig.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tuitionConfigs'] });
      setConfigOpen(false);
      setForm({ domain: '', formation_type: '', amount: '', payment_link: '' });
      toast.success('Configuration créée');
    },
  });

  const validateProofMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.PaymentProof.update(id, { status }),
    onSuccess: (_, { status, id }) => {
      queryClient.invalidateQueries({ queryKey: ['paymentProofs'] });
      const proof = proofs.find(p => p.id === id);
      if (status === 'validé' && proof) {
        base44.entities.Notification.create({
          recipient_email: proof.student_email,
          title: 'Paiement validé',
          message: `Votre paiement de ${proof.amount} XOF a été validé avec succès.`,
          type: 'success'
        });
      }
      toast.success(status === 'validé' ? 'Paiement validé' : 'Paiement rejeté');
    },
  });

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
        <AdminTopNav />
        <div className="pt-20 px-4 pb-8 max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Gestion de la Scolarité</h1>
            <p className="text-gray-500 mt-1">Configurez les montants et validez les paiements</p>
          </div>

          <Tabs defaultValue="config" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="config">Configuration</TabsTrigger>
              <TabsTrigger value="proofs">Preuves de paiement ({proofs.filter(p => p.status === 'en_attente').length})</TabsTrigger>
            </TabsList>

            <TabsContent value="config">
              <div className="flex justify-end mb-4">
                <Button onClick={() => setConfigOpen(true)} className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-xl shadow-lg">
                  <Plus className="w-4 h-4 mr-2" /> Nouvelle configuration
                </Button>
              </div>
              {cLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {configs.map(config => (
                    <div key={config.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                          <DollarSign className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="space-y-2 mb-3">
                        <Badge className="bg-blue-50 text-blue-700 border-blue-100 text-xs">{config.domain}</Badge>
                        <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 text-xs ml-2">{config.formation_type}</Badge>
                        <p className="text-2xl font-bold text-gray-900 mt-2">{config.amount.toLocaleString()} {config.currency}</p>
                      </div>
                      <a href={config.payment_link} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
                        Lien de paiement <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="proofs">
              {pLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
              ) : proofs.length === 0 ? (
                <div className="text-center py-12 text-gray-500">Aucune preuve de paiement</div>
              ) : (
                <div className="space-y-3">
                  {proofs.map(proof => (
                    <div key={proof.id} className="bg-white rounded-xl border border-gray-100 p-5 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {proof.student_name?.[0]}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{proof.student_name}</p>
                        <p className="text-sm text-gray-500">{proof.student_email}</p>
                        <p className="text-lg font-bold text-green-600 mt-1">{proof.amount.toLocaleString()} XOF</p>
                        {proof.period && <p className="text-xs text-gray-500">{proof.period}</p>}
                        {proof.proof_url && (
                          <a href={proof.proof_url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:text-blue-700 mt-2 inline-flex items-center gap-1">
                            Voir la preuve <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <Badge className={`${
                        proof.status === 'validé' ? 'bg-green-50 text-green-700 border-green-200' :
                        proof.status === 'rejeté' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {proof.status}
                      </Badge>
                      {proof.status === 'en_attente' && (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => validateProofMutation.mutate({ id: proof.id, status: 'validé' })} className="bg-green-600 hover:bg-green-700 rounded-xl">
                            <Check className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => validateProofMutation.mutate({ id: proof.id, status: 'rejeté' })} className="border-red-200 text-red-600 rounded-xl">
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Config Dialog */}
        <Dialog open={configOpen} onOpenChange={setConfigOpen}>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader><DialogTitle>Nouvelle configuration de scolarité</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <Select value={form.domain} onValueChange={(v) => setForm({ ...form, domain: v })}>
                <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="Domaine" /></SelectTrigger>
                <SelectContent>{DOMAINS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={form.formation_type} onValueChange={(v) => setForm({ ...form, formation_type: v })}>
                <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="Type de formation" /></SelectTrigger>
                <SelectContent>{FORMATIONS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
              </Select>
              <Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="Montant (XOF)" className="rounded-xl h-11" />
              <Input value={form.payment_link} onChange={(e) => setForm({ ...form, payment_link: e.target.value })} placeholder="Lien de paiement externe" className="rounded-xl h-11" />
              <Button
                onClick={() => createConfigMutation.mutate({ ...form, amount: parseFloat(form.amount) })}
                disabled={!form.domain || !form.formation_type || !form.amount || !form.payment_link || createConfigMutation.isPending}
                className="w-full bg-green-600 hover:bg-green-700 rounded-xl h-11"
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