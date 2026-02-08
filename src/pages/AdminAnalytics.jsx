import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, Globe, Smartphone, Monitor, Tablet, Loader2, TrendingUp, Users, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import AdminTopNav from '../components/admin/AdminTopNav';
import AdminGuard from '../components/admin/AdminGuard';

export default function AdminAnalytics() {
  const { data: visitors = [], isLoading } = useQuery({ queryKey: ['siteVisitors'], queryFn: () => base44.entities.SiteVisitor.list('-created_date', 500) });

  const countryStats = visitors.reduce((acc, v) => {
    acc[v.country] = (acc[v.country] || 0) + 1;
    return acc;
  }, {});

  const deviceStats = visitors.reduce((acc, v) => {
    acc[v.device_type] = (acc[v.device_type] || 0) + 1;
    return acc;
  }, {});

  const topCountries = Object.entries(countryStats).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const total = visitors.length;

  const deviceIcons = { mobile: Smartphone, desktop: Monitor, tablet: Tablet };
  const deviceColors = { mobile: 'from-blue-500 to-blue-600', desktop: 'from-indigo-500 to-indigo-600', tablet: 'from-purple-500 to-purple-600' };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
        <AdminTopNav />
        <div className="pt-20 px-4 pb-8 max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Analytique</h1>
            <p className="text-gray-500 mt-1">Vue d'ensemble du trafic et des visiteurs</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="border-none shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm">Total des visites</p>
                        <p className="text-4xl font-bold mt-2">{total}</p>
                        <p className="text-blue-100 text-xs mt-1 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" /> +12% ce mois
                        </p>
                      </div>
                      <Eye className="w-12 h-12 text-blue-200/50" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-indigo-100 text-sm">Pays uniques</p>
                        <p className="text-4xl font-bold mt-2">{Object.keys(countryStats).length}</p>
                        <p className="text-indigo-100 text-xs mt-1 flex items-center gap-1">
                          <Globe className="w-3 h-3" /> Présence mondiale
                        </p>
                      </div>
                      <Globe className="w-12 h-12 text-indigo-200/50" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm">Appareils</p>
                        <p className="text-4xl font-bold mt-2">{Object.keys(deviceStats).length}</p>
                        <p className="text-purple-100 text-xs mt-1 flex items-center gap-1">
                          <Smartphone className="w-3 h-3" /> Multi-plateforme
                        </p>
                      </div>
                      <BarChart3 className="w-12 h-12 text-purple-200/50" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-none shadow-lg">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Globe className="w-5 h-5 text-blue-600" />
                      Top 10 des pays
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-5 space-y-4">
                    {topCountries.map(([country, count]) => {
                      const percentage = (count / total * 100).toFixed(1);
                      return (
                        <div key={country} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900">{country || 'Inconnu'}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">{count} visites</span>
                              <Badge className="bg-blue-50 text-blue-700 border-blue-100">{percentage}%</Badge>
                            </div>
                          </div>
                          <Progress value={parseFloat(percentage)} className="h-2" />
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                <Card className="border-none shadow-lg">
                  <CardHeader className="border-b border-gray-100">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-indigo-600" />
                      Répartition par appareil
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-5 space-y-4">
                    {Object.entries(deviceStats).map(([device, count]) => {
                      const Icon = deviceIcons[device] || Monitor;
                      const percentage = (count / total * 100).toFixed(1);
                      return (
                        <div key={device} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${deviceColors[device] || 'from-gray-500 to-gray-600'} flex items-center justify-center`}>
                                <Icon className="w-5 h-5 text-white" />
                              </div>
                              <span className="font-medium text-gray-900 capitalize">{device}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">{count}</span>
                              <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100">{percentage}%</Badge>
                            </div>
                          </div>
                          <Progress value={parseFloat(percentage)} className="h-2" />
                        </div>
                      );
                    })}
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