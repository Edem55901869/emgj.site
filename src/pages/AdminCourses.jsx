import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Plus, Trash2, Loader2 } from 'lucide-react';
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

export default function AdminCourses() {
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', domain: '', formation_type: '', teacher_name: '' });
  const [pdfFile, setPdfFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['adminCourses'],
    queryFn: () => base44.entities.Course.list('-created_date', 100),
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      let pdf_url = '';
      if (pdfFile) {
        setUploading(true);
        const { file_url } = await base44.integrations.Core.UploadFile({ file: pdfFile });
        pdf_url = file_url;
        setUploading(false);
      }
      return base44.entities.Course.create({ ...data, pdf_url });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCourses'] });
      setCreateOpen(false);
      setForm({ title: '', description: '', domain: '', formation_type: '', teacher_name: '' });
      setPdfFile(null);
      toast.success('Cours publié');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Course.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCourses'] });
      toast.success('Cours supprimé');
    },
  });

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        <AdminTopNav />
        <div className="pt-20 px-4 pb-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Cours</h1>
            <Button onClick={() => setCreateOpen(true)} className="bg-blue-600 hover:bg-blue-700 rounded-xl">
              <Plus className="w-4 h-4 mr-2" /> Nouveau cours
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map(course => (
                <div key={course.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm">{course.title}</h3>
                      <p className="text-xs text-gray-500">{course.teacher_name}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteMutation.mutate(course.id)}>
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Badge className="bg-blue-50 text-blue-700 border-blue-100 text-xs">{course.domain}</Badge>
                    <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 text-xs">{course.formation_type}</Badge>
                  </div>
                  {course.pdf_url && <a href={course.pdf_url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline mt-2 block">📄 Voir le PDF</a>}
                </div>
              ))}
            </div>
          )}
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader><DialogTitle>Publier un cours</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Titre du cours" className="rounded-xl h-11" />
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description..." className="rounded-xl" />
              <Select value={form.domain} onValueChange={(v) => setForm({ ...form, domain: v })}>
                <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="Domaine" /></SelectTrigger>
                <SelectContent>
                  {DOMAINS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={form.formation_type} onValueChange={(v) => setForm({ ...form, formation_type: v })}>
                <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="Type de formation" /></SelectTrigger>
                <SelectContent>
                  {FORMATIONS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input value={form.teacher_name} onChange={(e) => setForm({ ...form, teacher_name: e.target.value })} placeholder="Nom de l'enseignant" className="rounded-xl h-11" />
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Document PDF</label>
                <Input type="file" accept=".pdf" onChange={(e) => setPdfFile(e.target.files[0])} className="rounded-xl" />
              </div>
              <Button
                onClick={() => createMutation.mutate(form)}
                disabled={!form.title || !form.domain || !form.formation_type || !form.teacher_name || createMutation.isPending || uploading}
                className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl h-11"
              >
                {(createMutation.isPending || uploading) ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Publier le cours'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminGuard>
  );
}