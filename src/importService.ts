export type ImportStatus = 'ready' | 'pending' | 'error'

export type ImportResult = {
  status: ImportStatus
  message: string
  fileName: string
  data?: {
    firstName?: string
    lastName?: string
    headline?: string
    email?: string
    summary?: string
  }
}

export async function parseResumeFile(file: File): Promise<ImportResult> {
  const isSupported = file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || /\.(pdf|docx?)$/i.test(file.name)
  if (!isSupported) return { status: 'error', message: 'Selecciona un archivo PDF o DOCX.', fileName: file.name }
  return { status: 'pending', message: 'El archivo está listo. La extracción hacia ResumeData requiere conectar un parser backend.', fileName: file.name }
}

function parseCsvRow(content: string) {
  const values = content.trim().split(/\r?\n/).map((line) => line.match(/("(?:[^"]|"")*"|[^,]*)/g)?.filter((value) => value !== undefined).map((value) => value.replace(/^"|"$/g, '').replace(/""/g, '')) ?? [])
  const headers = values.shift() ?? []
  const row = values[0] ?? []
  return Object.fromEntries(headers.map((header, index) => [header.trim().toLowerCase(), row[index]?.trim() ?? '']))
}

export async function parseLinkedInFile(file: File): Promise<ImportResult> {
  if (!/\.(csv|json)$/i.test(file.name)) return { status: 'error', message: 'Selecciona un archivo CSV o JSON exportado desde LinkedIn.', fileName: file.name }
  const content = await file.text()
  try {
    const raw = file.name.toLowerCase().endsWith('.json') ? JSON.parse(content) as Record<string, string> : parseCsvRow(content)
    const data = {
      firstName: raw['first name'] ?? raw['firstname'] ?? raw.firstName,
      lastName: raw['last name'] ?? raw['lastname'] ?? raw.lastName,
      headline: raw.headline ?? raw.headline,
      email: raw['email address'] ?? raw.email ?? raw.emailAddress,
      summary: raw.summary ?? raw.about,
    }
    const hasData = Object.values(data).some(Boolean)
    return hasData ? { status: 'ready', message: 'Datos de LinkedIn encontrados. Puedes incorporarlos al CV.', fileName: file.name, data } : { status: 'error', message: 'No se encontraron campos reconocibles en el archivo.', fileName: file.name }
  } catch {
    return { status: 'error', message: 'No se pudo leer el archivo de exportación.', fileName: file.name }
  }
}

export async function importLinkedInProfile(identifier: string): Promise<ImportResult> {
  const username = identifier.trim().replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, '').replace(/\/$/, '')
  if (!username) return { status: 'error', message: 'Escribe tu usuario o URL pública de LinkedIn.', fileName: '' }
  try {
    const response = await fetch(`/api/linkedin/profile?username=${encodeURIComponent(username)}`)
    if (response.status === 404) return { status: 'pending', message: 'El endpoint OAuth de LinkedIn aún no está conectado al backend.', fileName: username }
    if (!response.ok) return { status: 'error', message: `No se pudo obtener el perfil (HTTP ${response.status}).`, fileName: username }
    const payload = await response.json() as { data?: ImportResult['data'] }
    return payload.data ? { status: 'ready', message: 'Perfil de LinkedIn encontrado. Puedes incorporarlo al CV.', fileName: username, data: payload.data } : { status: 'error', message: 'La respuesta no contiene datos de perfil reconocibles.', fileName: username }
  } catch {
    return { status: 'pending', message: 'Configura el backend OAuth de LinkedIn para importar perfiles por usuario.', fileName: username }
  }
}
