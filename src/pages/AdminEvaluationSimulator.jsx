import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Play, ChevronRight, ChevronLeft, CheckCircle, XCircle, RotateCcw, BookOpen, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AdminTopNav from '../components/admin/AdminTopNav';
import AdminGuard from '../components/admin/AdminGuard';

const DOMAINS = [
  'THÉOLOGIE',
  'LEADERSHIP ET ADMINISTRATION CHRÉTIENNE',
  'MISSIOLOGIE',
  'ÉCOLE PROPHETIQUES',
  'ENTREPRENEURIAT',
  'AUMÔNERIE',
  'MINISTÈRE APOSTOLIQUE',
];

const FORMATION_TYPES = [
  'École des évangélistes',
  'Discipolat',
  'Brevet',
  'Baccalauréat',
  'Licence',
  'Master',
  'Doctorat',
];

export default function AdminEvaluationSimulator() {
  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedFormation, setSelectedFormation] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [step, setStep] = useState('setup'); // setup | course_select | running | result
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [textAnswers, setTextAnswers] = useState({});

  const { data: courses = [], isLoading: loadingCourses } = useQuery({
    queryKey: ['courses', selectedDomain, selectedFormation],
    queryFn: () => base44.entities.Course.filter({ domain: selectedDomain, formation_type: selectedFormation }, 'order', 50),
    enabled: !!selectedDomain && !!selectedFormation,
  });

  const { data: evaluations = [], isLoading: loadingEvals } = useQuery({
    queryKey: ['evaluations', selectedCourse?.id],
    queryFn: () => base44.entities.CourseEvaluation.filter({ course_id: selectedCourse?.id }, '-created_date', 10),
    enabled: !!selectedCourse?.id,
  });

  const currentQ = selectedEvaluation?.questions?.[currentQuestion];
  const totalQuestions = selectedEvaluation?.questions?.length || 0;

  const handleStartEval = (evaluation) => {
    setSelectedEvaluation(evaluation);
    setCurrentQuestion(0);
    setAnswers({});
    setTextAnswers({});
    setStep('running');
  };

  const handleAnswer = (answer) => {
    setAnswers(prev => ({ ...prev, [currentQuestion]: answer }));
  };

  const handleTextAnswer = (text) => {
    setTextAnswers(prev => ({ ...prev, [currentQuestion]: text }));
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setStep('result');
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) setCurrentQuestion(prev => prev - 1);
  };

  const calculateScore = () => {
    if (!selectedEvaluation) return { score: 0, total: 0, correct: 0 };
    const qcmQuestions = selectedEvaluation.questions.filter(q => q.question_type === 'qcm' || q.question_type === 'vrai_faux');
    let correct = 0;
    qcmQuestions.forEach((q, idx) => {
      const realIdx = selectedEvaluation.questions.indexOf(q);
      if (answers[realIdx] === q.correct_answer) correct++;
    });
    const total = qcmQuestions.length;
    const score = total > 0 ? Math.round((correct / total) * 20) : 20;
    return { score, total, correct, hasRedaction: selectedEvaluation.questions.some(q => q.question_type === 'redaction') };
  };

  const reset = () => {
    setStep('setup');
    setSelectedDomain('');
    setSelectedFormation('');
    setSelectedCourse(null);
    setSelectedEvaluation(null);
    setAnswers({});
    setTextAnswers({});
    setCurrentQuestion(0);
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <AdminTopNav />
        <div className="pt-20 px-4 pb-8 max-w-3xl mx-auto">

          {/* Header */}
          <div className="mb-6 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Play className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Simulateur d'évaluations</h1>
              <p className="text-sm text-gray-500">Testez les évaluations comme un étudiant</p>
            </div>
          </div>

          {/* STEP 1: Setup */}
          {step === 'setup' && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Domaine</label>
                <div className="grid grid-cols-1 gap-2">
                  {DOMAINS.map(d => (
                    <button
                      key={d}
                      onClick={() => { setSelectedDomain(d); setSelectedFormation(''); setSelectedCourse(null); }}
                      className={`text-left px-4 py-3 rounded-xl border transition-all text-sm font-medium ${
                        selectedDomain === d
                          ? 'bg-purple-600 text-white border-purple-600 shadow'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {selectedDomain && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Type de formation</label>
                  <div className="grid grid-cols-2 gap-2">
                    {FORMATION_TYPES.map(f => (
                      <button
                        key={f}
                        onClick={() => { setSelectedFormation(f); setSelectedCourse(null); }}
                        className={`text-left px-4 py-3 rounded-xl border transition-all text-sm font-medium ${
                          selectedFormation === f
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedDomain && selectedFormation && (
                <Button
                  onClick={() => setStep('course_select')}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl h-12 text-base font-semibold"
                >
                  Voir les cours disponibles <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              )}
            </div>
          )}

          {/* STEP 2: Select Course */}
          {step === 'course_select' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <button onClick={() => setStep('setup')} className="text-sm text-purple-600 hover:underline flex items-center gap-1">
                  <ChevronLeft className="w-4 h-4" /> Retour
                </button>
                <div>
                  <Badge className="bg-purple-100 text-purple-700 border-purple-200 mr-2">{selectedDomain}</Badge>
                  <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">{selectedFormation}</Badge>
                </div>
              </div>

              {loadingCourses ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>
              ) : courses.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                  <BookOpen className="w-14 h-14 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Aucun cours publié pour cette sélection.</p>
                </div>
              ) : (
                <>
                  <h2 className="text-lg font-bold text-gray-900">Choisissez un cours</h2>
                  <div className="space-y-3">
                    {courses.map(course => {
                      const isSelected = selectedCourse?.id === course.id;
                      return (
                        <button
                          key={course.id}
                          onClick={() => setSelectedCourse(course)}
                          className={`w-full text-left p-4 rounded-2xl border transition-all ${
                            isSelected ? 'border-purple-500 bg-purple-50 shadow' : 'border-gray-200 bg-white hover:border-purple-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-gray-900">{course.title}</p>
                              <p className="text-sm text-gray-500 mt-0.5">{course.teacher_name}</p>
                            </div>
                            {isSelected && <CheckCircle className="w-5 h-5 text-purple-600" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {selectedCourse && (
                    <div className="mt-4">
                      {loadingEvals ? (
                        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-purple-600" /></div>
                      ) : evaluations.length === 0 ? (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
                          <p className="text-amber-700 text-sm font-medium">Aucune évaluation programmée pour ce cours.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <h3 className="text-base font-bold text-gray-800">Évaluations disponibles</h3>
                          {evaluations.map(ev => (
                            <div key={ev.id} className="bg-white rounded-2xl border border-gray-200 p-4">
                              <div className="flex items-center justify-between mb-2">
                                <p className="font-semibold text-gray-900 text-sm">{ev.title || 'Évaluation'}</p>
                                <Badge className="bg-gray-100 text-gray-600 border-gray-200">
                                  {ev.questions?.length || 0} question{ev.questions?.length > 1 ? 's' : ''}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap gap-2 mb-3">
                                {ev.questions?.map((q, i) => (
                                  <span key={i} className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                    q.question_type === 'qcm' ? 'bg-blue-100 text-blue-700' :
                                    q.question_type === 'vrai_faux' ? 'bg-green-100 text-green-700' :
                                    'bg-orange-100 text-orange-700'
                                  }`}>
                                    {q.question_type === 'qcm' ? 'QCM' : q.question_type === 'vrai_faux' ? 'V/F' : 'Rédaction'}
                                  </span>
                                ))}
                              </div>
                              <Button
                                onClick={() => handleStartEval(ev)}
                                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl h-10"
                              >
                                <Play className="w-4 h-4 mr-2" /> Démarrer la simulation
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* STEP 3: Running */}
          {step === 'running' && currentQ && (
            <div className="space-y-4">
              {/* Progress */}
              <div className="bg-white rounded-2xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Question {currentQuestion + 1} / {totalQuestions}</span>
                  <span className="text-sm text-gray-500">{selectedCourse?.title}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-start gap-3 mb-5">
                  <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold text-sm flex items-center justify-center flex-shrink-0">
                    {currentQuestion + 1}
                  </span>
                  <p className="text-gray-900 font-medium text-base leading-relaxed">{currentQ.question}</p>
                </div>

                {/* QCM */}
                {currentQ.question_type === 'qcm' && currentQ.options?.length > 0 && (
                  <div className="space-y-2">
                    {currentQ.options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleAnswer(opt)}
                        className={`w-full text-left px-4 py-3 rounded-xl border transition-all text-sm font-medium ${
                          answers[currentQuestion] === opt
                            ? 'bg-purple-600 text-white border-purple-600 shadow'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                {/* Vrai / Faux */}
                {currentQ.question_type === 'vrai_faux' && (
                  <div className="grid grid-cols-2 gap-3">
                    {['Vrai', 'Faux'].map(opt => (
                      <button
                        key={opt}
                        onClick={() => handleAnswer(opt)}
                        className={`py-4 rounded-xl border-2 font-bold text-base transition-all ${
                          answers[currentQuestion] === opt
                            ? opt === 'Vrai' ? 'bg-green-500 text-white border-green-500 shadow' : 'bg-red-500 text-white border-red-500 shadow'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                {/* Rédaction */}
                {currentQ.question_type === 'redaction' && (
                  <div>
                    <textarea
                      value={textAnswers[currentQuestion] || ''}
                      onChange={(e) => handleTextAnswer(e.target.value)}
                      placeholder="Écrivez votre réponse ici..."
                      className="w-full min-h-32 px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                    <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
                      <p className="text-xs font-semibold text-amber-700 mb-1">💡 Réponse attendue (mode admin) :</p>
                      <p className="text-xs text-amber-800">{currentQ.correct_answer}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex gap-3">
                {currentQuestion > 0 && (
                  <Button variant="outline" onClick={handlePrev} className="rounded-xl flex-1 h-12">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Précédent
                  </Button>
                )}
                <Button
                  onClick={handleNext}
                  disabled={
                    (currentQ.question_type !== 'redaction' && !answers[currentQuestion]) &&
                    (currentQ.question_type === 'redaction' && !textAnswers[currentQuestion])
                  }
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl h-12 font-semibold"
                >
                  {currentQuestion === totalQuestions - 1 ? 'Terminer' : 'Suivant'} <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: Result */}
          {step === 'result' && selectedEvaluation && (() => {
            const { score, total, correct, hasRedaction } = calculateScore();
            return (
              <div className="space-y-4">
                <div className={`rounded-2xl p-6 text-center shadow-lg ${
                  score >= 10 ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-red-500 to-rose-600'
                }`}>
                  <div className="text-6xl font-bold text-white mb-2">{score}/20</div>
                  <p className="text-white/90 text-lg font-semibold">
                    {score >= 16 ? '🏆 Excellent !' : score >= 12 ? '👍 Bien !' : score >= 10 ? '✅ Passable' : '❌ À retravailler'}
                  </p>
                  {total > 0 && (
                    <p className="text-white/75 text-sm mt-1">{correct}/{total} réponses correctes (QCM/V-F)</p>
                  )}
                  {hasRedaction && (
                    <p className="text-white/75 text-sm mt-1">* Les questions de rédaction sont notées par l'admin</p>
                  )}
                </div>

                {/* Detail per question */}
                <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
                  <h3 className="font-bold text-gray-900 mb-3">Détail des réponses</h3>
                  {selectedEvaluation.questions.map((q, idx) => {
                    const isRedaction = q.question_type === 'redaction';
                    const userAnswer = isRedaction ? textAnswers[idx] : answers[idx];
                    const isCorrect = !isRedaction && userAnswer === q.correct_answer;
                    return (
                      <div key={idx} className={`rounded-xl p-3 border ${
                        isRedaction ? 'border-orange-200 bg-orange-50' :
                        isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                      }`}>
                        <div className="flex items-start gap-2">
                          {isRedaction ? (
                            <span className="text-orange-500 text-lg flex-shrink-0">✏️</span>
                          ) : isCorrect ? (
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-gray-700 mb-1">{q.question}</p>
                            {userAnswer && <p className="text-xs text-gray-600">Votre réponse : <span className="font-medium">{userAnswer}</span></p>}
                            {!isRedaction && !isCorrect && (
                              <p className="text-xs text-green-700 mt-0.5">Bonne réponse : <span className="font-medium">{q.correct_answer}</span></p>
                            )}
                            {isRedaction && (
                              <p className="text-xs text-orange-700 mt-0.5">Corrigé : {q.correct_answer}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => { setStep('course_select'); setSelectedEvaluation(null); }}
                    className="rounded-xl h-11"
                  >
                    Autre évaluation
                  </Button>
                  <Button
                    onClick={reset}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl h-11"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" /> Recommencer
                  </Button>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </AdminGuard>
  );
}