const PALETTE = [
  { bg: '#FFD6EC', text: '#B0005A', dot: '#FF0080' },  // neon pink
  { bg: '#FFFFB8', text: '#7A6600', dot: '#FFE000' },  // neon yellow
  { bg: '#B8FFD8', text: '#006633', dot: '#00EE55' },  // neon green
  { bg: '#CCE5FF', text: '#003399', dot: '#0055FF' },  // neon blue
  { bg: '#DDB8FF', text: '#5500AA', dot: '#9900FF' },  // neon purple
  { bg: '#FFE4CC', text: '#B34400', dot: '#FF6600' },  // neon orange
  { bg: '#B8FFFF', text: '#006666', dot: '#00CCCC' },  // neon cyan
  { bg: '#FFB8B8', text: '#AA0000', dot: '#FF2200' },  // neon red
  { bg: '#E0FFB8', text: '#3A6600', dot: '#88FF00' },  // neon lime
  { bg: '#FFB8E8', text: '#880055', dot: '#FF00AA' },  // neon magenta
  { bg: '#B8F0FF', text: '#004466', dot: '#00AAFF' },  // neon sky
  { bg: '#FFE8B8', text: '#885500', dot: '#FF9900' },  // neon amber
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
  return PALETTE[hashString(key) % PALETTE.length]
}
