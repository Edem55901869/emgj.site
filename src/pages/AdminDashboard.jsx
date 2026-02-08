import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Users, Clock, XCircle, BookOpen, Newspaper, Library, Radio, CreditCard, TrendingUp, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import AdminTopNav from '../components/admin/AdminTopNav';
import AdminGuard from '../components/admin/AdminGuard';

export default function AdminDashboard() {
  const { data: students = [], isLoading: sLoading } = useQuery({ queryKey: ['adminStudents'], queryFn: () => base44.entities.Student.list('-created_date', 500) });
  const { data: courses = [] } = useQuery({ queryKey: ['adminCourses'], queryFn: () => base44.entities.Course.list() });
  const { data: posts = [] } = useQuery({ queryKey: ['adminPosts'], queryFn: () => base44.entities.BlogPost.list('-created_date', 10) });
  const { data: tuitions = [] } = useQuery({ queryKey: ['adminTuitions'], queryFn: () => base44.entities.Tuition.list('-created_date', 50) });

  const certified = students.filter(s => s.status === 'certifié').length;
  const pending = students.filter(s => s.status === 'en_attente').length;
  const rejected = students.filter(s => s.status === 'rejeté').length;

  const stats = [
    { label: 'Total étudiants', value: students.length, icon: Users, color: 'blue', trend: `+${students.filter(s => { const d = new Date(s.created_date); const now = new Date(); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }).length} ce mois` },
    { label: 'Certifiés', value: certified, icon: TrendingUp, color: 'green' },
    { label: 'En attente', value: pending, icon: Clock, color: 'amber' },
    { label: 'Rejetés', value: rejected, icon: XCircle, color: 'red' },
    { label: 'Cours publiés', value: courses.length, icon: BookOpen, color: 'indigo' },
    { label: 'Publications', value: posts.length, icon: Newspaper, color: 'purple' },
  ];

  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        <AdminTopNav />
        <div className="pt-20 px-4 pb-8 max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Tableau de bord</h1>

          {sLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {stats.map((stat, i) => (
                  <Card key={i} className="border-none shadow-sm rounded-2xl">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colorMap[stat.color]}`}>
                          <stat.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                          <p className="text-xs text-gray-500">{stat.label}</p>
                        </div>
                      </div>
                      {stat.trend && <p className="text-xs text-green-600 mt-2 font-medium">{stat.trend}</p>}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent students */}
                <Card className="border-none shadow-sm rounded-2xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Inscriptions récentes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {students.slice(0, 5).map(s => (
                      <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-bold">
                          {s.first_name?.[0]}{s.last_name?.[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">{s.first_name} {s.last_name}</p>
                          <p className="text-xs text-gray-500">{s.domain} • {s.formation_type}</p>
                        </div>
                        <Badge className={`text-xs ${
                          s.status === 'certifié' ? 'bg-green-50 text-green-700 border-green-200' :
                          s.status === 'en_attente' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {s.status}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Tuition summary */}
                <Card className="border-none shadow-sm rounded-2xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Scolarité récente</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {tuitions.length === 0 ? (
                      <p className="text-gray-500 text-sm text-center py-6">Aucune donnée de scolarité</p>
                    ) : (
                      tuitions.slice(0, 5).map(t => (
                        <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                          <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
                            <CreditCard className="w-4 h-4 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate">{t.student_name}</p>
                            <p className="text-xs text-gray-500">{t.period}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900 text-sm">{t.amount} {t.currency || 'XOF'}</p>
                            <Badge className={`text-xs ${
                              t.status === 'payé' ? 'bg-green-50 text-green-700' :
                              t.status === 'en_retard' ? 'bg-red-50 text-red-700' :
                              'bg-amber-50 text-amber-700'
                            }`}>{t.status}</Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </AdminGuard>
  );
}