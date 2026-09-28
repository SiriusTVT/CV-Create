import { useState } from 'react'
import { TemplateRenderer } from './TemplateRenderer'
import { useResume } from '../resumeStore'
import type { SectionId } from '../types'

export function ResumePreview() {
  const { resume } = useResume()
  const [zoom, setZoom] = useState(1)
  const visibleSections = resume.sections.filter((section) => section.visible && section.id !== 'personal').map((section) => section.id)
  const pages: SectionId[][] = []
  for (let index = 0; index < visibleSections.length; index += 4) pages.push(visibleSections.slice(index, index + 4))
  if (!pages.length) pages.push([])
  return <div className="preview-stage"><div className="preview-toolbar"><span>Vista previa · {resume.design.template}</span><div><button className="zoom-button" onClick={() => setZoom((value) => Math.max(.75, value - .1))} aria-label="Reducir zoom">-</button><button className="zoom-value" onClick={() => setZoom(1)} aria-label="Restablecer zoom">{Math.round(zoom * 100)}%</button><button className="zoom-button" onClick={() => setZoom((value) => Math.min(1.25, value + .1))} aria-label="Aumentar zoom">+</button><button className="fit-button" onClick={() => setZoom(1)}>Ajustar</button></div></div><div id="resume-preview-pages" className="paper-stack" style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}>{pages.map((sectionIds, index) => <TemplateRenderer key={index} resume={resume} sectionIds={sectionIds} pageNumber={index + 1} />)}</div><span className="page-label">{pages.length} {pages.length === 1 ? 'página' : 'páginas'}</span></div>
}
