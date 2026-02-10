import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Radio, Plus, Trash2, Play, Square, Loader2, Calendar, Sparkles, Copy, Check, Users } from 'lucide-react';
import { motion } from 'framer-motion';
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
import ConferenceRoom from '../components/conference/ConferenceRoom';

export default function AdminConferences() {
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', access_code: '', scheduled_date: '', status: 'planifiée', max_participants: '' });
  const [audioFile, setAudioFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(null);
  const [inConference, setInConference] = useState(false);
  const [selectedConf, setSelectedConf] = useState(null);
  const [admin, setAdmin] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const adminData = JSON.parse(localStorage.getItem('emgj_admin') || '{}');
    setAdmin(adminData);
  }, []);

  const generateCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setForm({ ...form, access_code: code });
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
    toast.success('Code copié');
  };

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
      setForm({ title: '', description: '', access_code: '', scheduled_date: '', status: 'planifiée', max_participants: '' });
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

  const openConference = (conf) => {
    setSelectedConf(conf);
    setInConference(true);
  };

  const statusColors = {
    planifiée: 'bg-blue-50 text-blue-700 border-blue-200',
    en_cours: 'bg-green-50 text-green-700 border-green-200',
    terminée: 'bg-gray-100 text-gray-600 border-gray-200',
  };

  if (inConference && selectedConf) {
    return (
      <ConferenceRoom
        conference={selectedConf}
        userEmail={admin?.email}
        userName={admin ? `${admin.first_name} ${admin.last_name}` : 'Admin'}
        isAdmin={true}
        onClose={() => {
          setInConference(false);
          setSelectedConf(null);
          queryClient.invalidateQueries({ queryKey: ['adminConfs'] });
        }}
      />
    );
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <AdminTopNav />
        <div className="pt-20 px-4 pb-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                Conférences en ligne
              </h1>
              <p className="text-gray-500">Organisez et diffusez vos conférences audio</p>
            </div>
            <Button onClick={() => setCreateOpen(true)} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 rounded-xl shadow-lg">
              <Plus className="w-4 h-4 mr-2" /> Créer une conférence
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
          ) : conferences.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200"
            >
              <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
                <Radio className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune conférence</h3>
              <p className="text-gray-500 mb-6">Créez votre première conférence audio</p>
              <Button onClick={() => setCreateOpen(true)} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 rounded-xl">
                <Plus className="w-4 h-4 mr-2" /> Créer maintenant
              </Button>
            </motion.div>
          ) : (
            <div className="grid gap-4">
              {conferences.map((conf, i) => (
                <motion.div
                  key={conf.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all overflow-hidden"
                >
                  <div className={`h-1 bg-gradient-to-r ${
                    conf.status === 'en_cours' ? 'from-green-500 to-emerald-500' :
                    conf.status === 'terminée' ? 'from-gray-400 to-gray-500' :
                    'from-blue-500 to-indigo-500'
                  }`} />
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                        conf.status === 'en_cours' ? 'bg-green-50' :
                        conf.status === 'terminée' ? 'bg-gray-50' : 'bg-blue-50'
                      }`}>
                        <Radio className={`w-6 h-6 ${
                          conf.status === 'en_cours' ? 'text-green-600 animate-pulse' :
                          conf.status === 'terminée' ? 'text-gray-400' : 'text-blue-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg mb-1">{conf.title}</h3>
                        <p className="text-sm text-gray-600 mb-3">{conf.description}</p>
                        <div className="flex items-center gap-3 flex-wrap">
                          <Badge className={`text-xs font-semibold ${statusColors[conf.status]}`}>
                            {conf.status === 'en_cours' ? '🟢 En direct' : conf.status === 'terminée' ? '⚫ Terminée' : '🔵 Planifiée'}
                          </Badge>
                          {conf.scheduled_date && (
                            <span className="text-xs text-gray-500 flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg">
                              <Calendar className="w-3.5 h-3.5" />
                              {format(new Date(conf.scheduled_date), "d MMM yyyy 'à' HH:mm", { locale: fr })}
                            </span>
                          )}
                          <button
                            onClick={() => copyCode(conf.access_code)}
                            className="text-xs flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg hover:bg-indigo-100 transition-colors font-mono font-bold"
                          >
                            {copied === conf.access_code ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            Code: {conf.access_code}
                          </button>
                          {conf.max_participants && (
                            <span className="text-xs flex items-center gap-1.5 bg-green-50 text-green-700 px-2.5 py-1 rounded-lg font-semibold">
                              <Users className="w-3.5 h-3.5" />
                              {conf.current_participants || 0} / {conf.max_participants}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {conf.status === 'planifiée' && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 hover:bg-green-50 hover:text-green-600" 
                            onClick={() => updateStatusMutation.mutate({ id: conf.id, status: 'en_cours' })}
                            title="Démarrer"
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                        )}
                        {conf.status === 'en_cours' && (
                          <>
                            <Button 
                              size="sm"
                              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:opacity-90 h-9"
                              onClick={() => openConference(conf)}
                              title="Ouvrir"
                            >
                              <Radio className="w-4 h-4 mr-1" />
                              Ouvrir
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-9 w-9 hover:bg-red-50 hover:text-red-600" 
                              onClick={() => updateStatusMutation.mutate({ id: conf.id, status: 'terminée' })}
                              title="Terminer"
                            >
                              <Square className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 hover:bg-red-50 hover:text-red-600" 
                          onClick={() => deleteMutation.mutate(conf.id)}
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="max-w-lg rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Nouvelle conférence
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-5 pt-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Titre de la conférence</label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex: Séminaire de formation" className="rounded-xl h-12" />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Description</label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Décrivez le sujet de la conférence..." className="rounded-xl min-h-[100px]" />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Code d'accès</label>
                <div className="flex gap-2">
                  <Input value={form.access_code} onChange={(e) => setForm({ ...form, access_code: e.target.value })} placeholder="Ex: CONF2026" className="rounded-xl h-12 font-mono font-bold" />
                  <Button onClick={generateCode} variant="outline" className="rounded-xl px-4 h-12">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Générer
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1.5">Les étudiants utiliseront ce code pour rejoindre</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Date et heure</label>
                <Input type="datetime-local" value={form.scheduled_date} onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })} className="rounded-xl h-12" />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Statut initial</label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger className="rounded-xl h-12"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planifiée">🔵 Planifiée</SelectItem>
                    <SelectItem value="en_cours">🟢 En cours (démarrer maintenant)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Limite de participants (optionnel)
                </label>
                <Input 
                  type="number" 
                  value={form.max_participants} 
                  onChange={(e) => setForm({ ...form, max_participants: e.target.value })} 
                  placeholder="Ex: 100" 
                  className="rounded-xl h-12" 
                  min="1"
                />
                <p className="text-xs text-gray-500 mt-1.5">Laissez vide pour aucune limite</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Fichier audio (optionnel)</label>
                <Input type="file" accept="audio/*" onChange={(e) => setAudioFile(e.target.files[0])} className="rounded-xl h-12" />
                <p className="text-xs text-gray-500 mt-1.5">Vous pouvez ajouter un enregistrement audio</p>
              </div>

              <Button
                onClick={() => createMutation.mutate(form)}
                disabled={!form.title || !form.access_code || createMutation.isPending || uploading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 rounded-xl h-12 text-base font-bold shadow-lg"
              >
                {(createMutation.isPending || uploading) ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 mr-2" />
                    Créer la conférence
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminGuard>
  );
}