import { useMemo } from 'react'
import { getProjectColor } from '../utils/colors'
import { sameDay } from '../utils/dateUtils'

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MAX_VISIBLE = 3

function TypeIcon({ tipo }) {
  if (tipo === 'video') return <span title="Vídeo">🎬</span>
  if (tipo === 'imagen') return <span title="Imagen">🖼️</span>
  return null
}

export default function CalendarGrid({ year, month, publications, onSelect, activeFilter }) {
  const filtered = activeFilter ? publications.filter(p => p.proyecto === activeFilter) : publications

  const cells = useMemo(() => {
    const firstDay = new Date(year, month, 1)
    let startOffset = firstDay.getDay() - 1
    if (startOffset < 0) startOffset = 6
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7
    return Array.from({ length: totalCells }, (_, i) => {
      const dayNum = i - startOffset + 1
      if (dayNum < 1 || dayNum > daysInMonth) return null
      const date = new Date(year, month, dayNum)
      return { day: dayNum, date }
    })
  }, [year, month])

  const today = new Date()

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
        {DAYS.map(d => (
          <div key={d} className="py-2.5 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 divide-x divide-y divide-gray-100">
        {cells.map((cell, i) => {
          if (!cell) return <div key={i} className="min-h-[110px] bg-gray-50/30" />

          const isToday = sameDay(cell.date, today)
          const pubs = filtered.filter(p => p.fecha && sameDay(p.fecha, cell.date))
          const visible = pubs.slice(0, MAX_VISIBLE)
          const overflow = pubs.length - MAX_VISIBLE

          return (
            <div key={i} className="min-h-[110px] p-1.5">
              <div className="mb-1 flex justify-start">
                <span className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full
                  ${isToday ? 'bg-black text-white' : 'text-gray-500'}`}>
                  {cell.day}
                </span>
              </div>
              <div className="space-y-0.5">
                {visible.map(pub => {
                  const color = getProjectColor(pub.proyecto)
                  return (
                    <button
                      key={pub.id}
                      onClick={() => onSelect(pub)}
                      className="w-full text-left px-1.5 py-0.5 rounded-md text-xs flex items-center gap-1 hover:brightness-90 transition-all"
                      style={{ backgroundColor: color.bg }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color.dot }} />
                      <span className="truncate flex-1 font-medium leading-tight" style={{ color: color.text }}>
                        {pub.titulo || pub.proyecto}
                      </span>
                      {pub.tipo && (
                        <span className="text-xs leading-none flex-shrink-0">
                          {pub.tipo === 'video' ? '🎬' : pub.tipo === 'imagen' ? '🖼️' : ''}
                        </span>
                      )}
                    </button>
                  )
                })}
                {overflow > 0 && (
                  <div className="text-xs text-gray-400 pl-1">+{overflow} más</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
