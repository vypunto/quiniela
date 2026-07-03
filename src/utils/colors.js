const PROJECT_COLORS = {
  'candela alicante':       { bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444' }, // rojo vivo
  'club garrison alicante': { bg: '#DBEAFE', text: '#1E3A8A', dot: '#1E3A8A' }, // azul marino oscuro
  'club temeraria':         { bg: '#FDF4FF', text: '#701A75', dot: '#C026D3' }, // fucsia/magenta
  'del poble fest':         { bg: '#FFEDD5', text: '#9A3412', dot: '#EA580C' }, // naranja
  'el chandrio group':      { bg: '#FEF3C7', text: '#78350F', dot: '#92400E' }, // marrón/chocolate
  'gastro league':          { bg: '#F0FDF4', text: '#14532D', dot: '#16A34A' }, // verde bosque
  'globaly live':           { bg: '#EFF6FF', text: '#1E40AF', dot: '#2563EB' }, // azul eléctrico
  'la cruz de celia':       { bg: '#F5F3FF', text: '#4C1D95', dot: '#9333EA' }, // violeta
  'martinica bar':          { bg: '#ECFEFF', text: '#164E63', dot: '#06B6D4' }, // cian vivido
  'plaza el chandrio':      { bg: '#FEFCE8', text: '#713F12', dot: '#EAB308' }, // amarillo vivo
  'prevenidos y accion':    { bg: '#F7FEE7', text: '#365314', dot: '#65A30D' }, // lima
  'távora teatro abierto':  { bg: '#F0FDFA', text: '#134E4A', dot: '#0D9488' }, // teal
  'teatro alicante':        { bg: '#FCE7F3', text: '#831843', dot: '#BE185D' }, // rosa oscuro
  'terraza duna':           { bg: '#EEF2FF', text: '#3730A3', dot: '#4338CA' }, // índigo
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
