import { Check, LayoutTemplate } from 'lucide-react'
import { useResume } from '../resumeStore'
import type { TemplateId } from '../types'

const templates: Array<{ id: TemplateId; name: string; description: string }> = [
  { id: 'minimal', name: 'Minimal', description: 'Limpio y ATS-friendly' },
  { id: 'professional', name: 'Professional', description: 'Tradicional y corporativo' },
  { id: 'modern', name: 'Modern', description: 'Contemporáneo y flexible' },
  { id: 'executive', name: 'Executive', description: 'Elegante y sobrio' },
  { id: 'creative', name: 'Creative', description: 'Visual y expresivo' },
]

export function TemplatePicker() {
  const { resume, dispatch } = useResume()
  return <section className="editor-card template-panel"><div className="card-heading"><div><span className="eyebrow">Diseño base</span><h2>Elige una plantilla</h2></div><LayoutTemplate size={19} color={resume.design.accent} /></div><p className="card-description">La plantilla cambia la composición, no tus datos.</p><div className="template-grid">{templates.map((template) => <button className={`template-option ${resume.design.template === template.id ? 'selected' : ''}`} key={template.id} onClick={() => dispatch({ type: 'set-template', value: template.id })}><span className={`template-swatch swatch-${template.id}`}><i /><i /><i /></span><span className="template-copy"><strong>{template.name}</strong><small>{template.description}</small></span>{resume.design.template === template.id && <Check className="template-check" size={16} />}</button>)}</div></section>
}
