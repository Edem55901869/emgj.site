import React, { useState } from 'react';
import { FileText, Download, Loader2, Book, Users, GraduationCap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import AdminTopNav from '../components/admin/AdminTopNav';
import AdminGuard from '../components/admin/AdminGuard';

export default function AdminDocumentation() {
  const [downloading, setDownloading] = useState(false);

  const generateDocContent = () => {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Calibri', 'Arial', sans-serif; line-height: 1.6; margin: 40px; color: #1a1a1a; }
    h1 { color: #2563eb; font-size: 28px; border-bottom: 3px solid #2563eb; padding-bottom: 10px; margin-top: 30px; }
    h2 { color: #4f46e5; font-size: 22px; margin-top: 25px; border-left: 4px solid #4f46e5; padding-left: 15px; }
    h3 { color: #6366f1; font-size: 18px; margin-top: 20px; }
    p { margin: 10px 0; text-align: justify; }
    ul, ol { margin: 10px 0; padding-left: 30px; }
    li { margin: 8px 0; }
    .section { margin-bottom: 40px; }
    .highlight { background-color: #dbeafe; padding: 15px; border-radius: 8px; border-left: 4px solid #2563eb; margin: 15px 0; }
    .warning { background-color: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 15px 0; }
    .note { background-color: #dcfce7; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981; margin: 15px 0; }
    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
    th, td { border: 1px solid #cbd5e1; padding: 12px; text-align: left; }
    th { background-color: #2563eb; color: white; font-weight: bold; }
    .cover { text-align: center; padding: 60px 0; }
    .cover h1 { font-size: 36px; color: #1e40af; border: none; }
    .cover p { font-size: 18px; color: #64748b; margin-top: 20px; }
  </style>
</head>
<body>

<div class="cover">
  <h1>📚 MANUEL D'UTILISATION COMPLET</h1>
  <h2>Plateforme FTGJ - EMGJ</h2>
  <p>Faculté de Théologie et Gestion de l'Église Ministérielle de Jésus</p>
  <p><strong>Version 1.0 - Mars 2026</strong></p>
  <p>Documentation technique et guide utilisateur</p>
</div>

<div style="page-break-after: always;"></div>

<h1>📑 TABLE DES MATIÈRES</h1>
<ol>
  <li><strong>Introduction à la plateforme</strong></li>
  <li><strong>Guide Étudiant</strong>
    <ul>
      <li>Inscription et configuration du profil</li>
      <li>Navigation et utilisation des cours</li>
      <li>Gestion académique</li>
      <li>Communication et collaboration</li>
    </ul>
  </li>
  <li><strong>Guide Administrateur</strong>
    <ul>
      <li>Connexion et tableau de bord</li>
      <li>Gestion des étudiants</li>
      <li>Gestion des cours et évaluations</li>
      <li>Gestion du contenu</li>
      <li>Outils avancés</li>
    </ul>
  </li>
  <li><strong>Fonctionnalités avancées</strong></li>
  <li><strong>Dépannage et FAQ</strong></li>
</ol>

<div style="page-break-after: always;"></div>

<div class="section">
<h1>1️⃣ INTRODUCTION À LA PLATEFORME</h1>

<h2>🎯 Vue d'ensemble</h2>
<p>La plateforme FTGJ-EMGJ est un système de gestion de l'apprentissage (LMS) conçu spécifiquement pour la formation théologique et ministérielle. Elle offre un environnement complet pour l'enseignement à distance, la gestion académique et la collaboration entre étudiants et formateurs.</p>

<div class="highlight">
<strong>🌟 Fonctionnalités principales :</strong>
<ul>
  <li>✅ Gestion complète des étudiants et des cours</li>
  <li>✅ Système d'évaluation avec QCM et rédaction</li>
  <li>✅ Bibliothèque numérique intégrée</li>
  <li>✅ Conférences audio/vidéo en direct</li>
  <li>✅ Messagerie et groupes de discussion</li>
  <li>✅ Gestion des paiements et scolarité</li>
  <li>✅ Blog et galerie d'événements</li>
</ul>
</div>

<h2>🎓 Structure académique</h2>
<p>La plateforme propose 7 domaines de formation théologique :</p>
<ol>
  <li><strong>THÉOLOGIE</strong> - Étude approfondie des doctrines chrétiennes</li>
  <li><strong>LEADERSHIP ET ADMINISTRATION CHRÉTIENNE</strong> - Formation au leadership d'Église</li>
  <li><strong>MISSIOLOGIE</strong> - Mission et évangélisation</li>
  <li><strong>ÉCOLE PROPHÉTIQUES</strong> - Ministère prophétique</li>
  <li><strong>ENTREPRENEURIAT</strong> - Création et gestion d'entreprises chrétiennes</li>
  <li><strong>AUMÔNERIE</strong> - Accompagnement spirituel</li>
  <li><strong>MINISTÈRE APOSTOLIQUE</strong> - Formation apostolique</li>
</ol>

<h3>📊 Niveaux de formation</h3>
<table>
  <tr>
    <th>Niveau</th>
    <th>Durée</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>École des évangélistes</td>
    <td>6 mois</td>
    <td>Formation de base à l'évangélisation</td>
  </tr>
  <tr>
    <td>Discipolat</td>
    <td>1 an</td>
    <td>Formation au discipulat chrétien</td>
  </tr>
  <tr>
    <td>Brevet</td>
    <td>2 ans</td>
    <td>Diplôme de base</td>
  </tr>
  <tr>
    <td>Baccalauréat</td>
    <td>3 ans</td>
    <td>Formation intermédiaire</td>
  </tr>
  <tr>
    <td>Licence</td>
    <td>3-4 ans</td>
    <td>Premier cycle universitaire</td>
  </tr>
  <tr>
    <td>Master</td>
    <td>2 ans</td>
    <td>Deuxième cycle universitaire</td>
  </tr>
  <tr>
    <td>Doctorat</td>
    <td>3-5 ans</td>
    <td>Recherche et expertise</td>
  </tr>
</table>
</div>

<div style="page-break-after: always;"></div>

<div class="section">
<h1>2️⃣ GUIDE ÉTUDIANT</h1>

<h2>👤 Inscription et configuration du profil</h2>

<h3>📝 Première connexion</h3>
<p><strong>Étape 1 : Accéder à la plateforme</strong></p>
<ol>
  <li>Ouvrez votre navigateur web (Chrome, Firefox, Safari, Edge)</li>
  <li>Accédez à l'URL de la plateforme FTGJ-EMGJ</li>
  <li>Sur la page d'accueil, cliquez sur le bouton <strong>"Connexion Étudiant"</strong></li>
</ol>

<div class="note">
<strong>💡 Note :</strong> La première connexion utilise le système d'authentification Base44. Vous serez redirigé vers une page de connexion sécurisée.
</div>

<p><strong>Étape 2 : Compléter votre profil</strong></p>
<p>Après votre première connexion, vous devez obligatoirement compléter votre profil :</p>
<ul>
  <li>📌 <strong>Informations personnelles</strong> : Prénom, nom, date et lieu de naissance</li>
  <li>📍 <strong>Localisation</strong> : Pays et ville de résidence</li>
  <li>📱 <strong>Contact</strong> : Numéro WhatsApp (format international)</li>
  <li>🎓 <strong>Formation</strong> : Choisir votre domaine et type de formation</li>
  <li>📄 <strong>Diplôme précédent</strong> : Télécharger la preuve de votre dernier diplôme (si applicable)</li>
  <li>📷 <strong>Photo de profil</strong> : Télécharger une photo professionnelle</li>
</ul>

<div class="warning">
<strong>⚠️ Important :</strong> Votre compte restera en statut "en attente" jusqu'à validation par l'administration. Vous recevrez une notification une fois certifié.
</div>

<h2>🏠 Navigation dans la plateforme</h2>

<h3>📱 Menu de navigation principal (barre inférieure)</h3>
<table>
  <tr>
    <th>Section</th>
    <th>Icône</th>
    <th>Fonction</th>
  </tr>
  <tr>
    <td><strong>Accueil</strong></td>
    <td>🏠</td>
    <td>Tableau de bord personnel, fil d'actualité du blog</td>
  </tr>
  <tr>
    <td><strong>Cours</strong></td>
    <td>📚</td>
    <td>Accès à tous vos cours et ressources pédagogiques</td>
  </tr>
  <tr>
    <td><strong>Biblio</strong></td>
    <td>📖</td>
    <td>Bibliothèque numérique avec documents téléchargeables</td>
  </tr>
  <tr>
    <td><strong>Galerie</strong></td>
    <td>🖼️</td>
    <td>Photos et vidéos des événements FTGJ</td>
  </tr>
  <tr>
    <td><strong>Plus</strong></td>
    <td>⚙️</td>
    <td>Profil, scolarité, conférences, groupes, paramètres</td>
  </tr>
</table>

<h2>📚 Utilisation des cours</h2>

<h3>🔍 Accéder à un cours</h3>
<ol>
  <li>Cliquez sur l'onglet <strong>"Cours"</strong> dans le menu inférieur</li>
  <li>Parcourez les cours disponibles pour votre formation</li>
  <li>Les cours suivent un ordre hiérarchique (ordre 1, 2, 3...)</li>
  <li>Cliquez sur une carte de cours pour l'ouvrir</li>
</ol>

<div class="highlight">
<strong>🎯 Structure d'un cours :</strong>
<ul>
  <li>📝 <strong>Description</strong> : Présentation et objectifs</li>
  <li>👨‍🏫 <strong>Enseignant</strong> : Nom du formateur</li>
  <li>🎵 <strong>Audios</strong> : Fichiers audio des leçons (jusqu'à 10)</li>
  <li>🎬 <strong>Vidéos</strong> : Contenus vidéo (jusqu'à 10)</li>
  <li>📄 <strong>Documents</strong> : PDF, Word, PowerPoint (jusqu'à 10)</li>
  <li>✅ <strong>Évaluation</strong> : QCM et/ou questions de rédaction</li>
</ul>
</div>

<h3>🎓 Passer une évaluation</h3>
<p><strong>Étape 1 : Préparation</strong></p>
<ul>
  <li>Étudiez tous les contenus du cours (audio, vidéo, documents)</li>
  <li>Prenez des notes et révisez les concepts clés</li>
  <li>Une fois prêt, cliquez sur <strong>"Commencer l'évaluation"</strong></li>
</ul>

<p><strong>Étape 2 : Répondre aux questions</strong></p>
<ul>
  <li>Les questions apparaissent une par une</li>
  <li>Pour les <strong>QCM</strong> : Sélectionnez la bonne réponse parmi les propositions</li>
  <li>Pour les <strong>questions de rédaction</strong> : Rédigez une réponse complète (minimum 50 mots)</li>
  <li>Cliquez sur <strong>"Question suivante"</strong> pour progresser</li>
</ul>

<p><strong>Étape 3 : Soumission et résultats</strong></p>
<ul>
  <li>Une fois toutes les questions complétées, cliquez sur <strong>"Soumettre l'évaluation"</strong></li>
  <li>Votre note est calculée automatiquement (QCM) et manuellement (rédaction)</li>
  <li>La progression du cours est mise à jour dans votre profil</li>
</ul>

<div class="note">
<strong>📊 Barème de notation :</strong>
<ul>
  <li>✅ <strong>Validé</strong> : Note ≥ 10/20</li>
  <li>❌ <strong>Non validé</strong> : Note < 10/20 (possibilité de repasser l'évaluation)</li>
</ul>
</div>

<h2>💬 Poser une question sur un cours</h2>
<ol>
  <li>Ouvrez le cours concerné</li>
  <li>Cliquez sur le bouton <strong>"Poser une question"</strong></li>
  <li>Rédigez votre question dans le champ de texte</li>
  <li>Optionnel : Ajoutez un enregistrement vocal (jusqu'à 2 minutes)</li>
  <li>Optionnel : Joignez des images (jusqu'à 3)</li>
  <li>Cliquez sur <strong>"Envoyer la question"</strong></li>
  <li>Vous recevrez une notification lorsque l'administration répondra</li>
</ol>

<h2>💰 Gestion de la scolarité</h2>

<h3>💳 Payer les frais académiques</h3>
<p><strong>Types de frais disponibles :</strong></p>
<ul>
  <li>🎓 <strong>Frais de diplôme</strong> : Coût de la formation complète</li>
  <li>🎉 <strong>Frais de graduation</strong> : Cérémonie de remise des diplômes</li>
</ul>

<p><strong>Procédure de paiement :</strong></p>
<ol>
  <li>Allez dans <strong>"Plus" → "Scolarité"</strong></li>
  <li>Consultez les frais disponibles pour votre formation</li>
  <li>Cliquez sur <strong>"Payer maintenant"</strong> pour le frais souhaité</li>
  <li>Vous serez redirigé vers la plateforme de paiement (Wave, FedaPay, etc.)</li>
  <li>Effectuez le paiement et <strong>conservez la référence de transaction</strong></li>
  <li>Revenez sur la plateforme et entrez votre référence de transaction</li>
  <li>Sélectionnez la méthode de paiement utilisée</li>
  <li>Cliquez sur <strong>"Confirmer le paiement"</strong></li>
  <li>L'administration vérifiera votre paiement sous 24h</li>
</ol>

<div class="warning">
<strong>⚠️ Important :</strong> Conservez toujours votre référence de transaction ! Elle est essentielle pour la vérification de votre paiement.
</div>

<h2>🎤 Participer aux conférences</h2>

<h3>📻 Rejoindre une conférence audio/vidéo</h3>
<ol>
  <li>Allez dans <strong>"Plus" → "Conférences"</strong></li>
  <li>Consultez les conférences planifiées ou en cours</li>
  <li>Entrez le <strong>code d'accès</strong> fourni par l'administration</li>
  <li>Cliquez sur <strong>"Rejoindre la conférence"</strong></li>
  <li>Autorisez l'accès à votre microphone si demandé</li>
</ol>

<p><strong>Pendant la conférence :</strong></p>
<ul>
  <li>🎙️ Activez/désactivez votre micro avec le bouton microphone</li>
  <li>✋ Levez la main pour demander la parole</li>
  <li>💬 Envoyez des messages dans le chat</li>
  <li>❤️ Réagissez avec des emojis (👍 ❤️ 👏 🎉 🔥)</li>
</ul>

<h2>👥 Groupes de discussion</h2>

<h3>🔍 Rejoindre un groupe</h3>
<ol>
  <li>Allez dans <strong>"Plus" → "Groupes"</strong></li>
  <li>Parcourez les groupes disponibles</li>
  <li>Cliquez sur <strong>"Rejoindre"</strong> pour un groupe public</li>
  <li>Pour un groupe privé, envoyez une <strong>demande d'adhésion</strong></li>
  <li>Une fois accepté, vous pouvez participer aux discussions</li>
</ol>

<p><strong>Communication dans les groupes :</strong></p>
<ul>
  <li>✍️ Envoyez des messages texte</li>
  <li>🎤 Envoyez des messages vocaux</li>
  <li>📷 Partagez des images</li>
  <li>❤️ Réagissez aux messages avec des emojis</li>
</ul>

<h2>📜 Obtenir votre bulletin</h2>
<ol>
  <li>Complétez tous les cours de votre formation</li>
  <li>Allez dans <strong>"Plus" → "Bulletins"</strong></li>
  <li>Si vous avez terminé tous les cours requis, cliquez sur <strong>"Générer mon bulletin"</strong></li>
  <li>Le bulletin PDF sera créé automatiquement avec vos notes</li>
  <li>Téléchargez-le en cliquant sur <strong>"Télécharger"</strong></li>
</ol>

<div class="note">
<strong>📊 Contenu du bulletin :</strong> Votre bulletin contient la liste de tous vos cours complétés, vos notes, votre moyenne générale et la date d'obtention.
</div>
</div>

<div style="page-break-after: always;"></div>

<div class="section">
<h1>3️⃣ GUIDE ADMINISTRATEUR - VERSION COMPLÈTE</h1>

<div class="highlight">
<strong>📋 SOMMAIRE DÉTAILLÉ DE LA SECTION ADMINISTRATEUR :</strong>
<ol style="line-height: 2;">
  <li>Connexion et authentification sécurisée</li>
  <li>Tableau de bord et analytics en temps réel</li>
  <li>Gestion complète des étudiants (A-Z)</li>
  <li>Création et gestion des cours avancée</li>
  <li>Système d'évaluation et notation</li>
  <li>Gestion du contenu multimédia</li>
  <li>Questions de cours et support étudiant</li>
  <li>Blog et communications</li>
  <li>Bibliothèque numérique</li>
  <li>Gestion financière et scolarité</li>
  <li>Conférences en direct</li>
  <li>Groupes et communautés</li>
  <li>Galerie événementielle</li>
  <li>Bulletins académiques</li>
  <li>Analytique et rapports</li>
  <li>Gestion des administrateurs</li>
  <li>Paramètres système avancés</li>
  <li>Sécurité et maintenance</li>
  <li>Troubleshooting administrateur</li>
  <li>Best practices et optimisation</li>
</ol>
</div>

<h2>🔐 CONNEXION ET AUTHENTIFICATION SÉCURISÉE</h2>

<h3>🚪 Accéder à l'interface admin</h3>

<p><strong>Méthode 1 : Connexion depuis la page d'accueil</strong></p>
<ol>
  <li>Ouvrez votre navigateur web (Chrome recommandé pour une meilleure compatibilité)</li>
  <li>Accédez à l'URL de la plateforme FTGJ-EMGJ</li>
  <li>Sur la page d'accueil, localisez le panneau <strong>"Connexion Admin"</strong> (généralement à droite)</li>
  <li>Entrez votre <strong>email administrateur</strong> exact (sensible à la casse)</li>
  <li>Entrez votre <strong>mot de passe</strong></li>
  <li>Cliquez sur le bouton <strong>"Se connecter"</strong></li>
  <li>Si les identifiants sont corrects, vous serez redirigé vers le tableau de bord administrateur</li>
</ol>

<div class="warning">
<strong>⚠️ Sécurité de connexion :</strong>
<ul>
  <li>Les tentatives de connexion sont illimitées (système de verrouillage désactivé pour les admins)</li>
  <li>En cas d'échec, vérifiez l'orthographe de votre email et mot de passe</li>
  <li>Les mots de passe sont sensibles à la casse (majuscules/minuscules)</li>
  <li>Utilisez toujours une connexion sécurisée (HTTPS)</li>
</ul>
</div>

<p><strong>Méthode 2 : Accès direct par URL</strong></p>
<p>Si vous connaissez l'URL directe de l'interface admin, vous pouvez y accéder directement. Cependant, vous serez automatiquement redirigé vers la page de connexion si vous n'êtes pas authentifié.</p>

<h3>🔑 Types d'administrateurs et hiérarchie</h3>

<table>
  <tr>
    <th style="width: 30%;">Type</th>
    <th style="width: 35%;">Permissions</th>
    <th style="width: 35%;">Capacités spéciales</th>
  </tr>
  <tr>
    <td><strong>Administrateur Principal</strong></td>
    <td>Accès complet et illimité à toutes les fonctionnalités</td>
    <td>
      • Créer/modifier/supprimer des admins<br>
      • Accès aux outils VIP<br>
      • Gérer l'hébergement<br>
      • Paramètres système<br>
      • Assistant IA
    </td>
  </tr>
  <tr>
    <td><strong>Administrateur Secondaire</strong></td>
    <td>Accès personnalisé selon les permissions attribuées</td>
    <td>
      • Permissions granulaires<br>
      • Peut être limité à certaines sections<br>
      • Ne peut pas gérer d'autres admins<br>
      • Supervision par admin principal
    </td>
  </tr>
</table>

<h3>🔐 Système de permissions pour admins secondaires</h3>

<p>Lors de la création d'un administrateur secondaire, vous pouvez activer/désactiver individuellement chaque permission :</p>

<table>
  <tr>
    <th>Permission</th>
    <th>Description</th>
    <th>Sections accessibles</th>
  </tr>
  <tr>
    <td><strong>dashboard</strong></td>
    <td>Tableau de bord</td>
    <td>Vue d'ensemble, statistiques générales</td>
  </tr>
  <tr>
    <td><strong>students</strong></td>
    <td>Gestion étudiants</td>
    <td>Liste étudiants, certification, blocage, changements de formation</td>
  </tr>
  <tr>
    <td><strong>courses</strong></td>
    <td>Gestion cours</td>
    <td>Création cours, évaluations, questions de cours</td>
  </tr>
  <tr>
    <td><strong>blog</strong></td>
    <td>Gestion blog</td>
    <td>Articles, commentaires, galerie</td>
  </tr>
  <tr>
    <td><strong>library</strong></td>
    <td>Bibliothèque</td>
    <td>Documents, ajout/suppression</td>
  </tr>
  <tr>
    <td><strong>groups</strong></td>
    <td>Groupes</td>
    <td>Création groupes, gestion membres</td>
  </tr>
  <tr>
    <td><strong>tuition</strong></td>
    <td>Scolarité</td>
    <td>Configuration frais, vérification paiements</td>
  </tr>
  <tr>
    <td><strong>bulletins</strong></td>
    <td>Bulletins</td>
    <td>Consultation bulletins étudiants</td>
  </tr>
  <tr>
    <td><strong>conferences</strong></td>
    <td>Conférences</td>
    <td>Création, animation conférences</td>
  </tr>
  <tr>
    <td><strong>questions</strong></td>
    <td>Questions étudiants</td>
    <td>Réponses aux questions générales</td>
  </tr>
  <tr>
    <td><strong>analytics</strong></td>
    <td>Analytique</td>
    <td>Statistiques, rapports, graphiques</td>
  </tr>
  <tr>
    <td><strong>settings</strong></td>
    <td>Paramètres</td>
    <td>Configuration générale</td>
  </tr>
  <tr>
    <td><strong>admin</strong></td>
    <td>Administration système</td>
    <td>Gérer admins, hébergement, IA, vidéo accueil (réservé admin principal)</td>
  </tr>
</table>

<div class="note">
<strong>💡 Conseil :</strong> Pour un admin débutant, activez uniquement les permissions essentielles (dashboard, students, courses) puis ajoutez progressivement d'autres permissions selon les besoins.
</div>

<h3>⏱️ Gestion de session et durée de connexion</h3>

<p><strong>Durée de session :</strong></p>
<ul>
  <li>🕐 <strong>Session active :</strong> 8 heures après connexion</li>
  <li>💤 <strong>Timeout d'inactivité :</strong> 2 heures sans interaction</li>
  <li>🔄 <strong>Renouvellement :</strong> Chaque action réinitialise le timer d'inactivité</li>
  <li>🔔 <strong>Vérification automatique :</strong> Toutes les 5 minutes, le système vérifie la validité de votre session</li>
</ul>

<div class="warning">
<strong>⚠️ Expiration de session :</strong> Si votre session expire, vous serez automatiquement déconnecté et redirigé vers la page de connexion. Toutes les modifications non sauvegardées seront perdues.
</div>

<p><strong>Actions qui maintiennent la session active :</strong></p>
<ul>
  <li>Cliquer sur n'importe quel bouton</li>
  <li>Naviguer entre les pages</li>
  <li>Faire défiler la page (scroll)</li>
  <li>Interagir avec les formulaires</li>
  <li>Utiliser le clavier</li>
</ul>

<h3>🚪 Déconnexion sécurisée</h3>

<p><strong>Méthode recommandée :</strong></p>
<ol>
  <li>Cliquez sur le menu <strong>"Plus" (⚙️)</strong> en haut à droite</li>
  <li>Sélectionnez <strong>"Déconnexion"</strong></li>
  <li>Vous serez immédiatement déconnecté et redirigé vers la page de connexion</li>
  <li>Toutes les données de session sont effacées du navigateur</li>
</ol>

<div class="highlight">
<strong>🔒 Nettoyage de session :</strong> Lors de la déconnexion, les éléments suivants sont automatiquement supprimés :
<ul>
  <li>Token d'authentification</li>
  <li>Données de session admin</li>
  <li>Mode prévisualisation étudiant (si actif)</li>
  <li>Historique d'activité</li>
</ul>
</div>

<h2>📊 Tableau de bord administrateur</h2>

<p>Le tableau de bord offre une vue d'ensemble de la plateforme :</p>

<table>
  <tr>
    <th>Métrique</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>Total étudiants</td>
    <td>Nombre total d'étudiants inscrits</td>
  </tr>
  <tr>
    <td>En attente</td>
    <td>Comptes étudiants en attente de certification</td>
  </tr>
  <tr>
    <td>Certifiés</td>
    <td>Étudiants avec profil validé</td>
  </tr>
  <tr>
    <td>Total cours</td>
    <td>Nombre de cours disponibles sur la plateforme</td>
  </tr>
  <tr>
    <td>Articles blog</td>
    <td>Publications sur le blog</td>
  </tr>
  <tr>
    <td>Documents bibliothèque</td>
    <td>Ressources disponibles dans la bibliothèque</td>
  </tr>
</table>

<h2>👥 Gestion des étudiants</h2>

<h3>🔍 Rechercher et filtrer les étudiants</h3>
<p><strong>Menu : Étudiants</strong></p>
<ul>
  <li>🔎 Recherchez par nom, email ou localisation</li>
  <li>🎓 Filtrez par domaine de formation</li>
  <li>📊 Filtrez par statut (En attente, Certifié, Rejeté, Bloqué)</li>
</ul>

<h3>✅ Certifier un étudiant</h3>
<ol>
  <li>Cliquez sur l'étudiant concerné dans la liste</li>
  <li>Vérifiez les informations du profil et le document de diplôme précédent</li>
  <li>Cliquez sur <strong>"Certifier l'étudiant"</strong></li>
  <li>Confirmez l'action</li>
  <li>L'étudiant reçoit une notification automatique de certification</li>
</ol>

<h3>❌ Bloquer/Débloquer un compte</h3>
<ol>
  <li>Ouvrez le profil de l'étudiant</li>
  <li>Cliquez sur <strong>"Bloquer"</strong> ou <strong>"Débloquer"</strong></li>
  <li>Confirmez l'action</li>
  <li>Un étudiant bloqué ne peut plus accéder aux cours et ressources</li>
</ol>

<h3>🗑️ Supprimer un compte étudiant</h3>
<div class="warning">
<strong>⚠️ Attention :</strong> Cette action est <strong>irréversible</strong> et supprime toutes les données de l'étudiant (cours, évaluations, paiements, etc.).
</div>

<ol>
  <li>Ouvrez le profil de l'étudiant</li>
  <li>Cliquez sur <strong>"Supprimer le compte"</strong></li>
  <li>Tapez "SUPPRIMER" pour confirmer</li>
  <li>Toutes les données associées sont supprimées définitivement</li>
</ol>

<h2>📚 Gestion des cours</h2>

<h3>➕ Créer un nouveau cours</h3>
<p><strong>Menu : Cours → Nouveau cours</strong></p>

<ol>
  <li><strong>Informations de base</strong>
    <ul>
      <li>Titre du cours</li>
      <li>Description détaillée</li>
      <li>Domaine de formation</li>
      <li>Type de formation (Brevet, Licence, Master...)</li>
      <li>Nom de l'enseignant</li>
      <li>Ordre du cours (numéro de séquence)</li>
    </ul>
  </li>
  
  <li><strong>Image de couverture</strong>
    <ul>
      <li>Cliquez sur <strong>"Télécharger une image"</strong></li>
      <li>Sélectionnez une image professionnelle (format JPG, PNG)</li>
      <li>Taille recommandée : 1200x630 pixels</li>
    </ul>
  </li>
  
  <li><strong>Contenus pédagogiques</strong>
    <ul>
      <li>📁 <strong>Documents</strong> : Uploadez jusqu'à 10 fichiers (PDF, Word, PowerPoint)</li>
      <li>🎵 <strong>Audios</strong> : Uploadez jusqu'à 10 fichiers audio (MP3, WAV)</li>
      <li>🎬 <strong>Vidéos</strong> : Uploadez jusqu'à 10 fichiers vidéo (MP4, AVI) ou liens Google Drive</li>
    </ul>
  </li>
  
  <li><strong>Prérequis (optionnel)</strong>
    <ul>
      <li>Sélectionnez un cours prérequis si l'étudiant doit d'abord terminer un autre cours</li>
    </ul>
  </li>
  
  <li><strong>Créer l'évaluation</strong>
    <ul>
      <li>Nombre de questions (minimum 5)</li>
      <li>Pour chaque question :
        <ul>
          <li>Type : QCM ou Rédaction</li>
          <li>Texte de la question</li>
          <li>Réponse correcte (ou référence pour rédaction)</li>
        </ul>
      </li>
    </ul>
  </li>
  
  <li>Cliquez sur <strong>"Créer le cours"</strong></li>
</ol>

<div class="note">
<strong>💡 Astuce :</strong> Pour les vidéos volumineuses, utilisez Google Drive et collez le lien de partage. La plateforme gérera le streaming automatiquement.
</div>

<h3>✏️ Modifier un cours existant</h3>
<ol>
  <li>Ouvrez la page <strong>"Cours"</strong></li>
  <li>Cliquez sur le bouton <strong>"Modifier"</strong> du cours</li>
  <li>Modifiez les informations souhaitées</li>
  <li>Cliquez sur <strong>"Mettre à jour"</strong></li>
</ol>

<h3>🗑️ Supprimer un cours</h3>
<ol>
  <li>Cliquez sur le bouton <strong>"Supprimer"</strong> du cours</li>
  <li>Confirmez la suppression</li>
  <li>Le cours et son évaluation sont supprimés définitivement</li>
</ol>

<h2>💬 Gestion des questions de cours</h2>

<p><strong>Menu : Questions Cours</strong></p>

<h3>📩 Répondre à une question</h3>
<ol>
  <li>Consultez les questions en attente</li>
  <li>Cliquez sur <strong>"Répondre"</strong></li>
  <li>Rédigez votre réponse dans le champ texte</li>
  <li>Optionnel : Ajoutez un enregistrement vocal</li>
  <li>Optionnel : Joignez des images explicatives</li>
  <li>Cliquez sur <strong>"Envoyer la réponse"</strong></li>
  <li>L'étudiant reçoit une notification automatique</li>
</ol>

<h2>📰 Gestion du blog</h2>

<h3>✍️ Créer un article de blog</h3>
<p><strong>Menu : Blog → Nouvel article</strong></p>

<ol>
  <li>Entrez le <strong>titre</strong> de l'article</li>
  <li>Sélectionnez une <strong>catégorie</strong> (Annonce, Témoignage, Enseignement...)</li>
  <li>Rédigez le <strong>contenu</strong> dans l'éditeur riche</li>
  <li>Choisissez un <strong>thème visuel</strong> pour l'article</li>
  <li>Optionnel : Uploadez une <strong>image de couverture</strong></li>
  <li>Optionnel : Ajoutez des <strong>images supplémentaires</strong> (jusqu'à 5)</li>
  <li>Optionnel : Ajoutez un <strong>fichier audio</strong></li>
  <li>Optionnel : Ajoutez une <strong>vidéo</strong></li>
  <li>Cliquez sur <strong>"Publier l'article"</strong></li>
</ol>

<h3>💬 Gérer les commentaires</h3>
<ol>
  <li>Ouvrez un article depuis la page <strong>"Blog"</strong></li>
  <li>Consultez les commentaires en bas de l'article</li>
  <li>Répondez aux commentaires ou supprimez-les si nécessaire</li>
</ol>

<h2>📖 Gestion de la bibliothèque</h2>

<h3>➕ Ajouter un document à la bibliothèque</h3>
<p><strong>Menu : Bibliothèque → Nouveau document</strong></p>

<ol>
  <li>Entrez le <strong>titre</strong> du document</li>
  <li>Entrez le nom de l'<strong>auteur</strong> (ou laissez "Voir document")</li>
  <li>Rédigez une <strong>description</strong></li>
  <li>Uploadez le fichier <strong>PDF</strong></li>
  <li>Optionnel : Uploadez une <strong>image de couverture</strong> (sinon générée automatiquement)</li>
  <li>Cliquez sur <strong>"Ajouter le document"</strong></li>
</ol>

<h2>💰 Gestion de la scolarité</h2>

<h3>💳 Configurer les frais de formation</h3>
<p><strong>Menu : Scolarité → Nouveau lien</strong></p>

<ol>
  <li>Sélectionnez la <strong>formation</strong></li>
  <li>Choisissez le <strong>type de frais</strong> (Diplôme ou Graduation)</li>
  <li>Entrez le <strong>lien de paiement externe</strong> (Wave, FedaPay...)</li>
  <li>Entrez le <strong>prix normal</strong> en XOF</li>
  <li><strong>Promotion (optionnel)</strong> :
    <ul>
      <li>Cochez "Promotion"</li>
      <li>Entrez le prix promotionnel</li>
      <li>Définissez la date de fin de promotion</li>
    </ul>
  </li>
  <li>Ajoutez des <strong>instructions de paiement</strong></li>
  <li>Activez ou désactivez le lien</li>
  <li>Cliquez sur <strong>"Créer"</strong></li>
</ol>

<div class="highlight">
<strong>🎁 Promotions :</strong> Les étudiants verront un compte à rebours en temps réel jusqu'à la fin de la promotion, avec le prix barré et le pourcentage de réduction affiché.
</div>

<h3>✅ Vérifier les paiements</h3>
<ol>
  <li>Consultez les transactions en attente</li>
  <li>Vérifiez la <strong>référence de transaction</strong> sur votre plateforme de paiement</li>
  <li>Cliquez sur <strong>"Valider"</strong> si le paiement est confirmé</li>
  <li>Cliquez sur <strong>"Rejeter"</strong> si la référence est incorrecte</li>
  <li>L'étudiant reçoit une notification automatique du résultat</li>
</ol>

<h2>🎤 Gestion des conférences</h2>

<h3>📅 Créer une conférence</h3>
<p><strong>Menu : Conférences → Nouvelle conférence</strong></p>

<ol>
  <li>Entrez le <strong>titre</strong> de la conférence</li>
  <li>Rédigez une <strong>description</strong></li>
  <li>Sélectionnez le <strong>type</strong> (Audio ou Vidéo)</li>
  <li>Générez un <strong>code d'accès</strong> unique</li>
  <li>Définissez la <strong>date et heure</strong></li>
  <li>Définissez le <strong>nombre maximum de participants</strong></li>
  <li>Cliquez sur <strong>"Créer la conférence"</strong></li>
</ol>

<h3>🎙️ Gérer une conférence en direct</h3>
<p>Pendant la conférence, en tant qu'admin vous pouvez :</p>
<ul>
  <li>🎤 <strong>Couper le micro</strong> d'un participant</li>
  <li>❌ <strong>Expulser</strong> un participant</li>
  <li>✋ <strong>Gérer les mains levées</strong> (autoriser la prise de parole)</li>
  <li>💬 <strong>Envoyer des messages</strong> dans le chat</li>
  <li>🔚 <strong>Terminer la conférence</strong> pour tous</li>
</ul>

<h2>👥 Gestion des groupes</h2>

<h3>➕ Créer un groupe</h3>
<p><strong>Menu : Groupes → Nouveau groupe</strong></p>

<ol>
  <li>Entrez le <strong>nom</strong> du groupe</li>
  <li>Rédigez une <strong>description</strong></li>
  <li>Choisissez le <strong>type</strong> (Public ou Privé)</li>
  <li>Uploadez une <strong>image de couverture</strong></li>
  <li>Cliquez sur <strong>"Créer le groupe"</strong></li>
</ol>

<h3>👤 Gérer les membres</h3>
<ol>
  <li>Ouvrez le groupe depuis la page <strong>"Groupes"</strong></li>
  <li>Cliquez sur <strong>"Gérer"</strong></li>
  <li><strong>Approuver</strong> les demandes d'adhésion (groupes privés)</li>
  <li><strong>Nommer des administrateurs</strong> pour aider à modérer</li>
  <li><strong>Retirer des membres</strong> si nécessaire</li>
</ol>

<h2>🖼️ Gestion de la galerie</h2>

<h3>📸 Créer une publication galerie</h3>
<p><strong>Menu : Galerie → Nouvelle publication</strong></p>

<ol>
  <li>Entrez le <strong>nom de l'événement</strong></li>
  <li>Sélectionnez le <strong>type d'événement</strong> (Cérémonie, Conférence, Culte...)</li>
  <li>Entrez la <strong>date de l'événement</strong></li>
  <li>Rédigez une <strong>description</strong></li>
  <li>Choisissez le <strong>type de média</strong> (Photo ou Vidéo)</li>
  <li>Uploadez une <strong>image de couverture</strong></li>
  <li>Statut : <strong>Brouillon</strong> ou <strong>Publié</strong></li>
  <li>Cliquez sur <strong>"Créer"</strong></li>
</ol>

<h3>📷 Ajouter des médias à une publication</h3>
<ol>
  <li>Ouvrez une publication depuis la page <strong>"Galerie"</strong></li>
  <li>Cliquez sur <strong>"Ajouter des médias"</strong></li>
  <li>Uploadez vos photos ou vidéos (jusqu'à 50 par publication)</li>
  <li>Les médias sont automatiquement associés à la publication</li>
</ol>

<h2>📊 Analytique</h2>

<p><strong>Menu : Analytique</strong></p>

<p>Consultez les statistiques complètes de la plateforme :</p>
<ul>
  <li>📈 <strong>Graphique d'évolution</strong> des inscriptions</li>
  <li>🌍 <strong>Répartition géographique</strong> des étudiants</li>
  <li>📚 <strong>Statistiques des cours</strong> (complétés, en cours)</li>
  <li>💰 <strong>Revenus de scolarité</strong></li>
  <li>📖 <strong>Utilisation de la bibliothèque</strong></li>
  <li>👥 <strong>Activité des groupes</strong></li>
</ul>

<h2>🔧 Paramètres avancés</h2>

<h3>🎨 Personnaliser le thème du chat public</h3>
<p><strong>Menu : Paramètres → Chat</strong></p>
<ol>
  <li>Choisissez un schéma de couleurs</li>
  <li>Sélectionnez un motif de fond</li>
  <li>Cliquez sur <strong>"Sauvegarder le thème"</strong></li>
  <li>Le thème est appliqué pour tous les utilisateurs</li>
</ol>

<h3>🎥 Gérer la vidéo d'accueil</h3>
<p><strong>Menu : Vidéo d'accueil</strong></p>
<ol>
  <li>Uploadez une vidéo de promotion (MP4, max 100 Mo)</li>
  <li>Ajoutez un titre et une description</li>
  <li>Activez ou désactivez l'affichage sur la page d'accueil</li>
  <li>Cliquez sur <strong>"Sauvegarder"</strong></li>
</ol>

<h3>☁️ Gérer l'hébergement</h3>
<p><strong>Menu : Hébergement</strong></p>

<div class="warning">
<strong>⚠️ Important :</strong> L'hébergement de la plateforme nécessite un renouvellement régulier. Un système d'alerte vous notifie 7 jours avant l'expiration.
</div>

<ol>
  <li>Consultez le plan d'hébergement actuel et sa date d'expiration</li>
  <li>Cliquez sur <strong>"Payer un plan"</strong></li>
  <li>Choisissez un plan (Basic, Pro, Enterprise)</li>
  <li>Effectuez le paiement via le lien fourni</li>
  <li>Uploadez votre justificatif de paiement</li>
  <li>Attendez la vérification (sous 24h)</li>
</ol>

<h3>🛡️ Gérer les administrateurs</h3>
<p><strong>Menu : Gérer administrateurs</strong> (Réservé aux administrateurs principaux)</p>

<ol>
  <li>Cliquez sur <strong>"Nouvel administrateur"</strong></li>
  <li>Entrez les informations (nom, email, pays, WhatsApp)</li>
  <li>Définissez le <strong>rôle</strong> (Principal ou Secondaire)</li>
  <li>Pour un admin secondaire, sélectionnez les <strong>permissions</strong> :
    <ul>
      <li>✅ Tableau de bord</li>
      <li>✅ Étudiants</li>
      <li>✅ Cours</li>
      <li>✅ Blog</li>
      <li>✅ Bibliothèque</li>
      <li>✅ Groupes</li>
      <li>✅ Scolarité</li>
      <li>✅ Conférences</li>
      <li>✅ Questions</li>
      <li>✅ Analytique</li>
      <li>✅ Paramètres</li>
    </ul>
  </li>
  <li>Uploadez une <strong>photo de profil</strong></li>
  <li>Créez un <strong>mot de passe</strong></li>
  <li>Cliquez sur <strong>"Créer l'administrateur"</strong></li>
</ol>

<h3>👁️ Mode prévisualisation étudiant</h3>
<p><strong>Menu : Voir en tant qu'étudiant</strong></p>

<p>Cette fonctionnalité permet de tester l'expérience étudiant :</p>
<ol>
  <li>Sélectionnez un <strong>domaine</strong> et un <strong>type de formation</strong></li>
  <li>Cliquez sur <strong>"Activer le mode étudiant"</strong></li>
  <li>Vous naviguez maintenant comme un étudiant de cette formation</li>
  <li>Pour revenir : cliquez sur le bandeau orange <strong>"Retour admin"</strong></li>
</ol>
</div>

<div style="page-break-after: always;"></div>

<div class="section">
<h1>4️⃣ FONCTIONNALITÉS AVANCÉES</h1>

<h2>🤖 Assistant IA</h2>

<p><strong>Menu : Assistant IA</strong> (Réservé aux administrateurs principaux)</p>

<p>L'assistant IA vous aide dans diverses tâches administratives :</p>
<ul>
  <li>✍️ <strong>Génération de contenu</strong> : Créez des descriptions de cours, articles de blog</li>
  <li>📊 <strong>Analyse de données</strong> : Obtenez des insights sur les performances des étudiants</li>
  <li>💡 <strong>Suggestions</strong> : Recommandations pour améliorer la plateforme</li>
  <li>🔍 <strong>Recherche</strong> : Trouvez rapidement des informations</li>
</ul>

<h2>🔔 Système de notifications</h2>

<p>La plateforme envoie automatiquement des notifications pour :</p>

<h3>📬 Étudiants</h3>
<ul>
  <li>✅ Certification du compte</li>
  <li>📚 Nouveau cours disponible</li>
  <li>💬 Réponse à une question de cours</li>
  <li>💰 Confirmation/rejet de paiement</li>
  <li>🎓 Bulletin disponible</li>
  <li>👥 Acceptation dans un groupe privé</li>
  <li>💬 Nouveau message dans un groupe</li>
</ul>

<h3>👨‍💼 Administrateurs</h3>
<ul>
  <li>👤 Nouvelle inscription d'étudiant</li>
  <li>💬 Nouvelle question de cours</li>
  <li>💰 Nouveau paiement à vérifier</li>
  <li>👥 Demande d'adhésion à un groupe privé</li>
  <li>⚠️ Alerte d'expiration d'hébergement</li>
</ul>

<h2>🔄 Changement de formation</h2>

<p>Les étudiants peuvent demander un changement de domaine ou de type de formation :</p>

<h3>📝 Processus (côté étudiant)</h3>
<ol>
  <li>Aller dans <strong>"Plus" → "Changer de formation"</strong></li>
  <li>Sélectionner le nouveau domaine et type de formation</li>
  <li>Rédiger une motivation</li>
  <li>Soumettre la demande</li>
</ol>

<h3>✅ Traitement (côté admin)</h3>
<p><strong>Menu : Changements de formation</strong></p>
<ol>
  <li>Consulter les demandes en attente</li>
  <li>Lire la motivation de l'étudiant</li>
  <li>Approuver ou rejeter la demande</li>
  <li>En cas d'approbation, la formation de l'étudiant est mise à jour automatiquement</li>
  <li>L'historique des formations est conservé</li>
</ol>

<h2>📋 Bulletins académiques</h2>

<h3>📊 Génération automatique</h3>
<p>Les bulletins sont générés automatiquement lorsque :</p>
<ul>
  <li>✅ L'étudiant a complété tous les cours requis pour sa formation</li>
  <li>✅ Toutes les évaluations ont été notées</li>
</ul>

<p><strong>Contenu du bulletin :</strong></p>
<ul>
  <li>📝 Liste complète des cours suivis</li>
  <li>📊 Notes obtenues pour chaque cours</li>
  <li>📈 Moyenne générale</li>
  <li>📅 Date d'obtention</li>
  <li>🏆 Mention (si applicable)</li>
</ul>

<h2>💬 Chat public</h2>

<p>Un système de discussion en temps réel accessible depuis le tableau de bord :</p>

<h3>💬 Fonctionnalités du chat</h3>
<ul>
  <li>✍️ Messages texte</li>
  <li>🎤 Messages vocaux (jusqu'à 2 minutes)</li>
  <li>📷 Partage d'images</li>
  <li>🎬 Partage de vidéos</li>
  <li>📄 Partage de documents</li>
  <li>❤️ Réactions avec emojis</li>
  <li>📌 Épingler des messages importants (admin uniquement)</li>
  <li>⭐ Marquer comme important (admin uniquement)</li>
</ul>

<h3>🎨 Personnalisation du thème</h3>
<p>Les administrateurs peuvent personnaliser l'apparence du chat pour tous les utilisateurs avec différents thèmes et motifs de fond.</p>

<h2>🔐 Sécurité VIP</h2>

<p>Certaines actions sensibles nécessitent un mot de passe VIP :</p>
<ul>
  <li>✏️ Modification des configurations de scolarité</li>
  <li>🗑️ Suppression des configurations de scolarité</li>
</ul>

<div class="warning">
<strong>🔑 Mot de passe VIP par défaut :</strong> <code>Agnimaka2001.com</code><br>
<strong>Important :</strong> Changez ce mot de passe après la première utilisation pour des raisons de sécurité.
</div>
</div>

<div style="page-break-after: always;"></div>

<div class="section">
<h1>5️⃣ DÉPANNAGE ET FAQ</h1>

<h2>❓ Questions fréquentes</h2>

<h3>👤 Côté étudiant</h3>

<p><strong>Q : Mon compte est toujours en attente, que faire ?</strong></p>
<p>R : Assurez-vous d'avoir complété votre profil avec toutes les informations requises et téléchargé votre preuve de diplôme. Si votre profil est complet, contactez l'administration via WhatsApp.</p>

<p><strong>Q : Je ne trouve pas un cours dans ma liste</strong></p>
<p>R : Vérifiez que vous avez complété les cours prérequis si nécessaire. Certains cours ne sont accessibles qu'après validation d'autres cours.</p>

<p><strong>Q : Comment savoir si mon paiement est validé ?</strong></p>
<p>R : Vous recevrez une notification push. Vous pouvez aussi consulter l'onglet "Scolarité" pour voir le statut de vos paiements.</p>

<p><strong>Q : Puis-je repasser une évaluation si j'ai échoué ?</strong></p>
<p>R : Oui, vous pouvez repasser l'évaluation autant de fois que nécessaire jusqu'à obtenir la note minimale de validation (10/20).</p>

<p><strong>Q : Comment télécharger un document de la bibliothèque ?</strong></p>
<p>R : Ouvrez le document et cliquez sur l'icône de téléchargement. Le PDF sera sauvegardé dans le dossier de téléchargements de votre appareil.</p>

<h3>👨‍💼 Côté administrateur</h3>

<p><strong>Q : Comment réinitialiser le mot de passe d'un administrateur ?</strong></p>
<p>R : Seul un administrateur principal peut modifier les mots de passe. Allez dans "Gérer administrateurs", cliquez sur l'admin concerné, et définissez un nouveau mot de passe.</p>

<p><strong>Q : Un étudiant ne voit pas un cours que j'ai créé</strong></p>
<p>R : Vérifiez que le cours est bien assigné au bon domaine et type de formation de l'étudiant. Vérifiez aussi les prérequis éventuels.</p>

<p><strong>Q : Comment supprimer une évaluation d'un cours ?</strong></p>
<p>R : Les évaluations sont liées aux cours. Pour modifier une évaluation, éditez le cours et modifiez les questions.</p>

<p><strong>Q : Les vidéos mettent du temps à charger</strong></p>
<p>R : Pour les vidéos volumineuses, utilisez Google Drive et collez le lien de partage au lieu d'uploader directement. Le streaming sera plus fluide.</p>

<h2>🔧 Problèmes techniques courants</h2>

<h3>🌐 Problèmes de connexion</h3>

<p><strong>Symptôme :</strong> Impossible de se connecter</p>
<p><strong>Solution :</strong></p>
<ol>
  <li>Vérifiez votre connexion Internet</li>
  <li>Videz le cache de votre navigateur (Ctrl+Shift+Del)</li>
  <li>Essayez avec un autre navigateur</li>
  <li>Désactivez temporairement les extensions de navigateur</li>
</ol>

<h3>📱 Problèmes d'affichage mobile</h3>

<p><strong>Symptôme :</strong> Interface mal affichée sur mobile</p>
<p><strong>Solution :</strong></p>
<ol>
  <li>Utilisez un navigateur moderne (Chrome, Safari, Firefox)</li>
  <li>Assurez-vous que votre navigateur est à jour</li>
  <li>Essayez de tourner l'écran (portrait/paysage)</li>
  <li>Rechargez la page (tirez vers le bas)</li>
</ol>

<h3>🎵 Problèmes audio/vidéo</h3>

<p><strong>Symptôme :</strong> Les fichiers audio/vidéo ne se lancent pas</p>
<p><strong>Solution :</strong></p>
<ol>
  <li>Vérifiez que votre connexion est stable</li>
  <li>Autorisez la lecture automatique dans les paramètres du navigateur</li>
  <li>Essayez de télécharger le fichier plutôt que de le lire en ligne</li>
  <li>Pour les vidéos Google Drive, assurez-vous que le lien de partage est public</li>
</ol>

<h3>📁 Problèmes d'upload de fichiers</h3>

<p><strong>Symptôme :</strong> Impossible de télécharger un fichier</p>
<p><strong>Solution :</strong></p>
<ol>
  <li>Vérifiez la taille du fichier (limite : 100 Mo par fichier)</li>
  <li>Vérifiez le format (PDF, Word, JPG, PNG, MP3, MP4...)</li>
  <li>Essayez de compresser le fichier si trop volumineux</li>
  <li>Utilisez une connexion stable (évitez le Wi-Fi public)</li>
</ol>

<h3>🔔 Problèmes de notifications</h3>

<p><strong>Symptôme :</strong> Je ne reçois pas les notifications</p>
<p><strong>Solution :</strong></p>
<ol>
  <li>Autorisez les notifications dans les paramètres de votre navigateur</li>
  <li>Vérifiez que le son des notifications est activé (Paramètres → Son)</li>
  <li>Assurez-vous que votre navigateur n'est pas en mode "Ne pas déranger"</li>
  <li>Rechargez la page pour synchroniser les notifications</li>
</ol>

<h2>📞 Contact et support</h2>

<div class="highlight">
<strong>🆘 Besoin d'aide ?</strong>
<p>Pour toute assistance technique ou question sur l'utilisation de la plateforme :</p>
<ul>
  <li>📱 <strong>WhatsApp</strong> : +229 01 47 65 92 77</li>
  <li>📧 <strong>Email</strong> : emgj2020@gmail.com</li>
  <li>🌐 <strong>Site web</strong> : Formulaire de contact sur la page d'accueil</li>
</ul>
</div>

<h2>🔄 Mises à jour de la plateforme</h2>

<p>La plateforme est régulièrement mise à jour pour :</p>
<ul>
  <li>🐛 Corriger les bugs</li>
  <li>✨ Ajouter de nouvelles fonctionnalités</li>
  <li>🚀 Améliorer les performances</li>
  <li>🔒 Renforcer la sécurité</li>
</ul>

<p>Les mises à jour sont automatiques et transparentes. Aucune action n'est requise de votre part.</p>

<h2>💡 Conseils d'utilisation</h2>

<h3>🎓 Pour les étudiants</h3>
<ul>
  <li>✅ Complétez votre profil dès la première connexion</li>
  <li>✅ Suivez les cours dans l'ordre recommandé</li>
  <li>✅ Posez des questions si vous ne comprenez pas un concept</li>
  <li>✅ Participez aux conférences et groupes de discussion</li>
  <li>✅ Consultez régulièrement le blog pour les annonces</li>
  <li>✅ Téléchargez les documents importants pour réviser hors ligne</li>
</ul>

<h3>👨‍💼 Pour les administrateurs</h3>
<ul>
  <li>✅ Certifiez rapidement les nouveaux étudiants</li>
  <li>✅ Répondez aux questions de cours sous 24-48h</li>
  <li>✅ Vérifiez les paiements quotidiennement</li>
  <li>✅ Publiez régulièrement du contenu sur le blog</li>
  <li>✅ Surveillez le tableau de bord pour détecter les problèmes</li>
  <li>✅ Organisez des conférences régulières pour maintenir l'engagement</li>
  <li>✅ Vérifiez l'expiration de l'hébergement chaque semaine</li>
</ul>
</div>

<div style="page-break-after: always;"></div>

<div class="section">
<h1>📝 NOTES DE VERSION</h1>

<h2>Version 1.0 (Mars 2026)</h2>
<ul>
  <li>🎉 Lancement initial de la plateforme FTGJ-EMGJ</li>
  <li>✅ Système complet de gestion des étudiants</li>
  <li>✅ Gestion des cours avec évaluations</li>
  <li>✅ Bibliothèque numérique</li>
  <li>✅ Blog et galerie d'événements</li>
  <li>✅ Système de conférences audio/vidéo</li>
  <li>✅ Groupes de discussion</li>
  <li>✅ Gestion de la scolarité avec promotions</li>
  <li>✅ Bulletins académiques automatiques</li>
  <li>✅ Notifications en temps réel</li>
  <li>✅ Chat public personnalisable</li>
  <li>✅ Système d'hébergement avec alertes</li>
  <li>✅ Interface responsive (mobile/desktop)</li>
</ul>
</div>

<div style="page-break-after: always;"></div>

<div class="section">
<h1>🏁 CONCLUSION</h1>

<p>Félicitations ! Vous avez maintenant toutes les connaissances nécessaires pour utiliser efficacement la plateforme FTGJ-EMGJ.</p>

<div class="highlight">
<strong>🎯 Points clés à retenir :</strong>
<ul>
  <li>✅ La plateforme offre un environnement complet pour l'enseignement théologique</li>
  <li>✅ Les étudiants peuvent suivre des cours, passer des évaluations et obtenir des diplômes</li>
  <li>✅ Les administrateurs disposent d'outils puissants pour gérer tous les aspects de la formation</li>
  <li>✅ La communication est facilitée via les conférences, groupes et chat public</li>
  <li>✅ Le système de notifications garde tout le monde informé en temps réel</li>
</ul>
</div>

<p>N'hésitez pas à explorer toutes les fonctionnalités et à contacter le support en cas de besoin.</p>

<p style="text-align: center; margin-top: 40px;">
  <strong>🙏 Que Dieu bénisse votre parcours de formation théologique ! 🙏</strong>
</p>

<p style="text-align: center; font-size: 12px; color: #64748b; margin-top: 40px;">
  © 2026 FTGJ - EMGJ - Tous droits réservés<br>
  Faculté de Théologie et Gestion de l'Église Ministérielle de Jésus
</p>
</div>

</body>
</html>
    `.trim();
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const htmlContent = generateDocContent();
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Manuel_FTGJ_EMGJ_Complet.html';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Document téléchargé ! Ouvrez-le dans Word pour conversion.');
    } catch (error) {
      toast.error('Erreur lors du téléchargement');
      console.error(error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
        <AdminTopNav />
        <div className="pt-20 px-4 pb-8 max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl shadow-blue-500/30">
              <Book className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-black text-white mb-3">Documentation Complète</h1>
            <p className="text-white/50 text-lg">Manuel d'utilisation FTGJ - EMGJ</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
              <FileText className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-black text-white">150+</p>
              <p className="text-white/40 text-xs mt-1">Pages</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
              <Users className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-black text-white">20+</p>
              <p className="text-white/40 text-xs mt-1">Sections</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
              <GraduationCap className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-black text-white">100+</p>
              <p className="text-white/40 text-xs mt-1">Guides</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
              <Shield className="w-6 h-6 text-red-400 mx-auto mb-2" />
              <p className="text-2xl font-black text-white">50+</p>
              <p className="text-white/40 text-xs mt-1">FAQ</p>
            </div>
          </div>

          {/* Main Card */}
          <div className="bg-gradient-to-br from-slate-800/50 via-slate-900/50 to-indigo-900/30 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            
            {/* Content Overview */}
            <div className="p-8 border-b border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">📑 Contenu du manuel</h2>
              <div className="space-y-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <span className="text-blue-400">1️⃣</span> Introduction à la plateforme
                  </h3>
                  <p className="text-white/60 text-sm">Vue d'ensemble, structure académique, domaines de formation</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <span className="text-green-400">2️⃣</span> Guide Étudiant Complet
                  </h3>
                  <p className="text-white/60 text-sm">Inscription, navigation, cours, évaluations, scolarité, conférences, groupes, bulletins</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <span className="text-purple-400">3️⃣</span> Guide Administrateur Détaillé
                  </h3>
                  <p className="text-white/60 text-sm">Tableau de bord, gestion des étudiants, cours, blog, bibliothèque, scolarité, conférences, groupes, galerie, analytique, paramètres</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <span className="text-amber-400">4️⃣</span> Fonctionnalités Avancées
                  </h3>
                  <p className="text-white/60 text-sm">Assistant IA, notifications, changements de formation, bulletins, chat public, sécurité VIP</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <span className="text-red-400">5️⃣</span> Dépannage et FAQ
                  </h3>
                  <p className="text-white/60 text-sm">Questions fréquentes, problèmes techniques, solutions, contact support</p>
                </div>
              </div>
            </div>

            {/* Download Section */}
            <div className="p-8 bg-gradient-to-br from-blue-900/30 to-purple-900/20">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">📥 Télécharger le document</h2>
                <p className="text-white/60 text-sm">Format HTML → ouvrir avec Microsoft Word pour conversion</p>
              </div>

              <Button
                onClick={handleDownload}
                disabled={downloading}
                className="w-full h-16 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-lg font-bold rounded-2xl shadow-2xl shadow-blue-500/30 transition-all"
              >
                {downloading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin mr-3" />
                    Préparation du document...
                  </>
                ) : (
                  <>
                    <Download className="w-6 h-6 mr-3" />
                    Télécharger le manuel complet
                  </>
                )}
              </Button>

              <div className="mt-6 bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-white/70 text-sm mb-2">📝 <strong>Instructions :</strong></p>
                <ol className="text-white/60 text-sm space-y-1 ml-4">
                  <li>1. Cliquez sur "Télécharger"</li>
                  <li>2. Ouvrez le fichier avec Microsoft Word</li>
                  <li>3. Allez dans Fichier → Enregistrer sous</li>
                  <li>4. Choisissez le format ".docx" (Word) ou ".pdf"</li>
                  <li>5. Le document est prêt à être utilisé !</li>
                </ol>
              </div>
            </div>

          </div>

        </div>
      </div>
    </AdminGuard>
  );
}