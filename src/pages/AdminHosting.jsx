import React from 'react';
import { Cloud, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AdminTopNav from '../components/admin/AdminTopNav';
import AdminGuard from '../components/admin/AdminGuard';

const plans = [
  { name: 'Basic', price: '29,000 XOF', features: ['100 étudiants max', '10 GB stockage', 'Support email', '1 domaine personnalisé'], color: 'from-gray-500 to-gray-600' },
  { name: 'Pro', price: '79,000 XOF', features: ['500 étudiants max', '50 GB stockage', 'Support prioritaire', '3 domaines personnalisés', 'Analytics avancé'], color: 'from-blue-500 to-blue-600', popular: true },
  { name: 'Enterprise', price: '149,000 XOF', features: ['Étudiants illimités', '200 GB stockage', 'Support 24/7', 'Domaines illimités', 'API complète', 'Sauvegarde automatique'], color: 'from-purple-500 to-purple-600' },
];

export default function AdminHosting() {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
        <AdminTopNav />
        <div className="pt-20 px-4 pb-8 max-w-7xl mx-auto">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Plans d'Hébergement</h1>
            <p className="text-gray-500 mt-1">Choisissez le plan adapté à vos besoins</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <Card key={i} className={`border-none shadow-lg relative ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white">Populaire</Badge>
                )}
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mx-auto mb-4`}>
                    <Cloud className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{plan.price}<span className="text-sm text-gray-500">/mois</span></p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {plan.features.map((feature, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                  <Button className={`w-full mt-4 bg-gradient-to-r ${plan.color} hover:opacity-90 rounded-xl`}>
                    Choisir ce plan
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}