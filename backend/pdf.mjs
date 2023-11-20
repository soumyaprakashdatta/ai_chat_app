import fs from 'fs/promises'
import { getDocument } from 'pdfjs-dist'

function createTokens(path) {}

// todo: need to check how to get paragraph markers
async function loadPdfPages(path) {
  const pdfData = await fs.readFile(path)

  const pdf = await getDocument({
    data: new Uint8Array(
      pdfData.buffer,
      pdfData.byteOffset,
      pdfData.byteLength
    ),
    useSystemFonts: true,
  }).promise

  const pageTexts = []

  for (let i = 0; i < pdf.numPages; i++) {
    const page = await pdf.getPage(i + 1)
    const pageContent = await page.getTextContent({
      includeMarkedContent: true,
      disableNormalization: false,
    })

    pageTexts.push({
      pageNumber: i + 1,
      text: pageContent.items
        .filter((item) => {
          return item.str != null
        })
        .map((item) => item.str)
        .join(' ')
        .replace(/\s+/g, ' '),
    })
  }

  return pageTexts
}

export { loadPdfPages }
