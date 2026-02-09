/**
 * Convertit un lien Google Drive en lien direct pour lecteur audio/vidéo
 * @param {string} url - URL Google Drive (format partage ou autre)
 * @returns {string} - URL directe pour streaming
 */
export function convertGoogleDriveUrl(url) {
  if (!url || !url.includes('drive.google.com')) {
    return url; // Retourne l'URL telle quelle si ce n'est pas Google Drive
  }

  // Extrait l'ID du fichier depuis différents formats de liens Google Drive
  let fileId = null;

  // Format: https://drive.google.com/file/d/{FILE_ID}/view
  const match1 = url.match(/\/file\/d\/([^\/]+)/);
  if (match1) {
    fileId = match1[1];
  }

  // Format: https://drive.google.com/open?id={FILE_ID}
  const match2 = url.match(/[?&]id=([^&]+)/);
  if (match2) {
    fileId = match2[1];
  }

  // Format: https://drive.google.com/uc?id={FILE_ID}
  const match3 = url.match(/uc\?.*id=([^&]+)/);
  if (match3) {
    fileId = match3[1];
  }

  // Si on a trouvé un ID, retourne l'URL de streaming direct
  if (fileId) {
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }

  // Si aucun format reconnu, retourne l'URL originale
  return url;
}