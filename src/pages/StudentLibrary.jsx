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
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900 mb-3">Bibliothèque</h1>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher..." className="pl-10 h-10 rounded-xl bg-gray-50" />
            </div>
            <Select value={domainFilter} onValueChange={setDomainFilter}>
              <SelectTrigger className="w-40 h-10 rounded-xl">
                <SelectValue placeholder="Domaine" />
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
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
        ) : filteredDocs.length === 0 ? (
          <div className="text-center py-16">
            <Library className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucun document disponible</p>
          </div>
        ) : (
          filteredDocs.map(doc => (
            <div key={doc.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1">{doc.title}</h3>
                  <p className="text-gray-500 text-sm">{doc.author}</p>
                  {doc.domain && <Badge className="mt-2 bg-blue-50 text-blue-700 border-blue-100 text-xs">{doc.domain}</Badge>}
                  <p className="text-xs text-gray-400 mt-2">{doc.downloads_count || 0} téléchargements</p>
                </div>
                <Button onClick={() => handleDownload(doc)} variant="outline" size="sm" className="rounded-xl text-blue-600 border-blue-200 hover:bg-blue-50 flex-shrink-0">
                  <Download className="w-4 h-4 mr-1" /> PDF
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <StudentBottomNav />
    </div>
  );
}