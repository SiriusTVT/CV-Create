import { FileUp, LoaderCircle, UploadCloud } from 'lucide-react'
import { useRef, useState } from 'react'
import { parseResumeFile, type ImportResult } from '../importService'

export function ImportResumePanel() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [loading, setLoading] = useState(false)
  const handleFile = (selectedFile: File | undefined) => { if (!selectedFile) return; setFile(selectedFile); setResult(null) }
  const handleImport = async () => { if (!file) return; setLoading(true); setResult(await parseResumeFile(file)); setLoading(false) }
  return <section className="editor-card import-panel"><div className="card-heading"><div><span className="eyebrow">Migración</span><h2>Importar un CV existente</h2></div><FileUp size={19} color="#1769e0" /></div><p className="card-description">Carga un PDF o DOCX para preparar su transformación al modelo ResumeData.</p><button className="import-dropzone" onClick={() => inputRef.current?.click()}><UploadCloud size={23} /><strong>{file ? file.name : 'Seleccionar PDF o DOCX'}</strong><small>{file ? `${Math.ceil(file.size / 1024)} KB` : 'Máximo recomendado: 10 MB'}</small></button><input ref={inputRef} className="visually-hidden" type="file" accept=".pdf,.doc,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(event) => handleFile(event.target.files?.[0])} />{file && <button className="primary-button import-button" onClick={handleImport} disabled={loading}>{loading ? <LoaderCircle className="spin" size={15} /> : <FileUp size={15} />} {loading ? 'Analizando...' : 'Preparar importación'}</button>}{result && <p className={`import-result ${result.status}`}><strong>{result.status === 'pending' ? 'Preparado para integración' : 'No se pudo importar'}</strong><span>{result.message}</span></p>}</section>
}
