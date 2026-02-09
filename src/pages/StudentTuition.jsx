import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, DollarSign, Calendar, CheckCircle, Clock, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import StudentBottomNav from '../components/student/StudentBottomNav';

export default function StudentTuition() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const u = await base44.auth.me();
      setUser(u);
      const students = await base44.entities.Student.filter({ user_email: u.email });
      if (students.length > 0) setStudent(students[0]);
      setLoading(false);
    };
    load();
  }, []);

  const { data: tuitions = [] } = useQuery({
    queryKey: ['studentTuitions'],
    queryFn: () => base44.entities.Tuition.filter({ student_email: user?.email }),
    enabled: !!user,
  });

  const { data: configs = [] } = useQuery({
    queryKey: ['tuitionConfigs'],
    queryFn: () => base44.entities.TuitionConfig.list(),
    enabled: !!student,
  });

  const myConfig = configs.find(c => c.domain === student?.domain && c.formation_type === student?.formation_type);

  const getStatusIcon = (status) => {
    switch(status) {
      case 'payé': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'en_attente': return <Clock className="w-5 h-5 text-amber-500" />;
      case 'en_retard': return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'payé': return 'bg-green-50 text-green-700 border-green-200';
      case 'en_attente': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'en_retard': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24">
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 px-4 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <Button onClick={() => navigate(createPageUrl('StudentMore'))} variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">Scolarité</h1>
            <p className="text-green-100 text-sm">Paiements et factures</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-2">
        {myConfig && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 mb-4 border border-blue-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-blue-900 mb-1">Frais de scolarité</h3>
                <p className="text-2xl font-bold text-blue-600 mb-2">{myConfig.amount} {myConfig.currency}</p>
                <p className="text-sm text-blue-700 mb-3">{myConfig.domain} - {myConfig.formation_type}</p>
                {myConfig.payment_link && (
                  <a href={myConfig.payment_link} target="_blank" rel="noopener noreferrer">
                    <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Procéder au paiement
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {tuitions.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">Aucune facture pour le moment</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tuitions.map(tuition => (
              <div key={tuition.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(tuition.status)}
                    <div>
                      <p className="font-bold text-gray-900">{tuition.amount} {tuition.currency}</p>
                      <p className="text-sm text-gray-500">{tuition.period}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(tuition.status)}>
                    {tuition.status}
                  </Badge>
                </div>
                {tuition.notes && (
                  <p className="text-xs text-gray-600 mt-2">{tuition.notes}</p>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  {tuition.created_date && format(new Date(tuition.created_date), "d MMMM yyyy", { locale: fr })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <StudentBottomNav />
    </div>
  );
}