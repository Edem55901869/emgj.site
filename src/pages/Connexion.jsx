import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, User, Shield, ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function Connexion() {
  const [panel, setPanel] = useState(null);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const navigate = useNavigate();

  const handleStudentLogin = async () => {
    try {
      const nextUrl = window.location.origin + createPageUrl('StudentDashboard');
      await base44.auth.redirectToLogin(nextUrl);
    } catch (error) {
      // Si l'app n'est pas publiée, afficher un message
      toast.error('Veuillez publier l\'application pour activer l\'authentification');
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAdminLoading(true);
    
    // Vérifier le mot de passe principal
    if (adminEmail === 'agnimakaedeme@gmail.com' && adminPassword === 'EDEMS229') {
      localStorage.setItem('emgj_admin', JSON.stringify({ email: adminEmail, role: 'admin', loggedIn: true }));
      toast.success('Connexion administrateur réussie !');
      navigate(createPageUrl('AdminDashboard'));
    } else {
      // Vérifier les mots de passe de secours
      try {
        const passwords = await base44.entities.AdminPassword.filter({ admin_email: adminEmail });
        const validBackup = passwords.find(p => p.password_hash === adminPassword && p.password_type !== 'principal');
        
        if (validBackup) {
          localStorage.setItem('emgj_admin', JSON.stringify({ email: adminEmail, role: 'admin', loggedIn: true }));
          toast.success('Connexion administrateur réussie !');
          navigate(createPageUrl('AdminDashboard'));
        } else {
          toast.error('Identifiants incorrects');
        }
      } catch {
        toast.error('Identifiants incorrects');
      }
    }
    setAdminLoading(false);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?w=1920&q=80" 
          alt="Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-indigo-900/85 to-purple-900/90" />
      </div>
      <div className="absolute w-[500px] h-[500px] -top-32 -right-32 bg-blue-400/20 rounded-full blur-3xl z-0" />
      <div className="absolute w-[400px] h-[400px] bottom-0 left-0 bg-purple-400/15 rounded-full blur-3xl z-0" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to={createPageUrl('Home')} className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-white font-bold text-xl">EMGJ</span>
          </Link>
        </div>

        <AnimatePresence mode="wait">
          {panel === null && (
            <motion.div
              key="choice"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">Bienvenue</h1>
                <p className="text-blue-200/60 text-sm">Choisissez votre espace de connexion</p>
              </div>

              <button
                onClick={() => setPanel('student')}
                className="w-full group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm p-6 text-left hover:bg-white/10 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                    <User className="w-7 h-7 text-blue-300" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">Espace Étudiant</h3>
                    <p className="text-blue-200/50 text-sm">Connexion ou inscription</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setPanel('admin')}
                className="w-full group relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm p-6 text-left hover:bg-white/10 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500/30 transition-colors">
                    <Shield className="w-7 h-7 text-indigo-300" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">Espace Administrateur</h3>
                    <p className="text-blue-200/50 text-sm">Gestion de la plateforme</p>
                  </div>
                </div>
              </button>

              <div className="text-center pt-4">
                <Link to={createPageUrl('Home')} className="text-blue-300/60 text-sm hover:text-blue-300 transition-colors">
                  ← Retour à l'accueil
                </Link>
              </div>
            </motion.div>
          )}

          {panel === 'student' && (
            <motion.div
              key="student"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8"
            >
              <button onClick={() => setPanel(null)} className="flex items-center gap-2 text-blue-300/60 text-sm mb-6 hover:text-blue-300 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Retour
              </button>
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-blue-300" />
                </div>
                <h2 className="text-2xl font-bold text-white">Espace Étudiant</h2>
                <p className="text-blue-200/50 text-sm mt-2">
                  Connectez-vous ou créez votre compte
                </p>
              </div>
              <div className="space-y-3">
                <Button
                  onClick={handleStudentLogin}
                  className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white text-base rounded-xl shadow-lg shadow-blue-600/25"
                >
                  Se connecter / S'inscrire
                </Button>
              </div>
            </motion.div>
          )}

          {panel === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8"
            >
              <button onClick={() => setPanel(null)} className="flex items-center gap-2 text-blue-300/60 text-sm mb-6 hover:text-blue-300 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Retour
              </button>
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-indigo-300" />
                </div>
                <h2 className="text-2xl font-bold text-white">Espace Administrateur</h2>
                <p className="text-blue-200/50 text-sm mt-2">Accédez au panneau de gestion</p>
              </div>
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="text-sm text-blue-200/70 mb-1 block">Email</label>
                  <Input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@email.com"
                    required
                    className="h-12 rounded-xl bg-white/10 border-white/10 text-white placeholder:text-blue-200/30"
                  />
                </div>
                <div className="relative">
                  <label className="text-sm text-blue-200/70 mb-1 block">Mot de passe</label>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="h-12 rounded-xl bg-white/10 border-white/10 text-white placeholder:text-blue-200/30 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[38px] text-blue-200/40 hover:text-blue-200/70"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <Button
                  type="submit"
                  disabled={adminLoading}
                  className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white text-base rounded-xl shadow-lg shadow-indigo-600/25"
                >
                  {adminLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Se connecter'}
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}