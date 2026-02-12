// Mapping des domaines vers leurs types de formation
export const DOMAINS = [
  'THÉOLOGIE',
  'LEADERSHIP ET ADMINISTRATION CHRÉTIENNE',
  'MISSIOLOGIE',
  'ÉCOLE PROPHETIQUES',
  'ENTREPRENEURIAT',
  'AUMÔNERIE',
  'MINISTÈRE APOSTOLIQUE'
];

export const FORMATION_BY_DOMAIN = {
  'THÉOLOGIE': ['École des évangélistes', 'Discipolat', 'Brevet', 'Baccalauréat', 'Licence', 'Master', 'Doctorat'],
  'LEADERSHIP ET ADMINISTRATION CHRÉTIENNE': ['Licence', 'Master', 'Doctorat'],
  'MISSIOLOGIE': ['Licence', 'Master', 'Doctorat'],
  'ÉCOLE PROPHETIQUES': ['Brevet', 'Baccalauréat', 'Licence', 'Doctorat'],
  'ENTREPRENEURIAT': ['Licence', 'Master', 'Doctorat'],
  'AUMÔNERIE': ['Licence', 'Master', 'Doctorat'],
  'MINISTÈRE APOSTOLIQUE': ['Licence', 'Master', 'Doctorat']
};

// Domaines spécifiques pour la bibliothèque (inclut École de dimanche)
export const LIBRARY_DOMAINS = [
  ...DOMAINS,
  'École de dimanche'
];

// Hiérarchie des formations pour déterminer les prérequis
export const FORMATION_HIERARCHY = {
  'École des évangélistes': null,
  'Discipolat': null,
  'Brevet': null,
  'Baccalauréat': 'Brevet',
  'Licence': 'Baccalauréat',
  'Master': 'Licence',
  'Doctorat': 'Master'
};

// Fonction pour déterminer si un type de formation nécessite un prérequis
export const requiresPreviousDiploma = (formationType, domain) => {
  // Pour AUMÔNERIE et MINISTÈRE APOSTOLIQUE, Licence est le niveau de base
  if ((domain === 'AUMÔNERIE' || domain === 'MINISTÈRE APOSTOLIQUE') && formationType === 'Licence') {
    return false;
  }
  
  // Pour THÉOLOGIE, École des évangélistes, Discipolat et Brevet sont les niveaux de base
  if (domain === 'THÉOLOGIE' && ['École des évangélistes', 'Discipolat', 'Brevet'].includes(formationType)) {
    return false;
  }
  
  // Pour les autres domaines, vérifier la hiérarchie
  return FORMATION_HIERARCHY[formationType] !== null;
};

// Fonction pour obtenir le nom du diplôme prérequis
export const getPreviousDiplomaName = (formationType) => {
  return FORMATION_HIERARCHY[formationType];
};

export const getAllFormations = () => {
  const allFormations = new Set();
  Object.values(FORMATION_BY_DOMAIN).forEach(formations => {
    formations.forEach(f => allFormations.add(f));
  });
  return Array.from(allFormations);
};