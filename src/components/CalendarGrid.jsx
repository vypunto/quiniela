import { useMemo } from 'react'
import { getProjectColor } from '../utils/colors'
import { sameDay } from '../utils/dateUtils'
import { TypeIcon } from './Icons'

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MAX_VISIBLE = 3

export default function CalendarGrid({ year, month, publications, onSelect, activeFilter }) {
  const hasFilter = activeFilter.length > 0
  const filtered = hasFilter ? publications.filter(p => activeFilter.includes(p.proyecto)) : publications

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
  const numRows = cells.length / 7

  const todayRowIndex = useMemo(() => {
    for (let i = 0; i < cells.length; i++) {
      if (cells[i] && sameDay(cells[i].date, today)) return Math.floor(i / 7)
    }
    return -1
  }, [cells, today])

  const singleFilterColor = activeFilter.length === 1 ? getProjectColor(activeFilter[0]) : null

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden flex flex-col"
      style={{
        height: 'calc(100dvh - 270px)',
        minHeight: '360px',
        maxHeight: '800px',
        border: '1px solid #E8EAED',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.05)',
      }}
    >
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-gray-100 flex-shrink-0">
        {DAYS.map((d, i) => (
          <div
            key={d}
            className="py-3 text-center text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-[0.1em]"
            style={{ borderRight: i < 6 ? '1px solid #F3F4F6' : 'none' }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div
        className="grid grid-cols-7 flex-1"
        style={{ gridTemplateRows: `repeat(${numRows}, 1fr)` }}
      >
        {cells.map((cell, i) => {
          const colIndex = i % 7
          const rowIndex = Math.floor(i / 7)
          const isCurrentWeekRow = rowIndex === todayRowIndex
          const isLastRow = rowIndex === numRows - 1
          const isLastCol = colIndex === 6

          const borderBottom = !isLastRow ? '1px solid #F3F4F6' : 'none'
          const borderRight = !isLastCol ? '1px solid #F3F4F6' : 'none'

          if (!cell) {
            return (
              <div
                key={i}
                style={{
                  backgroundColor: isCurrentWeekRow ? 'rgba(115,36,66,0.015)' : '#F9FAFB',
                  borderBottom,
                  borderRight,
                }}
              />
            )
          }

          const isToday = sameDay(cell.date, today)
          const isPast = cell.date < today && !isToday
          const allPubs = publications.filter(p => p.fecha && sameDay(p.fecha, cell.date))
          const pubs = filtered.filter(p => p.fecha && sameDay(p.fecha, cell.date))
          const visible = pubs.slice(0, MAX_VISIBLE)
          const overflow = pubs.length - MAX_VISIBLE

          let bgColor = 'transparent'
          if (isToday) {
            bgColor = 'rgba(253,242,245,0.8)'
          } else if (hasFilter && pubs.length > 0 && singleFilterColor) {
            bgColor = singleFilterColor.bg + '44'
          } else if (hasFilter && pubs.length > 0) {
            bgColor = 'rgba(0,0,0,0.018)'
          } else if (isCurrentWeekRow) {
            bgColor = 'rgba(115,36,66,0.015)'
          } else if (isPast) {
            bgColor = 'rgba(0,0,0,0.012)'
          }

          const dimOpacity = hasFilter && allPubs.length > 0 && pubs.length === 0

          return (
            <div
              key={i}
              className="flex flex-col p-1.5 sm:p-2 overflow-hidden"
              style={{
                backgroundColor: bgColor,
                opacity: dimOpacity ? 0.3 : 1,
                borderBottom,
                borderRight,
              }}
            >
              {/* Day number */}
              <div className="mb-1 flex justify-start flex-shrink-0">
                <span
                  className={`text-[11px] sm:text-xs font-semibold w-[22px] h-[22px] sm:w-6 sm:h-6 flex items-center justify-center rounded-full transition-colors ${
                    isToday
                      ? 'text-white font-black'
                      : isCurrentWeekRow
                      ? 'text-[#e84530] font-bold'
                      : isPast
                      ? 'text-gray-300'
                      : 'text-gray-700'
                  }`}
                  style={isToday ? { backgroundColor: '#e84530' } : {}}
                >
                  {cell.day}
                  {isToday && (
                    <span className="sr-only">hoy</span>
                  )}
                </span>
              </div>

              {/* Publications */}
              <div className="space-y-0.5 flex-1 min-h-0 overflow-hidden">
                {visible.map(pub => {
                  const color = getProjectColor(pub.proyecto)
                  return (
                    <button
                      key={pub.id}
                      onClick={() => onSelect(pub)}
                      className="w-full text-left px-1.5 py-[3px] sm:py-1 rounded-md text-[9px] sm:text-[10px] flex items-center gap-1 transition-all duration-150 hover:brightness-95 active:brightness-90"
                      style={{ backgroundColor: color.bg }}
                    >
                      <span
                        className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: color.dot }}
                      />
                      <span
                        className="truncate flex-1 font-semibold leading-tight hidden sm:block"
                        style={{ color: color.text }}
                      >
                        {pub.titulo || pub.proyecto}
                      </span>
                      <span
                        className="truncate flex-1 font-semibold leading-tight sm:hidden"
                        style={{ color: color.text }}
                      >
                        {pub.proyecto}
                      </span>
                      {pub.tipo && (
                        <span className="flex-shrink-0 opacity-50 hidden sm:block" style={{ color: color.text }}>
                          <TypeIcon tipo={pub.tipo} size={10} />
                        </span>
                      )}
                    </button>
                  )
                })}
                {overflow > 0 && (
                  <div className="text-[9px] sm:text-[10px] text-gray-400 pl-1 font-medium">
                    +{overflow}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
