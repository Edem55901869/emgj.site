import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Eye, EyeOff, Plus, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import AdminTopNav from '../components/admin/AdminTopNav';
import AdminGuard from '../components/admin/AdminGuard';

export default function AdminSettings() {
  const [showPasswords, setShowPasswords] = useState({});
  const [newPassword, setNewPassword] = useState('');
  const [backupType, setBackupType] = useState('');
  const queryClient = useQueryClient();

  const { data: passwords = [], isLoading } = useQuery({
    queryKey: ['adminPasswords'],
    queryFn: () => base44.entities.AdminPassword.list(),
  });

  const addPasswordMutation = useMutation({
    mutationFn: (data) => base44.entities.AdminPassword.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPasswords'] });
      setNewPassword('');
      setBackupType('');
      toast.success('Mot de passe ajouté');
    },
  });

  const availableBackupTypes = ['secours_1', 'secours_2'].filter(
    type => !passwords.some(p => p.password_type === type)
  );

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
        <AdminTopNav />
        <div className="pt-20 px-4 pb-8 max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Paramètres</h1>
            <p className="text-gray-500 mt-1">Gérez vos mots de passe de sécurité</p>
          </div>

          <Card className="border-none shadow-lg mb-6">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                Mots de passe de secours
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
              ) : (
                <>
                  {passwords.filter(p => p.password_type !== 'principal').map(pwd => (
                    <div key={pwd.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {pwd.password_type === 'secours_1' ? 'Mot de passe de secours 1' : 'Mot de passe de secours 2'}
                        </p>
                        <div className="flex items-center gap-2">
                          <Input
                            type={showPasswords[pwd.id] ? 'text' : 'password'}
                            value={pwd.password_hash}
                            readOnly
                            className="h-9 font-mono text-sm"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowPasswords({ ...showPasswords, [pwd.id]: !showPasswords[pwd.id] })}
                            className="h-9 w-9"
                          >
                            {showPasswords[pwd.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {availableBackupTypes.length > 0 && (
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-3">Ajouter un mot de passe de secours</p>
                      <div className="flex gap-2">
                        <Input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Nouveau mot de passe"
                          className="flex-1 h-10 rounded-xl"
                        />
                        <Button
                          onClick={() => {
                            if (newPassword.trim() && availableBackupTypes.length > 0) {
                              addPasswordMutation.mutate({
                                admin_email: 'agnimakaedeme@gmail.com',
                                password_type: availableBackupTypes[0],
                                password_hash: newPassword
                              });
                            }
                          }}
                          disabled={!newPassword.trim() || addPasswordMutation.isPending}
                          className="bg-blue-600 hover:bg-blue-700 rounded-xl"
                        >
                          <Plus className="w-4 h-4 mr-1" /> Ajouter
                        </Button>
                      </div>
                      {passwords.length >= 3 && (
                        <Badge className="mt-2 bg-amber-50 text-amber-700 border-amber-200">
                          Maximum de 2 mots de passe de secours atteint
                        </Badge>
                      )}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-lg">Informations du compte</CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-3">
              <div className="flex justify-between p-3 rounded-xl bg-gray-50">
                <span className="text-sm text-gray-600">Email</span>
                <span className="text-sm font-medium text-gray-900">agnimakaedeme@gmail.com</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-gray-50">
                <span className="text-sm text-gray-600">Rôle</span>
                <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100">Administrateur</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminGuard>
  );
}