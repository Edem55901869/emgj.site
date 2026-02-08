import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Library, Plus, Trash2, Download, Loader2 } from 'lucide-react';
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

export default function AdminLibrary() {
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ title: '', author: '', domain: '', description: '' });
  const [pdfFile, setPdfFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ['adminDocs'],
    queryFn: () => base44.entities.LibraryDocument.list('-created_date', 100),
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      if (!pdfFile) { toast.error('Veuillez sélectionner un PDF'); return; }
      setUploading(true);
      const { file_url } = await base44.integrations.Core.UploadFile({ file: pdfFile });
      setUploading(false);
      return base44.entities.LibraryDocument.create({ ...data, pdf_url: file_url });
    },
    onSuccess: (result) => {
      if (!result) return;
      queryClient.invalidateQueries({ queryKey: ['adminDocs'] });
      setCreateOpen(false);
      setForm({ title: '', author: '', domain: '', description: '' });
      setPdfFile(null);
      toast.success('Document publié');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.LibraryDocument.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminDocs'] });
      toast.success('Document supprimé');
    },
  });

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        <AdminTopNav />
        <div className="pt-20 px-4 pb-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Bibliothèque</h1>
            <Button onClick={() => setCreateOpen(true)} className="bg-blue-600 hover:bg-blue-700 rounded-xl">
              <Plus className="w-4 h-4 mr-2" /> Nouveau document
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {docs.map(doc => (
                <div key={doc.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                      <Library className="w-5 h-5 text-red-500" />
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteMutation.mutate(doc.id)}>
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">{doc.title}</h3>
                  <p className="text-xs text-gray-500 mb-2">{doc.author}</p>
                  {doc.domain && <Badge className="bg-blue-50 text-blue-700 border-blue-100 text-xs mb-2">{doc.domain}</Badge>}
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Download className="w-3 h-3" /> {doc.downloads_count || 0} téléchargements
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader><DialogTitle>Publier un document</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Titre du document" className="rounded-xl h-11" />
              <Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} placeholder="Nom de l'auteur" className="rounded-xl h-11" />
              <Select value={form.domain} onValueChange={(v) => setForm({ ...form, domain: v })}>
                <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="Domaine" /></SelectTrigger>
                <SelectContent>
                  {DOMAINS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description..." className="rounded-xl" />
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Document PDF *</label>
                <Input type="file" accept=".pdf" onChange={(e) => setPdfFile(e.target.files[0])} className="rounded-xl" />
              </div>
              <Button
                onClick={() => createMutation.mutate(form)}
                disabled={!form.title || !form.author || !pdfFile || createMutation.isPending || uploading}
                className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl h-11"
              >
                {(createMutation.isPending || uploading) ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Publier'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminGuard>
  );
}