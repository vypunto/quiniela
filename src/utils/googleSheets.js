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

function fetchWithTimeout(url, options = {}, ms = 12000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer))
}

async function fetchCsv(url, bustCache = false) {
  // Cache-busting: append timestamp so Google Sheets doesn't serve stale CSV
  const u = bustCache ? `${url}${url.includes('?') ? '&' : '?'}_t=${Date.now()}` : url
  const proxies = [
    u => fetchWithTimeout(u, { mode: 'cors' }),
    u => fetchWithTimeout(`https://corsproxy.io/?url=${encodeURIComponent(u)}`),
    u => fetchWithTimeout(`https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`),
    u => fetchWithTimeout(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`),
    u => fetchWithTimeout(`https://thingproxy.freeboard.io/fetch/${encodeURIComponent(u)}`),
  ]
  for (const proxy of proxies) {
    try {
      const res = await proxy(u)
      if (res.ok) {
        const text = await res.text()
        if (isCsvText(text)) return text
      }
    } catch { /* try next */ }
  }
  throw new Error('No se pudo acceder a la hoja. Asegúrate de haberla publicado en Archivo → Compartir → Publicar en la web (formato CSV).')
}

function normalizeHeader(h) {
  try {
    const s = h.trim().toLowerCase()
    return s
      .replace(/[áàäâã]/g, 'a')
      .replace(/[éèëê]/g, 'e')
      .replace(/[íìïî]/g, 'i')
      .replace(/[óòöôõ]/g, 'o')
      .replace(/[úùüû]/g, 'u')
      .replace(/[ñ]/g, 'n')
  } catch { return h.trim() }
}

function parseCsvLine(line) {
  const fields = []
  let i = 0
  while (i <= line.length) {
    if (line[i] === '"') {
      i++
      let field = ''
      while (i < line.length) {
        if (line[i] === '"' && line[i + 1] === '"') { field += '"'; i += 2 }
        else if (line[i] === '"') { i++; break }
        else { field += line[i++] }
      }
      fields.push(field)
      if (line[i] === ',') i++
    } else {
      const end = line.indexOf(',', i)
      if (end === -1) { fields.push(line.slice(i)); break }
      fields.push(line.slice(i, end))
      i = end + 1
    }
  }
  return fields
}

function safeParse(csv) {
  if (typeof csv !== 'string' || !csv.trim()) return { data: [] }
  try {
    const str = String(csv).replace(/^﻿/, '')
    const lines = str.split(/\r?\n/)
    const headers = parseCsvLine(lines[0]).map(normalizeHeader)
    const rows = lines.slice(1).filter(l => l.trim())
    const data = rows.map(row => {
      const vals = parseCsvLine(row)
      const obj = {}
      headers.forEach((h, i) => { obj[h] = vals[i] || '' })
      return obj
    })
    return { data }
  } catch {
    return { data: [] }
  }
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

export async function fetchSheetData(sheetUrl, bustCache = false) {
  const url = buildCsvUrl(sheetUrl)
  const csv = await fetchCsv(url, bustCache)
  const { data } = safeParse(csv)
  return data.map(parseRow).filter(p => p.proyecto && p.fecha)
}

export async function fetchRequestsData(sheetUrl, bustCache = false) {
  const csv = await fetchCsv(sheetUrl, bustCache)
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
    prioridad: row.prioridad || row.priority || 'Media',
  })).filter(r => r.proyecto)
}

export async function updatePublication(scriptUrl, rowIndex, data) {
  // no-cors avoids CORS/redirect errors from Apps Script (same pattern as submitRequest)
  await fetch(scriptUrl, {
    method: 'POST',
    mode: 'no-cors',
    body: JSON.stringify({ action: 'updatePublication', rowIndex, data }),
  })
  return { ok: true }
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
