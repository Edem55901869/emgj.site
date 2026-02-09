import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Eye, ArrowLeft, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import AdminTopNav from '../components/admin/AdminTopNav';
import AdminGuard from '../components/admin/AdminGuard';
import { DOMAINS, FORMATION_BY_DOMAIN } from '@/lib/domainFormationMapping';

export default function AdminViewAsStudent() {
  const navigate = useNavigate();
  const [domain, setDomain] = useState('');
  const [formationType, setFormationType] = useState('');

  const availableFormations = domain ? FORMATION_BY_DOMAIN[domain] : [];

  const handleSwitch = () => {
    if (!domain || !formationType) {
      toast.error('Veuillez sélectionner un domaine et un type de formation');
      return;
    }

    localStorage.setItem('admin_student_view', JSON.stringify({
      active: true,
      domain,
      formation_type: formationType,
      timestamp: Date.now()
    }));

    toast.success('Basculement en mode étudiant');
    navigate(createPageUrl('StudentDashboard'));
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <AdminTopNav />
        <div className="pt-20 px-4 pb-8 max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-lg">
            <div className="text-center mb-8">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-500/30">
                <Eye className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">Voir en tant qu'étudiant</h1>
              <p className="text-gray-600">Prévisualisez l'expérience étudiante avec un profil virtuel</p>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Domaine *</label>
                <Select value={domain} onValueChange={(v) => { setDomain(v); setFormationType(''); }}>
                  <SelectTrigger className="rounded-xl h-12">
                    <SelectValue placeholder="Sélectionnez un domaine" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOMAINS.map(d => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Type de formation *</label>
                <Select value={formationType} onValueChange={setFormationType} disabled={!domain}>
                  <SelectTrigger className="rounded-xl h-12">
                    <SelectValue placeholder={domain ? "Sélectionnez un type de formation" : "Sélectionnez d'abord un domaine"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFormations.map(f => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <GraduationCap className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-blue-900 mb-1">Mode prévisualisation</p>
                  <p className="text-xs text-blue-700">
                    Vous allez voir l'interface étudiante avec les cours et contenus liés au domaine et à la formation sélectionnés. 
                    Pour revenir au mode administrateur, utilisez le bouton dans la barre de navigation.
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleSwitch}
              disabled={!domain || !formationType}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl h-12 text-base"
            >
              <Eye className="w-5 h-5 mr-2" />
              Basculer en mode étudiant
            </Button>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}