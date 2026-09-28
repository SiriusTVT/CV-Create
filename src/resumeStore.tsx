import { createContext, useContext, useEffect, useReducer, useState, type Dispatch, type ReactNode } from 'react'
import type { Certification, Education, Experience, Language, Project, ResumeData, SectionId, Skill, TemplateId } from './types'

const storageKey = 'cv-create-resume-v2'
const documentsKey = 'cv-create-documents-v2'

export const initialResume: ResumeData = {
  id: crypto.randomUUID(),
  title: 'Mi CV',
  personalInfo: {
    firstName: '',
    lastName: '',
    headline: '',
    email: '',
    phone: '',
    city: '',
    country: '',
    linkedin: '',
    website: '',
  },
  summary: '',
  experience: [],
  education: [],
  skills: [],
  languages: [],
  projects: [],
  certifications: [],
  sections: [
    { id: 'personal', label: 'Información personal', visible: true },
    { id: 'summary', label: 'Perfil profesional', visible: true },
    { id: 'experience', label: 'Experiencia', visible: true },
    { id: 'education', label: 'Educación', visible: true },
    { id: 'skills', label: 'Habilidades', visible: true },
    { id: 'languages', label: 'Idiomas', visible: false },
    { id: 'projects', label: 'Proyectos', visible: false },
    { id: 'certifications', label: 'Certificaciones', visible: false },
  ],
  design: { accent: '#1769e0', secondary: '#526176', font: 'Inter', template: 'minimal', fontSize: 9, spacing: 1, lineHeight: 1.55, margins: 10, columnWidth: 31, titleStyle: 'uppercase', dateStyle: 'inline', showIcons: true, showSkillLevels: false },
  updatedAt: new Date().toISOString(),
}

type Action =
  | { type: 'update-personal'; field: keyof ResumeData['personalInfo']; value: string }
  | { type: 'update-summary'; value: string }
  | { type: 'update-title'; value: string }
  | { type: 'toggle-section'; id: SectionId }
  | { type: 'move-section'; id: SectionId; direction: -1 | 1 }
  | { type: 'reorder-sections'; activeId: SectionId; overId: SectionId }
  | { type: 'set-accent'; value: string }
  | { type: 'set-template'; value: TemplateId }
  | { type: 'update-design'; field: keyof ResumeData['design']; value: string | number | boolean }
  | { type: 'add-item'; collection: 'experience' | 'education' | 'skills' | 'languages' | 'projects' | 'certifications' }
  | { type: 'remove-item'; collection: 'experience' | 'education' | 'skills' | 'languages' | 'projects' | 'certifications'; id: string }
  | { type: 'duplicate-item'; collection: 'experience' | 'education' | 'skills' | 'languages' | 'projects' | 'certifications'; id: string }
  | { type: 'reorder-items'; collection: 'experience' | 'education' | 'skills' | 'languages' | 'projects' | 'certifications'; activeId: string; overId: string }
  | { type: 'update-item'; collection: 'experience' | 'education' | 'skills' | 'languages' | 'projects' | 'certifications'; id: string; field: string; value: string | boolean }
  | { type: 'undo' }
  | { type: 'redo' }
  | { type: 'create-resume' }
  | { type: 'duplicate-resume' }
  | { type: 'delete-resume'; id: string }
  | { type: 'switch-resume'; id: string }
  | { type: 'rename-resume'; id: string; title: string }

type StoreState = { resume: ResumeData; past: ResumeData[]; future: ResumeData[]; documents: ResumeData[] }

function resumeReducer(state: ResumeData, action: Action): ResumeData {
  const updatedAt = new Date().toISOString()
  switch (action.type) {
    case 'update-personal':
      return { ...state, personalInfo: { ...state.personalInfo, [action.field]: action.value }, updatedAt }
    case 'update-summary':
      return { ...state, summary: action.value, updatedAt }
    case 'update-title':
      return { ...state, title: action.value, updatedAt }
    case 'toggle-section':
      return { ...state, sections: state.sections.map((section) => section.id === action.id ? { ...section, visible: !section.visible } : section), updatedAt }
    case 'move-section': {
      const index = state.sections.findIndex((section) => section.id === action.id)
      const nextIndex = index + action.direction
      if (index < 0 || nextIndex < 0 || nextIndex >= state.sections.length) return state
      const sections = [...state.sections]
      ;[sections[index], sections[nextIndex]] = [sections[nextIndex], sections[index]]
      return { ...state, sections, updatedAt }
    }
    case 'reorder-sections': {
      const from = state.sections.findIndex((section) => section.id === action.activeId)
      const to = state.sections.findIndex((section) => section.id === action.overId)
      if (from < 0 || to < 0 || from === to) return state
      const sections = [...state.sections]
      const [moved] = sections.splice(from, 1)
      sections.splice(to, 0, moved)
      return { ...state, sections, updatedAt }
    }
    case 'set-accent':
      return { ...state, design: { ...state.design, accent: action.value }, updatedAt }
    case 'set-template':
      return { ...state, design: { ...state.design, template: action.value }, updatedAt }
    case 'update-design':
      return { ...state, design: { ...state.design, [action.field]: action.value } as ResumeData['design'], updatedAt }
    case 'add-item': {
      const itemMap: Record<typeof action.collection, Experience | Education | Skill | Language | Project | Certification> = {
        experience: { id: crypto.randomUUID(), role: '', company: '', location: '', startDate: '', endDate: '', current: false, description: '' },
        education: { id: crypto.randomUUID(), degree: '', institution: '', location: '', startDate: '', endDate: '', current: false, description: '' },
        skills: { id: crypto.randomUUID(), name: '', level: 'Intermedio' },
        languages: { id: crypto.randomUUID(), name: '', level: 'B2' },
        projects: { id: crypto.randomUUID(), name: '', description: '', technologies: '', github: '', demo: '', date: '', role: '' },
        certifications: { id: crypto.randomUUID(), name: '', institution: '', date: '', credentialId: '', url: '' },
      }
      return { ...state, [action.collection]: [...state[action.collection], itemMap[action.collection]], updatedAt } as ResumeData
    }
    case 'remove-item':
      return { ...state, [action.collection]: state[action.collection].filter((item) => item.id !== action.id), updatedAt } as ResumeData
    case 'duplicate-item': {
      const item = state[action.collection].find((entry) => entry.id === action.id)
      if (!item) return state
      return { ...state, [action.collection]: [...state[action.collection], { ...item, id: crypto.randomUUID() }], updatedAt } as ResumeData
    }
    case 'reorder-items': {
      const items = [...state[action.collection]]
      const from = items.findIndex((item) => item.id === action.activeId)
      const to = items.findIndex((item) => item.id === action.overId)
      if (from < 0 || to < 0 || from === to) return state
      const [moved] = items.splice(from, 1)
      items.splice(to, 0, moved)
      return { ...state, [action.collection]: items, updatedAt } as ResumeData
    }
    case 'update-item':
      return { ...state, [action.collection]: state[action.collection].map((item) => item.id === action.id ? { ...item, [action.field]: action.value } : item), updatedAt } as ResumeData
    default:
      return state
  }
}

function loadResume(): ResumeData {
  try {
    const stored = localStorage.getItem(storageKey)
    if (!stored) return initialResume
    const parsed = JSON.parse(stored) as Partial<ResumeData>
    return {
      ...initialResume,
      ...parsed,
      design: { ...initialResume.design, ...parsed.design },
      experience: parsed.experience ?? initialResume.experience,
      education: parsed.education ?? initialResume.education,
      skills: parsed.skills ?? initialResume.skills,
      languages: parsed.languages ?? initialResume.languages,
      projects: parsed.projects ?? initialResume.projects,
      certifications: parsed.certifications ?? initialResume.certifications,
    }
  } catch {
    return initialResume
  }
}

function loadDocuments(): ResumeData[] {
  try {
    const storedDocuments = localStorage.getItem(documentsKey)
    if (storedDocuments) return JSON.parse(storedDocuments) as ResumeData[]
    return [loadResume()]
  } catch {
    return [initialResume]
  }
}

function withActiveDocument(documents: ResumeData[], resume: ResumeData) {
  return documents.some((document) => document.id === resume.id) ? documents.map((document) => document.id === resume.id ? resume : document) : [...documents, resume]
}

function storeReducer(state: StoreState, action: Action): StoreState {
  if (action.type === 'undo') {
    const previous = state.past.at(-1)
    if (!previous) return state
    return { ...state, resume: previous, past: state.past.slice(0, -1), future: [state.resume, ...state.future], documents: withActiveDocument(state.documents, previous) }
  }
  if (action.type === 'redo') {
    const next = state.future[0]
    if (!next) return state
    return { ...state, resume: next, past: [...state.past, state.resume], future: state.future.slice(1), documents: withActiveDocument(state.documents, next) }
  }
  if (action.type === 'create-resume') {
    const resume = { ...initialResume, id: crypto.randomUUID(), title: 'Nuevo CV', updatedAt: new Date().toISOString() }
    return { resume, past: [], future: [], documents: [...state.documents, resume] }
  }
  if (action.type === 'duplicate-resume') {
    const resume = { ...state.resume, id: crypto.randomUUID(), title: `${state.resume.title} - copia`, updatedAt: new Date().toISOString() }
    return { resume, past: [], future: [], documents: [...state.documents, resume] }
  }
  if (action.type === 'delete-resume') {
    const documents = state.documents.filter((document) => document.id !== action.id)
    const next = action.id === state.resume.id ? documents[0] ?? { ...initialResume, id: crypto.randomUUID() } : state.resume
    return { resume: next, past: [], future: [], documents: documents.length ? documents : [next] }
  }
  if (action.type === 'switch-resume') {
    const next = state.documents.find((document) => document.id === action.id)
    return next ? { ...state, resume: next, past: [], future: [] } : state
  }
  if (action.type === 'rename-resume') {
    const documents = state.documents.map((document) => document.id === action.id ? { ...document, title: action.title, updatedAt: new Date().toISOString() } : document)
    const resume = documents.find((document) => document.id === state.resume.id) ?? state.resume
    return { ...state, resume, documents }
  }
  const nextResume = resumeReducer(state.resume, action)
  if (nextResume === state.resume) return state
  return { resume: nextResume, past: [...state.past, state.resume].slice(-50), future: [], documents: withActiveDocument(state.documents, nextResume) }
}

const ResumeContext = createContext<{ resume: ResumeData; documents: ResumeData[]; dispatch: Dispatch<Action>; canUndo: boolean; canRedo: boolean; saveStatus: 'saving' | 'saved' | 'error' } | null>(null)

export function ResumeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(storeReducer, undefined, () => { const documents = loadDocuments(); return { resume: documents[0], past: [], future: [], documents } })
  const [saveStatus, setSaveStatus] = useState<'saving' | 'saved' | 'error'>('saved')
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSaveStatus('saving')
      try {
        localStorage.setItem(storageKey, JSON.stringify(state.resume))
        localStorage.setItem(documentsKey, JSON.stringify(state.documents))
        setSaveStatus('saved')
      } catch {
        setSaveStatus('error')
      }
    }, 500)
    return () => window.clearTimeout(timeout)
  }, [state.resume, state.documents])
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'z') return
      event.preventDefault()
      dispatch({ type: event.shiftKey ? 'redo' : 'undo' })
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
  return <ResumeContext.Provider value={{ resume: state.resume, documents: state.documents, dispatch, canUndo: state.past.length > 0, canRedo: state.future.length > 0, saveStatus }}>{children}</ResumeContext.Provider>
}

export function useResume() {
  const context = useContext(ResumeContext)
  if (!context) throw new Error('useResume must be used inside ResumeProvider')
  return context
}
