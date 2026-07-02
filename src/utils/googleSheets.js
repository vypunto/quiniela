import Papa from 'papaparse'
import { parseDate } from './dateUtils'

function extractId(input) {
  const m = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
  return m ? m[1] : input.trim()
}

async function fetchCsv(url) {
  // Try direct first (works when hosted online)
  try {
    const res = await fetch(url, { mode: 'cors' })
    if (res.ok) {
      const text = await res.text()
      if (!text.includes('<!DOCTYPE') && !text.includes('<html')) return text
    }
  } catch {
    // Blocked by CORS (happens when opening from file://) — fall through to proxy
  }

  // Fall back to CORS proxy (works when opening from local file)
  const proxy = `https://corsproxy.io/?url=${encodeURIComponent(url)}`
  const res = await fetch(proxy)
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('La hoja no está publicada. En Google Sheets ve a Archivo → Compartir → Publicar en la web, elige la Hoja 1 en formato CSV y pulsa Publicar.')
    }
    throw new Error(`Error ${res.status}: No se pudo acceder a la hoja. Asegúrate de haberla publicado en la web.`)
  }
  const text = await res.text()
  if (text.includes('<!DOCTYPE') || text.includes('<html')) {
    throw new Error('La hoja no está publicada. En Google Sheets ve a Archivo → Compartir → Publicar en la web, elige la Hoja 1 en formato CSV y pulsa Publicar.')
  }
  return text
}

function parseCsv(csv) {
  const { data } = Papa.parse(csv, {
    header: true,
    skipEmptyLines: true,
    transformHeader: h => h.trim().toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, ''), // strip accents for matching
  })
  return data
}

export async function fetchSheetData(spreadsheetId) {
  const id = extractId(spreadsheetId)
  const url = `https://docs.google.com/spreadsheets/d/${id}/pub?output=csv&gid=0`

  const csv = await fetchCsv(url)
  const data = parseCsv(csv)

  return data
    .map((row, i) => ({
      id: String(i),
      proyecto: row['proyecto'] || row['project'] || '',
      fecha: parseDate(row['fecha'] || row['date'] || ''),
      titulo: row['titulo'] || row['title'] || '',
      copy: row['copy'] || row['descripcion'] || '',
      media: row['imagen/video'] || row['imagen'] || row['video'] || row['media'] || row['url'] || '',
    }))
    .filter(p => p.proyecto && p.fecha)
}
