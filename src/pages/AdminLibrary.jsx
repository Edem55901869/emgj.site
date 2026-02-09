import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Library, Plus, Trash2, Download, Loader2, FileText, Edit, Search } from 'lucide-react';
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

export default function AdminLibrary() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [form, setForm] = useState({ title: '', author: '', domain: '', description: '' });
  const [pdfFile, setPdfFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const queryClient = useQueryClient();

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ['adminDocs'],
    queryFn: () => base44.entities.LibraryDocument.list('-created_date', 100),
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      let pdf_url = data.pdf_url || '';
      let cover_image = data.cover_image || '';

      if (pdfFile) {
        if (!editingDoc && !pdfFile) { 
          toast.error('Veuillez sélectionner un PDF');
          return;
        }
        setUploading(true);
        const { file_url } = await base44.integrations.Core.UploadFile({ file: pdfFile });
        pdf_url = file_url;
      }

      if (coverFile) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: coverFile });
        cover_image = file_url;
      }

      setUploading(false);

      if (editingDoc) {
        return base44.entities.LibraryDocument.update(editingDoc.id, { ...data, pdf_url, cover_image });
      } else {
        if (!pdf_url) {
          toast.error('PDF requis');
          return;
        }
        return base44.entities.LibraryDocument.create({ ...data, pdf_url, cover_image });
      }
    },
    onSuccess: (result) => {
      if (!result) return;
      queryClient.invalidateQueries({ queryKey: ['adminDocs'] });
      resetForm();
      toast.success(editingDoc ? 'Document modifié' : 'Document publié');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.LibraryDocument.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminDocs'] });
      toast.success('Document supprimé');
    },
  });

  const resetForm = () => {
    setDialogOpen(false);
    setEditingDoc(null);
    setForm({ title: '', author: '', domain: '', description: '' });
    setPdfFile(null);
    setCoverFile(null);
  };

  const handleEdit = (doc) => {
    setEditingDoc(doc);
    setForm(doc);
    setDialogOpen(true);
  };

  const filtered = docs
    .filter(d => !search || d.title?.toLowerCase().includes(search.toLowerCase()) || d.author?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'recent') return new Date(b.created_date) - new Date(a.created_date);
      if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
      if (sortBy === 'downloads') return (b.downloads_count || 0) - (a.downloads_count || 0);
      return 0;
    });

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <AdminTopNav />
        <div className="pt-20 px-4 pb-8 max-w-7xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Bibliothèque</h1>
                <p className="text-gray-500 text-sm mt-1">Documents accessibles à tous les étudiants</p>
              </div>
              <Button onClick={() => { resetForm(); setDialogOpen(true); }} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg shadow-blue-500/20">
                <Plus className="w-4 h-4 mr-2" /> Ajouter
              </Button>
            </div>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un document..." className="pl-10 h-11 rounded-xl" />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48 h-11 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Plus récents</SelectItem>
                  <SelectItem value="title">Titre (A-Z)</SelectItem>
                  <SelectItem value="downloads">Plus téléchargés</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filtered.map(doc => (
                <div key={doc.id} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                  <div className="h-48 bg-gradient-to-br from-red-500 via-pink-500 to-purple-500 relative overflow-hidden">
                    {doc.cover_image ? (
                      <img src={doc.cover_image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="w-20 h-20 text-white/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-3 right-3 flex gap-1">
                      <Button onClick={() => handleEdit(doc)} variant="ghost" size="icon" className="h-8 w-8 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm rounded-lg">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button onClick={() => deleteMutation.mutate(doc.id)} variant="ghost" size="icon" className="h-8 w-8 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">{doc.title}</h3>
                    <p className="text-xs text-gray-500 mb-2">{doc.author}</p>
                    {doc.domain && <Badge className="bg-blue-50 text-blue-700 border-blue-100 text-xs mb-2">{doc.domain}</Badge>}
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Download className="w-3 h-3" /> {doc.downloads_count || 0}</span>
                      {doc.pdf_url && (
                        <a href={doc.pdf_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Ouvrir</a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Dialog open={dialogOpen} onOpenChange={resetForm}>
          <DialogContent className="max-w-lg rounded-2xl">
            <DialogHeader><DialogTitle>{editingDoc ? 'Modifier le document' : 'Nouveau document'}</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Titre *</label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Titre du document" className="rounded-xl h-11" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Auteur *</label>
                <Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} placeholder="Nom de l'auteur" className="rounded-xl h-11" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Domaine</label>
                <Select value={form.domain} onValueChange={(v) => setForm({ ...form, domain: v })}>
                  <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="Choisir un domaine" /></SelectTrigger>
                  <SelectContent>
                    {DOMAINS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description..." className="rounded-xl" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Document PDF {!editingDoc && '*'}</label>
                <Input type="file" accept=".pdf" onChange={(e) => setPdfFile(e.target.files[0])} className="rounded-xl" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Image de couverture</label>
                <Input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files[0])} className="rounded-xl" />
              </div>
              <Button
                onClick={() => saveMutation.mutate(form)}
                disabled={!form.title || !form.author || (!editingDoc && !pdfFile) || saveMutation.isPending || uploading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl h-11"
              >
                {(saveMutation.isPending || uploading) ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingDoc ? 'Mettre à jour' : 'Publier')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminGuard>
  );
}