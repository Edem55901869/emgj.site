import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { CheckCircle, Award, Calendar, BookOpen, GraduationCap, Home, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('payment_success_data');
    if (!raw) {
      navigate(createPageUrl('StudentTuition'));
      return;
    }
    setData(JSON.parse(raw));
  }, []);

  if (!data) return null;

  const paymentDate = new Date(data.payment_date);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Icône animée */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl shadow-green-300 animate-bounce">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center shadow-lg">
              <Award className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        {/* Carte principale */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 px-6 py-5 text-center">
            <h1 className="text-2xl font-bold text-white mb-1">Félicitations ! 🎉</h1>
            <p className="text-green-100 text-sm">Votre paiement a été soumis avec succès</p>
          </div>

          {/* Corps */}
          <div className="p-6 space-y-4">
            {/* Badge scolarité payée */}
            <div className="flex justify-center">
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 text-sm rounded-full shadow-lg">
                ✅ Scolarité soumise — En attente de validation
              </Badge>
            </div>

            {/* Nom de l'étudiant */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100 text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Étudiant</p>
              <p className="text-xl font-bold text-gray-900">{data.student_name}</p>
            </div>

            {/* Infos formation */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-2xl p-3 border border-blue-100">
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <p className="text-xs text-blue-600 font-medium uppercase">Domaine</p>
                </div>
                <p className="text-sm font-bold text-gray-900 leading-tight">{data.domain}</p>
              </div>
              <div className="bg-indigo-50 rounded-2xl p-3 border border-indigo-100">
                <div className="flex items-center gap-2 mb-1">
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                  <p className="text-xs text-indigo-600 font-medium uppercase">Formation</p>
                </div>
                <p className="text-sm font-bold text-gray-900 leading-tight">{data.formation_type}</p>
              </div>
            </div>

            {/* Type de frais */}
            {data.payment_type && (
              <div className="bg-purple-50 rounded-2xl p-3 border border-purple-100 flex items-center gap-3">
                <Award className="w-5 h-5 text-purple-600 flex-shrink-0" />
                <div>
                  <p className="text-xs text-purple-600 font-medium uppercase">Type de frais</p>
                  <p className="text-sm font-bold text-gray-900">{data.payment_type}</p>
                </div>
              </div>
            )}

            {/* Date et heure */}
            <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 rounded-xl flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Date de paiement</p>
                <p className="text-sm font-bold text-gray-900">
                  {format(paymentDate, "d MMMM yyyy", { locale: fr })}
                </p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {format(paymentDate, "HH:mm", { locale: fr })}
                </p>
              </div>
            </div>

            {/* Message */}
            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 text-center">
              <p className="text-sm text-amber-800">
                🙏 Merci pour votre paiement. L'administrateur a été notifié et validera votre preuve dans les plus brefs délais.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6">
            <Button
              onClick={() => {
                sessionStorage.removeItem('payment_success_data');
                navigate(createPageUrl('StudentTuition'));
              }}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-2xl h-12 text-base font-semibold shadow-lg shadow-green-200"
            >
              <Home className="w-5 h-5 mr-2" />
              Retour à ma scolarité
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}