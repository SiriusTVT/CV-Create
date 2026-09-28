import { ChevronDown, ChevronUp, Eye, EyeOff, GripVertical, Plus, Sparkles } from 'lucide-react'
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useResume } from '../resumeStore'

function SortableSection({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  return <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={`section-row ${isDragging ? 'is-dragging' : ''}`} {...attributes}><span className="drag-handle" {...listeners} aria-label="Arrastrar sección"><GripVertical className="grip" size={16} /></span>{children}</div>
}

export function ResumeSidebar() {
  const { resume, dispatch } = useResume()
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))
  const handleDragEnd = ({ active, over }: DragEndEvent) => { if (over && active.id !== over.id) dispatch({ type: 'reorder-sections', activeId: active.id as never, overId: over.id as never }) }
  return <aside className="sidebar">
    <div className="sidebar-heading"><div><span className="eyebrow">Estructura</span><h2>Contenido del CV</h2></div><button className="icon-button" aria-label="Agregar sección"><Plus size={18} /></button></div>
    <p className="sidebar-intro">Organiza las secciones que quieres mostrar en tu documento.</p>
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}><SortableContext items={resume.sections.map((section) => section.id)} strategy={verticalListSortingStrategy}><div className="section-list">
      {resume.sections.map((section, index) => <SortableSection id={section.id} key={section.id}><div className={section.visible ? '' : 'is-muted'} style={{ display: 'contents' }}>
        <button className="section-label" onClick={() => dispatch({ type: 'toggle-section', id: section.id })}><span className="section-dot" />{section.label}</button>
        <div className="section-actions">
          <button className="tiny-button" onClick={() => dispatch({ type: 'move-section', id: section.id, direction: -1 })} disabled={index === 0} aria-label={`Mover ${section.label} arriba`}><ChevronUp size={14} /></button>
          <button className="tiny-button" onClick={() => dispatch({ type: 'move-section', id: section.id, direction: 1 })} disabled={index === resume.sections.length - 1} aria-label={`Mover ${section.label} abajo`}><ChevronDown size={14} /></button>
          <button className="tiny-button" onClick={() => dispatch({ type: 'toggle-section', id: section.id })} aria-label={`${section.visible ? 'Ocultar' : 'Mostrar'} ${section.label}`}>{section.visible ? <Eye size={14} /> : <EyeOff size={14} />}</button>
        </div>
      </div></SortableSection>)}
    </div></SortableContext></DndContext>
    <button className="add-section-button"><Plus size={16} /> Agregar sección</button>
    <div className="ai-callout"><div className="ai-icon"><Sparkles size={17} /></div><div><strong>Escribe con intención</strong><p>En próximas fases podrás mejorar tus textos con IA.</p></div></div>
  </aside>
}
