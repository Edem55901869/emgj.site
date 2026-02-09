import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, GraduationCap, CheckCircle2, Loader2, MapPin, Phone, Mail, Camera, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import StudentBottomNav from '../components/student/StudentBottomNav';

export default function StudentProfile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadStudent();
  }, []);

  const loadStudent = async () => {
    const u = await base44.auth.me();
    setUser(u);
    const students = await base44.entities.Student.filter({ user_email: u.email });
    if (students.length > 0) {
      setStudent(students[0]);
      setForm(students[0]);
    }
    setLoading(false);
  };

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Student.update(student.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminStudents'] });
      setEditing(false);
      loadStudent();
      toast.success('Profil mis à jour');
    },
  });

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await updateMutation.mutateAsync({ profile_photo: file_url });
    setUploading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Profil non trouvé</p>
          <Button onClick={() => navigate(createPageUrl('StudentDashboard'))}>Retour</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Cover */}
      <div className="relative">
        <div className="h-48 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 relative overflow-hidden" 
          style={{
            backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6988dd24f34fbffabf6f6551/87434d389_IMG-20260209-WA0009.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 to-purple-900/70" />
          <Button
            onClick={() => navigate(createPageUrl('StudentMore'))}
            variant="ghost"
            size="icon"
            className="absolute top-4 left-4 bg-black/30 hover:bg-black/40 text-white rounded-full backdrop-blur-sm z-10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="absolute bottom-6 left-6 right-6">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-5 border border-white/50">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                    <span className="text-3xl font-bold text-white">
                      {student.first_name?.[0]}{student.last_name?.[0]}
                    </span>
                  </div>
                  {student.status === 'certifié' && (
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-green-500 border-3 border-white flex items-center justify-center shadow-lg">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-gray-900 font-bold text-xl">{student.first_name} {student.last_name}</h2>
                  <p className="text-gray-500 text-sm mt-0.5">{student.formation_type}</p>
                  <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 text-xs mt-1.5">
                    {student.domain}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="px-6 py-2">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              Informations académiques
            </h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Formation</span>
              <span className="font-medium text-gray-900">{student.formation_type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Domaine</span>
              <Badge className="bg-blue-50 text-blue-700 border-blue-100">{student.domain}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Statut</span>
              <Badge className={student.status === 'certifié' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700'}>
                {student.status}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Inscrit le</span>
              <span className="text-gray-600">{student.created_date && format(new Date(student.created_date), 'd MMMM yyyy', { locale: fr })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="px-6 py-2">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Coordonnées</h3>
            {!editing ? (
              <Button onClick={() => setEditing(true)} variant="outline" size="sm" className="rounded-xl">
                Modifier
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={() => setEditing(false)} variant="outline" size="sm" className="rounded-xl">
                  Annuler
                </Button>
                <Button onClick={() => updateMutation.mutate(form)} disabled={updateMutation.isPending} size="sm" className="bg-blue-600 hover:bg-blue-700 rounded-xl">
                  {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-1" />Sauvegarder</>}
                </Button>
              </div>
            )}
          </div>
          {!editing ? (
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{student.user_email}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{student.city}, {student.country}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{student.whatsapp}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Pays</label>
                <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="rounded-xl h-10" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Ville</label>
                <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="rounded-xl h-10" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">WhatsApp</label>
                <Input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className="rounded-xl h-10" />
              </div>
            </div>
          )}
        </div>
      </div>

      <StudentBottomNav />
    </div>
  );
}