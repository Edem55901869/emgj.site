import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Play, ChevronRight, ChevronLeft, CheckCircle, XCircle, RotateCcw, BookOpen, Loader2, FlaskConical } from 'lucide-react';
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

// Détecte intelligemment le type de question selon son contenu
function detectQuestionType(q) {
  if (!q) return 'redaction';
  
  const correct = (q.correct_answer || '').trim().toLowerCase();
  const question = (q.question || '').toLowerCase();

  // QCM avec options a) b) c) dans la question
  if (question.includes(' a)') || question.includes('\n a)')) return 'qcm_abc';
  
  // Vrai / Faux
  if (correct === 'vrai' || correct === 'faux') return 'vrai_faux';
  
  // Réponse courte A, B, C
  if (correct === 'a' || correct === 'b' || correct === 'c') return 'qcm_abc';

  // Par défaut : rédaction
  return 'redaction';
}

// Extrait les options a) b) c) depuis le texte de la question
function extractOptions(questionText) {
  const parts = questionText.split(/\s+[abc]\)/i);
  if (parts.length < 2) return [];
  const optionMatches = questionText.match(/[abc]\)[^abc)]+/gi);
  if (!optionMatches) return [];
  return optionMatches.map(o => o.replace(/^[abc]\)\s*/i, '').trim());
}

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
  const currentType = detectQuestionType(currentQ);

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

  const isCurrentAnswered = () => {
    if (!currentQ) return false;
    if (currentType === 'redaction') return true; // rédaction toujours permis de passer
    return !!answers[currentQuestion];
  };

  const calculateScore = () => {
    if (!selectedEvaluation) return { score: 0, total: 0, correct: 0, hasRedaction: false };
    let correct = 0;
    let objectiveCount = 0;
    let hasRedaction = false;

    selectedEvaluation.questions.forEach((q, idx) => {
      const type = detectQuestionType(q);
      if (type === 'redaction') {
        hasRedaction = true;
      } else {
        objectiveCount++;
        const userAns = (answers[idx] || '').trim().toLowerCase();
        const correctAns = (q.correct_answer || '').trim().toLowerCase();
        if (userAns === correctAns) correct++;
      }
    });

    const score = objectiveCount > 0 ? Math.round((correct / objectiveCount) * 20) : null;
    return { score, total: objectiveCount, correct, hasRedaction };
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
              <FlaskConical className="w-6 h-6 text-white" />
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
                  <p className="text-gray-500">Aucun cours disponible pour cette sélection.</p>
                </div>
              ) : (
                <>
                  <h2 className="text-lg font-bold text-gray-900">Choisissez un cours ({courses.length})</h2>
                  <div className="space-y-2">
                    {courses.map(course => {
                      const isSelected = selectedCourse?.id === course.id;
                      return (
                        <button
                          key={course.id}
                          onClick={() => setSelectedCourse(isSelected ? null : course)}
                          className={`w-full text-left p-4 rounded-2xl border transition-all ${
                            isSelected ? 'border-purple-500 bg-purple-50 shadow' : 'border-gray-200 bg-white hover:border-purple-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">{course.title}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{course.teacher_name}</p>
                            </div>
                            {isSelected && <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {selectedCourse && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      {loadingEvals ? (
                        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-purple-600" /></div>
                      ) : evaluations.length === 0 ? (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
                          <p className="text-amber-700 text-sm font-medium">⚠️ Aucune évaluation programmée pour ce cours.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <h3 className="text-base font-bold text-gray-800">
                            Évaluation disponible pour « {selectedCourse.title} »
                          </h3>
                          {evaluations.map(ev => {
                            const qCount = ev.questions?.length || 0;
                            const redactionCount = ev.questions?.filter(q => detectQuestionType(q) === 'redaction').length || 0;
                            const objectiveCount = qCount - redactionCount;
                            return (
                              <div key={ev.id} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                  <p className="font-semibold text-gray-900 text-sm">{qCount} question{qCount > 1 ? 's' : ''}</p>
                                  <div className="flex gap-1">
                                    {objectiveCount > 0 && <Badge className="bg-blue-100 text-blue-700 text-xs">{objectiveCount} obj.</Badge>}
                                    {redactionCount > 0 && <Badge className="bg-orange-100 text-orange-700 text-xs">{redactionCount} rédac.</Badge>}
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {ev.questions?.map((q, i) => {
                                    const t = detectQuestionType(q);
                                    return (
                                      <span key={i} className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                        t === 'qcm_abc' ? 'bg-blue-100 text-blue-700' :
                                        t === 'vrai_faux' ? 'bg-green-100 text-green-700' :
                                        'bg-orange-100 text-orange-700'
                                      }`}>
                                        {t === 'qcm_abc' ? 'QCM' : t === 'vrai_faux' ? 'V/F' : 'Rédac'}
                                      </span>
                                    );
                                  })}
                                </div>
                                <Button
                                  onClick={() => handleStartEval(ev)}
                                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl h-10"
                                >
                                  <Play className="w-4 h-4 mr-2" /> Démarrer la simulation
                                </Button>
                              </div>
                            );
                          })}
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
                  <span className="text-xs text-gray-400 truncate max-w-[160px]">{selectedCourse?.title}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question Card */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                {/* Badge type */}
                <div className="mb-4 flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    currentType === 'qcm_abc' ? 'bg-blue-100 text-blue-700' :
                    currentType === 'vrai_faux' ? 'bg-green-100 text-green-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {currentType === 'qcm_abc' ? 'QCM' : currentType === 'vrai_faux' ? 'Vrai / Faux' : 'Rédaction libre'}
                  </span>
                  <span className="text-xs text-gray-400">{currentQuestion + 1} sur {totalQuestions}</span>
                </div>

                <div className="flex items-start gap-3 mb-5">
                  <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold text-sm flex items-center justify-center flex-shrink-0">
                    {currentQuestion + 1}
                  </span>
                  <p className="text-gray-900 font-medium text-base leading-relaxed whitespace-pre-line">{currentQ.question}</p>
                </div>

                {/* QCM a) b) c) */}
                {currentType === 'qcm_abc' && (() => {
                  const options = extractOptions(currentQ.question);
                  if (options.length === 0) {
                    // Afficher A B C comme boutons simples
                    return (
                      <div className="space-y-2">
                        {['A', 'B', 'C'].map(opt => (
                          <button
                            key={opt}
                            onClick={() => handleAnswer(opt)}
                            className={`w-full text-left px-4 py-3 rounded-xl border transition-all text-sm font-medium ${
                              answers[currentQuestion] === opt
                                ? 'bg-purple-600 text-white border-purple-600 shadow'
                                : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                            }`}
                          >
                            Réponse {opt}
                          </button>
                        ))}
                      </div>
                    );
                  }
                  return (
                    <div className="space-y-2">
                      {options.map((opt, i) => {
                        const letter = String.fromCharCode(65 + i); // A, B, C
                        const isSelected = answers[currentQuestion] === letter;
                        return (
                          <button
                            key={i}
                            onClick={() => handleAnswer(letter)}
                            className={`w-full text-left px-4 py-3 rounded-xl border transition-all text-sm font-medium flex items-start gap-3 ${
                              isSelected
                                ? 'bg-purple-600 text-white border-purple-600 shadow'
                                : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                            }`}
                          >
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                              isSelected ? 'bg-white/20' : 'bg-gray-200 text-gray-600'
                            }`}>{letter}</span>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  );
                })()}

                {/* Vrai / Faux */}
                {currentType === 'vrai_faux' && (
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
                        {opt === 'Vrai' ? '✅ Vrai' : '❌ Faux'}
                      </button>
                    ))}
                  </div>
                )}

                {/* Rédaction */}
                {currentType === 'redaction' && (
                  <div>
                    <textarea
                      value={textAnswers[currentQuestion] || ''}
                      onChange={(e) => handleTextAnswer(e.target.value)}
                      placeholder="Écrivez votre réponse ici... (facultatif en mode simulation)"
                      className="w-full min-h-32 px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                    <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
                      <p className="text-xs font-semibold text-amber-700 mb-1">💡 Corrigé attendu (mode admin) :</p>
                      <p className="text-xs text-amber-800 whitespace-pre-line">{currentQ.correct_answer}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex gap-3">
                {currentQuestion > 0 && (
                  <Button variant="outline" onClick={handlePrev} className="rounded-xl h-12 px-5">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Précédent
                  </Button>
                )}
                <Button
                  onClick={handleNext}
                  disabled={!isCurrentAnswered()}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl h-12 font-semibold"
                >
                  {currentQuestion === totalQuestions - 1 ? '✅ Terminer' : 'Suivant'} {currentQuestion < totalQuestions - 1 && <ChevronRight className="w-4 h-4 ml-1" />}
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: Result */}
          {step === 'result' && selectedEvaluation && (() => {
            const { score, total, correct, hasRedaction } = calculateScore();
            return (
              <div className="space-y-4">
                {/* Score */}
                <div className={`rounded-2xl p-6 text-center shadow-lg ${
                  score === null ? 'bg-gradient-to-br from-orange-500 to-amber-600' :
                  score >= 10 ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-red-500 to-rose-600'
                }`}>
                  {score !== null ? (
                    <>
                      <div className="text-6xl font-bold text-white mb-2">{score}/20</div>
                      <p className="text-white/90 text-lg font-semibold">
                        {score >= 16 ? '🏆 Excellent !' : score >= 12 ? '👍 Bien !' : score >= 10 ? '✅ Passable' : '❌ À retravailler'}
                      </p>
                      {total > 0 && (
                        <p className="text-white/75 text-sm mt-1">{correct}/{total} bonne{correct > 1 ? 's' : ''} réponse{correct > 1 ? 's' : ''} (questions objectives)</p>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="text-5xl mb-2">✏️</div>
                      <p className="text-white text-lg font-bold">Évaluation par rédaction</p>
                    </>
                  )}
                  {hasRedaction && score !== null && (
                    <p className="text-white/70 text-xs mt-2">* Les rédactions sont notées séparément par l'admin</p>
                  )}
                  {hasRedaction && score === null && (
                    <p className="text-white/80 text-sm mt-2">La correction sera faite par l'administrateur</p>
                  )}
                </div>

                {/* Détail par question */}
                <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
                  <h3 className="font-bold text-gray-900 mb-3">Détail des réponses</h3>
                  {selectedEvaluation.questions.map((q, idx) => {
                    const type = detectQuestionType(q);
                    const isRedaction = type === 'redaction';
                    const userAnswer = isRedaction ? (textAnswers[idx] || '—') : (answers[idx] || '—');
                    const isCorrect = !isRedaction && (answers[idx] || '').trim().toLowerCase() === (q.correct_answer || '').trim().toLowerCase();
                    return (
                      <div key={idx} className={`rounded-xl p-3 border ${
                        isRedaction ? 'border-orange-200 bg-orange-50' :
                        isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                      }`}>
                        <div className="flex items-start gap-2">
                          {isRedaction ? (
                            <span className="text-orange-500 text-lg flex-shrink-0 leading-none">✏️</span>
                          ) : isCorrect ? (
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-700 mb-1 line-clamp-3">{q.question}</p>
                            <p className="text-xs text-gray-600">Votre réponse : <span className="font-medium">{userAnswer}</span></p>
                            {!isRedaction && !isCorrect && (
                              <p className="text-xs text-green-700 mt-0.5">✅ Bonne réponse : <span className="font-medium">{q.correct_answer}</span></p>
                            )}
                            {isRedaction && (
                              <div className="mt-1 bg-amber-50 rounded-lg p-2 border border-amber-200">
                                <p className="text-xs text-amber-800 font-medium">Corrigé : <span className="font-normal">{q.correct_answer}</span></p>
                              </div>
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
                    onClick={() => { setStep('course_select'); setSelectedEvaluation(null); setAnswers({}); setTextAnswers({}); setCurrentQuestion(0); }}
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