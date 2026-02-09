import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Users, BookOpen, Newspaper, Library, Radio, MessageCircle, TrendingUp, Clock, CheckCircle, AlertCircle, Loader2, Award, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import AdminTopNav from '../components/admin/AdminTopNav';
import AdminGuard from '../components/admin/AdminGuard';
import NotificationService from '../components/NotificationService';

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
  const { data: posts = [] } = useQuery({ queryKey: ['posts'], queryFn: () => base44.entities.BlogPost.list() });
  const { data: docs = [] } = useQuery({ queryKey: ['docs'], queryFn: () => base44.entities.LibraryDocument.list() });
  const { data: conferences = [] } = useQuery({ queryKey: ['conferences'], queryFn: () => base44.entities.Conference.list() });
  const { data: questions = [] } = useQuery({ queryKey: ['questions'], queryFn: () => base44.entities.CourseQuestion.list() });
  const { data: activities = [] } = useQuery({ queryKey: ['activities'], queryFn: () => base44.entities.RecentActivity.list('-created_date', 10) });

  const stats = [
    { label: 'Étudiants', value: students.length, icon: Users, color: 'from-blue-500 to-indigo-500', pending: students.filter(s => s.status === 'en_attente').length },
    { label: 'Cours', value: courses.length, icon: BookOpen, color: 'from-green-500 to-emerald-500' },
    { label: 'Publications', value: posts.length, icon: Newspaper, color: 'from-purple-500 to-pink-500' },
    { label: 'Documents', value: docs.length, icon: Library, color: 'from-red-500 to-orange-500' },
    { label: 'Conférences', value: conferences.length, icon: Radio, color: 'from-amber-500 to-yellow-500' },
    { label: 'Questions', value: questions.filter(q => q.status === 'en_attente').length, icon: MessageCircle, color: 'from-cyan-500 to-blue-500' },
  ];

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <AdminTopNav />
        <div className="pt-20 px-4 pb-8 max-w-7xl mx-auto">
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

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Activités récentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activities.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-8">Aucune activité récente</p>
                ) : (
                  <div className="space-y-2">
                    {activities.map(activity => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
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

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Statut des étudiants
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-gray-900">Certifiés</span>
                    </div>
                    <span className="text-lg font-bold text-green-700">
                      {students.filter(s => s.status === 'certifié').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-amber-600" />
                      <span className="text-sm font-medium text-gray-900">En attente</span>
                    </div>
                    <span className="text-lg font-bold text-amber-700">
                      {students.filter(s => s.status === 'en_attente').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <span className="text-sm font-medium text-gray-900">Bloqués</span>
                    </div>
                    <span className="text-lg font-bold text-red-700">
                      {students.filter(s => s.status === 'bloqué').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <NotificationService userEmail={adminEmail} enabled={!!adminEmail} />
      </div>
    </AdminGuard>
  );
}