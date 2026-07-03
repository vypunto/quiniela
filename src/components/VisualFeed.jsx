import { useState, useEffect, useRef } from 'react'
import { getProjectColor } from '../utils/colors'
import { formatDate } from '../utils/dateUtils'
import { TypeIcon } from './Icons'

const INSTAGRAM = {
  'DEL POBLE FEST':        'delpoblefest',
  'GASTRO LEAGUE':         'gastro_league',
  'PREVENIDOS Y ACCION':   'prevenidosyaccion',
  'LA CRUZ DE CELIA':      'lacruzdeceliaoficial',
  'EL CHANDRIO GROUP':     'elchandriogroup',
  'GLOBALY LIVE':          'globalylive',
  'CLUB GARRISON ALICANTE':'clubgarrisonalicante',
  'MARTINICA BAR':         'martinicabar',
  'PLAZA EL CHANDRIO':     'plazadelchandrio',
  'TERRAZA DUNA':          'terrazaduna',
  'CANDELA ALICANTE':      'candelaalicante',
  'TÁVORA TEATRO ABIERTO': 'tavorateatroabierto',
  'CLUB TEMERARIA':        'clubtemeraria',
}

function igUrl(proyecto) {
  const h = INSTAGRAM[proyecto]
  return h ? `https://www.instagram.com/${h}/` : null
}

function parseMediaList(media) {
  if (!media) return []
  return media.split(',').map(s => s.trim()).filter(Boolean)
}

function getThumb(url) {
  if (!url) return null
  const u = url.split(',')[0].trim()
  const yt = u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?]+)/)
  if (yt) return `https://img.youtube.com/vi/${yt[1]}/mqdefault.jpg`
  if (u.includes('unsplash.com')) return u
  if (/\.(jpg|jpeg|png|gif|webp|avif)$/i.test(u)) return u
  const driveFile = u.match(/drive\.google\.com\/file\/d\/([^/?]+)/)
  if (driveFile) return `https://drive.google.com/thumbnail?id=${driveFile[1]}&sz=w400`
  return null
}

function isVideoMedia(url) {
  if (!url) return false
  const u = url.split(',')[0].trim()
  return u.includes('youtube.com') || u.includes('youtu.be') || /\.(mp4|mov|webm)$/i.test(u)
}

function SlideMedia({ url, color, tipo }) {
  const thumb = getThumb(url)
  const isVid = isVideoMedia(url)
  return (
    <div className="w-full h-full flex-shrink-0 relative" style={{ minWidth: '100%' }}>
      {thumb ? (
        <img src={thumb} alt="" className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none' }} />
      ) : (
        <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: color.bg }}>
          <TypeIcon tipo={tipo} size={32} color={color.dot} />
        </div>
      )}
      {isVid && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="white"><path d="M5 3l13 7-13 7V3z"/></svg>
          </div>
        </div>
      )}
    </div>
  )
}

function getInitials(name) {
  return name.split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function mockLikes(id) {
  let h = 0
  for (let i = 0; i < (id || '').length; i++) h = ((h << 5) - h + id.charCodeAt(i)) | 0
  return 1200 + Math.abs(h % 48000)
}

function relativeDate(fecha) {
  if (!fecha) return null
  const days = Math.round((new Date() - fecha) / 86400000)
  if (days < 0) return `en ${Math.abs(days)} días`
  if (days === 0) return 'hoy'
  if (days === 1) return 'hace 1 día'
  if (days < 30) return `hace ${days} días`
  if (days < 365) return `hace ${Math.floor(days / 30)} meses`
  return `hace ${Math.floor(days / 365)} años`
}

function tabMatch(pub, tab) {
  const t = (pub.tipo || '').toLowerCase()
  if (tab === 'reels') return t === 'reel'
  if (tab === 'stories') return t === 'historia'
  // posts: imagen + video + carrusel (everything except reel and historia)
  return t === 'imagen' || t === 'video' || t === 'carrusel' || t === '' || !pub.tipo
}

function Avatar({ name, size = 28 }) {
  const color = getProjectColor(name)
  return (
    <div
      className="rounded-full flex items-center justify-center font-black flex-shrink-0"
      style={{ width: size, height: size, backgroundColor: color.bg, color: color.dot, border: `1.5px solid ${color.dot}`, fontSize: size * 0.3 }}
    >
      {getInitials(name)}
    </div>
  )
}

function StatusBar() {
  return (
    <div
      className="absolute top-0 left-0 right-0 z-10 flex items-end justify-between px-5 pb-1"
      style={{ height: '54px', backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(4px)' }}
    >
      <span className="text-[11px] font-semibold text-black" style={{ paddingBottom: '2px' }}>9:41</span>
      <div className="flex items-center gap-1.5" style={{ paddingBottom: '2px' }}>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
          <rect x="0" y="8" width="3" height="4" rx="0.5" fill="#111"/><rect x="4.5" y="5" width="3" height="7" rx="0.5" fill="#111"/>
          <rect x="9" y="2" width="3" height="10" rx="0.5" fill="#111"/><rect x="13.5" y="0" width="2.5" height="12" rx="0.5" fill="#111"/>
        </svg>
        <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
          <path d="M7 8.5a1.2 1.2 0 1 1 0 2.4A1.2 1.2 0 0 1 7 8.5z" fill="#111"/>
          <path d="M3.5 6.5a4.95 4.95 0 0 1 7 0" stroke="#111" strokeWidth="1.2" strokeLinecap="round"/>
          <path d="M1 4a8.5 8.5 0 0 1 12 0" stroke="#111" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
        <svg width="23" height="12" viewBox="0 0 23 12" fill="none">
          <rect x="0.5" y="0.5" width="19" height="11" rx="2.5" stroke="#111" strokeWidth="1"/>
          <rect x="2" y="2" width="14" height="8" rx="1.5" fill="#111"/>
          <path d="M21 4v4a2 2 0 0 0 0-4z" fill="#111"/>
        </svg>
      </div>
    </div>
  )
}

/* ── Instagram post view (inside phone) ── */
function InstaPostView({ pub, onBack, onOpenDetails }) {
  const color = getProjectColor(pub.proyecto)
  const mediaList = parseMediaList(pub.media)
  const isCarousel = mediaList.length > 1
  const likes = mockLikes(pub.id)
  const whenStr = relativeDate(pub.fecha)
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [slide, setSlide] = useState(0)
  const ig = igUrl(pub.proyecto)

  return (
    <div
      className="absolute inset-0 z-25 bg-white flex flex-col"
      style={{ animation: 'slideInRight 200ms cubic-bezier(0.16,1,0.3,1)' }}
    >
      <StatusBar />

      {/* IG post top bar */}
      <div className="flex items-center justify-between px-3 pt-1 flex-shrink-0" style={{ marginTop: '54px' }}>
        <button onClick={onBack} className="w-8 h-8 flex items-center justify-center">
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path d="M8 10L4 6l4-4" stroke="#111" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="text-[13px] font-black text-black">Publicaciones</span>
        <button className="w-8 h-8 flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="5" r="1.5" fill="#111"/>
            <circle cx="12" cy="12" r="1.5" fill="#111"/>
            <circle cx="12" cy="19" r="1.5" fill="#111"/>
          </svg>
        </button>
      </div>

      {/* Scrollable post content */}
      <div className="flex-1 overflow-y-auto">
        {/* Post header */}
        <div className="flex items-center gap-2.5 px-3 py-2.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px] flex-shrink-0"
            style={{ backgroundColor: color.bg, color: color.dot, border: `1.5px solid ${color.dot}` }}
          >
            {getInitials(pub.proyecto)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-black text-black truncate leading-tight">{pub.proyecto.toLowerCase()}</div>
            {pub.fecha && <div className="text-[9px] text-gray-400 leading-tight">{formatDate(pub.fecha)}</div>}
          </div>
          <button
            onClick={() => ig && window.open(ig, '_blank')}
            className="px-3 py-1 rounded-lg text-[10px] font-bold flex-shrink-0 transition-opacity duration-150 active:opacity-70"
            style={{ backgroundColor: color.dot, color: '#fff' }}
          >
            Seguir
          </button>
          <button className="w-6 h-6 flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="5" cy="12" r="1.5" fill="#111"/>
              <circle cx="12" cy="12" r="1.5" fill="#111"/>
              <circle cx="19" cy="12" r="1.5" fill="#111"/>
            </svg>
          </button>
        </div>

        {/* Media — 4:5 portrait */}
        <div className="w-full" style={{ aspectRatio: '4/5', backgroundColor: color.bg, position: 'relative', overflow: 'hidden' }}>
          {isCarousel ? (
            <>
              {/* Slides container */}
              <div
                className="flex h-full"
                style={{ transform: `translateX(-${slide * 100}%)`, transition: 'transform 280ms cubic-bezier(0.16,1,0.3,1)', width: `${mediaList.length * 100}%` }}
              >
                {mediaList.map((url, i) => (
                  <SlideMedia key={i} url={url} color={color} tipo={pub.tipo} />
                ))}
              </div>
              {/* Prev arrow */}
              {slide > 0 && (
                <button
                  onClick={() => setSlide(s => s - 1)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: 'rgba(255,255,255,0.88)' }}
                >
                  <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M7 2L4 5l3 3" stroke="#111" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              )}
              {/* Next arrow */}
              {slide < mediaList.length - 1 && (
                <button
                  onClick={() => setSlide(s => s + 1)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: 'rgba(255,255,255,0.88)' }}
                >
                  <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M3 2l3 3-3 3" stroke="#111" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              )}
              {/* Dots */}
              <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1">
                {mediaList.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSlide(i)}
                    className="rounded-full transition-all duration-200"
                    style={{ width: i === slide ? '14px' : '6px', height: '6px', backgroundColor: i === slide ? color.dot : 'rgba(255,255,255,0.6)' }}
                  />
                ))}
              </div>
              {/* Counter */}
              <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
                {slide + 1}/{mediaList.length}
              </div>
            </>
          ) : mediaList.length === 1 ? (
            <SlideMedia url={mediaList[0]} color={color} tipo={pub.tipo} />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <TypeIcon tipo={pub.tipo} size={32} color={color.dot} />
            </div>
          )}
        </div>

        {/* Action bar */}
        <div className="flex items-center px-3 py-2.5 gap-3">
          <button onClick={() => setLiked(l => !l)} className="transition-transform duration-100 active:scale-90">
            {liked ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#E1306C">
                <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.6">
                <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
              </svg>
            )}
          </button>
          <button>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
          <button>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
          <div className="flex-1" />
          <button onClick={() => setSaved(s => !s)} className="transition-transform duration-100 active:scale-90">
            <svg width="20" height="20" viewBox="0 0 24 24" fill={saved ? '#111' : 'none'} stroke="#111" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
        </div>

        {/* Likes */}
        <div className="px-3 pb-1">
          <span className="text-[11px] font-black text-black">{(liked ? likes + 1 : likes).toLocaleString('es-ES')} Me gusta</span>
        </div>

        {/* Caption */}
        {pub.copy && (
          <div className="px-3 pb-2">
            <span className="text-[11px] font-black text-black">{pub.proyecto.toLowerCase()} </span>
            <span className="text-[11px] text-black">{pub.copy}</span>
          </div>
        )}
        {pub.titulo && (
          <div className="px-3 pb-1">
            <span className="text-[11px] text-gray-500 italic">{pub.titulo}</span>
          </div>
        )}

        {/* Open full details */}
        <button
          onClick={onOpenDetails}
          className="mx-3 mb-2 w-[calc(100%-24px)] py-2 rounded-xl text-[11px] font-bold text-white transition-all duration-150 active:brightness-90"
          style={{ backgroundColor: color.dot }}
        >
          Ver ficha completa →
        </button>

        {/* Comments hint */}
        <div className="px-3 pb-1">
          <span className="text-[10px] text-gray-400">Ver los 24 comentarios</span>
        </div>

        {/* Date */}
        {whenStr && <div className="px-3 pb-3"><span className="text-[9px] text-gray-300 uppercase tracking-wide">{whenStr}</span></div>}

        {/* Add comment mock */}
        <div className="flex items-center gap-2 px-3 py-2 border-t border-gray-100">
          <div className="w-6 h-6 rounded-full flex-shrink-0" style={{ backgroundColor: color.bg }} />
          <span className="text-[10px] text-gray-300 flex-1">Añade un comentario…</span>
        </div>
      </div>

      {/* Home indicator */}
      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 rounded-full" style={{ width: '120px', height: '5px', backgroundColor: '#111', opacity: 0.18 }} />
    </div>
  )
}

/* ── Account switcher dropdown ── */
function AccountSwitcherDropdown({ projects, activeProject, countMap, onSelect, onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    const handle = e => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', handle)
    document.addEventListener('touchstart', handle)
    return () => { document.removeEventListener('mousedown', handle); document.removeEventListener('touchstart', handle) }
  }, [onClose])

  return (
    <div className="absolute inset-0 z-30" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}>
      <div
        ref={ref}
        className="absolute left-3 right-3"
        style={{
          top: '58px',
          backgroundColor: '#fff',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.22), 0 2px 8px rgba(0,0,0,0.12)',
          overflow: 'hidden',
          animation: 'accountDropIn 160ms cubic-bezier(0.16,1,0.3,1)',
          transformOrigin: 'top center',
        }}
      >
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.08em]">Cambiar cuenta</p>
        </div>
        <div className="py-1.5 max-h-[260px] overflow-y-auto">
          {projects.map(proj => {
            const isActive = proj === activeProject
            const color = getProjectColor(proj)
            return (
              <button
                key={proj}
                onClick={() => { onSelect(proj); onClose() }}
                className="w-full flex items-center gap-3 px-4 py-2.5 transition-all duration-100 active:bg-gray-50"
                style={{ backgroundColor: isActive ? color.bg : 'transparent' }}
              >
                <Avatar name={proj} size={36} />
                <div className="flex-1 min-w-0 text-left">
                  <div className="text-[12px] font-bold text-black truncate leading-tight">{proj}</div>
                  <div className="text-[10px] text-gray-400 leading-tight mt-0.5">{countMap[proj] ?? 0} publicaciones</div>
                </div>
                {isActive && (
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color.dot }}>
                    <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                      <path d="M1.5 5l2.5 2.5L8.5 2" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/* ── Corner type indicator (like Instagram) ── */
function CornerTypeIcon({ tipo }) {
  const t = (tipo || '').toLowerCase()
  const s = { filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))' }
  if (t === 'video') return (
    <svg width="15" height="15" viewBox="0 0 12 12" fill="white" style={s}>
      <path d="M3 1.5l7 4.5-7 4.5V1.5z"/>
    </svg>
  )
  if (t === 'reel') return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="white" style={s}>
      <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-9 12.5v-7l6 3.5-6 3.5z"/>
    </svg>
  )
  if (t === 'carrusel') return (
    <svg width="15" height="15" viewBox="0 0 18 18" fill="none" style={s}>
      <rect x="5" y="1" width="12" height="12" rx="2" fill="white" opacity="0.55"/>
      <rect x="1" y="5" width="12" height="12" rx="2" fill="white"/>
    </svg>
  )
  return null
}

/* ── Grid cell (4:5 portrait) ── */
function GridCell({ pub, onClick, isSelected }) {
  const thumb = getThumb(pub.media)
  const color = getProjectColor(pub.proyecto)
  const t = (pub.tipo || '').toLowerCase()

  return (
    <button
      onClick={() => onClick(pub)}
      className="relative overflow-hidden transition-all duration-150 focus:outline-none"
      style={{
        aspectRatio: '4/5',
        outline: isSelected ? `2.5px solid ${color.dot}` : 'none',
        outlineOffset: isSelected ? '-2.5px' : '0',
      }}
    >
      {thumb ? (
        <>
          <img src={thumb} alt="" className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }} />
          <div className="absolute inset-0 items-center justify-center hidden" style={{ backgroundColor: color.bg }}>
            <TypeIcon tipo={pub.tipo} size={16} color={color.dot} />
          </div>
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: color.bg }}>
          <TypeIcon tipo={pub.tipo} size={16} color={color.dot} />
        </div>
      )}
      {/* Corner type indicator */}
      {(t === 'video' || t === 'reel' || t === 'carrusel') && (
        <div className="absolute top-1.5 right-1.5 flex items-center justify-center">
          <CornerTypeIcon tipo={t} />
        </div>
      )}
      {isSelected && <div className="absolute inset-0 bg-black/10" />}
    </button>
  )
}

/* ── Tab icons ── */
const TAB_POSTS = 'posts'
const TAB_REELS = 'reels'
const TAB_STORIES = 'stories'

function GridTabIcon({ tab, active }) {
  const c = active ? '#111' : '#9CA3AF'
  if (tab === TAB_POSTS) return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="1" y="1" width="7" height="7" rx="1" fill={c}/>
      <rect x="10" y="1" width="7" height="7" rx="1" fill={c}/>
      <rect x="1" y="10" width="7" height="7" rx="1" fill={c}/>
      <rect x="10" y="10" width="7" height="7" rx="1" fill={c}/>
    </svg>
  )
  if (tab === TAB_REELS) return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="1" y="1" width="16" height="16" rx="2" stroke={c} strokeWidth="1.3"/>
      <path d="M7 6l6 3-6 3V6z" fill={c}/>
    </svg>
  )
  return (
    <svg width="16" height="18" viewBox="0 0 14 18" fill="none">
      <rect x="1" y="1" width="12" height="16" rx="3" stroke={c} strokeWidth="1.3"/>
      <path d="M4 5h6M4 8.5h6M4 12h4" stroke={c} strokeWidth="1.1" strokeLinecap="round"/>
    </svg>
  )
}

/* ══════════════════════════════════════════════════════ */
export default function VisualFeed({ publications, onSelect, selectedPub, activeFilter }) {
  const projects = [...new Set(publications.map(p => p.proyecto))].filter(Boolean).sort()

  const countMap = {}
  projects.forEach(p => { countMap[p] = publications.filter(pub => pub.proyecto === p).length })

  const [selectedProject, setSelectedProject] = useState(() =>
    (activeFilter?.length === 1 ? activeFilter[0] : null) || projects[0] || null
  )
  const [showDropdown, setShowDropdown] = useState(false)
  const [gridTab, setGridTab] = useState(TAB_POSTS)
  const [openPost, setOpenPost] = useState(null)

  const project = selectedProject || projects[0] || null
  const color = project ? getProjectColor(project) : { bg: '#F3F4F6', dot: '#9CA3AF', text: '#6B7280' }

  const allForProject = publications
    .filter(p => p.proyecto === project)
    .sort((a, b) => (a.fecha || 0) - (b.fecha || 0))

  const filtered = allForProject.filter(p => tabMatch(p, gridTab))
  const postCount = allForProject.length
  const latestDate = allForProject.length > 0 ? allForProject[allForProject.length - 1].fecha : null

  const steps = [
    {
      icon: <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
      text: 'Toca el nombre de usuario para cambiar de proyecto',
    },
    {
      icon: <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" fill="currentColor"/><rect x="8" y="1" width="5" height="5" rx="1" fill="currentColor" opacity="0.5"/><rect x="1" y="8" width="5" height="5" rx="1" fill="currentColor" opacity="0.5"/><rect x="8" y="8" width="5" height="5" rx="1" fill="currentColor" opacity="0.25"/></svg>,
      text: 'Toca una publicación para abrirla como post de Instagram',
    },
  ]

  return (
    <div className="flex flex-col items-center py-6 px-4 min-h-[500px]">

      {/* How-to legend */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3 max-w-2xl w-full">
        {steps.map(({ icon, text }, i) => (
          <div key={i} className="flex items-center gap-3 flex-1 px-4 py-3 rounded-2xl"
            style={{ backgroundColor: '#fff', border: '1px solid #E8EAED', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
          >
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white font-black text-[11px]" style={{ backgroundColor: '#e84530' }}>
              {i + 1}
            </div>
            <div className="flex items-center gap-2" style={{ color: '#6B7280' }}>
              {icon}
              <span className="text-[11px] font-medium leading-snug">{text}</span>
            </div>
          </div>
        ))}
      </div>

      {/* iPhone mockup */}
      <div className="relative flex-shrink-0" style={{ width: '320px', height: '690px' }}>

<div className="absolute inset-0 rounded-[48px]" style={{
          background: 'linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 50%, #111 100%)',
          boxShadow: '0 0 0 1px rgba(255,255,255,0.08) inset, 0 0 0 1.5px #111, 0 32px 80px rgba(0,0,0,0.45), 0 8px 20px rgba(0,0,0,0.35)',
        }} />

        <div className="absolute rounded-r-sm" style={{ left: '-3px', top: '148px', width: '3px', height: '36px', backgroundColor: '#333' }} />
        <div className="absolute rounded-r-sm" style={{ left: '-3px', top: '196px', width: '3px', height: '36px', backgroundColor: '#333' }} />
        <div className="absolute rounded-r-sm" style={{ left: '-3px', top: '102px', width: '3px', height: '28px', backgroundColor: '#333' }} />
        <div className="absolute rounded-l-sm" style={{ right: '-3px', top: '172px', width: '3px', height: '64px', backgroundColor: '#333' }} />

        {/* Screen */}
        <div className="absolute bg-white" style={{ top: '12px', left: '12px', right: '12px', bottom: '12px', borderRadius: '38px', overflow: 'hidden' }}>

          {/* Dynamic Island */}
          <div className="absolute z-20" style={{ top: '14px', left: '50%', transform: 'translateX(-50%)', width: '118px', height: '34px', backgroundColor: '#000', borderRadius: '20px' }} />

          <StatusBar />

          {/* ── Profile / grid view ── */}
          <div className="absolute left-0 right-0 bottom-0 overflow-y-auto" style={{ top: '54px', paddingBottom: '20px' }}>

            {/* Account switcher trigger */}
            <div className="flex items-center justify-between px-3 py-2.5">
              <button onClick={() => setShowDropdown(d => !d)} className="flex items-center gap-1.5 active:opacity-70 transition-opacity duration-100">
                <span className="text-[13px] font-black text-black">{project ? project.toLowerCase() : 'perfil'}</span>
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none"
                  style={{ transition: 'transform 180ms cubic-bezier(0.16,1,0.3,1)', transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                  <path d="M3 4.5l3 3 3-3" stroke="#111" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="5" r="1.5" fill="#111"/>
                <circle cx="12" cy="12" r="1.5" fill="#111"/>
                <circle cx="12" cy="19" r="1.5" fill="#111"/>
              </svg>
            </div>

            {/* Profile header */}
            <div className="px-4 pb-3">
              <div className="flex items-center justify-between mb-4">
                <div className="w-[70px] h-[70px] rounded-full flex items-center justify-center text-lg font-black flex-shrink-0"
                  style={{ backgroundColor: color.bg, color: color.dot, border: `2.5px solid ${color.dot}` }}>
                  {project ? getInitials(project) : '?'}
                </div>
                <div className="flex gap-4 flex-1 justify-around ml-4">
                  {[{ val: postCount, label: 'publicaciones' }, { val: '—', label: 'seguidores' }, { val: '—', label: 'seguidos' }].map(({ val, label }) => (
                    <div key={label} className="flex flex-col items-center">
                      <span className="text-sm font-black text-black">{val}</span>
                      <span className="text-[9px] text-gray-500 leading-tight text-center">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mb-2">
                <div className="text-[12px] font-black text-black">{project}</div>
                {latestDate && <div className="text-[10px] text-gray-400 mt-0.5">Última publicación: {formatDate(latestDate)}</div>}
                <div className="text-[10px] text-gray-500 mt-1 leading-relaxed">
                  {allForProject.length > 0
                    ? `${allForProject.length} contenido${allForProject.length !== 1 ? 's' : ''} planificado${allForProject.length !== 1 ? 's' : ''} en tu calendario`
                    : 'Sin publicaciones planificadas'}
                </div>
              </div>
              {(() => {
                const url = igUrl(project)
                return (
                  <div className="flex gap-2">
                    <button
                      onClick={() => url && window.open(url, '_blank')}
                      className="flex-1 py-1 rounded-lg text-[11px] font-bold transition-opacity duration-150 active:opacity-70"
                      style={{ backgroundColor: color.dot, color: '#fff', opacity: url ? 1 : 0.6 }}
                    >
                      Seguir
                    </button>
                    <button
                      onClick={() => url && window.open(`https://ig.me/m/${INSTAGRAM[project]}`, '_blank')}
                      className="flex-1 py-1 rounded-lg text-[11px] font-semibold bg-gray-100 text-black transition-opacity duration-150 active:opacity-70"
                    >
                      Mensaje
                    </button>
                    <button className="w-8 py-1 rounded-lg bg-gray-100 flex items-center justify-center">
                      <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="#111" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  </div>
                )
              })()}
            </div>

            {/* Story highlights — click to switch tab */}
            <div className="flex gap-3 px-4 pb-3 overflow-x-hidden">
              {[['Reels', 'reel', TAB_REELS], ['Posts', 'imagen', TAB_POSTS], ['Stories', 'historia', TAB_STORIES]].map(([label, tipo, tab]) => {
                const isActive = gridTab === tab
                return (
                  <button
                    key={label}
                    onClick={() => setGridTab(tab)}
                    className="flex flex-col items-center gap-1 flex-shrink-0 active:opacity-70 transition-opacity"
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-150"
                      style={{
                        border: `2px solid ${isActive ? color.dot : color.dot + '40'}`,
                        backgroundColor: isActive ? color.bg : 'transparent',
                      }}
                    >
                      <TypeIcon tipo={tipo} size={16} color={color.dot} />
                    </div>
                    <span className="text-[9px] font-semibold" style={{ color: isActive ? color.dot : '#6B7280' }}>{label}</span>
                  </button>
                )
              })}
            </div>

            {/* Grid tab bar — functional */}
            <div className="flex border-t border-gray-200 mb-0.5">
              {[TAB_POSTS, TAB_REELS, TAB_STORIES].map(tab => (
                <button
                  key={tab}
                  onClick={() => setGridTab(tab)}
                  className="flex-1 py-2 flex items-center justify-center relative"
                >
                  <GridTabIcon tab={tab} active={gridTab === tab} />
                  {gridTab === tab && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[1.5px] bg-black rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: color.bg }}>
                  <TypeIcon tipo={gridTab === TAB_REELS ? 'reel' : gridTab === TAB_STORIES ? 'historia' : 'imagen'} size={18} color={color.dot} />
                </div>
                <p className="text-[11px] text-gray-400 font-medium">Sin {gridTab} para este proyecto</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-[1.5px]">
                {filtered.map(pub => (
                  <GridCell key={pub.id} pub={pub} onClick={setOpenPost} isSelected={selectedPub?.id === pub.id} />
                ))}
              </div>
            )}
          </div>

          {/* Dropdown */}
          {showDropdown && (
            <AccountSwitcherDropdown
              projects={projects}
              activeProject={project}
              countMap={countMap}
              onSelect={setSelectedProject}
              onClose={() => setShowDropdown(false)}
            />
          )}

          {/* Instagram post view */}
          {openPost && (
            <InstaPostView
              pub={openPost}
              onBack={() => setOpenPost(null)}
              onOpenDetails={() => { onSelect(openPost); setOpenPost(null) }}
            />
          )}

          {/* Home indicator */}
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 rounded-full" style={{ width: '120px', height: '5px', backgroundColor: '#111', opacity: 0.18 }} />
        </div>
      </div>

    </div>
  )
}
