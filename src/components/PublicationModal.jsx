import { useState, useEffect, useRef } from 'react'
import { getProjectColor } from '../utils/colors'
import { formatDate } from '../utils/dateUtils'
import { TypeIcon } from './Icons'

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-150"
      style={copied
        ? { backgroundColor: '#DCFCE7', color: '#166534' }
        : { backgroundColor: '#F3F4F6', color: '#374151' }
      }
    >
      {copied ? (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l2.5 2.5L10 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="4" y="4" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.2"/><path d="M4 4V3a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
      )}
      {copied ? 'Copiado' : 'Copiar copy'}
    </button>
  )
}

function getMediaEmbed(url) {
  if (!url || !url.startsWith('http')) return null
  const driveFile = url.match(/drive\.google\.com\/file\/d\/([^/?]+)/)
  if (driveFile) return { kind: 'iframe', src: `https://drive.google.com/file/d/${driveFile[1]}/preview` }
  const driveOpen = url.match(/drive\.google\.com\/open\?id=([^&]+)/)
  if (driveOpen) return { kind: 'iframe', src: `https://drive.google.com/file/d/${driveOpen[1]}/preview` }
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?]+)/)
  if (yt) return { kind: 'iframe', src: `https://www.youtube.com/embed/${yt[1]}` }
  if (/\.(mp4|mov|avi|webm)$/i.test(url)) return { kind: 'video', src: url }
  if (url.includes('unsplash.com')) return { kind: 'image', src: url }
  if (/\.(jpg|jpeg|png|gif|webp|svg|avif)$/i.test(url)) return { kind: 'image', src: url }
  return { kind: 'link', src: url }
}

const FullscreenIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <path d="M2 6V2h4M10 2h4v4M14 10v4h-4M6 14H2v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

function MediaLightbox({ embed, onClose }) {
  useEffect(() => {
    const handle = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-8"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ animation: 'fadeIn 150ms ease' }}
    >
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-4xl">
        {embed.kind === 'iframe' && (
          <div className="rounded-2xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
            <iframe src={embed.src} className="w-full h-full border-0" allow="autoplay; encrypted-media" allowFullScreen title="preview" />
          </div>
        )}
        {embed.kind === 'image' && (
          <img
            src={embed.src}
            alt=""
            className="w-full h-auto max-h-[85vh] object-contain rounded-2xl"
            onError={e => { e.target.style.display = 'none' }}
          />
        )}
        {embed.kind === 'video' && (
          <video src={embed.src} controls autoPlay className="w-full rounded-2xl max-h-[85vh]" />
        )}
      </div>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all duration-150 hover:bg-white/10"
        style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  )
}

export default function PublicationModal({ publication: pub, allPublications = [], onNavigate, onClose }) {
  const color = getProjectColor(pub.proyecto)
  const embed = getMediaEmbed(pub.media)
  const [lightbox, setLightbox] = useState(false)

  const currentIndex = allPublications.findIndex(p => p.id === pub.id)
  const prevPub = currentIndex > 0 ? allPublications[currentIndex - 1] : null
  const nextPub = currentIndex < allPublications.length - 1 ? allPublications[currentIndex + 1] : null

  const touchStartX = useRef(null)

  useEffect(() => {
    const handle = e => {
      if (lightbox) return
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && prevPub) onNavigate(prevPub)
      if (e.key === 'ArrowRight' && nextPub) onNavigate(nextPub)
    }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [onClose, prevPub, nextPub, onNavigate, lightbox])

  const onTouchStart = e => { touchStartX.current = e.touches[0].clientX }
  const onTouchEnd = e => {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (dx > 60 && prevPub) onNavigate(prevPub)
    if (dx < -60 && nextPub) onNavigate(nextPub)
    touchStartX.current = null
  }

  const canExpand = embed && embed.kind !== 'link'

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6"
        onClick={e => { if (e.target === e.currentTarget) onClose() }}
      >
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[6px]" onClick={onClose} />

        <div
          className="relative bg-white rounded-t-[28px] sm:rounded-[24px] sm:max-w-xl w-full overflow-hidden max-h-[94vh] sm:max-h-[88vh] flex flex-col"
          style={{
            animation: 'modalIn 200ms cubic-bezier(0.16,1,0.3,1)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.14), 0 32px 80px rgba(0,0,0,0.08)',
          }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* Mobile drag handle */}
          <div className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0" style={{ backgroundColor: color.bg }}>
            <div className="w-8 h-1 rounded-full" style={{ backgroundColor: color.dot, opacity: 0.3 }} />
          </div>

          {/* Colored header zone */}
          <div style={{ backgroundColor: color.bg }} className="flex-shrink-0">
            <div className="flex items-start justify-between px-6 pt-5 pb-6">
              <div className="flex-1 min-w-0 pr-3">
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  <div
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold"
                    style={{ backgroundColor: color.dot, color: '#fff' }}
                  >
                    {pub.proyecto}
                  </div>
                  {pub.tipo && (
                    <div
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium"
                      style={{ backgroundColor: 'rgba(0,0,0,0.07)', color: color.text }}
                    >
                      <TypeIcon tipo={pub.tipo} size={11} />
                      <span className="capitalize">{pub.tipo}</span>
                    </div>
                  )}
                </div>
                {pub.fecha && (
                  <div className="text-xs font-medium tracking-wide" style={{ color: color.text, opacity: 0.55 }}>
                    {formatDate(pub.fecha)}
                  </div>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-150 hover:brightness-90"
                style={{ backgroundColor: 'rgba(0,0,0,0.09)', color: color.text }}
              >
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Scrollable content */}
          <div className="overflow-y-auto flex-1">
            {pub.titulo && (
              <div className="px-6 pt-5 pb-3">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 leading-tight">{pub.titulo}</h2>
              </div>
            )}

            {embed && (
              <div className="px-6 pb-5">
                {embed.kind === 'link' ? (
                  <a
                    href={embed.src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-4 rounded-xl text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                    style={{ backgroundColor: '#F8FAFF', border: '1px solid #E8EFFF' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M5 7a4 4 0 0 0 5.66.75l1.5-1.5a4 4 0 0 0-5.66-5.66L5 2.09" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                      <path d="M9 7a4 4 0 0 0-5.66-.75L1.84 7.75A4 4 0 0 0 7.5 13.41L9 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    </svg>
                    <span className="truncate">{embed.src}</span>
                  </a>
                ) : (
                  /* Fixed-size masked media preview */
                  <div
                    className="relative rounded-2xl overflow-hidden cursor-pointer group"
                    style={{
                      aspectRatio: embed.kind === 'iframe' ? '16/9' : '4/3',
                      border: '1px solid #F0F0F0',
                      backgroundColor: '#F9FAFB',
                    }}
                    onClick={() => canExpand && setLightbox(true)}
                  >
                    {embed.kind === 'iframe' && (
                      <iframe
                        src={embed.src}
                        className="w-full h-full border-0 pointer-events-none"
                        allow="autoplay; encrypted-media"
                        title="preview"
                      />
                    )}
                    {embed.kind === 'image' && (
                      <img
                        src={embed.src}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={e => { e.target.style.display = 'none' }}
                      />
                    )}
                    {embed.kind === 'video' && (
                      <video src={embed.src} className="w-full h-full object-cover" />
                    )}

                    {/* Fullscreen button */}
                    <div
                      className="absolute bottom-3 right-3 w-8 h-8 rounded-xl flex items-center justify-center text-white transition-all duration-150 opacity-0 group-hover:opacity-100"
                      style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
                    >
                      <FullscreenIcon />
                    </div>

                    {/* Fullscreen hint on mobile (always visible) */}
                    <div
                      className="sm:hidden absolute bottom-3 right-3 w-8 h-8 rounded-xl flex items-center justify-center text-white"
                      style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
                    >
                      <FullscreenIcon />
                    </div>
                  </div>
                )}
              </div>
            )}

            {pub.copy && (
              <div className="px-6 pb-5">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.12em] mb-2">Copy</div>
                <div
                  className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed p-4 rounded-2xl"
                  style={{ backgroundColor: '#F9FAFB', border: '1px solid #F0F0F0' }}
                >
                  {pub.copy}
                </div>
              </div>
            )}

            {(pub.copy || pub.media) && (
              <div className="px-6 pb-6 flex gap-2 flex-wrap">
                {pub.copy && <CopyButton text={pub.copy} />}
                {pub.media && pub.media.startsWith('http') && (
                  <a
                    href={pub.media}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-150"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4 6a3 3 0 0 0 4.24.56l1.12-1.12a3 3 0 0 0-4.24-4.24L4 2.32" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><path d="M8 6a3 3 0 0 0-4.24-.56L2.64 6.56A3 3 0 0 0 6.88 10.8L8 9.68" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                    Abrir media
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Prev / Next navigation */}
          {(prevPub || nextPub) && (
            <div className="flex border-t flex-shrink-0" style={{ borderColor: '#F0F0F0', backgroundColor: '#FAFAFA' }}>
              <button
                onClick={() => prevPub && onNavigate(prevPub)}
                disabled={!prevPub}
                className="flex-1 min-w-0 flex items-center gap-2.5 px-4 py-4 hover:bg-gray-100/60 transition-all duration-150 disabled:opacity-20 disabled:cursor-default"
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-white"
                  style={{ border: '1px solid #E8EAED', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
                >
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M9 11L5 7l4-4" stroke="#374151" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <span className="text-xs font-semibold text-gray-500 truncate">{prevPub?.titulo || prevPub?.proyecto || 'Anterior'}</span>
              </button>
              <div className="w-px my-3 flex-shrink-0" style={{ backgroundColor: '#ECEDEF' }} />
              <button
                onClick={() => nextPub && onNavigate(nextPub)}
                disabled={!nextPub}
                className="flex-1 min-w-0 flex items-center justify-end gap-2.5 px-4 py-4 hover:bg-gray-100/60 transition-all duration-150 disabled:opacity-20 disabled:cursor-default"
              >
                <span className="text-xs font-semibold text-gray-500 truncate">{nextPub?.titulo || nextPub?.proyecto || 'Siguiente'}</span>
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-white"
                  style={{ border: '1px solid #E8EAED', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
                >
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="#374151" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {lightbox && embed && (
        <MediaLightbox embed={embed} onClose={() => setLightbox(false)} />
      )}
    </>
  )
}
