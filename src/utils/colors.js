const PROJECT_COLORS = {
  'candela alicante':       { bg: '#FFF1F2', text: '#9F1239', dot: '#F43F5E' }, // rose
  'club garrison alicante': { bg: '#EEF2FF', text: '#3730A3', dot: '#4F46E5' }, // indigo
  'club temeraria':         { bg: '#FEE2E2', text: '#991B1B', dot: '#DC2626' }, // red
  'del poble fest':         { bg: '#FFEDD5', text: '#9A3412', dot: '#EA580C' }, // orange
  'el chandrio group':      { bg: '#FEF3C7', text: '#92400E', dot: '#D97706' }, // amber
  'gastro league':          { bg: '#F0FDF4', text: '#14532D', dot: '#16A34A' }, // green
  'globaly live':           { bg: '#EFF6FF', text: '#1E40AF', dot: '#2563EB' }, // blue
  'la cruz de celia':       { bg: '#F5F3FF', text: '#4C1D95', dot: '#7C3AED' }, // violet
  'martinica bar':          { bg: '#ECFEFF', text: '#164E63', dot: '#06B6D4' }, // cyan
  'plaza el chandrio':      { bg: '#FEFCE8', text: '#713F12', dot: '#CA8A04' }, // yellow
  'prevenidos y accion':    { bg: '#F0FDFA', text: '#134E4A', dot: '#0D9488' }, // teal
  'távora teatro abierto':  { bg: '#F7FEE7', text: '#365314', dot: '#65A30D' }, // lime
  'teatro alicante':        { bg: '#FDF4FF', text: '#701A75', dot: '#C026D3' }, // fuchsia
  'terraza duna':           { bg: '#F1F5F9', text: '#1E293B', dot: '#475569' }, // slate
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
