import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MessageCircle, Mic, Image as ImageIcon, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

export default function AskQuestionDialog({ open, onOpenChange, course, studentEmail, studentName }) {
  const [questionText, setQuestionText] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const file = new File([blob], 'question-audio.webm', { type: 'audio/webm' });
        setAudioFile(file);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
    } catch (error) {
      toast.error("Impossible d'accéder au microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && recording) {
      mediaRecorder.stop();
      setRecording(false);
      setMediaRecorder(null);
    }
  };

  const handleSubmit = async () => {
    if (!questionText && !audioFile && imageFiles.length === 0) {
      toast.error('Veuillez poser une question');
      return;
    }

    setUploading(true);
    try {
      let audioUrl = null;
      let imageUrls = [];

      if (audioFile) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: audioFile });
        audioUrl = file_url;
      }

      for (const img of imageFiles) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: img });
        imageUrls.push(file_url);
      }

      await base44.entities.StudentCourseQuestion.create({
        course_id: course.id,
        course_title: course.title,
        student_email: studentEmail,
        student_name: studentName,
        question_text: questionText || null,
        question_audio_url: audioUrl,
        question_images: imageUrls.length > 0 ? imageUrls : null,
        status: 'en_attente'
      });

      toast.success('Question envoyée à l\'administrateur');
      setQuestionText('');
      setAudioFile(null);
      setImageFiles([]);
      onOpenChange(false);
    } catch (error) {
      toast.error('Erreur lors de l\'envoi');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-600" />
            Poser une question
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">Cours : <span className="font-medium text-gray-900">{course?.title}</span></p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Question écrite</label>
            <Textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Écrivez votre question ici..."
              className="rounded-xl min-h-32"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Enregistrement vocal (optionnel)</label>
            {!audioFile ? (
              <Button
                type="button"
                onClick={recording ? stopRecording : startRecording}
                variant={recording ? 'destructive' : 'outline'}
                className="w-full rounded-xl"
              >
                <Mic className="w-4 h-4 mr-2" />
                {recording ? 'Arrêter l\'enregistrement' : 'Enregistrer un audio'}
              </Button>
            ) : (
              <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
                <div className="flex-1">
                  <audio src={URL.createObjectURL(audioFile)} controls className="w-full" />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setAudioFile(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Images (optionnel)</label>
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setImageFiles(Array.from(e.target.files))}
              className="rounded-xl"
            />
            {imageFiles.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {imageFiles.map((file, idx) => (
                  <div key={idx} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt=""
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setImageFiles(imageFiles.filter((_, i) => i !== idx))}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={uploading || (!questionText && !audioFile && imageFiles.length === 0)}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl h-11"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Envoyer la question'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}