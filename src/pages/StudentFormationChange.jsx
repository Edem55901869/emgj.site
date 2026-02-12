import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Send, Loader2, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DOMAINS, FORMATION_BY_DOMAIN } from '@/components/domainFormationMapping';
import StudentBottomNav from '../components/student/StudentBottomNav';
import { toast } from 'sonner';

export default function StudentFormationChange() {
  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [newDomain, setNewDomain] = useState('');
  const [newFormation, setNewFormation] = useState('');
  const [motivation, setMotivation] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
      const studentData = await base44.entities.Student.filter({ user_email: userData.email });
      if (studentData.length > 0) setStudent(studentData[0]);
    };
    loadUser();
  }, []);

  const { data: requests = [] } = useQuery({
    queryKey: ['formationChangeRequests', user?.email],
    queryFn: () => base44.entities.FormationChangeRequest.filter({ student_email: user?.email }, '-created_date'),
    enabled: !!user,
  });

  const createRequestMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.FormationChangeRequest.create(data);
      await base44.entities.Notification.create({
        user_email: 'admin',
        title: 'Nouvelle demande de changement de formation',
        message: `${data.student_name} souhaite changer de ${data.current_domain} (${data.current_formation}) vers ${data.new_domain} (${data.new_formation})`,
        type: 'formation_change',
        is_read: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formationChangeRequests'] });
      toast.success('Demande envoyée avec succès');
      setNewDomain('');
      setNewFormation('');
      setMotivation('');
    },
  });

  const handleSubmit = () => {
    if (!newDomain || !newFormation || !motivation) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    createRequestMutation.mutate({
      student_email: user.email,
      student_name: `${student.first_name} ${student.last_name}`,
      current_domain: student.domain,
      current_formation: student.formation_type,
      new_domain: newDomain,
      new_formation: newFormation,
      motivation,
      status: 'en_attente',
    });
  };

  if (!user || !student) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const availableFormations = FORMATION_BY_DOMAIN[newDomain] || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24">
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-4 pt-12 pb-6 sticky top-0 z-40 shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-2">Changement de Formation</h1>
        <p className="text-white/80 text-sm">Demandez à changer de domaine ou de formation</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <Card className="rounded-2xl border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Formation actuelle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-1">Domaine</p>
              <p className="font-bold text-gray-900 mb-3">{student.domain}</p>
              <p className="text-sm text-gray-600 mb-1">Type de formation</p>
              <p className="font-bold text-gray-900">{student.formation_type}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Nouvelle formation souhaitée</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Nouveau domaine *</label>
              <Select value={newDomain} onValueChange={setNewDomain}>
                <SelectTrigger className="rounded-xl h-11">
                  <SelectValue placeholder="Choisir un domaine" />
                </SelectTrigger>
                <SelectContent>
                  {DOMAINS.map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {newDomain && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Nouveau type de formation *</label>
                <Select value={newFormation} onValueChange={setNewFormation}>
                  <SelectTrigger className="rounded-xl h-11">
                    <SelectValue placeholder="Choisir une formation" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableFormations.map(f => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Motivation *</label>
              <Textarea
                value={motivation}
                onChange={(e) => setMotivation(e.target.value)}
                placeholder="Expliquez pourquoi vous souhaitez changer de formation..."
                className="rounded-xl min-h-32"
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!newDomain || !newFormation || !motivation || createRequestMutation.isPending}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl h-12"
            >
              {createRequestMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Envoyer la demande
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {requests.length > 0 && (
          <Card className="rounded-2xl border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Mes demandes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {requests.map(req => (
                <div key={req.id} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">De: {req.current_domain} ({req.current_formation})</p>
                      <p className="text-sm text-gray-600">Vers: {req.new_domain} ({req.new_formation})</p>
                    </div>
                    <Badge className={
                      req.status === 'approuvé' ? 'bg-green-100 text-green-700' :
                      req.status === 'rejeté' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }>
                      {req.status === 'en_attente' && <><Clock className="w-3 h-3 mr-1" /> En attente</>}
                      {req.status === 'approuvé' && <><CheckCircle className="w-3 h-3 mr-1" /> Approuvé</>}
                      {req.status === 'rejeté' && <><XCircle className="w-3 h-3 mr-1" /> Rejeté</>}
                    </Badge>
                  </div>
                  {req.admin_notes && (
                    <div className="bg-white rounded-lg p-3 text-sm text-gray-600">
                      <p className="font-medium mb-1">Note de l'administrateur:</p>
                      <p>{req.admin_notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      <StudentBottomNav />
    </div>
  );
}