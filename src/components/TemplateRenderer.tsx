import { Mail, MapPin, Phone } from 'lucide-react'
import type { ReactNode } from 'react'
import type { ResumeData, SectionId } from '../types'

type TemplateProps = { resume: ResumeData; sectionIds: SectionId[]; pageNumber: number }

function Header({ resume, compact = false }: { resume: ResumeData; compact?: boolean }) {
  const { personalInfo } = resume
  const { showIcons } = resume.design
  return <header className={`template-header ${compact ? 'compact' : ''}`}><div><h1>{personalInfo.firstName} {personalInfo.lastName}</h1><p className="resume-headline">{personalInfo.headline}</p><div className="contact-line"><span>{showIcons && <Mail size={11} />} {personalInfo.email}</span><span>{showIcons && <Phone size={11} />} {personalInfo.phone}</span><span>{showIcons && <MapPin size={11} />} {personalInfo.city}, {personalInfo.country}</span></div></div>{!compact && <div className="resume-mark">{personalInfo.firstName.slice(0, 1)}{personalInfo.lastName.slice(0, 1)}</div>}</header>
}

function SectionContent({ id, resume }: { id: SectionId; resume: ResumeData }) {
  if (id === 'personal') return null
  if (id === 'summary') return <section className="resume-section"><h3>Perfil profesional</h3><p>{resume.summary}</p></section>
  if (id === 'experience') return <section className="resume-section"><h3>Experiencia</h3>{resume.experience.map((item) => <div className="resume-entry" key={item.id}><div className="entry-top"><strong>{item.role || 'Cargo'}</strong><span>{item.startDate} — {item.current ? 'Presente' : item.endDate}</span></div><p className="entry-company">{item.company || 'Empresa'} · {item.location}</p><p>{item.description}</p></div>)}</section>
  if (id === 'education') return <section className="resume-section"><h3>Educación</h3>{resume.education.map((item) => <div className="resume-entry" key={item.id}><div className="entry-top"><strong>{item.degree || 'Título'}</strong><span>{item.startDate} — {item.current ? 'Presente' : item.endDate}</span></div><p className="entry-company">{item.institution || 'Institución'} · {item.location}</p><p>{item.description}</p></div>)}</section>
  if (id === 'skills') return <section className="resume-section"><h3>Habilidades</h3><div className="skill-list">{resume.skills.filter((item) => item.name).map((item) => <span key={item.id}>{item.name}{resume.design.showSkillLevels && <small>{item.level}</small>}</span>)}</div></section>
  if (id === 'languages') return <section className="resume-section"><h3>Idiomas</h3><div className="language-list">{resume.languages.filter((item) => item.name).map((item) => <span key={item.id}><strong>{item.name}</strong> {item.level}</span>)}</div></section>
  if (id === 'projects') return <section className="resume-section"><h3>Proyectos</h3>{resume.projects.filter((item) => item.name).map((item) => <div className="resume-entry" key={item.id}><div className="entry-top"><strong>{item.name}</strong><span>{item.date}</span></div><p className="entry-company">{item.role} · {item.technologies}</p><p>{item.description}</p></div>)}</section>
  return <section className="resume-section"><h3>Certificaciones</h3>{resume.certifications.filter((item) => item.name).map((item) => <div className="resume-entry" key={item.id}><div className="entry-top"><strong>{item.name}</strong><span>{item.date}</span></div><p className="entry-company">{item.institution}</p></div>)}</section>
}

function PageFrame({ resume, sectionIds, className, children }: TemplateProps & { className: string; children: ReactNode }) {
  const showPersonal = resume.sections.find((section) => section.id === 'personal')?.visible
  const { design } = resume
  const style = { '--accent': design.accent, '--secondary': design.secondary, '--resume-size': `${design.fontSize}px`, '--resume-spacing': design.spacing, '--resume-line-height': design.lineHeight, '--resume-margin': `${design.margins}%`, '--column-width': `${design.columnWidth}%`, '--title-transform': design.titleStyle === 'sentence' ? 'none' : 'uppercase', '--date-opacity': design.dateStyle === 'muted' ? '.62' : '1', fontFamily: design.font } as React.CSSProperties
  return <article className={`resume-paper ${className}`} style={style}>{showPersonal && <Header resume={resume} />}{children}<span className="paper-page-number">{sectionIds.length ? '' : ''}</span></article>
}

function MinimalTemplate({ resume, sectionIds }: TemplateProps) {
  return <PageFrame resume={resume} sectionIds={sectionIds} pageNumber={1} className="template-minimal"><div className="resume-content">{sectionIds.map((id) => <SectionContent id={id} resume={resume} key={id} />)}</div></PageFrame>
}

function ProfessionalTemplate({ resume, sectionIds }: TemplateProps) {
  const side = sectionIds.filter((id) => ['skills', 'languages', 'certifications'].includes(id))
  const main = sectionIds.filter((id) => !side.includes(id))
  return <PageFrame resume={resume} sectionIds={sectionIds} pageNumber={1} className="template-professional"><div className="professional-grid"><aside>{side.map((id) => <SectionContent id={id} resume={resume} key={id} />)}</aside><div>{main.map((id) => <SectionContent id={id} resume={resume} key={id} />)}</div></div></PageFrame>
}

function ModernTemplate({ resume, sectionIds }: TemplateProps) {
  return <PageFrame resume={resume} sectionIds={sectionIds} pageNumber={1} className="template-modern"><div className="modern-rule" /><div className="resume-content">{sectionIds.map((id) => <SectionContent id={id} resume={resume} key={id} />)}</div></PageFrame>
}

function ExecutiveTemplate({ resume, sectionIds }: TemplateProps) {
  return <PageFrame resume={resume} sectionIds={sectionIds} pageNumber={1} className="template-executive"><div className="executive-kicker">Curriculum vitae</div><div className="resume-content">{sectionIds.map((id) => <SectionContent id={id} resume={resume} key={id} />)}</div></PageFrame>
}

function CreativeTemplate({ resume, sectionIds }: TemplateProps) {
  return <PageFrame resume={resume} sectionIds={sectionIds} pageNumber={1} className="template-creative"><div className="creative-banner" /><div className="resume-content">{sectionIds.map((id) => <SectionContent id={id} resume={resume} key={id} />)}</div></PageFrame>
}

export function TemplateRenderer({ resume, sectionIds, pageNumber }: TemplateProps) {
  const props = { resume, sectionIds, pageNumber }
  if (resume.design.template === 'professional') return <ProfessionalTemplate {...props} />
  if (resume.design.template === 'modern') return <ModernTemplate {...props} />
  if (resume.design.template === 'executive') return <ExecutiveTemplate {...props} />
  if (resume.design.template === 'creative') return <CreativeTemplate {...props} />
  return <MinimalTemplate {...props} />
}
