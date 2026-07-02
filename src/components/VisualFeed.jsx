import { useState, useEffect, useRef } from 'react'
import { getProjectColor } from '../utils/colors'
import { formatDate } from '../utils/dateUtils'
import { TypeIcon } from './Icons'

function getThumb(media) {
  if (!media) return null
  const yt = media.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?]+)/)
  if (yt) return `https://img.youtube.com/vi/${yt[1]}/mqdefault.jpg`
  if (media.includes('unsplash.com')) return media
  if (/\.(jpg|jpeg|png|gif|webp|avif)$/i.test(media)) return media
  const driveFile = media.match(/drive\.google\.com\/file\/d\/([^/?]+)/)
  if (driveFile) return `https://drive.google.com/thumbnail?id=${driveFile[1]}&sz=w400`
  return null
}

function isVideoMedia(media) {
  if (!media) return false
  return media.includes('youtube.com') || media.includes('youtu.be') || /\.(mp4|mov|webm)$/i.test(media)
}

function getInitials(name) {
  return name.split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function Avatar({ name, size = 28 }) {
  const color = getProjectColor(name)
  return (
    <div
      className="rounded-full flex items-center justify-center font-black flex-shrink-0"
      style={{
        width: size, height: size,
        backgroundColor: color.bg,
        color: color.dot,
        border: `1.5px solid ${color.dot}`,
        fontSize: size * 0.3,
      }}
    >
      {getInitials(name)}
    </div>
  )
}

function GridCell({ pub, onClick, isSelected }) {
  const thumb = getThumb(pub.media)
  const color = getProjectColor(pub.proyecto)
  const hasVideo = isVideoMedia(pub.media)

  return (
    <button
      onClick={() => onClick(pub)}
      className="relative aspect-square overflow-hidden transition-all duration-150 focus:outline-none"
      style={{
        outline: isSelected ? `2.5px solid ${color.dot}` : 'none',
        outlineOffset: isSelected ? '-2.5px' : '0',
      }}
    >
      {thumb ? (
        <>
          <img
            src={thumb}
            alt=""
            className="w-full h-full object-cover"
            onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
          />
          <div className="absolute inset-0 items-center justify-center hidden" style={{ backgroundColor: color.bg }}>
            <TypeIcon tipo={pub.tipo} size={18} color={color.dot} />
          </div>
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: color.bg }}>
          <TypeIcon tipo={pub.tipo} size={18} color={color.dot} />
        </div>
      )}
      {hasVideo && (
        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}>
          <svg width="8" height="8" viewBox="0 0 10 10" fill="white"><path d="M3 2l5 3-5 3V2z"/></svg>
        </div>
      )}
      {isSelected && <div className="absolute inset-0 bg-black/10" />}
    </button>
  )
}

function AccountSwitcherDropdown({ projects, activeProject, onSelect, onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    const handle = e => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', handle)
    document.addEventListener('touchstart', handle)
    return () => { document.removeEventListener('mousedown', handle); document.removeEventListener('touchstart', handle) }
  }, [onClose])

  return (
    /* Full-screen dim layer inside the phone screen */
    <div className="absolute inset-0 z-30" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}>
      {/* Card anchored below the top bar */}
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
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.08em]">Cambiar cuenta</p>
        </div>

        {/* Account list */}
        <div className="py-1.5 max-h-[260px] overflow-y-auto">
          {projects.map(proj => {
            const isActive = proj === activeProject
            const color = getProjectColor(proj)
            return (
              <button
                key={proj}
                onClick={() => { onSelect(proj); onClose() }}
                className="w-full flex items-center gap-3 px-4 py-2.5 transition-all duration-100 active:bg-gray-50"
                style={{ backgroundColor: isActive ? `${color.bg}` : 'transparent' }}
              >
                <Avatar name={proj} size={36} />
                <div className="flex-1 min-w-0 text-left">
                  <div className="text-[12px] font-bold text-black truncate leading-tight">{proj}</div>
                  <div className="text-[10px] text-gray-400 leading-tight mt-0.5">
                    {publications_count_map[proj] ?? 0} publicaciones
                  </div>
                </div>
                {isActive && (
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: color.dot }}
                  >
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

// Module-level map populated by the parent component before rendering the dropdown
let publications_count_map = {}

export default function VisualFeed({ publications, onSelect, selectedPub, activeFilter }) {
  const projects = [...new Set(publications.map(p => p.proyecto))].filter(Boolean).sort()

  // Build count map for the dropdown
  publications_count_map = {}
  projects.forEach(p => { publications_count_map[p] = publications.filter(pub => pub.proyecto === p).length })

  const [selectedProject, setSelectedProject] = useState(() => {
    if (activeFilter && activeFilter.length === 1) return activeFilter[0]
    return projects[0] || null
  })
  const [showDropdown, setShowDropdown] = useState(false)

  const project = selectedProject || projects[0] || null
  const color = project ? getProjectColor(project) : { bg: '#F3F4F6', dot: '#9CA3AF', text: '#6B7280' }

  const filtered = publications
    .filter(p => p.proyecto === project)
    .sort((a, b) => (a.fecha || 0) - (b.fecha || 0))

  const postCount = filtered.length
  const latestDate = filtered.length > 0 ? filtered[filtered.length - 1].fecha : null

  const steps = [
    {
      icon: (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M8 9.5l2.5 2.5 2.5-2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 4h10M3 8h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ),
      text: 'Toca el nombre de usuario para cambiar de proyecto',
    },
    {
      icon: (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.9"/>
          <rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.6"/>
          <rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.6"/>
          <rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.3"/>
        </svg>
      ),
      text: 'Toca cualquier publicación para ver su contenido completo',
    },
  ]

  return (
    <div className="flex flex-col items-center py-6 px-4 min-h-[500px]">

      {/* How-to legend */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3 max-w-lg w-full">
        {steps.map(({ icon, text }, i) => (
          <div
            key={i}
            className="flex items-center gap-3 flex-1 px-4 py-3 rounded-2xl"
            style={{ backgroundColor: '#fff', border: '1px solid #E8EAED', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white font-black text-[11px]"
              style={{ backgroundColor: '#732442' }}
            >
              {i + 1}
            </div>
            <div className="flex items-center gap-2 text-gray-500" style={{ color: '#6B7280' }}>
              {icon}
              <span className="text-[11px] font-medium leading-snug">{text}</span>
            </div>
          </div>
        ))}
      </div>

      {/* iPhone mockup */}
      <div className="relative flex-shrink-0" style={{ width: '320px', height: '690px' }}>

        {/* Phone frame */}
        <div
          className="absolute inset-0 rounded-[48px]"
          style={{
            background: 'linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 50%, #111 100%)',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.08) inset, 0 0 0 1.5px #111, 0 32px 80px rgba(0,0,0,0.45), 0 8px 20px rgba(0,0,0,0.35)',
          }}
        />

        {/* Side buttons */}
        <div className="absolute rounded-r-sm" style={{ left: '-3px', top: '148px', width: '3px', height: '36px', backgroundColor: '#333', boxShadow: '-1px 0 2px rgba(0,0,0,0.4)' }} />
        <div className="absolute rounded-r-sm" style={{ left: '-3px', top: '196px', width: '3px', height: '36px', backgroundColor: '#333', boxShadow: '-1px 0 2px rgba(0,0,0,0.4)' }} />
        <div className="absolute rounded-r-sm" style={{ left: '-3px', top: '102px', width: '3px', height: '28px', backgroundColor: '#333', boxShadow: '-1px 0 2px rgba(0,0,0,0.4)' }} />
        <div className="absolute rounded-l-sm" style={{ right: '-3px', top: '172px', width: '3px', height: '64px', backgroundColor: '#333', boxShadow: '1px 0 2px rgba(0,0,0,0.4)' }} />

        {/* Screen */}
        <div
          className="absolute bg-white"
          style={{ top: '12px', left: '12px', right: '12px', bottom: '12px', borderRadius: '38px', overflow: 'hidden' }}
        >
          {/* Dynamic Island */}
          <div
            className="absolute z-20"
            style={{ top: '14px', left: '50%', transform: 'translateX(-50%)', width: '118px', height: '34px', backgroundColor: '#000', borderRadius: '20px' }}
          />

          {/* Status bar */}
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

          {/* Scrollable Instagram content */}
          <div
            className="absolute left-0 right-0 bottom-0 overflow-y-auto"
            style={{ top: '54px', paddingBottom: '20px' }}
          >
            {/* Instagram top bar — account switcher trigger */}
            <div className="flex items-center justify-between px-3 py-2.5">
              <button
                onClick={() => setShowDropdown(d => !d)}
                className="flex items-center gap-1.5 transition-opacity duration-100 active:opacity-70"
              >
                <span className="text-[13px] font-black text-black">
                  {project ? project.toLowerCase() : 'perfil'}
                </span>
                {/* Chevron — rotates when open */}
                <svg
                  width="11" height="11" viewBox="0 0 12 12" fill="none"
                  style={{ transition: 'transform 180ms cubic-bezier(0.16,1,0.3,1)', transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                  <path d="M3 4.5l3 3 3-3" stroke="#111" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="5" r="1.5" fill="#111"/>
                <circle cx="12" cy="12" r="1.5" fill="#111"/>
                <circle cx="12" cy="19" r="1.5" fill="#111"/>
              </svg>
            </div>

            {/* Profile section */}
            <div className="px-4 pb-3">
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-[70px] h-[70px] rounded-full flex items-center justify-center text-lg font-black flex-shrink-0"
                  style={{ backgroundColor: color.bg, color: color.dot, border: `2.5px solid ${color.dot}` }}
                >
                  {project ? getInitials(project) : '?'}
                </div>
                <div className="flex gap-4 flex-1 justify-around ml-4">
                  {[
                    { val: postCount, label: 'publicaciones' },
                    { val: '—', label: 'seguidores' },
                    { val: '—', label: 'seguidos' },
                  ].map(({ val, label }) => (
                    <div key={label} className="flex flex-col items-center">
                      <span className="text-sm font-black text-black">{val}</span>
                      <span className="text-[9px] text-gray-500 leading-tight text-center">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-2">
                <div className="text-[12px] font-black text-black">{project}</div>
                {latestDate && (
                  <div className="text-[10px] text-gray-400 mt-0.5">Última publicación: {formatDate(latestDate)}</div>
                )}
                <div className="text-[10px] text-gray-500 mt-1 leading-relaxed">
                  {filtered.length > 0
                    ? `${filtered.length} contenido${filtered.length !== 1 ? 's' : ''} planificado${filtered.length !== 1 ? 's' : ''} en tu calendario`
                    : 'Sin publicaciones planificadas'}
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 py-1 rounded-lg text-[11px] font-bold" style={{ backgroundColor: color.dot, color: '#fff' }}>
                  Seguir
                </button>
                <button className="flex-1 py-1 rounded-lg text-[11px] font-semibold bg-gray-100 text-black">
                  Mensaje
                </button>
                <button className="w-8 py-1 rounded-lg bg-gray-100 flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="#111" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            </div>

            {/* Story highlights */}
            <div className="flex gap-3 px-4 pb-3 overflow-x-hidden">
              {['Reels', 'Posts', 'Stories'].map((hl, i) => (
                <div key={hl} className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ border: `1.5px solid ${color.dot}40`, backgroundColor: color.bg }}
                  >
                    <TypeIcon tipo={i === 0 ? 'reel' : i === 1 ? 'imagen' : 'historia'} size={16} color={color.dot} />
                  </div>
                  <span className="text-[9px] text-gray-600">{hl}</span>
                </div>
              ))}
            </div>

            {/* Tab bar */}
            <div className="flex border-t border-gray-200 mb-0.5">
              {[
                <svg key="g" width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1" y="1" width="7" height="7" rx="1" fill="#111"/><rect x="10" y="1" width="7" height="7" rx="1" fill="#111"/><rect x="1" y="10" width="7" height="7" rx="1" fill="#111"/><rect x="10" y="10" width="7" height="7" rx="1" fill="#111"/></svg>,
                <svg key="r" width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1" y="1" width="16" height="16" rx="2" stroke="#9CA3AF" strokeWidth="1.3"/><path d="M7 6l6 3-6 3V6z" fill="#9CA3AF"/></svg>,
                <svg key="t" width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="1" y="1" width="16" height="16" rx="2" stroke="#9CA3AF" strokeWidth="1.3"/><path d="M6 9h6M9 6v6" stroke="#9CA3AF" strokeWidth="1.3" strokeLinecap="round"/></svg>,
              ].map((icon, i) => (
                <button key={i} className="flex-1 py-2 flex items-center justify-center">{icon}</button>
              ))}
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: color.bg }}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect x="2" y="2" width="7" height="7" rx="1.5" stroke={color.dot} strokeWidth="1.4"/>
                    <rect x="11" y="2" width="7" height="7" rx="1.5" stroke={color.dot} strokeWidth="1.4"/>
                    <rect x="2" y="11" width="7" height="7" rx="1.5" stroke={color.dot} strokeWidth="1.4"/>
                    <rect x="11" y="11" width="7" height="7" rx="1.5" stroke={color.dot} strokeWidth="1.4" opacity="0.4"/>
                  </svg>
                </div>
                <p className="text-[11px] text-gray-400 font-medium">Sin publicaciones para este proyecto</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-[1.5px]">
                {filtered.map(pub => (
                  <GridCell key={pub.id} pub={pub} onClick={onSelect} isSelected={selectedPub?.id === pub.id} />
                ))}
              </div>
            )}
          </div>

          {/* Account switcher dropdown — rendered above the scroll layer */}
          {showDropdown && (
            <AccountSwitcherDropdown
              projects={projects}
              activeProject={project}
              onSelect={setSelectedProject}
              onClose={() => setShowDropdown(false)}
            />
          )}

          {/* Home indicator */}
          <div
            className="absolute bottom-1.5 left-1/2 -translate-x-1/2 rounded-full"
            style={{ width: '120px', height: '5px', backgroundColor: '#111', opacity: 0.18 }}
          />
        </div>
      </div>

    </div>
  )
}
