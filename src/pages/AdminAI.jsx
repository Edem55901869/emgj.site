import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Bot, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import AdminTopNav from '../components/admin/AdminTopNav';
import AdminGuard from '../components/admin/AdminGuard';

export default function AdminAI() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { role: 'user', content: input };
    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Tu es un assistant IA expert de l'application ÉCOLE MISSIONNAIRE GÉNÉRATION JOËL (EMGJ). Tu connais parfaitement cette plateforme de formation théologique. Réponds aux questions de l'administrateur de manière claire et concise. Ne réponds PAS aux questions politiques. Question : ${input}`,
      });
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      toast.error('Erreur lors de la communication avec l\'IA');
    }
    setLoading(false);
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
        <AdminTopNav />
        <div className="pt-20 px-4 pb-8 max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Assistant IA</h1>
            <p className="text-gray-500 mt-1">Posez vos questions sur l'application</p>
          </div>

          <Card className="border-none shadow-lg mb-4 min-h-[500px] flex flex-col">
            <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <Bot className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                  <p className="text-gray-500">Commencez une conversation avec l'assistant IA</p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl px-4 py-3">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder="Posez votre question..."
              className="rounded-xl resize-none"
              rows={3}
            />
            <Button onClick={handleSend} disabled={!input.trim() || loading} className="bg-blue-600 hover:bg-blue-700 rounded-xl px-6">
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}