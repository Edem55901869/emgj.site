import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Download, Loader2, FileText, Edit, Search, RefreshCw, ChevronLeft, ChevronRight, Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import AdminTopNav from '../components/admin/AdminTopNav';
import AdminGuard from '../components/admin/AdminGuard';
import { generateSVGCover, TOTAL_STYLES } from '../components/library/LibraryCoverGenerator';

export default function AdminLibrary() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [form, setForm] = useState({ title: '', author: 'Voir document', description: '' });
  const [pdfFile, setPdfFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const queryClient = useQueryClient();

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ['adminDocs'],
    queryFn: () => base44.entities.LibraryDocument.list('-created_date', 100),
  });

  // Génère instantanément la couverture SVG locale (0 latence)
  const handleRegenerateCover = () => {
    if (!form.title.trim()) { toast.error('Saisissez d\'abord le titre'); return; }
    const url = generateSVGCover(form.title);
    setCoverPreview(url);
    toast.success('Couverture régénérée !');
  };

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      let pdf_url = data.pdf_url || '';
      let cover_image = data.cover_image || '';

      // Si pas de couverture existante et pas de fichier → générer SVG local
      if (!coverFile && !cover_image && form.title) {
        cover_image = coverPreview || generateSVGCover(form.title);
      }

      setUploading(true);
      if (pdfFile) {
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
        if (!pdf_url) { toast.error('PDF requis'); return; }
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
    setForm({ title: '', author: 'Voir document', description: '' });
    setPdfFile(null);
    setCoverFile(null);
    setCoverPreview(null);
  };

  const handleEdit = (doc) => {
    setEditingDoc(doc);
    setForm({ title: doc.title, author: doc.author || 'Voir document', description: doc.description || '', pdf_url: doc.pdf_url, cover_image: doc.cover_image });
    setCoverPreview(doc.cover_image || null);
    setDialogOpen(true);
  };

  const handleOpen = () => {
    resetForm();
    setDialogOpen(true);
  };

  // Mise à jour de la prévisualisation quand le titre change
  const handleTitleChange = (title) => {
    setForm(f => ({ ...f, title }));
    if (title.trim() && !coverFile) {
      setCoverPreview(generateSVGCover(title));
    }
  };

  const filtered = docs
    .filter(d => !search || d.title?.toLowerCase().includes(search.toLowerCase()) || d.author?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'recent') return new Date(b.created_date) - new Date(a.created_date);
      if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
      if (sortBy === 'downloads') return (b.downloads_count || 0) - (a.downloads_count || 0);
      return 0;
    });

  const displayCover = coverPreview;
  const isBusy = saveMutation.isPending || uploading;

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
              <Button onClick={handleOpen} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg shadow-blue-500/20">
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
                  <div className="h-52 relative overflow-hidden bg-gray-900">
                    {doc.cover_image ? (
                      <img src={doc.cover_image} alt={doc.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <img src={generateSVGCover(doc.title || '')} alt={doc.title} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button onClick={() => handleEdit(doc)} variant="ghost" size="icon" className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm rounded-lg">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button onClick={() => deleteMutation.mutate(doc.id)} variant="ghost" size="icon" className="h-8 w-8 bg-black/50 hover:bg-red-600/80 text-white backdrop-blur-sm rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-1 line-clamp-2 text-sm">{doc.title}</h3>
                    <p className="text-xs text-gray-500 mb-3">{doc.author}</p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Download className="w-3 h-3" /> {doc.downloads_count || 0}</span>
                      {doc.pdf_url && (
                        <a href={doc.pdf_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-medium">Ouvrir →</a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Dialog open={dialogOpen} onOpenChange={resetForm}>
          <DialogContent className="max-w-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingDoc ? 'Modifier le document' : 'Nouveau document'}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Formulaire */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Titre *</label>
                  <Input
                    value={form.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Titre du document"
                    className="rounded-xl h-11"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Auteur</label>
                  <Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} placeholder="Voir document" className="rounded-xl h-11" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Thème, contexte..." className="rounded-xl resize-none" rows={3} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Document PDF {!editingDoc && '*'}</label>
                  <Input type="file" accept=".pdf" onChange={(e) => setPdfFile(e.target.files[0])} className="rounded-xl" />
                </div>
              </div>

              {/* Couverture */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 block">Couverture (auto-générée)</label>
                <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-900" style={{ aspectRatio: '5/7' }}>
                  {displayCover ? (
                    <img src={displayCover} alt="Couverture" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-500">
                      <FileText className="w-10 h-10 opacity-40" />
                      <p className="text-xs text-center px-4 opacity-60">Tapez le titre pour prévisualiser</p>
                    </div>
                  )}
                </div>
                <Button type="button" onClick={handleRegenerateCover} disabled={!form.title.trim()} variant="outline" className="w-full rounded-xl h-9 text-sm">
                  <RefreshCw className="w-3.5 h-3.5 mr-2" /> Changer de style
                </Button>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Ou importer votre propre image</label>
                  <Input type="file" accept="image/*" onChange={(e) => {
                    const f = e.target.files[0];
                    setCoverFile(f);
                    if (f) setCoverPreview(URL.createObjectURL(f));
                  }} className="rounded-xl text-xs" />
                </div>
              </div>
            </div>

            <Button
              onClick={() => saveMutation.mutate(form)}
              disabled={!form.title.trim() || (!editingDoc && !pdfFile) || isBusy}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl h-11 mt-2 font-semibold"
            >
              {isBusy ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Publication…</> : (editingDoc ? 'Mettre à jour' : 'Publier le document')}
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </AdminGuard>
  );
}