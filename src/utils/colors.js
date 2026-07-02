// Fixed, maximally-distinct colors per project (hues ~40° apart on color wheel)
const PROJECT_COLORS = {
  'del poble fest':      { bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444' }, // red
  'el chandrio group':   { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B' }, // amber
  'gastro league':       { bg: '#DCFCE7', text: '#166534', dot: '#22C55E' }, // green
  'globaly live':        { bg: '#DBEAFE', text: '#1E40AF', dot: '#3B82F6' }, // blue
  'la cruz de celia':    { bg: '#F3E8FF', text: '#7E22CE', dot: '#A855F7' }, // purple
  'plaza el chandrio':   { bg: '#FFEDD5', text: '#9A3412', dot: '#F97316' }, // orange
  'prevenidos y accion': { bg: '#E0F2FE', text: '#0C4A6E', dot: '#0EA5E9' }, // sky
  'teatro alicante':     { bg: '#FCE7F3', text: '#9D174D', dot: '#EC4899' }, // pink
  'teatro sevilla':      { bg: '#CCFBF1', text: '#134E4A', dot: '#14B8A6' }, // teal
}

const FALLBACK_PALETTE = [
  { bg: '#F1F5F9', text: '#334155', dot: '#64748B' },
  { bg: '#F0FDF4', text: '#14532D', dot: '#16A34A' },
  { bg: '#EFF6FF', text: '#1E3A8A', dot: '#2563EB' },
  { bg: '#FDF4FF', text: '#581C87', dot: '#9333EA' },
  { bg: '#FFF7ED', text: '#7C2D12', dot: '#EA580C' },
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
