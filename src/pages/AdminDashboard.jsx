import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Users, Clock, XCircle, BookOpen, Newspaper, Library, Radio, CreditCard, TrendingUp, Loader2, DollarSign, AlertCircle, Activity, ChevronRight, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AdminTopNav from '../components/admin/AdminTopNav';
import AdminGuard from '../components/admin/AdminGuard';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import PublicChat from '../components/PublicChat';

export default function AdminDashboard() {
  const { data: students = [], isLoading: sLoading } = useQuery({ queryKey: ['adminStudents'], queryFn: () => base44.entities.Student.list('-created_date', 500) });
  const { data: courses = [] } = useQuery({ queryKey: ['adminCourses'], queryFn: () => base44.entities.Course.list() });
  const { data: posts = [] } = useQuery({ queryKey: ['adminPosts'], queryFn: () => base44.entities.BlogPost.list('-created_date', 10) });
  const { data: tuitions = [] } = useQuery({ queryKey: ['adminTuitions'], queryFn: () => base44.entities.Tuition.list('-created_date', 100) });
  const { data: paymentProofs = [] } = useQuery({ queryKey: ['paymentProofs'], queryFn: () => base44.entities.PaymentProof.list('-created_date', 50) });
  const { data: activities = [] } = useQuery({ queryKey: ['recentActivities'], queryFn: () => base44.entities.RecentActivity.list('-created_date', 5) });

  const certified = students.filter(s => s.status === 'certifié').length;
  const pending = students.filter(s => s.status === 'en_attente').length;
  const rejected = students.filter(s => s.status === 'rejeté').length;

  // Tuition stats
  const totalRevenue = tuitions.filter(t => t.status === 'payé').reduce((sum, t) => sum + (t.amount || 0), 0);
  const pendingPayments = tuitions.filter(t => t.status === 'en_attente').length;
  const receivedPayments = tuitions.filter(t => t.status === 'payé').length;

  // Mock course tracking data
  const courseTrackingData = [
    { day: 'Lun', students: 45 },
    { day: 'Mar', students: 52 },
    { day: 'Mer', students: 49 },
    { day: 'Jeu', students: 63 },
    { day: 'Ven', students: 58 },
    { day: 'Sam', students: 71 },
    { day: 'Dim', students: 35 },
  ];

  const stats = [
    { label: 'Total étudiants', value: students.length, icon: Users, color: 'from-blue-500 to-blue-600', trend: `+${students.filter(s => { const d = new Date(s.created_date); const now = new Date(); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }).length} ce mois`, trendUp: true },
    { label: 'Certifiés', value: certified, icon: TrendingUp, color: 'from-green-500 to-green-600', trend: `${((certified/students.length)*100).toFixed(0)}%` },
    { label: 'En attente', value: pending, icon: Clock, color: 'from-amber-500 to-amber-600' },
    { label: 'Cours publiés', value: courses.length, icon: BookOpen, color: 'from-indigo-500 to-indigo-600' },
  ];

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
        <AdminTopNav />
        <div className="pt-20 px-4 pb-8 max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Tableau de bord</h1>
            <p className="text-gray-500 mt-1">Vue d'ensemble de votre établissement</p>
          </div>

          {sLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {stats.map((stat, i) => (
                  <Card key={i} className="border-none shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden group">
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
                    <CardContent className="p-6 relative">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                          <stat.icon className="w-6 h-6 text-white" />
                        </div>
                        {stat.trend && (
                          <Badge className={`${stat.trendUp ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600'}`}>
                            {stat.trend}
                          </Badge>
                        )}
                      </div>
                      <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                      <p className="text-sm text-gray-500">{stat.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Tuition Summary */}
                <Card className="border-none shadow-lg lg:col-span-1">
                  <CardHeader className="pb-3 border-b border-gray-100">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-white" />
                      </div>
                      Scolarité
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-5 space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-green-50">
                      <div>
                        <p className="text-sm text-gray-600">Revenus totaux</p>
                        <p className="text-2xl font-bold text-green-700">{totalRevenue.toLocaleString()} XOF</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-green-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-amber-50">
                        <p className="text-xs text-amber-600 mb-1">En attente</p>
                        <p className="text-xl font-bold text-amber-700">{pendingPayments}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-blue-50">
                        <p className="text-xs text-blue-600 mb-1">Reçus</p>
                        <p className="text-xl font-bold text-blue-700">{receivedPayments}</p>
                      </div>
                    </div>
                    {paymentProofs.filter(p => p.status === 'en_attente').length > 0 && (
                      <div className="p-3 rounded-xl bg-red-50 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <p className="text-sm text-red-700">{paymentProofs.filter(p => p.status === 'en_attente').length} preuves à valider</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Course Tracking Graph */}
                <Card className="border-none shadow-lg lg:col-span-2">
                  <CardHeader className="pb-3 border-b border-gray-100">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-white" />
                      </div>
                      Suivi des cours en temps réel
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-5">
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={courseTrackingData}>
                        <defs>
                          <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="day" stroke="#6b7280" style={{ fontSize: '12px' }} />
                        <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                          labelStyle={{ color: '#374151', fontWeight: 'bold' }}
                        />
                        <Area type="monotone" dataKey="students" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorStudents)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activities */}
                <Card className="border-none shadow-lg">
                  <CardHeader className="pb-3 border-b border-gray-100">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                        <Activity className="w-4 h-4 text-white" />
                      </div>
                      Activités récentes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3">
                    {activities.length === 0 ? (
                      <p className="text-gray-500 text-sm text-center py-6">Aucune activité récente</p>
                    ) : (
                      activities.map((activity, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group cursor-pointer">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            activity.activity_type === 'inscription' ? 'bg-blue-50' :
                            activity.activity_type === 'paiement' ? 'bg-green-50' :
                            activity.activity_type === 'question' ? 'bg-purple-50' :
                            activity.activity_type === 'message_contact' ? 'bg-amber-50' :
                            'bg-indigo-50'
                          }`}>
                            <Activity className={`w-5 h-5 ${
                              activity.activity_type === 'inscription' ? 'text-blue-600' :
                              activity.activity_type === 'paiement' ? 'text-green-600' :
                              activity.activity_type === 'question' ? 'text-purple-600' :
                              activity.activity_type === 'message_contact' ? 'text-amber-600' :
                              'text-indigo-600'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                            {activity.related_user && <p className="text-xs text-gray-500 mt-0.5">{activity.related_user}</p>}
                            <p className="text-xs text-gray-400 mt-1">{activity.created_date && format(new Date(activity.created_date), 'HH:mm', { locale: fr })}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                {/* Recent Students */}
                <Card className="border-none shadow-lg">
                  <CardHeader className="pb-3 border-b border-gray-100">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                          <Users className="w-4 h-4 text-white" />
                        </div>
                        Inscriptions récentes
                      </div>
                      <Link to={createPageUrl('AdminStudents')} className="text-xs text-blue-600 hover:text-blue-700">Voir tout →</Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3">
                    {students.slice(0, 5).map(s => (
                      <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {s.first_name?.[0]}{s.last_name?.[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">{s.first_name} {s.last_name}</p>
                          <p className="text-xs text-gray-500 truncate">{s.domain}</p>
                        </div>
                        <Badge className={`text-xs flex-shrink-0 ${
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
              </div>
            </>
          )}
        </div>
        <PublicChat isAdmin={true} />
      </div>
    </AdminGuard>
  );
}