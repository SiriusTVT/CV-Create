export type ImportStatus = 'ready' | 'pending' | 'error'

export type ImportResult = {
  status: ImportStatus
  message: string
  fileName: string
}

export async function parseResumeFile(file: File): Promise<ImportResult> {
  const isSupported = file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || /\.(pdf|docx?)$/i.test(file.name)
  if (!isSupported) return { status: 'error', message: 'Selecciona un archivo PDF o DOCX.', fileName: file.name }
  return { status: 'pending', message: 'El archivo está listo. La extracción hacia ResumeData requiere conectar un parser backend.', fileName: file.name }
}
