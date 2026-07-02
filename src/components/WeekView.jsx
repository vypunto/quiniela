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
  const filtered = activeFilter.length > 0 ? publications.filter(p => activeFilter.includes(p.proyecto)) : publications
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
    <div
      className="bg-white rounded-2xl overflow-hidden flex flex-col"
      style={{
        minHeight: '360px',
        border: '1px solid #E8EAED',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.05)',
      }}
    >
      {/* Week nav */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 flex-shrink-0">
        <button
          onClick={prevWeek}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all duration-150"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8 10L4 6l4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div className="text-center">
          <span className="text-xs font-bold text-gray-800 tracking-tight">
            {weekStart.getDate()} – {weekEnd.getDate()} {weekEnd.toLocaleDateString('es-ES', { month: 'long' }).toUpperCase()} {weekEnd.getFullYear()}
          </span>
          {sameDay(startOfWeek(today), weekStart) && (
            <span className="ml-2 text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ color: '#732442', backgroundColor: 'rgba(115,36,66,0.08)' }}>
              Esta semana
            </span>
          )}
        </div>
        <button
          onClick={nextWeek}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all duration-150"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>

      {/* Day columns */}
      <div className="grid grid-cols-7 flex-1" style={{ borderBottom: 'none' }}>
        {days.map((day, idx) => {
          const isToday = sameDay(day, today)
          const pubs = filtered.filter(p => p.fecha && sameDay(p.fecha, day))
          const isLast = idx === 6
          return (
            <div
              key={day.toISOString()}
              className="flex flex-col"
              style={{
                minHeight: '200px',
                borderRight: !isLast ? '1px solid #F3F4F6' : 'none',
                backgroundColor: isToday ? 'rgba(253,242,245,0.8)' : 'transparent',
              }}
            >
              {/* Day header */}
              <div className="px-2 pt-3 pb-2 text-center border-b border-gray-50 flex-shrink-0">
                <div className="text-[9px] sm:text-[10px] font-semibold text-gray-400 uppercase tracking-[0.1em]">
                  {DAYS_ES[day.getDay()].slice(0, 3)}
                </div>
                <div
                  className="text-sm sm:text-base font-bold mx-auto w-7 h-7 flex items-center justify-center rounded-full mt-1 transition-colors"
                  style={
                    isToday
                      ? { backgroundColor: '#732442', color: '#fff' }
                      : { color: '#374151' }
                  }
                >
                  {day.getDate()}
                </div>
              </div>

              {/* Publications */}
              <div className="flex-1 p-1.5 space-y-1 overflow-hidden">
                {pubs.map(pub => {
                  const color = getProjectColor(pub.proyecto)
                  return (
                    <button
                      key={pub.id}
                      onClick={() => onSelect(pub)}
                      className="w-full text-left px-1.5 py-1 rounded-lg text-[9px] sm:text-[10px] font-semibold leading-tight hover:brightness-90 active:brightness-90 transition-all duration-150"
                      style={{ backgroundColor: color.bg, color: color.text }}
                    >
                      <div className="flex items-center gap-0.5 mb-0.5">
                        <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: color.dot }} />
                        <span className="truncate hidden sm:block">{pub.proyecto}</span>
                      </div>
                      <div className="truncate text-[8px] sm:text-[9px] opacity-70 hidden sm:block">{pub.titulo || ''}</div>
                    </button>
                  )
                })}
                {pubs.length === 0 && <div className="h-full" />}
              </div>
            </div>
          )
        })}
      </div>

      {!sameDay(startOfWeek(today), weekStart) && (
        <div className="flex justify-center py-3 border-t border-gray-100">
          <button
            onClick={goToday}
            className="text-xs font-semibold transition-colors"
            style={{ color: '#732442' }}
          >
            Ir a esta semana
          </button>
        </div>
      )}
    </div>
  )
}
