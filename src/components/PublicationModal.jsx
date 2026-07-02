import { useState, useEffect } from 'react'
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
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
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

function getMediaEmbed(url, tipo) {
  if (!url || !url.startsWith('http')) return null

  // Google Drive: /file/d/ID/view or /open?id=ID
  const driveFile = url.match(/drive\.google\.com\/file\/d\/([^/?]+)/)
  if (driveFile) return { kind: 'iframe', src: `https://drive.google.com/file/d/${driveFile[1]}/preview` }
  const driveOpen = url.match(/drive\.google\.com\/open\?id=([^&]+)/)
  if (driveOpen) return { kind: 'iframe', src: `https://drive.google.com/file/d/${driveOpen[1]}/preview` }

  // YouTube
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?]+)/)
  if (yt) return { kind: 'iframe', src: `https://www.youtube.com/embed/${yt[1]}` }

  // Direct video
  if (/\.(mp4|mov|avi|webm)$/i.test(url)) return { kind: 'video', src: url }

  // Unsplash
  if (url.includes('unsplash.com')) return { kind: 'image', src: url }

  // Direct image
  if (/\.(jpg|jpeg|png|gif|webp|svg|avif)$/i.test(url)) return { kind: 'image', src: url }

  // Any other http link
  return { kind: 'link', src: url }
}

export default function PublicationModal({ publication: pub, onClose }) {
  const color = getProjectColor(pub.proyecto)
  const embed = getMediaEmbed(pub.media, pub.tipo)

  useEffect(() => {
    const handle = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal — bottom sheet on mobile, centered on desktop */}
      <div
        className="relative bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl shadow-2xl sm:max-w-lg w-full overflow-hidden max-h-[92vh] sm:max-h-[90vh] flex flex-col"
        style={{ animation: 'modalIn 180ms cubic-bezier(0.16,1,0.3,1)' }}
      >
        {/* Mobile drag handle */}
        <div className="sm:hidden flex justify-center pt-2 pb-1 flex-shrink-0" style={{ backgroundColor: color.bg }}>
          <div className="w-8 h-1 rounded-full" style={{ backgroundColor: color.dot, opacity: 0.4 }} />
        </div>

        {/* Colored header zone */}
        <div style={{ backgroundColor: color.bg }} className="flex-shrink-0">
          <div className="flex items-start justify-between px-5 pt-4 pb-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <div
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: color.dot, color: '#fff' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
                  {pub.proyecto}
                </div>
                {pub.tipo && (
                  <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(0,0,0,0.08)', color: color.text }}>
                    <TypeIcon tipo={pub.tipo} size={12} />
                    <span className="capitalize">{pub.tipo}</span>
                  </div>
                )}
              </div>
              {pub.fecha && (
                <div className="text-xs" style={{ color: color.text, opacity: 0.7 }}>
                  {formatDate(pub.fecha)}
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl flex items-center justify-center ml-3 flex-shrink-0 transition-colors"
              style={{ backgroundColor: 'rgba(0,0,0,0.08)', color: color.text }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1">
          {/* Title */}
          {pub.titulo && (
            <div className="px-5 pt-4 pb-3">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-snug">{pub.titulo}</h2>
            </div>
          )}

          {/* Media */}
          {embed && (
            <div className="px-5 pb-3">
              {embed.kind === 'iframe' && (
                <div className="rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800" style={{ aspectRatio: '16/9' }}>
                  <iframe
                    src={embed.src}
                    className="w-full h-full border-0"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    title="preview"
                  />
                </div>
              )}
              {embed.kind === 'image' && (
                <img
                  src={embed.src}
                  alt=""
                  className="w-full rounded-xl object-cover max-h-72"
                  onError={e => { e.target.style.display = 'none' }}
                />
              )}
              {embed.kind === 'video' && (
                <video src={embed.src} controls className="w-full rounded-xl max-h-72" />
              )}
              {embed.kind === 'link' && (
                <a
                  href={embed.src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M5 7a4 4 0 0 0 5.66.75l1.5-1.5a4 4 0 0 0-5.66-5.66L5 2.09" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    <path d="M9 7a4 4 0 0 0-5.66-.75L1.84 7.75A4 4 0 0 0 7.5 13.41L9 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                  <span className="truncate">{embed.src}</span>
                </a>
              )}
            </div>
          )}

          {/* Copy */}
          {pub.copy && (
            <div className="px-5 pb-5">
              <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Copy</div>
              <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                {pub.copy}
              </div>
            </div>
          )}

          {/* Quick actions */}
          {(pub.copy || pub.media) && (
            <div className="px-5 pb-5 flex gap-2 flex-wrap">
              {pub.copy && (
                <CopyButton text={pub.copy} />
              )}
              {pub.media && pub.media.startsWith('http') && (
                <a
                  href={pub.media}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4 6a3 3 0 0 0 4.24.56l1.12-1.12a3 3 0 0 0-4.24-4.24L4 2.32" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><path d="M8 6a3 3 0 0 0-4.24-.56L2.64 6.56A3 3 0 0 0 6.88 10.8L8 9.68" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                  Abrir media
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
