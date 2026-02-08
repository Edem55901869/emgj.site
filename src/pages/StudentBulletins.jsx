import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Award, FileText, Download, Loader2, CheckCircle, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import StudentBottomNav from '../components/student/StudentBottomNav';

export default function StudentBulletins() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const load = async () => {
      const u = await base44.auth.me();
      setUser(u);
      const students = await base44.entities.Student.filter({ user_email: u.email });
      if (students.length > 0) setStudent(students[0]);
      setLoading(false);
    };
    load();
  }, []);

  const { data: bulletins = [] } = useQuery({
    queryKey: ['studentBulletins'],
    queryFn: () => base44.entities.Bulletin.filter({ student_email: user?.email }),
    enabled: !!user,
  });

  const { data: progress = [] } = useQuery({
    queryKey: ['courseProgress'],
    queryFn: () => base44.entities.StudentCourseProgress.filter({ student_email: user?.email }),
    enabled: !!user,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['studentCourses'],
    queryFn: () => base44.entities.Course.filter({ 
      domain: student?.domain, 
      formation_type: student?.formation_type 
    }),
    enabled: !!student,
  });

  const allCoursesPassed = courses.length > 0 && courses.every(course => 
    progress.some(p => p.course_id === course.id && p.passed)
  );

  const generateBulletin = async () => {
    setGenerating(true);
    try {
      const courseScores = progress.map(p => {
        const course = courses.find(c => c.id === p.course_id);
        return {
          course: course?.title || 'Cours',
          score: p.score
        };
      });

      const average = courseScores.reduce((acc, cs) => acc + cs.score, 0) / courseScores.length;

      const prompt = `Génère un bulletin scolaire professionnel au format texte structuré pour :
Étudiant: ${student.first_name} ${student.last_name}
Formation: ${student.formation_type}
Domaine: ${student.domain}
Notes obtenues:
${courseScores.map(cs => `- ${cs.course}: ${cs.score}/20`).join('\n')}
Moyenne générale: ${average.toFixed(2)}/20

Format attendu en texte clair et structuré.`;

      const response = await base44.integrations.Core.InvokeLLM({ prompt });

      await base44.entities.Bulletin.create({
        student_email: user.email,
        student_name: `${student.first_name} ${student.last_name}`,
        domain: student.domain,
        formation_type: student.formation_type,
        document_type: 'bulletin',
        pdf_url: `data:text/plain;base64,${btoa(unescape(encodeURIComponent(response)))}`,
        period: format(new Date(), 'MMMM yyyy', { locale: fr })
      });

      await base44.entities.Notification.create({
        recipient_email: user.email,
        type: 'success',
        title: '🎉 Félicitations !',
        message: `Vous avez validé tous vos cours avec une moyenne de ${average.toFixed(2)}/20. Votre diplôme vous sera envoyé prochainement par l'administration.`
      });

      queryClient.invalidateQueries({ queryKey: ['studentBulletins'] });
      toast.success('Bulletin généré avec succès !');
    } catch (error) {
      toast.error('Erreur lors de la génération du bulletin');
    }
    setGenerating(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24">
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-4 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <Button onClick={() => navigate(createPageUrl('StudentMore'))} variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">Bulletins & Diplômes</h1>
            <p className="text-indigo-100 text-sm">Résultats académiques</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-2">
        {allCoursesPassed && bulletins.length === 0 && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 mb-4 border border-green-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-green-900 mb-2">Tous les cours validés !</h3>
                <p className="text-sm text-green-700 mb-4">
                  Félicitations ! Vous avez terminé tous vos cours avec succès. Générez votre bulletin maintenant.
                </p>
                <Button 
                  onClick={generateBulletin} 
                  disabled={generating}
                  className="bg-green-600 hover:bg-green-700 rounded-xl"
                >
                  {generating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Award className="w-4 h-4 mr-2" />}
                  {generating ? 'Génération...' : 'Générer mon bulletin'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {bulletins.length === 0 && !allCoursesPassed ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500">Terminez tous vos cours pour obtenir votre bulletin</p>
            <p className="text-sm text-gray-400 mt-2">{progress.filter(p => p.passed).length} / {courses.length} cours validés</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bulletins.map(bulletin => (
              <div key={bulletin.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900">{bulletin.document_type === 'bulletin' ? 'Bulletin' : 'Diplôme'}</h3>
                        <p className="text-sm text-gray-500">{bulletin.period}</p>
                      </div>
                      <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200">
                        {bulletin.formation_type}
                      </Badge>
                    </div>
                    {bulletin.pdf_url && (
                      <a href={bulletin.pdf_url} download>
                        <Button variant="outline" size="sm" className="rounded-xl mt-2">
                          <Download className="w-4 h-4 mr-1" /> Télécharger
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <StudentBottomNav />
    </div>
  );
}