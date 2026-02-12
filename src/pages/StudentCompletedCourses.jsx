import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Play, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import StudentBottomNav from '../components/student/StudentBottomNav';

export default function StudentCompletedCourses() {
  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
      const studentData = await base44.entities.Student.filter({ user_email: userData.email });
      if (studentData.length > 0) setStudent(studentData[0]);
    };
    loadUser();
  }, []);

  const { data: history = [] } = useQuery({
    queryKey: ['formationHistory', user?.email],
    queryFn: () => base44.entities.StudentFormationHistory.filter({ student_email: user?.email, status: 'terminée' }),
    enabled: !!user,
  });

  const { data: allCourses = [] } = useQuery({
    queryKey: ['allCourses'],
    queryFn: () => base44.entities.Course.list('order', 500),
  });

  const { data: progress = [] } = useQuery({
    queryKey: ['courseProgress', user?.email],
    queryFn: () => base44.entities.StudentCourseProgress.filter({ student_email: user?.email }),
    enabled: !!user,
  });

  if (!user || !student) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const completedFormations = history.filter(h => h.status === 'terminée');
  
  const getCoursesForFormation = (domain, formationType) => {
    return allCourses.filter(c => c.domain === domain && c.formation_type === formationType);
  };

  const getCourseProgress = (courseId) => {
    return progress.find(p => p.course_id === courseId);
  };

  const handlePlayCourse = (course) => {
    setSelectedCourse(course);
    setIsPlaying(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24">
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-4 pt-12 pb-6 sticky top-0 z-40 shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-2">Formations Terminées</h1>
        <p className="text-white/80 text-sm">Réécoutez les cours de vos formations complétées</p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {completedFormations.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-gray-500">Aucune formation terminée pour le moment</p>
          </div>
        ) : (
          <div className="space-y-8">
            {completedFormations.map(formation => {
              const courses = getCoursesForFormation(formation.domain, formation.formation_type);
              return (
                <Card key={formation.id} className="rounded-2xl border-0 shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-white" />
                      <div>
                        <h2 className="text-xl font-bold text-white">{formation.domain}</h2>
                        <p className="text-white/90 text-sm">{formation.formation_type}</p>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    {courses.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">Aucun cours disponible</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {courses.map(course => {
                          const courseProgress = getCourseProgress(course.id);
                          return (
                            <div key={course.id} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all">
                              <div className="flex gap-3">
                                {course.cover_image && (
                                  <img src={course.cover_image} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">{course.title}</h3>
                                  <p className="text-xs text-gray-500 mb-2">{course.teacher_name}</p>
                                  {courseProgress && (
                                    <Badge className="bg-green-100 text-green-700 text-xs mb-2">
                                      Note: {courseProgress.score}/20
                                    </Badge>
                                  )}
                                  <Button
                                    onClick={() => handlePlayCourse(course)}
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700 rounded-lg"
                                  >
                                    <Play className="w-3 h-3 mr-1" />
                                    Écouter
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={isPlaying} onOpenChange={setIsPlaying}>
        <DialogContent className="max-w-3xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>{selectedCourse?.title}</DialogTitle>
          </DialogHeader>
          {selectedCourse && (
            <div className="space-y-4">
              {selectedCourse.cover_image && (
                <img src={selectedCourse.cover_image} alt="" className="w-full h-48 object-cover rounded-xl" />
              )}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">Enseignant</p>
                <p className="font-medium text-gray-900">{selectedCourse.teacher_name}</p>
              </div>
              {selectedCourse.audio_url && (
                <audio controls className="w-full">
                  <source src={selectedCourse.audio_url} type="audio/mpeg" />
                  Votre navigateur ne supporte pas l'élément audio.
                </audio>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <StudentBottomNav />
    </div>
  );
}