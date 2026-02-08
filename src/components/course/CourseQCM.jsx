import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle, Loader2, Award, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function CourseQCM({ course, evaluation, studentEmail, onSuccess }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [questions, setQuestions] = useState([]);
  const queryClient = useQueryClient();

  const generateQCM = async () => {
    setGenerating(true);
    try {
      const prompt = `Génère un QCM pour valider les connaissances sur ce cours:
Titre: ${course.title}
Description: ${course.description}

Questions de l'admin:
${evaluation.questions.map((q, i) => `${i + 1}. ${q.question}\nRéponse correcte: ${q.correct_answer}`).join('\n\n')}

Pour chaque question admin, génère 3 à 4 réponses FAUSSES mais plausibles (en plus de la vraie réponse).

Format JSON strict:
{
  "questions": [
    {
      "question": "Question de l'admin",
      "options": ["Vraie réponse", "Fausse 1", "Fausse 2", "Fausse 3"],
      "correctIndex": 0
    }
  ]
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  options: { type: "array", items: { type: "string" } },
                  correctIndex: { type: "number" }
                }
              }
            }
          }
        }
      });

      setQuestions(response.questions);
      setGenerating(false);
    } catch (error) {
      toast.error('Erreur lors de la génération du QCM');
      setGenerating(false);
    }
  };

  const submitQCM = async () => {
    const correctAnswers = questions.filter((q, i) => selectedAnswers[i] === q.correctIndex).length;
    const score = (correctAnswers / questions.length) * 20;
    const passed = score >= 12;

    await base44.entities.StudentCourseProgress.create({
      student_email: studentEmail,
      course_id: course.id,
      score: parseFloat(score.toFixed(2)),
      passed,
      attempts: 1
    });

    if (!passed) {
      const verses = [
        "« Je puis tout par celui qui me fortifie. » - Philippiens 4:13",
        "« Car je connais les projets que j'ai formés sur vous, dit l'Éternel, projets de paix et non de malheur, afin de vous donner un avenir et de l'espérance. » - Jérémie 29:11",
        "« N'aie pas peur, car je suis avec toi; ne promène pas des regards inquiets, car je suis ton Dieu. » - Ésaïe 41:10"
      ];
      const randomVerse = verses[Math.floor(Math.random() * verses.length)];

      await base44.entities.Notification.create({
        recipient_email: studentEmail,
        type: 'warning',
        title: 'Continuez vos efforts ! 📖',
        message: `Votre note: ${score.toFixed(2)}/20. Reprenez le cours et réessayez. ${randomVerse}`
      });
    } else {
      await base44.entities.Notification.create({
        recipient_email: studentEmail,
        type: 'success',
        title: 'Cours validé ! 🎉',
        message: `Félicitations ! Note: ${score.toFixed(2)}/20. Vous pouvez passer au cours suivant.`
      });
    }

    queryClient.invalidateQueries({ queryKey: ['courseProgress'] });
    setShowResults(true);
    if (passed && onSuccess) onSuccess();
  };

  if (generating) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
        <span className="text-gray-600">Génération du QCM...</span>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-6">
        <Button onClick={generateQCM} className="bg-blue-600 hover:bg-blue-700 rounded-xl">
          <Award className="w-4 h-4 mr-2" />
          Commencer l'évaluation
        </Button>
      </div>
    );
  }

  if (showResults) {
    const correctAnswers = questions.filter((q, i) => selectedAnswers[i] === q.correctIndex).length;
    const score = (correctAnswers / questions.length) * 20;
    const passed = score >= 12;

    return (
      <Card className="p-6 text-center">
        <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${passed ? 'bg-green-100' : 'bg-red-100'}`}>
          {passed ? <CheckCircle className="w-8 h-8 text-green-600" /> : <XCircle className="w-8 h-8 text-red-600" />}
        </div>
        <h3 className="font-bold text-2xl mb-2">{score.toFixed(2)} / 20</h3>
        <p className="text-gray-600 mb-4">
          {passed ? 'Cours validé ! Vous pouvez continuer.' : 'Note insuffisante. Reprenez le cours.'}
        </p>
        <Badge className={passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
          {correctAnswers} / {questions.length} réponses correctes
        </Badge>
        {!passed && (
          <Button onClick={() => { setShowResults(false); setCurrentQuestion(0); setSelectedAnswers({}); generateQCM(); }} variant="outline" className="mt-4 rounded-xl">
            <RefreshCw className="w-4 h-4 mr-2" />
            Réessayer
          </Button>
        )}
      </Card>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <Badge className="bg-blue-100 text-blue-700">
          Question {currentQuestion + 1} / {questions.length}
        </Badge>
        <span className="text-sm text-gray-500">{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
      </div>

      <Card className="p-6">
        <h3 className="font-bold text-gray-900 mb-4">{question.question}</h3>
        <div className="space-y-2">
          {question.options.map((option, i) => (
            <button
              key={i}
              onClick={() => setSelectedAnswers({ ...selectedAnswers, [currentQuestion]: i })}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                selectedAnswers[currentQuestion] === i
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedAnswers[currentQuestion] === i ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                }`}>
                  {selectedAnswers[currentQuestion] === i && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <span className="text-gray-900">{option}</span>
              </div>
            </button>
          ))}
        </div>
      </Card>

      <div className="flex gap-2">
        {currentQuestion > 0 && (
          <Button onClick={() => setCurrentQuestion(currentQuestion - 1)} variant="outline" className="rounded-xl">
            Précédent
          </Button>
        )}
        {currentQuestion < questions.length - 1 ? (
          <Button
            onClick={() => setCurrentQuestion(currentQuestion + 1)}
            disabled={selectedAnswers[currentQuestion] === undefined}
            className="ml-auto bg-blue-600 hover:bg-blue-700 rounded-xl"
          >
            Suivant
          </Button>
        ) : (
          <Button
            onClick={submitQCM}
            disabled={Object.keys(selectedAnswers).length !== questions.length}
            className="ml-auto bg-green-600 hover:bg-green-700 rounded-xl"
          >
            Soumettre
          </Button>
        )}
      </div>
    </div>
  );
}