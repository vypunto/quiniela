const MONTHS_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
const MONTHS_ES_UPPER = ['ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE']
const MONTHS_ES_SHORT = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC']
const DAYS_ES = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado']

export function parseDate(str) {
  if (!str) return null
  const s = str.trim()

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, d] = s.split('-').map(Number)
    return new Date(y, m - 1, d)
  }
  // DD/MM/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {
    const [d, m, y] = s.split('/').map(Number)
    return new Date(y, m - 1, d)
  }
  // DD-MM-YYYY
  if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(s)) {
    const [d, m, y] = s.split('-').map(Number)
    return new Date(y, m - 1, d)
  }
  // MM/DD/YYYY (Excel default)
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {
    const parts = s.split('/')
    return new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]))
  }

  const d = new Date(s)
  return isNaN(d.getTime()) ? null : d
}

export function sameDay(a, b) {
  if (!a || !b) return false
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

export function formatDate(date) {
  if (!date) return ''
  return `${DAYS_ES[date.getDay()]} ${date.getDate()} de ${MONTHS_ES[date.getMonth()]} de ${date.getFullYear()}`
}

export function formatShortDate(date) {
  if (!date) return ''
  return `${date.getDate()} ${MONTHS_ES[date.getMonth()]}`
}

export { MONTHS_ES, MONTHS_ES_UPPER, MONTHS_ES_SHORT, DAYS_ES }
