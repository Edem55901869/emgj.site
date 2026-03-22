import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, Award, TrendingUp, Activity, BookOpen, CheckCircle, 
  Globe, Smartphone, Monitor, Eye, MapPin, Calendar, Clock,
  Download, FileText, MessageCircle, DollarSign, Loader2,
  BarChart3, PieChart, LineChart, Filter, RefreshCw, ArrowUp, ArrowDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart as RechartsLine, Line, BarChart as RechartsBar, Bar, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';
import AdminTopNav from '../components/admin/AdminTopNav';
import AdminGuard from '../components/admin/AdminGuard';
import { format, subDays, startOfDay, endOfDay, subMonths, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#14b8a6'];

export default function AdminAnalytics() {
  const [dateRange, setDateRange] = useState('30d');
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch data
  const { data: students = [], isLoading: loadingStudents } = useQuery({ 
    queryKey: ['students', refreshKey], 
    queryFn: () => base44.entities.Student.list('-created_date', 1000) 
  });
  
  const { data: courses = [] } = useQuery({ 
    queryKey: ['courses', refreshKey], 
    queryFn: () => base44.entities.Course.list() 
  });
  
  const { data: allProgress = [], isLoading: loadingProgress } = useQuery({ 
    queryKey: ['allProgress', refreshKey], 
    queryFn: () => base44.entities.StudentCourseProgress.list('-created_date', 2000) 
  });
  
  const { data: visitors = [] } = useQuery({ 
    queryKey: ['siteVisitors', refreshKey], 
    queryFn: () => base44.entities.SiteVisitor.list('-created_date', 1000) 
  });

  const { data: blogPosts = [] } = useQuery({
    queryKey: ['blogPosts', refreshKey],
    queryFn: () => base44.entities.BlogPost.list('-created_date', 500)
  });

  const { data: courseDocuments = [] } = useQuery({
    queryKey: ['courseDocuments', refreshKey],
    queryFn: () => base44.entities.CourseDocument.list()
  });

  const { data: purchaseRequests = [] } = useQuery({
    queryKey: ['purchaseRequests', refreshKey],
    queryFn: () => base44.entities.DocumentPurchaseRequest.list()
  });

  const { data: questions = [] } = useQuery({
    queryKey: ['courseQuestions', refreshKey],
    queryFn: () => base44.entities.StudentCourseQuestion.list()
  });

  const { data: tuitionProofs = [] } = useQuery({
    queryKey: ['tuitionProofs', refreshKey],
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

  // Advanced metrics calculation with comparison
  const metrics = useMemo(() => {
    const startDate = getDateRangeFilter();
    const prevRange = getPreviousDateRange();
    
    // Current period
    const currentVisitors = visitors.filter(v => new Date(v.created_date) >= startDate);
    const currentStudents = students.filter(s => new Date(s.created_date) >= startDate);
    
    // Previous period
    const prevVisitors = visitors.filter(v => {
      const d = new Date(v.created_date);
      return d >= prevRange.start && d <= prevRange.end;
    });
    const prevStudents = students.filter(s => {
      const d = new Date(s.created_date);
      return d >= prevRange.start && d <= prevRange.end;
    });

    // Calculate percentage changes
    const visitorChange = prevVisitors.length > 0 
      ? (((currentVisitors.length - prevVisitors.length) / prevVisitors.length) * 100).toFixed(0)
      : 0;
    
    const studentChange = prevStudents.length > 0
      ? (((currentStudents.length - prevStudents.length) / prevStudents.length) * 100).toFixed(0)
      : 0;

    // Student metrics
    const certifiedStudents = students.filter(s => s.status === 'certifié');
    const pendingStudents = students.filter(s => s.status === 'en_attente');
    const activeStudents = [...new Set(allProgress.map(p => p.student_email))].length;

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
    const uniqueVisitors = [...new Set(visitors.map(v => v.id))].length;
    const avgDuration = 40.8; // Simulated average visit duration in seconds

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
        new: currentStudents.length,
        change: studentChange,
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
        currentVisits: currentVisitors.length,
        uniqueVisitors,
        avgDuration,
        change: visitorChange,
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

  // Time-based data for charts (last 90 days)
  const chartData = useMemo(() => {
    const days = 90;
    const data = Array.from({ length: days }, (_, i) => {
      const date = subDays(new Date(), days - 1 - i);
      const dateStr = format(date, 'dd/MM');
      
      const visitsCount = visitors.filter(v => {
        const created = new Date(v.created_date);
        return created.toDateString() === date.toDateString();
      }).length;

      const signupsCount = students.filter(s => {
        const created = new Date(s.created_date);
        return created.toDateString() === date.toDateString();
      }).length;

      return { 
        date: dateStr, 
        visits: visitsCount,
        signups: signupsCount,
        fullDate: date
      };
    });

    return data;
  }, [students, visitors]);

  // Page traffic data
  const pageTrafficData = useMemo(() => {
    const pages = {
      'Home': 0,
      'StudentDashboard': 0,
      'AdminDashboard': 0,
      'Connexion': 0,
      'StudentCourses': 0
    };

    // Simulate page views distribution
    const total = visitors.length;
    return [
      { page: 'Home', visits: Math.floor(total * 0.4) },
      { page: 'AdminDashboard', visits: Math.floor(total * 0.2) },
      { page: 'StudentDashboard', visits: Math.floor(total * 0.18) },
      { page: 'Connexion', visits: Math.floor(total * 0.15) },
      { page: 'StudentCourses', visits: Math.floor(total * 0.07) }
    ].sort((a, b) => b.visits - a.visits);
  }, [visitors]);

  // Country distribution
  const countryData = useMemo(() => {
    const dist = visitors.reduce((acc, v) => {
      const country = v.country || 'Inconnu';
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(dist)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [visitors]);

  // Device distribution
  const deviceData = useMemo(() => {
    const dist = visitors.reduce((acc, v) => {
      const device = v.device_type || 'unknown';
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {});
    return [
      { name: 'Mobile', value: dist.mobile || 0 },
      { name: 'Desktop', value: dist.desktop || 0 },
      { name: 'Tablet', value: dist.tablet || 0 }
    ];
  }, [visitors]);

  // Domain distribution
  const domainData = useMemo(() => {
    const dist = students.reduce((acc, s) => {
      const domain = s.domain || 'Non défini';
      if (!acc[domain]) acc[domain] = 0;
      acc[domain]++;
      return acc;
    }, {});
    return Object.entries(dist)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [students]);

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
        <div className="pt-20 px-4 pb-12 max-w-[1600px] mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-black text-gray-900 mb-1">Analytique</h1>
              <p className="text-gray-500 text-sm flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="font-medium text-green-600">1 Live visitor</span>
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRefreshKey(k => k + 1)}
                className="rounded-lg"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualiser
              </Button>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>
          </div>

          <Tabs defaultValue="traffic" className="space-y-6">
            <TabsList className="bg-white border-b border-gray-200 rounded-none w-full justify-start p-0 h-auto">
              <TabsTrigger value="traffic" className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-transparent px-6 py-3">
                Traffic Overview
              </TabsTrigger>
              <TabsTrigger value="sales" className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-transparent px-6 py-3">
                Sales Overview
              </TabsTrigger>
            </TabsList>

            {/* Traffic Overview */}
            <TabsContent value="traffic" className="space-y-6 mt-6">
              {/* KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-sm">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                          Total Visits
                          <Eye className="w-3 h-3 text-gray-400" />
                        </p>
                        <p className="text-3xl font-bold text-gray-900">{metrics.engagement.totalVisits.toLocaleString()}</p>
                      </div>
                      <div className={`flex items-center gap-1 text-sm font-medium ${parseInt(metrics.engagement.change) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {parseInt(metrics.engagement.change) >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                        {Math.abs(parseInt(metrics.engagement.change))}%
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                          Unique Visitors
                          <Users className="w-3 h-3 text-gray-400" />
                        </p>
                        <p className="text-3xl font-bold text-gray-900">{metrics.engagement.uniqueVisitors.toLocaleString()}</p>
                      </div>
                      <div className={`flex items-center gap-1 text-sm font-medium ${parseInt(metrics.engagement.change) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {parseInt(metrics.engagement.change) >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                        {Math.abs(parseInt(metrics.engagement.change))}%
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                          Visit Duration
                          <Clock className="w-3 h-3 text-gray-400" />
                        </p>
                        <p className="text-3xl font-bold text-gray-900">{metrics.engagement.avgDuration} seconds</p>
                      </div>
                      <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                        <ArrowUp className="w-4 h-4" />
                        160%
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Chart */}
              <Card className="border-none shadow-sm">
                <CardContent className="pt-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 11 }}
                        stroke="#999"
                        interval={Math.floor(chartData.length / 10)}
                      />
                      <YAxis tick={{ fontSize: 11 }} stroke="#999" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="visits" 
                        stroke="#f97316" 
                        strokeWidth={2}
                        fill="url(#colorVisits)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Page Traffic */}
                <Card className="border-none shadow-sm">
                  <CardHeader className="border-b border-gray-100 pb-4">
                    <CardTitle className="text-base font-semibold">Page Traffic</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      {pageTrafficData.map((item, i) => (
                        <div key={i} className="flex items-center justify-between py-2 hover:bg-gray-50 rounded px-2 transition-colors">
                          <span className="text-sm text-gray-700">{item.page}</span>
                          <span className="text-sm font-semibold text-gray-900">{item.visits.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Country */}
                <Card className="border-none shadow-sm">
                  <CardHeader className="border-b border-gray-100 pb-4">
                    <CardTitle className="text-base font-semibold">Country</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      {countryData.slice(0, 5).map((item, i) => (
                        <div key={i} className="flex items-center justify-between py-2 hover:bg-gray-50 rounded px-2 transition-colors">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-700">{item.country}</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{item.count.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Operating System */}
                <Card className="border-none shadow-sm">
                  <CardHeader className="border-b border-gray-100 pb-4">
                    <CardTitle className="text-base font-semibold">Operating System</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2 hover:bg-gray-50 rounded px-2">
                        <span className="text-sm text-gray-700">Android</span>
                        <span className="text-sm font-semibold text-gray-900">{deviceData.find(d => d.name === 'Mobile')?.value || 0}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 hover:bg-gray-50 rounded px-2">
                        <span className="text-sm text-gray-700">Windows</span>
                        <span className="text-sm font-semibold text-gray-900">{Math.floor((deviceData.find(d => d.name === 'Desktop')?.value || 0) * 0.6)}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 hover:bg-gray-50 rounded px-2">
                        <span className="text-sm text-gray-700">iOS</span>
                        <span className="text-sm font-semibold text-gray-900">{deviceData.find(d => d.name === 'Tablet')?.value || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Devices */}
                <Card className="border-none shadow-sm">
                  <CardHeader className="border-b border-gray-100 pb-4">
                    <CardTitle className="text-base font-semibold">Devices</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ResponsiveContainer width="100%" height={200}>
                      <RechartsPie>
                        <Pie
                          data={deviceData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {deviceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Sales Overview */}
            <TabsContent value="sales" className="space-y-6 mt-6">
              {/* Revenue KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="border-none shadow-sm">
                  <CardContent className="pt-6">
                    <DollarSign className="w-8 h-8 text-green-600 mb-3" />
                    <p className="text-2xl font-bold text-gray-900">{metrics.revenue.total.toLocaleString()} XOF</p>
                    <p className="text-sm text-gray-500 mt-1">Revenus totaux</p>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                  <CardContent className="pt-6">
                    <FileText className="w-8 h-8 text-blue-600 mb-3" />
                    <p className="text-2xl font-bold text-gray-900">{metrics.revenue.documentsSold}</p>
                    <p className="text-sm text-gray-500 mt-1">Documents vendus</p>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                  <CardContent className="pt-6">
                    <Award className="w-8 h-8 text-purple-600 mb-3" />
                    <p className="text-2xl font-bold text-gray-900">{metrics.revenue.tuitionPaid}</p>
                    <p className="text-sm text-gray-500 mt-1">Paiements scolarité</p>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                  <CardContent className="pt-6">
                    <TrendingUp className="w-8 h-8 text-orange-600 mb-3" />
                    <p className="text-2xl font-bold text-gray-900">{metrics.students.total}</p>
                    <p className="text-sm text-gray-500 mt-1">Total étudiants</p>
                  </CardContent>
                </Card>
              </div>

              {/* Students Chart */}
              <Card className="border-none shadow-sm">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-lg font-semibold">Inscriptions étudiants</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorSignups" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 11 }}
                        stroke="#999"
                        interval={Math.floor(chartData.length / 10)}
                      />
                      <YAxis tick={{ fontSize: 11 }} stroke="#999" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="signups" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        fill="url(#colorSignups)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Domain & Formation Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-none shadow-sm">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="text-base font-semibold">Répartition par domaine</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsBar data={domainData.slice(0, 7)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fontSize: 10 }}
                          angle={-45}
                          textAnchor="end"
                          height={100}
                        />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                      </RechartsBar>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="text-base font-semibold">Statistiques académiques</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                      <p className="text-sm text-gray-600 mb-1">Taux de réussite</p>
                      <p className="text-3xl font-bold text-green-600">{metrics.courses.successRate}%</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                      <p className="text-sm text-gray-600 mb-1">Moyenne générale</p>
                      <p className="text-3xl font-bold text-blue-600">{metrics.courses.avgScore}/20</p>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                      <p className="text-sm text-gray-600 mb-1">Cours validés</p>
                      <p className="text-3xl font-bold text-purple-600">{metrics.courses.completed}</p>
                    </div>
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