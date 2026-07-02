const PALETTE = [
  { bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444' },
  { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B' },
  { bg: '#D1FAE5', text: '#065F46', dot: '#10B981' },
  { bg: '#DBEAFE', text: '#1E40AF', dot: '#3B82F6' },
  { bg: '#EDE9FE', text: '#5B21B6', dot: '#8B5CF6' },
  { bg: '#FCE7F3', text: '#9D174D', dot: '#EC4899' },
  { bg: '#CCFBF1', text: '#134E4A', dot: '#14B8A6' },
  { bg: '#E0E7FF', text: '#3730A3', dot: '#6366F1' },
  { bg: '#FED7AA', text: '#7C2D12', dot: '#F97316' },
  { bg: '#D1FAE5', text: '#14532D', dot: '#22C55E' },
  { bg: '#FDF4FF', text: '#701A75', dot: '#C026D3' },
  { bg: '#F0FDF4', text: '#052E16', dot: '#16A34A' },
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
  const index = hashString(key) % PALETTE.length
  return PALETTE[index]
}
