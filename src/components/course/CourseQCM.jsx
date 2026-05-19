import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle, Loader2, Award, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

/**
 * Détecte si une question est de type rédaction.
 * Une question est "rédaction" si :
 *  - son champ question_type vaut 'redaction'
 *  - OU sa réponse correcte est longue (> 80 chars) → signe que c'est un développement
 *  - OU la question commence par des verbes de rédaction
 */
function isRedactionQuestion(q) {
  if (!q) return false;
  if (q.question_type === 'redaction') return true;
  if (q.question_type === 'qcm') return false;

  // Heuristique sur la longueur de la réponse
  const answer = (q.correct_answer || '');
  if (answer.length > 80) return true;

  // Heuristique sur la formulation de la question
  const questionLower = (q.question || '').toLowerCase();
  const redactionKeywords = ['définissez', 'définissez', 'expliquez', 'décrivez', 'analysez',
    'commentez', 'résumez', 'racontez', 'donnez', 'quelles sont', 'quel est', 'que pensez',
    'que concluez', 'énumérez', 'dites', 'c\'est quoi', 'en quoi', 'comment', 'pourquoi'];
  return redactionKeywords.some(kw => questionLower.includes(kw));
}

export default function CourseQCM({ course, evaluation, studentEmail, onSuccess }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [writtenAnswers, setWrittenAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [finalScore, setFinalScore] = useState(null);
  const [finalPassed, setFinalPassed] = useState(false);
  const queryClient = useQueryClient();

  const generateQCM = async () => {
    setGenerating(true);
    try {
      const allQuestions = evaluation?.questions || [];

      // Séparer les questions selon leur nature réelle
      const qcmQuestions = allQuestions.filter(q => !isRedactionQuestion(q));
      const redactionQuestions = allQuestions.filter(q => isRedactionQuestion(q));

      let generatedQuestions = [];

      // Générer les QCM avec faux choix via LLM uniquement s'il y en a
      if (qcmQuestions.length > 0) {
        const prompt = `Génère un QCM pour valider les connaissances sur ce cours:
Titre: ${course.title}
Description: ${course.description || ''}

Questions de l'admin:
${qcmQuestions.map((q, i) => `${i + 1}. ${q.question}\nRéponse correcte: ${q.correct_answer}`).join('\n\n')}

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

        const shuffledQuestions = response.questions.map(q => {
          const correctAnswer = q.options[q.correctIndex];
          const shuffled = [...q.options].sort(() => Math.random() - 0.5);
          return {
            ...q,
            type: 'qcm',
            options: shuffled,
            correctIndex: shuffled.indexOf(correctAnswer)
          };
        });

        generatedQuestions = [...generatedQuestions, ...shuffledQuestions];
      }

      // Ajouter les questions de rédaction directement
      if (redactionQuestions.length > 0) {
        const redactionQs = redactionQuestions.map(q => ({
          question: q.question,
          type: 'redaction',
          correctAnswer: q.correct_answer
        }));
        generatedQuestions = [...generatedQuestions, ...redactionQs];
      }

      // Si aucune question générée (éval vide), afficher erreur
      if (generatedQuestions.length === 0) {
        toast.error('Cette évaluation ne contient aucune question.');
        setGenerating(false);
        return;
      }

      setQuestions(generatedQuestions);
    } catch (error) {
      toast.error('Erreur lors de la génération du QCM');
    }
    setGenerating(false);
  };

  const submitQCM = async () => {
    setSubmitting(true);
    try {
      // Score QCM
      const qcmQuestions = questions.filter(q => q.type === 'qcm');
      const correctQCM = qcmQuestions.filter(q => {
        const qIndex = questions.indexOf(q);
        return selectedAnswers[qIndex] === q.correctIndex;
      }).length;

      // Score rédaction via IA
      const redactionQuestions = questions.filter(q => q.type === 'redaction');
      let redactionScore = 0;

      if (redactionQuestions.length > 0) {
        // Seulement évaluer les rédactions qui ont une réponse
        const answeredRedactions = redactionQuestions.filter(q => {
          const idx = questions.indexOf(q);
          return writtenAnswers[idx]?.trim();
        });

        if (answeredRedactions.length > 0) {
          const evaluationPrompt = `Évalue ces réponses d'étudiant par rapport aux réponses attendues. Donne un score de 0 à 1 pour chaque réponse (0 = incorrect ou vide, 1 = correct et complet).

${answeredRedactions.map((q, i) => {
  const qIndex = questions.indexOf(q);
  return `Question ${i + 1}: ${q.question}
Réponse attendue: ${q.correctAnswer}
Réponse de l'étudiant: ${writtenAnswers[qIndex] || '(Pas de réponse)'}`;
}).join('\n\n')}

Retourne un JSON avec le score moyen de 0 à 1.`;

          try {
            const evalResult = await base44.integrations.Core.InvokeLLM({
              prompt: evaluationPrompt,
              response_json_schema: {
                type: "object",
                properties: {
                  average_score: { type: "number" }
                }
              }
            });
            redactionScore = (evalResult.average_score || 0) * redactionQuestions.length;
          } catch {
            // En cas d'erreur IA, score rédaction = 0
            redactionScore = 0;
          }
        }
        // Si aucune rédaction répondue, redactionScore reste 0
        // mais on ne pénalise pas : les rédactions non répondues = 0 pts
      }

      const totalCorrect = correctQCM + redactionScore;
      const score = questions.length > 0 ? (totalCorrect / questions.length) * 20 : 0;
      const passed = score >= 12;

      // Sauvegarder le progrès
      const existing = await base44.entities.StudentCourseProgress.filter({
        student_email: studentEmail,
        course_id: course.id
      });

      if (existing.length > 0) {
        await base44.entities.StudentCourseProgress.update(existing[0].id, {
          score: parseFloat(score.toFixed(2)),
          passed,
          attempts: (existing[0].attempts || 1) + 1
        });
      } else {
        await base44.entities.StudentCourseProgress.create({
          student_email: studentEmail,
          course_id: course.id,
          score: parseFloat(score.toFixed(2)),
          passed,
          attempts: 1
        });
      }

      // Notification
      if (!passed) {
        const verses = [
          "« Je puis tout par celui qui me fortifie. » - Philippiens 4:13",
          "« Car je connais les projets que j'ai formés sur vous, dit l'Éternel, projets de paix et non de malheur. » - Jérémie 29:11",
          "« N'aie pas peur, car je suis avec toi. » - Ésaïe 41:10"
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

      // Stocker le score final pour l'affichage des résultats
      setFinalScore(parseFloat(score.toFixed(2)));
      setFinalPassed(passed);
      setShowResults(true);
      if (passed && onSuccess) onSuccess();
    } catch (error) {
      toast.error('Erreur lors de la soumission');
    }
    setSubmitting(false);
  };

  // --- ÉTATS UI ---

  if (generating) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="text-gray-600 font-medium">Génération de l'évaluation...</span>
        <p className="text-xs text-gray-400">Cela peut prendre quelques secondes</p>
      </div>
    );
  }

  if (submitting) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        <span className="text-gray-600 font-medium">Correction en cours...</span>
        <p className="text-xs text-gray-400">L'IA analyse vos réponses</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-8">
        <Award className="w-12 h-12 text-blue-600 mx-auto mb-3" />
        <p className="text-gray-600 mb-4 text-sm">
          {(evaluation?.questions?.length || 0)} question{evaluation?.questions?.length > 1 ? 's' : ''} au programme
        </p>
        <Button onClick={generateQCM} className="bg-blue-600 hover:bg-blue-700 rounded-xl px-8">
          <Award className="w-4 h-4 mr-2" />
          Commencer l'évaluation
        </Button>
      </div>
    );
  }

  if (showResults) {
    const score = finalScore;
    const passed = finalPassed;

    return (
      <Card className="p-6 text-center">
        <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${passed ? 'bg-green-100' : 'bg-red-100'}`}>
          {passed ? <CheckCircle className="w-10 h-10 text-green-600" /> : <XCircle className="w-10 h-10 text-red-600" />}
        </div>
        <h3 className="font-bold text-3xl mb-2">{score} / 20</h3>
        <p className={`text-base font-semibold mb-1 ${passed ? 'text-green-600' : 'text-red-600'}`}>
          {passed ? '🎉 Cours validé !' : '❌ Note insuffisante'}
        </p>
        <p className="text-gray-500 text-sm mb-6">
          {passed ? 'Vous pouvez passer au cours suivant.' : 'Reprenez le cours et réessayez.'}
        </p>
        {!passed && (
          <Button
            onClick={() => {
              setShowResults(false);
              setCurrentQuestion(0);
              setSelectedAnswers({});
              setWrittenAnswers({});
              setFinalScore(null);
              setFinalPassed(false);
              setQuestions([]);
            }}
            variant="outline"
            className="rounded-xl"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Réessayer
          </Button>
        )}
      </Card>
    );
  }

  const question = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;

  // Peut-on passer à la question suivante ?
  const canGoNext = question.type === 'qcm'
    ? selectedAnswers[currentQuestion] !== undefined
    : true; // rédaction : toujours possible de passer (même sans répondre)

  // Peut-on soumettre ?
  const canSubmit = questions.every((q, i) => {
    if (q.type === 'qcm') return selectedAnswers[i] !== undefined;
    return true; // rédaction optionnelle
  });

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center justify-between mb-2">
        <Badge className="bg-blue-100 text-blue-700">
          Question {currentQuestion + 1} / {questions.length}
        </Badge>
        <span className="text-sm text-gray-500">{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
        <div
          className="bg-blue-600 h-1.5 rounded-full transition-all"
          style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
        />
      </div>

      <Card className="p-6">
        {/* Badge type */}
        <div className="mb-3">
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
            question.type === 'qcm' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
          }`}>
            {question.type === 'qcm' ? 'QCM' : '✍️ Rédaction libre'}
          </span>
        </div>

        <h3 className="font-bold text-gray-900 mb-4 leading-relaxed whitespace-pre-line">{question.question}</h3>

        {question.type === 'qcm' ? (
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
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    selectedAnswers[currentQuestion] === i ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                  }`}>
                    {selectedAnswers[currentQuestion] === i && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <span className="text-gray-900 text-sm">{option}</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div>
            <textarea
              value={writtenAnswers[currentQuestion] || ''}
              onChange={(e) => setWrittenAnswers({ ...writtenAnswers, [currentQuestion]: e.target.value })}
              placeholder="Rédigez votre réponse ici... (facultatif)"
              className="w-full p-4 border-2 border-gray-200 rounded-xl min-h-[160px] focus:border-blue-600 focus:outline-none resize-none text-sm"
            />
            <p className="text-xs text-gray-400 mt-2">
              ✍️ Réponse libre — vous pouvez passer sans répondre
            </p>
          </div>
        )}
      </Card>

      <div className="flex gap-2">
        {currentQuestion > 0 && (
          <Button
            onClick={() => setCurrentQuestion(currentQuestion - 1)}
            variant="outline"
            className="rounded-xl"
          >
            Précédent
          </Button>
        )}
        {!isLastQuestion ? (
          <Button
            onClick={() => setCurrentQuestion(currentQuestion + 1)}
            disabled={!canGoNext}
            className="ml-auto bg-blue-600 hover:bg-blue-700 rounded-xl"
          >
            Suivant
          </Button>
        ) : (
          <Button
            onClick={submitQCM}
            disabled={!canSubmit}
            className="ml-auto bg-green-600 hover:bg-green-700 rounded-xl"
          >
            ✅ Soumettre
          </Button>
        )}
      </div>
    </div>
  );
}