import { FileJson, Network, UploadCloud } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { importLinkedInProfile, parseLinkedInFile, type ImportResult } from '../importService'
import { useResume } from '../resumeStore'

export function LinkedInImportPanel() {
  const { dispatch } = useResume()
  const inputRef = useRef<HTMLInputElement>(null)
  const [identifier, setIdentifier] = useState('')
  const [result, setResult] = useState<ImportResult | null>(null)
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const importId = params.get('linkedinImport')
    const error = params.get('linkedinError')
    if (error) setResult({ status: 'error', message: 'LinkedIn no pudo autorizar la importación.', fileName: '' })
    if (!importId) return
    setLoading(true)
    fetch(`/api/linkedin/import/${encodeURIComponent(importId)}`).then(async (response) => {
      if (!response.ok) throw new Error('Import not found')
      const payload = await response.json() as { data?: ImportResult['data'] }
      setResult({ status: 'ready', message: 'Perfil autorizado por LinkedIn. Puedes incorporarlo al CV.', fileName: 'LinkedIn', data: payload.data })
    }).catch(() => setResult({ status: 'error', message: 'La importación de LinkedIn expiró o no pudo completarse.', fileName: '' })).finally(() => { setLoading(false); window.history.replaceState({}, '', window.location.pathname) })
  }, [])
  const applyData = () => {
    if (!result?.data) return
    const { data } = result
    if (data.firstName !== undefined) dispatch({ type: 'update-personal', field: 'firstName', value: data.firstName })
    if (data.lastName !== undefined) dispatch({ type: 'update-personal', field: 'lastName', value: data.lastName })
    if (data.headline !== undefined) dispatch({ type: 'update-personal', field: 'headline', value: data.headline })
    if (data.email !== undefined) dispatch({ type: 'update-personal', field: 'email', value: data.email })
    if (data.summary !== undefined) dispatch({ type: 'update-summary', value: data.summary })
  }
  const handleProfileImport = async () => { setLoading(true); setResult(await importLinkedInProfile(identifier)); setLoading(false) }
  const handleFile = async (file: File | undefined) => { if (!file) return; setLoading(true); setResult(await parseLinkedInFile(file)); setLoading(false) }
  return <section className="linkedin-panel"><div className="linkedin-panel-heading"><div><span className="eyebrow">Perfil profesional</span><strong>Importar desde LinkedIn</strong></div><Network size={19} /></div><p>Conecta tu cuenta mediante OAuth para importar los datos autorizados de tu perfil.</p><button className="linkedin-oauth" onClick={() => { window.location.href = '/auth/linkedin' }} disabled={loading}><Network size={16} /> Conectar con LinkedIn</button><div className="linkedin-divider"><span>o usa usuario / exportación</span></div><div className="linkedin-username"><input value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder="usuario o URL de LinkedIn" aria-label="Usuario o URL de LinkedIn" /><button className="primary-button" onClick={handleProfileImport} disabled={loading || !identifier.trim()}>{loading ? 'Consultando...' : 'Solicitar'}</button></div><button className="linkedin-upload" onClick={() => inputRef.current?.click()} disabled={loading}><UploadCloud size={16} /> Cargar CSV o JSON de LinkedIn</button><input ref={inputRef} className="visually-hidden" type="file" accept=".csv,.json,text/csv,application/json" onChange={(event) => handleFile(event.target.files?.[0])} />{result && <div className={`linkedin-result ${result.status}`}><strong>{result.status === 'ready' ? 'Datos encontrados' : result.status === 'pending' ? 'Backend pendiente' : 'No se pudo importar'}</strong><span>{result.message}</span>{result.status === 'ready' && <button className="text-button" onClick={applyData}>Usar estos datos</button>}</div>}<small className="linkedin-note"><FileJson size={12} /> OAuth usa una sesión autorizada; nunca introduzcas tu contraseña de LinkedIn aquí.</small></section>
}
