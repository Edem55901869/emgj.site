// Génère instantanément une image de couverture SVG professionnelle
// Pas d'API externe = zéro latence

const COVER_STYLES = [
  // Style 1 : Géométrique doré
  (title, short) => `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="560" viewBox="0 0 400 560">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0a0a1a"/>
          <stop offset="100%" style="stop-color:#1a1000"/>
        </linearGradient>
        <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f5c842"/>
          <stop offset="50%" style="stop-color:#e8a000"/>
          <stop offset="100%" style="stop-color:#f5c842"/>
        </linearGradient>
      </defs>
      <rect width="400" height="560" fill="url(#bg)"/>
      <!-- Ornement hexagonal -->
      <polygon points="200,60 240,83 240,130 200,153 160,130 160,83" fill="none" stroke="url(#gold)" stroke-width="1.5" opacity="0.6"/>
      <polygon points="200,75 228,91 228,124 200,140 172,124 172,91" fill="none" stroke="url(#gold)" stroke-width="0.8" opacity="0.4"/>
      <!-- Lignes décoratives -->
      <line x1="40" y1="180" x2="360" y2="180" stroke="url(#gold)" stroke-width="0.5" opacity="0.5"/>
      <line x1="40" y1="185" x2="360" y2="185" stroke="url(#gold)" stroke-width="1.5" opacity="0.8"/>
      <line x1="40" y1="370" x2="360" y2="370" stroke="url(#gold)" stroke-width="1.5" opacity="0.8"/>
      <line x1="40" y1="375" x2="360" y2="375" stroke="url(#gold)" stroke-width="0.5" opacity="0.5"/>
      <!-- Coins décoratifs -->
      <path d="M30,30 L30,60 M30,30 L60,30" stroke="url(#gold)" stroke-width="2" fill="none" opacity="0.7"/>
      <path d="M370,30 L370,60 M370,30 L340,30" stroke="url(#gold)" stroke-width="2" fill="none" opacity="0.7"/>
      <path d="M30,530 L30,500 M30,530 L60,530" stroke="url(#gold)" stroke-width="2" fill="none" opacity="0.7"/>
      <path d="M370,530 L370,500 M370,530 L340,530" stroke="url(#gold)" stroke-width="2" fill="none" opacity="0.7"/>
      <!-- Titre -->
      <foreignObject x="40" y="200" width="320" height="150">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Georgia,serif;color:#f5c842;font-size:22px;font-weight:bold;text-align:center;line-height:1.4;word-wrap:break-word">${title}</div>
      </foreignObject>
      <!-- EMGJ -->
      <text x="200" y="490" text-anchor="middle" font-family="Georgia,serif" font-size="11" fill="#f5c842" opacity="0.9" letter-spacing="6">EMGJ</text>
      <text x="200" y="508" text-anchor="middle" font-family="Georgia,serif" font-size="8" fill="#f5c842" opacity="0.5" letter-spacing="3">ÉCOLE MONDIALE</text>
    </svg>`,

  // Style 2 : Minimaliste bleu marine
  (title, short) => `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="560" viewBox="0 0 400 560">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#0d1b4b"/>
          <stop offset="100%" style="stop-color:#07122e"/>
        </linearGradient>
      </defs>
      <rect width="400" height="560" fill="url(#bg)"/>
      <!-- Bande latérale -->
      <rect x="0" y="0" width="8" height="560" fill="#4f8ef7"/>
      <rect x="0" y="0" width="2" height="560" fill="#7fb3ff"/>
      <!-- Cercles abstraits -->
      <circle cx="320" cy="100" r="80" fill="none" stroke="#4f8ef7" stroke-width="0.8" opacity="0.3"/>
      <circle cx="320" cy="100" r="55" fill="none" stroke="#4f8ef7" stroke-width="0.5" opacity="0.2"/>
      <circle cx="320" cy="100" r="30" fill="#4f8ef7" opacity="0.1"/>
      <!-- Ligne de séparation -->
      <rect x="30" y="300" width="60" height="3" fill="#4f8ef7" rx="2"/>
      <!-- Titre -->
      <foreignObject x="30" y="190" width="330" height="180">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Arial,sans-serif;color:#ffffff;font-size:24px;font-weight:900;text-align:left;line-height:1.3;word-wrap:break-word">${title}</div>
      </foreignObject>
      <!-- EMGJ -->
      <text x="30" y="490" font-family="Arial,sans-serif" font-size="13" fill="#4f8ef7" letter-spacing="4" font-weight="bold">EMGJ</text>
      <text x="30" y="508" font-family="Arial,sans-serif" font-size="8" fill="#4f8ef7" opacity="0.6" letter-spacing="2">FORMATION SUPÉRIEURE</text>
    </svg>`,

  // Style 3 : Violet luxe avec motif
  (title, short) => `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="560" viewBox="0 0 400 560">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1a0533"/>
          <stop offset="100%" style="stop-color:#0d001a"/>
        </linearGradient>
        <pattern id="dots" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
          <circle cx="15" cy="15" r="1" fill="#a855f7" opacity="0.15"/>
        </pattern>
      </defs>
      <rect width="400" height="560" fill="url(#bg)"/>
      <rect width="400" height="560" fill="url(#dots)"/>
      <!-- Grande forme décorative -->
      <ellipse cx="380" cy="80" rx="120" ry="120" fill="#a855f7" opacity="0.08"/>
      <ellipse cx="20" cy="500" rx="100" ry="100" fill="#7c3aed" opacity="0.1"/>
      <!-- Ligne top -->
      <rect x="30" y="120" width="340" height="1" fill="#a855f7" opacity="0.4"/>
      <rect x="30" y="123" width="80" height="3" fill="#a855f7" rx="2"/>
      <!-- Titre -->
      <foreignObject x="30" y="145" width="340" height="200">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Georgia,serif;color:#ffffff;font-size:21px;font-weight:bold;text-align:left;line-height:1.5;word-wrap:break-word">${title}</div>
      </foreignObject>
      <!-- Ligne bottom -->
      <rect x="30" y="380" width="340" height="1" fill="#a855f7" opacity="0.4"/>
      <!-- EMGJ -->
      <rect x="30" y="460" width="50" height="2" fill="#a855f7" rx="1"/>
      <text x="30" y="490" font-family="Georgia,serif" font-size="14" fill="#a855f7" letter-spacing="5" font-weight="bold">EMGJ</text>
      <text x="30" y="510" font-family="Arial,sans-serif" font-size="8" fill="#a855f7" opacity="0.6" letter-spacing="1">GRANDE ÉCOLE THÉOLOGIQUE</text>
    </svg>`,

  // Style 4 : Vert émeraude académique
  (title, short) => `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="560" viewBox="0 0 400 560">
      <defs>
        <linearGradient id="bg" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#052e16"/>
          <stop offset="100%" style="stop-color:#14532d"/>
        </linearGradient>
        <linearGradient id="stripe" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#22c55e" stop-opacity="0"/>
          <stop offset="50%" style="stop-color:#22c55e" stop-opacity="1"/>
          <stop offset="100%" style="stop-color:#22c55e" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <rect width="400" height="560" fill="url(#bg)"/>
      <!-- Motif lignes diagonales subtiles -->
      <line x1="0" y1="0" x2="200" y2="560" stroke="#22c55e" stroke-width="0.3" opacity="0.1"/>
      <line x1="100" y1="0" x2="300" y2="560" stroke="#22c55e" stroke-width="0.3" opacity="0.1"/>
      <line x1="200" y1="0" x2="400" y2="560" stroke="#22c55e" stroke-width="0.3" opacity="0.1"/>
      <!-- Bande horizontale lumineuse -->
      <rect x="0" y="260" width="400" height="2" fill="url(#stripe)" opacity="0.4"/>
      <!-- Bloc initial du titre -->
      <rect x="30" y="150" width="5" height="60" fill="#22c55e" rx="3"/>
      <!-- Titre -->
      <foreignObject x="50" y="145" width="320" height="200">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Arial,sans-serif;color:#ffffff;font-size:22px;font-weight:900;text-align:left;line-height:1.4;word-wrap:break-word">${title}</div>
      </foreignObject>
      <!-- Cercle EMGJ -->
      <circle cx="60" cy="490" r="28" fill="none" stroke="#22c55e" stroke-width="1.5" opacity="0.7"/>
      <text x="60" y="487" text-anchor="middle" font-family="Arial,sans-serif" font-size="9" fill="#22c55e" letter-spacing="1" font-weight="bold">EMGJ</text>
      <text x="60" y="498" text-anchor="middle" font-family="Arial,sans-serif" font-size="6" fill="#22c55e" opacity="0.6">2024</text>
      <text x="105" y="488" font-family="Arial,sans-serif" font-size="8" fill="#86efac" opacity="0.8">Formation Supérieure</text>
      <text x="105" y="500" font-family="Arial,sans-serif" font-size="8" fill="#86efac" opacity="0.6">en Théologie &amp; Leadership</text>
    </svg>`,

  // Style 5 : Rouge cardinal élégant
  (title, short) => `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="560" viewBox="0 0 400 560">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#1c0606"/>
          <stop offset="100%" style="stop-color:#2d0a0a"/>
        </linearGradient>
      </defs>
      <rect width="400" height="560" fill="url(#bg)"/>
      <!-- Header block rouge -->
      <rect x="0" y="0" width="400" height="130" fill="#7f1d1d" opacity="0.6"/>
      <rect x="0" y="125" width="400" height="5" fill="#ef4444"/>
      <!-- Croix décorative subtile -->
      <line x1="200" y1="30" x2="200" y2="120" stroke="#fca5a5" stroke-width="1" opacity="0.3"/>
      <line x1="155" y1="75" x2="245" y2="75" stroke="#fca5a5" stroke-width="1" opacity="0.3"/>
      <!-- EMGJ en header -->
      <text x="200" y="60" text-anchor="middle" font-family="Georgia,serif" font-size="18" fill="#ffffff" letter-spacing="8" font-weight="bold">EMGJ</text>
      <text x="200" y="80" text-anchor="middle" font-family="Georgia,serif" font-size="8" fill="#fca5a5" letter-spacing="3" opacity="0.9">ÉCOLE DE FORMATION</text>
      <!-- Titre -->
      <foreignObject x="30" y="160" width="340" height="230">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Georgia,serif;color:#ffffff;font-size:23px;font-weight:bold;text-align:center;line-height:1.5;word-wrap:break-word">${title}</div>
      </foreignObject>
      <!-- Footer -->
      <rect x="0" y="520" width="400" height="40" fill="#ef4444" opacity="0.15"/>
      <line x1="0" y1="520" x2="400" y2="520" stroke="#ef4444" stroke-width="1" opacity="0.4"/>
      <text x="200" y="544" text-anchor="middle" font-family="Georgia,serif" font-size="9" fill="#fca5a5" opacity="0.7" letter-spacing="2">PUBLICATION OFFICIELLE</text>
    </svg>`,

  // Style 6 : Carte moderne cyan/noir
  (title, short) => `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="560" viewBox="0 0 400 560">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0c1a2e"/>
          <stop offset="100%" style="stop-color:#061020"/>
        </linearGradient>
        <linearGradient id="cyan" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#06b6d4"/>
          <stop offset="100%" style="stop-color:#0891b2"/>
        </linearGradient>
      </defs>
      <rect width="400" height="560" fill="url(#bg)"/>
      <!-- Bande diagonale -->
      <polygon points="0,400 0,560 200,560" fill="#06b6d4" opacity="0.1"/>
      <polygon points="400,0 400,250 250,0" fill="#06b6d4" opacity="0.06"/>
      <!-- Cadre intérieur -->
      <rect x="20" y="20" width="360" height="520" rx="6" fill="none" stroke="#06b6d4" stroke-width="0.8" opacity="0.3"/>
      <!-- Accent top -->
      <rect x="20" y="20" width="120" height="4" fill="url(#cyan)" rx="2"/>
      <!-- Points grille -->
      <circle cx="380" cy="20" r="3" fill="#06b6d4" opacity="0.5"/>
      <circle cx="20" cy="540" r="3" fill="#06b6d4" opacity="0.5"/>
      <!-- Titre -->
      <foreignObject x="40" y="170" width="320" height="220">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Arial,sans-serif;color:#ffffff;font-size:22px;font-weight:800;text-align:left;line-height:1.4;word-wrap:break-word">${title}</div>
      </foreignObject>
      <!-- Ligne séparateur -->
      <rect x="40" y="420" width="50" height="2" fill="#06b6d4" rx="1"/>
      <!-- EMGJ -->
      <text x="40" y="480" font-family="Arial,sans-serif" font-size="14" fill="#67e8f9" letter-spacing="5" font-weight="bold">EMGJ</text>
      <text x="40" y="498" font-family="Arial,sans-serif" font-size="8" fill="#06b6d4" opacity="0.7" letter-spacing="2">RESSOURCE ACADÉMIQUE</text>
    </svg>`,
];

export function generateSVGCover(title) {
  // Choisit un style basé sur un hash du titre pour toujours le même style
  let hash = 0;
  for (let i = 0; i < title.length; i++) hash = title.charCodeAt(i) + ((hash << 5) - hash);
  const styleIndex = Math.abs(hash) % COVER_STYLES.length;
  const svgContent = COVER_STYLES[styleIndex](title, title.slice(0, 20));
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`;
}