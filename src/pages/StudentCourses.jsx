import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Search, Headphones, User, Loader2, Lock, CheckCircle, Award } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import StudentBottomNav from '../components/student/StudentBottomNav';
import CourseQCM from '../components/course/CourseQCM';

export default function StudentCourses() {
  const [student, setStudent] = useState(null);
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('order');
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showQCM, setShowQCM] = useState(false);

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
          status: 'certifié',
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

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses', student?.domain, student?.formation_type],
    queryFn: () => base44.entities.Course.filter({ domain: student.domain, formation_type: student.formation_type }),
    enabled: !!student,
  });

  const { data: progress = [] } = useQuery({
    queryKey: ['courseProgress'],
    queryFn: () => base44.entities.StudentCourseProgress.filter({ student_email: user?.email }),
    enabled: !!user,
    refetchInterval: 2000,
  });

  const { data: evaluations = [] } = useQuery({
    queryKey: ['evaluations'],
    queryFn: () => base44.entities.CourseEvaluation.list(),
  });

  const sortedCourses = courses
    .filter(c => !search || c.title?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'order') return (a.order || 999) - (b.order || 999);
      return sortBy === 'recent' ? new Date(b.created_date) - new Date(a.created_date) : a.title?.localeCompare(b.title);
    });

  const isCourseUnlocked = (course) => {
    if (!course.prerequisite_course_id) return true;
    return progress.some(p => p.course_id === course.prerequisite_course_id && p.passed);
  };

  const getCourseStatus = (course) => {
    const prog = progress.find(p => p.course_id === course.id);
    if (!prog) return null;
    return prog.passed ? 'validé' : 'échoué';
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24">
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-4 pt-12 pb-6 sticky top-0 z-40 shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-3">Mes Cours Audio</h1>
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher..." className="pl-10 h-10 rounded-xl bg-white/20 border-white/30 text-white placeholder:text-white/50" />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32 h-10 rounded-xl bg-white/20 border-white/30 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="order">Ordre</SelectItem>
              <SelectItem value="recent">Récent</SelectItem>
              <SelectItem value="title">A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-white/20 text-white border-white/30">{student?.domain}</Badge>
          <Badge className="bg-white/20 text-white border-white/30">{student?.formation_type}</Badge>
          <Badge className="bg-white/20 text-white border-white/30">
            {progress.filter(p => p.passed).length} / {courses.length} validés
          </Badge>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {sortedCourses.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Headphones className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-gray-500">Aucun cours disponible</p>
          </div>
        ) : (
          sortedCourses.map((course, index) => {
            const unlocked = isCourseUnlocked(course);
            const status = getCourseStatus(course);
            const evaluation = evaluations.find(e => e.course_id === course.id);

            return (
              <div key={course.id} className={`bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-xl transition-all ${!unlocked ? 'opacity-60' : ''}`}>
                {course.cover_image && (
                  <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-500 relative overflow-hidden">
                    <img src={course.cover_image} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    {!unlocked && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                        <div className="text-center text-white">
                          <Lock className="w-12 h-12 mx-auto mb-2" />
                          <p className="text-sm">Cours verrouillé</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-start gap-4 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                      {status === 'validé' ? <CheckCircle className="w-6 h-6 text-white" /> : <Headphones className="w-6 h-6 text-white" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-bold text-gray-900 text-lg">{course.title}</h3>
                        {course.order && <Badge className="bg-gray-100 text-gray-700">#{course.order}</Badge>}
                      </div>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                        <User className="w-3 h-3" />
                        {course.teacher_name}
                      </p>
                      {status && (
                        <Badge className={status === 'validé' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                          {status === 'validé' ? '✓ Validé' : '✗ Échoué'}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {course.description && <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>}
                  {unlocked && (course.audio_file || course.audio_url) && (
                    <div className="space-y-3">
                      <audio 
                        src={course.audio_file || course.audio_url} 
                        controls 
                        className="w-full rounded-xl"
                        style={{ height: '50px' }}
                      />
                      {evaluation && !status && (
                        <button onClick={() => { setSelectedCourse(course); setShowQCM(true); }} className="w-full py-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold hover:from-green-700 hover:to-emerald-700 transition-all">
                          <Award className="w-4 h-4 inline mr-2" />
                          Passer l'évaluation
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <Dialog open={showQCM} onOpenChange={setShowQCM}>
        <DialogContent className="max-w-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Évaluation - {selectedCourse?.title}</DialogTitle>
          </DialogHeader>
          {selectedCourse && (
            <CourseQCM
              course={selectedCourse}
              evaluation={evaluations.find(e => e.course_id === selectedCourse.id)}
              studentEmail={user?.email}
              onSuccess={() => setShowQCM(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <StudentBottomNav />
    </div>
  );
}