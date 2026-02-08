import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Search, Headphones, User, Loader2, Play } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StudentBottomNav from '../components/student/StudentBottomNav';

export default function StudentCourses() {
  const [student, setStudent] = useState(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const user = await base44.auth.me();
      const students = await base44.entities.Student.filter({ user_email: user.email });
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

  const filteredCourses = courses
    .filter(c => !search || c.title?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortBy === 'recent' ? new Date(b.created_date) - new Date(a.created_date) : a.title?.localeCompare(b.title));

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
              <SelectItem value="recent">Récent</SelectItem>
              <SelectItem value="title">A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-white/20 text-white border-white/30">{student?.domain}</Badge>
          <Badge className="bg-white/20 text-white border-white/30">{student?.formation_type}</Badge>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {filteredCourses.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Headphones className="w-10 h-10 text-gray-300" />
            </div>
            <p className="text-gray-500">Aucun cours disponible</p>
          </div>
        ) : (
          filteredCourses.map(course => (
            <div key={course.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all">
              {course.cover_image && (
                <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-500 relative overflow-hidden">
                  <img src={course.cover_image} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-start gap-4 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                    <Headphones className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg mb-1">{course.title}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                      <User className="w-3 h-3" />
                      {course.teacher_name}
                    </p>
                    {course.description && <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>}
                  </div>
                </div>
                {(course.audio_file || course.audio_url) && (
                  <div className="mt-4">
                    <audio 
                      src={course.audio_file || course.audio_url} 
                      controls 
                      className="w-full rounded-xl"
                      style={{ height: '50px' }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <StudentBottomNav />
    </div>
  );
}