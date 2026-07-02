import { useState } from 'react'
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
          <div
            className="absolute inset-0 items-center justify-center hidden"
            style={{ backgroundColor: color.bg }}
          >
            <TypeIcon tipo={pub.tipo} size={18} color={color.dot} />
          </div>
        </>
      ) : (
        <div
          className="w-full h-full flex items-center justify-center"
          style={{ backgroundColor: color.bg }}
        >
          <TypeIcon tipo={pub.tipo} size={18} color={color.dot} />
        </div>
      )}

      {/* Video indicator */}
      {hasVideo && (
        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}>
          <svg width="8" height="8" viewBox="0 0 10 10" fill="white"><path d="M3 2l5 3-5 3V2z"/></svg>
        </div>
      )}

      {/* Selected overlay */}
      {isSelected && (
        <div className="absolute inset-0 bg-black/10" />
      )}
    </button>
  )
}

export default function VisualFeed({ publications, onSelect, selectedPub, activeFilter }) {
  const projects = [...new Set(publications.map(p => p.proyecto))].filter(Boolean).sort()

  const [selectedProject, setSelectedProject] = useState(() => {
    if (activeFilter && activeFilter.length === 1) return activeFilter[0]
    return projects[0] || null
  })

  const project = selectedProject || projects[0] || null
  const color = project ? getProjectColor(project) : { bg: '#F3F4F6', dot: '#9CA3AF', text: '#6B7280' }

  const filtered = publications
    .filter(p => p.proyecto === project)
    .sort((a, b) => (a.fecha || 0) - (b.fecha || 0))

  const postCount = filtered.length
  const latestDate = filtered.length > 0 ? filtered[filtered.length - 1].fecha : null

  return (
    <div className="flex flex-col items-center py-6 px-4 min-h-[500px]">

      {/* Project selector */}
      <div className="mb-6 flex flex-wrap gap-2 justify-center max-w-2xl">
        {projects.map(proj => {
          const c = getProjectColor(proj)
          const isActive = proj === project
          return (
            <button
              key={proj}
              onClick={() => setSelectedProject(proj)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all duration-150"
              style={isActive
                ? { backgroundColor: c.dot, color: '#fff', boxShadow: `0 2px 8px ${c.dot}40` }
                : { backgroundColor: '#F3F4F6', color: '#6B7280' }
              }
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: isActive ? 'rgba(255,255,255,0.7)' : c.dot }}
              />
              {proj}
            </button>
          )
        })}
      </div>

      {/* iPhone mockup */}
      <div
        className="relative flex-shrink-0"
        style={{
          width: '320px',
          height: '690px',
        }}
      >
        {/* Phone frame */}
        <div
          className="absolute inset-0 rounded-[48px]"
          style={{
            background: 'linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 50%, #111 100%)',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.08) inset, 0 0 0 1.5px #111, 0 32px 80px rgba(0,0,0,0.45), 0 8px 20px rgba(0,0,0,0.35)',
          }}
        />

        {/* Side buttons */}
        {/* Volume up */}
        <div className="absolute rounded-r-sm" style={{ left: '-3px', top: '148px', width: '3px', height: '36px', backgroundColor: '#333', boxShadow: '-1px 0 2px rgba(0,0,0,0.4)' }} />
        {/* Volume down */}
        <div className="absolute rounded-r-sm" style={{ left: '-3px', top: '196px', width: '3px', height: '36px', backgroundColor: '#333', boxShadow: '-1px 0 2px rgba(0,0,0,0.4)' }} />
        {/* Mute */}
        <div className="absolute rounded-r-sm" style={{ left: '-3px', top: '102px', width: '3px', height: '28px', backgroundColor: '#333', boxShadow: '-1px 0 2px rgba(0,0,0,0.4)' }} />
        {/* Power */}
        <div className="absolute rounded-l-sm" style={{ right: '-3px', top: '172px', width: '3px', height: '64px', backgroundColor: '#333', boxShadow: '1px 0 2px rgba(0,0,0,0.4)' }} />

        {/* Screen */}
        <div
          className="absolute overflow-hidden bg-white"
          style={{
            top: '12px',
            left: '12px',
            right: '12px',
            bottom: '12px',
            borderRadius: '38px',
          }}
        >
          {/* Dynamic Island */}
          <div
            className="absolute z-20 flex items-center justify-center"
            style={{
              top: '14px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '118px',
              height: '34px',
              backgroundColor: '#000',
              borderRadius: '20px',
            }}
          />

          {/* Status bar */}
          <div
            className="absolute top-0 left-0 right-0 z-10 flex items-end justify-between px-5 pb-1"
            style={{ height: '54px', backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(4px)' }}
          >
            <span className="text-[11px] font-semibold text-black" style={{ paddingBottom: '2px' }}>9:41</span>
            <div className="flex items-center gap-1.5" style={{ paddingBottom: '2px' }}>
              {/* Signal */}
              <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                <rect x="0" y="8" width="3" height="4" rx="0.5" fill="#111"/>
                <rect x="4.5" y="5" width="3" height="7" rx="0.5" fill="#111"/>
                <rect x="9" y="2" width="3" height="10" rx="0.5" fill="#111"/>
                <rect x="13.5" y="0" width="2.5" height="12" rx="0.5" fill="#111"/>
              </svg>
              {/* WiFi */}
              <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
                <path d="M7 8.5a1.2 1.2 0 1 1 0 2.4A1.2 1.2 0 0 1 7 8.5z" fill="#111"/>
                <path d="M3.5 6.5a4.95 4.95 0 0 1 7 0" stroke="#111" strokeWidth="1.2" strokeLinecap="round"/>
                <path d="M1 4a8.5 8.5 0 0 1 12 0" stroke="#111" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              {/* Battery */}
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
            {/* Instagram top bar */}
            <div className="flex items-center justify-between px-3 py-2">
              <button className="flex items-center gap-1 text-[13px] font-bold text-black">
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M8 9L4 6l4-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                {project ? project.split(' ').slice(0,2).join(' ').toLowerCase() : 'perfil'}
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
                {/* Avatar */}
                <div
                  className="w-[70px] h-[70px] rounded-full flex items-center justify-center text-lg font-black flex-shrink-0"
                  style={{ backgroundColor: color.bg, color: color.dot, border: `2.5px solid ${color.dot}` }}
                >
                  {project ? getInitials(project) : '?'}
                </div>

                {/* Stats */}
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

              {/* Name & bio */}
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

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  className="flex-1 py-1 rounded-lg text-[11px] font-bold transition-all duration-150"
                  style={{ backgroundColor: color.dot, color: '#fff' }}
                >
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
                <button key={i} className="flex-1 py-2 flex items-center justify-center">
                  {icon}
                </button>
              ))}
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                  style={{ backgroundColor: color.bg }}
                >
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
                  <GridCell
                    key={pub.id}
                    pub={pub}
                    onClick={onSelect}
                    isSelected={selectedPub?.id === pub.id}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Home indicator */}
          <div
            className="absolute bottom-1.5 left-1/2 -translate-x-1/2 rounded-full"
            style={{ width: '120px', height: '5px', backgroundColor: '#111', opacity: 0.18 }}
          />
        </div>
      </div>

      {/* Hint */}
      <p className="mt-5 text-xs text-gray-400 font-medium text-center">
        Toca una publicación para ver los detalles
      </p>
    </div>
  )
}
