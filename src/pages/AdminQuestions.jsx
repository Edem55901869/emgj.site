import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { HelpCircle, Send, Loader2, CheckCircle, Clock, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import AdminTopNav from '../components/admin/AdminTopNav';
import AdminGuard from '../components/admin/AdminGuard';

export default function AdminQuestions() {
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [response, setResponse] = useState('');
  const queryClient = useQueryClient();

  const { data: questions = [], isLoading } = useQuery({
    queryKey: ['adminQuestions'],
    queryFn: () => base44.entities.CourseQuestion.list('-created_date', 100),
  });

  const respondMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.CourseQuestion.update(data.id, {
        response: data.response,
        status: 'répondu'
      });

      // Envoyer notification à l'étudiant
      await base44.entities.Notification.create({
        recipient_email: data.student_email,
        type: 'info',
        title: '💬 Réponse à votre question',
        message: `L'administration a répondu à votre question: "${data.response}"`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminQuestions'] });
      setSelectedQuestion(null);
      setResponse('');
      toast.success('Réponse envoyée avec succès');
    },
  });

  const pendingCount = questions.filter(q => q.status === 'en_attente').length;

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <AdminTopNav />
        <div className="pt-20 px-4 pb-8 max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Questions des étudiants</h1>
              <p className="text-gray-500 text-sm mt-1">Répondez aux questions de support</p>
            </div>
            {pendingCount > 0 && (
              <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                {pendingCount} en attente
              </Badge>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">Aucune question pour le moment</p>
            </div>
          ) : (
            <div className="space-y-3">
              {questions.map(question => (
                <div
                  key={question.id}
                  className={`bg-white rounded-2xl p-5 shadow-sm border transition-all cursor-pointer hover:shadow-lg ${
                    question.status === 'en_attente' ? 'border-amber-200' : 'border-gray-100'
                  }`}
                  onClick={() => setSelectedQuestion(question)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      question.status === 'en_attente' ? 'bg-amber-100' : 'bg-green-100'
                    }`}>
                      {question.status === 'en_attente' ? (
                        <Clock className="w-5 h-5 text-amber-600" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-gray-900">{question.student_name}</h3>
                          <p className="text-xs text-gray-500">{question.student_email}</p>
                        </div>
                        <Badge className={question.status === 'en_attente' ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'}>
                          {question.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 mb-2 line-clamp-2">{question.question}</p>
                      {question.response && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <p className="text-xs font-semibold text-blue-900 mb-1">Votre réponse:</p>
                          <p className="text-sm text-blue-700">{question.response}</p>
                        </div>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {question.created_date && format(new Date(question.created_date), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Dialog open={!!selectedQuestion} onOpenChange={() => setSelectedQuestion(null)}>
          <DialogContent className="max-w-2xl rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Question de {selectedQuestion?.student_name}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Question:</p>
                <p className="text-gray-900 whitespace-pre-wrap">{selectedQuestion?.question}</p>
              </div>
              {selectedQuestion?.status === 'en_attente' ? (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Votre réponse</label>
                    <Textarea
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      placeholder="Rédigez votre réponse..."
                      className="rounded-xl min-h-[150px]"
                    />
                  </div>
                  <Button
                    onClick={() => respondMutation.mutate({
                      id: selectedQuestion.id,
                      response,
                      student_email: selectedQuestion.student_email
                    })}
                    disabled={!response || respondMutation.isPending}
                    className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl h-11"
                  >
                    {respondMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Envoyer la réponse
                  </Button>
                </>
              ) : (
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-xs text-blue-600 font-semibold mb-2">Réponse envoyée:</p>
                  <p className="text-blue-900 whitespace-pre-wrap">{selectedQuestion?.response}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminGuard>
  );
}