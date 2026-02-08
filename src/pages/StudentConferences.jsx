import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Radio, Lock, Calendar, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import StudentBottomNav from '../components/student/StudentBottomNav';

export default function StudentConferences() {
  const [joinDialog, setJoinDialog] = useState(null);
  const [code, setCode] = useState('');
  const [joinedConference, setJoinedConference] = useState(null);

  const { data: conferences = [], isLoading } = useQuery({
    queryKey: ['conferences'],
    queryFn: () => base44.entities.Conference.list('-created_date', 50),
  });

  const handleJoin = (conf) => {
    if (code === conf.access_code) {
      setJoinedConference(conf);
      setJoinDialog(null);
      setCode('');
      toast.success('Vous avez rejoint la conférence !');
    } else {
      toast.error('Code d\'accès incorrect');
    }
  };

  if (joinedConference) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 rounded-full bg-blue-600/20 flex items-center justify-center mb-6 animate-pulse">
          <Radio className="w-12 h-12 text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">{joinedConference.title}</h2>
        <p className="text-gray-400 mb-2">{joinedConference.description}</p>
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 mb-8">En direct</Badge>
        {joinedConference.audio_url && (
          <audio src={joinedConference.audio_url} controls autoPlay className="w-full max-w-md mb-8" />
        )}
        <Button onClick={() => setJoinedConference(null)} variant="outline" className="text-white border-white/20 hover:bg-white/10 rounded-xl">
          Quitter la conférence
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link to={createPageUrl('StudentMore')}>
            <Button variant="ghost" size="icon" className="rounded-xl"><ArrowLeft className="w-5 h-5" /></Button>
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Conférences</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
        ) : conferences.filter(c => c.status === 'en_cours' || c.status === 'planifiée').length === 0 ? (
          <div className="text-center py-16">
            <Radio className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucune conférence en cours</p>
          </div>
        ) : (
          conferences.filter(c => c.status === 'en_cours' || c.status === 'planifiée').map(conf => (
            <div key={conf.id} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${conf.status === 'en_cours' ? 'bg-green-50' : 'bg-blue-50'}`}>
                  <Radio className={`w-5 h-5 ${conf.status === 'en_cours' ? 'text-green-600' : 'text-blue-600'}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{conf.title}</h3>
                  <p className="text-gray-500 text-sm mt-1">{conf.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={`text-xs ${conf.status === 'en_cours' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                      {conf.status === 'en_cours' ? '🔴 En direct' : '📅 Planifiée'}
                    </Badge>
                    {conf.scheduled_date && (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(conf.scheduled_date), "d MMM yyyy HH:mm", { locale: fr })}
                      </span>
                    )}
                  </div>
                </div>
                {conf.status === 'en_cours' && (
                  <Button onClick={() => setJoinDialog(conf)} size="sm" className="bg-green-600 hover:bg-green-700 rounded-xl">
                    <Lock className="w-3 h-3 mr-1" /> Rejoindre
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={!!joinDialog} onOpenChange={() => setJoinDialog(null)}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>Code d'accès requis</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-gray-500">Entrez le code d'accès pour rejoindre « {joinDialog?.title} »</p>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Code d'accès"
              className="h-12 rounded-xl text-center text-lg tracking-widest"
            />
            <Button onClick={() => handleJoin(joinDialog)} className="w-full h-11 bg-blue-600 hover:bg-blue-700 rounded-xl">
              Rejoindre
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <StudentBottomNav />
    </div>
  );
}