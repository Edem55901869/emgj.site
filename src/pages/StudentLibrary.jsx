import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Library, Search, Download, FileText, Loader2, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StudentBottomNav from '../components/student/StudentBottomNav';

export default function StudentLibrary() {
  const [search, setSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState('all');
  const queryClient = useQueryClient();

  useEffect(() => {
    const adminView = localStorage.getItem('admin_student_view');
    if (adminView) {
      const viewData = JSON.parse(adminView);
      setDomainFilter(viewData.domain);
    }
  }, []);

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ['libraryDocs'],
    queryFn: () => base44.entities.LibraryDocument.list('-created_date', 100),
  });

  const handleDownload = async (doc) => {
    try {
      await base44.entities.LibraryDocument.update(doc.id, { downloads_count: (doc.downloads_count || 0) + 1 });
      queryClient.invalidateQueries({ queryKey: ['libraryDocs'] });
      
      // Créer un lien de téléchargement
      const link = document.createElement('a');
      link.href = doc.pdf_url;
      link.download = doc.title || 'document.pdf';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Erreur de téléchargement:', error);
    }
  };

  const filteredDocs = docs
    .filter(d => !search || d.title?.toLowerCase().includes(search.toLowerCase()) || d.author?.toLowerCase().includes(search.toLowerCase()))
    .filter(d => domainFilter === 'all' || d.domain === domainFilter);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24">
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-4 pt-12 pb-6 sticky top-0 z-40 shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-3">Bibliothèque</h1>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher..." className="pl-10 h-10 rounded-xl bg-white/20 border-white/30 text-white placeholder:text-white/50" />
          </div>
          <Select value={domainFilter} onValueChange={setDomainFilter}>
            <SelectTrigger className="w-40 h-10 rounded-xl bg-white/20 border-white/30 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              {['THÉOLOGIE', 'LEADERSHIP ET ADMINISTRATION CHRÉTIENNE', 'MISSIOLOGIE', 'ÉCOLE PROPHETIQUES', 'ENTREPRENEURIAT', 'AUMÔNERIE', 'MINISTÈRE APOSTOLIQUE', 'École de dimanche'].map(d => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          <div className="space-y-3">
            {filteredDocs.map(doc => (
              <div key={doc.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-lg transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-20 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {doc.cover_image ? (
                      <img src={doc.cover_image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <FileText className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg mb-1">{doc.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">Par {doc.author}</p>
                        {doc.description && (
                          <p className="text-xs text-gray-500 line-clamp-2 mb-2">{doc.description}</p>
                        )}
                        <div className="flex items-center gap-2">
                          {doc.domain && <Badge className="bg-blue-50 text-blue-700 border-blue-100 text-xs">{doc.domain}</Badge>}
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Download className="w-3 h-3" /> {doc.downloads_count || 0} téléchargements
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleDownload(doc)} 
                    className="bg-blue-600 hover:bg-blue-700 rounded-xl flex-shrink-0"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Consulter
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <StudentBottomNav />
    </div>
  );
}