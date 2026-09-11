import React from 'react';
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, rectSortingStrategy, SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Lock, X } from 'lucide-react';

const SortableCard = ({ id, label, locked = false }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled: locked,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`rounded-2xl border p-4 shadow-sm ${isDragging ? 'border-[#123B6D] bg-white shadow-xl' : 'border-slate-200 bg-slate-50'}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {locked ? (
            <Lock size={14} className="text-slate-400" />
          ) : (
            <button
              type="button"
              className="cursor-grab text-slate-400 hover:text-slate-700 active:cursor-grabbing"
              {...attributes}
              {...listeners}
            >
              <GripVertical size={16} />
            </button>
          )}
          <span className="text-sm font-semibold text-slate-800">{label}</span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          {locked ? 'Locked' : 'Drag'}
        </span>
      </div>
    </div>
  );
};

const SectionArrangeModal = ({ isOpen, sections, onClose, onChange }) => {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  if (!isOpen) return null;

  const items = sections.map((section) => section.id);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.indexOf(active.id);
    const newIndex = items.indexOf(over.id);
    onChange(arrayMove(sections, oldIndex, newIndex));
  };

  return (
    <div className="fixed inset-0 z-[9998] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-4xl rounded-[28px] bg-white shadow-2xl overflow-hidden">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Rearrange Sections</h2>
            <p className="mt-1 text-sm text-slate-500">
              Drag the cards to control the order used in the download preview and exported PDF.
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-800">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-6">
          <div className="mb-5 rounded-2xl border border-[#E1E7EF] bg-[#E8EEF7] px-4 py-3 text-sm text-[#123B6D]">
            Header stays locked at the top. Everything else can be reordered.
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sections.map((section) => (
                  <SortableCard key={section.id} id={section.id} label={section.label} locked={section.locked} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </div>
  );
};

export default SectionArrangeModal;
