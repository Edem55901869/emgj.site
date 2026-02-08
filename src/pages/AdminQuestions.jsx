import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, Send, Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import AdminTopNav from '../components/admin/AdminTopNav';
import AdminGuard from '../components/admin/AdminGuard';

export default function AdminQuestions() {
  const [responses, setResponses] = useState({});
  const queryClient = useQueryClient();

  const { data: courseQuestions = [], isLoading: qLoading } = useQuery({ queryKey: ['courseQuestions'], queryFn: () => base44.entities.CourseQuestion.list('-created_date', 200) });
  const { data: contactMessages = [], isLoading: cLoading } = useQuery({ queryKey: ['contactMessages'], queryFn: () => base44.entities.ContactMessage.list('-created_date', 200) });

  const respondToQuestionMutation = useMutation({
    mutationFn: ({ id, response }) => base44.entities.CourseQuestion.update(id, { response, status: 'répondu' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courseQuestions'] });
      toast.success('Réponse envoyée');
      setResponses({});
    },
  });

  const respondToContactMutation = useMutation({
    mutationFn: ({ id, response }) => base44.entities.ContactMessage.update(id, { response, status: 'répondu' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contactMessages'] });
      toast.success('Réponse envoyée');
      setResponses({});
    },
  });

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
        <AdminTopNav />
        <div className="pt-20 px-4 pb-8 max-w-5xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Questions & Messages</h1>
            <p className="text-gray-500 mt-1">Répondez aux questions des étudiants et messages de contact</p>
          </div>

          <Tabs defaultValue="courses" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="courses">Questions sur les cours</TabsTrigger>
              <TabsTrigger value="contact">Messages de contact</TabsTrigger>
            </TabsList>

            <TabsContent value="courses">
              {qLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
              ) : courseQuestions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">Aucune question pour le moment</div>
              ) : (
                <div className="space-y-3">
                  {courseQuestions.map(q => (
                    <div key={q.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-bold flex-shrink-0">
                          {q.student_name?.[0]}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{q.student_name}</p>
                          <p className="text-xs text-gray-500">{q.created_date && format(new Date(q.created_date), 'd MMM yyyy HH:mm', { locale: fr })}</p>
                        </div>
                        <Badge className={`${q.status === 'répondu' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                          {q.status}
                        </Badge>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 mb-3">
                        <p className="text-sm text-gray-700">{q.question}</p>
                      </div>
                      {q.response ? (
                        <div className="bg-blue-50 rounded-xl p-3">
                          <p className="text-xs text-blue-600 font-semibold mb-1">Votre réponse :</p>
                          <p className="text-sm text-gray-700">{q.response}</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Textarea
                            value={responses[q.id] || ''}
                            onChange={(e) => setResponses({ ...responses, [q.id]: e.target.value })}
                            placeholder="Écrivez votre réponse..."
                            className="rounded-xl"
                          />
                          <Button
                            onClick={() => respondToQuestionMutation.mutate({ id: q.id, response: responses[q.id] })}
                            disabled={!responses[q.id]?.trim() || respondToQuestionMutation.isPending}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 rounded-xl"
                          >
                            <Send className="w-3 h-3 mr-1" /> Répondre
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="contact">
              {cLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
              ) : contactMessages.length === 0 ? (
                <div className="text-center py-12 text-gray-500">Aucun message de contact</div>
              ) : (
                <div className="space-y-3">
                  {contactMessages.map(msg => (
                    <div key={msg.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                          <Mail className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{msg.name}</p>
                          <p className="text-xs text-gray-500">{msg.email}</p>
                          <p className="text-xs text-gray-400 mt-1">{msg.created_date && format(new Date(msg.created_date), 'd MMM yyyy HH:mm', { locale: fr })}</p>
                        </div>
                        {msg.message.includes('WhatsApp:') && (() => {
                          const match = msg.message.match(/WhatsApp:\s*([+\d]+)/);
                          return match ? (
                            <a
                              href={`https://wa.me/${match[1].replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg bg-green-100 hover:bg-green-200 transition-colors"
                              title="Contacter sur WhatsApp"
                            >
                              <MessageCircle className="w-5 h-5 text-green-600" />
                            </a>
                          ) : null;
                        })()}
                        <Badge className={`${msg.status === 'répondu' ? 'bg-green-50 text-green-700' : msg.status === 'lu' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>
                          {msg.status}
                        </Badge>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 mb-3">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{msg.message}</p>
                      </div>
                      {msg.response ? (
                        <div className="bg-blue-50 rounded-xl p-3">
                          <p className="text-xs text-blue-600 font-semibold mb-1">Votre réponse :</p>
                          <p className="text-sm text-gray-700">{msg.response}</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Textarea
                            value={responses[msg.id] || ''}
                            onChange={(e) => setResponses({ ...responses, [msg.id]: e.target.value })}
                            placeholder="Écrivez votre réponse..."
                            className="rounded-xl"
                          />
                          <Button
                            onClick={() => respondToContactMutation.mutate({ id: msg.id, response: responses[msg.id] })}
                            disabled={!responses[msg.id]?.trim() || respondToContactMutation.isPending}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 rounded-xl"
                          >
                            <Send className="w-3 h-3 mr-1" /> Répondre
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminGuard>
  );
}