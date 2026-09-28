import html2pdf from 'html2pdf.js'

function safeFilename(title: string) {
  return `${title.trim().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'cv'}.pdf`
}

export async function exportResumePdf(elementId: string, title: string) {
  const source = document.getElementById(elementId)
  if (!source) throw new Error('No se encontró la preview del CV')
  await document.fonts.ready
  const clone = source.cloneNode(true) as HTMLElement
  clone.removeAttribute('style')
  clone.style.width = '210mm'
  clone.style.transform = 'none'
  clone.style.display = 'grid'
  clone.style.gap = '0'
  clone.style.margin = '0'
  clone.querySelectorAll<HTMLElement>('.resume-paper').forEach((page) => {
    page.style.width = '210mm'
    page.style.height = '297mm'
    page.style.minHeight = '297mm'
    page.style.aspectRatio = 'auto'
    page.style.margin = '0'
    page.style.filter = 'none'
    page.style.pageBreakAfter = 'always'
    page.style.breakAfter = 'page'
  })
  clone.querySelectorAll<HTMLElement>('.paper-page-number').forEach((node) => { node.remove() })
  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.left = '-100000px'
  container.style.top = '0'
  container.style.background = '#fff'
  container.appendChild(clone)
  document.body.appendChild(container)
  try {
    await html2pdf().set({
      margin: 0,
      filename: safeFilename(title),
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'] },
    } as never).from(clone).save()
  } finally {
    container.remove()
  }
}
