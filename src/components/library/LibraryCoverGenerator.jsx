// Générateur de couvertures SVG avec +1000 styles uniques
// Combinaisons : 10 layouts × 12 palettes × 9 ornements = 1080 styles

// ─── PALETTES ───────────────────────────────────────────────────────────────
const PALETTES = [
  { bg1: '#0a0a1a', bg2: '#1a1000', accent: '#f5c842', accent2: '#e8a000', text: '#ffffff', sub: '#f5c842cc' },  // Or nuit
  { bg1: '#0d1b4b', bg2: '#07122e', accent: '#4f8ef7', accent2: '#7fb3ff', text: '#ffffff', sub: '#a5c8ffcc' },  // Bleu royal
  { bg1: '#1a0533', bg2: '#0d001a', accent: '#a855f7', accent2: '#e879f9', text: '#ffffff', sub: '#d8b4fecc' },  // Violet luxe
  { bg1: '#052e16', bg2: '#14532d', accent: '#22c55e', accent2: '#86efac', text: '#ffffff', sub: '#bbf7d0cc' },  // Vert émeraude
  { bg1: '#1c0606', bg2: '#2d0a0a', accent: '#ef4444', accent2: '#fca5a5', text: '#ffffff', sub: '#fecacaCC' },  // Rouge cardinal
  { bg1: '#0c1a2e', bg2: '#061020', accent: '#06b6d4', accent2: '#67e8f9', text: '#ffffff', sub: '#a5f3fccc' },  // Cyan océan
  { bg1: '#1a1a00', bg2: '#2a2a00', accent: '#eab308', accent2: '#fde047', text: '#ffffff', sub: '#fef08acc' },  // Or classique
  { bg1: '#1e0a2e', bg2: '#12001e', accent: '#d946ef', accent2: '#f0abfc', text: '#ffffff', sub: '#f5d0fecc' },  // Fuchsia
  { bg1: '#1a0f00', bg2: '#2a1800', accent: '#f97316', accent2: '#fdba74', text: '#ffffff', sub: '#fed7aacc' },  // Cuivre
  { bg1: '#0a1628', bg2: '#050e1c', accent: '#6366f1', accent2: '#a5b4fc', text: '#ffffff', sub: '#c7d2fecc' },  // Indigo cosmos
  { bg1: '#1a0818', bg2: '#0d0410', accent: '#ec4899', accent2: '#f9a8d4', text: '#ffffff', sub: '#fce7f3cc' },  // Rose passion
  { bg1: '#0f1923', bg2: '#060e16', accent: '#14b8a6', accent2: '#5eead4', text: '#ffffff', sub: '#99f6e4cc' },  // Teal moderne
];

// ─── ORNEMENTS SVG ───────────────────────────────────────────────────────────
const ORNAMENTS = [
  // 0: Coins classiques
  (a) => `
    <path d="M25,25 L25,55 M25,25 L55,25" stroke="${a}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M375,25 L375,55 M375,25 L345,25" stroke="${a}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M25,535 L25,505 M25,535 L55,535" stroke="${a}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M375,535 L375,505 M375,535 L345,535" stroke="${a}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,

  // 1: Hexagone central
  (a) => `
    <polygon points="200,45 235,64 235,103 200,122 165,103 165,64" fill="none" stroke="${a}" stroke-width="1.5" opacity="0.5"/>
    <polygon points="200,58 222,71 222,96 200,109 178,96 178,71" fill="none" stroke="${a}" stroke-width="0.8" opacity="0.3"/>`,

  // 2: Cercles concentriques
  (a) => `
    <circle cx="340" cy="80" r="70" fill="none" stroke="${a}" stroke-width="0.8" opacity="0.25"/>
    <circle cx="340" cy="80" r="50" fill="none" stroke="${a}" stroke-width="1" opacity="0.2"/>
    <circle cx="340" cy="80" r="30" fill="${a}" opacity="0.07"/>
    <circle cx="60" cy="480" r="55" fill="none" stroke="${a}" stroke-width="0.8" opacity="0.15"/>`,

  // 3: Lignes horizontales doubles
  (a) => `
    <line x1="30" y1="155" x2="370" y2="155" stroke="${a}" stroke-width="2" opacity="0.8"/>
    <line x1="30" y1="160" x2="370" y2="160" stroke="${a}" stroke-width="0.5" opacity="0.4"/>
    <line x1="30" y1="390" x2="370" y2="390" stroke="${a}" stroke-width="0.5" opacity="0.4"/>
    <line x1="30" y1="395" x2="370" y2="395" stroke="${a}" stroke-width="2" opacity="0.8"/>`,

  // 4: Diagonales abstraites
  (a) => `
    <line x1="0" y1="0" x2="180" y2="560" stroke="${a}" stroke-width="0.4" opacity="0.12"/>
    <line x1="80" y1="0" x2="260" y2="560" stroke="${a}" stroke-width="0.4" opacity="0.12"/>
    <line x1="160" y1="0" x2="340" y2="560" stroke="${a}" stroke-width="0.4" opacity="0.12"/>
    <line x1="240" y1="0" x2="420" y2="560" stroke="${a}" stroke-width="0.4" opacity="0.12"/>`,

  // 5: Losange central
  (a) => `
    <polygon points="200,30 370,280 200,530 30,280" fill="none" stroke="${a}" stroke-width="0.7" opacity="0.15"/>
    <polygon points="200,70 340,280 200,490 60,280" fill="none" stroke="${a}" stroke-width="0.5" opacity="0.1"/>`,

  // 6: Étoile à 8 branches
  (a) => `
    <g transform="translate(200,80)" opacity="0.4">
      ${Array.from({length:8},(_,i)=>`<line x1="0" y1="0" x2="${Math.cos(i*Math.PI/4)*40}" y2="${Math.sin(i*Math.PI/4)*40}" stroke="${a}" stroke-width="1"/>`).join('')}
      <circle cx="0" cy="0" r="6" fill="${a}" opacity="0.6"/>
    </g>`,

  // 7: Grille de points
  (a) => `
    ${Array.from({length:5},(_,row)=>Array.from({length:7},(_,col)=>`<circle cx="${50+col*50}" cy="${80+row*90}" r="1.5" fill="${a}" opacity="0.15"/>`).join('')).join('')}`,

  // 8: Arc décoratif
  (a) => `
    <path d="M 30 280 Q 200 80 370 280" fill="none" stroke="${a}" stroke-width="1" opacity="0.2"/>
    <path d="M 30 300 Q 200 100 370 300" fill="none" stroke="${a}" stroke-width="0.5" opacity="0.12"/>`,
];

// ─── LAYOUTS ─────────────────────────────────────────────────────────────────
// Chaque layout définit la position/style du titre et du bloc EMGJ
// Le titre est toujours bien centré et lisible

const LAYOUTS = [
  // 0: Titre centré, EMGJ bas centré, bande top/bottom — titre zone 120–430, centre=275
  ({ p, title, orn }) => `
    <rect width="400" height="560" fill="url(#grad)"/>
    ${orn}
    <rect x="0" y="0" width="400" height="110" fill="${p.accent}" opacity="0.12"/>
    <rect x="0" y="0" width="400" height="4" fill="${p.accent}"/>
    <rect x="0" y="106" width="400" height="1.5" fill="${p.accent}" opacity="0.5"/>
    <rect x="0" y="450" width="400" height="1.5" fill="${p.accent}" opacity="0.5"/>
    <rect x="0" y="456" width="400" height="4" fill="${p.accent}"/>
    <text x="200" y="65" text-anchor="middle" font-family="Georgia,serif" font-size="11" fill="${p.accent}" letter-spacing="8" opacity="0.9">ÉCOLE MISSIOLOGIQUE</text>
    <text x="200" y="84" text-anchor="middle" font-family="Georgia,serif" font-size="11" fill="${p.accent}" letter-spacing="8" opacity="0.9">GÉNÉRATION JOËL</text>
    ${wrapText(title, 200, 278, 320, 28, p.text, 'center', 'Georgia,serif', 'bold')}
    <text x="200" y="498" text-anchor="middle" font-family="Georgia,serif" font-size="22" fill="${p.accent}" letter-spacing="10" font-weight="bold">EMGJ</text>
    <text x="200" y="514" text-anchor="middle" font-family="Arial,sans-serif" font-size="8" fill="${p.accent}" letter-spacing="3" opacity="0.6">PUBLICATION OFFICIELLE</text>`,

  // 1: Titre à gauche grand, bande latérale gauche, EMGJ bas droite — centre=280
  ({ p, title, orn }) => `
    <rect width="400" height="560" fill="url(#grad)"/>
    ${orn}
    <rect x="0" y="0" width="7" height="560" fill="${p.accent}"/>
    <rect x="7" y="0" width="3" height="560" fill="${p.accent}" opacity="0.4"/>
    <rect x="30" y="180" width="55" height="3" fill="${p.accent}" rx="1.5"/>
    ${wrapText(title, 30, 280, 340, 32, p.text, 'left', 'Arial,sans-serif', '900')}
    <rect x="30" y="380" width="55" height="3" fill="${p.accent}" rx="1.5"/>
    <text x="370" y="510" text-anchor="end" font-family="Georgia,serif" font-size="18" fill="${p.accent}" letter-spacing="6" font-weight="bold">EMGJ</text>
    <text x="370" y="526" text-anchor="end" font-family="Arial,sans-serif" font-size="8" fill="${p.accent}" letter-spacing="2" opacity="0.6">École Missiologique</text>`,

  // 2: Header avec EMGJ en gros, titre centré entre 180–430 => centre=305
  ({ p, title, orn }) => `
    <rect width="400" height="560" fill="url(#grad)"/>
    ${orn}
    <rect x="0" y="0" width="400" height="160" fill="${p.accent}" opacity="0.18"/>
    <line x1="0" y1="160" x2="400" y2="160" stroke="${p.accent}" stroke-width="3"/>
    <text x="200" y="90" text-anchor="middle" font-family="Georgia,serif" font-size="38" fill="${p.accent}" letter-spacing="10" font-weight="bold">EMGJ</text>
    <text x="200" y="112" text-anchor="middle" font-family="Arial,sans-serif" font-size="8.5" fill="${p.text}" letter-spacing="3" opacity="0.7">ÉCOLE MISSIOLOGIQUE GÉNÉRATION JOËL</text>
    <line x1="80" y1="132" x2="320" y2="132" stroke="${p.accent}" stroke-width="0.8" opacity="0.4"/>
    ${wrapText(title, 200, 305, 320, 27, p.text, 'center', 'Georgia,serif', 'bold')}
    <rect x="0" y="490" width="400" height="70" fill="${p.accent}" opacity="0.08"/>
    <text x="200" y="530" text-anchor="middle" font-family="Arial,sans-serif" font-size="9" fill="${p.accent}" letter-spacing="3" opacity="0.6">PUBLICATION ACADÉMIQUE</text>`,

  // 3: Logo EMGJ en haut, titre centré 290–450 => centre=370
  ({ p, title, orn }) => `
    <rect width="400" height="560" fill="url(#grad)"/>
    ${orn}
    <circle cx="200" cy="140" r="80" fill="${p.accent}" opacity="0.07"/>
    <circle cx="200" cy="140" r="58" fill="none" stroke="${p.accent}" stroke-width="1" opacity="0.3"/>
    <text x="200" y="134" text-anchor="middle" font-family="Georgia,serif" font-size="26" fill="${p.accent}" letter-spacing="6" font-weight="bold">EMGJ</text>
    <text x="200" y="152" text-anchor="middle" font-family="Arial,sans-serif" font-size="7" fill="${p.accent}" letter-spacing="2" opacity="0.7">GÉNÉRATION JOËL</text>
    <line x1="60" y1="240" x2="340" y2="240" stroke="${p.accent}" stroke-width="1.5" opacity="0.5"/>
    ${wrapText(title, 200, 370, 320, 28, p.text, 'center', 'Georgia,serif', 'bold')}
    <line x1="60" y1="490" x2="340" y2="490" stroke="${p.accent}" stroke-width="1.5" opacity="0.5"/>
    <text x="200" y="525" text-anchor="middle" font-family="Arial,sans-serif" font-size="8" fill="${p.accent}" letter-spacing="3" opacity="0.6">PUBLICATION ACADÉMIQUE</text>`,

  // 4: Split diagonal — titre centré 220–440 => centre=330
  ({ p, title, orn }) => `
    <rect width="400" height="560" fill="url(#grad)"/>
    <polygon points="0,0 400,0 400,180 0,280" fill="${p.accent}" opacity="0.12"/>
    ${orn}
    <text x="200" y="100" text-anchor="middle" font-family="Georgia,serif" font-size="13" fill="${p.accent}" letter-spacing="7" opacity="0.9">EMGJ</text>
    <text x="200" y="120" text-anchor="middle" font-family="Arial,sans-serif" font-size="7.5" fill="${p.accent}" letter-spacing="2" opacity="0.6">ÉCOLE MISSIOLOGIQUE GÉNÉRATION JOËL</text>
    <line x1="120" y1="138" x2="280" y2="138" stroke="${p.accent}" stroke-width="0.8" opacity="0.4"/>
    ${wrapText(title, 200, 330, 330, 29, p.text, 'center', 'Arial,sans-serif', '800')}
    <rect x="0" y="490" width="400" height="70" fill="${p.accent}" opacity="0.08"/>
    <text x="30" y="530" font-family="Arial,sans-serif" font-size="9" fill="${p.accent}" opacity="0.6" letter-spacing="2">RESSOURCE ACADÉMIQUE</text>`,

  // 5: Minimaliste — titre 80–260 centre=170, EMGJ 300–400
  ({ p, title, orn }) => `
    <rect width="400" height="560" fill="url(#grad)"/>
    ${orn}
    <line x1="60" y1="80" x2="340" y2="80" stroke="${p.accent}" stroke-width="1.5" opacity="0.4"/>
    ${wrapText(title, 200, 200, 330, 30, p.text, 'center', 'Georgia,serif', 'bold')}
    <line x1="60" y1="310" x2="340" y2="310" stroke="${p.accent}" stroke-width="1.5" opacity="0.4"/>
    <rect x="150" y="330" width="100" height="2" fill="${p.accent}" rx="1"/>
    <text x="200" y="390" text-anchor="middle" font-family="Georgia,serif" font-size="24" fill="${p.accent}" letter-spacing="8" font-weight="bold">EMGJ</text>
    <text x="200" y="412" text-anchor="middle" font-family="Arial,sans-serif" font-size="8" fill="${p.accent}" letter-spacing="2" opacity="0.6">École Missiologique Génération Joël</text>`,

  // 6: Livre avec tranche gauche — titre zone 145–410 => centre=277
  ({ p, title, orn }) => `
    <rect width="400" height="560" fill="url(#grad)"/>
    <rect x="0" y="0" width="40" height="560" fill="${p.accent}" opacity="0.15"/>
    <rect x="37" y="0" width="3" height="560" fill="${p.accent}" opacity="0.5"/>
    ${orn}
    <text x="220" y="90" text-anchor="middle" font-family="Georgia,serif" font-size="11" fill="${p.accent}" letter-spacing="5" opacity="0.8">ÉCOLE MISSIOLOGIQUE</text>
    <text x="220" y="108" text-anchor="middle" font-family="Georgia,serif" font-size="11" fill="${p.accent}" letter-spacing="5" opacity="0.8">GÉNÉRATION JOËL</text>
    <line x1="55" y1="125" x2="375" y2="125" stroke="${p.accent}" stroke-width="1.5" opacity="0.5"/>
    ${wrapText(title, 215, 277, 310, 30, p.text, 'center', 'Georgia,serif', 'bold')}
    <line x1="55" y1="420" x2="375" y2="420" stroke="${p.accent}" stroke-width="1.5" opacity="0.5"/>
    <text x="215" y="480" text-anchor="middle" font-family="Georgia,serif" font-size="24" fill="${p.accent}" letter-spacing="8" font-weight="bold">EMGJ</text>`,

  // 7: Style diplôme — titre zone 100–410 => centre=255
  ({ p, title, orn }) => `
    <rect width="400" height="560" fill="url(#grad)"/>
    <rect x="15" y="15" width="370" height="530" rx="4" fill="none" stroke="${p.accent}" stroke-width="1" opacity="0.3"/>
    <rect x="22" y="22" width="356" height="516" rx="3" fill="none" stroke="${p.accent}" stroke-width="0.5" opacity="0.15"/>
    ${orn}
    <text x="200" y="65" text-anchor="middle" font-family="Georgia,serif" font-size="10" fill="${p.accent}" letter-spacing="6" opacity="0.9">ÉCOLE MISSIOLOGIQUE GÉNÉRATION JOËL</text>
    <line x1="60" y1="82" x2="340" y2="82" stroke="${p.accent}" stroke-width="0.8" opacity="0.4"/>
    ${wrapText(title, 200, 255, 330, 28, p.text, 'center', 'Georgia,serif', 'bold')}
    <line x1="60" y1="410" x2="340" y2="410" stroke="${p.accent}" stroke-width="0.8" opacity="0.4"/>
    <text x="200" y="462" text-anchor="middle" font-family="Georgia,serif" font-size="26" fill="${p.accent}" letter-spacing="10" font-weight="bold">EMGJ</text>
    <text x="200" y="482" text-anchor="middle" font-family="Arial,sans-serif" font-size="8" fill="${p.accent}" letter-spacing="2" opacity="0.5">PUBLICATION OFFICIELLE</text>`,

  // 8: Asymétrique droite — titre centré 100–350 => centre=225
  ({ p, title, orn }) => `
    <rect width="400" height="560" fill="url(#grad)"/>
    ${orn}
    <rect x="360" y="0" width="40" height="560" fill="${p.accent}" opacity="0.15"/>
    <rect x="360" y="0" width="3" height="560" fill="${p.accent}" opacity="0.5"/>
    <line x1="30" y1="100" x2="340" y2="100" stroke="${p.accent}" stroke-width="1.5" opacity="0.4"/>
    ${wrapText(title, 185, 255, 300, 30, p.text, 'center', 'Arial,sans-serif', '800')}
    <line x1="30" y1="390" x2="340" y2="390" stroke="${p.accent}" stroke-width="1.5" opacity="0.4"/>
    <text x="30" y="450" font-family="Georgia,serif" font-size="20" fill="${p.accent}" letter-spacing="6" font-weight="bold">EMGJ</text>
    <text x="30" y="468" font-family="Arial,sans-serif" font-size="7.5" fill="${p.accent}" letter-spacing="2" opacity="0.6">École Missiologique</text>
    <text x="30" y="482" font-family="Arial,sans-serif" font-size="7.5" fill="${p.accent}" letter-spacing="2" opacity="0.6">Génération Joël</text>`,

  // 9: Style affiche — titre centré zone 150–420 => centre=285
  ({ p, title, orn }) => `
    <rect width="400" height="560" fill="url(#grad)"/>
    ${orn}
    <ellipse cx="200" cy="280" rx="165" ry="185" fill="${p.accent}" opacity="0.05"/>
    <ellipse cx="200" cy="280" rx="135" ry="155" fill="none" stroke="${p.accent}" stroke-width="0.5" opacity="0.15"/>
    <text x="200" y="90" text-anchor="middle" font-family="Georgia,serif" font-size="10" fill="${p.accent}" letter-spacing="6" opacity="0.7">✦ EMGJ ✦</text>
    <text x="200" y="108" text-anchor="middle" font-family="Arial,sans-serif" font-size="7.5" fill="${p.accent}" letter-spacing="2" opacity="0.5">ÉCOLE MISSIOLOGIQUE GÉNÉRATION JOËL</text>
    <line x1="80" y1="124" x2="320" y2="124" stroke="${p.accent}" stroke-width="0.6" opacity="0.3"/>
    ${wrapText(title, 200, 285, 310, 31, p.text, 'center', 'Georgia,serif', 'bold')}
    <line x1="80" y1="430" x2="320" y2="430" stroke="${p.accent}" stroke-width="0.6" opacity="0.3"/>
    <text x="200" y="468" text-anchor="middle" font-family="Georgia,serif" font-size="11" fill="${p.accent}" letter-spacing="8" opacity="0.8">GÉNÉRATION JOËL</text>`,
];

// ─── UTILITAIRE : wrap text en SVG ──────────────────────────────────────────
// startY = centre vertical de la zone de titre
function wrapText(title, cx, startY, maxWidth, fontSize, color, align, fontFamily, fontWeight) {
  const charW = fontSize * (fontFamily.includes('Georgia') ? 0.52 : 0.56);
  const charsPerLine = Math.max(1, Math.floor(maxWidth / charW));

  const words = title.split(' ');
  const lines = [];
  let current = '';

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (test.length > charsPerLine && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);

  const displayLines = lines.slice(0, 5);
  const lineH = fontSize * 1.4;
  const totalH = (displayLines.length - 1) * lineH;
  // Le premier texte est centré sur startY
  const yStart = startY - totalH / 2;

  const textAnchor = align === 'center' ? 'middle' : align === 'right' ? 'end' : 'start';
  const x = align === 'center' ? cx : cx;

  return displayLines.map((line, i) =>
    `<text x="${x}" y="${yStart + i * lineH}" text-anchor="${textAnchor}" font-family="${fontFamily}" font-size="${fontSize}" fill="${color}" font-weight="${fontWeight}" style="letter-spacing:0.5px">${escXML(line)}</text>`
  ).join('\n');
}

function escXML(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ─── EXPORT PRINCIPAL ────────────────────────────────────────────────────────
export function generateSVGCover(title, styleIndex = null) {
  if (!title) title = 'Document';

  // Hash déterministe à partir du titre
  let hash = 0;
  for (let i = 0; i < title.length; i++) hash = title.charCodeAt(i) + ((hash << 5) - hash);
  hash = Math.abs(hash);

  // Total styles = LAYOUTS × PALETTES × ORNAMENTS = 10 × 12 × 9 = 1080
  const totalStyles = LAYOUTS.length * PALETTES.length * ORNAMENTS.length;
  const idx = styleIndex !== null ? ((styleIndex % totalStyles) + totalStyles) % totalStyles : hash % totalStyles;

  const layoutIdx   = idx % LAYOUTS.length;
  const paletteIdx  = Math.floor(idx / LAYOUTS.length) % PALETTES.length;
  const ornamentIdx = Math.floor(idx / (LAYOUTS.length * PALETTES.length)) % ORNAMENTS.length;

  const p = PALETTES[paletteIdx];
  const orn = ORNAMENTS[ornamentIdx](p.accent);
  const body = LAYOUTS[layoutIdx]({ p, title, orn });

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="560" viewBox="0 0 400 560">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${p.bg1}"/>
        <stop offset="100%" style="stop-color:${p.bg2}"/>
      </linearGradient>
    </defs>
    ${body}
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export const TOTAL_STYLES = 1080;