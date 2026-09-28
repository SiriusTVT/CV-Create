import { Download, Eye, FileText, Redo2, Save, Undo2 } from 'lucide-react'
import { PersonalInfoEditor } from './components/PersonalInfoEditor'
import { ContentSections } from './components/ContentSections'
import { TemplatePicker } from './components/TemplatePicker'
import { DesignPanel } from './components/DesignPanel'
import { ResumePreview } from './components/ResumePreview'
import { ResumeSidebar } from './components/ResumeSidebar'
import { ResumeManager } from './components/ResumeManager'
import { AIWritingAssistant } from './components/AIWritingAssistant'
import { ImportResumePanel } from './components/ImportResumePanel'
import { useState } from 'react'
import { exportResumePdf } from './pdfExport'
import { useResume } from './resumeStore'
import './styles.css'

function App() {
  const { resume, dispatch, canUndo, canRedo, saveStatus } = useResume()
  const [isExporting, setIsExporting] = useState(false)
  const saveLabel = saveStatus === 'saving' ? 'Guardando...' : saveStatus === 'error' ? 'Error al guardar' : 'Guardado'
  const handleExport = async () => {
    setIsExporting(true)
    try {
      await exportResumePdf('resume-preview-pages', resume.title)
    } finally {
      setIsExporting(false)
    }
  }
  return <div className="app-shell">
    <header className="topbar"><div className="brand"><div className="brand-mark"><FileText size={17} /></div><span>CV<span className="brand-accent">create</span></span></div><div className="document-title"><input aria-label="Nombre del CV" value={resume.title} onChange={(event) => dispatch({ type: 'update-title', value: event.target.value })} /><span className={`save-status ${saveStatus}`}><Save size={14} /> {saveLabel}</span></div><ResumeManager /><div className="top-actions"><button className="icon-button" onClick={() => dispatch({ type: 'undo' })} disabled={!canUndo} aria-label="Deshacer"><Undo2 size={17} /></button><button className="icon-button" onClick={() => dispatch({ type: 'redo' })} disabled={!canRedo} aria-label="Rehacer"><Redo2 size={17} /></button><button className="secondary-button"><Eye size={16} /> Vista previa</button><button className="primary-button" onClick={handleExport} disabled={isExporting}><Download size={16} /> {isExporting ? 'Generando...' : 'Descargar PDF'}</button></div></header>
    <main className="workspace"><ResumeSidebar /><section className="editor-area"><div className="editor-heading"><div><span className="eyebrow">Editor de CV</span><h1>Construye una historia profesional.</h1></div><span className="autosave-note">Guardado automáticamente</span></div><PersonalInfoEditor /><section className="editor-card summary-card"><div className="card-heading"><div><span className="eyebrow">02 / Narrativa</span><h2>Perfil profesional</h2></div></div><textarea value={resume.summary} onChange={(event) => dispatch({ type: 'update-summary', value: event.target.value })} rows={5} /><AIWritingAssistant value={resume.summary} onUse={(value) => dispatch({ type: 'update-summary', value })} /></section><TemplatePicker /><DesignPanel /><ImportResumePanel /><ContentSections /></section><ResumePreview /></main>
  </div>
}

export default App
