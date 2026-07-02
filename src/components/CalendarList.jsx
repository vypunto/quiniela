import { useMemo } from 'react'
import { getProjectColor } from '../utils/colors'
import { formatDate, DAYS_ES, MONTHS_ES } from '../utils/dateUtils'

export default function CalendarList({ year, month, publications, onSelect }) {
  const grouped = useMemo(() => {
    const inMonth = publications.filter(p => {
      if (!p.fecha) return false
      return p.fecha.getFullYear() === year && p.fecha.getMonth() === month
    })

    inMonth.sort((a, b) => a.fecha - b.fecha)

    const map = new Map()
    inMonth.forEach(pub => {
      const key = pub.fecha.getDate()
      if (!map.has(key)) map.set(key, { day: key, date: pub.fecha, pubs: [] })
      map.get(key).pubs.push(pub)
    })

    return Array.from(map.values()).sort((a, b) => a.day - b.day)
  }, [year, month, publications])

  if (grouped.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <div className="text-4xl mb-3">📭</div>
        <p className="text-sm">No hay publicaciones este mes</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {grouped.map(({ day, date, pubs }) => (
        <div key={day}>
          {/* Date header */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900 leading-none">{day}</span>
              <div>
                <div className="text-xs font-semibold text-gray-500 leading-none">
                  {DAYS_ES[date.getDay()].toUpperCase()}
                </div>
                <div className="text-xs text-gray-400 leading-none mt-0.5">
                  {MONTHS_ES[date.getMonth()]}
                </div>
              </div>
            </div>
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">{pubs.length} publicación{pubs.length > 1 ? 'es' : ''}</span>
          </div>

          {/* Publication cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pubs.map(pub => {
              const color = getProjectColor(pub.proyecto)
              const isVideo = pub.media && /\.(mp4|mov|avi|webm)$/i.test(pub.media)
              const isImage = pub.media && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(pub.media)
              const hasMedia = pub.media && (isVideo || isImage || pub.media.startsWith('http'))

              return (
                <button
                  key={pub.id}
                  onClick={() => onSelect(pub)}
                  className="text-left bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden group"
                >
                  {/* Colored top bar */}
                  <div className="h-1" style={{ backgroundColor: color.dot }} />

                  {/* Media preview */}
                  {hasMedia && isImage && (
                    <div className="h-32 overflow-hidden bg-gray-100">
                      <img
                        src={pub.media}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={e => { e.target.parentElement.style.display = 'none' }}
                      />
                    </div>
                  )}
                  {hasMedia && isVideo && (
                    <div className="h-32 bg-gray-900 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
                          <path d="M6 4l6 4-6 4V4z"/>
                        </svg>
                      </div>
                    </div>
                  )}

                  <div className="p-3">
                    {/* Project tag */}
                    <div
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mb-2"
                      style={{ backgroundColor: color.bg, color: color.text }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color.dot }} />
                      {pub.proyecto}
                    </div>

                    {/* Title */}
                    {pub.titulo && (
                      <div className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2 leading-snug">
                        {pub.titulo}
                      </div>
                    )}

                    {/* Copy preview */}
                    {pub.copy && (
                      <div className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
                        {pub.copy}
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
