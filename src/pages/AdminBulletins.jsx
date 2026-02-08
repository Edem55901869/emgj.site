import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Send, Search, Loader2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import AdminTopNav from '../components/admin/AdminTopNav';
import AdminGuard from '../components/admin/AdminGuard';

const DOMAINS = ['THÉOLOGIE', 'LEADERSHIP', 'MISSIOLOGIE', 'PROPHÉTIQUE', 'ENTREPRENEURIAT', 'AUMÔNERIE', 'MINISTÈRE APOSTOLIQUE'];
const FORMATIONS = ['Discipola', 'Brevet', 'Baccalauréat', 'Licence', 'Master', 'Doctorat'];

export default function AdminBulletins() {
  const [sendOpen, setSendOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [docType, setDocType] = useState('bulletin');
  const [period, setPeriod] = useState('');
  const [search, setSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState('all');
  const [formationFilter, setFormationFilter] = useState('all');
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const { data: students = [], isLoading } = useQuery({ queryKey: ['adminStudents'], queryFn: () => base44.entities.Student.filter({ status: 'certifié' }) });
  const { data: bulletins = [] } = useQuery({ queryKey: ['bulletins'], queryFn: () => base44.entities.Bulletin.list('-created_date', 200) });

  const sendMutation = useMutation({
    mutationFn: async () => {
      if (!pdfFile) { toast.error('Veuillez sélectionner un PDF'); return; }
      setUploading(true);
      const { file_url } = await base44.integrations.Core.UploadFile({ file: pdfFile });
      setUploading(false);
      await base44.entities.Bulletin.create({
        student_email: selectedStudent.user_email,
        student_name: `${selectedStudent.first_name} ${selectedStudent.last_name}`,
        domain: selectedStudent.domain,
        formation_type: selectedStudent.formation_type,
        document_type: docType,
        pdf_url: file_url,
        period
      });
      await base44.entities.Notification.create({
        recipient_email: selectedStudent.user_email,
        title: `Nouveau ${docType} disponible`,
        message: `Votre ${docType} ${period ? `pour ${period}` : ''} est maintenant disponible au téléchargement.`,
        type: 'success'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bulletins'] });
      setSendOpen(false);
      setSelectedStudent(null);
      setPdfFile(null);
      setPeriod('');
      toast.success('Document envoyé avec succès');
    },
  });

  const filteredStudents = students
    .filter(s => !search || `${s.first_name} ${s.last_name}`.toLowerCase().includes(search.toLowerCase()))
    .filter(s => domainFilter === 'all' || s.domain === domainFilter)
    .filter(s => formationFilter === 'all' || s.formation_type === formationFilter);

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
        <AdminTopNav />
        <div className="pt-20 px-4 pb-8 max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Bulletins & Diplômes</h1>
            <p className="text-gray-500 mt-1">Envoyez des documents PDF aux étudiants</p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un étudiant..." className="pl-10 h-11 rounded-xl" />
            </div>
            <Select value={domainFilter} onValueChange={setDomainFilter}>
              <SelectTrigger className="w-48 h-11 rounded-xl"><SelectValue placeholder="Domaine" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les domaines</SelectItem>
                {DOMAINS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={formationFilter} onValueChange={setFormationFilter}>
              <SelectTrigger className="w-48 h-11 rounded-xl"><SelectValue placeholder="Formation" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les formations</SelectItem>
                {FORMATIONS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
          ) : (
            <div className="space-y-2">
              {filteredStudents.map(student => {
                const sentDocs = bulletins.filter(b => b.student_email === student.user_email);
                return (
                  <div key={student.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {student.first_name?.[0]}{student.last_name?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{student.first_name} {student.last_name}</p>
                      <p className="text-xs text-gray-500">{student.domain} • {student.formation_type}</p>
                    </div>
                    {sentDocs.length > 0 && <Badge className="bg-green-50 text-green-700 border-green-200 text-xs">{sentDocs.length} envoyé(s)</Badge>}
                    <Button onClick={() => { setSelectedStudent(student); setSendOpen(true); }} size="sm" className="bg-blue-600 hover:bg-blue-700 rounded-xl">
                      <Send className="w-3 h-3 mr-1" /> Envoyer
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Send Dialog */}
        <Dialog open={sendOpen} onOpenChange={setSendOpen}>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader><DialogTitle>Envoyer un document à {selectedStudent?.first_name}</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <Select value={docType} onValueChange={setDocType}>
                <SelectTrigger className="rounded-xl h-11"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bulletin">Bulletin</SelectItem>
                  <SelectItem value="diplôme">Diplôme</SelectItem>
                  <SelectItem value="certificat">Certificat</SelectItem>
                </SelectContent>
              </Select>
              <Input value={period} onChange={(e) => setPeriod(e.target.value)} placeholder="Période (ex: Semestre 1 2026)" className="rounded-xl h-11" />
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Document PDF *</label>
                <Input type="file" accept=".pdf" onChange={(e) => setPdfFile(e.target.files[0])} className="rounded-xl" />
              </div>
              <Button onClick={() => sendMutation.mutate()} disabled={!pdfFile || sendMutation.isPending || uploading} className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl h-11">
                {(sendMutation.isPending || uploading) ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Envoyer'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminGuard>
  );
}