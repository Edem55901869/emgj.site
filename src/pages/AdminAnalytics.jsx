import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, Award, TrendingUp, Activity, BookOpen, CheckCircle, 
  Globe, Eye, MapPin, Calendar, Clock, Download, FileText, 
  MessageCircle, DollarSign, Loader2, BarChart3, RefreshCw, 
  ArrowUp, ArrowDown, Zap, Target, Star, TrendingDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Legend, Area, AreaChart, RadialBarChart, RadialBar 
} from 'recharts';
import AdminTopNav from '../components/admin/AdminTopNav';
import AdminGuard from '../components/admin/AdminGuard';
import { format, subDays, startOfDay, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#14b8a6'];

export default function AdminAnalytics() {
  const [dateRange, setDateRange] = useState('30d');
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch data with refetch interval
  const { data: students = [], isLoading: loadingStudents, refetch: refetchStudents } = useQuery({ 
    queryKey: ['students', refreshKey], 
    queryFn: () => base44.entities.Student.list('-created_date', 2000),
    refetchInterval: 30000 // Refresh every 30 seconds
  });
  
  const { data: courses = [], refetch: refetchCourses } = useQuery({ 
    queryKey: ['courses', refreshKey], 
    queryFn: () => base44.entities.Course.list(),
    refetchInterval: 30000
  });
  
  const { data: allProgress = [], isLoading: loadingProgress, refetch: refetchProgress } = useQuery({ 
    queryKey: ['allProgress', refreshKey], 
    queryFn: () => base44.entities.StudentCourseProgress.list('-created_date', 5000),
    refetchInterval: 30000
  });
  
  const { data: visitors = [], refetch: refetchVisitors } = useQuery({ 
    queryKey: ['siteVisitors', refreshKey], 
    queryFn: () => base44.entities.SiteVisitor.list('-created_date', 2000),
    refetchInterval: 30000
  });

  const { data: blogPosts = [], refetch: refetchPosts } = useQuery({
    queryKey: ['blogPosts', refreshKey],
    queryFn: () => base44.entities.BlogPost.list('-created_date', 1000),
    refetchInterval: 30000
  });

  const { data: courseDocuments = [], refetch: refetchDocs } = useQuery({
    queryKey: ['courseDocuments', refreshKey],
    queryFn: () => base44.entities.CourseDocument.list(),
    refetchInterval: 30000
  });

  const { data: purchaseRequests = [], refetch: refetchPurchases } = useQuery({
    queryKey: ['purchaseRequests', refreshKey],
    queryFn: () => base44.entities.DocumentPurchaseRequest.list(),
    refetchInterval: 30000
  });

  const { data: questions = [], refetch: refetchQuestions } = useQuery({
    queryKey: ['courseQuestions', refreshKey],
    queryFn: () => base44.entities.StudentCourseQuestion.list(),
    refetchInterval: 30000
  });

  const { data: tuitionProofs = [], refetch: refetchTuition } = useQuery({
    queryKey: ['tuitionProofs', refreshKey],
    queryFn: () => base44.entities.PaymentProof.list(),
    refetchInterval: 30000
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['blogComments', refreshKey],
    queryFn: () => base44.entities.BlogComment.list('-created_date', 1000),
    refetchInterval: 30000
  });

  const { data: likes = [] } = useQuery({
    queryKey: ['blogLikes', refreshKey],
    queryFn: () => base44.entities.BlogLike.list('-created_date', 1000),
    refetchInterval: 30000
  });

  const isLoading = loadingStudents || loadingProgress;

  const handleRefreshAll = () => {
    setRefreshKey(k => k + 1);
    refetchStudents();
    refetchCourses();
    refetchProgress();
    refetchVisitors();
    refetchPosts();
    refetchDocs();
    refetchPurchases();
    refetchQuestions();
    refetchTuition();
  };

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

  const getPreviousDateRange = () => {
    const now = new Date();
    switch(dateRange) {
      case '7d': return { start: subDays(now, 14), end: subDays(now, 7) };
      case '30d': return { start: subDays(now, 60), end: subDays(now, 30) };
      case '90d': return { start: subDays(now, 180), end: subDays(now, 90) };
      case '1y': return { start: subDays(now, 730), end: subDays(now, 365) };
      default: return { start: subDays(now, 60), end: subDays(now, 30) };
    }
  };

  // Advanced real-time metrics
  const metrics = useMemo(() => {
    const startDate = getDateRangeFilter();
    const prevRange = getPreviousDateRange();
    
    // Current period
    const currentVisitors = visitors.filter(v => new Date(v.created_date) >= startDate);
    const currentStudents = students.filter(s => new Date(s.created_date) >= startDate);
    const currentProgress = allProgress.filter(p => new Date(p.created_date) >= startDate);
    
    // Previous period
    const prevVisitors = visitors.filter(v => {
      const d = new Date(v.created_date);
      return d >= prevRange.start && d <= prevRange.end;
    });
    const prevStudents = students.filter(s => {
      const d = new Date(s.created_date);
      return d >= prevRange.start && d <= prevRange.end;
    });
    const prevProgress = allProgress.filter(p => {
      const d = new Date(p.created_date);
      return d >= prevRange.start && d <= prevRange.end;
    });

    // Calculate percentage changes
    const visitorChange = prevVisitors.length > 0 
      ? (((currentVisitors.length - prevVisitors.length) / prevVisitors.length) * 100).toFixed(1)
      : currentVisitors.length > 0 ? 100 : 0;
    
    const studentChange = prevStudents.length > 0
      ? (((currentStudents.length - prevStudents.length) / prevStudents.length) * 100).toFixed(1)
      : currentStudents.length > 0 ? 100 : 0;

    const progressChange = prevProgress.length > 0
      ? (((currentProgress.length - prevProgress.length) / prevProgress.length) * 100).toFixed(1)
      : currentProgress.length > 0 ? 100 : 0;

    // Student metrics
    const certifiedStudents = students.filter(s => s.status === 'certifié');
    const pendingStudents = students.filter(s => s.status === 'en_attente');
    const blockedStudents = students.filter(s => s.status === 'bloqué');
    const activeStudents = [...new Set(allProgress.map(p => p.student_email))].length;

    // Course metrics
    const completedCourses = allProgress.filter(p => p.passed);
    const failedCourses = allProgress.filter(p => !p.passed && p.attempts > 0);
    const successRate = allProgress.length > 0 
      ? ((completedCourses.length / allProgress.length) * 100).toFixed(1) 
      : 0;
    const avgScore = allProgress.length > 0 
      ? (allProgress.reduce((s, p) => s + (p.score || 0), 0) / allProgress.length).toFixed(1) 
      : 0;
    const totalAttempts = allProgress.reduce((s, p) => s + (p.attempts || 0), 0);

    // Engagement metrics
    const uniqueVisitors = [...new Set(visitors.map(v => v.id))].length;
    const uniqueCountries = [...new Set(visitors.map(v => v.country).filter(Boolean))].length;

    // Revenue metrics
    const validatedPurchases = purchaseRequests.filter(r => r.status === 'validé');
    const pendingPurchases = purchaseRequests.filter(r => r.status === 'en_attente');
    const totalDocRevenue = validatedPurchases.reduce((sum, r) => sum + (r.amount || 0), 0);
    const validatedTuition = tuitionProofs.filter(t => t.status === 'validé');
    const pendingTuition = tuitionProofs.filter(t => t.status === 'en_attente');
    const tuitionRevenue = validatedTuition.reduce((sum, t) => sum + (t.amount || 0), 0);

    // Content metrics
    const publishedPosts = blogPosts.filter(p => p.status === 'publié');
    const draftPosts = blogPosts.filter(p => p.status === 'brouillon');
    const answeredQuestions = questions.filter(q => q.status === 'répondue');
    const pendingQuestions = questions.filter(q => q.status === 'en_attente');
    const responseRate = questions.length > 0 
      ? ((answeredQuestions.length / questions.length) * 100).toFixed(1) 
      : 0;

    // Engagement rate
    const totalLikes = likes.length;
    const totalComments = comments.length;
    const engagementRate = publishedPosts.length > 0
      ? (((totalLikes + totalComments) / publishedPosts.length)).toFixed(1)
      : 0;

    return {
      students: {
        total: students.length,
        certified: certifiedStudents.length,
        pending: pendingStudents.length,
        blocked: blockedStudents.length,
        active: activeStudents,
        new: currentStudents.length,
        change: parseFloat(studentChange),
        certificationRate: students.length > 0 ? ((certifiedStudents.length / students.length) * 100).toFixed(1) : 0,
        activeRate: students.length > 0 ? ((activeStudents / students.length) * 100).toFixed(1) : 0
      },
      courses: {
        total: courses.length,
        completed: completedCourses.length,
        failed: failedCourses.length,
        inProgress: allProgress.length - completedCourses.length - failedCourses.length,
        successRate: parseFloat(successRate),
        avgScore: parseFloat(avgScore),
        totalAttempts,
        avgAttemptsPerExam: allProgress.length > 0 ? (totalAttempts / allProgress.length).toFixed(1) : 0,
        change: parseFloat(progressChange)
      },
      engagement: {
        totalVisits: visitors.length,
        currentVisits: currentVisitors.length,
        uniqueVisitors,
        uniqueCountries,
        change: parseFloat(visitorChange),
        likesTotal: totalLikes,
        commentsTotal: totalComments,
        engagementRate: parseFloat(engagementRate)
      },
      revenue: {
        totalDocuments: totalDocRevenue,
        totalTuition: tuitionRevenue,
        total: totalDocRevenue + tuitionRevenue,
        documentsSold: validatedPurchases.length,
        pendingDocs: pendingPurchases.length,
        tuitionPaid: validatedTuition.length,
        pendingTuition: pendingTuition.length
      },
      content: {
        posts: publishedPosts.length,
        drafts: draftPosts.length,
        documents: courseDocuments.length,
        questions: questions.length,
        questionsAnswered: answeredQuestions.length,
        questionsPending: pendingQuestions.length,
        responseRate: parseFloat(responseRate)
      }
    };
  }, [students, courses, allProgress, visitors, blogPosts, courseDocuments, purchaseRequests, questions, tuitionProofs, comments, likes, dateRange]);

  // Time-based chart data
  const timeSeriesData = useMemo(() => {
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : dateRange === '90d' ? 90 : 365;
    const data = Array.from({ length: days }, (_, i) => {
      const date = subDays(new Date(), days - 1 - i);
      const dateStr = format(date, days > 90 ? 'dd/MM' : 'dd MMM', { locale: fr });
      
      const dayVisits = visitors.filter(v => 
        startOfDay(new Date(v.created_date)).getTime() === startOfDay(date).getTime()
      ).length;

      const daySignups = students.filter(s => 
        startOfDay(new Date(s.created_date)).getTime() === startOfDay(date).getTime()
      ).length;

      const dayProgress = allProgress.filter(p => 
        startOfDay(new Date(p.created_date)).getTime() === startOfDay(date).getTime()
      ).length;

      return { 
        date: dateStr, 
        visits: dayVisits,
        signups: daySignups,
        progress: dayProgress
      };
    });

    return data;
  }, [students, visitors, allProgress, dateRange]);

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

    return Object.entries(dist)
      .map(([name, stats]) => ({ 
        name: name.length > 20 ? name.substring(0, 20) + '...' : name, 
        total: stats.total,
        certified: stats.certified,
        active: stats.active
      }))
      .sort((a, b) => b.total - a.total);
  }, [students, allProgress]);

  // Formation distribution
  const formationDistribution = useMemo(() => {
    const dist = students.reduce((acc, s) => {
      const formation = s.formation_type || 'Non défini';
      if (!acc[formation]) acc[formation] = 0;
      acc[formation]++;
      return acc;
    }, {});
    return Object.entries(dist)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [students]);

  // Country distribution
  const countryDistribution = useMemo(() => {
    const dist = students.reduce((acc, s) => {
      const country = s.country || 'Non défini';
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(dist)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [students]);

  // Success rate by domain
  const successByDomain = useMemo(() => {
    const domainStats = {};
    
    allProgress.forEach(p => {
      const student = students.find(s => s.user_email === p.student_email);
      if (student) {
        const domain = student.domain || 'Non défini';
        if (!domainStats[domain]) domainStats[domain] = { total: 0, passed: 0 };
        domainStats[domain].total++;
        if (p.passed) domainStats[domain].passed++;
      }
    });

    return Object.entries(domainStats)
      .map(([domain, stats]) => ({
        domain,
        successRate: stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(1) : 0
      }))
      .sort((a, b) => parseFloat(b.successRate) - parseFloat(a.successRate));
  }, [students, allProgress]);

  if (isLoading) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
          <AdminTopNav />
          <div className="pt-20 flex items-center justify-center h-[60vh]">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Chargement des données analytiques...</p>
            </div>
          </div>
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <AdminTopNav />
        <div className="pt-20 px-4 pb-12 max-w-[1800px] mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Tableau Analytique Avancé
              </h1>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-medium text-gray-600">Données en temps réel</span>
                </div>
                <span className="text-gray-300">•</span>
                <span className="text-sm text-gray-500">Actualisation auto toutes les 30s</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleRefreshAll}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg shadow-blue-500/30"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualiser
              </Button>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 rounded-xl border-2 border-gray-200 bg-white text-sm font-semibold shadow-sm hover:border-blue-300 transition-colors"
              >
                <option value="7d">7 derniers jours</option>
                <option value="30d">30 derniers jours</option>
                <option value="90d">90 derniers jours</option>
                <option value="1y">1 an</option>
              </select>
            </div>
          </div>

          {/* KPIs principaux */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Étudiants */}
            <Card className="border-none shadow-xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
              <CardContent className="pt-6 pb-5 relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                    metrics.students.change >= 0 ? 'bg-green-400/20 text-green-100' : 'bg-red-400/20 text-red-100'
                  }`}>
                    {metrics.students.change >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    {Math.abs(metrics.students.change)}%
                  </div>
                </div>
                <p className="text-4xl font-black mb-2">{metrics.students.total}</p>
                <p className="text-blue-100 text-sm font-medium mb-3">Étudiants inscrits</p>
                <div className="flex gap-2 flex-wrap">
                  <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                    {metrics.students.certified} certifiés
                  </Badge>
                  <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                    {metrics.students.active} actifs
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Cours */}
            <Card className="border-none shadow-xl bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
              <CardContent className="pt-6 pb-5 relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Award className="w-7 h-7 text-white" />
                  </div>
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                    metrics.courses.change >= 0 ? 'bg-green-400/20 text-green-100' : 'bg-red-400/20 text-red-100'
                  }`}>
                    {metrics.courses.change >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    {Math.abs(metrics.courses.change)}%
                  </div>
                </div>
                <p className="text-4xl font-black mb-2">{metrics.courses.completed}</p>
                <p className="text-green-100 text-sm font-medium mb-3">Cours validés</p>
                <div className="flex gap-2 flex-wrap">
                  <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                    {metrics.courses.successRate}% réussite
                  </Badge>
                  <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                    {metrics.courses.avgScore}/20 moy
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Engagement */}
            <Card className="border-none shadow-xl bg-gradient-to-br from-purple-500 via-violet-600 to-indigo-700 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
              <CardContent className="pt-6 pb-5 relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Eye className="w-7 h-7 text-white" />
                  </div>
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                    metrics.engagement.change >= 0 ? 'bg-green-400/20 text-green-100' : 'bg-red-400/20 text-red-100'
                  }`}>
                    {metrics.engagement.change >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    {Math.abs(metrics.engagement.change)}%
                  </div>
                </div>
                <p className="text-4xl font-black mb-2">{metrics.engagement.totalVisits}</p>
                <p className="text-purple-100 text-sm font-medium mb-3">Visites totales</p>
                <div className="flex gap-2 flex-wrap">
                  <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                    {metrics.engagement.uniqueVisitors} uniques
                  </Badge>
                  <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                    {metrics.engagement.uniqueCountries} pays
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Revenus */}
            <Card className="border-none shadow-xl bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
              <CardContent className="pt-6 pb-5 relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <DollarSign className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-yellow-400/20 text-yellow-100">
                    <Zap className="w-3 h-3" />
                    Live
                  </div>
                </div>
                <p className="text-4xl font-black mb-2">{metrics.revenue.total.toLocaleString()}</p>
                <p className="text-orange-100 text-sm font-medium mb-3">Revenus (XOF)</p>
                <div className="flex gap-2 flex-wrap">
                  <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                    {metrics.revenue.documentsSold} docs
                  </Badge>
                  <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                    {metrics.revenue.tuitionPaid} scol.
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-white/80 backdrop-blur-xl border-2 border-white shadow-xl rounded-2xl p-1.5">
              <TabsTrigger value="overview" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
                Vue d'ensemble
              </TabsTrigger>
              <TabsTrigger value="students" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
                Étudiants
              </TabsTrigger>
              <TabsTrigger value="courses" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
                Cours & Performance
              </TabsTrigger>
              <TabsTrigger value="engagement" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
                Engagement
              </TabsTrigger>
              <TabsTrigger value="revenue" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
                Revenus
              </TabsTrigger>
            </TabsList>

            {/* Vue d'ensemble */}
            <TabsContent value="overview" className="space-y-6">
              {/* Main Chart */}
              <Card className="border-none shadow-xl bg-white/80 backdrop-blur-xl">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                    Évolution temporelle
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={timeSeriesData}>
                      <defs>
                        <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                        </linearGradient>
                        <linearGradient id="colorSignups" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                        </linearGradient>
                        <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                        stroke="#9ca3af"
                        interval={Math.floor(timeSeriesData.length / 8)}
                      />
                      <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} stroke="#9ca3af" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                          fontSize: '13px',
                          fontWeight: '500'
                        }}
                      />
                      <Legend 
                        wrapperStyle={{ fontSize: '13px', fontWeight: '600' }}
                        iconType="circle"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="visits" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        fill="url(#colorVisits)"
                        name="Visites"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="signups" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        fill="url(#colorSignups)"
                        name="Inscriptions"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="progress" 
                        stroke="#8b5cf6" 
                        strokeWidth={3}
                        fill="url(#colorProgress)"
                        name="Progrès cours"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Répartition par domaine */}
                <Card className="border-none shadow-xl bg-white/80 backdrop-blur-xl">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-indigo-600" />
                      Répartition par domaine
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={domainDistribution.slice(0, 7)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="total"
                        >
                          {domainDistribution.slice(0, 7).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Répartition par formation */}
                <Card className="border-none shadow-xl bg-white/80 backdrop-blur-xl">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <Award className="w-5 h-5 text-purple-600" />
                      Répartition par formation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={formationDistribution.slice(0, 7)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fontSize: 11, fill: '#6b7280' }}
                          angle={-45}
                          textAnchor="end"
                          height={100}
                        />
                        <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Onglet Étudiants */}
            <TabsContent value="students" className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="border-none shadow-lg bg-white">
                  <CardContent className="pt-5 pb-4">
                    <p className="text-3xl font-black text-gray-900">{metrics.students.total}</p>
                    <p className="text-sm text-gray-600 mt-1">Total</p>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
                  <CardContent className="pt-5 pb-4">
                    <p className="text-3xl font-black text-green-700">{metrics.students.certified}</p>
                    <p className="text-sm text-green-600 mt-1">Certifiés</p>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-lg bg-gradient-to-br from-amber-50 to-orange-50">
                  <CardContent className="pt-5 pb-4">
                    <p className="text-3xl font-black text-amber-700">{metrics.students.pending}</p>
                    <p className="text-sm text-amber-600 mt-1">En attente</p>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
                  <CardContent className="pt-5 pb-4">
                    <p className="text-3xl font-black text-blue-700">{metrics.students.active}</p>
                    <p className="text-sm text-blue-600 mt-1">Actifs</p>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-lg bg-gradient-to-br from-red-50 to-pink-50">
                  <CardContent className="pt-5 pb-4">
                    <p className="text-3xl font-black text-red-700">{metrics.students.blocked}</p>
                    <p className="text-sm text-red-600 mt-1">Bloqués</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top pays */}
                <Card className="border-none shadow-xl bg-white/80 backdrop-blur-xl">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <Globe className="w-5 h-5 text-green-600" />
                      Top 10 pays
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-5">
                    <div className="space-y-3">
                      {countryDistribution.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 bg-gradient-to-r from-gray-50 to-transparent rounded-xl p-3 hover:from-blue-50 transition-colors">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold shadow-lg">
                            {i + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-gray-900">{item.name}</p>
                            <p className="text-xs text-gray-500">{((item.value / metrics.students.total) * 100).toFixed(1)}% des étudiants</p>
                          </div>
                          <Badge className="bg-blue-100 text-blue-700 font-bold">{item.value}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Taux de certification par domaine */}
                <Card className="border-none shadow-xl bg-white/80 backdrop-blur-xl">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <Target className="w-5 h-5 text-blue-600" />
                      Activité par domaine
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-5 space-y-3">
                    {domainDistribution.slice(0, 7).map((domain, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold text-gray-900">{domain.name}</span>
                          <div className="flex gap-2">
                            <Badge variant="outline" className="text-xs">{domain.total} total</Badge>
                            <Badge className="bg-green-100 text-green-700 text-xs">{domain.certified} cert.</Badge>
                            <Badge className="bg-blue-100 text-blue-700 text-xs">{domain.active} actifs</Badge>
                          </div>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all"
                            style={{ width: `${(domain.certified / domain.total) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Onglet Cours */}
            <TabsContent value="courses" className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-none shadow-lg bg-white">
                  <CardContent className="pt-5 pb-4">
                    <BookOpen className="w-8 h-8 text-gray-600 mb-2" />
                    <p className="text-3xl font-black text-gray-900">{metrics.courses.total}</p>
                    <p className="text-sm text-gray-600 mt-1">Cours disponibles</p>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
                  <CardContent className="pt-5 pb-4">
                    <CheckCircle className="w-8 h-8 text-green-600 mb-2" />
                    <p className="text-3xl font-black text-green-700">{metrics.courses.completed}</p>
                    <p className="text-sm text-green-600 mt-1">Validations</p>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-indigo-50">
                  <CardContent className="pt-5 pb-4">
                    <Target className="w-8 h-8 text-purple-600 mb-2" />
                    <p className="text-3xl font-black text-purple-700">{metrics.courses.successRate}%</p>
                    <p className="text-sm text-purple-600 mt-1">Taux de réussite</p>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
                  <CardContent className="pt-5 pb-4">
                    <Star className="w-8 h-8 text-blue-600 mb-2" />
                    <p className="text-3xl font-black text-blue-700">{metrics.courses.avgScore}/20</p>
                    <p className="text-sm text-blue-600 mt-1">Moyenne générale</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Taux de réussite par domaine */}
                <Card className="border-none shadow-xl bg-white/80 backdrop-blur-xl">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-green-600" />
                      Taux de réussite par domaine
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={successByDomain.slice(0, 7)} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                        <YAxis 
                          type="category" 
                          dataKey="domain" 
                          tick={{ fontSize: 11 }}
                          width={120}
                        />
                        <Tooltip />
                        <Bar dataKey="successRate" fill="#10b981" radius={[0, 8, 8, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Stats détaillées */}
                <Card className="border-none shadow-xl bg-white/80 backdrop-blur-xl">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <Activity className="w-5 h-5 text-orange-600" />
                      Statistiques détaillées
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-5 space-y-4">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border-2 border-blue-100">
                      <p className="text-sm text-gray-600 mb-2 font-medium">Total tentatives d'examen</p>
                      <p className="text-4xl font-black text-blue-600">{metrics.courses.totalAttempts}</p>
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-5 border-2 border-purple-100">
                      <p className="text-sm text-gray-600 mb-2 font-medium">Moyenne tentatives/examen</p>
                      <p className="text-4xl font-black text-purple-600">{metrics.courses.avgAttemptsPerExam}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                        <p className="text-xs text-gray-600 mb-1">Réussites</p>
                        <p className="text-2xl font-black text-green-600">{metrics.courses.completed}</p>
                      </div>
                      <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-4 border border-red-200">
                        <p className="text-xs text-gray-600 mb-1">Échecs</p>
                        <p className="text-2xl font-black text-red-600">{metrics.courses.failed}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Onglet Engagement */}
            <TabsContent value="engagement" className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-none shadow-lg bg-gradient-to-br from-cyan-50 to-blue-50">
                  <CardContent className="pt-5 pb-4">
                    <Eye className="w-8 h-8 text-cyan-600 mb-2" />
                    <p className="text-3xl font-black text-cyan-700">{metrics.engagement.totalVisits}</p>
                    <p className="text-sm text-cyan-600 mt-1">Visites totales</p>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
                  <CardContent className="pt-5 pb-4">
                    <Users className="w-8 h-8 text-blue-600 mb-2" />
                    <p className="text-3xl font-black text-blue-700">{metrics.engagement.uniqueVisitors}</p>
                    <p className="text-sm text-blue-600 mt-1">Visiteurs uniques</p>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
                  <CardContent className="pt-5 pb-4">
                    <Globe className="w-8 h-8 text-purple-600 mb-2" />
                    <p className="text-3xl font-black text-purple-700">{metrics.engagement.uniqueCountries}</p>
                    <p className="text-sm text-purple-600 mt-1">Pays uniques</p>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
                  <CardContent className="pt-5 pb-4">
                    <MessageCircle className="w-8 h-8 text-green-600 mb-2" />
                    <p className="text-3xl font-black text-green-700">{metrics.engagement.engagementRate}</p>
                    <p className="text-sm text-green-600 mt-1">Engagement/post</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="border-none shadow-xl bg-white/80 backdrop-blur-xl">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      Contenu publié
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-5 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Articles publiés</span>
                      <Badge className="bg-blue-100 text-blue-700 font-bold">{metrics.content.posts}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Brouillons</span>
                      <Badge className="bg-gray-100 text-gray-700 font-bold">{metrics.content.drafts}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Documents</span>
                      <Badge className="bg-purple-100 text-purple-700 font-bold">{metrics.content.documents}</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-xl bg-white/80 backdrop-blur-xl">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-green-600" />
                      Interactions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-5 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">J'aime totaux</span>
                      <Badge className="bg-red-100 text-red-700 font-bold">{metrics.engagement.likesTotal}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Commentaires</span>
                      <Badge className="bg-blue-100 text-blue-700 font-bold">{metrics.engagement.commentsTotal}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Engagement moyen</span>
                      <Badge className="bg-green-100 text-green-700 font-bold">{metrics.engagement.engagementRate}</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-xl bg-white/80 backdrop-blur-xl">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-purple-600" />
                      Support
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-5 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Questions totales</span>
                      <Badge className="bg-purple-100 text-purple-700 font-bold">{metrics.content.questions}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Répondues</span>
                      <Badge className="bg-green-100 text-green-700 font-bold">{metrics.content.questionsAnswered}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Taux de réponse</span>
                      <Badge className="bg-blue-100 text-blue-700 font-bold">{metrics.content.responseRate}%</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Onglet Revenus */}
            <TabsContent value="revenue" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-xl bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700 text-white">
                  <CardContent className="pt-6 pb-5">
                    <DollarSign className="w-12 h-12 text-green-200 mb-3" />
                    <p className="text-5xl font-black mb-2">{metrics.revenue.total.toLocaleString()}</p>
                    <p className="text-green-100 text-sm font-semibold">Revenus totaux (XOF)</p>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-xl bg-white/80 backdrop-blur-xl">
                  <CardHeader className="border-b border-gray-100 pb-4">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      Documents
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Revenus</span>
                      <span className="font-bold text-gray-900">{metrics.revenue.totalDocuments.toLocaleString()} XOF</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Vendus</span>
                      <Badge className="bg-green-100 text-green-700">{metrics.revenue.documentsSold}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">En attente</span>
                      <Badge className="bg-amber-100 text-amber-700">{metrics.revenue.pendingDocs}</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-xl bg-white/80 backdrop-blur-xl">
                  <CardHeader className="border-b border-gray-100 pb-4">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <Award className="w-5 h-5 text-purple-600" />
                      Scolarité
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Revenus</span>
                      <span className="font-bold text-gray-900">{metrics.revenue.totalTuition.toLocaleString()} XOF</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Payés</span>
                      <Badge className="bg-green-100 text-green-700">{metrics.revenue.tuitionPaid}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">En attente</span>
                      <Badge className="bg-amber-100 text-amber-700">{metrics.revenue.pendingTuition}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Revenue breakdown chart */}
              <Card className="border-none shadow-xl bg-white/80 backdrop-blur-xl">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    Répartition des revenus
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Documents', value: metrics.revenue.totalDocuments },
                          { name: 'Scolarité', value: metrics.revenue.totalTuition }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#3b82f6" />
                        <Cell fill="#8b5cf6" />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminGuard>
  );
}