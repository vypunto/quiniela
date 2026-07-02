import { useMemo } from 'react'
import { TypeIcon } from './Icons'
import { MONTHS_ES } from '../utils/dateUtils'

const TIPO_ORDER = ['imagen', 'video', 'reel', 'carrusel', 'historia', 'texto']

export default function MonthSummary({ publications, year, month }) {
  const stats = useMemo(() => {
    const inMonth = publications.filter(p =>
      p.fecha && p.fecha.getFullYear() === year && p.fecha.getMonth() === month
    )
    if (inMonth.length === 0) return null

    const byTipo = {}
    let publicados = 0
    let borradores = 0

    inMonth.forEach(p => {
      const t = p.tipo || 'imagen'
      byTipo[t] = (byTipo[t] || 0) + 1
      if (p.estado === 'Publicado') publicados++
      if (p.estado === 'Borrador') borradores++
    })

    const tipoEntries = TIPO_ORDER
      .filter(t => byTipo[t])
      .map(t => ({ tipo: t, count: byTipo[t] }))

    return { total: inMonth.length, tipoEntries, publicados, borradores }
  }, [publications, year, month])

  if (!stats) return null

  return (
    <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm mb-3 overflow-x-auto scrollbar-none" style={{ scrollbarWidth: 'none' }}>
      {/* Total */}
      <span className="text-xs font-bold text-gray-800 flex-shrink-0">
        {stats.total} <span className="font-normal text-gray-400">en {MONTHS_ES[month]}</span>
      </span>

      <span className="text-gray-200 flex-shrink-0">·</span>

      {/* Tipo breakdown */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {stats.tipoEntries.map(({ tipo, count }) => (
          <span key={tipo} className="flex items-center gap-1 text-gray-500 text-xs">
            <TypeIcon tipo={tipo} size={12} />
            <span className="font-medium">{count}</span>
          </span>
        ))}
      </div>

      {/* Estado breakdown — only if any is set */}
      {(stats.publicados > 0 || stats.borradores > 0) && (
        <>
          <span className="text-gray-200 flex-shrink-0">·</span>
          {stats.publicados > 0 && (
            <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium flex-shrink-0">
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <circle cx="5.5" cy="5.5" r="5" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M3 5.5l1.8 1.8L8 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {stats.publicados} publicado{stats.publicados > 1 ? 's' : ''}
            </span>
          )}
          {stats.borradores > 0 && (
            <span className="text-xs text-gray-400 flex-shrink-0">
              {stats.borradores} borrador{stats.borradores > 1 ? 'es' : ''}
            </span>
          )}
        </>
      )}
    </div>
  )
}
