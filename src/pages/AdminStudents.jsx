import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Search, Check, X, Ban, Trash2, Eye, Send, Loader2, Award, BookOpen, Clock, Activity } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
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

  const { data: allProgress = [] } = useQuery({
    queryKey: ['allStudentProgress'],
    queryFn: () => base44.entities.StudentCourseProgress.list(),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['allCourses'],
    queryFn: () => base44.entities.Course.list(),
  });

  const { data: allActivities = [] } = useQuery({
    queryKey: ['allActivities'],
    queryFn: () => base44.entities.RecentActivity.list('-created_date', 500),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const result = await base44.entities.Student.update(id, data);
      if (data.status === 'certifié') {
        const student = students.find(s => s.id === id);
        await base44.entities.Notification.create({
          recipient_email: student.user_email,
          type: 'success',
          title: '🎉 Compte certifié !',
          message: `Félicitations ${student.first_name} ! Votre compte a été certifié.`,
        });
      }
      return result;
    },
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

  const getStudentStats = (student) => {
    const studentCourses = courses.filter(c => c.domain === student.domain && c.formation_type === student.formation_type);
    const studentProgress = allProgress.filter(p => p.student_email === student.user_email);
    const validatedCourses = studentProgress.filter(p => p.passed).length;
    const averageScore = studentProgress.length > 0 ? (studentProgress.reduce((acc, p) => acc + p.score, 0) / studentProgress.length).toFixed(2) : 0;
    const progressPercent = studentCourses.length > 0 ? (validatedCourses / studentCourses.length) * 100 : 0;
    
    return { 
      totalCourses: studentCourses.length,
      validatedCourses, 
      averageScore, 
      progressPercent: Math.round(progressPercent),
      recentProgress: studentProgress.slice(0, 5)
    };
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
            <div className="grid gap-3">
              {filtered.map(student => (
                <div key={student.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 hover:shadow-lg transition-all group">
                  {student.profile_photo ? (
                    <img src={student.profile_photo} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0 ring-2 ring-blue-100" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg font-bold flex-shrink-0 shadow-lg">
                      {student.first_name?.[0]}{student.last_name?.[0]}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900">{student.first_name} {student.last_name}</p>
                    <p className="text-sm text-gray-600 mt-0.5">{student.user_email}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge className="bg-blue-50 text-blue-700 border-blue-100 text-xs">{student.domain}</Badge>
                      <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 text-xs">{student.formation_type}</Badge>
                      <Badge className="bg-gray-50 text-gray-600 border-gray-100 text-xs">{student.country}</Badge>
                    </div>
                  </div>
                  <Badge className={`text-xs ${statusColors[student.status]}`}>{student.status}</Badge>
                  <div className="flex gap-1.5">
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-blue-50 hover:text-blue-600" onClick={() => setSelectedStudent(student)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    {student.status === 'en_attente' && (
                      <>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-green-50 hover:text-green-600" onClick={() => updateMutation.mutate({ id: student.id, data: { status: 'certifié' } })}>
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-red-50 hover:text-red-600" onClick={() => updateMutation.mutate({ id: student.id, data: { status: 'rejeté' } })}>
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
          <DialogContent className="max-w-3xl rounded-3xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle className="text-2xl">Profil de l'étudiant</DialogTitle>
            </DialogHeader>
            {selectedStudent && (() => {
              const stats = getStudentStats(selectedStudent);
              const recentActivities = allActivities.filter(a => a.related_user?.includes(selectedStudent.user_email)).slice(0, 5);
              
              return (
                <div className="space-y-5 pt-2">
                  <div className="flex justify-center">
                    {selectedStudent.profile_photo ? (
                      <img src={selectedStudent.profile_photo} alt="" className="w-28 h-28 rounded-3xl object-cover ring-4 ring-blue-100 shadow-xl" />
                    ) : (
                      <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-xl ring-4 ring-blue-100">
                        {selectedStudent.first_name?.[0]}{selectedStudent.last_name?.[0]}
                      </div>
                    )}
                  </div>

                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">{selectedStudent.first_name} {selectedStudent.last_name}</h2>
                    <p className="text-gray-600 mt-1">{selectedStudent.user_email}</p>
                  </div>
                  
                  <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Award className="w-5 h-5 text-blue-600" />
                      Statistiques académiques
                    </h3>
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{stats.validatedCourses}/{stats.totalCourses}</p>
                        <p className="text-xs text-gray-600">Cours validés</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{stats.averageScore}/20</p>
                        <p className="text-xs text-gray-600">Moyenne</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">{stats.progressPercent}%</p>
                        <p className="text-xs text-gray-600">Progression</p>
                      </div>
                    </div>
                    <Progress value={stats.progressPercent} className="h-2" />
                  </Card>

                  <Card className="p-4">
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-gray-600" />
                      Dernières activités
                    </h3>
                    {recentActivities.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">Aucune activité récente</p>
                    ) : (
                      <div className="space-y-2">
                        {recentActivities.map((activity, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm p-2 bg-gray-50 rounded-lg">
                            <Clock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-gray-700">{activity.description}</p>
                              <p className="text-xs text-gray-400">{activity.created_date && format(new Date(activity.created_date), "d MMM 'à' HH:mm", { locale: fr })}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="col-span-2">
                      <p className="text-gray-500 mb-1">Email</p>
                      <Input defaultValue={selectedStudent.user_email} disabled className="rounded-xl h-10 text-xs" />
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Domaine</p>
                      <Select defaultValue={selectedStudent.domain} onValueChange={(v) => updateMutation.mutate({ id: selectedStudent.id, data: { domain: v } })}>
                        <SelectTrigger className="rounded-xl h-10"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {['THÉOLOGIE', 'LEADERSHIP', 'MISSIOLOGIE', 'PROPHÉTIQUE', 'ENTREPRENEURIAT', 'AUMÔNERIE', 'MINISTÈRE APOSTOLIQUE'].map(d => (
                            <SelectItem key={d} value={d}>{d}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Formation</p>
                      <Select defaultValue={selectedStudent.formation_type} onValueChange={(v) => updateMutation.mutate({ id: selectedStudent.id, data: { formation_type: v } })}>
                        <SelectTrigger className="rounded-xl h-10"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {['Discipola', 'Brevet', 'Baccalauréat', 'Licence', 'Master', 'Doctorat'].map(f => (
                            <SelectItem key={f} value={f}>{f}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Pays</p>
                      <Input defaultValue={selectedStudent.country} disabled className="rounded-xl h-10" />
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Ville</p>
                      <Input defaultValue={selectedStudent.city} disabled className="rounded-xl h-10" />
                    </div>
                    <div><p className="text-gray-500">Statut</p><Badge className={`${statusColors[selectedStudent.status]} mt-1`}>{selectedStudent.status}</Badge></div>
                    <div><p className="text-gray-500">Inscrit le</p><p className="font-medium text-xs mt-1">{selectedStudent.created_date && format(new Date(selectedStudent.created_date), 'd MMM yyyy', { locale: fr })}</p></div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button onClick={() => { updateMutation.mutate({ id: selectedStudent.id, data: { status: 'certifié' } }); setSelectedStudent(null); }} size="sm" className="bg-green-600 hover:bg-green-700 rounded-xl"><Check className="w-3 h-3 mr-1" />Certifier</Button>
                    <Button onClick={() => updateMutation.mutate({ id: selectedStudent.id, data: { status: 'rejeté' } })} size="sm" variant="outline" className="text-red-600 border-red-200 rounded-xl"><X className="w-3 h-3 mr-1" />Rejeter</Button>
                    <Button onClick={() => updateMutation.mutate({ id: selectedStudent.id, data: { status: 'bloqué' } })} size="sm" variant="outline" className="rounded-xl"><Ban className="w-3 h-3 mr-1" />Bloquer</Button>
                    <Button onClick={() => deleteMutation.mutate(selectedStudent.id)} size="sm" variant="outline" className="text-red-600 border-red-200 rounded-xl"><Trash2 className="w-3 h-3 mr-1" />Supprimer</Button>
                    <Button onClick={() => { setNotifDialog(selectedStudent); setSelectedStudent(null); }} size="sm" variant="outline" className="rounded-xl"><Send className="w-3 h-3 mr-1" />Notifier</Button>
                  </div>
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>

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