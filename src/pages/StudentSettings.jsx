import React from 'react';
import { ArrowLeft, Globe, Moon, Volume2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import StudentBottomNav from '../components/student/StudentBottomNav';

export default function StudentSettings() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-4 pt-12 pb-6">
        <div className="flex items-center gap-3">
          <Button onClick={() => navigate(createPageUrl('StudentMore'))} variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-white">Paramètres</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-2">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Langue</p>
                <p className="text-sm text-gray-500">Français</p>
              </div>
            </div>
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Mode sombre</p>
                <p className="text-sm text-gray-500">Bientôt disponible</p>
              </div>
            </div>
            <Switch disabled />
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Notifications sonores</p>
                <p className="text-sm text-gray-500">Activer les sons</p>
              </div>
            </div>
            <Switch />
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Confidentialité</p>
                <p className="text-sm text-gray-500">Gérer la confidentialité</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <StudentBottomNav />
    </div>
  );
}