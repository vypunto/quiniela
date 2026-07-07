import { useState, useEffect, useRef, useMemo } from 'react'
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

const MOBILE_CHANNELS = new Set(['Instagram', 'TikTok'])

const CHANNEL_BRAND = {
  LinkedIn: { accent: '#0077B5', light: '#EBF5FB' },
  Facebook: { accent: '#1877F2', light: '#EBF3FF' },
  Web:      { accent: '#059669', light: '#ECFDF5' },
  Otros:    { accent: '#6B7280', light: '#F3F4F6' },
}

function ChannelIcon({ canal, size = 12 }) {
  if (canal === 'Instagram') return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.5"/><circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>
  if (canal === 'TikTok') return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.78a4.85 4.85 0 0 1-1.01-.09z"/></svg>
  if (canal === 'LinkedIn') return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
  if (canal === 'Facebook') return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
  if (canal === 'Web') return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor" strokeWidth="1.5"/></svg>
  return null
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
  // posts: everything except stories (reels, carrusels, images, videos all appear in main grid)
  return t !== 'historia'
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

/* ── Reel media: thumbnail → click-to-play embedded video ── */
function ReelMediaArea({ pub, color }) {
  const [playing, setPlaying] = useState(false)
  const url = (pub.media || '').split(',')[0].trim()
  const thumb = getThumb(url)
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?]+)/)
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/?]+)/)
  const isDirectVid = /\.(mp4|mov|webm)$/i.test(url)

  const embedSrc = ytMatch
    ? `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&playsinline=1&rel=0`
    : driveMatch
    ? `https://drive.google.com/file/d/${driveMatch[1]}/preview`
    : null

  return (
    // Use 4:5 to match standard posts — YouTube is 16:9 so 9:16 would letterbox badly
    <div style={{ position: 'relative', width: '100%', paddingTop: '125%', backgroundColor: '#000', overflow: 'hidden' }}>
      {playing ? (
        embedSrc ? (
          <iframe
            src={embedSrc}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
            allow="autoplay; encrypted-media"
            allowFullScreen
            title="reel"
          />
        ) : isDirectVid ? (
          <video
            src={url}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            controls autoPlay playsInline
          />
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: color.bg }}>
            <TypeIcon tipo="reel" size={32} color={color.dot} />
          </div>
        )
      ) : (
        <>
          {thumb
            ? <img src={thumb} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none' }} />
            : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: color.bg }}><TypeIcon tipo="reel" size={32} color={color.dot} /></div>
          }
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <button
              onClick={() => setPlaying(true)}
              style={{ width: 52, height: 52, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)', border: 'none', cursor: 'pointer' }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="white"><path d="M5 3l13 7-13 7V3z"/></svg>
            </button>
          </div>
        </>
      )}
    </div>
  )
}

/* ── Story viewer — accepts an array of story publications ── */
function StoryView({ stories, onBack, onOpenDetails }) {
  const [idx, setIdx] = useState(0)
  const [progress, setProgress] = useState(0)
  const DURATION = 5000

  const pub = stories[idx]
  const color = getProjectColor(pub.proyecto)
  const mediaUrl = (pub.media || '').split(',')[0].trim()
  const thumb = getThumb(mediaUrl)
  const isVid = isVideoMedia(mediaUrl)

  useEffect(() => {
    if (isVid) return
    setProgress(0)
    const start = Date.now()
    const raf = { id: null }
    const tick = () => {
      const p = Math.min(1, (Date.now() - start) / DURATION)
      setProgress(p)
      if (p < 1) { raf.id = requestAnimationFrame(tick) }
      else if (idx < stories.length - 1) { setIdx(i => i + 1) }
      else { onBack() }
    }
    raf.id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.id)
  }, [idx, isVid, stories.length])

  const goPrev = () => { if (idx > 0) setIdx(i => i - 1) }
  const goNext = () => { if (idx < stories.length - 1) setIdx(i => i + 1); else onBack() }

  return (
    <div
      className="absolute inset-0 z-25 flex flex-col"
      style={{ backgroundColor: '#000', animation: 'slideInRight 200ms cubic-bezier(0.16,1,0.3,1)' }}
    >
      <StatusBar />
      <div className="flex-1 relative" style={{ marginTop: '54px' }}>
        {thumb
          ? <img src={thumb} alt="" className="absolute inset-0 w-full h-full object-cover" />
          : <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: color.bg }}><TypeIcon tipo="historia" size={40} color={color.dot} /></div>
        }
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, transparent 28%, transparent 58%, rgba(0,0,0,0.65) 100%)' }} />

        {/* One progress bar segment per story */}
        <div className="absolute left-3 right-3 flex gap-1" style={{ top: 10 }}>
          {stories.map((_, i) => (
            <div key={i} className="flex-1 rounded-full overflow-hidden" style={{ height: 2, backgroundColor: 'rgba(255,255,255,0.35)' }}>
              <div style={{ height: '100%', borderRadius: 9999, backgroundColor: '#fff', width: i < idx ? '100%' : i === idx ? `${progress * 100}%` : '0%' }} />
            </div>
          ))}
        </div>

        {/* Top user row */}
        <div className="absolute left-3 right-3 flex items-center gap-2" style={{ top: 22 }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center font-black text-[9px] flex-shrink-0"
            style={{ backgroundColor: color.bg, color: color.dot, border: '1.5px solid rgba(255,255,255,0.7)' }}>
            {getInitials(pub.proyecto)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-black text-white truncate leading-tight">{pub.proyecto.toLowerCase()}</div>
            {pub.fecha && <div className="text-[9px] leading-tight" style={{ color: 'rgba(255,255,255,0.7)' }}>{relativeDate(pub.fecha)}</div>}
          </div>
          <button onClick={onBack} className="w-8 h-8 flex items-center justify-center">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M1 1l11 11M12 1L1 12" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Bottom caption + CTA */}
        <div className="absolute left-4 right-4 bottom-4">
          {pub.titulo && <p className="text-white text-[11px] italic mb-1" style={{ opacity: 0.8 }}>{pub.titulo}</p>}
          {pub.copy && <p className="text-white text-[11px] font-medium leading-snug mb-3">{pub.copy}</p>}
          <button
            onClick={() => onOpenDetails(pub)}
            className="w-full py-2 rounded-xl text-[11px] font-bold text-white transition-all active:opacity-70"
            style={{ backgroundColor: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.35)' }}
          >
            Ver ficha completa →
          </button>
        </div>

        {/* Tap zones */}
        <button className="absolute left-0 top-0 bottom-0 w-1/3" style={{ background: 'none', border: 'none' }} onClick={goPrev} />
        <button className="absolute right-0 top-0 bottom-0 w-1/3" style={{ background: 'none', border: 'none' }} onClick={goNext} />
      </div>
      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 rounded-full" style={{ width: 120, height: 5, backgroundColor: '#fff', opacity: 0.2 }} />
    </div>
  )
}

/* ── Instagram post view (inside phone) ── */
function InstaPostView({ pub, onBack, onOpenDetails }) {
  const color = getProjectColor(pub.proyecto)
  const mediaList = parseMediaList(pub.media)
  const isCarousel = mediaList.length > 1
  const isReel = (pub.tipo || '').toLowerCase() === 'reel'
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

        {/* Media — reel: 9:16 playable · others: 4:5 */}
        {isReel && !isCarousel ? (
          <ReelMediaArea pub={pub} color={color} />
        ) : null}
        <div className="w-full" style={{ display: isReel && !isCarousel ? 'none' : undefined, aspectRatio: '4/5', backgroundColor: color.bg, position: 'relative', overflow: 'hidden' }}>
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
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex">
                {mediaList.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSlide(i)}
                    className="flex items-center justify-center"
                    style={{ padding: '6px 3px' }}
                  >
                    <span
                      className="rounded-full block"
                      style={{ width: i === slide ? 14 : 6, height: 6, backgroundColor: i === slide ? color.dot : 'rgba(255,255,255,0.6)', transition: 'all 200ms' }}
                    />
                  </button>
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
  const mediaList = parseMediaList(pub.media)
  const isCarouselCell = mediaList.length > 1
  const color = getProjectColor(pub.proyecto)
  const t = (pub.tipo || '').toLowerCase()

  const [hoverSlide, setHoverSlide] = useState(0)
  const [hovering, setHovering] = useState(false)
  const intervalRef = useRef(null)

  const onMouseEnter = () => {
    if (!isCarouselCell) return
    setHovering(true)
    let i = 1
    intervalRef.current = setInterval(() => {
      setHoverSlide(i % mediaList.length)
      i++
    }, 700)
  }

  const onMouseLeave = () => {
    clearInterval(intervalRef.current)
    setHoverSlide(0)
    setHovering(false)
  }

  useEffect(() => () => clearInterval(intervalRef.current), [])

  const currentUrl = isCarouselCell ? mediaList[hoverSlide] : (pub.media || '')
  const thumb = getThumb(currentUrl)

  return (
    <button
      onClick={() => onClick(pub)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="relative overflow-hidden transition-all duration-150 focus:outline-none"
      style={{
        aspectRatio: '4/5',
        outline: isSelected ? `2.5px solid ${color.dot}` : 'none',
        outlineOffset: isSelected ? '-2.5px' : '0',
      }}
    >
      {thumb ? (
        <>
          <img key={hoverSlide} src={thumb} alt="" className="w-full h-full object-cover" style={{ animation: isCarouselCell && hovering ? 'fadeIn 180ms ease' : 'none' }} onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }} />
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
      {/* Hover slide dots for carousel */}
      {isCarouselCell && hovering && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {mediaList.map((_, i) => (
            <span
              key={i}
              className="rounded-full block"
              style={{
                width: i === hoverSlide ? 10 : 5,
                height: 5,
                backgroundColor: i === hoverSlide ? '#fff' : 'rgba(255,255,255,0.5)',
                transition: 'all 180ms',
              }}
            />
          ))}
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

/* ── TikTok view (inside iPhone) ── */
function TikTokView({ pubs, color, project, onOpenPost }) {
  const handle = project ? `@${project.toLowerCase().replace(/\s+/g, '.')}` : '@usuario'
  return (
    <div className="absolute inset-0 overflow-y-auto" style={{ backgroundColor: '#000' }}>
      <div className="sticky top-0 z-10 pt-12 pb-2 flex items-center justify-center gap-8" style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
        <span className="text-[13px] font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>Siguiendo</span>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[13px] font-bold text-white">Para ti</span>
          <div className="rounded-full" style={{ width: 16, height: 2, backgroundColor: '#fff' }} />
        </div>
      </div>
      {pubs.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>Sin contenido TikTok para este proyecto</p>
        </div>
      ) : (
        <div className="pb-6 space-y-2 px-1.5 pt-2">
          {pubs.map(pub => {
            const thumb = getThumb(pub.media)
            const likes = mockLikes(pub.id)
            return (
              <button key={pub.id} onClick={() => onOpenPost(pub)}
                className="w-full text-left relative overflow-hidden rounded-xl active:opacity-80 transition-opacity"
                style={{ aspectRatio: '3/4', backgroundColor: color.bg, display: 'block' }}
              >
                {thumb
                  ? <img src={thumb} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  : <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.25)' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M5 3l14 9L5 21V3z"/></svg>
                      </div>
                    </div>
                }
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)' }} />
                <div className="absolute bottom-0 left-0 right-10 p-2.5">
                  <p className="text-white text-[10px] font-bold mb-0.5">{handle}</p>
                  <p className="text-[9px] leading-tight" style={{ color: 'rgba(255,255,255,0.75)' }}>
                    {pub.titulo || pub.copy || ''}
                  </p>
                </div>
                <div className="absolute right-2 bottom-3 flex flex-col items-center gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[9px] font-black border-2 border-white"
                      style={{ backgroundColor: color.dot, color: '#fff' }}>
                      {getInitials(project)}
                    </div>
                    <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center -mt-2 border border-black" style={{ backgroundColor: '#fe2c55' }}>
                      <svg width="6" height="6" viewBox="0 0 8 8" fill="none"><path d="M4 1v6M1 4h6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    </div>
                  </div>
                  {[
                    { val: likes > 1000 ? (likes/1000).toFixed(1)+'K' : likes, icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg> },
                    { val: Math.round(likes/15), icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
                    { val: Math.round(likes/6), icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg> },
                  ].map(({ val, icon }, i) => (
                    <div key={i} className="flex flex-col items-center gap-0.5">
                      {icon}
                      <span className="text-white text-[9px] font-semibold">{val}</span>
                    </div>
                  ))}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ── Desktop channel view (LinkedIn / Facebook / Web) ── */
function DesktopChannelView({ channel, pubs, color, project, onSelect }) {
  const brand = CHANNEL_BRAND[channel] || CHANNEL_BRAND['Otros']
  return (
    <div className="max-w-2xl w-full">
      {pubs.length === 0 ? (
        <div className="bg-white rounded-2xl flex flex-col items-center justify-center py-16"
          style={{ border: '1px solid #E8EAED', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ backgroundColor: brand.light, color: brand.accent }}>
            <ChannelIcon canal={channel} size={22} />
          </div>
          <p className="text-sm font-medium text-gray-400">Sin publicaciones de {channel}</p>
          <p className="text-xs text-gray-300 mt-1">para {project}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pubs.map(pub => (
            <button key={pub.id} onClick={() => onSelect(pub)}
              className="w-full text-left bg-white rounded-2xl overflow-hidden transition-all duration-150 hover:shadow-md active:opacity-80"
              style={{ border: '1px solid #E8EAED', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
            >
              <div style={{ height: 3, backgroundColor: brand.accent }} />
              <div className="p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-[11px] flex-shrink-0"
                      style={{ backgroundColor: color.dot }}>
                      {getInitials(project)}
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-gray-900 leading-none">{project}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{pub.fecha ? formatDate(pub.fecha) : ''}</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold flex-shrink-0"
                    style={{ backgroundColor: brand.light, color: brand.accent }}>
                    <ChannelIcon canal={channel} size={10} />{channel}
                  </span>
                </div>
                {pub.titulo && <p className="text-[13px] font-bold text-gray-900 mb-1 leading-snug">{pub.titulo}</p>}
                {pub.copy && <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-3">{pub.copy}</p>}
                {pub.tipo && (
                  <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-gray-100">
                    <TypeIcon tipo={pub.tipo} size={10} />
                    <span className="text-[10px] font-semibold text-gray-400 capitalize">{pub.tipo}</span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
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
  const [openStories, setOpenStories] = useState(false)
  const [selectedChannel, setSelectedChannel] = useState(null)

  const project = selectedProject || projects[0] || null
  const color = project ? getProjectColor(project) : { bg: '#F3F4F6', dot: '#9CA3AF', text: '#6B7280' }

  const allForProject = publications
    .filter(p => p.proyecto === project)
    .sort((a, b) => (a.fecha || 0) - (b.fecha || 0))

  const channelsForProject = useMemo(() => {
    const found = new Set(allForProject.map(p => p.canal).filter(Boolean))
    return ['Instagram', 'TikTok', 'LinkedIn', 'Facebook', 'Web', 'Otros'].filter(c => found.has(c))
  }, [allForProject])

  useEffect(() => { setSelectedChannel(null) }, [project])

  const activeChannel = (selectedChannel && channelsForProject.includes(selectedChannel))
    ? selectedChannel
    : (channelsForProject[0] || null)

  const channelPubs = activeChannel
    ? allForProject.filter(p => p.canal === activeChannel)
    : allForProject

  const isMobileChannel = !activeChannel || MOBILE_CHANNELS.has(activeChannel)

  const storiesForProject = channelPubs
    .filter(p => (p.tipo || '').toLowerCase() === 'historia')
    .sort((a, b) => (a.fecha || 0) - (b.fecha || 0))
  const hasStories = storiesForProject.length > 0

  const filtered = channelPubs.filter(p => tabMatch(p, gridTab))
  const postCount = channelPubs.length
  const latestDate = channelPubs.length > 0 ? channelPubs[channelPubs.length - 1].fecha : null

  const steps = [
    {
      icon: <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
      text: 'Toca el nombre de usuario para cambiar de proyecto',
    },
    {
      icon: <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" fill="currentColor"/><rect x="8" y="1" width="5" height="5" rx="1" fill="currentColor" opacity="0.5"/><rect x="1" y="8" width="5" height="5" rx="1" fill="currentColor" opacity="0.5"/><rect x="8" y="8" width="5" height="5" rx="1" fill="currentColor" opacity="0.25"/></svg>,
      text: 'Toca una publicación para ver su detalle',
    },
  ]

  return (
    <div className="flex flex-col items-center py-6 px-4 min-h-[500px]">

      {/* How-to legend */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3 max-w-2xl w-full">
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

      {/* Channel selector */}
      {channelsForProject.length > 1 && (
        <div className="mb-4 flex gap-2 flex-wrap max-w-2xl w-full">
          {channelsForProject.map(ch => (
            <button key={ch} onClick={() => setSelectedChannel(ch)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all duration-150"
              style={activeChannel === ch
                ? { backgroundColor: '#111827', color: '#fff', borderColor: '#111827' }
                : { backgroundColor: '#fff', color: '#6B7280', borderColor: '#E5E7EB' }
              }
            >
              <ChannelIcon canal={ch} size={11} />{ch}
            </button>
          ))}
        </div>
      )}

      {/* Content: iPhone (Instagram/TikTok) or desktop cards (LinkedIn/Facebook/Web) */}
      {!isMobileChannel ? (
        <DesktopChannelView channel={activeChannel} pubs={channelPubs} color={color} project={project} onSelect={onSelect} />
      ) : (
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

          {activeChannel === 'TikTok' ? (
            <TikTokView pubs={channelPubs} color={color} project={project} onOpenPost={setOpenPost} />
          ) : (
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
                {/* Avatar — clickable ring when project has stories */}
                {hasStories ? (
                  <button
                    onClick={() => setOpenStories(true)}
                    className="flex-shrink-0 rounded-full p-[3px] transition-opacity active:opacity-70"
                    style={{ background: 'linear-gradient(135deg, #fcb045 0%, #fd1d1d 50%, #833ab4 100%)', border: 'none', cursor: 'pointer' }}
                  >
                    <div className="rounded-full p-[2px] bg-white">
                      <div className="w-[66px] h-[66px] rounded-full flex items-center justify-center text-lg font-black"
                        style={{ backgroundColor: color.bg, color: color.dot }}>
                        {project ? getInitials(project) : '?'}
                      </div>
                    </div>
                  </button>
                ) : (
                  <div className="w-[70px] h-[70px] rounded-full flex items-center justify-center text-lg font-black flex-shrink-0"
                    style={{ backgroundColor: color.bg, color: color.dot, border: `2.5px solid ${color.dot}` }}>
                    {project ? getInitials(project) : '?'}
                  </div>
                )}
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
          )} {/* end TikTok/Instagram conditional */}

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

          {/* Stories from avatar click — all stories ordered by date */}
          {openStories && (
            <StoryView
              stories={storiesForProject}
              onBack={() => setOpenStories(false)}
              onOpenDetails={(p) => { onSelect(p); setOpenStories(false) }}
            />
          )}

          {/* Post / Reel viewer from grid click */}
          {openPost && (openPost.tipo || '').toLowerCase() === 'historia' ? (
            <StoryView
              stories={storiesForProject.length > 0 ? storiesForProject : [openPost]}
              onBack={() => setOpenPost(null)}
              onOpenDetails={(p) => { onSelect(p); setOpenPost(null) }}
            />
          ) : openPost ? (
            <InstaPostView
              pub={openPost}
              onBack={() => setOpenPost(null)}
              onOpenDetails={() => { onSelect(openPost); setOpenPost(null) }}
            />
          ) : null}

          {/* Home indicator */}
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 rounded-full" style={{ width: '120px', height: '5px', backgroundColor: '#111', opacity: 0.18 }} />
        </div>
      </div>

      )}

    </div>
  )
}
