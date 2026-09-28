import { Check, RefreshCw, Sparkles, X } from 'lucide-react'
import { useState } from 'react'
import { improveText, type AIAction } from '../aiService'

const actions: Array<{ id: AIAction; label: string }> = [
  { id: 'improve', label: 'Mejorar redacción' },
  { id: 'professional', label: 'Hacer más profesional' },
  { id: 'concise', label: 'Hacer más conciso' },
  { id: 'technical', label: 'Hacer más técnico' },
  { id: 'achievement', label: 'Orientar a resultados' },
  { id: 'translate', label: 'Traducir al inglés' },
]

export function AIWritingAssistant({ value, onUse }: { value: string; onUse: (value: string) => void }) {
  const [open, setOpen] = useState(false)
  const [action, setAction] = useState<AIAction>('improve')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const generate = async () => {
    setLoading(true)
    setError('')
    try { setResult(await improveText(value, action)) } catch { setError('No se pudo generar una sugerencia. Revisa tu conexión o la configuración de IA.') } finally { setLoading(false) }
  }
  return <div className="ai-assistant"><button className="ai-trigger" onClick={() => setOpen((current) => !current)}><Sparkles size={14} /> Mejorar con IA</button>{open && <div className="ai-panel"><div className="ai-panel-heading"><strong>Asistente de escritura</strong><button className="tiny-button" onClick={() => setOpen(false)} aria-label="Cerrar asistente"><X size={15} /></button></div><div className="ai-action-list">{actions.map((item) => <button className={action === item.id ? 'selected' : ''} key={item.id} onClick={() => setAction(item.id)}>{item.label}</button>)}</div><button className="primary-button ai-generate" onClick={generate} disabled={loading || !value.trim()}>{loading ? <RefreshCw className="spin" size={15} /> : <Sparkles size={15} />} {loading ? 'Generando...' : 'Generar sugerencia'}</button>{error && <p className="ai-error">{error}</p>}{result && <div className="ai-result"><span>Resultado</span><p>{result}</p><div className="ai-result-actions"><button className="primary-button" onClick={() => { onUse(result); setOpen(false) }}><Check size={14} /> Usar resultado</button><button className="secondary-button" onClick={generate} disabled={loading}><RefreshCw size={14} /> Regenerar</button><button className="text-button" onClick={() => setResult('')}>Cancelar</button></div></div>}</div>}</div>
}
