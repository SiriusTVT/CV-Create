export type SectionId =
  | 'personal'
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'languages'
  | 'projects'
  | 'certifications'

export type TemplateId = 'minimal' | 'professional' | 'modern' | 'executive' | 'creative'
export type FontId = 'Inter' | 'Georgia' | 'Trebuchet MS'
export type TitleStyle = 'uppercase' | 'sentence' | 'line'
export type DateStyle = 'inline' | 'muted'

export type ResumeSection = {
  id: SectionId
  label: string
  visible: boolean
}

export type PersonalInfo = {
  firstName: string
  lastName: string
  headline: string
  email: string
  phone: string
  city: string
  country: string
  linkedin: string
  website: string
}

export type Experience = {
  id: string
  role: string
  company: string
  location: string
  startDate: string
  endDate: string
  current: boolean
  description: string
}

export type Education = {
  id: string
  degree: string
  institution: string
  location: string
  startDate: string
  endDate: string
  current: boolean
  description: string
}

export type Skill = { id: string; name: string; level: string }
export type Language = { id: string; name: string; level: string }

export type Project = {
  id: string
  name: string
  description: string
  technologies: string
  github: string
  demo: string
  date: string
  role: string
}

export type Certification = {
  id: string
  name: string
  institution: string
  date: string
  credentialId: string
  url: string
}

export type ResumeData = {
  id: string
  title: string
  personalInfo: PersonalInfo
  summary: string
  experience: Experience[]
  education: Education[]
  skills: Skill[]
  languages: Language[]
  projects: Project[]
  certifications: Certification[]
  sections: ResumeSection[]
  design: {
    accent: string
    secondary: string
    font: FontId
    template: TemplateId
    fontSize: number
    spacing: number
    lineHeight: number
    margins: number
    columnWidth: number
    titleStyle: TitleStyle
    dateStyle: DateStyle
    showIcons: boolean
    showSkillLevels: boolean
  }
  updatedAt: string
}
