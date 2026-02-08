import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { User, Edit3, CreditCard, Settings, LogOut, Radio, Bell, ChevronRight, Loader2, Camera, BookOpen, Globe, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import StudentBottomNav from '../components/student/StudentBottomNav';

export default function StudentMore() {
  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const load = async () => {
      const u = await base44.auth.me();
      setUser(u);
      const students = await base44.entities.Student.filter({ user_email: u.email });
      if (students.length > 0) {
        setStudent(students[0]);
        setEditForm({ first_name: students[0].first_name, last_name: students[0].last_name, country: students[0].country, city: students[0].city, whatsapp: students[0].whatsapp });
      }
      const notifs = await base44.entities.Notification.filter({ recipient_email: u.email }, '-created_date', 20);
      setNotifications(notifs);
      setLoading(false);
    };
    load();
  }, []);

  const handleSaveProfile = async () => {
    await base44.entities.Student.update(student.id, editForm);
    setStudent({ ...student, ...editForm });
    setEditOpen(false);
    toast.success('Profil mis à jour');
  };

  const handlePhotoUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.Student.update(student.id, { profile_photo: file_url });
      setStudent({ ...student, profile_photo: file_url });
      toast.success('Photo mise à jour');
    };
    input.click();
  };

  const handleLogout = () => {
    base44.auth.logout();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Profile Banner */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 px-6 pt-8 pb-16 relative">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden border-2 border-white/30">
              {student?.profile_photo ? (
                <img src={student.profile_photo} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-white/80" />
              )}
            </div>
            <button onClick={handlePhotoUpload} className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white shadow flex items-center justify-center">
              <Camera className="w-3.5 h-3.5 text-blue-600" />
            </button>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{student?.first_name} {student?.last_name}</h2>
            <p className="text-blue-200 text-sm">{user?.email}</p>
            <div className="flex gap-2 mt-2">
              <Badge className="bg-white/20 text-white border-white/20 text-xs">{student?.domain}</Badge>
              <Badge className="bg-white/20 text-white border-white/20 text-xs">{student?.formation_type}</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-8 space-y-3">
        {/* Quick info card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Globe className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">{student?.country}, {student?.city}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Phone className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">{student?.whatsapp}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <BookOpen className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">{student?.domain} — {student?.formation_type}</span>
          </div>
        </div>

        {/* Menu items */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <button onClick={() => setEditOpen(true)} className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors border-b border-gray-50">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center"><Edit3 className="w-4 h-4 text-blue-600" /></div>
            <span className="flex-1 text-left font-medium text-gray-900 text-sm">Modifier le profil</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          <Link to={createPageUrl('StudentConferences')} className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors border-b border-gray-50">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center"><Radio className="w-4 h-4 text-purple-600" /></div>
            <span className="flex-1 text-left font-medium text-gray-900 text-sm">Conférences</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </Link>

          <div className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors border-b border-gray-50">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center"><CreditCard className="w-4 h-4 text-green-600" /></div>
            <span className="flex-1 text-left font-medium text-gray-900 text-sm">Scolarité</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>

          <div className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors border-b border-gray-50">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center"><Bell className="w-4 h-4 text-amber-600" /></div>
            <span className="flex-1 text-left font-medium text-gray-900 text-sm">Notifications</span>
            {notifications.filter(n => !n.is_read).length > 0 && (
              <Badge className="bg-red-500 text-white border-none text-xs">{notifications.filter(n => !n.is_read).length}</Badge>
            )}
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>

          <div className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors border-b border-gray-50">
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center"><Settings className="w-4 h-4 text-gray-600" /></div>
            <span className="flex-1 text-left font-medium text-gray-900 text-sm">Paramètres</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        <Button onClick={handleLogout} variant="outline" className="w-full h-12 rounded-xl text-red-600 border-red-200 hover:bg-red-50">
          <LogOut className="w-4 h-4 mr-2" /> Se déconnecter
        </Button>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Modifier le profil</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Prénom</label>
                <Input value={editForm.first_name || ''} onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })} className="rounded-xl h-11" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Nom</label>
                <Input value={editForm.last_name || ''} onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })} className="rounded-xl h-11" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Pays</label>
              <Input value={editForm.country || ''} onChange={(e) => setEditForm({ ...editForm, country: e.target.value })} className="rounded-xl h-11" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Ville</label>
              <Input value={editForm.city || ''} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} className="rounded-xl h-11" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">WhatsApp</label>
              <Input value={editForm.whatsapp || ''} onChange={(e) => setEditForm({ ...editForm, whatsapp: e.target.value })} className="rounded-xl h-11" />
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-500">
              <p className="font-medium text-gray-700">Domaine et formation</p>
              <p>{student?.domain} — {student?.formation_type}</p>
              <p className="text-xs mt-1 text-gray-400">Non modifiable</p>
            </div>
            <Button onClick={handleSaveProfile} className="w-full h-11 bg-blue-600 hover:bg-blue-700 rounded-xl">
              Enregistrer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <StudentBottomNav />
    </div>
  );
}