import React, { useState } from 'react';
import { ArrowLeft, HelpCircle, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import StudentBottomNav from '../components/student/StudentBottomNav';

export default function StudentHelp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const sendMutation = useMutation({
    mutationFn: (data) => base44.entities.ContactMessage.create(data),
    onSuccess: () => {
      setForm({ name: '', email: '', message: '' });
      toast.success('Message envoyé ! Nous vous répondrons bientôt.');
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-4 pt-12 pb-6">
        <div className="flex items-center gap-3">
          <Button onClick={() => navigate(createPageUrl('StudentMore'))} variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-white">Aide & Support</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-2">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-4">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
              <HelpCircle className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Besoin d'aide ?</h2>
            <p className="text-sm text-gray-500">
              Notre équipe est là pour vous aider. Envoyez-nous un message et nous vous répondrons rapidement.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Nom</label>
              <Input 
                value={form.name} 
                onChange={(e) => setForm({ ...form, name: e.target.value })} 
                placeholder="Votre nom" 
                className="rounded-xl h-11" 
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
              <Input 
                value={form.email} 
                onChange={(e) => setForm({ ...form, email: e.target.value })} 
                type="email"
                placeholder="votre@email.com" 
                className="rounded-xl h-11" 
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Message</label>
              <Textarea 
                value={form.message} 
                onChange={(e) => setForm({ ...form, message: e.target.value })} 
                placeholder="Comment pouvons-nous vous aider ?" 
                className="rounded-xl min-h-[120px]" 
              />
            </div>
            <Button 
              onClick={() => sendMutation.mutate(form)} 
              disabled={!form.name || !form.email || !form.message || sendMutation.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl h-12"
            >
              {sendMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
              Envoyer le message
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-3">Questions fréquentes</h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium text-gray-900">Comment accéder aux cours ?</p>
              <p className="text-gray-600 mt-1">Rendez-vous dans l'onglet "Cours" pour voir tous vos cours disponibles.</p>
            </div>
            <div>
              <p className="font-medium text-gray-900">Comment contacter un enseignant ?</p>
              <p className="text-gray-600 mt-1">Utilisez la section "Questions" pour poser vos questions sur un cours spécifique.</p>
            </div>
            <div>
              <p className="font-medium text-gray-900">Où voir mes bulletins ?</p>
              <p className="text-gray-600 mt-1">Vos bulletins sont disponibles dans votre profil une fois publiés par l'administration.</p>
            </div>
          </div>
        </div>
      </div>

      <StudentBottomNav />
    </div>
  );
}