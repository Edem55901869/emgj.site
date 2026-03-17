import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Award, FileText, Loader2, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
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
  const [viewingBulletin, setViewingBulletin] = useState(null);

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

  const isPreview = user?.email === 'admin@preview.emgj';

  const { data: bulletins = [] } = useQuery({
    queryKey: ['studentBulletins'],
    queryFn: () => base44.entities.Bulletin.filter({ student_email: user?.email }),
    enabled: !!user && !isPreview,
  });

  const { data: progress = [] } = useQuery({
    queryKey: ['courseProgress'],
    queryFn: () => base44.entities.StudentCourseProgress.filter({ student_email: user?.email }),
    enabled: !!user && !isPreview,
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
      const courseScores = progress
        .filter(p => p.passed)
        .map(p => {
          const course = courses.find(c => c.id === p.course_id);
          return { course: course?.title || 'Cours', score: p.score };
        });

      const average = (courseScores.reduce((acc, cs) => acc + cs.score, 0) / courseScores.length).toFixed(2);

      const bulletinHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 15px 15px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">BULLETIN ACADÉMIQUE</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">École Missionnaire Génération Joël</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 2px solid #e5e7eb; border-top: none; border-radius: 0 0 15px 15px;">
            <div style="margin-bottom: 25px;">
              <h2 style="color: #374151; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Informations de l'étudiant</h2>
              <table style="width: 100%; margin-top: 15px;">
                <tr><td style="padding: 8px 0; color: #6b7280;"><strong>Nom:</strong></td><td style="padding: 8px 0;">${student.first_name} ${student.last_name}</td></tr>
                <tr><td style="padding: 8px 0; color: #6b7280;"><strong>Formation:</strong></td><td style="padding: 8px 0;">${student.formation_type}</td></tr>
                <tr><td style="padding: 8px 0; color: #6b7280;"><strong>Domaine:</strong></td><td style="padding: 8px 0;">${student.domain}</td></tr>
                <tr><td style="padding: 8px 0; color: #6b7280;"><strong>Période:</strong></td><td style="padding: 8px 0;">${format(new Date(), 'MMMM yyyy', { locale: fr })}</td></tr>
              </table>
            </div>

            <div style="margin-bottom: 25px;">
              <h2 style="color: #374151; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Résultats par cours</h2>
              <table style="width: 100%; margin-top: 15px; border-collapse: collapse;">
                <thead>
                  <tr style="background: #f3f4f6;">
                    <th style="padding: 12px; text-align: left; border: 1px solid #e5e7eb;">Cours</th>
                    <th style="padding: 12px; text-align: center; border: 1px solid #e5e7eb;">Note /20</th>
                    <th style="padding: 12px; text-align: center; border: 1px solid #e5e7eb;">Résultat</th>
                  </tr>
                </thead>
                <tbody>
                  ${courseScores.map(cs => `
                    <tr>
                      <td style="padding: 12px; border: 1px solid #e5e7eb;">${cs.course}</td>
                      <td style="padding: 12px; text-align: center; border: 1px solid #e5e7eb; font-weight: bold; color: ${cs.score >= 12 ? '#10b981' : '#ef4444'};">${cs.score}</td>
                      <td style="padding: 12px; text-align: center; border: 1px solid #e5e7eb;">
                        <span style="background: ${cs.score >= 12 ? '#d1fae5' : '#fee2e2'}; color: ${cs.score >= 12 ? '#065f46' : '#991b1b'}; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                          ${cs.score >= 12 ? 'VALIDÉ' : 'ÉCHOUÉ'}
                        </span>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 20px; border-radius: 10px; text-align: center;">
              <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 600;">MOYENNE GÉNÉRALE</p>
              <p style="margin: 10px 0 0 0; font-size: 36px; font-weight: bold; color: #92400e;">${average} / 20</p>
              ${parseFloat(average) >= 12 ? 
                '<p style="margin: 10px 0 0 0; color: #065f46; font-weight: 600;">🎉 FORMATION VALIDÉE</p>' : 
                '<p style="margin: 10px 0 0 0; color: #991b1b; font-weight: 600;">Formation non validée</p>'
              }
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
              <p style="margin: 0;">Document généré le ${format(new Date(), "d MMMM yyyy 'à' HH:mm", { locale: fr })}</p>
              <p style="margin: 5px 0 0 0;">© École Missionnaire Génération Joël</p>
            </div>
          </div>
        </div>
      `;

      // Générer le PDF via l'API InvokeLLM avec HTML
      const { file_url: pdfUrl } = await base44.integrations.Core.UploadFile({ 
        file: new Blob([bulletinHTML], { type: 'text/html' }) 
      });

      await base44.entities.Bulletin.create({
        student_email: user.email,
        student_name: `${student.first_name} ${student.last_name}`,
        domain: student.domain,
        formation_type: student.formation_type,
        document_type: 'bulletin',
        pdf_url: pdfUrl,
        period: format(new Date(), 'MMMM yyyy', { locale: fr })
      });

      await base44.entities.Notification.create({
        recipient_email: user.email,
        type: 'success',
        title: '🎉 Félicitations !',
        message: `Vous avez validé tous vos cours avec une moyenne de ${average}/20. Votre diplôme vous sera envoyé prochainement par l'administration.`
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
          <Button onClick={() => viewingBulletin ? setViewingBulletin(null) : navigate(createPageUrl('StudentMore'))} variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">Bulletins & Diplômes</h1>
            <p className="text-indigo-100 text-sm">Résultats académiques</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-2">
        {viewingBulletin ? (
          <Card className="p-6 bg-white">
            {viewingBulletin.pdf_url?.startsWith('http') ? (
              <iframe 
                src={viewingBulletin.pdf_url} 
                className="w-full h-[600px] border-0 rounded-xl"
                title="Bulletin"
              />
            ) : (
              <div dangerouslySetInnerHTML={{ __html: viewingBulletin.pdf_url }} />
            )}
          </Card>
        ) : (
          <>
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
                  <div 
                    key={bulletin.id} 
                    onClick={() => setViewingBulletin(bulletin)}
                    className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg transition-all cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-bold text-gray-900">Bulletin académique</h3>
                            <p className="text-sm text-gray-500">{bulletin.period}</p>
                          </div>
                          <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200">
                            {bulletin.formation_type}
                          </Badge>
                        </div>
                        <Button variant="outline" size="sm" className="rounded-xl mt-2">
                          Voir le bulletin
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <StudentBottomNav />
    </div>
  );
}