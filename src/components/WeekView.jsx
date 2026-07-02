import { useState, useMemo } from 'react'
import { getProjectColor } from '../utils/colors'
import { DAYS_ES } from '../utils/dateUtils'
import { TypeIcon } from './Icons'

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function startOfWeek(date) {
  const d = new Date(date)
  const dow = d.getDay() === 0 ? 6 : d.getDay() - 1
  d.setDate(d.getDate() - dow)
  d.setHours(0, 0, 0, 0)
  return d
}

export default function WeekView({ publications, onSelect, activeFilter }) {
  const filtered = activeFilter ? publications.filter(p => p.proyecto === activeFilter) : publications
  const today = new Date()
  const [weekStart, setWeekStart] = useState(() => startOfWeek(today))

  const days = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart)
      d.setDate(d.getDate() + i)
      return d
    }), [weekStart])

  const prevWeek = () => setWeekStart(w => { const d = new Date(w); d.setDate(d.getDate() - 7); return d })
  const nextWeek = () => setWeekStart(w => { const d = new Date(w); d.setDate(d.getDate() + 7); return d })
  const goToday  = () => setWeekStart(startOfWeek(today))

  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col" style={{ minHeight: '340px' }}>
      {/* Week nav */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex-shrink-0">
        <button onClick={prevWeek} className="w-7 h-7 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8 10L4 6l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div className="text-center">
          <span className="text-xs font-bold text-gray-800 dark:text-gray-100">
            {weekStart.getDate()} – {weekEnd.getDate()} {weekEnd.toLocaleDateString('es-ES', { month: 'long' })} {weekEnd.getFullYear()}
          </span>
          {sameDay(startOfWeek(today), weekStart) && (
            <span className="ml-2 text-[10px] font-semibold text-[#732442] bg-[#732442]/10 px-1.5 py-0.5 rounded-full">Esta semana</span>
          )}
        </div>
        <button onClick={nextWeek} className="w-7 h-7 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>

      {/* Day columns */}
      <div className="grid grid-cols-7 divide-x divide-gray-100 dark:divide-gray-800 flex-1">
        {days.map(day => {
          const isToday = sameDay(day, today)
          const pubs = filtered.filter(p => p.fecha && sameDay(p.fecha, day))
          return (
            <div key={day.toISOString()} className={`flex flex-col min-h-[200px] ${isToday ? 'bg-rose-50/60 dark:bg-rose-950/20' : 'dark:bg-transparent'}`}>
              {/* Day header */}
              <div className={`px-1 pt-2 pb-1.5 text-center border-b border-gray-100 dark:border-gray-800 flex-shrink-0`}>
                <div className="text-[9px] sm:text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {DAYS_ES[day.getDay()].slice(0, 3)}
                </div>
                <div className={`text-sm sm:text-base font-black mx-auto w-7 h-7 flex items-center justify-center rounded-full mt-0.5
                  ${isToday ? 'bg-[#732442] text-white' : 'text-gray-700 dark:text-gray-200'}`}>
                  {day.getDate()}
                </div>
              </div>

              {/* Publications */}
              <div className="flex-1 p-1 space-y-1 overflow-hidden">
                {pubs.map(pub => {
                  const color = getProjectColor(pub.proyecto)
                  return (
                    <button
                      key={pub.id}
                      onClick={() => onSelect(pub)}
                      className="w-full text-left px-1.5 py-1 rounded-lg text-[9px] sm:text-[10px] font-semibold leading-tight hover:brightness-90 active:brightness-90 transition-all"
                      style={{ backgroundColor: color.bg, color: color.text }}
                    >
                      <div className="flex items-center gap-0.5 mb-0.5">
                        <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: color.dot }} />
                        <span className="truncate hidden sm:block">{pub.proyecto}</span>
                      </div>
                      <div className="truncate text-[8px] sm:text-[9px] opacity-80 hidden sm:block">{pub.titulo || ''}</div>
                    </button>
                  )
                })}
                {pubs.length === 0 && (
                  <div className="h-full" />
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Go to today link */}
      {!sameDay(startOfWeek(today), weekStart) && (
        <div className="flex justify-center py-2 border-t border-gray-100 dark:border-gray-800">
          <button onClick={goToday} className="text-xs text-[#732442] font-semibold hover:underline">Ir a esta semana</button>
        </div>
      )}
    </div>
  )
}
