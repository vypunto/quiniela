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
      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
      style={copied
        ? { backgroundColor: '#d1fae5', color: '#065f46' }
        : { backgroundColor: '#f3f4f6', color: '#374151' }
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

export default function PublicationModal({ publication: pub, allPublications = [], onNavigate, onClose }) {
  const color = getProjectColor(pub.proyecto)
  const embed = getMediaEmbed(pub.media)

  const currentIndex = allPublications.findIndex(p => p.id === pub.id)
  const prevPub = currentIndex > 0 ? allPublications[currentIndex - 1] : null
  const nextPub = currentIndex < allPublications.length - 1 ? allPublications[currentIndex + 1] : null

  const touchStartX = useRef(null)

  useEffect(() => {
    const handle = e => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && prevPub) onNavigate(prevPub)
      if (e.key === 'ArrowRight' && nextPub) onNavigate(nextPub)
    }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [onClose, prevPub, nextPub, onNavigate])

  const onTouchStart = e => { touchStartX.current = e.touches[0].clientX }
  const onTouchEnd = e => {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (dx > 60 && prevPub) onNavigate(prevPub)
    if (dx < -60 && nextPub) onNavigate(nextPub)
    touchStartX.current = null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl sm:max-w-lg w-full overflow-hidden max-h-[92vh] sm:max-h-[90vh] flex flex-col"
        style={{ animation: 'modalIn 180ms cubic-bezier(0.16,1,0.3,1)' }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Mobile drag handle */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0" style={{ backgroundColor: color.bg }}>
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: color.dot, opacity: 0.35 }} />
        </div>

        {/* Colored header zone */}
        <div style={{ backgroundColor: color.bg }} className="flex-shrink-0">
          <div className="flex items-start justify-between px-5 pt-4 pb-5">
            <div className="flex-1 min-w-0 pr-3">
              <div className="flex items-center gap-2 flex-wrap mb-2.5">
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                  style={{ backgroundColor: color.dot, color: '#fff' }}
                >
                  {pub.proyecto}
                </div>
                {pub.tipo && (
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(0,0,0,0.08)', color: color.text }}>
                    <TypeIcon tipo={pub.tipo} size={12} />
                    <span className="capitalize">{pub.tipo}</span>
                  </div>
                )}
              </div>
              {pub.fecha && (
                <div className="text-xs font-medium" style={{ color: color.text, opacity: 0.65 }}>
                  {formatDate(pub.fecha)}
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
              style={{ backgroundColor: 'rgba(0,0,0,0.1)', color: color.text }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1">
          {pub.titulo && (
            <div className="px-5 pt-5 pb-3">
              <h2 className="text-2xl font-black tracking-tight text-gray-900 leading-tight">{pub.titulo}</h2>
            </div>
          )}

          {embed && (
            <div className="px-5 pb-4">
              {embed.kind === 'iframe' && (
                <div className="rounded-2xl overflow-hidden bg-gray-100 shadow-sm" style={{ aspectRatio: '16/9' }}>
                  <iframe src={embed.src} className="w-full h-full border-0" allow="autoplay; encrypted-media" allowFullScreen title="preview" />
                </div>
              )}
              {embed.kind === 'image' && (
                <img src={embed.src} alt="" className="w-full rounded-2xl object-cover max-h-72 shadow-sm" onError={e => { e.target.style.display = 'none' }} />
              )}
              {embed.kind === 'video' && (
                <video src={embed.src} controls className="w-full rounded-2xl max-h-72" />
              )}
              {embed.kind === 'link' && (
                <a href={embed.src} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3.5 bg-gray-50 rounded-xl text-sm text-blue-600 hover:bg-gray-100 transition-colors">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M5 7a4 4 0 0 0 5.66.75l1.5-1.5a4 4 0 0 0-5.66-5.66L5 2.09" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    <path d="M9 7a4 4 0 0 0-5.66-.75L1.84 7.75A4 4 0 0 0 7.5 13.41L9 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                  <span className="truncate">{embed.src}</span>
                </a>
              )}
            </div>
          )}

          {pub.copy && (
            <div className="px-5 pb-4">
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Copy</div>
              <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-2xl p-4 border border-gray-100">
                {pub.copy}
              </div>
            </div>
          )}

          {(pub.copy || pub.media) && (
            <div className="px-5 pb-6 flex gap-2 flex-wrap">
              {pub.copy && <CopyButton text={pub.copy} />}
              {pub.media && pub.media.startsWith('http') && (
                <a href={pub.media} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4 6a3 3 0 0 0 4.24.56l1.12-1.12a3 3 0 0 0-4.24-4.24L4 2.32" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><path d="M8 6a3 3 0 0 0-4.24-.56L2.64 6.56A3 3 0 0 0 6.88 10.8L8 9.68" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                  Abrir media
                </a>
              )}
            </div>
          )}
        </div>

        {/* Prev / Next navigation */}
        {(prevPub || nextPub) && (
          <div className="flex border-t border-gray-100 flex-shrink-0">
            <button
              onClick={() => prevPub && onNavigate(prevPub)}
              disabled={!prevPub}
              className="flex-1 flex items-center gap-2 px-4 py-3.5 text-xs font-semibold text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-default"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span className="truncate">{prevPub?.titulo || prevPub?.proyecto || 'Anterior'}</span>
            </button>
            <div className="w-px bg-gray-100" />
            <button
              onClick={() => nextPub && onNavigate(nextPub)}
              disabled={!nextPub}
              className="flex-1 flex items-center justify-end gap-2 px-4 py-3.5 text-xs font-semibold text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-default"
            >
              <span className="truncate">{nextPub?.titulo || nextPub?.proyecto || 'Siguiente'}</span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
