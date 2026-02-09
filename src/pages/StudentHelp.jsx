import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, HelpCircle, Send, Loader2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import StudentBottomNav from '../components/student/StudentBottomNav';

export default function StudentHelp() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState('');
  const [question, setQuestion] = useState('');

  useEffect(() => {
    const load = async () => {
      const adminView = localStorage.getItem('admin_student_view');
      if (adminView) {
        const viewData = JSON.parse(adminView);
        setUser({ email: 'admin@preview.emgj' });
        setStudent({
          first_name: 'Admin',
          last_name: 'Preview',
          domain: viewData.domain,
          formation_type: viewData.formation_type,
          user_email: 'admin@preview.emgj'
        });
        setLoading(false);
        return;
      }

      const u = await base44.auth.me();
      setUser(u);
      const students = await base44.entities.Student.filter({ user_email: u.email });
      if (students.length > 0) setStudent(students[0]);
      setLoading(false);
    };
    load();
  }, []);

  const sendQuestionMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.CourseQuestion.create({
        course_id: 'support',
        student_email: user.email,
        student_name: `${student.first_name} ${student.last_name}`,
        question: `${subject}\n\n${question}`,
        status: 'en_attente'
      });
    },
    onSuccess: () => {
      setSubject('');
      setQuestion('');
      toast.success('Votre question a été envoyée à l\'administration');
      queryClient.invalidateQueries({ queryKey: ['studentQuestions'] });
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24">
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 px-4 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <Button onClick={() => navigate(createPageUrl('StudentMore'))} variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">Aide & Support</h1>
            <p className="text-amber-100 text-sm">Posez vos questions</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-2">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <HelpCircle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 mb-1">Centre d'assistance</h2>
              <p className="text-sm text-gray-600">
                Envoyez votre question à l'administration. Vous recevrez une réponse par notification.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Sujet *</label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ex: Question sur le cours de Théologie"
                className="rounded-xl h-11"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Votre question *</label>
              <Textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Décrivez votre question en détail..."
                className="rounded-xl min-h-[150px]"
              />
            </div>
            <Button
              onClick={() => sendQuestionMutation.mutate()}
              disabled={!subject || !question || sendQuestionMutation.isPending}
              className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 rounded-xl h-12"
            >
              {sendQuestionMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Envoyer la question
            </Button>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 rounded-2xl p-5 border border-blue-100">
          <div className="flex items-start gap-3">
            <MessageSquare className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Temps de réponse</h3>
              <p className="text-sm text-blue-700">
                L'administration répond généralement sous 24-48h. Vous serez notifié dès qu'une réponse sera disponible.
              </p>
            </div>
          </div>
        </div>
      </div>

      <StudentBottomNav />
    </div>
  );
}