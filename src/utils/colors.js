const PROJECT_COLORS = {
  'candela alicante':       { bg: '#FEE2E2', text: '#991B1B', dot: '#DC2626' }, // rojo
  'club garrison alicante': { bg: '#EFF6FF', text: '#1E3A8A', dot: '#1D4ED8' }, // azul royal (saturado)
  'club temeraria':         { bg: '#FDF4FF', text: '#86198F', dot: '#D946EF' }, // fucsia vivo (≠ violeta)
  'del poble fest':         { bg: '#FFF7ED', text: '#9A3412', dot: '#EA580C' }, // naranja
  'el chandrio group':      { bg: '#FFFBEB', text: '#78350F', dot: '#B45309' }, // ámbar oscuro (≠ amarillo)
  'gastro league':          { bg: '#F0FDF4', text: '#14532D', dot: '#16A34A' }, // verde bosque
  'globaly live':           { bg: '#F0F9FF', text: '#0369A1', dot: '#0EA5E9' }, // azul cielo (≠ royal y ≠ índigo)
  'la cruz de celia':       { bg: '#F5F3FF', text: '#4C1D95', dot: '#9333EA' }, // violeta/púrpura
  'martinica bar':          { bg: '#ECFEFF', text: '#155E75', dot: '#06B6D4' }, // cian brillante
  'plaza el chandrio':      { bg: '#FEFCE8', text: '#713F12', dot: '#CA8A04' }, // amarillo (más oscuro, ≠ ámbar)
  'prevenidos y accion':    { bg: '#F7FEE7', text: '#365314', dot: '#84CC16' }, // lima amarillo-verde
  'távora teatro abierto':  { bg: '#F0FDFA', text: '#134E4A', dot: '#0F766E' }, // teal muy oscuro (≠ cian)
  'teatro alicante':        { bg: '#FCE7F3', text: '#831843', dot: '#DB2777' }, // rosa oscuro
  'terraza duna':           { bg: '#EEF2FF', text: '#3730A3', dot: '#4F46E5' }, // índigo (≠ royal y ≠ cielo)
}

const FALLBACK_PALETTE = [
  { bg: '#FFF7ED', text: '#7C2D12', dot: '#C2410C' },
  { bg: '#F0F9FF', text: '#0C4A6E', dot: '#0369A1' },
  { bg: '#FAF5FF', text: '#581C87', dot: '#9333EA' },
  { bg: '#F0FDF4', text: '#14532D', dot: '#15803D' },
  { bg: '#FFF1F2', text: '#881337', dot: '#E11D48' },
]

function hashString(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash = hash & hash
  }
  return Math.abs(hash)
}

export function getProjectColor(projectName) {
  const key = (projectName || '').toLowerCase().trim()
  return PROJECT_COLORS[key] ?? FALLBACK_PALETTE[hashString(key) % FALLBACK_PALETTE.length]
}
