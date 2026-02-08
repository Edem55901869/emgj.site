import React from 'react';
import { GraduationCap } from 'lucide-react';

export default function FooterSection() {
  return (
    <footer className="bg-[#0a1628] text-white py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg">EMGJ</span>
            </div>
            <p className="text-blue-200/50 text-sm leading-relaxed">
              École Missionnaire Génération Joël — Former une génération de leaders spirituels pour transformer les nations.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-blue-200">Liens rapides</h4>
            <ul className="space-y-2 text-sm text-blue-200/50">
              <li><a href="#domaines" className="hover:text-white transition-colors">Nos domaines</a></li>
              <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-blue-200">Nos domaines</h4>
            <ul className="space-y-2 text-sm text-blue-200/50">
              <li>Théologie</li>
              <li>Leadership</li>
              <li>Missiologie</li>
              <li>Prophétique</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 text-center text-sm text-blue-200/40">
          © {new Date().getFullYear()} École Missionnaire Génération Joël. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}