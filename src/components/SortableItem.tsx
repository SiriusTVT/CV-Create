import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { ReactNode } from 'react'

export function SortableItem({ id, children, className = '' }: { id: string; children: ReactNode; className?: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  return <div ref={setNodeRef} style={style} className={`${className} ${isDragging ? 'is-dragging' : ''}`} {...attributes} {...listeners}>{children}</div>
}
