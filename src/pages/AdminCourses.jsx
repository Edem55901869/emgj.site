import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Plus, Trash2, Edit, Loader2, Headphones, Link as LinkIcon, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import AdminTopNav from '../components/admin/AdminTopNav';
import AdminGuard from '../components/admin/AdminGuard';

const DOMAINS = ['THÉOLOGIE', 'LEADERSHIP ET ADMINISTRATION CHRÉTIENNE', 'MISSIOLOGIE', 'ÉCOLE PROPHETIQUES', 'ENTREPRENEURIAT', 'AUMÔNERIE', 'MINISTÈRE APOSTOLIQUE'];
const FORMATIONS = ['Brevet', 'Baccalauréat', 'Licence', 'Master', 'Doctorat'];

export default function AdminCourses() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', domain: '', formation_type: '', teacher_name: '', audio_url: '', audio_file: '' });
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [audioSource, setAudioSource] = useState('url');
  const [qcmQuestions, setQcmQuestions] = useState([{ question: '', correct_answer: '' }]);
  const queryClient = useQueryClient();

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['adminCourses'],
    queryFn: () => base44.entities.Course.list('-created_date', 100),
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      let audio_file = data.audio_file || '';
      let cover_image = data.cover_image || '';

      if (audioFile && audioSource === 'file') {
        setUploading(true);
        const { file_url } = await base44.integrations.Core.UploadFile({ file: audioFile });
        audio_file = file_url;
      }

      if (coverFile) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: coverFile });
        cover_image = file_url;
      }

      setUploading(false);

      const courseData = {
        ...data,
        audio_file: audioSource === 'file' ? audio_file : '',
        audio_url: audioSource === 'url' ? data.audio_url : '',
        cover_image
      };

      let course;
      if (editingCourse) {
        course = await base44.entities.Course.update(editingCourse.id, courseData);
      } else {
        course = await base44.entities.Course.create(courseData);
      }

      // Sauvegarder les questions QCM
      if (qcmQuestions.some(q => q.question && q.correct_answer)) {
        const validQuestions = qcmQuestions.filter(q => q.question && q.correct_answer);
        const existingEval = await base44.entities.CourseEvaluation.filter({ course_id: course.id });
        
        if (existingEval.length > 0) {
          await base44.entities.CourseEvaluation.update(existingEval[0].id, {
            questions: validQuestions
          });
        } else {
          await base44.entities.CourseEvaluation.create({
            course_id: course.id,
            questions: validQuestions
          });
        }
      }

      return course;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCourses'] });
      setDialogOpen(false);
      resetForm();
      toast.success(editingCourse ? 'Cours modifié' : 'Cours publié');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Course.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCourses'] });
      toast.success('Cours supprimé');
    },
  });

  const resetForm = () => {
    setForm({ title: '', description: '', domain: '', formation_type: '', teacher_name: '', audio_url: '', audio_file: '', order: '', prerequisite_course_id: '' });
    setEditingCourse(null);
    setAudioFile(null);
    setCoverFile(null);
    setAudioSource('url');
    setQcmQuestions([{ question: '', correct_answer: '' }]);
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setForm(course);
    setAudioSource(course.audio_file ? 'file' : 'url');
    setDialogOpen(true);
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <AdminTopNav />
        <div className="pt-20 px-4 pb-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Cours Audio</h1>
              <p className="text-gray-500 text-sm mt-1">Gérez les cours en format audio</p>
            </div>
            <Button onClick={() => { resetForm(); setDialogOpen(true); }} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg shadow-blue-500/20">
              <Plus className="w-4 h-4 mr-2" /> Nouveau cours
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map(course => (
                <div key={course.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                  {course.cover_image && (
                    <div className="h-40 bg-gradient-to-br from-blue-500 to-purple-500 relative overflow-hidden">
                      <img src={course.cover_image} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-1">{course.title}</h3>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Headphones className="w-3 h-3" />
                          {course.teacher_name}
                        </p>
                      </div>
                    </div>
                    {course.description && <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge className="bg-blue-50 text-blue-700 border-blue-100 text-xs">{course.domain}</Badge>
                      <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 text-xs">{course.formation_type}</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => handleEdit(course)} variant="outline" size="sm" className="flex-1 rounded-xl">
                        <Edit className="w-3 h-3 mr-1" /> Modifier
                      </Button>
                      <Button onClick={() => deleteMutation.mutate(course.id)} variant="outline" size="sm" className="rounded-xl text-red-600 border-red-200 hover:bg-red-50">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCourse ? 'Modifier le cours' : 'Nouveau cours audio'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Titre *</label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Titre du cours" className="rounded-xl h-11" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description..." className="rounded-xl" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Domaine *</label>
                <Select value={form.domain} onValueChange={(v) => setForm({ ...form, domain: v })}>
                  <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="Domaine" /></SelectTrigger>
                  <SelectContent>
                    {DOMAINS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Formation *</label>
                <Select value={form.formation_type} onValueChange={(v) => setForm({ ...form, formation_type: v })}>
                  <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="Type de formation" /></SelectTrigger>
                  <SelectContent>
                    {FORMATIONS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Enseignant *</label>
                <Input value={form.teacher_name} onChange={(e) => setForm({ ...form, teacher_name: e.target.value })} placeholder="Nom de l'enseignant" className="rounded-xl h-11" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Source audio *</label>
                <div className="flex gap-2 mb-3">
                  <Button type="button" onClick={() => setAudioSource('url')} variant={audioSource === 'url' ? 'default' : 'outline'} size="sm" className="flex-1 rounded-xl">
                    <LinkIcon className="w-4 h-4 mr-1" /> Lien externe
                  </Button>
                  <Button type="button" onClick={() => setAudioSource('file')} variant={audioSource === 'file' ? 'default' : 'outline'} size="sm" className="flex-1 rounded-xl">
                    <Upload className="w-4 h-4 mr-1" /> Fichier
                  </Button>
                </div>
                {audioSource === 'url' ? (
                  <Input value={form.audio_url} onChange={(e) => setForm({ ...form, audio_url: e.target.value })} placeholder="https://drive.google.com/..." className="rounded-xl h-11" />
                ) : (
                  <Input type="file" accept="audio/*" onChange={(e) => setAudioFile(e.target.files[0])} className="rounded-xl" />
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Image de couverture</label>
                <Input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files[0])} className="rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Ordre</label>
                  <Input type="number" value={form.order || ''} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || null })} placeholder="1, 2, 3..." className="rounded-xl h-11" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Cours prérequis</label>
                  <Select value={form.prerequisite_course_id || ''} onValueChange={(v) => setForm({ ...form, prerequisite_course_id: v })}>
                    <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="Aucun" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>Aucun</SelectItem>
                      {courses.filter(c => c.id !== editingCourse?.id).map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Questions QCM</label>
                <div className="space-y-3 max-h-60 overflow-y-auto border border-gray-200 rounded-xl p-3">
                  {qcmQuestions.map((q, i) => (
                    <div key={i} className="space-y-2 p-3 bg-gray-50 rounded-lg">
                      <Input 
                        value={q.question} 
                        onChange={(e) => {
                          const newQ = [...qcmQuestions];
                          newQ[i].question = e.target.value;
                          setQcmQuestions(newQ);
                        }}
                        placeholder={`Question ${i + 1}`}
                        className="rounded-xl h-10"
                      />
                      <Input 
                        value={q.correct_answer} 
                        onChange={(e) => {
                          const newQ = [...qcmQuestions];
                          newQ[i].correct_answer = e.target.value;
                          setQcmQuestions(newQ);
                        }}
                        placeholder="Réponse correcte"
                        className="rounded-xl h-10"
                      />
                    </div>
                  ))}
                  <Button type="button" onClick={() => setQcmQuestions([...qcmQuestions, { question: '', correct_answer: '' }])} variant="outline" size="sm" className="w-full rounded-xl">
                    + Ajouter une question
                  </Button>
                </div>
              </div>
              <Button
                onClick={() => saveMutation.mutate(form)}
                disabled={!form.title || !form.domain || !form.formation_type || !form.teacher_name || saveMutation.isPending || uploading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl h-11"
              >
                {(saveMutation.isPending || uploading) ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingCourse ? 'Mettre à jour' : 'Publier le cours')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminGuard>
  );
}