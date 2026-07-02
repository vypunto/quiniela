import { useMemo } from 'react'
import { getProjectColor } from '../utils/colors'
import { DAYS_ES, MONTHS_ES } from '../utils/dateUtils'
import { TypeIcon } from './Icons'


export default function CalendarList({ year, month, publications, onSelect, activeFilter }) {
  const filtered = activeFilter.length > 0 ? publications.filter(p => activeFilter.includes(p.proyecto)) : publications
  const today = new Date()

  const weeks = useMemo(() => {
    const inMonth = filtered
      .filter(p => p.fecha && p.fecha.getFullYear() === year && p.fecha.getMonth() === month)
      .sort((a, b) => a.fecha - b.fecha)

    const map = new Map()
    inMonth.forEach(pub => {
      const d = new Date(pub.fecha.getFullYear(), pub.fecha.getMonth(), pub.fecha.getDate())
      const dayOfWeek = d.getDay() === 0 ? 6 : d.getDay() - 1
      d.setDate(d.getDate() - dayOfWeek)
      const key = d.toISOString().slice(0, 10)
      if (!map.has(key)) map.set(key, { weekStart: new Date(d), pubs: [] })
      map.get(key).pubs.push(pub)
    })

    return Array.from(map.values()).sort((a, b) => a.weekStart - b.weekStart)
  }, [year, month, filtered])

  if (weeks.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <div className="text-4xl mb-3">📭</div>
        <p className="text-sm">{activeFilter.length > 0 ? `Sin publicaciones de los proyectos seleccionados este mes` : 'No hay publicaciones este mes'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {weeks.map(({ weekStart, pubs }) => {
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekEnd.getDate() + 6)
        const isCurrentWeek = today >= weekStart && today <= weekEnd
        const label = `${weekStart.getDate()}–${Math.min(weekEnd.getDate(), new Date(year, month + 1, 0).getDate())} ${MONTHS_ES[month]}`

        return (
          <div key={weekStart.getTime()} className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
            {/* Week header */}
            <div
              className="flex items-center justify-between px-4 py-2.5 border-b"
              style={isCurrentWeek
                ? { backgroundColor: 'rgba(115,36,66,0.06)', borderColor: 'rgba(115,36,66,0.15)' }
                : { backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }
              }
            >
              <span className="text-xs font-bold uppercase tracking-wider" style={isCurrentWeek ? { color: '#732442' } : { color: '#6b7280' }}>
                {label}
              </span>
              <span className="text-xs text-gray-400">{pubs.length} publicación{pubs.length > 1 ? 'es' : ''}</span>
            </div>

            {/* Rows */}
            <div className="divide-y divide-gray-100">
              {pubs.map(pub => {
                const color = getProjectColor(pub.proyecto)
                const day = pub.fecha.getDate()
                const dayName = DAYS_ES[pub.fecha.getDay()].slice(0, 3).toUpperCase()

                return (
                  <button
                    key={pub.id}
                    onClick={() => onSelect(pub)}
                    className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group"
                  >
                    {/* Date */}
                    <div className="w-10 text-center flex-shrink-0">
                      <div className="text-xs text-gray-400 leading-none">{dayName}</div>
                      <div className="text-base font-bold text-gray-800 leading-tight">{day}</div>
                    </div>

                    {/* Color bar */}
                    <div className="w-1 h-9 rounded-full flex-shrink-0" style={{ backgroundColor: color.dot }} />

                    {/* Project chip */}
                    <div
                      className="px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0"
                      style={{ backgroundColor: color.bg, color: color.text }}
                    >
                      {pub.proyecto}
                    </div>

                    {/* Title */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-800 truncate group-hover:text-black transition-colors">
                        {pub.titulo || pub.proyecto}
                      </div>
                      {pub.copy && (
                        <div className="text-xs text-gray-400 truncate mt-0.5">{pub.copy}</div>
                      )}
                    </div>

                    {/* Type icon */}
                    <div className="flex-shrink-0 text-gray-400">
                      <TypeIcon tipo={pub.tipo} size={16} />
                    </div>

                    {/* Arrow */}
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0 text-gray-300 group-hover:text-gray-500 transition-colors">
                      <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
