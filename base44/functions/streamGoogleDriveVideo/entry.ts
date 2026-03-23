import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const videoUrl = url.searchParams.get('url');

    if (!videoUrl || !videoUrl.includes('drive.google.com')) {
      return Response.json({ error: 'Invalid Google Drive URL' }, { status: 400 });
    }

    // Extraire l'ID du fichier depuis l'URL Google Drive
    let fileId;
    if (videoUrl.includes('/file/d/')) {
      fileId = videoUrl.split('/file/d/')[1].split('/')[0];
    } else if (videoUrl.includes('id=')) {
      fileId = videoUrl.split('id=')[1].split('&')[0];
    } else {
      return Response.json({ error: 'Could not extract file ID' }, { status: 400 });
    }

    // URL de streaming direct Google Drive
    const streamUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

    // Récupérer le fichier depuis Google Drive
    const driveResponse = await fetch(streamUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!driveResponse.ok) {
      return Response.json({ error: 'Failed to fetch video from Google Drive' }, { status: 502 });
    }

    // Streamer la vidéo avec les bons headers
    return new Response(driveResponse.body, {
      status: 200,
      headers: {
        'Content-Type': driveResponse.headers.get('Content-Type') || 'video/mp4',
        'Content-Length': driveResponse.headers.get('Content-Length') || '',
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (error) {
    console.error('Google Drive video streaming error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});