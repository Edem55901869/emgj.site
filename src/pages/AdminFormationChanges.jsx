import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Check, X, Clock, Loader2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminTopNav from '../components/admin/AdminTopNav';
import AdminGuard from '../components/admin/AdminGuard';
import { toast } from 'sonner';

export default function AdminFormationChanges() {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState(null);
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['formationChangeRequests'],
    queryFn: () => base44.entities.FormationChangeRequest.list('-created_date', 200),
  });

  const updateRequestMutation = useMutation({
    mutationFn: async ({ requestId, status, notes, studentData }) => {
      await base44.entities.FormationChangeRequest.update(requestId, {
        status,
        admin_notes: notes,
      });

      if (status === 'approuvé') {
        // Marquer l'ancienne formation comme terminée
        const existingHistory = await base44.entities.StudentFormationHistory.filter({
          student_email: studentData.student_email,
          domain: studentData.current_domain,
          formation_type: studentData.current_formation,
          status: 'en_cours',
        });

        if (existingHistory.length > 0) {
          await base44.entities.StudentFormationHistory.update(existingHistory[0].id, {
            status: 'terminée',
            completion_date: new Date().toISOString(),
          });
        } else {
          await base44.entities.StudentFormationHistory.create({
            student_email: studentData.student_email,
            domain: studentData.current_domain,
            formation_type: studentData.current_formation,
            status: 'terminée',
            completion_date: new Date().toISOString(),
          });
        }

        // Créer la nouvelle formation en cours
        await base44.entities.StudentFormationHistory.create({
          student_email: studentData.student_email,
          domain: studentData.new_domain,
          formation_type: studentData.new_formation,
          status: 'en_cours',
        });

        // Mettre à jour le profil de l'étudiant
        const students = await base44.entities.Student.filter({ user_email: studentData.student_email });
        if (students.length > 0) {
          await base44.entities.Student.update(students[0].id, {
            domain: studentData.new_domain,
            formation_type: studentData.new_formation,
          });
        }
      }

      // Notifier l'étudiant
      await base44.entities.Notification.create({
        user_email: studentData.student_email,
        title: status === 'approuvé' ? 'Demande approuvée' : 'Demande rejetée',
        message: status === 'approuvé' 
          ? `Votre demande de changement vers ${studentData.new_domain} (${studentData.new_formation}) a été approuvée`
          : `Votre demande de changement a été rejetée. ${notes}`,
        type: 'formation_change_response',
        is_read: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formationChangeRequests'] });
      toast.success('Demande traitée');
      setDialogOpen(false);
      setSelectedRequest(null);
      setAdminNotes('');
    },
  });

  const handleAction = (request, action) => {
    setSelectedRequest(request);
    setActionType(action);
    setDialogOpen(true);
  };

  const handleConfirm = () => {
    if (actionType === 'rejeté' && !adminNotes) {
      toast.error('Veuillez ajouter une note explicative');
      return;
    }
    updateRequestMutation.mutate({
      requestId: selectedRequest.id,
      status: actionType,
      notes: adminNotes,
      studentData: selectedRequest,
    });
  };

  const pendingRequests = requests.filter(r => r.status === 'en_attente');
  const processedRequests = requests.filter(r => r.status !== 'en_attente');

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <AdminTopNav />
        <div className="pt-20 px-4 pb-8 max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Changements de Formation</h1>
            <p className="text-gray-500">Gérez les demandes de changement de domaine ou de formation</p>
          </div>

          <Tabs defaultValue="pending" className="space-y-6">
            <TabsList className="bg-white rounded-xl p-1 shadow-sm">
              <TabsTrigger value="pending" className="rounded-lg">
                <Clock className="w-4 h-4 mr-2" />
                En attente ({pendingRequests.length})
              </TabsTrigger>
              <TabsTrigger value="processed" className="rounded-lg">
                <RefreshCw className="w-4 h-4 mr-2" />
                Traitées ({processedRequests.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : pendingRequests.length === 0 ? (
                <Card className="rounded-2xl border-0 shadow-lg">
                  <CardContent className="py-12 text-center">
                    <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Aucune demande en attente</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pendingRequests.map(request => (
                    <Card key={request.id} className="rounded-2xl border-0 shadow-lg overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50">
                        <CardTitle className="text-lg">{request.student_name}</CardTitle>
                        <p className="text-sm text-gray-600">{request.student_email}</p>
                      </CardHeader>
                      <CardContent className="p-6 space-y-4">
                        <div className="space-y-3">
                          <div className="bg-red-50 rounded-xl p-3">
                            <p className="text-xs text-gray-600 mb-1">Formation actuelle</p>
                            <p className="font-medium text-gray-900">{request.current_domain}</p>
                            <p className="text-sm text-gray-700">{request.current_formation}</p>
                          </div>
                          <div className="text-center text-gray-400">↓</div>
                          <div className="bg-green-50 rounded-xl p-3">
                            <p className="text-xs text-gray-600 mb-1">Nouvelle formation souhaitée</p>
                            <p className="font-medium text-gray-900">{request.new_domain}</p>
                            <p className="text-sm text-gray-700">{request.new_formation}</p>
                          </div>
                        </div>

                        {request.motivation && (
                          <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-xs text-gray-600 mb-1">Motivation</p>
                            <p className="text-sm text-gray-700">{request.motivation}</p>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleAction(request, 'approuvé')}
                            className="flex-1 bg-green-600 hover:bg-green-700 rounded-xl"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Approuver
                          </Button>
                          <Button
                            onClick={() => handleAction(request, 'rejeté')}
                            variant="outline"
                            className="flex-1 border-red-200 text-red-600 hover:bg-red-50 rounded-xl"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Rejeter
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="processed">
              {processedRequests.length === 0 ? (
                <Card className="rounded-2xl border-0 shadow-lg">
                  <CardContent className="py-12 text-center">
                    <RefreshCw className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Aucune demande traitée</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {processedRequests.map(request => (
                    <Card key={request.id} className="rounded-2xl border-0 shadow-sm">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="font-bold text-gray-900">{request.student_name}</h3>
                              <Badge className={request.status === 'approuvé' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                                {request.status === 'approuvé' ? 'Approuvé' : 'Rejeté'}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-600">De: {request.current_domain}</p>
                                <p className="text-gray-500 text-xs">{request.current_formation}</p>
                              </div>
                              <div>
                                <p className="text-gray-600">Vers: {request.new_domain}</p>
                                <p className="text-gray-500 text-xs">{request.new_formation}</p>
                              </div>
                            </div>
                            {request.admin_notes && (
                              <div className="mt-3 bg-gray-50 rounded-lg p-3">
                                <p className="text-xs text-gray-600 mb-1">Note:</p>
                                <p className="text-sm text-gray-700">{request.admin_notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle>
                {actionType === 'approuvé' ? 'Approuver la demande' : 'Rejeter la demande'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm font-medium mb-2">{selectedRequest?.student_name}</p>
                <p className="text-xs text-gray-600">
                  {selectedRequest?.current_domain} ({selectedRequest?.current_formation}) → {selectedRequest?.new_domain} ({selectedRequest?.new_formation})
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  {actionType === 'approuvé' ? 'Note (optionnelle)' : 'Raison du rejet *'}
                </label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder={actionType === 'approuvé' ? 'Ajouter une note...' : 'Expliquez la raison du rejet...'}
                  className="rounded-xl min-h-24"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setDialogOpen(false)}
                  variant="outline"
                  className="flex-1 rounded-xl"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={updateRequestMutation.isPending}
                  className={`flex-1 rounded-xl ${actionType === 'approuvé' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                >
                  {updateRequestMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    actionType === 'approuvé' ? 'Approuver' : 'Rejeter'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminGuard>
  );
}