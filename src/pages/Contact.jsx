import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Send, Loader2, MessageCircle, Facebook } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import FooterSection from '../components/landing/FooterSection';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';

export default function Contact() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    country: '',
    whatsapp: '',
    email: '',
    message: ''
  });

  const sendMutation = useMutation({
    mutationFn: (data) => base44.entities.ContactMessage.create(data),
    onSuccess: () => {
      setForm({ name: '', country: '', whatsapp: '', email: '', message: '' });
      toast.success('Message envoyé avec succès ! Nous vous répondrons rapidement.');
    },
  });

  const handleSubmit = () => {
    if (!form.name || !form.country || !form.whatsapp || !form.message) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    sendMutation.mutate({
      name: form.name,
      email: form.email || form.whatsapp,
      message: `Pays: ${form.country}\nWhatsApp: ${form.whatsapp}\nEmail: ${form.email || 'Non fourni'}\n\n${form.message}`
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-6 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate(createPageUrl('Home'))} className="text-white hover:text-white/80 transition-colors">
            ← Retour à l'accueil
          </button>
          <h1 className="text-xl md:text-2xl font-bold text-white">Contactez-nous</h1>
          <div className="w-20" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Contact Établissement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Contactez l'Établissement</h2>
            <p className="text-gray-600 text-lg">Nous sommes là pour répondre à toutes vos questions</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Infos établissement */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">École Missionnaire Génération Joël</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Adresse</p>
                    <p className="text-gray-600">Lomé, Togo</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Téléphone</p>
                    <a href="tel:+22892614961" className="text-blue-600 hover:underline">+228 92 61 49 61</a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Email</p>
                    <a href="mailto:emgj2020@gmail.com" className="text-blue-600 hover:underline">emgj2020@gmail.com</a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">WhatsApp</p>
                    <a href="https://wa.me/22892614961?text=Bonjour,%20je%20souhaite%20obtenir%20des%20informations%20sur%20l'École%20Missionnaire%20Génération%20Joël" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Discuter sur WhatsApp</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulaire */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Envoyez-nous un message</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Nom et Prénoms *</label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Votre nom complet"
                    className="rounded-xl h-11 bg-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Pays *</label>
                  <Input
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    placeholder="Votre pays"
                    className="rounded-xl h-11 bg-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Numéro WhatsApp (avec code pays) *</label>
                  <Input
                    value={form.whatsapp}
                    onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                    placeholder="Ex: +229..."
                    className="rounded-xl h-11 bg-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Email (optionnel)</label>
                  <Input
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    type="email"
                    placeholder="votre@email.com"
                    className="rounded-xl h-11 bg-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Message *</label>
                  <Textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Décrivez votre demande..."
                    className="rounded-xl min-h-[120px] bg-white"
                  />
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={sendMutation.isPending}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl h-12 text-white font-medium"
                >
                  {sendMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                  Envoyer le message
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contact Développeur */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 md:p-12 shadow-2xl text-white"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Besoin d'un Développeur Web ?</h2>
            <p className="text-blue-200 text-lg">Solutions digitales professionnelles au service du Royaume</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto md:mx-0 mb-6 shadow-lg">
                <span className="text-3xl font-bold text-white">SE</span>
              </div>
              <h3 className="text-2xl font-bold mb-2">Samuel Edem</h3>
              <p className="text-blue-300 font-medium mb-4">Évangéliste & Développeur Web</p>
              <p className="text-gray-300 leading-relaxed mb-6">
                Par la grâce de Dieu, je suis évangéliste et développeur web passionné par la création de solutions digitales au service du Royaume. 
                Je réside au Bénin et je suis disponible pour vos projets de développement web, d'applications et bien plus encore. 
                Ensemble, utilisons la technologie pour faire avancer le Royaume de Dieu !
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://wa.me/2290147659277?text=Bonjour%20Samuel,%0A%0AJe%20vous%20contacte%20car%20j'ai%20un%20projet%20de%20développement%20web%20que%20j'aimerais%20discuter%20avec%20vous.%0A%0AMerci%20!"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 rounded-xl font-medium transition-colors shadow-lg"
                >
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp
                </a>
                <a
                  href="https://www.facebook.com/evgsamueledem"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-medium transition-colors shadow-lg"
                >
                  <Facebook className="w-5 h-5" />
                  Facebook
                </a>
                <a
                  href="mailto:agnimakaedeme@gmail.com"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition-colors shadow-lg"
                >
                  <Mail className="w-5 h-5" />
                  Email
                </a>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h4 className="font-bold text-xl mb-4">Services proposés</h4>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-400 text-sm">✓</span>
                  </div>
                  <span>Développement de sites web modernes et responsifs</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-400 text-sm">✓</span>
                  </div>
                  <span>Applications web sur mesure pour votre ministère</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-400 text-sm">✓</span>
                  </div>
                  <span>Plateformes e-learning et gestion d'écoles</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-400 text-sm">✓</span>
                  </div>
                  <span>Systèmes de gestion pour églises et organisations</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-400 text-sm">✓</span>
                  </div>
                  <span>Maintenance et support technique</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      <FooterSection />
    </div>
  );
}