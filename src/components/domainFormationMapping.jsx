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
  'THÉOLOGIE': ['Brevet', 'Baccalauréat', 'Licence', 'Doctorat'],
  'LEADERSHIP ET ADMINISTRATION CHRÉTIENNE': ['Licence', 'Master', 'Doctorat'],
  'MISSIOLOGIE': ['Licence', 'Master', 'Doctorat'],
  'ÉCOLE PROPHETIQUES': ['Brevet', 'Baccalauréat', 'Licence', 'Doctorat'],
  'ENTREPRENEURIAT': ['Licence', 'Master', 'Doctorat'],
  'AUMÔNERIE': ['Brevet', 'Baccalauréat', 'Licence', 'Doctorat'],
  'MINISTÈRE APOSTOLIQUE': ['Brevet', 'Baccalauréat', 'Licence', 'Doctorat']
};

export const getAllFormations = () => {
  const allFormations = new Set();
  Object.values(FORMATION_BY_DOMAIN).forEach(formations => {
    formations.forEach(f => allFormations.add(f));
  });
  return Array.from(allFormations);
};