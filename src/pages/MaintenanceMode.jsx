import React from 'react';
import { AlertTriangle, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MaintenanceMode() {
  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      "*Bonjour l'équipe administrative de FTGJ*,\n\n" +
      "Je constate que le site est actuellement en maintenance.\n\n" +
      "*Objet :* Demande d'informations sur la maintenance\n\n" +
      "Pourriez-vous me fournir plus de détails sur :\n" +
      "- La durée estimée de la maintenance\n" +
      "- La nature des travaux en cours\n" +
      "- La date de reprise prévue\n\n" +
      "Je reste disponible pour toute information complémentaire.\n\n" +
      "Cordialement."
    );
    window.open(`https://wa.me/22892614961?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-red-500">
          <div className="bg-gradient-to-r from-red-600 via-white to-blue-600 p-1">
            <div className="bg-white p-8 text-center">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <AlertTriangle className="w-12 h-12 text-red-600" />
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Site en Maintenance
              </h1>
              
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-6">
                <p className="text-lg text-gray-700 leading-relaxed">
                  🔧 Notre plateforme est actuellement en cours de maintenance pour vous offrir une meilleure expérience.
                </p>
                <p className="text-gray-600 mt-3">
                  Nous nous excusons pour ce désagrément temporaire et vous remercions de votre patience.
                </p>
              </div>

              <div className="space-y-4">
                <p className="text-gray-700 font-semibold">
                  Pour plus d'informations, contactez nos administrateurs :
                </p>
                
                <Button
                  onClick={handleWhatsApp}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-6 px-8 rounded-2xl text-lg shadow-xl transform hover:scale-105 transition-all"
                >
                  <MessageCircle className="w-6 h-6 mr-3" />
                  Contacter sur WhatsApp
                </Button>
              </div>

              <div className="mt-8 pt-6 border-t-2 border-gray-100">
                <p className="text-sm text-gray-500">
                  Formation Théologique Génération Joël (FTGJ)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}