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

function isCsvText(t) {
  return typeof t === 'string' && !t.includes('<!DOCTYPE') && !t.includes('<html')
}

function fetchWithTimeout(url, options = {}, ms = 8000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer))
}

async function fetchCsv(url) {
  // 1. Direct fetch
  try {
    const res = await fetchWithTimeout(url, { mode: 'cors' })
    if (res.ok) {
      const text = await res.text()
      if (isCsvText(text)) return text
    }
  } catch { /* fall through */ }

  // 2. corsproxy.io
  try {
    const res = await fetchWithTimeout(`https://corsproxy.io/?url=${encodeURIComponent(url)}`)
    if (res.ok) {
      const text = await res.text()
      if (isCsvText(text)) return text
    }
  } catch { /* fall through */ }

  // 3. allorigins.win
  try {
    const res = await fetchWithTimeout(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`)
    if (res.ok) {
      const text = await res.text()
      if (isCsvText(text)) return text
    }
  } catch { /* fall through */ }

  throw new Error('No se pudo acceder a la hoja. Asegúrate de haberla publicado en Archivo → Compartir → Publicar en la web (formato CSV).')
}

function parseRow(row, i) {
  return {
    id: String(i),
    proyecto: (row['proyecto'] || row['project'] || '').toUpperCase(),
    fecha: parseDate(row['fecha'] || row['date'] || ''),
    titulo: row['titulo'] || row['title'] || '',
    copy: row['copy'] || row['descripcion'] || '',
    media: row['imagen/video'] || row['imagen'] || row['video'] || row['media'] || row['url'] || '',
    url_post: row['url_post'] || row['url post'] || row['urlpost'] || '',
    tipo: (row['tipo'] || row['type'] || '').toLowerCase().trim(),
    canal: row['canal'] || row['channel'] || '',
    estado: row['estado'] || row['status'] || '',
    promocionado: (row['promocionado'] || 'No').trim(),
    presupuesto: row['presupuesto'] || '',
  }
}

function safeParse(csv) {
  if (typeof csv !== 'string' || !csv.trim()) return { data: [] }
  try {
    return Papa.parse(String(csv), {
      header: true,
      skipEmptyLines: true,
      transformHeader: h => {
        try { return String(h == null ? '' : h).trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '') }
        catch { return String(h == null ? '' : h) }
      },
    })
  } catch {
    return { data: [] }
  }
}

export async function fetchSheetData(sheetUrl) {
  const url = buildCsvUrl(sheetUrl)
  const csv = await fetchCsv(url)
  const { data } = safeParse(csv)
  return data.map(parseRow).filter(p => p.proyecto && p.fecha)
}

export async function fetchRequestsData(sheetUrl) {
  const csv = await fetchCsv(sheetUrl)
  const { data } = safeParse(csv)
  return data.map((row, i) => ({
    id: `sheet-${i}`,
    proyecto: (row.proyecto || row.project || '').toUpperCase(),
    fecha: parseDate(row.fecha || row.date || '') || new Date(),
    titulo: row.titulo || row['titulo del post'] || row.title || '',
    info: row.info || row['informacion adicional'] || row.descripcion || '',
    contenido: row.contenido || row.content || row['link contenido'] || '',
    tipo: (row.tipo || row.type || 'imagen').toLowerCase().trim(),
    solicitante: row.solicitante || row.nombre || row.name || '',
    canal: row.canal || row.channel || '',
    estado: row.estado || row.status || 'Pendiente',
    promocionado: (row.promocionado || 'No').trim(),
    presupuesto: row.presupuesto || '',
  })).filter(r => r.proyecto)
}

export async function submitRequest(scriptUrl, payload) {
  // no-cors avoids CORS/redirect errors from Apps Script; response is opaque but the request lands
  await fetch(scriptUrl, {
    method: 'POST',
    mode: 'no-cors',
    body: JSON.stringify(payload),
  })
  return { ok: true }
}

export async function updateRequest(scriptUrl, rowIndex, data) {
  const res = await fetch(scriptUrl, {
    method: 'POST',
    body: JSON.stringify({ action: 'update', rowIndex, data }),
  })
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json()
}

export async function deleteRequest(scriptUrl, rowIndex) {
  const res = await fetch(scriptUrl, {
    method: 'POST',
    body: JSON.stringify({ action: 'delete', rowIndex }),
  })
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json()
}
