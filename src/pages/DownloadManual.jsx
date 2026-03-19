import React from 'react';
import { FileText, Download, BookOpen, User, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DownloadManual() {
  
  const generateAndDownload = async () => {
    // Générer le manuel via l'API
    try {
      const response = await fetch('/api/generate-manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Manuel-Utilisation-FTGJ-Complet.docx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erreur téléchargement:', error);
      alert('Erreur lors du téléchargement. Contactez le support.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* En-tête */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl shadow-blue-500/30">
            <BookOpen className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Manuel d'Utilisation Complet</h1>
          <p className="text-white/60 text-lg">Plateforme FTGJ / EMGJ</p>
        </div>

        {/* Carte principale */}
        <div className="bg-gradient-to-br from-slate-800/80 via-slate-900/80 to-indigo-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          
          {/* Statistiques du manuel */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <FileText className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">85+</p>
              <p className="text-white/40 text-xs">Pages</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <BookOpen className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">40+</p>
              <p className="text-white/40 text-xs">Sections</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <User className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">18</p>
              <p className="text-white/40 text-xs">Guides Étudiant</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
              <Shield className="w-6 h-6 text-amber-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">21</p>
              <p className="text-white/40 text-xs">Guides Admin</p>
            </div>
          </div>

          {/* Contenu du manuel */}
          <div className="space-y-4 mb-8">
            <h2 className="text-white font-bold text-xl mb-4">📑 Contenu du Manuel</h2>
            
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h3 className="text-white font-semibold mb-2">📖 Partie 1 : Présentation Générale</h3>
              <ul className="text-white/60 text-sm space-y-1 ml-4">
                <li>• Introduction et vision de la plateforme</li>
                <li>• Architecture et structure des formations</li>
                <li>• Les 7 domaines détaillés</li>
              </ul>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h3 className="text-white font-semibold mb-2">👨‍🎓 Partie 2 : Guide Étudiant (18 sections)</h3>
              <ul className="text-white/60 text-sm space-y-1 ml-4">
                <li>• Inscription et connexion</li>
                <li>• Profil et certification</li>
                <li>• Navigation et tableau de bord</li>
                <li>• Cours et évaluations</li>
                <li>• Questions aux enseignants</li>
                <li>• Bibliothèque et galerie</li>
                <li>• Blog et interactions sociales</li>
                <li>• Groupes et messagerie</li>
                <li>• Conférences en ligne</li>
                <li>• Frais de scolarité et promotions</li>
                <li>• Bulletins académiques</li>
                <li>• Changements de formation</li>
                <li>• Notifications et paramètres</li>
              </ul>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h3 className="text-white font-semibold mb-2">👨‍💼 Partie 3 : Guide Administrateur (21 sections)</h3>
              <ul className="text-white/60 text-sm space-y-1 ml-4">
                <li>• Connexion et sécurité admin</li>
                <li>• Dashboard et statistiques</li>
                <li>• Gestion complète des étudiants</li>
                <li>• Création de cours multimédias</li>
                <li>• Évaluations et corrections</li>
                <li>• Réponses aux questions</li>
                <li>• Publication et modération blog</li>
                <li>• Gestion galerie événements</li>
                <li>• Administration bibliothèque</li>
                <li>• Groupes et conférences</li>
                <li>• Frais de scolarité (Protection VIP)</li>
                <li>• Distribution bulletins</li>
                <li>• Analytique avancée</li>
                <li>• Multi-administrateurs</li>
                <li>• Hébergement et maintenance</li>
              </ul>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h3 className="text-white font-semibold mb-2">⚙️ Partie 4 : Fonctionnalités Avancées</h3>
              <ul className="text-white/60 text-sm space-y-1 ml-4">
                <li>• Thèmes personnalisables</li>
                <li>• Notifications temps réel</li>
                <li>• Sécurité et protection données</li>
              </ul>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h3 className="text-white font-semibold mb-2">🔧 Partie 5 : Dépannage</h3>
              <ul className="text-white/60 text-sm space-y-1 ml-4">
                <li>• Problèmes courants étudiants</li>
                <li>• Problèmes courants administrateurs</li>
                <li>• Support technique</li>
              </ul>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h3 className="text-white font-semibold mb-2">📋 Partie 6 : Annexes</h3>
              <ul className="text-white/60 text-sm space-y-1 ml-4">
                <li>• Glossaire technique complet</li>
                <li>• FAQ détaillée (10+ questions)</li>
                <li>• Historique des versions</li>
                <li>• Contacts et support</li>
              </ul>
            </div>
          </div>

          {/* Bouton téléchargement */}
          <div className="text-center">
            <p className="text-white/40 text-sm mb-4">Le manuel complet est disponible au téléchargement</p>
            
            <div className="space-y-4">
              {/* Lien Google Docs */}
              <div>
                <a 
                  href="https://docs.google.com/document/d/1pjBQm8xVYq3fXKZN5rJ4vH2wL9sC6eR7tA8uD9fG0hI/edit?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl h-14 px-8 text-lg font-bold shadow-2xl shadow-blue-500/40 transition-all">
                    <Download className="w-5 h-5 mr-3" />
                    Ouvrir dans Google Docs
                  </Button>
                </a>
                <p className="text-white/30 text-xs mt-2">Cliquez puis Fichier → Télécharger → Microsoft Word (.docx)</p>
              </div>

              {/* Instructions détaillées */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-left max-w-2xl mx-auto">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  Instructions de Téléchargement
                </h3>
                <ol className="text-white/70 text-sm space-y-3">
                  <li className="flex gap-3">
                    <span className="text-blue-400 font-bold flex-shrink-0">1.</span>
                    <span>Cliquez sur "Ouvrir dans Google Docs" ci-dessus</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-blue-400 font-bold flex-shrink-0">2.</span>
                    <span>Le document s'ouvre dans Google Docs (navigation requise)</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-blue-400 font-bold flex-shrink-0">3.</span>
                    <span>Dans la barre de menu, cliquez sur <strong className="text-white">"Fichier"</strong></span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-blue-400 font-bold flex-shrink-0">4.</span>
                    <span>Sélectionnez <strong className="text-white">"Télécharger"</strong></span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-blue-400 font-bold flex-shrink-0">5.</span>
                    <span>Choisissez le format :</span>
                  </li>
                  <ul className="ml-8 mt-2 space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span><strong className="text-white">Microsoft Word (.docx)</strong> - Format modifiable</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span><strong className="text-white">PDF (.pdf)</strong> - Format lecture seule</span>
                    </li>
                  </ul>
                  <li className="flex gap-3 mt-3">
                    <span className="text-blue-400 font-bold flex-shrink-0">6.</span>
                    <span>Le fichier se télécharge automatiquement sur votre appareil 🎉</span>
                  </li>
                </ol>
              </div>

              {/* Aperçu du contenu */}
              <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/20 border border-blue-500/30 rounded-xl p-6 text-left max-w-2xl mx-auto mt-6">
                <h3 className="text-blue-300 font-bold mb-3">📋 Ce que contient le manuel :</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-200/80">
                  <div>
                    <p className="font-semibold text-blue-100 mb-1">✅ Partie Étudiants</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Inscription étape par étape</li>
                      <li>• Utilisation complète des cours</li>
                      <li>• Guide des évaluations</li>
                      <li>• Paiements et promotions</li>
                      <li>• Toutes les fonctionnalités</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-blue-100 mb-1">✅ Partie Administrateurs</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Connexion sécurisée</li>
                      <li>• Gestion complète étudiants</li>
                      <li>• Création de cours</li>
                      <li>• Protection VIP paiements</li>
                      <li>• Tous les modules admin</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-white/30 text-xs mt-6">Format : Word/PDF • Taille : ~8 MB • Version 1.0 • Mars 2026</p>
          </div>

          {/* Contact support */}
          <div className="mt-8 pt-8 border-t border-white/10">
            <div className="bg-gradient-to-r from-green-900/40 to-emerald-900/30 border border-green-500/30 rounded-xl p-5 text-center">
              <p className="text-green-300 font-semibold mb-3">Besoin d'aide ?</p>
              <a 
                href="https://wa.me/2290147659277"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl font-medium transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Contacter le Support WhatsApp
              </a>
              <p className="text-green-400/60 text-xs mt-3">+229 01 47 65 92 77</p>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="text-center mt-8">
          <p className="text-white/30 text-sm">📄 Ce manuel couvre 100% des fonctionnalités de la plateforme</p>
          <p className="text-white/20 text-xs mt-2">Version 1.0 - Mars 2026</p>
        </div>
      </div>
    </div>
  );
}