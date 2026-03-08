import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Library, Plus, Trash2, Download, Loader2, FileText, Edit, Search, Sparkles, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import AdminTopNav from '../components/admin/AdminTopNav';
import AdminGuard from '../components/admin/AdminGuard';

// Palettes de couleurs professionnelles variées pour chaque document
const COLOR_PALETTES = [
  { bg: '#0f172a', accent: '#3b82f6', accent2: '#818cf8', text: '#f8fafc' },      // Bleu nuit
  { bg: '#1a0533', accent: '#a855f7', accent2: '#e879f9', text: '#faf5ff' },      // Violet royal
  { bg: '#052e16', accent: '#22c55e', accent2: '#86efac', text: '#f0fdf4' },      // Vert émeraude
  { bg: '#1c0606', accent: '#ef4444', accent2: '#fca5a5', text: '#fff1f2' },      // Rouge profond
  { bg: '#0c1a2e', accent: '#06b6d4', accent2: '#67e8f9', text: '#ecfeff' },      // Cyan océan
  { bg: '#1a1a00', accent: '#eab308', accent2: '#fde047', text: '#fefce8' },      // Or classique
  { bg: '#0d1b1e', accent: '#14b8a6', accent2: '#5eead4', text: '#f0fdfa' },      // Teal moderne
  { bg: '#1e0a2e', accent: '#d946ef', accent2: '#f0abfc', text: '#fdf4ff' },      // Fuchsia
  { bg: '#1a0f00', accent: '#f97316', accent2: '#fdba74', text: '#fff7ed' },      // Orange cuivre
  { bg: '#0a1628', accent: '#6366f1', accent2: '#a5b4fc', text: '#eef2ff' },      // Indigo cosmos
];

function getPaletteForTitle(title) {
  let hash = 0;
  for (let i = 0; i < title.length; i++) hash = title.charCodeAt(i) + ((hash << 5) - hash);
  return COLOR_PALETTES[Math.abs(hash) % COLOR_PALETTES.length];
}

async function generateCoverForDocument(title, description = '') {
  const palette = getPaletteForTitle(title);

  const prompt = `Professional book cover design for a document titled "${title}". 
Context: ${description || 'Academic and theological educational document'}. 
Style: High-end editorial design, luxury publishing aesthetic. 
Design elements: Elegant typography, symbolic abstract imagery or geometric patterns that evoke the document theme, premium textures. 
Color scheme: Dark rich background (#${palette.bg.slice(1)}), with accent colors in ${palette.accent}.
Composition: Clean, balanced layout with strong visual hierarchy. 
Text on cover: The title "${title}" prominently displayed, and the watermark/logo text "EMGJ" in the bottom right corner in small elegant font.
The design must look like a premium academic publication cover — no amateur elements. Ultra high quality, photorealistic rendering.`;

  const result = await base44.integrations.Core.GenerateImage({ prompt });
  return result.url;
}

export default function AdminLibrary() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [form, setForm] = useState({ title: '', author: 'Voir document', description: '' });
  const [pdfFile, setPdfFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [generatedCoverUrl, setGeneratedCoverUrl] = useState(null);
  const [generatingCover, setGeneratingCover] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const queryClient = useQueryClient();

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ['adminDocs'],
    queryFn: () => base44.entities.LibraryDocument.list('-created_date', 100),
  });

  const handleGenerateCover = async () => {
    if (!form.title.trim()) {
      toast.error('Saisissez d\'abord le titre du document');
      return;
    }
    setGeneratingCover(true);
    toast.info('Génération de la couverture en cours…');
    const url = await generateCoverForDocument(form.title, form.description);
    setGeneratedCoverUrl(url);
    setGeneratingCover(false);
    toast.success('Couverture générée !');
  };

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      let pdf_url = data.pdf_url || '';
      let cover_image = data.cover_image || generatedCoverUrl || '';

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

  // Lors de la publication d'un NOUVEAU document : générer automatiquement la couverture
  const handlePublish = async () => {
    if (!form.title.trim() || (!editingDoc && !pdfFile)) return;

    // Si aucune image sélectionnée et pas encore générée → générer automatiquement
    if (!coverFile && !generatedCoverUrl && !editingDoc?.cover_image) {
      setGeneratingCover(true);
      toast.info('🎨 Génération automatique de la couverture…');
      const url = await generateCoverForDocument(form.title, form.description);
      setGeneratedCoverUrl(url);
      setGeneratingCover(false);
      toast.success('Couverture créée !');
      // Légère pause pour que l'utilisateur voie la prévisualisation
      await new Promise(r => setTimeout(r, 800));
    }

    saveMutation.mutate(form);
  };

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
    setGeneratedCoverUrl(null);
  };

  const handleEdit = (doc) => {
    setEditingDoc(doc);
    setForm({ title: doc.title, author: doc.author || 'Voir document', description: doc.description || '', pdf_url: doc.pdf_url, cover_image: doc.cover_image });
    setGeneratedCoverUrl(null);
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

  // Image de couverture à afficher dans le formulaire
  const previewCover = generatedCoverUrl || (editingDoc?.cover_image) || null;
  const isBusy = saveMutation.isPending || uploading || generatingCover;

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
              {filtered.map(doc => {
                const palette = getPaletteForTitle(doc.title || '');
                return (
                  <div key={doc.id} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                    <div className="h-52 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${palette.bg}, #1e293b)` }}>
                      {doc.cover_image ? (
                        <img src={doc.cover_image} alt={doc.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                          <FileText className="w-16 h-16" style={{ color: palette.accent + '60' }} />
                          <p className="text-xs font-medium px-4 text-center" style={{ color: palette.accent }}>{doc.title}</p>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button onClick={() => handleEdit(doc)} variant="ghost" size="icon" className="h-8 w-8 bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm rounded-lg">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button onClick={() => deleteMutation.mutate(doc.id)} variant="ghost" size="icon" className="h-8 w-8 bg-black/40 hover:bg-red-600/70 text-white backdrop-blur-sm rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      {/* Badge EMGJ */}
                      <div className="absolute bottom-3 left-3">
                        <span className="text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-full text-white/60 bg-white/10 backdrop-blur-sm border border-white/20">EMGJ</span>
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
                );
              })}
            </div>
          )}
        </div>

        {/* Dialog ajout / modification */}
        <Dialog open={dialogOpen} onOpenChange={resetForm}>
          <DialogContent className="max-w-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {editingDoc ? <Edit className="w-5 h-5 text-blue-600" /> : <Sparkles className="w-5 h-5 text-purple-600" />}
                {editingDoc ? 'Modifier le document' : 'Nouveau document'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Colonne gauche : formulaire */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Titre *</label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Titre du document"
                    className="rounded-xl h-11"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Auteur</label>
                  <Input
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                    placeholder="Voir document"
                    className="rounded-xl h-11"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Thème, contexte du document..."
                    className="rounded-xl resize-none"
                    rows={3}
                  />
                  <p className="text-xs text-gray-400 mt-1">La description aide à générer une meilleure couverture</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Document PDF {!editingDoc && '*'}</label>
                  <Input type="file" accept=".pdf" onChange={(e) => setPdfFile(e.target.files[0])} className="rounded-xl" />
                </div>
              </div>

              {/* Colonne droite : couverture */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 block">Image de couverture</label>

                {/* Prévisualisation */}
                <div className="relative rounded-xl overflow-hidden border-2 border-dashed border-gray-200 bg-gray-50" style={{ aspectRatio: '3/4', minHeight: '220px' }}>
                  {generatingCover ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-indigo-50 to-purple-50">
                      <div className="relative">
                        <Sparkles className="w-10 h-10 text-purple-500 animate-pulse" />
                      </div>
                      <p className="text-sm font-medium text-purple-700 text-center px-4">Création de la couverture…</p>
                      <p className="text-xs text-purple-500 text-center px-4">Notre IA design travaille pour vous</p>
                    </div>
                  ) : previewCover ? (
                    <img src={previewCover} alt="Couverture" className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400">
                      <ImageIcon className="w-10 h-10" />
                      <p className="text-xs text-center px-4">La couverture sera générée automatiquement lors de la publication</p>
                    </div>
                  )}
                </div>

                {/* Actions couverture */}
                <div className="space-y-2">
                  <Button
                    type="button"
                    onClick={handleGenerateCover}
                    disabled={!form.title.trim() || generatingCover}
                    variant="outline"
                    className="w-full rounded-xl h-10 border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300"
                  >
                    {generatingCover ? (
                      <><Loader2 className="w-4 h-4 animate-spin mr-2" />Génération…</>
                    ) : (
                      <><RefreshCw className="w-4 h-4 mr-2" />Régénérer la couverture IA</>
                    )}
                  </Button>
                  <div className="relative">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        setCoverFile(e.target.files[0]);
                        if (e.target.files[0]) {
                          setGeneratedCoverUrl(URL.createObjectURL(e.target.files[0]));
                        }
                      }}
                      className="rounded-xl text-xs"
                    />
                    <p className="text-xs text-gray-400 mt-1 text-center">Ou importez votre propre image</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bouton publier */}
            <Button
              onClick={handlePublish}
              disabled={!form.title.trim() || (!editingDoc && !pdfFile) || isBusy}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl h-12 mt-2 text-base font-semibold shadow-lg shadow-blue-500/20"
            >
              {isBusy ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" />{generatingCover ? 'Génération couverture…' : 'Publication en cours…'}</>
              ) : (
                <>{editingDoc ? '✏️ Mettre à jour' : '🚀 Publier le document'}</>
              )}
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </AdminGuard>
  );
}