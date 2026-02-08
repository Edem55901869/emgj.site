import React from 'react';
import { Check } from 'lucide-react';

const themes = [
  { id: 'default', name: 'Par défaut', bg: 'bg-white', text: 'text-gray-900' },
  { id: 'ocean', name: 'Océan', bg: 'bg-gradient-to-br from-blue-400 to-blue-600', text: 'text-white' },
  { id: 'sunset', name: 'Coucher de soleil', bg: 'bg-gradient-to-br from-orange-400 to-pink-500', text: 'text-white' },
  { id: 'forest', name: 'Forêt', bg: 'bg-gradient-to-br from-green-400 to-emerald-600', text: 'text-white' },
  { id: 'purple', name: 'Violet', bg: 'bg-gradient-to-br from-purple-400 to-indigo-600', text: 'text-white' },
  { id: 'fire', name: 'Feu', bg: 'bg-gradient-to-br from-red-500 to-yellow-500', text: 'text-white' },
  { id: 'night', name: 'Nuit', bg: 'bg-gradient-to-br from-gray-800 to-gray-900', text: 'text-white' },
  { id: 'mint', name: 'Menthe', bg: 'bg-gradient-to-br from-teal-300 to-cyan-400', text: 'text-gray-900' },
];

export default function ThemeSelector({ selected, onSelect }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-gray-700">Thème de fond (texte uniquement)</p>
      <div className="grid grid-cols-4 gap-2">
        {themes.map(theme => (
          <button
            key={theme.id}
            onClick={() => onSelect(theme)}
            className={`relative h-16 rounded-xl ${theme.bg} ${theme.text} transition-all ${
              selected?.id === theme.id ? 'ring-2 ring-blue-600 ring-offset-2' : 'hover:scale-105'
            }`}
          >
            <span className="text-xs font-medium">{theme.name}</span>
            {selected?.id === theme.id && (
              <div className="absolute top-1 right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export { themes };