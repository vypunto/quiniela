import { useMemo, useState, useRef, useEffect } from 'react'
import { getProjectColor } from '../utils/colors'
import { DAYS_ES, MONTHS_ES } from '../utils/dateUtils'
import { TypeIcon, StatusIcon } from './Icons'

const TIPO_LABELS = { imagen: 'Imagen', video: 'Video', reel: 'Reel', carrusel: 'Carrusel', historia: 'Historia', texto: 'Texto' }
const CANAL_LABELS = ['Instagram', 'TikTok', 'LinkedIn', 'Facebook', 'Web', 'Otros']

function FilterDropdown({ label, options, selected, onToggle, onClearThis, renderOption }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const count = selected.length

  useEffect(() => {
    if (!open) return
    const handle = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handle)
    document.addEventListener('touchstart', handle)
    return () => { document.removeEventListener('mousedown', handle); document.removeEventListener('touchstart', handle) }
  }, [open])

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all duration-150"
        style={count > 0
          ? { backgroundColor: '#111827', color: '#fff', borderColor: '#111827' }
          : { backgroundColor: '#fff', color: '#6B7280', borderColor: '#E5E7EB' }
        }
      >
        {label}
        {count > 0 && (
          <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black" style={{ backgroundColor: 'rgba(255,255,255,0.25)' }}>
            {count}
          </span>
        )}
        <svg
          width="10" height="10" viewBox="0 0 10 10" fill="none"
          style={{ transition: 'transform 150ms', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-1.5 bg-white rounded-2xl z-30 overflow-hidden"
          style={{ minWidth: '156px', boxShadow: '0 4px 24px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #F3F4F6' }}
        >
          <div className="py-1.5">
            {options.map(opt => {
              const sel = selected.includes(opt)
              return (
                <button
                  key={opt}
                  onClick={() => onToggle(opt)}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-left transition-colors duration-100 hover:bg-gray-50"
                >
                  <span
                    className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all"
                    style={{ backgroundColor: sel ? '#111827' : 'transparent', border: sel ? '1.5px solid #111827' : '1.5px solid #D1D5DB' }}
                  >
                    {sel && (
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path d="M1 4l2 2 4-4" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </span>
                  {renderOption ? renderOption(opt) : <span className="text-[12px] font-medium text-gray-700">{opt}</span>}
                </button>
              )
            })}
          </div>
          {count > 0 && (
            <div className="border-t border-gray-100 px-3.5 py-2">
              <button onClick={() => { onClearThis(); setOpen(false) }} className="text-[11px] font-semibold text-gray-400 hover:text-gray-600 transition-colors">
                Limpiar selección
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function FilterBar({ projectTrigger, availableTipos, availableCanales, tipoFilter, canalFilter, onTipo, onCanal, onClearTipo, onClearCanal }) {
  const active = tipoFilter.length + canalFilter.length

  return (
    <div className="flex items-center gap-2 mb-3">
      {projectTrigger}
      <FilterDropdown
        label="Tipo"
        options={availableTipos}
        selected={tipoFilter}
        onToggle={onTipo}
        onClearThis={onClearTipo}
        renderOption={t => (
          <span className="flex items-center gap-1.5 text-[12px] font-medium text-gray-700">
            <TypeIcon tipo={t} size={11} />{TIPO_LABELS[t] || t}
          </span>
        )}
      />
      <FilterDropdown
        label="Canal"
        options={availableCanales}
        selected={canalFilter}
        onToggle={onCanal}
        onClearThis={onClearCanal}
      />
      {active > 0 && (
        <button
          onClick={() => { onClearTipo(); onClearCanal() }}
          className="text-[11px] font-semibold text-gray-400 hover:text-gray-600 transition-colors ml-1"
        >
          Limpiar todo
        </button>
      )}
    </div>
  )
}

export default function CalendarList({ year, month, publications, onSelect, activeFilter, projectTrigger }) {
  const [tipoFilter, setTipoFilter]   = useState([])
  const [canalFilter, setCanalFilter] = useState([])

  const toggleTipo  = t => setTipoFilter(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  const toggleCanal = c => setCanalFilter(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])
  const clearTipo   = () => setTipoFilter([])
  const clearCanal  = () => setCanalFilter([])

  const today = new Date()

  const inMonth = useMemo(() => {
    let list = publications.filter(p =>
      p.fecha && p.fecha.getFullYear() === year && p.fecha.getMonth() === month
    )
    if (activeFilter.length > 0) list = list.filter(p => activeFilter.includes(p.proyecto))
    return list.sort((a, b) => a.fecha - b.fecha)
  }, [publications, year, month, activeFilter])

  const availableTipos   = Object.keys(TIPO_LABELS)
  const availableCanales = CANAL_LABELS

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
        projectTrigger={projectTrigger}
        availableTipos={availableTipos}
        availableCanales={availableCanales}
        tipoFilter={tipoFilter}
        canalFilter={canalFilter}
        onTipo={toggleTipo}
        onCanal={toggleCanal}
        onClearTipo={clearTipo}
        onClearCanal={clearCanal}
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
