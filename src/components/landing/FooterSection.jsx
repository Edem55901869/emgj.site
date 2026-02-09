import React from 'react';
import { GraduationCap, Facebook, Music } from 'lucide-react';

export default function FooterSection() {
  return (
    <footer className="bg-[#0a1628] text-white py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6988dd24f34fbffabf6f6551/4d6e0c9a2_IMG_4736.jpeg" 
                alt="FTGJ Logo" 
                className="w-12 h-12 rounded-xl object-contain"
              />
              <span className="font-bold text-lg">FTGJ</span>
            </div>
            <p className="text-blue-200/60 text-sm leading-relaxed">
              Formation Théologique Génération Joël — Former une génération de leaders spirituels pour transformer les nations.
            </p>
            <p className="text-blue-200/40 text-xs mt-3 italic">
              "Et après cela, je répandrai mon esprit sur toute chair; vos fils et vos filles prophétiseront..."
              <span className="block mt-1">— Joël 2:28</span>
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-blue-200">Liens rapides</h4>
            <ul className="space-y-3 text-sm text-blue-200/60">
              <li><a href="#domaines" className="hover:text-white transition-colors hover:pl-2 inline-block">Nos domaines</a></li>
              <li><a href="#contact" className="hover:text-white transition-colors hover:pl-2 inline-block">Contact</a></li>
              <li><a href="#temoignages" className="hover:text-white transition-colors hover:pl-2 inline-block">Témoignages</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-blue-200">Nos domaines</h4>
            <ul className="space-y-2 text-sm text-blue-200/60">
              <li>• Théologie</li>
              <li>• Leadership & Administration</li>
              <li>• Missiologie</li>
              <li>• École Prophétique</li>
              <li>• Entrepreneuriat</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-blue-200">Coordonnées</h4>
            <ul className="space-y-3 text-sm text-blue-200/60">
              <li>📧 emgj2020@gmail.com</li>
              <li>📞 +228 92 61 49 61</li>
              <li>📍 Lomé-Togo</li>
            </ul>
            <div className="mt-6">
              <h5 className="font-semibold mb-3 text-blue-200 text-sm">Suivez-nous</h5>
              <div className="flex gap-3">
                <a href="https://www.facebook.com/profile.php?id=61576165315442" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-blue-600/20 hover:bg-blue-600 flex items-center justify-center transition-all group">
                  <Facebook className="w-4 h-4 text-blue-300 group-hover:text-white" />
                </a>
                <a href="https://www.tiktok.com/@apotre_nestor?_r=1&_t=ZS-93INNWc0915" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-pink-600/20 hover:bg-pink-600 flex items-center justify-center transition-all group">
                  <Music className="w-4 h-4 text-pink-300 group-hover:text-white" />
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 text-center text-sm text-blue-200/40">
          <p>© {new Date().getFullYear()} Formation Théologique Génération Joël. Tous droits réservés.</p>
          <p className="text-xs mt-2 text-blue-200/30">Développé avec ❤️ pour la gloire de Dieu</p>
        </div>
      </div>
    </footer>
  );
}