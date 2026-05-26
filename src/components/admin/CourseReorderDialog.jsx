import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { GripVertical, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { DOMAINS, FORMATION_BY_DOMAIN } from '@/components/domainFormationMapping';
import { toast } from 'sonner';

export default function CourseReorderDialog({ open, onOpenChange, courses, onSaved }) {
  const [domain, setDomain] = useState('');
  const [formation, setFormation] = useState('');
  const [items, setItems] = useState([]);
  const [saving, setSaving] = useState(false);

  const filtered = domain && formation
    ? courses.filter(c => c.domain === domain && c.formation_type === formation)
        .sort((a, b) => (a.order || 999) - (b.order || 999))
    : [];

  useEffect(() => {
    setItems(filtered);
  }, [domain, formation, courses]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(items);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setItems(reordered);
  };

  const handleSave = async () => {
    setSaving(true);
    for (let i = 0; i < items.length; i++) {
      await base44.entities.Course.update(items[i].id, { order: i + 1 });
    }
    setSaving(false);
    toast.success('Ordre sauvegardé');
    onSaved();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle>Réorganiser les cours</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          <select
            value={domain}
            onChange={(e) => { setDomain(e.target.value); setFormation(''); }}
            className="w-full h-11 rounded-xl border border-gray-300 bg-white px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Sélectionner un domaine...</option>
            {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select
            value={formation}
            onChange={(e) => setFormation(e.target.value)}
            disabled={!domain}
            className="w-full h-11 rounded-xl border border-gray-300 bg-white px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="">Sélectionner une formation...</option>
            {domain && FORMATION_BY_DOMAIN[domain]?.map(f => <option key={f} value={f}>{f}</option>)}
          </select>

          {domain && formation && items.length === 0 && (
            <p className="text-center text-gray-500 py-4 text-sm">Aucun cours dans ce domaine/formation</p>
          )}

          {items.length > 0 && (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="courses">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2 max-h-80 overflow-y-auto">
                    {items.map((course, index) => (
                      <Draggable key={course.id} draggableId={course.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`flex items-center gap-3 bg-white border rounded-xl p-3 ${snapshot.isDragging ? 'shadow-lg border-blue-300' : 'border-gray-200'}`}
                          >
                            <div {...provided.dragHandleProps} className="text-gray-400 hover:text-gray-600 cursor-grab">
                              <GripVertical className="w-5 h-5" />
                            </div>
                            <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0">
                              {index + 1}
                            </span>
                            <span className="text-sm font-medium text-gray-800 flex-1 line-clamp-1">{course.title}</span>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}

          {items.length > 0 && (
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl h-11"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sauvegarder l\'ordre'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}