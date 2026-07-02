import { useEffect } from 'react'
import { getProjectColor } from '../utils/colors'
import { formatDate } from '../utils/dateUtils'

export default function PublicationModal({ publication: pub, onClose }) {
  const color = getProjectColor(pub.proyecto)
  const isVideo = pub.media && /\.(mp4|mov|avi|webm)$/i.test(pub.media)
  const isImage = pub.media && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(pub.media)
  const isUrl = pub.media && pub.media.startsWith('http')

  useEffect(() => {
    const handle = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col">
        {/* Colored top bar */}
        <div className="h-1.5" style={{ backgroundColor: color.dot }} />

        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-3">
          <div>
            <div
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mb-2"
              style={{ backgroundColor: color.bg, color: color.text }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color.dot }} />
              {pub.proyecto}
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
          {pub.media && (
            <div className="px-5 pb-3">
              {isImage ? (
                <img
                  src={pub.media}
                  alt=""
                  className="w-full rounded-xl object-cover max-h-64"
                  onError={e => { e.target.style.display = 'none' }}
                />
              ) : isVideo ? (
                <video
                  src={pub.media}
                  controls
                  className="w-full rounded-xl max-h-64"
                />
              ) : isUrl ? (
                <a
                  href={pub.media}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl text-sm text-blue-600 hover:bg-gray-100 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M5 7a4 4 0 0 0 5.66.75l1.5-1.5a4 4 0 0 0-5.66-5.66L5 2.09" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    <path d="M9 7a4 4 0 0 0-5.66-.75L1.84 7.75A4 4 0 0 0 7.5 13.41L9 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                  <span className="truncate">{pub.media}</span>
                </a>
              ) : (
                <div className="text-sm text-gray-400 bg-gray-50 rounded-xl p-3">{pub.media}</div>
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
