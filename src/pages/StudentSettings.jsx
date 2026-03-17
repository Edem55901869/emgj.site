import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Globe, Moon, Volume2, Lock, Eye, EyeOff, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import StudentBottomNav from '../components/student/StudentBottomNav';

export default function StudentSettings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showPrivacy, setShowPrivacy] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        // Charger les préférences sauvegardées si elles existent
        const savedSound = localStorage.getItem(`sound_enabled_${u.email}`);
        if (savedSound !== null) {
          setSoundEnabled(savedSound === 'true');
        }
      } catch {}
    };
    load();
  }, []);

  const handleSoundToggle = (enabled) => {
    setSoundEnabled(enabled);
    if (user?.email) {
      localStorage.setItem(`sound_enabled_${user.email}`, enabled.toString());
    }
  };

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
          <div className="p-4">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Langue</p>
                <p className="text-sm text-gray-500">Français (par défaut)</p>
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">Notifications sonores</p>
                  <p className="text-sm text-gray-500">
                    {soundEnabled ? 'Activées' : 'Désactivées'}
                  </p>
                </div>
              </div>
              <Switch checked={soundEnabled} onCheckedChange={handleSoundToggle} />
            </div>
          </div>

          <button onClick={() => setShowPrivacy(true)} className="p-4 w-full text-left hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Confidentialité</p>
                <p className="text-sm text-gray-500">Gérer vos données personnelles</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      <Dialog open={showPrivacy} onOpenChange={setShowPrivacy}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Confidentialité
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="p-4 bg-blue-50 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <UserCheck className="w-4 h-4" />
                Qui peut voir mon profil ?
              </h3>
              <p className="text-sm text-gray-600">Tous les étudiants certifiés de l'EMGJ peuvent voir votre profil public (nom, domaine, formation).</p>
            </div>

            <div className="p-4 bg-green-50 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Informations visibles
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Nom complet</li>
                <li>• Photo de profil</li>
                <li>• Domaine et formation</li>
                <li>• Statut de certification</li>
              </ul>
            </div>

            <div className="p-4 bg-amber-50 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <EyeOff className="w-4 h-4" />
                Informations privées
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Email</li>
                <li>• Numéro WhatsApp</li>
                <li>• Coordonnées complètes</li>
                <li>• Bulletins et notes</li>
              </ul>
            </div>

            <p className="text-xs text-gray-500 p-3 bg-gray-50 rounded-lg">
              Vos informations personnelles sont protégées et ne sont accessibles qu'aux administrateurs de l'EMGJ pour la gestion de votre formation.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      <StudentBottomNav />
    </div>
  );
}