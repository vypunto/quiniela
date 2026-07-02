import { useMemo } from 'react'
import { getProjectColor } from '../utils/colors'
import { sameDay } from '../utils/dateUtils'

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MAX_VISIBLE = 3

export default function CalendarGrid({ year, month, publications, onSelect }) {
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
      const pubs = publications.filter(p => p.fecha && sameDay(p.fecha, date))
      return { day: dayNum, date, pubs }
    })
  }, [year, month, publications])

  const today = new Date()

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
        {DAYS.map(d => (
          <div key={d} className="py-2.5 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {d}
          </div>
        ))}
      </div>

      {/* Grid cells */}
      <div className="grid grid-cols-7 divide-x divide-y divide-gray-100">
        {cells.map((cell, i) => {
          if (!cell) {
            return (
              <div
                key={i}
                className="min-h-[120px] bg-gray-50/30"
                style={{ borderRight: '1px solid #f3f4f6', borderBottom: '1px solid #f3f4f6' }}
              />
            )
          }

          const isToday = sameDay(cell.date, today)
          const visible = cell.pubs.slice(0, MAX_VISIBLE)
          const overflow = cell.pubs.length - MAX_VISIBLE

          return (
            <div key={i} className="min-h-[120px] p-1.5 hover:bg-gray-50/50 transition-colors">
              {/* Day number */}
              <div className="mb-1 flex justify-end sm:justify-start">
                <span className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full
                  ${isToday ? 'bg-black text-white' : 'text-gray-500'}`}>
                  {cell.day}
                </span>
              </div>

              {/* Publications */}
              <div className="space-y-0.5">
                {visible.map(pub => {
                  const color = getProjectColor(pub.proyecto)
                  return (
                    <button
                      key={pub.id}
                      onClick={() => onSelect(pub)}
                      className="w-full text-left px-1.5 py-1 rounded-md text-xs flex items-start gap-1.5 hover:brightness-95 transition-all group"
                      style={{ backgroundColor: color.bg }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full mt-0.5 flex-shrink-0"
                        style={{ backgroundColor: color.dot }}
                      />
                      <div className="min-w-0 flex-1">
                        <div
                          className="truncate font-medium leading-tight"
                          style={{ color: color.text }}
                        >
                          {pub.titulo || pub.proyecto}
                        </div>
                        <div
                          className="truncate text-xs opacity-70 leading-tight hidden sm:block"
                          style={{ color: color.text }}
                        >
                          {pub.proyecto}
                        </div>
                      </div>
                    </button>
                  )
                })}
                {overflow > 0 && (
                  <button
                    onClick={() => onSelect(cell.pubs[MAX_VISIBLE])}
                    className="text-xs text-gray-400 hover:text-gray-600 pl-1 transition-colors"
                  >
                    +{overflow} más
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
