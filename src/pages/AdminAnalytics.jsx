import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, Award, TrendingUp, Activity, BookOpen, CheckCircle, 
  Globe, Smartphone, Monitor, Eye, MapPin, Calendar, Clock,
  Download, FileText, MessageCircle, DollarSign, Loader2,
  BarChart3, PieChart, LineChart, Filter, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminTopNav from '../components/admin/AdminTopNav';
import AdminGuard from '../components/admin/AdminGuard';
import { format, subDays, startOfDay, endOfDay, subMonths, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function AdminAnalytics() {
  const [dateRange, setDateRange] = useState('30d');
  const [selectedDomain, setSelectedDomain] = useState('all');

  // Fetch data
  const { data: students = [], isLoading: loadingStudents } = useQuery({ 
    queryKey: ['students'], 
    queryFn: () => base44.entities.Student.list('-created_date', 1000) 
  });
  
  const { data: courses = [] } = useQuery({ 
    queryKey: ['courses'], 
    queryFn: () => base44.entities.Course.list() 
  });
  
  const { data: allProgress = [], isLoading: loadingProgress } = useQuery({ 
    queryKey: ['allProgress'], 
    queryFn: () => base44.entities.StudentCourseProgress.list('-created_date', 2000) 
  });
  
  const { data: visitors = [] } = useQuery({ 
    queryKey: ['siteVisitors'], 
    queryFn: () => base44.entities.SiteVisitor.list('-created_date', 1000) 
  });

  const { data: blogPosts = [] } = useQuery({
    queryKey: ['blogPosts'],
    queryFn: () => base44.entities.BlogPost.list('-created_date', 500)
  });

  const { data: courseDocuments = [] } = useQuery({
    queryKey: ['courseDocuments'],
    queryFn: () => base44.entities.CourseDocument.list()
  });

  const { data: purchaseRequests = [] } = useQuery({
    queryKey: ['purchaseRequests'],
    queryFn: () => base44.entities.DocumentPurchaseRequest.list()
  });

  const { data: questions = [] } = useQuery({
    queryKey: ['courseQuestions'],
    queryFn: () => base44.entities.StudentCourseQuestion.list()
  });

  const { data: tuitionProofs = [] } = useQuery({
    queryKey: ['tuitionProofs'],
    queryFn: () => base44.entities.PaymentProof.list()
  });

  const isLoading = loadingStudents || loadingProgress;

  // Date filtering helper
  const getDateRangeFilter = () => {
    const now = new Date();
    switch(dateRange) {
      case '7d': return subDays(now, 7);
      case '30d': return subDays(now, 30);
      case '90d': return subDays(now, 90);
      case '1y': return subDays(now, 365);
      default: return subDays(now, 30);
    }
  };

  // Advanced metrics calculation
  const metrics = useMemo(() => {
    const startDate = getDateRangeFilter();
    
    // Student metrics
    const certifiedStudents = students.filter(s => s.status === 'certifié');
    const pendingStudents = students.filter(s => s.status === 'en_attente');
    const activeStudents = [...new Set(allProgress.map(p => p.student_email))].length;
    const newStudents = students.filter(s => new Date(s.created_date) >= startDate);

    // Course metrics
    const completedCourses = allProgress.filter(p => p.passed);
    const successRate = allProgress.length > 0 
      ? ((completedCourses.length / allProgress.length) * 100).toFixed(1) 
      : 0;
    const avgScore = allProgress.length > 0 
      ? (allProgress.reduce((s, p) => s + (p.score || 0), 0) / allProgress.length).toFixed(1) 
      : 0;
    const totalAttempts = allProgress.reduce((s, p) => s + (p.attempts || 1), 0);

    // Engagement metrics
    const recentVisits = visitors.filter(v => new Date(v.created_date) >= startDate);
    const avgDailyVisits = recentVisits.length / Math.ceil((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    // Revenue metrics
    const validatedPurchases = purchaseRequests.filter(r => r.status === 'validé');
    const totalRevenue = validatedPurchases.reduce((sum, r) => sum + (r.amount || 0), 0);
    const validatedTuition = tuitionProofs.filter(t => t.status === 'validé');
    const tuitionRevenue = validatedTuition.reduce((sum, t) => sum + (t.amount || 0), 0);

    // Content metrics
    const publishedPosts = blogPosts.filter(p => p.status === 'publié');
    const answeredQuestions = questions.filter(q => q.status === 'répondue');
    const questionResponseRate = questions.length > 0 
      ? ((answeredQuestions.length / questions.length) * 100).toFixed(0) 
      : 0;

    return {
      students: {
        total: students.length,
        certified: certifiedStudents.length,
        pending: pendingStudents.length,
        active: activeStudents,
        new: newStudents.length,
        certificationRate: students.length > 0 ? ((certifiedStudents.length / students.length) * 100).toFixed(1) : 0
      },
      courses: {
        total: courses.length,
        completed: completedCourses.length,
        successRate,
        avgScore,
        totalAttempts,
        avgAttemptsPerExam: allProgress.length > 0 ? (totalAttempts / allProgress.length).toFixed(1) : 0
      },
      engagement: {
        totalVisits: visitors.length,
        recentVisits: recentVisits.length,
        avgDailyVisits: avgDailyVisits.toFixed(1),
        uniqueCountries: [...new Set(visitors.map(v => v.country))].length
      },
      revenue: {
        totalDocuments: totalRevenue,
        totalTuition: tuitionRevenue,
        total: totalRevenue + tuitionRevenue,
        documentsSold: validatedPurchases.length,
        tuitionPaid: validatedTuition.length
      },
      content: {
        posts: publishedPosts.length,
        documents: courseDocuments.length,
        questions: questions.length,
        questionsAnswered: answeredQuestions.length,
        responseRate: questionResponseRate
      }
    };
  }, [students, courses, allProgress, visitors, blogPosts, courseDocuments, purchaseRequests, questions, tuitionProofs, dateRange]);

  // Domain distribution
  const domainDistribution = useMemo(() => {
    const dist = students.reduce((acc, s) => {
      const domain = s.domain || 'Non défini';
      if (!acc[domain]) acc[domain] = { total: 0, certified: 0, active: 0 };
      acc[domain].total++;
      if (s.status === 'certifié') acc[domain].certified++;
      return acc;
    }, {});

    const activeByDomain = allProgress.reduce((acc, p) => {
      const student = students.find(s => s.user_email === p.student_email);
      if (student) {
        const domain = student.domain || 'Non défini';
        if (!acc[domain]) acc[domain] = new Set();
        acc[domain].add(p.student_email);
      }
      return acc;
    }, {});

    Object.keys(dist).forEach(domain => {
      dist[domain].active = activeByDomain[domain]?.size || 0;
    });

    return Object.entries(dist).sort((a, b) => b[1].total - a[1].total);
  }, [students, allProgress]);

  // Formation distribution
  const formationDistribution = useMemo(() => {
    const dist = students.reduce((acc, s) => {
      const formation = s.formation_type || 'Non défini';
      if (!acc[formation]) acc[formation] = { total: 0, certified: 0 };
      acc[formation].total++;
      if (s.status === 'certifié') acc[formation].certified++;
      return acc;
    }, {});
    return Object.entries(dist).sort((a, b) => b[1].total - a[1].total);
  }, [students]);

  // Geographic distribution
  const geographicDistribution = useMemo(() => {
    const dist = students.reduce((acc, s) => {
      const country = s.country || 'Non défini';
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(dist).sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [students]);

  // Time-based analytics (last 30 days)
  const timeAnalytics = useMemo(() => {
    const days = 30;
    const signups = Array.from({ length: days }, (_, i) => {
      const date = subDays(new Date(), days - 1 - i);
      const count = students.filter(s => {
        const created = new Date(s.created_date);
        return created.toDateString() === date.toDateString();
      }).length;
      return { date: format(date, 'dd/MM'), count };
    });

    const visits = Array.from({ length: days }, (_, i) => {
      const date = subDays(new Date(), days - 1 - i);
      const count = visitors.filter(v => {
        const created = new Date(v.created_date);
        return created.toDateString() === date.toDateString();
      }).length;
      return { date: format(date, 'dd/MM'), count };
    });

    return { signups, visits };
  }, [students, visitors]);

  // Course completion funnel
  const completionFunnel = useMemo(() => {
    const totalStudents = students.filter(s => s.status === 'certifié').length;
    const studentsWithProgress = [...new Set(allProgress.map(p => p.student_email))].length;
    const studentsWithCompletion = [...new Set(allProgress.filter(p => p.passed).map(p => p.student_email))].length;
    
    return [
      { stage: 'Étudiants certifiés', count: totalStudents, percent: 100 },
      { stage: 'Ont commencé un cours', count: studentsWithProgress, percent: totalStudents > 0 ? (studentsWithProgress / totalStudents * 100).toFixed(0) : 0 },
      { stage: 'Ont validé ≥1 cours', count: studentsWithCompletion, percent: totalStudents > 0 ? (studentsWithCompletion / totalStudents * 100).toFixed(0) : 0 }
    ];
  }, [students, allProgress]);

  if (isLoading) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-gray-50">
          <AdminTopNav />
          <div className="pt-20 flex items-center justify-center h-[60vh]">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        <AdminTopNav />
        <div className="pt-20 px-4 pb-12 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-black text-gray-900 mb-2">Tableau analytique avancé</h1>
              <p className="text-gray-600 text-sm">Analyse complète et indicateurs de performance en temps réel</p>
            </div>
            <div className="flex gap-2">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium"
              >
                <option value="7d">7 derniers jours</option>
                <option value="30d">30 derniers jours</option>
                <option value="90d">90 derniers jours</option>
                <option value="1y">1 an</option>
              </select>
            </div>
          </div>

          {/* KPIs principaux */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="border-none shadow-lg bg-gradient-to-br from-blue-500 to-blue-700 text-white">
              <CardContent className="pt-5 pb-4">
                <Users className="w-8 h-8 text-blue-200 mb-2" />
                <p className="text-3xl font-bold">{metrics.students.total}</p>
                <p className="text-blue-100 text-sm">Étudiants inscrits</p>
                <div className="flex gap-2 mt-2">
                  <Badge className="bg-white/20 text-white text-xs">{metrics.students.certified} certifiés</Badge>
                  <Badge className="bg-white/20 text-white text-xs">{metrics.students.active} actifs</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white">
              <CardContent className="pt-5 pb-4">
                <Award className="w-8 h-8 text-green-200 mb-2" />
                <p className="text-3xl font-bold">{metrics.courses.completed}</p>
                <p className="text-green-100 text-sm">Cours validés</p>
                <p className="text-green-200 text-xs mt-2">Taux de réussite: {metrics.courses.successRate}%</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
              <CardContent className="pt-5 pb-4">
                <Eye className="w-8 h-8 text-purple-200 mb-2" />
                <p className="text-3xl font-bold">{metrics.engagement.totalVisits}</p>
                <p className="text-purple-100 text-sm">Visites totales</p>
                <p className="text-purple-200 text-xs mt-2">{metrics.engagement.avgDailyVisits}/jour en moyenne</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-gradient-to-br from-orange-500 to-red-500 text-white">
              <CardContent className="pt-5 pb-4">
                <DollarSign className="w-8 h-8 text-orange-200 mb-2" />
                <p className="text-3xl font-bold">{metrics.revenue.total.toLocaleString()}</p>
                <p className="text-orange-100 text-sm">Revenus (XOF)</p>
                <div className="flex gap-2 mt-2">
                  <Badge className="bg-white/20 text-white text-xs">Docs: {metrics.revenue.documentsSold}</Badge>
                  <Badge className="bg-white/20 text-white text-xs">Scol: {metrics.revenue.tuitionPaid}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-white border border-gray-100 shadow-sm rounded-xl p-1">
              <TabsTrigger value="overview" className="rounded-lg">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="students" className="rounded-lg">Étudiants</TabsTrigger>
              <TabsTrigger value="courses" className="rounded-lg">Cours</TabsTrigger>
              <TabsTrigger value="engagement" className="rounded-lg">Engagement</TabsTrigger>
              <TabsTrigger value="revenue" className="rounded-lg">Revenus</TabsTrigger>
            </TabsList>

            {/* Vue d'ensemble */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Évolution inscriptions */}
                <Card className="border-none shadow-lg">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <LineChart className="w-5 h-5 text-blue-600" />
                      Inscriptions - 30 derniers jours
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-5">
                    <div className="flex items-end gap-1 h-32 overflow-x-auto">
                      {timeAnalytics.signups.map((item, i) => {
                        const max = Math.max(...timeAnalytics.signups.map(s => s.count), 1);
                        return (
                          <div key={i} className="flex-1 min-w-[12px] flex flex-col items-center gap-1">
                            {item.count > 0 && <span className="text-[9px] font-bold text-gray-600">{item.count}</span>}
                            <div
                              className="w-full rounded-t-md"
                              style={{
                                height: `${(item.count / max) * 100}px`,
                                minHeight: item.count > 0 ? '4px' : '2px',
                                background: item.count > 0 ? 'linear-gradient(to top, #3b82f6, #60a5fa)' : '#e5e7eb'
                              }}
                            />
                            {i % 5 === 0 && <span className="text-[8px] text-gray-400">{item.date}</span>}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Évolution trafic */}
                <Card className="border-none shadow-lg">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-cyan-600" />
                      Visites - 30 derniers jours
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-5">
                    <div className="flex items-end gap-1 h-32 overflow-x-auto">
                      {timeAnalytics.visits.map((item, i) => {
                        const max = Math.max(...timeAnalytics.visits.map(v => v.count), 1);
                        return (
                          <div key={i} className="flex-1 min-w-[12px] flex flex-col items-center gap-1">
                            {item.count > 0 && <span className="text-[9px] font-bold text-gray-600">{item.count}</span>}
                            <div
                              className="w-full rounded-t-md"
                              style={{
                                height: `${(item.count / max) * 100}px`,
                                minHeight: item.count > 0 ? '4px' : '2px',
                                background: item.count > 0 ? 'linear-gradient(to top, #06b6d4, #22d3ee)' : '#e5e7eb'
                              }}
                            />
                            {i % 5 === 0 && <span className="text-[8px] text-gray-400">{item.date}</span>}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Funnel de conversion */}
              <Card className="border-none shadow-lg">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                    Tunnel de conversion des étudiants
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-5">
                  <div className="space-y-4">
                    {completionFunnel.map((stage, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-medium text-gray-900">{stage.stage}</span>
                          <span className="text-gray-600">{stage.count} étudiants ({stage.percent}%)</span>
                        </div>
                        <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                          <div
                            className="h-full flex items-center justify-center text-white text-xs font-bold"
                            style={{
                              width: `${stage.percent}%`,
                              background: `linear-gradient(to right, ${['#3b82f6', '#8b5cf6', '#10b981'][i]}, ${['#60a5fa', '#a78bfa', '#34d399'][i]})`
                            }}
                          >
                            {stage.percent}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Étudiants */}
            <TabsContent value="students" className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border border-gray-200">
                  <CardContent className="pt-4 pb-4">
                    <p className="text-2xl font-bold text-gray-900">{metrics.students.total}</p>
                    <p className="text-sm text-gray-600">Total</p>
                  </CardContent>
                </Card>
                <Card className="border border-green-200 bg-green-50">
                  <CardContent className="pt-4 pb-4">
                    <p className="text-2xl font-bold text-green-700">{metrics.students.certified}</p>
                    <p className="text-sm text-green-600">Certifiés</p>
                  </CardContent>
                </Card>
                <Card className="border border-amber-200 bg-amber-50">
                  <CardContent className="pt-4 pb-4">
                    <p className="text-2xl font-bold text-amber-700">{metrics.students.pending}</p>
                    <p className="text-sm text-amber-600">En attente</p>
                  </CardContent>
                </Card>
                <Card className="border border-blue-200 bg-blue-50">
                  <CardContent className="pt-4 pb-4">
                    <p className="text-2xl font-bold text-blue-700">{metrics.students.active}</p>
                    <p className="text-sm text-blue-600">Actifs</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Par domaine */}
                <Card className="border-none shadow-lg">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      Répartition par domaine
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-5 space-y-3">
                    {domainDistribution.map(([domain, stats]) => (
                      <div key={domain} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-gray-900 text-xs">{domain}</span>
                          <div className="flex gap-1">
                            <Badge className="bg-blue-50 text-blue-700 text-xs">{stats.total}</Badge>
                            <Badge className="bg-green-50 text-green-700 text-xs">{stats.certified} cert.</Badge>
                            <Badge className="bg-purple-50 text-purple-700 text-xs">{stats.active} actifs</Badge>
                          </div>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                            style={{ width: `${(stats.total / metrics.students.total) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Par formation */}
                <Card className="border-none shadow-lg">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Award className="w-5 h-5 text-indigo-600" />
                      Répartition par formation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-5 space-y-3">
                    {formationDistribution.map(([formation, stats]) => (
                      <div key={formation} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-gray-900 text-xs">{formation}</span>
                          <div className="flex gap-1">
                            <Badge className="bg-indigo-50 text-indigo-700 text-xs">{stats.total}</Badge>
                            <Badge className="bg-green-50 text-green-700 text-xs">{stats.certified} cert.</Badge>
                          </div>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600"
                            style={{ width: `${(stats.certified / Math.max(stats.total, 1)) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Géographie */}
                <Card className="border-none shadow-lg lg:col-span-2">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Globe className="w-5 h-5 text-green-600" />
                      Top 10 pays
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-5">
                    <div className="grid grid-cols-2 gap-4">
                      {geographicDistribution.map(([country, count], i) => (
                        <div key={country} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                            {i + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-gray-900 text-sm">{country}</p>
                            <p className="text-xs text-gray-500">{count} étudiant{count > 1 ? 's' : ''} ({((count / metrics.students.total) * 100).toFixed(0)}%)</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Onglet Cours */}
            <TabsContent value="courses" className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border border-gray-200">
                  <CardContent className="pt-4 pb-4">
                    <p className="text-2xl font-bold text-gray-900">{metrics.courses.total}</p>
                    <p className="text-sm text-gray-600">Cours disponibles</p>
                  </CardContent>
                </Card>
                <Card className="border border-green-200 bg-green-50">
                  <CardContent className="pt-4 pb-4">
                    <p className="text-2xl font-bold text-green-700">{metrics.courses.completed}</p>
                    <p className="text-sm text-green-600">Validations</p>
                  </CardContent>
                </Card>
                <Card className="border border-purple-200 bg-purple-50">
                  <CardContent className="pt-4 pb-4">
                    <p className="text-2xl font-bold text-purple-700">{metrics.courses.successRate}%</p>
                    <p className="text-sm text-purple-600">Taux de réussite</p>
                  </CardContent>
                </Card>
                <Card className="border border-blue-200 bg-blue-50">
                  <CardContent className="pt-4 pb-4">
                    <p className="text-2xl font-bold text-blue-700">{metrics.courses.avgScore}/20</p>
                    <p className="text-sm text-blue-600">Moyenne générale</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-none shadow-lg">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Activity className="w-5 h-5 text-orange-600" />
                      Statistiques d'examens
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-5 space-y-4">
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                      <p className="text-sm text-gray-600 mb-1">Total tentatives</p>
                      <p className="text-3xl font-bold text-blue-600">{metrics.courses.totalAttempts}</p>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                      <p className="text-sm text-gray-600 mb-1">Moyenne tentatives/examen</p>
                      <p className="text-3xl font-bold text-purple-600">{metrics.courses.avgAttemptsPerExam}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-lg">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-green-600" />
                      Support pédagogique
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-5 space-y-4">
                    <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                      <p className="text-sm text-gray-600 mb-1">Questions posées</p>
                      <p className="text-3xl font-bold text-green-600">{metrics.content.questions}</p>
                    </div>
                    <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                      <p className="text-sm text-gray-600 mb-1">Taux de réponse</p>
                      <p className="text-3xl font-bold text-indigo-600">{metrics.content.responseRate}%</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Onglet Engagement */}
            <TabsContent value="engagement" className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border border-gray-200">
                  <CardContent className="pt-4 pb-4">
                    <Eye className="w-6 h-6 text-cyan-600 mb-1" />
                    <p className="text-2xl font-bold text-gray-900">{metrics.engagement.totalVisits}</p>
                    <p className="text-sm text-gray-600">Visites totales</p>
                  </CardContent>
                </Card>
                <Card className="border border-blue-200 bg-blue-50">
                  <CardContent className="pt-4 pb-4">
                    <TrendingUp className="w-6 h-6 text-blue-600 mb-1" />
                    <p className="text-2xl font-bold text-blue-700">{metrics.engagement.avgDailyVisits}</p>
                    <p className="text-sm text-blue-600">Visites/jour</p>
                  </CardContent>
                </Card>
                <Card className="border border-purple-200 bg-purple-50">
                  <CardContent className="pt-4 pb-4">
                    <Globe className="w-6 h-6 text-purple-600 mb-1" />
                    <p className="text-2xl font-bold text-purple-700">{metrics.engagement.uniqueCountries}</p>
                    <p className="text-sm text-purple-600">Pays uniques</p>
                  </CardContent>
                </Card>
                <Card className="border border-green-200 bg-green-50">
                  <CardContent className="pt-4 pb-4">
                    <FileText className="w-6 h-6 text-green-600 mb-1" />
                    <p className="text-2xl font-bold text-green-700">{metrics.content.posts}</p>
                    <p className="text-sm text-green-600">Articles publiés</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Onglet Revenus */}
            <TabsContent value="revenue" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-none shadow-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                  <CardContent className="pt-5 pb-4">
                    <DollarSign className="w-8 h-8 text-green-200 mb-2" />
                    <p className="text-3xl font-bold">{metrics.revenue.total.toLocaleString()} XOF</p>
                    <p className="text-green-100 text-sm">Revenus totaux</p>
                  </CardContent>
                </Card>
                <Card className="border border-blue-200 bg-blue-50">
                  <CardContent className="pt-5 pb-4">
                    <FileText className="w-8 h-8 text-blue-600 mb-2" />
                    <p className="text-3xl font-bold text-blue-700">{metrics.revenue.totalDocuments.toLocaleString()}</p>
                    <p className="text-sm text-blue-600">Vente de documents</p>
                    <Badge className="bg-blue-100 text-blue-700 mt-2">{metrics.revenue.documentsSold} ventes</Badge>
                  </CardContent>
                </Card>
                <Card className="border border-purple-200 bg-purple-50">
                  <CardContent className="pt-5 pb-4">
                    <Award className="w-8 h-8 text-purple-600 mb-2" />
                    <p className="text-3xl font-bold text-purple-700">{metrics.revenue.totalTuition.toLocaleString()}</p>
                    <p className="text-sm text-purple-600">Frais de scolarité</p>
                    <Badge className="bg-purple-100 text-purple-700 mt-2">{metrics.revenue.tuitionPaid} paiements</Badge>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminGuard>
  );
}