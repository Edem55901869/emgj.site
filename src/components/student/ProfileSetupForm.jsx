import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, ArrowLeft, Check, Loader2, Upload, FileText } from 'lucide-react';
import { DOMAINS, FORMATION_BY_DOMAIN, requiresPreviousDiploma, getPreviousDiplomaName } from '@/components/domainFormationMapping';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function ProfileSetupForm({ onSubmit, loading }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    place_of_birth: '',
    country: '',
    city: '',
    whatsapp: '',
    domain: '',
    formation_type: '',
    previous_diploma_proof: ''
  });
  const [uploading, setUploading] = useState(false);

  const step1Valid = form.first_name && form.last_name && form.date_of_birth && form.place_of_birth && form.country && form.city && form.whatsapp;
  const needsDiploma = form.domain && form.formation_type && requiresPreviousDiploma(form.formation_type, form.domain);
  const step2Valid = form.domain && form.formation_type && (!needsDiploma || form.previous_diploma_proof);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez uploader une image (JPG, PNG)');
      return;
    }

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setForm({ ...form, previous_diploma_proof: file_url });
      toast.success('Diplôme uploadé avec succès');
    } catch (error) {
      toast.error('Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

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
                <label className="text-sm font-medium text-gray-700 mb-1 block">Date de naissance *</label>
                <Input
                  type="date"
                  value={form.date_of_birth}
                  onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
                  className="h-12 rounded-xl"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Lieu de naissance *</label>
                <Input
                  value={form.place_of_birth}
                  onChange={(e) => setForm({ ...form, place_of_birth: e.target.value })}
                  placeholder="Ex: Cotonou"
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
              <Select value={form.domain} onValueChange={(v) => setForm({ ...form, domain: v, formation_type: '' })}>
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
              <Select value={form.formation_type} onValueChange={(v) => setForm({ ...form, formation_type: v, previous_diploma_proof: '' })} disabled={!form.domain}>
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder={form.domain ? "Choisissez un type" : "Sélectionnez d'abord un domaine"} />
                </SelectTrigger>
                <SelectContent>
                  {form.domain && FORMATION_BY_DOMAIN[form.domain]?.map(f => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {needsDiploma && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Preuve du diplôme précédent ({getPreviousDiplomaName(form.formation_type)}) *
                </label>
                <p className="text-xs text-amber-600 mb-2">
                  ⚠️ Vous devez fournir une preuve de votre diplôme {getPreviousDiplomaName(form.formation_type)} pour accéder à {form.formation_type}
                </p>
                
                {form.previous_diploma_proof ? (
                  <div className="relative">
                    <div className="border-2 border-green-200 rounded-xl p-4 bg-green-50">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                          <Check className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-green-900">Diplôme uploadé</p>
                          <p className="text-xs text-green-600">En attente de vérification par l'admin</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setForm({ ...form, previous_diploma_proof: '' })}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Changer
                        </Button>
                      </div>
                      <img 
                        src={form.previous_diploma_proof} 
                        alt="Diplôme"
                        className="mt-3 w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="diploma-upload"
                      disabled={uploading}
                    />
                    <label
                      htmlFor="diploma-upload"
                      className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-2" />
                          <p className="text-sm text-gray-600">Upload en cours...</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-10 h-10 text-gray-400 mb-2" />
                          <p className="text-sm font-medium text-gray-700">Cliquez pour uploader</p>
                          <p className="text-xs text-gray-500 mt-1">Photo du diplôme (JPG, PNG)</p>
                        </>
                      )}
                    </label>
                  </div>
                )}
              </motion.div>
            )}
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