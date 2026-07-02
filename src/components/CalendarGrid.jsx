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

  return (
    <div
      className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden flex flex-col"
      style={{ height: 'calc(100dvh - 260px)', minHeight: '340px', maxHeight: '780px' }}
    >
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        {DAYS.map(d => (
          <div key={d} className="py-2 sm:py-2.5 text-center text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider">{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div
        className="grid grid-cols-7 divide-x divide-y divide-gray-100 flex-1"
        style={{ gridTemplateRows: `repeat(${numRows}, 1fr)` }}
      >
        {cells.map((cell, i) => {
          const rowIndex = Math.floor(i / 7)
          const isCurrentWeekRow = rowIndex === todayRowIndex

          if (!cell) return (
            <div key={i} className={isCurrentWeekRow ? 'bg-[#732442]/[0.03]' : 'bg-gray-100/40'} />
          )

          const isToday = sameDay(cell.date, today)
          const isPast = cell.date < today && !isToday
          const pubs = filtered.filter(p => p.fecha && sameDay(p.fecha, cell.date))
          const visible = pubs.slice(0, MAX_VISIBLE)
          const overflow = pubs.length - MAX_VISIBLE

          let cellBg = ''
          if (isToday) cellBg = 'bg-rose-50/70'
          else if (isCurrentWeekRow) cellBg = 'bg-[#732442]/[0.03]'
          else if (isPast) cellBg = 'bg-gray-50/50'

          return (
            <div key={i} className={`flex flex-col p-1 sm:p-1.5 overflow-hidden ${cellBg}`}>
              <div className="mb-0.5 flex justify-start flex-shrink-0">
                <span className={`text-[10px] sm:text-xs font-semibold w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full
                  ${isToday ? 'bg-[#732442] text-white' : isCurrentWeekRow ? 'text-[#732442] font-black' : 'text-gray-500'}`}>
                  {cell.day}
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
                      <span className="truncate flex-1 font-medium leading-tight hidden sm:block" style={{ color: color.text }}>
                        {pub.titulo || pub.proyecto}
                      </span>
                      <span className="truncate flex-1 font-medium leading-tight sm:hidden" style={{ color: color.text }}>
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
                  <div className="text-[10px] text-gray-400 pl-0.5">+{overflow}</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
