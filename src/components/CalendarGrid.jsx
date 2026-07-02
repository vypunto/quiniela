import { useMemo } from 'react'
import { getProjectColor } from '../utils/colors'
import { sameDay } from '../utils/dateUtils'
import { TypeIcon } from './Icons'

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MAX_VISIBLE = 3

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
  const numRows = cells.length / 7

  const todayRowIndex = useMemo(() => {
    for (let i = 0; i < cells.length; i++) {
      if (cells[i] && sameDay(cells[i].date, today)) return Math.floor(i / 7)
    }
    return -1
  }, [cells, today])

  const filterColor = activeFilter ? getProjectColor(activeFilter) : null

  return (
    <div
      className="bg-white dark:bg-gray-900 rounded-2xl shadow border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col"
      style={{ height: 'calc(100dvh - 260px)', minHeight: '340px', maxHeight: '780px' }}
    >
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex-shrink-0">
        {DAYS.map(d => (
          <div key={d} className="py-2.5 sm:py-3 text-center text-[11px] sm:text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div
        className="grid grid-cols-7 divide-x divide-y divide-gray-100 dark:divide-gray-800 flex-1"
        style={{ gridTemplateRows: `repeat(${numRows}, 1fr)` }}
      >
        {cells.map((cell, i) => {
          const rowIndex = Math.floor(i / 7)
          const isCurrentWeekRow = rowIndex === todayRowIndex

          if (!cell) return (
            <div key={i} className={`${isCurrentWeekRow ? 'bg-[#732442]/[0.03] dark:bg-[#732442]/[0.06]' : 'bg-gray-100/40 dark:bg-gray-800/30'}`} />
          )

          const isToday = sameDay(cell.date, today)
          const isPast = cell.date < today && !isToday
          const allPubs = publications.filter(p => p.fecha && sameDay(p.fecha, cell.date))
          const pubs = filtered.filter(p => p.fecha && sameDay(p.fecha, cell.date))
          const visible = pubs.slice(0, MAX_VISIBLE)
          const overflow = pubs.length - MAX_VISIBLE

          // Cell background
          let cellClassName = 'flex flex-col p-1 sm:p-1.5 overflow-hidden relative'
          let cellStyle = {}

          if (isToday) {
            cellClassName += ' bg-rose-50/70 dark:bg-rose-950/20'
          } else if (activeFilter && pubs.length > 0 && filterColor) {
            cellStyle = { backgroundColor: filterColor.bg + '55' }
          } else if (activeFilter && allPubs.length > 0 && pubs.length === 0) {
            cellClassName += ' opacity-30'
          } else if (isCurrentWeekRow) {
            cellClassName += ' bg-[#732442]/[0.03] dark:bg-[#732442]/[0.06]'
          } else if (isPast) {
            cellClassName += ' bg-gray-50/50 dark:bg-gray-800/20'
          }

          return (
            <div key={i} className={cellClassName} style={cellStyle}>
              <div className="mb-0.5 flex justify-start flex-shrink-0">
                <span className={`relative text-xs sm:text-sm font-black w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full
                  ${isToday ? 'bg-[#732442] text-white' : isCurrentWeekRow ? 'text-[#732442]' : 'text-gray-600 dark:text-gray-300'}`}>
                  {cell.day}
                  {isToday && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#732442] opacity-60" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#732442]" />
                      </span>
                    </span>
                  )}
                </span>
              </div>
              <div className="space-y-0.5 flex-1 min-h-0 overflow-hidden">
                {visible.map(pub => {
                  const color = getProjectColor(pub.proyecto)
                  return (
                    <button
                      key={pub.id}
                      onClick={() => onSelect(pub)}
                      className="w-full text-left px-1 sm:px-1.5 py-0.5 rounded-md text-[10px] sm:text-xs flex items-center gap-0.5 sm:gap-1 active:brightness-90 hover:brightness-90 transition-all"
                      style={{ backgroundColor: color.bg }}
                    >
                      <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color.dot }} />
                      <span className="truncate flex-1 font-semibold leading-tight hidden sm:block" style={{ color: color.text }}>
                        {pub.titulo || pub.proyecto}
                      </span>
                      <span className="truncate flex-1 font-semibold leading-tight sm:hidden" style={{ color: color.text }}>
                        {pub.proyecto}
                      </span>
                      {pub.tipo && (
                        <span className="flex-shrink-0 opacity-60 hidden sm:block" style={{ color: color.text }}>
                          <TypeIcon tipo={pub.tipo} size={11} />
                        </span>
                      )}
                    </button>
                  )
                })}
                {overflow > 0 && (
                  <div className="text-[10px] text-gray-400 dark:text-gray-500 pl-0.5 font-medium">+{overflow} más</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
