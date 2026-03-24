import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Globe, GraduationCap, MapPin, Phone, Mail, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PLATFORM_URL = window.location.origin;

export default function APropos() {
  const qrRef = useRef(null);

  const handleDownloadQR = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = 600;
      canvas.height = 600;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 600, 600);
      ctx.drawImage(img, 0, 0, 600, 600);
      URL.revokeObjectURL(url);
      const a = document.createElement('a');
      a.download = 'QR-FTGJ-Plateforme.png';
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = url;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 py-20 px-6 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-300 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6988dd24f34fbffabf6f6551/4d6e0c9a2_IMG_4736.jpeg"
              alt="Logo FTGJ"
              className="w-24 h-24 rounded-3xl object-contain bg-white/10 backdrop-blur-sm p-2 shadow-2xl"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            Formation Théologique & Générale de Jésus
          </h1>
          <p className="text-xl text-blue-100 font-light max-w-2xl mx-auto">
            Une plateforme d'excellence académique et spirituelle pour former les serviteurs de Dieu
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-16 space-y-16">
        {/* QR Code Section */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-indigo-100">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-8 py-6 text-white">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Globe className="w-7 h-7" />
              Accéder à la plateforme
            </h2>
            <p className="text-indigo-100 text-sm mt-1">
              Scannez ce QR code avec votre téléphone pour accéder directement à la plateforme
            </p>
          </div>
          <div className="p-10 flex flex-col md:flex-row items-center gap-12">
            {/* QR Code */}
            <div className="flex flex-col items-center gap-6">
              <div
                ref={qrRef}
                className="p-6 bg-white rounded-3xl shadow-2xl border-4 border-indigo-100"
              >
                <QRCodeSVG
                  value={PLATFORM_URL}
                  size={220}
                  bgColor="#ffffff"
                  fgColor="#1e1b4b"
                  level="H"
                  imageSettings={{
                    src: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6988dd24f34fbffabf6f6551/4d6e0c9a2_IMG_4736.jpeg",
                    x: undefined,
                    y: undefined,
                    height: 48,
                    width: 48,
                    excavate: true,
                  }}
                />
              </div>
              <Button
                onClick={handleDownloadQR}
                className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white rounded-2xl px-8 py-3 shadow-lg shadow-indigo-500/30 font-semibold"
              >
                <Download className="w-4 h-4 mr-2" />
                Télécharger le QR Code
              </Button>
            </div>

            {/* Instructions */}
            <div className="flex-1 space-y-5">
              <h3 className="text-xl font-bold text-gray-900">Comment utiliser ce QR Code ?</h3>
              <div className="space-y-4">
                {[
                  { step: '1', title: 'Ouvrez votre téléphone', desc: 'Accédez à l\'appareil photo ou à une application de scan QR' },
                  { step: '2', title: 'Pointez vers le code', desc: 'Centrez le code QR dans le viseur de votre caméra' },
                  { step: '3', title: 'Accédez directement', desc: 'Vous serez redirigé automatiquement vers la plateforme FTGJ' },
                ].map(({ step, title, desc }) => (
                  <div key={step} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black flex items-center justify-center flex-shrink-0 shadow-lg">
                      {step}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{title}</p>
                      <p className="text-sm text-gray-500">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-200">
                <p className="text-xs text-indigo-700 font-medium flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 flex-shrink-0" />
                  URL de la plateforme : <span className="font-bold break-all">{PLATFORM_URL}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mission */}
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: GraduationCap,
              title: 'Excellence Académique',
              desc: 'Des programmes rigoureux allant du Brevet au Doctorat en théologie et disciplines connexes.',
              color: 'from-blue-500 to-indigo-600'
            },
            {
              icon: Globe,
              title: 'Portée Internationale',
              desc: 'Une communauté d\'étudiants présents dans plusieurs pays à travers le monde.',
              color: 'from-purple-500 to-pink-600'
            },
            {
              icon: GraduationCap,
              title: 'Formation Spirituelle',
              desc: 'Des enseignements ancrés dans la foi pour former des leaders chrétiens engagés.',
              color: 'from-emerald-500 to-teal-600'
            }
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="bg-white rounded-3xl shadow-lg p-8 text-center hover:shadow-xl transition-all border border-gray-100">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mx-auto mb-5 shadow-lg`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-3xl shadow-2xl p-10 text-white text-center">
          <h2 className="text-3xl font-black mb-3">Rejoignez-nous</h2>
          <p className="text-blue-100 mb-8 max-w-lg mx-auto">
            Inscrivez-vous dès aujourd'hui pour commencer votre parcours académique et spirituel avec nous.
          </p>
          <a
            href={PLATFORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-indigo-700 font-bold px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-105"
          >
            <Globe className="w-5 h-5" />
            Accéder à la plateforme
          </a>
        </div>
      </div>
    </div>
  );
}