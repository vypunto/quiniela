import Papa from 'papaparse'
import { parseDate } from './dateUtils'

function buildCsvUrl(input) {
  const s = input.trim()
  if (s.includes('/pub') && s.includes('output=csv')) return s
  const pubMatch = s.match(/\/spreadsheets\/d\/e\/([a-zA-Z0-9-_]+)/)
  if (pubMatch) return `https://docs.google.com/spreadsheets/d/e/${pubMatch[1]}/pub?output=csv&gid=0`
  const idMatch = s.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
  const id = idMatch ? idMatch[1] : s
  return `https://docs.google.com/spreadsheets/d/${id}/pub?output=csv&gid=0`
}

async function fetchCsv(url) {
  try {
    const res = await fetch(url, { mode: 'cors' })
    if (res.ok) {
      const text = await res.text()
      if (!text.includes('<!DOCTYPE') && !text.includes('<html')) return text
    }
  } catch { /* fall through to proxy */ }

  const proxy = `https://corsproxy.io/?url=${encodeURIComponent(url)}`
  const res = await fetch(proxy)
  if (!res.ok) {
    if (res.status === 404) throw new Error('La hoja no está publicada. Ve a Archivo → Compartir → Publicar en la web, elige Hoja 1 en formato CSV y pulsa Publicar.')
    throw new Error(`Error ${res.status}: No se pudo acceder a la hoja. Asegúrate de haberla publicado.`)
  }
  const text = await res.text()
  if (text.includes('<!DOCTYPE') || text.includes('<html')) {
    throw new Error('La hoja no está publicada. Ve a Archivo → Compartir → Publicar en la web.')
  }
  return text
}

function parseRow(row, i) {
  return {
    id: String(i),
    proyecto: row['proyecto'] || row['project'] || '',
    fecha: parseDate(row['fecha'] || row['date'] || ''),
    titulo: row['titulo'] || row['title'] || '',
    copy: row['copy'] || row['descripcion'] || '',
    media: row['imagen/video'] || row['imagen'] || row['video'] || row['media'] || row['url'] || '',
    tipo: (row['tipo'] || row['type'] || '').toLowerCase().trim(),
  }
}

export async function fetchSheetData(sheetUrl) {
  const url = buildCsvUrl(sheetUrl)
  const csv = await fetchCsv(url)
  const { data } = Papa.parse(csv, {
    header: true,
    skipEmptyLines: true,
    transformHeader: h => h.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''),
  })
  return data.map(parseRow).filter(p => p.proyecto && p.fecha)
}

export async function fetchRequestsData(sheetUrl) {
  const csv = await fetchCsv(sheetUrl)
  const { data } = Papa.parse(csv, {
    header: true,
    skipEmptyLines: true,
    transformHeader: h => h.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''),
  })
  return data.map((row, i) => ({
    id: `sheet-${i}`,
    proyecto: row.proyecto || row.project || '',
    fecha: parseDate(row.fecha || row.date || '') || new Date(),
    titulo: row.titulo || row['titulo del post'] || row.title || '',
    info: row.info || row['informacion adicional'] || row.descripcion || '',
    tipo: (row.tipo || row.type || 'imagen').toLowerCase().trim(),
    solicitante: row.solicitante || row.nombre || row.name || '',
    canal: row.canal || row.channel || '',
    estado: row.estado || row.status || 'Pendiente',
  })).filter(r => r.proyecto)
}

export async function submitRequest(scriptUrl, payload) {
  const res = await fetch(scriptUrl, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json()
}
