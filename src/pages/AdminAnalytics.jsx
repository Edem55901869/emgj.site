import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Globe, Smartphone, Monitor, Tablet, Loader2, TrendingUp, Users, Eye, BookOpen, Award, CheckCircle, BarChart2, Activity, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminTopNav from '../components/admin/AdminTopNav';
import AdminGuard from '../components/admin/AdminGuard';

export default function AdminAnalytics() {
  const { data: students = [], isLoading: loadingStudents } = useQuery({ queryKey: ['students'], queryFn: () => base44.entities.Student.list('-created_date', 500) });
  const { data: courses = [] } = useQuery({ queryKey: ['courses'], queryFn: () => base44.entities.Course.list() });
  const { data: allProgress = [], isLoading: loadingProgress } = useQuery({ queryKey: ['allProgress'], queryFn: () => base44.entities.StudentCourseProgress.list() });
  const { data: visitors = [] } = useQuery({ queryKey: ['siteVisitors'], queryFn: () => base44.entities.SiteVisitor.list('-created_date', 500) });

  const isLoading = loadingStudents || loadingProgress;

  // Étudiants actifs = qui ont au moins 1 progression
  const activeStudentEmails = new Set(allProgress.map(p => p.student_email));
  const activeStudentsCount = students.filter(s => activeStudentEmails.has(s.user_email)).length;

  // Cours validés (passed=true) par des étudiants ENCORE présents sur la plateforme
  const activeStudentEmailsSet = new Set(students.map(s => s.user_email));
  const validatedByActiveStudents = allProgress.filter(p => p.passed && activeStudentEmailsSet.has(p.student_email));

  // Taux de réussite
  const successRate = allProgress.length > 0 ? ((allProgress.filter(p => p.passed).length / allProgress.length) * 100).toFixed(1) : 0;
  
  // Moyenne générale
  const avgScore = allProgress.length > 0 ? (allProgress.reduce((s, p) => s + (p.score || 0), 0) / allProgress.length).toFixed(1) : 0;

  // Stats par domaine
  const domainStats = courses.reduce((acc, course) => {
    if (!acc[course.domain]) acc[course.domain] = { courses: 0, validated: 0 };
    acc[course.domain].courses++;
    acc[course.domain].validated += validatedByActiveStudents.filter(p => p.course_id === course.id).length;
    return acc;
  }, {});

  // Stats par formation
  const formationStats = students.reduce((acc, s) => {
    const key = s.formation_type;
    if (!key) return acc;
    if (!acc[key]) acc[key] = { total: 0, certified: 0 };
    acc[key].total++;
    if (s.status === 'certifié') acc[key].certified++;
    return acc;
  }, {});

  // Stats pays
  const countryStats = students.reduce((acc, s) => {
    const c = s.country || 'Non renseigné';
    acc[c] = (acc[c] || 0) + 1;
    return acc;
  }, {});
  const topCountries = Object.entries(countryStats).sort((a, b) => b[1] - a[1]).slice(0, 8);

  // Visiteurs stats
  const deviceStats = visitors.reduce((acc, v) => {
    acc[v.device_type] = (acc[v.device_type] || 0) + 1;
    return acc;
  }, {});
  const visitorCountryStats = visitors.reduce((acc, v) => {
    acc[v.country] = (acc[v.country] || 0) + 1;
    return acc;
  }, {});
  const topVisitorCountries = Object.entries(visitorCountryStats).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Inscriptions par mois (6 derniers mois)
  const now = new Date();
  const monthlySignups = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const label = d.toLocaleString('fr', { month: 'short', year: '2-digit' });
    const count = students.filter(s => {
      const sd = new Date(s.created_date);
      return sd.getMonth() === d.getMonth() && sd.getFullYear() === d.getFullYear();
    }).length;
    return { label, count };
  });
  const maxMonthly = Math.max(1, ...monthlySignups.map(m => m.count));

  const deviceIcons = { mobile: Smartphone, desktop: Monitor, tablet: Tablet };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <AdminTopNav />
        <div className="pt-20 px-4 pb-8 max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Analytique & Statistiques</h1>
            <p className="text-gray-600 mt-1">Vue d'ensemble de la plateforme en temps réel</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
          ) : (
            <>
              {/* KPIs principaux */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Card className="border-none shadow-lg bg-gradient-to-br from-blue-500 to-blue-700 text-white">
                  <CardContent className="pt-5 pb-4">
                    <Users className="w-8 h-8 text-blue-200 mb-2" />
                    <p className="text-3xl font-bold">{students.length}</p>
                    <p className="text-blue-100 text-sm">Étudiants inscrits</p>
                    <p className="text-blue-200 text-xs mt-1">{students.filter(s => s.status === 'certifié').length} certifiés</p>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                  <CardContent className="pt-5 pb-4">
                    <Award className="w-8 h-8 text-green-200 mb-2" />
                    <p className="text-3xl font-bold">{validatedByActiveStudents.length}</p>
                    <p className="text-green-100 text-sm">Cours validés</p>
                    <p className="text-green-200 text-xs mt-1">Par étudiants actifs</p>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-lg bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
                  <CardContent className="pt-5 pb-4">
                    <TrendingUp className="w-8 h-8 text-purple-200 mb-2" />
                    <p className="text-3xl font-bold">{successRate}%</p>
                    <p className="text-purple-100 text-sm">Taux de réussite</p>
                    <p className="text-purple-200 text-xs mt-1">Moyenne : {avgScore}/20</p>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-lg bg-gradient-to-br from-orange-500 to-red-500 text-white">
                  <CardContent className="pt-5 pb-4">
                    <Activity className="w-8 h-8 text-orange-200 mb-2" />
                    <p className="text-3xl font-bold">{activeStudentsCount}</p>
                    <p className="text-orange-100 text-sm">Étudiants actifs</p>
                    <p className="text-orange-200 text-xs mt-1">Ont suivi ≥1 cours</p>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="students" className="space-y-6">
                <TabsList className="bg-white border border-gray-100 shadow-sm rounded-xl p-1">
                  <TabsTrigger value="students" className="rounded-lg">Étudiants</TabsTrigger>
                  <TabsTrigger value="courses" className="rounded-lg">Cours</TabsTrigger>
                  <TabsTrigger value="traffic" className="rounded-lg">Trafic</TabsTrigger>
                </TabsList>

                <TabsContent value="students" className="space-y-6">
                  {/* Inscriptions par mois */}
                  <Card className="border-none shadow-lg">
                    <CardHeader className="border-b border-gray-100">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart2 className="w-5 h-5 text-blue-600" />
                        Inscriptions — 6 derniers mois
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-5">
                      <div className="flex items-end gap-2 h-32">
                        {monthlySignups.map((m, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <span className="text-xs font-bold text-gray-700">{m.count}</span>
                            <div
                              className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all"
                              style={{ height: `${(m.count / maxMonthly) * 96}px`, minHeight: m.count > 0 ? '8px' : '2px' }}
                            />
                            <span className="text-xs text-gray-500">{m.label}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Pays */}
                    <Card className="border-none shadow-lg">
                      <CardHeader className="border-b border-gray-100">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Globe className="w-5 h-5 text-blue-600" />
                          Pays des étudiants
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-5 space-y-3">
                        {topCountries.map(([country, count]) => (
                          <div key={country} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium text-gray-900">{country}</span>
                              <span className="text-gray-500">{count} étudiant{count > 1 ? 's' : ''}</span>
                            </div>
                            <Progress value={(count / students.length) * 100} className="h-2" />
                          </div>
                        ))}
                        {topCountries.length === 0 && <p className="text-gray-400 text-center py-4">Aucune donnée</p>}
                      </CardContent>
                    </Card>

                    {/* Par formation */}
                    <Card className="border-none shadow-lg">
                      <CardHeader className="border-b border-gray-100">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-indigo-600" />
                          Répartition par formation
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-5 space-y-3">
                        {Object.entries(formationStats).sort((a, b) => b[1].total - a[1].total).map(([formation, stat]) => (
                          <div key={formation} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium text-gray-900 text-xs">{formation}</span>
                              <div className="flex gap-2">
                                <Badge className="bg-blue-50 text-blue-700 border-blue-100 text-xs">{stat.total}</Badge>
                                <Badge className="bg-green-50 text-green-700 border-green-100 text-xs">{stat.certified} certifiés</Badge>
                              </div>
                            </div>
                            <Progress value={(stat.certified / Math.max(1, stat.total)) * 100} className="h-2" />
                          </div>
                        ))}
                        {Object.keys(formationStats).length === 0 && <p className="text-gray-400 text-center py-4">Aucune donnée</p>}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="courses" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Cours par domaine */}
                    <Card className="border-none shadow-lg">
                      <CardHeader className="border-b border-gray-100">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-green-600" />
                          Cours validés par domaine
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-5 space-y-3">
                        {Object.entries(domainStats).sort((a, b) => b[1].validated - a[1].validated).map(([domain, stat]) => (
                          <div key={domain} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium text-gray-900 text-xs leading-tight">{domain}</span>
                              <div className="flex gap-1 flex-shrink-0 ml-2">
                                <Badge className="bg-green-50 text-green-700 border-green-100 text-xs">{stat.validated} validés</Badge>
                                <Badge className="bg-gray-50 text-gray-600 border-gray-100 text-xs">{stat.courses} cours</Badge>
                              </div>
                            </div>
                            <Progress value={stat.courses > 0 ? (stat.validated / Math.max(1, stat.courses * activeStudentsCount)) * 100 : 0} className="h-2" />
                          </div>
                        ))}
                        {Object.keys(domainStats).length === 0 && <p className="text-gray-400 text-center py-4">Aucun cours</p>}
                      </CardContent>
                    </Card>

                    {/* Engagement */}
                    <Card className="border-none shadow-lg">
                      <CardHeader className="border-b border-gray-100">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-purple-600" />
                          Performance globale
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-5 space-y-4">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                          <p className="text-sm text-gray-600 mb-1">Total tentatives d'examen</p>
                          <p className="text-3xl font-bold text-blue-600">{allProgress.reduce((s, p) => s + (p.attempts || 1), 0)}</p>
                        </div>
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                          <p className="text-sm text-gray-600 mb-1">Cours réussis (étudiants actifs)</p>
                          <p className="text-3xl font-bold text-green-600">{validatedByActiveStudents.length}</p>
                        </div>
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                          <p className="text-sm text-gray-600 mb-1">Moyenne générale des examens</p>
                          <p className="text-3xl font-bold text-purple-600">{avgScore}/20</p>
                        </div>
                        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100">
                          <p className="text-sm text-gray-600 mb-1">Taux de réussite global</p>
                          <p className="text-3xl font-bold text-orange-600">{successRate}%</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="traffic" className="space-y-6">
                  {visitors.length === 0 ? (
                    <Card className="border-none shadow-lg">
                      <CardContent className="py-16 text-center">
                        <Eye className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">Aucune donnée de trafic disponible</p>
                        <p className="text-gray-400 text-sm mt-2">Les visites seront enregistrées automatiquement</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card className="border-none shadow-lg">
                        <CardHeader className="border-b border-gray-100">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Globe className="w-5 h-5 text-blue-600" />
                            Top pays (visiteurs)
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-5 space-y-3">
                          {topVisitorCountries.map(([country, count]) => (
                            <div key={country} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span className="font-medium text-gray-900">{country || 'Inconnu'}</span>
                                <Badge className="bg-blue-50 text-blue-700 border-blue-100">{count}</Badge>
                              </div>
                              <Progress value={(count / visitors.length) * 100} className="h-2" />
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                      <Card className="border-none shadow-lg">
                        <CardHeader className="border-b border-gray-100">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Smartphone className="w-5 h-5 text-indigo-600" />
                            Appareils utilisés
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-5 space-y-3">
                          {Object.entries(deviceStats).map(([device, count]) => {
                            const Icon = deviceIcons[device] || Monitor;
                            return (
                              <div key={device} className="space-y-1">
                                <div className="flex justify-between text-sm items-center">
                                  <div className="flex items-center gap-2">
                                    <Icon className="w-4 h-4 text-gray-500" />
                                    <span className="font-medium text-gray-900 capitalize">{device}</span>
                                  </div>
                                  <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100">{((count / visitors.length) * 100).toFixed(1)}%</Badge>
                                </div>
                                <Progress value={(count / visitors.length) * 100} className="h-2" />
                              </div>
                            );
                          })}
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>
    </AdminGuard>
  );
}