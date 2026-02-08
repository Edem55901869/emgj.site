import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Search, Check, X, Ban, Trash2, Eye, Send, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import AdminTopNav from '../components/admin/AdminTopNav';
import AdminGuard from '../components/admin/AdminGuard';

export default function AdminStudents() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [domainFilter, setDomainFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [notifDialog, setNotifDialog] = useState(null);
  const [notifMessage, setNotifMessage] = useState({ title: '', message: '' });
  const queryClient = useQueryClient();

  const { data: students = [], isLoading } = useQuery({
    queryKey: ['adminStudents'],
    queryFn: () => base44.entities.Student.list('-created_date', 500),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Student.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminStudents'] });
      toast.success('Étudiant mis à jour');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Student.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminStudents'] });
      setSelectedStudent(null);
      toast.success('Étudiant supprimé');
    },
  });

  const sendNotification = async () => {
    await base44.entities.Notification.create({
      recipient_email: notifDialog.user_email,
      title: notifMessage.title,
      message: notifMessage.message,
      type: 'info'
    });
    toast.success('Notification envoyée');
    setNotifDialog(null);
    setNotifMessage({ title: '', message: '' });
  };

  const filtered = students
    .filter(s => !search || `${s.first_name} ${s.last_name} ${s.user_email}`.toLowerCase().includes(search.toLowerCase()))
    .filter(s => statusFilter === 'all' || s.status === statusFilter)
    .filter(s => domainFilter === 'all' || s.domain === domainFilter);

  const statusColors = {
    en_attente: 'bg-amber-50 text-amber-700 border-amber-200',
    certifié: 'bg-green-50 text-green-700 border-green-200',
    rejeté: 'bg-red-50 text-red-700 border-red-200',
    bloqué: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        <AdminTopNav />
        <div className="pt-20 px-4 pb-8 max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Gestion des étudiants</h1>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher..." className="pl-10 h-10 rounded-xl" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 h-10 rounded-xl"><SelectValue placeholder="Statut" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="en_attente">En attente</SelectItem>
                <SelectItem value="certifié">Certifié</SelectItem>
                <SelectItem value="rejeté">Rejeté</SelectItem>
                <SelectItem value="bloqué">Bloqué</SelectItem>
              </SelectContent>
            </Select>
            <Select value={domainFilter} onValueChange={setDomainFilter}>
              <SelectTrigger className="w-48 h-10 rounded-xl"><SelectValue placeholder="Domaine" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les domaines</SelectItem>
                {['THÉOLOGIE', 'LEADERSHIP', 'MISSIOLOGIE', 'PROPHÉTIQUE', 'ENTREPRENEURIAT', 'AUMÔNERIE', 'MINISTÈRE APOSTOLIQUE'].map(d => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-gray-500 mb-4">{filtered.length} étudiant(s)</div>

          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
          ) : (
            <div className="space-y-2">
              {filtered.map(student => (
                <div key={student.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4 hover:shadow-sm transition-shadow">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-bold flex-shrink-0">
                    {student.first_name?.[0]}{student.last_name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">{student.first_name} {student.last_name}</p>
                    <p className="text-xs text-gray-500">{student.domain} • {student.formation_type} • {student.country}</p>
                  </div>
                  <Badge className={`text-xs ${statusColors[student.status]}`}>{student.status}</Badge>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setSelectedStudent(student)}>
                      <Eye className="w-4 h-4 text-gray-500" />
                    </Button>
                    {student.status === 'en_attente' && (
                      <>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => updateMutation.mutate({ id: student.id, data: { status: 'certifié' } })}>
                          <Check className="w-4 h-4 text-green-600" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => updateMutation.mutate({ id: student.id, data: { status: 'rejeté' } })}>
                          <X className="w-4 h-4 text-red-500" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Student Detail Dialog */}
        <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle>Détails de l'étudiant</DialogTitle>
            </DialogHeader>
            {selectedStudent && (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-gray-500">Nom</p><p className="font-medium">{selectedStudent.first_name} {selectedStudent.last_name}</p></div>
                  <div><p className="text-gray-500">Email</p><p className="font-medium text-xs">{selectedStudent.user_email}</p></div>
                  <div><p className="text-gray-500">Pays / Ville</p><p className="font-medium">{selectedStudent.country}, {selectedStudent.city}</p></div>
                  <div><p className="text-gray-500">WhatsApp</p><p className="font-medium">{selectedStudent.whatsapp}</p></div>
                  <div><p className="text-gray-500">Domaine</p><p className="font-medium">{selectedStudent.domain}</p></div>
                  <div><p className="text-gray-500">Formation</p><p className="font-medium">{selectedStudent.formation_type}</p></div>
                  <div><p className="text-gray-500">Statut</p><Badge className={`${statusColors[selectedStudent.status]}`}>{selectedStudent.status}</Badge></div>
                  <div><p className="text-gray-500">Inscrit le</p><p className="font-medium">{selectedStudent.created_date && format(new Date(selectedStudent.created_date), 'd MMM yyyy', { locale: fr })}</p></div>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button onClick={() => updateMutation.mutate({ id: selectedStudent.id, data: { status: 'certifié' } })} size="sm" className="bg-green-600 hover:bg-green-700 rounded-xl"><Check className="w-3 h-3 mr-1" />Certifier</Button>
                  <Button onClick={() => updateMutation.mutate({ id: selectedStudent.id, data: { status: 'rejeté' } })} size="sm" variant="outline" className="text-red-600 border-red-200 rounded-xl"><X className="w-3 h-3 mr-1" />Rejeter</Button>
                  <Button onClick={() => updateMutation.mutate({ id: selectedStudent.id, data: { status: 'bloqué' } })} size="sm" variant="outline" className="rounded-xl"><Ban className="w-3 h-3 mr-1" />Bloquer</Button>
                  <Button onClick={() => deleteMutation.mutate(selectedStudent.id)} size="sm" variant="outline" className="text-red-600 border-red-200 rounded-xl"><Trash2 className="w-3 h-3 mr-1" />Supprimer</Button>
                  <Button onClick={() => { setNotifDialog(selectedStudent); setSelectedStudent(null); }} size="sm" variant="outline" className="rounded-xl"><Send className="w-3 h-3 mr-1" />Notifier</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Notification Dialog */}
        <Dialog open={!!notifDialog} onOpenChange={() => setNotifDialog(null)}>
          <DialogContent className="max-w-sm rounded-2xl">
            <DialogHeader><DialogTitle>Envoyer une notification</DialogTitle></DialogHeader>
            <div className="space-y-3 pt-2">
              <Input value={notifMessage.title} onChange={(e) => setNotifMessage({ ...notifMessage, title: e.target.value })} placeholder="Titre" className="rounded-xl h-11" />
              <Textarea value={notifMessage.message} onChange={(e) => setNotifMessage({ ...notifMessage, message: e.target.value })} placeholder="Message..." className="rounded-xl" />
              <Button onClick={sendNotification} className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl">Envoyer</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminGuard>
  );
}