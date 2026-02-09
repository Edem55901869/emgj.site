import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Mail, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function ContactSection() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Préparer le message WhatsApp formaté
    const whatsappMessage = `📩 *Nouveau message de contact FTGJ*\n\n` +
      `👤 *Nom :* ${form.name}\n` +
      `📧 *Email :* ${form.email}\n\n` +
      `💬 *Message :*\n${form.message}\n\n` +
      `_Envoyé depuis le site web FTGJ_`;
    
    const whatsappUrl = `https://wa.me/22892614961?text=${encodeURIComponent(whatsappMessage)}`;
    
    setSending(true);
    try {
      await base44.entities.ContactMessage.create({
        name: form.name,
        email: form.email,
        message: form.message,
        status: 'nouveau'
      });
      
      // Rediriger vers WhatsApp
      window.open(whatsappUrl, '_blank');
      
      toast.success('Message enregistré ! Vous allez être redirigé vers WhatsApp pour l\'envoyer.');
      setForm({ name: '', email: '', message: '' });
    } catch (error) {
      toast.error('Erreur lors de l\'envoi');
    }
    setSending(false);
  };

  return (
    <section id="contact" className="py-24 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">Contact</span>
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mt-3">Contactez-nous</h2>
          <p className="text-gray-500 mt-4">Une question ? N'hésitez pas à nous écrire.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.form
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            onSubmit={handleSubmit}
            className="space-y-5 bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
          >
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Nom complet</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Votre nom"
                required
                className="h-12 rounded-xl"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="votre@email.com"
                required
                className="h-12 rounded-xl"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Message</label>
              <Textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Votre message..."
                required
                className="min-h-[120px] rounded-xl"
              />
            </div>
            <Button
              type="submit"
              disabled={sending}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 rounded-xl text-base"
            >
              {sending ? 'Envoi en cours...' : 'Envoyer le message'}
              <Send className="ml-2 w-4 h-4" />
            </Button>
          </motion.form>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8 flex flex-col justify-center"
          >
            {[
              { icon: Mail, label: 'Email', value: 'emgj2020@gmail.com' },
              { icon: Phone, label: 'Téléphone', value: '+228 92 61 49 61' },
              { icon: MapPin, label: 'Adresse', value: 'Lomé, Togo' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">{item.label}</div>
                  <div className="text-gray-900 font-semibold">{item.value}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}