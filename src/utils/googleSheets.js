import Papa from 'papaparse'
import { parseDate } from './dateUtils'

function extractId(input) {
  const m = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
  return m ? m[1] : input.trim()
}

export async function fetchSheetData(spreadsheetId) {
  const id = extractId(spreadsheetId)
  const url = `https://docs.google.com/spreadsheets/d/${id}/pub?output=csv&gid=0`

  const res = await fetch(url)
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      throw new Error('La hoja no está publicada. Ve a Archivo > Compartir > Publicar en la web y publícala como CSV.')
    }
    throw new Error(`Error ${res.status}: No se pudo acceder a la hoja de cálculo.`)
  }

  const csv = await res.text()

  if (csv.includes('<!DOCTYPE html') || csv.includes('<html')) {
    throw new Error('La hoja no está publicada correctamente. Ve a Archivo > Compartir > Publicar en la web.')
  }

  const { data, errors } = Papa.parse(csv, {
    header: true,
    skipEmptyLines: true,
    transformHeader: h => h.trim().toLowerCase(),
  })

  if (errors.length > 0 && data.length === 0) {
    throw new Error('No se pudo leer el CSV. Verifica el formato de la hoja.')
  }

  return data
    .map((row, i) => ({
      id: String(i),
      proyecto: row['proyecto'] || row['project'] || '',
      fecha: parseDate(row['fecha'] || row['date'] || ''),
      titulo: row['título'] || row['titulo'] || row['title'] || '',
      copy: row['copy'] || row['descripción'] || row['descripcion'] || '',
      media: row['imagen/video'] || row['imagen'] || row['video'] || row['media'] || row['url'] || '',
    }))
    .filter(p => p.proyecto && p.fecha)
}
