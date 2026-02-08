import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, ArrowLeft, Check, Loader2 } from 'lucide-react';

const DOMAINS = ['THÉOLOGIE', 'LEADERSHIP', 'MISSIOLOGIE', 'PROPHÉTIQUE', 'ENTREPRENEURIAT', 'AUMÔNERIE', 'MINISTÈRE APOSTOLIQUE'];
const FORMATION_TYPES = ['Discipola', 'Brevet', 'Baccalauréat', 'Licence', 'Master', 'Doctorat'];

export default function ProfileSetupForm({ onSubmit, loading }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    country: '',
    city: '',
    whatsapp: '',
    domain: '',
    formation_type: ''
  });

  const step1Valid = form.first_name && form.last_name && form.country && form.city && form.whatsapp;
  const step2Valid = form.domain && form.formation_type;

  const handleSubmit = () => {
    if (step2Valid) onSubmit(form);
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Progress */}
      <div className="flex items-center gap-3 mb-8">
        <div className={`flex-1 h-1.5 rounded-full transition-colors ${step >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`} />
        <div className={`flex-1 h-1.5 rounded-full transition-colors ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            <div>
              <h2 className="text-xl font-bold text-gray-900">Informations personnelles</h2>
              <p className="text-gray-500 text-sm mt-1">Étape 1 sur 2</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Prénom *</label>
                <Input
                  value={form.first_name}
                  onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  placeholder="Votre prénom"
                  className="h-12 rounded-xl"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Nom *</label>
                <Input
                  value={form.last_name}
                  onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                  placeholder="Votre nom"
                  className="h-12 rounded-xl"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Pays *</label>
                <Input
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  placeholder="Ex: Bénin"
                  className="h-12 rounded-xl"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Ville *</label>
                <Input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="Ex: Cotonou"
                  className="h-12 rounded-xl"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">WhatsApp *</label>
              <Input
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                placeholder="+229 XX XX XX XX"
                className="h-12 rounded-xl"
              />
            </div>
            <Button
              onClick={() => setStep(2)}
              disabled={!step1Valid}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 rounded-xl"
            >
              Suivant <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            <div>
              <h2 className="text-xl font-bold text-gray-900">Choix de formation</h2>
              <p className="text-gray-500 text-sm mt-1">Étape 2 sur 2</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Domaine *</label>
              <Select value={form.domain} onValueChange={(v) => setForm({ ...form, domain: v })}>
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="Choisissez un domaine" />
                </SelectTrigger>
                <SelectContent>
                  {DOMAINS.map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Type de formation *</label>
              <Select value={form.formation_type} onValueChange={(v) => setForm({ ...form, formation_type: v })}>
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="Choisissez un type" />
                </SelectTrigger>
                <SelectContent>
                  {FORMATION_TYPES.map(f => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setStep(1)}
                variant="outline"
                className="flex-1 h-12 rounded-xl"
              >
                <ArrowLeft className="mr-2 w-4 h-4" /> Retour
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!step2Valid || loading}
                className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 rounded-xl"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>Envoyer <Check className="ml-2 w-4 h-4" /></>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}