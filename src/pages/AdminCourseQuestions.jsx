import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, Loader2, Send, Mic, Image as ImageIcon, X, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import AdminTopNav from '../components/admin/AdminTopNav';
import AdminGuard from '../components/admin/AdminGuard';

export default function AdminCourseQuestions() {
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [answerAudioFile, setAnswerAudioFile] = useState(null);
  const [answerImageFiles, setAnswerImageFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const queryClient = useQueryClient();

  const { data: questions = [], isLoading } = useQuery({
    queryKey: ['courseQuestions'],
    queryFn: () => base44.entities.StudentCourseQuestion.list('-created_date', 100),
  });

  const answerMutation = useMutation({
    mutationFn: async (data) => {
      setUploading(true);
      let audioUrl = null;
      let imageUrls = [];

      if (answerAudioFile) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: answerAudioFile });
        audioUrl = file_url;
      }

      for (const img of answerImageFiles) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: img });
        imageUrls.push(file_url);
      }

      await base44.entities.StudentCourseQuestion.update(data.questionId, {
        answer_text: answerText || null,
        answer_audio_url: audioUrl,
        answer_images: imageUrls.length > 0 ? imageUrls : null,
        status: 'répondue',
        answered_date: new Date().toISOString()
      });

      // Créer une notification pour l'étudiant
      await base44.entities.Notification.create({
        user_email: data.studentEmail,
        title: 'Réponse à votre question',
        message: `L'administrateur a répondu à votre question sur le cours "${data.courseTitle}"`,
        type: 'info',
        is_read: false
      });

      setUploading(false);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courseQuestions'] });
      setSelectedQuestion(null);
      setAnswerText('');
      setAnswerAudioFile(null);
      setAnswerImageFiles([]);
      toast.success('Réponse envoyée');
    },
  });

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const file = new File([blob], 'answer-audio.webm', { type: 'audio/webm' });
        setAnswerAudioFile(file);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
    } catch (error) {
      toast.error("Impossible d'accéder au microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && recording) {
      mediaRecorder.stop();
      setRecording(false);
      setMediaRecorder(null);
    }
  };

  const handleAnswer = (question) => {
    setSelectedQuestion(question);
    setAnswerText('');
    setAnswerAudioFile(null);
    setAnswerImageFiles([]);
  };

  const pendingQuestions = questions.filter(q => q.status === 'en_attente');
  const answeredQuestions = questions.filter(q => q.status === 'répondue');

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <AdminTopNav />
        <div className="pt-20 px-4 pb-8 max-w-5xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Questions des étudiants</h1>
            <p className="text-gray-500 text-sm mt-1">Répondez aux questions des étudiants sur les cours</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-2xl p-6 shadow-lg">
              <Clock className="w-8 h-8 mb-2" />
              <p className="text-3xl font-bold mb-1">{pendingQuestions.length}</p>
              <p className="text-white/80">Question{pendingQuestions.length > 1 ? 's' : ''} en attente</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-2xl p-6 shadow-lg">
              <CheckCircle className="w-8 h-8 mb-2" />
              <p className="text-3xl font-bold mb-1">{answeredQuestions.length}</p>
              <p className="text-white/80">Question{answeredQuestions.length > 1 ? 's' : ''} répondue{answeredQuestions.length > 1 ? 's' : ''}</p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Aucune question reçue</p>
            </div>
          ) : (
            <>
              {pendingQuestions.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">En attente de réponse</h2>
                  <div className="space-y-4">
                    {pendingQuestions.map(q => (
                      <div key={q.id} className="bg-white rounded-2xl border border-orange-200 p-5 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-bold text-gray-900">{q.course_title}</h3>
                            <p className="text-sm text-gray-600">{q.student_name} • {new Date(q.created_date).toLocaleDateString()}</p>
                          </div>
                          <Badge className="bg-orange-50 text-orange-700 border-orange-200">En attente</Badge>
                        </div>
                        {q.question_text && (
                          <div className="bg-gray-50 rounded-xl p-3 mb-3">
                            <p className="text-sm text-gray-700">{q.question_text}</p>
                          </div>
                        )}
                        {q.question_audio_url && (
                          <div className="mb-3">
                            <p className="text-xs text-gray-600 mb-1">Enregistrement vocal :</p>
                            <audio src={q.question_audio_url} controls className="w-full" />
                          </div>
                        )}
                        {q.question_images?.length > 0 && (
                          <div className="mb-3 flex flex-wrap gap-2">
                            {q.question_images.map((img, idx) => (
                              <img key={idx} src={img} alt="" className="w-24 h-24 object-cover rounded-lg" />
                            ))}
                          </div>
                        )}
                        <Button onClick={() => handleAnswer(q)} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl">
                          <Send className="w-4 h-4 mr-2" /> Répondre
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {answeredQuestions.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Questions répondues</h2>
                  <div className="space-y-4">
                    {answeredQuestions.map(q => (
                      <div key={q.id} className="bg-white rounded-2xl border border-green-200 p-5 shadow-sm">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-bold text-gray-900">{q.course_title}</h3>
                            <p className="text-sm text-gray-600">{q.student_name} • {new Date(q.created_date).toLocaleDateString()}</p>
                          </div>
                          <Badge className="bg-green-50 text-green-700 border-green-200">Répondue</Badge>
                        </div>
                        {q.question_text && (
                          <div className="bg-gray-50 rounded-xl p-3 mb-3">
                            <p className="text-xs text-gray-500 mb-1">Question :</p>
                            <p className="text-sm text-gray-700">{q.question_text}</p>
                          </div>
                        )}
                        {q.answer_text && (
                          <div className="bg-green-50 rounded-xl p-3 mb-3 border border-green-200">
                            <p className="text-xs text-green-600 mb-1">Votre réponse :</p>
                            <p className="text-sm text-gray-700">{q.answer_text}</p>
                          </div>
                        )}
                        {q.answer_audio_url && (
                          <div className="mb-3">
                            <p className="text-xs text-green-600 mb-1">Réponse vocale :</p>
                            <audio src={q.answer_audio_url} controls className="w-full" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <Dialog open={!!selectedQuestion} onOpenChange={() => setSelectedQuestion(null)}>
          <DialogContent className="max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Répondre à la question</DialogTitle>
            </DialogHeader>
            {selectedQuestion && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Étudiant : {selectedQuestion.student_name}</p>
                  <p className="text-sm font-medium text-gray-700 mb-2">Cours : {selectedQuestion.course_title}</p>
                  {selectedQuestion.question_text && (
                    <div className="mb-2">
                      <p className="text-xs text-gray-500 mb-1">Question :</p>
                      <p className="text-sm text-gray-900">{selectedQuestion.question_text}</p>
                    </div>
                  )}
                  {selectedQuestion.question_audio_url && (
                    <div className="mb-2">
                      <p className="text-xs text-gray-500 mb-1">Audio :</p>
                      <audio src={selectedQuestion.question_audio_url} controls className="w-full" />
                    </div>
                  )}
                  {selectedQuestion.question_images?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedQuestion.question_images.map((img, idx) => (
                        <img key={idx} src={img} alt="" className="w-20 h-20 object-cover rounded-lg" />
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Réponse écrite</label>
                  <Textarea
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    placeholder="Écrivez votre réponse..."
                    className="rounded-xl min-h-32"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Réponse vocale (optionnel)</label>
                  {!answerAudioFile ? (
                    <Button
                      type="button"
                      onClick={recording ? stopRecording : startRecording}
                      variant={recording ? 'destructive' : 'outline'}
                      className="w-full rounded-xl"
                    >
                      <Mic className="w-4 h-4 mr-2" />
                      {recording ? 'Arrêter l\'enregistrement' : 'Enregistrer un audio'}
                    </Button>
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
                      <div className="flex-1">
                        <audio src={URL.createObjectURL(answerAudioFile)} controls className="w-full" />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setAnswerAudioFile(null)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Images (optionnel)</label>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setAnswerImageFiles(Array.from(e.target.files))}
                    className="rounded-xl"
                  />
                  {answerImageFiles.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {answerImageFiles.map((file, idx) => (
                        <div key={idx} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt=""
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => setAnswerImageFiles(answerImageFiles.filter((_, i) => i !== idx))}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => answerMutation.mutate({
                    questionId: selectedQuestion.id,
                    studentEmail: selectedQuestion.student_email,
                    courseTitle: selectedQuestion.course_title
                  })}
                  disabled={uploading || (!answerText && !answerAudioFile && answerImageFiles.length === 0)}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl h-11"
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Envoyer la réponse'}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminGuard>
  );
}