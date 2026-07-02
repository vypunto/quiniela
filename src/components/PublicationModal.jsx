import { useEffect } from 'react'
import { getProjectColor } from '../utils/colors'
import { formatDate } from '../utils/dateUtils'
import { TypeIcon } from './Icons'

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

  // Direct image
  if (/\.(jpg|jpeg|png|gif|webp|svg|avif|webp)$/i.test(url)) return { kind: 'image', src: url }

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
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl sm:max-w-lg w-full overflow-hidden max-h-[92vh] sm:max-h-[90vh] flex flex-col">
        {/* Mobile drag handle */}
        <div className="sm:hidden flex justify-center pt-2 pb-1 flex-shrink-0">
          <div className="w-8 h-1 rounded-full bg-gray-200" />
        </div>
        {/* Colored top bar */}
        <div className="h-1.5" style={{ backgroundColor: color.dot }} />

        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                style={{ backgroundColor: color.bg, color: color.text }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color.dot }} />
                {pub.proyecto}
              </div>
              {pub.tipo && (
                <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                  <TypeIcon tipo={pub.tipo} size={12} />
                  <span className="capitalize">{pub.tipo}</span>
                </div>
              )}
            </div>
            {pub.fecha && (
              <div className="text-xs text-gray-400 capitalize">
                {formatDate(pub.fecha)}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors ml-3 flex-shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1">
          {/* Title */}
          {pub.titulo && (
            <div className="px-5 pb-3">
              <h2 className="text-lg font-bold text-gray-900 leading-snug">{pub.titulo}</h2>
            </div>
          )}

          {/* Media */}
          {embed && (
            <div className="px-5 pb-3">
              {embed.kind === 'iframe' && (
                <div className="rounded-xl overflow-hidden bg-gray-100" style={{ aspectRatio: '16/9' }}>
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
                  className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl text-sm text-blue-600 hover:bg-gray-100 transition-colors"
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
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Copy</div>
              <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-xl p-4">
                {pub.copy}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
