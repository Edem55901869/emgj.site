import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Search, SlidersHorizontal, FileText, User, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900 mb-3">Mes Cours</h1>
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un cours..." className="pl-10 h-10 rounded-xl bg-gray-50" />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32 h-10 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Récent</SelectItem>
                <SelectItem value="title">A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-blue-50 text-blue-700 border-blue-100">{student?.domain}</Badge>
            <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100">{student?.formation_type}</Badge>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
        {filteredCourses.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucun cours disponible pour le moment</p>
          </div>
        ) : (
          filteredCourses.map(course => (
            <div key={course.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1">{course.title}</h3>
                  {course.description && <p className="text-gray-500 text-sm mb-2 line-clamp-2">{course.description}</p>}
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><User className="w-3 h-3" />{course.teacher_name}</span>
                  </div>
                </div>
                {course.pdf_url && (
                  <a href={course.pdf_url} target="_blank" rel="noreferrer">
                    <Button variant="outline" size="sm" className="rounded-xl text-blue-600 border-blue-200 hover:bg-blue-50">
                      <FileText className="w-4 h-4 mr-1" /> PDF
                    </Button>
                  </a>
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