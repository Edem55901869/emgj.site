import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Plus, Trash2, Edit, Loader2, Headphones, Link as LinkIcon, Upload, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import AdminTopNav from '../components/admin/AdminTopNav';
import AdminGuard from '../components/admin/AdminGuard';
import { DOMAINS, FORMATION_BY_DOMAIN } from '@/components/domainFormationMapping';

export default function AdminCourses() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', domain: '', formation_type: '', teacher_name: '', pdf_url: '', audio_files: [], video_files: [], document_files: [] });
  const [pdfFile, setPdfFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDomain, setFilterDomain] = useState('');
  const [filterFormation, setFilterFormation] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [audioFiles, setAudioFiles] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);
  const [documentFiles, setDocumentFiles] = useState([]);
  const [coverFile, setCoverFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [audioSource, setAudioSource] = useState('url');
  const [videoSource, setVideoSource] = useState('url');
  const [documentSource, setDocumentSource] = useState('file');
  const [audioUrls, setAudioUrls] = useState(['']);
  const [videoUrls, setVideoUrls] = useState(['']);
  const [qcmQuestions, setQcmQuestions] = useState([{ question: '', correct_answer: '' }]);
  const queryClient = useQueryClient();

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['adminCourses'],
    queryFn: () => base44.entities.Course.list('-created_date', 100),
  });

  // Charger le nom de l'enseignant sauvegardé
  React.useEffect(() => {
    const savedTeacher = localStorage.getItem('last_teacher_name');
    if (savedTeacher && !editingCourse) {
      setForm(prev => ({ ...prev, teacher_name: savedTeacher }));
    }
  }, [editingCourse]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      setUploading(true);
      let cover_image = data.cover_image || '';
      let pdf_url = data.pdf_url || '';
      let audioFilesData = [];

      // Upload du PDF si fourni
      if (pdfFile) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: pdfFile });
        pdf_url = file_url;
      }

      // Upload des fichiers audio
      if (audioSource === 'file' && audioFiles.length > 0) {
        for (let i = 0; i < audioFiles.length; i++) {
          const { file_url } = await base44.integrations.Core.UploadFile({ file: audioFiles[i] });
          audioFilesData.push({ url: file_url, order: i + 1 });
        }
      } else if (audioSource === 'url') {
        audioFilesData = audioUrls.filter(url => url.trim()).map((url, i) => ({ url: url.trim(), order: i + 1 }));
      }

      // Upload des fichiers vidéo
      let videoFilesData = [];
      if (videoSource === 'file' && videoFiles.length > 0) {
        for (let i = 0; i < videoFiles.length; i++) {
          const { file_url } = await base44.integrations.Core.UploadFile({ file: videoFiles[i] });
          videoFilesData.push({ url: file_url, order: i + 1 });
        }
      } else if (videoSource === 'url') {
        videoFilesData = videoUrls.filter(url => url.trim()).map((url, i) => ({ url: url.trim(), order: i + 1 }));
      }

      // Upload des documents
      let documentFilesData = [];
      if (documentFiles.length > 0) {
        for (let i = 0; i < documentFiles.length; i++) {
          const { file_url } = await base44.integrations.Core.UploadFile({ file: documentFiles[i] });
          documentFilesData.push({
            url: file_url,
            name: documentFiles[i].name,
            type: documentFiles[i].type,
            order: i + 1
          });
        }
      }

      if (coverFile) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: coverFile });
        cover_image = file_url;
      }

      // Calculer l'ordre automatiquement si non spécifié
      let order = data.order;
      if (!order && !editingCourse) {
        const sameDomainCourses = courses.filter(c => c.domain === data.domain && c.formation_type === data.formation_type);
        const maxOrder = sameDomainCourses.length > 0 ? Math.max(...sameDomainCourses.map(c => c.order || 0)) : 0;
        order = maxOrder + 1;
      }

      setUploading(false);

      const courseData = {
        ...data,
        audio_files: audioFilesData.length > 0 ? audioFilesData : null,
        video_files: videoFilesData.length > 0 ? videoFilesData : null,
        document_files: documentFilesData.length > 0 ? documentFilesData : null,
        pdf_url,
        cover_image,
        order
      };

      // Sauvegarder le nom de l'enseignant
      localStorage.setItem('last_teacher_name', data.teacher_name);

      let course;
      if (editingCourse) {
        course = await base44.entities.Course.update(editingCourse.id, courseData);
      } else {
        course = await base44.entities.Course.create(courseData);
      }

      // Sauvegarder les questions QCM
      if (qcmQuestions.some(q => q.question && q.correct_answer)) {
        const validQuestions = qcmQuestions.filter(q => q.question && q.correct_answer);
        const existingEval = await base44.entities.CourseEvaluation.filter({ course_id: course.id });
        
        if (existingEval.length > 0) {
          await base44.entities.CourseEvaluation.update(existingEval[0].id, {
            questions: validQuestions
          });
        } else {
          await base44.entities.CourseEvaluation.create({
            course_id: course.id,
            questions: validQuestions
          });
        }
      }

      return course;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCourses'] });
      setDialogOpen(false);
      resetForm();
      toast.success(editingCourse ? 'Cours modifié' : 'Cours publié');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Course.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCourses'] });
      toast.success('Cours supprimé');
    },
  });

  const resetForm = () => {
    const savedTeacher = localStorage.getItem('last_teacher_name');
    setForm({ title: '', description: '', domain: '', formation_type: '', teacher_name: savedTeacher || '', pdf_url: '', audio_files: [], video_files: [], document_files: [], order: '', prerequisite_course_id: '' });
    setEditingCourse(null);
    setAudioFiles([]);
    setVideoFiles([]);
    setDocumentFiles([]);
    setAudioUrls(['']);
    setVideoUrls(['']);
    setPdfFile(null);
    setCoverFile(null);
    setAudioSource('url');
    setVideoSource('url');
    setDocumentSource('file');
    setQcmQuestions([{ question: '', correct_answer: '', question_type: 'qcm' }]);
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setForm(course);
    if (course.audio_files?.length > 0) {
      setAudioSource('url');
      setAudioUrls(course.audio_files.map(a => a.url));
    } else {
      setAudioUrls(['']);
    }
    if (course.video_files?.length > 0) {
      setVideoSource('url');
      setVideoUrls(course.video_files.map(v => v.url));
    } else {
      setVideoUrls(['']);
    }
    setDialogOpen(true);
  };

  // Filtrage et tri des cours
  const filteredAndSortedCourses = courses
    .filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.teacher_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDomain = !filterDomain || course.domain === filterDomain;
      const matchesFormation = !filterFormation || course.formation_type === filterFormation;
      return matchesSearch && matchesDomain && matchesFormation;
    })
    .sort((a, b) => {
      if (sortBy === 'recent') return new Date(b.created_date) - new Date(a.created_date);
      if (sortBy === 'oldest') return new Date(a.created_date) - new Date(b.created_date);
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'teacher') return a.teacher_name.localeCompare(b.teacher_name);
      return 0;
    });

  const availableFormations = filterDomain ? FORMATION_BY_DOMAIN[filterDomain] : [];

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <AdminTopNav />
        <div className="pt-20 px-4 pb-8 max-w-7xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Cours</h1>
                <p className="text-gray-500 text-sm mt-1">Gérez les cours (audio, vidéo, documents)</p>
              </div>
              <Button onClick={() => { resetForm(); setDialogOpen(true); }} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg shadow-blue-500/20">
                <Plus className="w-4 h-4 mr-2" /> Nouveau cours
              </Button>
            </div>

            {/* Barre de recherche et filtres */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher par titre ou enseignant..."
                    className="pl-10 h-11 rounded-xl"
                  />
                </div>
                <Select value={filterDomain} onValueChange={(v) => { setFilterDomain(v); setFilterFormation(''); }}>
                  <SelectTrigger className="w-full md:w-64 h-11 rounded-xl">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Tous les domaines" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Tous les domaines</SelectItem>
                    {DOMAINS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={filterFormation} onValueChange={setFilterFormation} disabled={!filterDomain}>
                  <SelectTrigger className="w-full md:w-48 h-11 rounded-xl">
                    <SelectValue placeholder="Toutes formations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Toutes formations</SelectItem>
                    {availableFormations.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full md:w-48 h-11 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Plus récents</SelectItem>
                    <SelectItem value="oldest">Plus anciens</SelectItem>
                    <SelectItem value="title">Par titre (A-Z)</SelectItem>
                    <SelectItem value="teacher">Par enseignant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{filteredAndSortedCourses.length} cours trouvé{filteredAndSortedCourses.length > 1 ? 's' : ''}</span>
                {(searchQuery || filterDomain || filterFormation) && (
                  <button onClick={() => { setSearchQuery(''); setFilterDomain(''); setFilterFormation(''); }} className="text-blue-600 hover:text-blue-700 font-medium">
                    Réinitialiser les filtres
                  </button>
                )}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
          ) : filteredAndSortedCourses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Aucun cours trouvé</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedCourses.map(course => (
                <div key={course.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                  {course.cover_image && (
                    <div className="h-40 bg-gradient-to-br from-blue-500 to-purple-500 relative overflow-hidden">
                      <img src={course.cover_image} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-1">{course.title}</h3>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Headphones className="w-3 h-3" />
                          {course.teacher_name}
                        </p>
                      </div>
                    </div>
                    {course.description && <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge className="bg-blue-50 text-blue-700 border-blue-100 text-xs">{course.domain}</Badge>
                      <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 text-xs">{course.formation_type}</Badge>
                      {course.audio_files?.length > 0 && (
                        <Badge className="bg-green-50 text-green-700 border-green-100 text-xs">
                          {course.audio_files.length} audio(s)
                        </Badge>
                      )}
                      {course.video_files?.length > 0 && (
                        <Badge className="bg-purple-50 text-purple-700 border-purple-100 text-xs">
                          {course.video_files.length} vidéo(s)
                        </Badge>
                      )}
                      {course.document_files?.length > 0 && (
                        <Badge className="bg-orange-50 text-orange-700 border-orange-100 text-xs">
                          {course.document_files.length} doc(s)
                        </Badge>
                      )}
                    </div>
                    {course.audio_files?.length > 0 && (
                      <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                        {course.audio_files.sort((a, b) => (a.order || 0) - (b.order || 0)).map((audio, idx) => (
                          <div key={idx} className="bg-gray-50 rounded-lg p-2">
                            <p className="text-xs text-gray-600 mb-1 font-medium">Audio {idx + 1}</p>
                            <audio 
                              src={audio.url.includes('drive.google.com') ? `/api/functions/streamGoogleDriveAudio?url=${encodeURIComponent(audio.url)}` : audio.url}
                              controls 
                              preload="metadata"
                              className="w-full"
                              style={{ height: '35px' }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button onClick={() => handleEdit(course)} variant="outline" size="sm" className="flex-1 rounded-xl">
                        <Edit className="w-3 h-3 mr-1" /> Modifier
                      </Button>
                      <Button onClick={() => deleteMutation.mutate(course.id)} variant="outline" size="sm" className="rounded-xl text-red-600 border-red-200 hover:bg-red-50">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCourse ? 'Modifier le cours' : 'Nouveau cours'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Titre *</label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Titre du cours" className="rounded-xl h-11" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description..." className="rounded-xl" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Domaine *</label>
                <Select value={form.domain} onValueChange={(v) => setForm({ ...form, domain: v, formation_type: '' })}>
                  <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="Domaine" /></SelectTrigger>
                  <SelectContent>
                    {DOMAINS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Formation *</label>
                <Select value={form.formation_type} onValueChange={(v) => setForm({ ...form, formation_type: v })} disabled={!form.domain}>
                  <SelectTrigger className="rounded-xl h-11">
                    <SelectValue placeholder={form.domain ? "Type de formation" : "Sélectionnez d'abord un domaine"} />
                  </SelectTrigger>
                  <SelectContent>
                    {form.domain && FORMATION_BY_DOMAIN[form.domain]?.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Enseignant *</label>
                <Input value={form.teacher_name} onChange={(e) => setForm({ ...form, teacher_name: e.target.value })} placeholder="Nom de l'enseignant" className="rounded-xl h-11" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Documents (PDF, Word, txt, etc. - jusqu'à 10)
                </label>
                {editingCourse?.document_files?.length > 0 && (
                  <div className="mb-2 p-2 bg-orange-50 rounded-lg border border-orange-100">
                    <p className="text-xs text-orange-700 mb-2">Documents actuels :</p>
                    {editingCourse.document_files.map((doc, idx) => (
                      <a key={idx} href={doc.url} target="_blank" rel="noopener noreferrer" className="block text-sm text-orange-700 hover:underline">
                        📄 {doc.name || `Document ${idx + 1}`}
                      </a>
                    ))}
                  </div>
                )}
                <Input 
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx"
                  multiple
                  onChange={(e) => setDocumentFiles(Array.from(e.target.files).slice(0, 10))}
                  className="rounded-xl"
                />
                {documentFiles.length > 0 && (
                  <p className="text-xs text-gray-600 mt-1">✓ {documentFiles.length} document(s) sélectionné(s)</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Fichiers audio (optionnel - jusqu'à 10)
                </label>
                <div className="flex gap-2 mb-3">
                  <Button type="button" onClick={() => setAudioSource('url')} variant={audioSource === 'url' ? 'default' : 'outline'} size="sm" className="flex-1 rounded-xl">
                    <LinkIcon className="w-4 h-4 mr-1" /> Liens externes
                  </Button>
                  <Button type="button" onClick={() => setAudioSource('file')} variant={audioSource === 'file' ? 'default' : 'outline'} size="sm" className="flex-1 rounded-xl">
                    <Upload className="w-4 h-4 mr-1" /> Fichiers
                  </Button>
                </div>
                {audioSource === 'url' ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-xl p-3">
                    {editingCourse?.audio_files?.length > 0 && (
                      <div className="bg-blue-50 rounded-lg p-3 mb-2">
                        <p className="text-xs text-blue-700 font-medium mb-2">Audios actuels :</p>
                        {editingCourse.audio_files.sort((a, b) => (a.order || 0) - (b.order || 0)).map((audio, idx) => (
                          <div key={idx} className="mb-2">
                            <p className="text-xs text-gray-600 mb-1">Audio {idx + 1}</p>
                            <audio 
                              src={audio.url.includes('drive.google.com') ? `/api/functions/streamGoogleDriveAudio?url=${encodeURIComponent(audio.url)}` : audio.url}
                              controls 
                              preload="metadata"
                              className="w-full"
                              style={{ height: '35px' }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    {audioUrls.map((url, i) => (
                      <div key={i} className="flex gap-2">
                        <Input 
                          value={url} 
                          onChange={(e) => {
                            const newUrls = [...audioUrls];
                            newUrls[i] = e.target.value;
                            setAudioUrls(newUrls);
                          }}
                          placeholder={`Lien audio ${i + 1}`}
                          className="rounded-xl h-10"
                        />
                        {audioUrls.length > 1 && (
                          <Button 
                            type="button" 
                            onClick={() => setAudioUrls(audioUrls.filter((_, idx) => idx !== i))} 
                            variant="outline" 
                            size="icon" 
                            className="h-10 w-10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {audioUrls.length < 10 && (
                      <Button 
                        type="button" 
                        onClick={() => setAudioUrls([...audioUrls, ''])} 
                        variant="outline" 
                        size="sm" 
                        className="w-full rounded-xl"
                      >
                        <Plus className="w-4 h-4 mr-1" /> Ajouter un audio
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Input 
                      type="file" 
                      accept="audio/*,.opus" 
                      multiple 
                      onChange={(e) => setAudioFiles(Array.from(e.target.files).slice(0, 10))} 
                      className="rounded-xl" 
                    />
                    {audioFiles.length > 0 && (
                      <div className="text-sm text-gray-600 bg-blue-50 rounded-lg p-2">
                        {audioFiles.length} fichier(s) sélectionné(s)
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Fichiers vidéo (optionnel - jusqu'à 10)
                </label>
                <div className="flex gap-2 mb-3">
                  <Button type="button" onClick={() => setVideoSource('url')} variant={videoSource === 'url' ? 'default' : 'outline'} size="sm" className="flex-1 rounded-xl">
                    <LinkIcon className="w-4 h-4 mr-1" /> Liens externes
                  </Button>
                  <Button type="button" onClick={() => setVideoSource('file')} variant={videoSource === 'file' ? 'default' : 'outline'} size="sm" className="flex-1 rounded-xl">
                    <Upload className="w-4 h-4 mr-1" /> Fichiers
                  </Button>
                </div>
                {videoSource === 'url' ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-xl p-3">
                    {videoUrls.map((url, i) => (
                      <div key={i} className="flex gap-2">
                        <Input 
                          value={url} 
                          onChange={(e) => {
                            const newUrls = [...videoUrls];
                            newUrls[i] = e.target.value;
                            setVideoUrls(newUrls);
                          }}
                          placeholder={`Lien vidéo ${i + 1}`}
                          className="rounded-xl h-10"
                        />
                        {videoUrls.length > 1 && (
                          <Button 
                            type="button" 
                            onClick={() => setVideoUrls(videoUrls.filter((_, idx) => idx !== i))} 
                            variant="outline" 
                            size="icon" 
                            className="h-10 w-10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {videoUrls.length < 10 && (
                      <Button 
                        type="button" 
                        onClick={() => setVideoUrls([...videoUrls, ''])} 
                        variant="outline" 
                        size="sm" 
                        className="w-full rounded-xl"
                      >
                        <Plus className="w-4 h-4 mr-1" /> Ajouter une vidéo
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Input 
                      type="file" 
                      accept="video/*" 
                      multiple 
                      onChange={(e) => setVideoFiles(Array.from(e.target.files).slice(0, 10))} 
                      className="rounded-xl" 
                    />
                    {videoFiles.length > 0 && (
                      <div className="text-sm text-gray-600 bg-purple-50 rounded-lg p-2">
                        {videoFiles.length} vidéo(s) sélectionnée(s)
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Image de couverture</label>
                <Input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files[0])} className="rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Ordre (auto)</label>
                  <Input type="number" value={form.order || ''} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || null })} placeholder="Auto" className="rounded-xl h-11" />
                  <p className="text-xs text-gray-500 mt-1">Laissez vide pour auto</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Cours prérequis</label>
                  <Select value={form.prerequisite_course_id || ''} onValueChange={(v) => setForm({ ...form, prerequisite_course_id: v })}>
                    <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="Aucun" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>Aucun</SelectItem>
                      {courses.filter(c => c.id !== editingCourse?.id).map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Questions d'évaluation</label>
                <div className="space-y-3 max-h-60 overflow-y-auto border border-gray-200 rounded-xl p-3">
                  {qcmQuestions.map((q, i) => (
                    <div key={i} className="space-y-2 p-3 bg-gray-50 rounded-lg relative">
                      <Button
                        type="button"
                        onClick={() => setQcmQuestions(qcmQuestions.filter((_, idx) => idx !== i))}
                        variant="ghost"
                        size="sm"
                        className="absolute top-1 right-1 h-7 w-7 p-0 text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                      <select
                        value={q.question_type || 'qcm'}
                        onChange={(e) => {
                          const newQ = [...qcmQuestions];
                          newQ[i].question_type = e.target.value;
                          setQcmQuestions(newQ);
                        }}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="qcm">QCM (choix multiples)</option>
                        <option value="redaction">Rédaction libre</option>
                      </select>
                      <Input 
                        value={q.question} 
                        onChange={(e) => {
                          const newQ = [...qcmQuestions];
                          newQ[i].question = e.target.value;
                          setQcmQuestions(newQ);
                        }}
                        placeholder={`Question ${i + 1}`}
                        className="rounded-xl h-10"
                      />
                      <Input 
                        value={q.correct_answer} 
                        onChange={(e) => {
                          const newQ = [...qcmQuestions];
                          newQ[i].correct_answer = e.target.value;
                          setQcmQuestions(newQ);
                        }}
                        placeholder={q.question_type === 'redaction' ? "Éléments de réponse attendus" : "Réponse correcte"}
                        className="rounded-xl h-10"
                      />
                      {q.question_type === 'redaction' && (
                        <p className="text-xs text-blue-600">
                          ✍️ L'étudiant rédigera sa réponse librement
                        </p>
                      )}
                    </div>
                  ))}
                  <Button type="button" onClick={() => setQcmQuestions([...qcmQuestions, { question: '', correct_answer: '', question_type: 'qcm' }])} variant="outline" size="sm" className="w-full rounded-xl">
                    <Plus className="w-4 h-4 mr-1" /> Ajouter une question
                  </Button>
                </div>
              </div>
              <Button
                onClick={() => saveMutation.mutate(form)}
                disabled={!form.title || !form.domain || !form.formation_type || !form.teacher_name || saveMutation.isPending || uploading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl h-11"
              >
                {(saveMutation.isPending || uploading) ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingCourse ? 'Mettre à jour' : 'Publier le cours')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminGuard>
  );
}