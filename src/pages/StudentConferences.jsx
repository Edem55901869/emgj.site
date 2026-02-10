import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Radio, Loader2, Calendar, Users, Lock, Check, Search, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import StudentBottomNav from '../components/student/StudentBottomNav';
import ConferenceRoom from '../components/conference/ConferenceRoom';

export default function StudentConferences() {
  const [joinCode, setJoinCode] = useState('');
  const [selectedConf, setSelectedConf] = useState(null);
  const [joinOpen, setJoinOpen] = useState(false);
  const [inConference, setInConference] = useState(false);
  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const load = async () => {
      const u = await base44.auth.me();
      setUser(u);
      const students = await base44.entities.Student.filter({ user_email: u.email });
      if (students.length > 0) setStudent(students[0]);
    };
    load();
  }, []);

  const { data: conferences = [], isLoading } = useQuery({
    queryKey: ['studentConferences'],
    queryFn: () => base44.entities.Conference.list('-created_date', 50),
  });

  const joinMutation = useMutation({
    mutationFn: async (conf) => {
      if (conf.max_participants && conf.current_participants >= conf.max_participants) {
        throw new Error('Conférence complète');
      }
      await base44.entities.Conference.update(conf.id, {
        current_participants: (conf.current_participants || 0) + 1
      });
      return conf;
    },
    onSuccess: (conf) => {
      queryClient.invalidateQueries({ queryKey: ['studentConferences'] });
      toast.success('Vous avez rejoint la conférence !');
      setJoinOpen(false);
      setJoinCode('');
      setInConference(true);
    },
    onError: (error) => {
      toast.error(error.message || 'Erreur lors de la connexion');
    }
  });

  const handleJoin = (conf) => {
    setSelectedConf(conf);
    setJoinOpen(true);
  };

  const verifyAndJoin = () => {
    if (joinCode.toUpperCase() === selectedConf.access_code.toUpperCase()) {
      joinMutation.mutate(selectedConf);
    } else {
      toast.error('Code d\'accès incorrect');
    }
  };

  const statusConfig = {
    planifiée: { label: '🔵 Planifiée', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    en_cours: { label: '🟢 En direct', color: 'bg-green-50 text-green-700 border-green-200 animate-pulse' },
    terminée: { label: '⚫ Terminée', color: 'bg-gray-100 text-gray-600 border-gray-200' }
  };

  if (inConference && selectedConf) {
    return (
      <ConferenceRoom
        conference={selectedConf}
        userEmail={user?.email}
        userName={student ? `${student.first_name} ${student.last_name}` : user?.full_name || 'Étudiant'}
        isAdmin={false}
        onClose={() => {
          setInConference(false);
          setSelectedConf(null);
          queryClient.invalidateQueries({ queryKey: ['studentConferences'] });
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24">
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-4 pt-12 pb-6 sticky top-0 z-40 shadow-lg">
        <h1 className="text-2xl font-bold text-white mb-3">Conférences</h1>
        <p className="text-blue-100 text-sm">Rejoignez les conférences en direct ou à venir</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : conferences.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
              <Radio className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune conférence</h3>
            <p className="text-gray-500">Les conférences apparaîtront ici</p>
          </div>
        ) : (
          <div className="space-y-4">
            {conferences.map((conf, i) => (
              <motion.div
                key={conf.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all overflow-hidden"
              >
                <div className={`h-1 bg-gradient-to-r ${
                  conf.status === 'en_cours' ? 'from-green-500 to-emerald-500' :
                  conf.status === 'terminée' ? 'from-gray-400 to-gray-500' :
                  'from-blue-500 to-indigo-500'
                }`} />
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      conf.status === 'en_cours' ? 'bg-green-50' :
                      conf.status === 'terminée' ? 'bg-gray-50' : 'bg-blue-50'
                    }`}>
                      <Radio className={`w-5 h-5 ${
                        conf.status === 'en_cours' ? 'text-green-600' :
                        conf.status === 'terminée' ? 'text-gray-400' : 'text-blue-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg mb-1">{conf.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{conf.description}</p>
                      <div className="flex items-center gap-2 flex-wrap mb-3">
                        <Badge className={`text-xs font-semibold ${statusConfig[conf.status].color}`}>
                          {statusConfig[conf.status].label}
                        </Badge>
                        {conf.scheduled_date && (
                          <span className="text-xs text-gray-500 flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg">
                            <Calendar className="w-3.5 h-3.5" />
                            {format(new Date(conf.scheduled_date), "d MMM 'à' HH:mm", { locale: fr })}
                          </span>
                        )}
                        {conf.max_participants && (
                          <span className="text-xs text-gray-500 flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg">
                            <Users className="w-3.5 h-3.5" />
                            {conf.current_participants || 0} / {conf.max_participants}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {conf.status !== 'terminée' && (
                          <Button
                            onClick={() => handleJoin(conf)}
                            disabled={conf.max_participants && conf.current_participants >= conf.max_participants}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 rounded-xl h-10"
                          >
                            {conf.max_participants && conf.current_participants >= conf.max_participants ? (
                              <>
                                <Lock className="w-4 h-4 mr-2" />
                                Complète
                              </>
                            ) : (
                              <>
                                <Radio className="w-4 h-4 mr-2" />
                                Rejoindre
                              </>
                            )}
                          </Button>
                        )}
                        {conf.status === 'terminée' && (
                          <Button
                            onClick={() => handleJoin(conf)}
                            variant="outline"
                            className="flex-1 rounded-xl h-10"
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Voir les discussions
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Rejoindre la conférence</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 pt-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-2xl border border-blue-100">
              <h3 className="font-bold text-gray-900 mb-1">{selectedConf?.title}</h3>
              <p className="text-sm text-gray-600">{selectedConf?.description}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Code d'accès
              </label>
              <Input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="Entrez le code"
                className="rounded-xl h-12 font-mono font-bold text-center text-lg"
                maxLength={6}
              />
              <p className="text-xs text-gray-500 mt-2">Demandez le code à votre enseignant</p>
            </div>
            <Button
              onClick={verifyAndJoin}
              disabled={!joinCode || joinMutation.isPending}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 rounded-xl h-12 text-base font-bold"
            >
              {joinMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Rejoindre
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <StudentBottomNav />
    </div>
  );
}