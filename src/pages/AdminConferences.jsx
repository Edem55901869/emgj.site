import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Radio, Plus, Trash2, Play, Square, Loader2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import AdminTopNav from '../components/admin/AdminTopNav';
import AdminGuard from '../components/admin/AdminGuard';

export default function AdminConferences() {
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', access_code: '', scheduled_date: '', status: 'planifiée' });
  const [audioFile, setAudioFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const { data: conferences = [], isLoading } = useQuery({
    queryKey: ['adminConfs'],
    queryFn: () => base44.entities.Conference.list('-created_date', 50),
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      let audio_url = '';
      if (audioFile) {
        setUploading(true);
        const { file_url } = await base44.integrations.Core.UploadFile({ file: audioFile });
        audio_url = file_url;
        setUploading(false);
      }
      return base44.entities.Conference.create({ ...data, audio_url });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminConfs'] });
      setCreateOpen(false);
      setForm({ title: '', description: '', access_code: '', scheduled_date: '', status: 'planifiée' });
      setAudioFile(null);
      toast.success('Conférence créée');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Conference.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminConfs'] });
      toast.success('Statut mis à jour');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Conference.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminConfs'] });
      toast.success('Conférence supprimée');
    },
  });

  const statusColors = {
    planifiée: 'bg-blue-50 text-blue-700 border-blue-200',
    en_cours: 'bg-green-50 text-green-700 border-green-200',
    terminée: 'bg-gray-100 text-gray-600 border-gray-200',
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        <AdminTopNav />
        <div className="pt-20 px-4 pb-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Conférences</h1>
            <Button onClick={() => setCreateOpen(true)} className="bg-blue-600 hover:bg-blue-700 rounded-xl">
              <Plus className="w-4 h-4 mr-2" /> Nouvelle conférence
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
          ) : (
            <div className="space-y-3">
              {conferences.map(conf => (
                <div key={conf.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${conf.status === 'en_cours' ? 'bg-green-50' : 'bg-blue-50'}`}>
                      <Radio className={`w-5 h-5 ${conf.status === 'en_cours' ? 'text-green-600' : 'text-blue-600'}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{conf.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{conf.description}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge className={`text-xs ${statusColors[conf.status]}`}>{conf.status}</Badge>
                        <span className="text-xs text-gray-400">Code: {conf.access_code}</span>
                        {conf.scheduled_date && (
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(conf.scheduled_date), "d MMM yyyy HH:mm", { locale: fr })}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {conf.status === 'planifiée' && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateStatusMutation.mutate({ id: conf.id, status: 'en_cours' })}>
                          <Play className="w-4 h-4 text-green-600" />
                        </Button>
                      )}
                      {conf.status === 'en_cours' && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateStatusMutation.mutate({ id: conf.id, status: 'terminée' })}>
                          <Square className="w-4 h-4 text-red-500" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteMutation.mutate(conf.id)}>
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader><DialogTitle>Nouvelle conférence</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Titre" className="rounded-xl h-11" />
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description..." className="rounded-xl" />
              <Input value={form.access_code} onChange={(e) => setForm({ ...form, access_code: e.target.value })} placeholder="Code d'accès" className="rounded-xl h-11" />
              <Input type="datetime-local" value={form.scheduled_date} onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })} className="rounded-xl h-11" />
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger className="rounded-xl h-11"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="planifiée">Planifiée</SelectItem>
                  <SelectItem value="en_cours">En cours</SelectItem>
                </SelectContent>
              </Select>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Fichier audio (optionnel)</label>
                <Input type="file" accept="audio/*" onChange={(e) => setAudioFile(e.target.files[0])} className="rounded-xl" />
              </div>
              <Button
                onClick={() => createMutation.mutate(form)}
                disabled={!form.title || !form.access_code || createMutation.isPending || uploading}
                className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl h-11"
              >
                {(createMutation.isPending || uploading) ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Créer'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminGuard>
  );
}