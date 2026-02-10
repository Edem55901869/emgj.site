import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Users, BookOpen, Newspaper, Library, Radio, MessageCircle, TrendingUp, Clock, CheckCircle, AlertCircle, Loader2, Award, DollarSign, BarChart3, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import AdminTopNav from '../components/admin/AdminTopNav';
import AdminGuard from '../components/admin/AdminGuard';
import NotificationService from '../components/NotificationService';
import HostingBanner from '../components/HostingBanner';

export default function AdminDashboard() {
  const [adminEmail, setAdminEmail] = useState(null);

  React.useEffect(() => {
    const load = async () => {
      const user = await base44.auth.me();
      setAdminEmail(user?.email);
    };
    load();
  }, []);

  const { data: students = [] } = useQuery({ queryKey: ['students'], queryFn: () => base44.entities.Student.list('-created_date', 500) });
  const { data: courses = [] } = useQuery({ queryKey: ['courses'], queryFn: () => base44.entities.Course.list() });
  const { data: allProgress = [] } = useQuery({ queryKey: ['allProgress'], queryFn: () => base44.entities.StudentCourseProgress.list() });
  const { data: posts = [] } = useQuery({ queryKey: ['posts'], queryFn: () => base44.entities.BlogPost.list() });
  const { data: docs = [] } = useQuery({ queryKey: ['docs'], queryFn: () => base44.entities.LibraryDocument.list() });
  const { data: conferences = [] } = useQuery({ queryKey: ['conferences'], queryFn: () => base44.entities.Conference.list() });
  const { data: questions = [] } = useQuery({ queryKey: ['questions'], queryFn: () => base44.entities.CourseQuestion.list() });
  const { data: activities = [] } = useQuery({ queryKey: ['activities'], queryFn: () => base44.entities.RecentActivity.list('-created_date', 10) });
  
  const { data: hostingProofs = [] } = useQuery({ 
    queryKey: ['hostingProofs', adminEmail], 
    queryFn: () => base44.entities.HostingPaymentProof.filter({ admin_email: adminEmail, status: 'vérifié' }, '-verified_date', 1),
    enabled: !!adminEmail,
  });
  
  const activePlan = hostingProofs.length > 0 ? hostingProofs[0] : null;
  const daysRemaining = activePlan ? Math.ceil((new Date(activePlan.verified_date).getTime() + (30 * 24 * 60 * 60 * 1000) - Date.now()) / (24 * 60 * 60 * 1000)) : null;
  const showHostingAlert = daysRemaining && daysRemaining <= 90;

  const studentsCompleted = students.filter(student => {
    const studentCourses = courses.filter(c => c.domain === student.domain && c.formation_type === student.formation_type);
    if (studentCourses.length === 0) return false;
    return studentCourses.every(course => allProgress.some(p => p.student_email === student.user_email && p.course_id === course.id && p.passed));
  }).length;

  const stats = [
    { label: 'Étudiants', value: students.length, icon: Users, color: 'from-blue-500 to-indigo-500', pending: students.filter(s => s.status === 'en_attente').length },
    { label: 'Cours', value: courses.length, icon: BookOpen, color: 'from-green-500 to-emerald-500' },
    { label: 'Complétés', value: studentsCompleted, icon: Award, color: 'from-yellow-500 to-amber-500', link: true },
    { label: 'Publications', value: posts.length, icon: Newspaper, color: 'from-purple-500 to-pink-500' },
    { label: 'Documents', value: docs.length, icon: Library, color: 'from-red-500 to-orange-500' },
    { label: 'Questions', value: questions.filter(q => q.status === 'en_attente').length, icon: MessageCircle, color: 'from-cyan-500 to-blue-500' },
  ];

  return (
    <AdminGuard>
      <HostingBanner />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <AdminTopNav />
        <div className="pt-20 px-4 pb-8 max-w-7xl mx-auto">
          
          {/* Alerte hébergement - moins de 90 jours */}
          {showHostingAlert && (
            <Card className="mb-6 border-none shadow-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="w-10 h-10" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">⚠️ Hébergement bientôt expiré</h3>
                    <p className="text-amber-50 mb-3">
                      Votre hébergement expire dans <span className="font-black text-3xl mx-1">{daysRemaining}</span> jours.
                      Renouvelez maintenant pour éviter toute interruption.
                    </p>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex-1 bg-white/20 rounded-full h-4 overflow-hidden">
                        <div 
                          className="bg-white h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(0, (daysRemaining / 90) * 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold whitespace-nowrap">{Math.round((daysRemaining / 90) * 100)}%</span>
                    </div>
                    <a 
                      href="/AdminHosting" 
                      className="inline-block bg-white text-amber-600 px-6 py-2.5 rounded-xl font-bold hover:bg-amber-50 transition-colors shadow-lg"
                    >
                      Renouveler maintenant →
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Tableau de bord</h1>
            <p className="text-gray-500">Vue d'ensemble de votre plateforme EMGJ</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {stats.map((stat, i) => (
              <Card key={i} className="relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`} />
                <CardContent className="p-4 relative">
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon className="w-5 h-5 text-gray-400" />
                    {stat.pending > 0 && (
                      <Badge className="bg-red-500 text-white">{stat.pending}</Badge>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            <Card className="shadow-lg border-none">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Statut des étudiants
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-gray-900">Certifiés</span>
                    </div>
                    <span className="text-2xl font-bold text-green-600">
                      {students.filter(s => s.status === 'certifié').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-gray-900">En attente</span>
                    </div>
                    <span className="text-2xl font-bold text-amber-600">
                      {students.filter(s => s.status === 'en_attente').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-gray-900">Bloqués</span>
                    </div>
                    <span className="text-2xl font-bold text-red-600">
                      {students.filter(s => s.status === 'bloqué').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-none">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                  Engagement des étudiants
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Cours validés</span>
                      <span className="font-bold text-gray-900">{allProgress.filter(p => p.passed).length} / {courses.length * students.length}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2.5 rounded-full transition-all" 
                        style={{ width: `${Math.min(100, (allProgress.filter(p => p.passed).length / Math.max(1, courses.length * students.length)) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Étudiants actifs</span>
                      <span className="font-bold text-gray-900">{students.filter(s => s.status === 'certifié').length}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-2.5 rounded-full transition-all" 
                        style={{ width: `${Math.min(100, (students.filter(s => s.status === 'certifié').length / Math.max(1, students.length)) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Taux de complétion</span>
                      <span className="font-bold text-gray-900">{studentsCompleted} / {students.length}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 rounded-full transition-all" 
                        style={{ width: `${Math.min(100, (studentsCompleted / Math.max(1, students.length)) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-lg border-none">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-600" />
                Activités récentes
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              {activities.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">Aucune activité récente</p>
              ) : (
                <div className="space-y-2">
                  {activities.map(activity => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {activity.created_date && format(new Date(activity.created_date), "d MMM 'à' HH:mm", { locale: fr })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <NotificationService userEmail={adminEmail} enabled={!!adminEmail} />
      </div>
    </AdminGuard>
  );
}