import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const fileUrl = searchParams.get('url');
    
    if (!fileUrl || !fileUrl.includes('drive.google.com')) {
      return Response.json({ error: 'URL invalide' }, { status: 400 });
    }

    // Extraire l'ID du fichier Google Drive
    let fileId = null;
    const patterns = [
      /\/file\/d\/([^\/]+)/,
      /[?&]id=([^&]+)/,
      /uc\?.*id=([^&]+)/
    ];
    
    for (const pattern of patterns) {
      const match = fileUrl.match(pattern);
      if (match) {
        fileId = match[1];
        break;
      }
    }
    
    if (!fileId) {
      return Response.json({ error: 'ID de fichier introuvable' }, { status: 400 });
    }

    // URL de téléchargement direct Google Drive
    const directUrl = `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`;
    
    // Récupérer le fichier depuis Google Drive
    const driveResponse = await fetch(directUrl, {
      redirect: 'follow'
    });
    
    if (!driveResponse.ok) {
      return Response.json({ error: 'Impossible de récupérer le fichier' }, { status: 500 });
    }

    // Retourner le stream audio avec les bons headers
    const headers = new Headers();
    headers.set('Content-Type', driveResponse.headers.get('Content-Type') || 'audio/mpeg');
    headers.set('Accept-Ranges', 'bytes');
    headers.set('Cache-Control', 'public, max-age=3600');
    
    // Support du streaming partiel pour le lecteur audio
    const contentLength = driveResponse.headers.get('Content-Length');
    if (contentLength) {
      headers.set('Content-Length', contentLength);
    }

    return new Response(driveResponse.body, {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('Erreur streaming:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});