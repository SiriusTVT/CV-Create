import type { ChangeEvent } from 'react'
import { MapPin, Mail, Phone, UserRound, Link as LinkIcon } from 'lucide-react'
import { useResume } from '../resumeStore'
import type { PersonalInfo } from '../types'

const fields: Array<{ key: keyof PersonalInfo; label: string; placeholder: string; icon: typeof Mail }> = [
  { key: 'firstName', label: 'Nombre', placeholder: 'Tu nombre', icon: Mail },
  { key: 'lastName', label: 'Apellido', placeholder: 'Tu apellido', icon: Mail },
  { key: 'headline', label: 'Título profesional', placeholder: 'Ej. Software Developer', icon: LinkIcon },
  { key: 'email', label: 'Email', placeholder: 'nombre@correo.com', icon: Mail },
  { key: 'phone', label: 'Teléfono', placeholder: '+57 300 000 0000', icon: Phone },
  { key: 'city', label: 'Ciudad', placeholder: 'Cali', icon: MapPin },
  { key: 'country', label: 'País', placeholder: 'Colombia', icon: MapPin },
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'linkedin.com/in/tu-nombre', icon: LinkIcon },
  { key: 'website', label: 'Website', placeholder: 'tusitio.dev', icon: LinkIcon },
]

export function PersonalInfoEditor() {
  const { resume, dispatch } = useResume()
  const handleChange = (event: ChangeEvent<HTMLInputElement>, key: keyof PersonalInfo) => dispatch({ type: 'update-personal', field: key, value: event.target.value })
  return <section className="editor-card">
    <div className="card-heading"><div><span className="eyebrow">01 / Identidad</span><h2>Información personal</h2></div><span className="completion">4 de 4</span></div>
    <p className="card-description">Estos datos aparecen en la cabecera de tu CV. Puedes editarlos en cualquier momento.</p>
    <div className="photo-row"><div className="avatar-placeholder" aria-label="Sin foto de perfil"><UserRound size={22} /></div><div><strong>Foto de perfil</strong><p>Opcional. Recomendamos una imagen profesional y luminosa.</p></div><button className="text-button">Añadir foto</button></div>
    <div className="form-grid">{fields.map(({ key, label, placeholder, icon: Icon }) => <label className={key === 'headline' || key === 'email' ? 'field full' : 'field'} key={key}><span>{label}</span><div className="input-wrap"><Icon size={15} /><input value={resume.personalInfo[key]} onChange={(event) => handleChange(event, key)} placeholder={placeholder} /></div></label>)}</div>
  </section>
}
