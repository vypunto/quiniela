import { useMemo, useState } from 'react'
import { getProjectColor } from '../utils/colors'
import { DAYS_ES, MONTHS_ES } from '../utils/dateUtils'
import { TypeIcon, StatusIcon } from './Icons'

const TIPO_LABELS = { imagen: 'Imagen', video: 'Video', reel: 'Reel', carrusel: 'Carrusel', historia: 'Historia', texto: 'Texto' }
const CANAL_LABELS = ['Instagram', 'TikTok', 'LinkedIn', 'Facebook', 'Web', 'Otros']

function FilterBar({ availableTipos, availableCanales, tipoFilter, canalFilter, onTipo, onCanal, onClear }) {
  const active = tipoFilter.length + canalFilter.length
  return (
    <div className="mb-3 space-y-2">
      {/* Tipo chips */}
      {availableTipos.length > 1 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em] mr-1 flex-shrink-0">Tipo</span>
          {availableTipos.map(t => {
            const sel = tipoFilter.includes(t)
            return (
              <button
                key={t}
                onClick={() => onTipo(t)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all duration-150"
                style={sel
                  ? { backgroundColor: '#111827', color: '#fff', borderColor: '#111827' }
                  : { backgroundColor: '#fff', color: '#6B7280', borderColor: '#E5E7EB' }
                }
              >
                <TypeIcon tipo={t} size={11} />
                {TIPO_LABELS[t] || t}
              </button>
            )
          })}
        </div>
      )}

      {/* Canal chips */}
      {availableCanales.length > 1 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em] mr-1 flex-shrink-0">Canal</span>
          {availableCanales.map(c => {
            const sel = canalFilter.includes(c)
            return (
              <button
                key={c}
                onClick={() => onCanal(c)}
                className="px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all duration-150"
                style={sel
                  ? { backgroundColor: '#e84530', color: '#fff', borderColor: '#e84530' }
                  : { backgroundColor: '#fff', color: '#6B7280', borderColor: '#E5E7EB' }
                }
              >{c}</button>
            )
          })}
        </div>
      )}

      {/* Quitar filtros */}
      {active > 0 && (
        <button
          onClick={onClear}
          className="text-[11px] font-semibold text-gray-400 hover:text-gray-600 transition-colors underline"
        >
          Quitar filtros ({active})
        </button>
      )}
    </div>
  )
}

export default function CalendarList({ year, month, publications, onSelect, activeFilter }) {
  const [tipoFilter, setTipoFilter]   = useState([])
  const [canalFilter, setCanalFilter] = useState([])

  const toggleTipo  = t => setTipoFilter(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  const toggleCanal = c => setCanalFilter(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])
  const clearLocal  = () => { setTipoFilter([]); setCanalFilter([]) }

  const today = new Date()

  const inMonth = useMemo(() => {
    let list = publications.filter(p =>
      p.fecha && p.fecha.getFullYear() === year && p.fecha.getMonth() === month
    )
    if (activeFilter.length > 0) list = list.filter(p => activeFilter.includes(p.proyecto))
    return list.sort((a, b) => a.fecha - b.fecha)
  }, [publications, year, month, activeFilter])

  const availableTipos   = useMemo(() => [...new Set(inMonth.map(p => p.tipo).filter(Boolean))], [inMonth])
  const availableCanales = useMemo(() => CANAL_LABELS.filter(c => inMonth.some(p => p.canal === c)), [inMonth])

  const filtered = useMemo(() => {
    let list = inMonth
    if (tipoFilter.length > 0)  list = list.filter(p => tipoFilter.includes(p.tipo))
    if (canalFilter.length > 0) list = list.filter(p => canalFilter.includes(p.canal))
    return list
  }, [inMonth, tipoFilter, canalFilter])

  const weeks = useMemo(() => {
    const map = new Map()
    filtered.forEach(pub => {
      const d = new Date(pub.fecha.getFullYear(), pub.fecha.getMonth(), pub.fecha.getDate())
      const dayOfWeek = d.getDay() === 0 ? 6 : d.getDay() - 1
      d.setDate(d.getDate() - dayOfWeek)
      const key = d.toISOString().slice(0, 10)
      if (!map.has(key)) map.set(key, { weekStart: new Date(d), pubs: [] })
      map.get(key).pubs.push(pub)
    })
    return Array.from(map.values()).sort((a, b) => a.weekStart - b.weekStart)
  }, [filtered])

  return (
    <div>
      <FilterBar
        availableTipos={availableTipos}
        availableCanales={availableCanales}
        tipoFilter={tipoFilter}
        canalFilter={canalFilter}
        onTipo={toggleTipo}
        onCanal={toggleCanal}
        onClear={clearLocal}
      />

      {weeks.length === 0 ? (
        <div
          className="text-center py-24 bg-white rounded-2xl"
          style={{ border: '1px solid #E8EAED', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
        >
          <div className="text-4xl mb-3 opacity-50">📭</div>
          <p className="text-sm font-medium text-gray-400">
            {tipoFilter.length + canalFilter.length + activeFilter.length > 0
              ? 'Sin publicaciones con los filtros seleccionados'
              : 'No hay publicaciones este mes'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {weeks.map(({ weekStart, pubs }) => {
            const weekEnd = new Date(weekStart)
            weekEnd.setDate(weekEnd.getDate() + 6)
            const isCurrentWeek = today >= weekStart && today <= weekEnd
            const label = `${weekStart.getDate()}–${Math.min(weekEnd.getDate(), new Date(year, month + 1, 0).getDate())} ${MONTHS_ES[month].toUpperCase()}`

            return (
              <div
                key={weekStart.getTime()}
                className="bg-white rounded-2xl overflow-hidden fade-up"
                style={{ border: '1px solid #E8EAED', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)' }}
              >
                {/* Week header */}
                <div
                  className="flex items-center justify-between px-5 py-3 border-b"
                  style={
                    isCurrentWeek
                      ? { backgroundColor: 'rgba(115,36,66,0.04)', borderColor: 'rgba(115,36,66,0.1)' }
                      : { backgroundColor: '#FAFAFA', borderColor: '#F3F4F6' }
                  }
                >
                  <span
                    className="text-[11px] font-bold uppercase tracking-[0.08em]"
                    style={{ color: isCurrentWeek ? '#e84530' : '#9CA3AF' }}
                  >
                    {label}
                  </span>
                  <span className="text-[11px] font-medium text-gray-400">
                    {pubs.length} publicación{pubs.length > 1 ? 'es' : ''}
                  </span>
                </div>

                {/* Rows */}
                <div className="divide-y divide-gray-50">
                  {pubs.map(pub => {
                    const color = getProjectColor(pub.proyecto)
                    const day = pub.fecha.getDate()
                    const dayName = DAYS_ES[pub.fecha.getDay()].slice(0, 3).toUpperCase()

                    return (
                      <button
                        key={pub.id}
                        onClick={() => onSelect(pub)}
                        className="w-full text-left flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/80 transition-all duration-150 group"
                      >
                        {/* Date */}
                        <div className="w-9 text-center flex-shrink-0">
                          <div className="text-[10px] font-semibold text-gray-400 leading-none">{dayName}</div>
                          <div className="text-lg font-bold text-gray-800 leading-tight mt-0.5">{day}</div>
                        </div>

                        {/* Color dot */}
                        <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: color.dot }} />

                        {/* Project chip */}
                        <div
                          className="px-2.5 py-1 rounded-full text-[11px] font-semibold flex-shrink-0 hidden sm:block"
                          style={{ backgroundColor: color.bg, color: color.text }}
                        >
                          {pub.proyecto}
                        </div>

                        {/* Title */}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-gray-800 truncate group-hover:text-gray-900 transition-colors">
                            {pub.titulo || pub.proyecto}
                          </div>
                          {pub.copy && (
                            <div className="text-xs text-gray-400 truncate mt-0.5 font-normal">{pub.copy}</div>
                          )}
                        </div>

                        {/* Canal badge */}
                        {pub.canal && (
                          <div className="flex-shrink-0 text-[10px] font-bold text-gray-400 hidden sm:block">{pub.canal}</div>
                        )}

                        {/* Status icon */}
                        {pub.estado && (
                          <div className="flex-shrink-0"><StatusIcon estado={pub.estado} size={15} /></div>
                        )}

                        {/* Type icon */}
                        {pub.tipo && (
                          <div className="flex-shrink-0 text-gray-300 group-hover:text-gray-400 transition-colors">
                            <TypeIcon tipo={pub.tipo} size={15} />
                          </div>
                        )}

                        {/* Arrow */}
                        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className="flex-shrink-0 text-gray-200 group-hover:text-gray-400 transition-colors">
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
      )}
    </div>
  )
}
