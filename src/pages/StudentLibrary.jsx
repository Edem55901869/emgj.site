import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Library, Search, Download, FileText, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StudentBottomNav from '../components/student/StudentBottomNav';

export default function StudentLibrary() {
  const [search, setSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ['libraryDocs'],
    queryFn: () => base44.entities.LibraryDocument.list('-created_date', 100),
  });

  const handleDownload = async (doc) => {
    await base44.entities.LibraryDocument.update(doc.id, { downloads_count: (doc.downloads_count || 0) + 1 });
    queryClient.invalidateQueries({ queryKey: ['libraryDocs'] });
    window.open(doc.pdf_url, '_blank');
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
              {['THÉOLOGIE', 'LEADERSHIP', 'MISSIOLOGIE', 'PROPHÉTIQUE', 'ENTREPRENEURIAT', 'AUMÔNERIE', 'MINISTÈRE APOSTOLIQUE'].map(d => (
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredDocs.map(doc => (
              <div key={doc.id} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="h-48 bg-gradient-to-br from-red-500 via-pink-500 to-purple-500 relative overflow-hidden">
                  {doc.cover_image ? (
                    <img src={doc.cover_image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileText className="w-16 h-16 text-white/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <Button 
                    onClick={() => handleDownload(doc)} 
                    size="icon" 
                    className="absolute top-3 right-3 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-2">{doc.title}</h3>
                  <p className="text-xs text-gray-500 mb-2">{doc.author}</p>
                  {doc.domain && <Badge className="bg-blue-50 text-blue-700 border-blue-100 text-xs mb-2">{doc.domain}</Badge>}
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Download className="w-3 h-3" /> {doc.downloads_count || 0}
                  </p>
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