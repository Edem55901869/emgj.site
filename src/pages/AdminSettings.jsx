import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Eye, EyeOff, Plus, Loader2, Edit, Trash2, Check, X, Key, User } from 'lucide-react';
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
  const [editingPassword, setEditingPassword] = useState(null);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadAdmin = async () => {
      const adminData = localStorage.getItem('emgj_admin');
      if (adminData) {
        const admin = JSON.parse(adminData);
        if (admin.role === 'admin_principal') {
          // Toujours afficher emgj2020@gmail.com pour l'admin principal
          setCurrentAdmin({ ...admin, email: 'emgj2020@gmail.com' });
        } else {
          const admins = await base44.entities.AdminUser.filter({ email: admin.email });
          if (admins.length > 0) {
            setCurrentAdmin(admins[0]);
          }
        }
      }
    };
    loadAdmin();
  }, []);

  const { data: passwords = [], isLoading } = useQuery({
    queryKey: ['adminPasswords'],
    queryFn: () => base44.entities.AdminPassword.list(),
  });

  const addPasswordMutation = useMutation({
    mutationFn: (data) => base44.entities.AdminPassword.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPasswords'] });
      setNewPassword('');
      toast.success('Mot de passe ajouté');
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: ({ id, password_hash }) => base44.entities.AdminPassword.update(id, { password_hash }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPasswords'] });
      setEditingPassword(null);
      toast.success('Mot de passe modifié');
    },
  });

  const deletePasswordMutation = useMutation({
    mutationFn: (id) => base44.entities.AdminPassword.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPasswords'] });
      toast.success('Mot de passe supprimé');
    },
  });

  const availableBackupTypes = ['secours_1', 'secours_2'].filter(
    type => !passwords.some(p => p.password_type === type)
  );

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <AdminTopNav />
        <div className="pt-20 px-4 pb-8 max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Paramètres</h1>
            <p className="text-gray-500 mt-1">Gérez vos mots de passe de sécurité</p>
          </div>

          {currentAdmin?.role === 'admin_principal' && (
          <Card className="border-none shadow-lg mb-6">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-lg flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-600" />
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
                            value={editingPassword?.id === pwd.id ? editingPassword.password_hash : pwd.password_hash}
                            onChange={(e) => editingPassword?.id === pwd.id && setEditingPassword({ ...editingPassword, password_hash: e.target.value })}
                            readOnly={editingPassword?.id !== pwd.id}
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
                          {editingPassword?.id === pwd.id ? (
                            <>
                              <Button
                                size="icon"
                                onClick={() => updatePasswordMutation.mutate({ id: pwd.id, password_hash: editingPassword.password_hash })}
                                className="h-9 w-9 bg-green-600 hover:bg-green-700"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditingPassword(null)}
                                className="h-9 w-9"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditingPassword({ id: pwd.id, password_hash: pwd.password_hash })}
                                className="h-9 w-9"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deletePasswordMutation.mutate(pwd.id)}
                                className="h-9 w-9 text-red-500 hover:text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
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
                                admin_email: 'emgj2020@gmail.com',
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
          )}

          <Card className="border-none shadow-lg">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-gray-600" />
                Informations du compte
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-3">
              <div className="flex justify-between p-3 rounded-xl bg-gray-50">
                <span className="text-sm text-gray-600">Email</span>
                <span className="text-sm font-medium text-gray-900">{currentAdmin?.email || 'emgj2020@gmail.com'}</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-gray-50">
                <span className="text-sm text-gray-600">Rôle</span>
                <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100">
                  {currentAdmin?.role === 'admin_principal' ? 'Administrateur Principal' : 'Administrateur Secondaire'}
                </Badge>
              </div>
              {currentAdmin?.whatsapp && (
                <div className="flex justify-between items-center p-3 rounded-xl bg-green-50 border border-green-100">
                  <span className="text-sm text-gray-600">WhatsApp</span>
                  <a 
                    href={`https://wa.me/${currentAdmin.whatsapp.replace(/[^0-9]/g, '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-green-700 hover:text-green-800 underline"
                  >
                    {currentAdmin.whatsapp}
                  </a>
                </div>
              )}
              {currentAdmin?.permissions && currentAdmin.permissions.length > 0 && (
                <div className="p-3 rounded-xl bg-gray-50">
                  <span className="text-sm text-gray-600 block mb-2">Fonctionnalités autorisées</span>
                  <div className="flex flex-wrap gap-1">
                    {currentAdmin.permissions.map(p => (
                      <Badge key={p} className="bg-blue-50 text-blue-700 border-blue-100 text-xs">{p}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminGuard>
  );
}