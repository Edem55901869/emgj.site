import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Award, BookOpen, MessageCircle, Heart, Calendar, MapPin, Phone, GraduationCap, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import StudentBottomNav from '../components/student/StudentBottomNav';

export default function StudentProfile() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const studentId = searchParams.get('id');
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);

  useEffect(() => {
    loadStudent();
  }, [studentId]);

  const loadStudent = async () => {
    if (!studentId) {
      navigate(createPageUrl('StudentDashboard'));
      return;
    }
    const students = await base44.entities.Student.filter({ id: studentId });
    if (students.length > 0) setStudent(students[0]);
    setLoading(false);
  };

  const { data: comments = [] } = useQuery({
    queryKey: ['studentComments', student?.user_email],
    queryFn: () => base44.entities.BlogComment.filter({ author_email: student?.user_email }),
    enabled: !!student,
  });

  const { data: likes = [] } = useQuery({
    queryKey: ['studentLikes', student?.user_email],
    queryFn: () => base44.entities.BlogLike.filter({ user_email: student?.user_email }),
    enabled: !!student,
  });

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
          <p className="text-gray-600 mb-4">Étudiant non trouvé</p>
          <Button onClick={() => navigate(createPageUrl('StudentDashboard'))}>Retour</Button>
        </div>
      </div>
    );
  }

  const recentActivities = [
    ...comments.slice(0, 3).map(c => ({ type: 'comment', date: c.created_date, text: `A commenté: "${c.content.slice(0, 50)}..."` })),
    ...likes.slice(0, 2).map(l => ({ type: 'like', date: l.created_date, text: 'A aimé une publication' })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Cover & Profile */}
      <div className="relative">
        <div className="h-40 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-white text-2xl font-bold tracking-wide opacity-30">ÉCOLE MISSIONNAIRE GÉNÉRATION JOËL</h1>
          </div>
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            size="icon"
            className="absolute top-4 left-4 bg-black/20 hover:bg-black/30 text-white rounded-full backdrop-blur-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="relative px-6 -mt-16 pb-4">
          <div className="flex items-end gap-4">
            <div className="relative">
              <div className="w-28 h-28 rounded-2xl bg-white shadow-xl flex items-center justify-center overflow-hidden border-4 border-white">
                {student.profile_photo ? (
                  <img src={student.profile_photo} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-blue-600">
                    {student.first_name?.[0]}{student.last_name?.[0]}
                  </span>
                )}
              </div>
              {student.status === 'certifié' && (
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-green-500 border-4 border-white flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 mb-2">
              <h2 className="text-2xl font-bold text-gray-900">{student.first_name} {student.last_name}</h2>
              <p className="text-gray-500 text-sm mt-0.5">{student.domain}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 text-center border border-gray-100 shadow-sm">
            <BookOpen className="w-5 h-5 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">12</p>
            <p className="text-xs text-gray-500 mt-1">Cours validés</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center border border-gray-100 shadow-sm">
            <Award className="w-5 h-5 text-amber-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">15.8</p>
            <p className="text-xs text-gray-500 mt-1">Moyenne</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center border border-gray-100 shadow-sm">
            <MessageCircle className="w-5 h-5 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{comments.length + likes.length}</p>
            <p className="text-xs text-gray-500 mt-1">Activités</p>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="px-6 py-2">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-3">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            Informations académiques
          </h3>
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
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="px-6 py-2">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-3">
          <h3 className="font-bold text-gray-900">Coordonnées</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{student.city}, {student.country}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{student.whatsapp}</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">
                Inscrit le {student.created_date && format(new Date(student.created_date), 'd MMMM yyyy', { locale: fr })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="px-6 py-2">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">Activités récentes</h3>
          {recentActivities.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Aucune activité récente</p>
          ) : (
            <div className="space-y-3">
              {recentActivities.map((activity, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    activity.type === 'comment' ? 'bg-blue-100' : 'bg-red-100'
                  }`}>
                    {activity.type === 'comment' ? (
                      <MessageCircle className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Heart className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700">{activity.text}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {activity.date && format(new Date(activity.date), 'd MMM', { locale: fr })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <StudentBottomNav />
    </div>
  );
}