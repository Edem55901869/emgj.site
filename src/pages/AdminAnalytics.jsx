import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, Globe, Smartphone, Monitor, Tablet, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

  const deviceIcons = { mobile: Smartphone, desktop: Monitor, tablet: Tablet };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
        <AdminTopNav />
        <div className="pt-20 px-4 pb-8 max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Analytique</h1>
            <p className="text-gray-500 mt-1">Statistiques de visites et trafic</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-none shadow-lg">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-600" />
                    Visiteurs par pays
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-5 space-y-3">
                  {Object.entries(countryStats).sort((a, b) => b[1] - a[1]).map(([country, count]) => (
                    <div key={country} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                      <span className="font-medium text-gray-900">{country || 'Inconnu'}</span>
                      <Badge className="bg-blue-50 text-blue-700 border-blue-100">{count}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-indigo-600" />
                    Types d'appareils
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-5 space-y-3">
                  {Object.entries(deviceStats).map(([device, count]) => {
                    const Icon = deviceIcons[device] || Monitor;
                    return (
                      <div key={device} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5 text-indigo-600" />
                          <span className="font-medium text-gray-900 capitalize">{device}</span>
                        </div>
                        <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100">{count}</Badge>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg lg:col-span-2">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="text-lg">Total des visites</CardTitle>
                </CardHeader>
                <CardContent className="pt-5">
                  <div className="text-center">
                    <p className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{visitors.length}</p>
                    <p className="text-gray-500 mt-2">visites enregistrées</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </AdminGuard>
  );
}