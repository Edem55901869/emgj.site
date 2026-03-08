import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Library, Search, Download, FileText, Loader2, X, ZoomIn, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import StudentBottomNav from '../components/student/StudentBottomNav';
import { generateSVGCover } from '../components/library/LibraryCoverGenerator';
import { toast } from 'sonner';

export default function StudentLibrary() {
  const [search, setSearch] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null); // pour la vue couverture en grand
  const [student, setStudent] = useState(null);
  const [loadingStudent, setLoadingStudent] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadStudent = async () => {
      try {
        const adminView = localStorage.getItem('admin_student_view');
        if (adminView) {
          setStudent({ status: 'certifié' }); // admin preview
          setLoadingStudent(false);
          return;
        }
        const user = await base44.auth.me();
        if (user) {
          const students = await base44.entities.Student.filter({ user_email: user.email });
          setStudent(students[0] || null);
        }
      } catch {}
      setLoadingStudent(false);
    };
    loadStudent();
  }, []);

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ['libraryDocs'],
    queryFn: () => base44.entities.LibraryDocument.list('-created_date', 200),
  });

  const downloadMutation = useMutation({
    mutationFn: (doc) => base44.entities.LibraryDocument.update(doc.id, { downloads_count: (doc.downloads_count || 0) + 1 }),
    onSuccess: (_, doc) => {
      queryClient.invalidateQueries({ queryKey: ['libraryDocs'] });
    },
  });

  const handleDownload = (doc) => {
    downloadMutation.mutate(doc);
    const link = document.createElement('a');
    link.href = doc.pdf_url;
    link.download = `${doc.title || 'document'}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Téléchargement lancé');
  };

  const filteredDocs = docs.filter(d =>
    !search || d.title?.toLowerCase().includes(search.toLowerCase()) || d.author?.toLowerCase().includes(search.toLowerCase())
  );

  if (loadingStudent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Seuls les étudiants certifiés (ou admin view) ont accès
  if (!student || student.status !== 'certifié') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24 flex flex-col">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-4 pt-12 pb-6">
          <h1 className="text-2xl font-bold text-white">Bibliothèque</h1>
        </div>
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center max-w-xs">
            <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <Library className="w-10 h-10 text-amber-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Accès restreint</h2>
            <p className="text-gray-500 text-sm">La bibliothèque est réservée aux étudiants dont l'adhésion a été validée (certifiés).</p>
          </div>
        </div>
        <StudentBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-4 pt-12 pb-6 sticky top-0 z-40 shadow-lg">
        <div className="flex items-center gap-3 mb-3">
          <BookOpen className="w-6 h-6 text-white/80" />
          <h1 className="text-2xl font-bold text-white">Bibliothèque</h1>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un document..."
            className="pl-10 h-10 rounded-xl bg-white/20 border-white/30 text-white placeholder:text-white/50"
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
        ) : filteredDocs.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Library className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-gray-500">Aucun document disponible</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredDocs.map(doc => {
              const cover = doc.cover_image || generateSVGCover(doc.title || '');
              return (
                <div key={doc.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
                  {/* Couverture cliquable */}
                  <div
                    className="relative overflow-hidden bg-gray-900 cursor-pointer group"
                    style={{ aspectRatio: '5/7' }}
                    onClick={() => setSelectedDoc(doc)}
                  >
                    <img src={cover} alt={doc.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                      <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>

                  {/* Infos */}
                  <div className="p-3 flex flex-col gap-2 flex-1">
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm line-clamp-2 leading-tight">{doc.title}</h3>
                      {doc.author && <p className="text-xs text-gray-500 mt-0.5">{doc.author}</p>}
                    </div>
                    {doc.description && (
                      <p className="text-xs text-gray-400 line-clamp-2">{doc.description}</p>
                    )}
                    <div className="flex items-center justify-between mt-auto pt-1">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Download className="w-3 h-3" /> {doc.downloads_count || 0}
                      </span>
                      <Button
                        onClick={() => handleDownload(doc)}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 rounded-xl h-8 text-xs px-3 gap-1"
                      >
                        <Download className="w-3 h-3" /> Télécharger
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal couverture en grand */}
      {selectedDoc && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedDoc(null)}
        >
          <div className="relative max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedDoc(null)}
              className="absolute -top-10 right-0 text-white/70 hover:text-white p-2"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ aspectRatio: '5/7' }}>
              <img
                src={selectedDoc.cover_image || generateSVGCover(selectedDoc.title || '')}
                alt={selectedDoc.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="mt-4 text-center">
              <p className="text-white font-bold text-lg">{selectedDoc.title}</p>
              {selectedDoc.author && <p className="text-white/60 text-sm">{selectedDoc.author}</p>}
              <Button
                onClick={() => { handleDownload(selectedDoc); setSelectedDoc(null); }}
                className="mt-4 bg-blue-600 hover:bg-blue-700 rounded-xl gap-2"
              >
                <Download className="w-4 h-4" /> Télécharger le PDF
              </Button>
            </div>
          </div>
        </div>
      )}

      <StudentBottomNav />
    </div>
  );
}