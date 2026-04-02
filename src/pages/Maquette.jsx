import React from 'react';
import { GraduationCap, BookOpen, Users, Radio, Library, Newspaper, MessageCircle, Award, Globe, Shield, BarChart3, FileText, Star, ChevronRight, CheckCircle, Zap, Heart, Lock } from 'lucide-react';

const features = [
  {
    icon: GraduationCap,
    title: 'Parcours académiques',
    desc: 'Du Brevet au Doctorat, 7 niveaux de formation couvrant théologie, missiologie, leadership et bien plus.',
    color: 'from-blue-500 to-indigo-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100'
  },
  {
    icon: BookOpen,
    title: 'Cours & Évaluations',
    desc: 'Cours audio, vidéo et documents PDF. Évaluations QCM en ligne avec notation automatique.',
    color: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100'
  },
  {
    icon: Library,
    title: 'Bibliothèque',
    desc: 'Accès à une bibliothèque numérique enrichie de ressources spirituelles et académiques.',
    color: 'from-purple-500 to-violet-600',
    bg: 'bg-purple-50',
    border: 'border-purple-100'
  },
  {
    icon: Radio,
    title: 'Conférences en direct',
    desc: 'Participez aux conférences audio/vidéo en temps réel avec messagerie instantanée et réactions.',
    color: 'from-orange-500 to-red-500',
    bg: 'bg-orange-50',
    border: 'border-orange-100'
  },
  {
    icon: MessageCircle,
    title: 'Groupes & Chat',
    desc: 'Communautés de discussion par domaine. Échanges entre étudiants et enseignants.',
    color: 'from-pink-500 to-rose-600',
    bg: 'bg-pink-50',
    border: 'border-pink-100'
  },
  {
    icon: Newspaper,
    title: 'Blog & Actualités',
    desc: 'Fil d\'actualités, articles spirituels, commentaires, likes et partages entre la communauté.',
    color: 'from-cyan-500 to-blue-500',
    bg: 'bg-cyan-50',
    border: 'border-cyan-100'
  },
  {
    icon: FileText,
    title: 'Documents de cours',
    desc: 'Documents pédagogiques téléchargeables, gratuits ou payants selon le niveau de formation.',
    color: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50',
    border: 'border-amber-100'
  },
  {
    icon: Award,
    title: 'Scolarité & Diplômes',
    desc: 'Gestion des frais de scolarité, bulletins de notes et suivi du parcours de diplômation.',
    color: 'from-lime-500 to-green-600',
    bg: 'bg-lime-50',
    border: 'border-lime-100'
  },
  {
    icon: BarChart3,
    title: 'Analytique avancée',
    desc: 'Tableau de bord temps réel : inscriptions, progrès, revenus, visites et engagement.',
    color: 'from-indigo-500 to-purple-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-100'
  },
];

const stats = [
  { value: '7', label: 'Domaines de formation', icon: BookOpen },
  { value: '7', label: 'Niveaux du Brevet au Doctorat', icon: GraduationCap },
  { value: '100%', label: 'Plateforme numérique', icon: Globe },
  { value: '24/7', label: 'Accès aux ressources', icon: Zap },
];


export default function Maquette() {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* Hero */}
      <div className="relative bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-400/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-400/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1600&q=80')] bg-cover bg-center opacity-5" />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 py-24 text-center text-white">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 mb-8 text-sm font-medium">
            <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
            Plateforme académique chrétienne — FTGJ
          </div>
          <div className="flex justify-center mb-8">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6988dd24f34fbffabf6f6551/4d6e0c9a2_IMG_4736.jpeg"
              alt="Logo FTGJ"
              className="w-28 h-28 rounded-3xl object-contain bg-white/10 backdrop-blur-sm p-3 shadow-2xl ring-4 ring-white/20"
            />
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            Formation Théologique<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">& Générale de Jésus</span>
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-10 leading-relaxed">
            Une plateforme numérique complète pour la formation académique et spirituelle des serviteurs de Dieu, accessible partout dans le monde.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/20">
              <CheckCircle className="w-5 h-5 text-green-300" />
              <span className="font-semibold">100% en ligne</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/20">
              <Globe className="w-5 h-5 text-blue-300" />
              <span className="font-semibold">Accès international</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/20">
              <Shield className="w-5 h-5 text-purple-300" />
              <span className="font-semibold">Certifié & sécurisé</span>
            </div>
          </div>
        </div>
        <div className="relative h-16 bg-white" style={{ clipPath: 'ellipse(60% 100% at 50% 100%)' }} />
      </div>

      {/* Stats */}
      <div className="max-w-5xl mx-auto px-6 -mt-8 mb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 text-center hover:shadow-2xl transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-lg">
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl font-black text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="max-w-6xl mx-auto px-6 mb-24">
        <div className="text-center mb-14">
          <span className="inline-block bg-blue-100 text-blue-700 text-sm font-bold px-4 py-2 rounded-full mb-4">FONCTIONNALITÉS</span>
          <h2 className="text-4xl font-black text-gray-900 mb-4">Tout ce dont vous avez besoin</h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">Une plateforme complète qui couvre tous les aspects de la formation académique et spirituelle.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className={`${f.bg} ${f.border} border rounded-3xl p-7 hover:shadow-xl transition-all hover:-translate-y-1 group`}>
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                <f.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Domaines */}
      <div className="max-w-6xl mx-auto px-6 mb-24">
        <div className="text-center mb-14">
          <span className="inline-block bg-purple-100 text-purple-700 text-sm font-bold px-4 py-2 rounded-full mb-4">DOMAINES</span>
          <h2 className="text-4xl font-black text-gray-900 mb-4">7 domaines de formation</h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">Des formations complètes couvrant tous les aspects du ministère chrétien.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: 'THÉOLOGIE', levels: '7 niveaux', icon: '✝️', color: 'from-blue-500 to-indigo-600' },
            { name: 'LEADERSHIP & ADMINISTRATION CHRÉTIENNE', levels: '3 niveaux', icon: '👑', color: 'from-purple-500 to-violet-600' },
            { name: 'MISSIOLOGIE', levels: '3 niveaux', icon: '🌍', color: 'from-green-500 to-emerald-600' },
            { name: 'ÉCOLE PROPHÉTIQUES', levels: '4 niveaux', icon: '🔥', color: 'from-orange-500 to-red-500' },
            { name: 'ENTREPRENEURIAT', levels: '3 niveaux', icon: '💼', color: 'from-amber-500 to-yellow-600' },
            { name: 'AUMÔNERIE', levels: '3 niveaux', icon: '🕊️', color: 'from-cyan-500 to-blue-500' },
            { name: 'MINISTÈRE APOSTOLIQUE', levels: '3 niveaux', icon: '⚡', color: 'from-pink-500 to-rose-600' },
          ].map((d, i) => (
            <div key={i} className={`${i === 6 ? 'md:col-span-2' : ''} flex items-center gap-5 bg-gray-50 border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all hover:border-gray-200 group`}>
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${d.color} flex items-center justify-center text-2xl shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform`}>
                {d.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">{d.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{d.levels} · Licence, Master, Doctorat</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors" />
            </div>
          ))}
        </div>
      </div>

      {/* Sécurité & Accès */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 py-20 px-6 mb-24">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <span className="inline-block bg-white/20 text-white text-sm font-bold px-4 py-2 rounded-full mb-6">SÉCURITÉ</span>
              <h2 className="text-4xl font-black mb-6">Accès sécurisé & contrôlé</h2>
              <p className="text-blue-100 text-lg leading-relaxed mb-8">
                Chaque étudiant est certifié par l'administration. Les accès sont strictement contrôlés avec différents niveaux de permissions.
              </p>
              <div className="space-y-4">
                {[
                  'Certification manuelle de chaque étudiant',
                  'Système de permissions par rôle',
                  'Blocage et gestion des comptes',
                  'Traçabilité complète des actions',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-400/30 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-green-300" />
                    </div>
                    <span className="text-blue-100 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Shield, label: 'Admin principal', desc: 'Accès complet' },
                { icon: Users, label: 'Admin secondaire', desc: 'Accès restreint' },
                { icon: GraduationCap, label: 'Étudiant certifié', desc: 'Accès complet' },
                { icon: Lock, label: 'En attente', desc: 'Accès limité' },
              ].map((r, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 text-white text-center">
                  <r.icon className="w-8 h-8 mx-auto mb-3 text-blue-200" />
                  <p className="font-bold text-sm">{r.label}</p>
                  <p className="text-xs text-blue-300 mt-1">{r.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Final */}
      <div className="max-w-4xl mx-auto px-6 mb-20 text-center">
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-100 rounded-3xl p-14">
          <div className="text-6xl mb-6">🙏</div>
          <h2 className="text-4xl font-black text-gray-900 mb-5">Rejoignez la communauté FTGJ</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            Des étudiants de plusieurs pays bénéficient déjà de cette plateforme pour leur formation spirituelle et académique.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 bg-white rounded-2xl px-6 py-3 shadow border border-gray-100 font-semibold text-gray-700">
              <Heart className="w-5 h-5 text-red-500 fill-red-500" />
              Fait avec passion
            </div>
            <div className="flex items-center gap-2 bg-white rounded-2xl px-6 py-3 shadow border border-gray-100 font-semibold text-gray-700">
              <Globe className="w-5 h-5 text-blue-500" />
              Accessible partout
            </div>
            <div className="flex items-center gap-2 bg-white rounded-2xl px-6 py-3 shadow border border-gray-100 font-semibold text-gray-700">
              <Zap className="w-5 h-5 text-yellow-500" />
              Toujours en évolution
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 py-10 px-6 text-center">
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6988dd24f34fbffabf6f6551/4d6e0c9a2_IMG_4736.jpeg"
          alt="Logo"
          className="w-12 h-12 rounded-xl object-contain mx-auto mb-4 shadow"
        />
        <p className="text-gray-400 text-sm">© 2024 Formation Théologique & Générale de Jésus (FTGJ)</p>
        <p className="text-gray-300 text-xs mt-1">Toute reproduction interdite sans autorisation</p>
      </div>
    </div>
  );
}