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
    inMonth.forEach(p => {
      const t = p.tipo || 'imagen'
      byTipo[t] = (byTipo[t] || 0) + 1
    })

    const tipoEntries = TIPO_ORDER
      .filter(t => byTipo[t])
      .map(t => ({ tipo: t, count: byTipo[t] }))

    return { total: inMonth.length, tipoEntries }
  }, [publications, year, month])

  if (!stats) return null

  return (
    <div
      className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-2.5 bg-white rounded-xl mb-3 overflow-x-auto scrollbar-none"
      style={{
        border: '1px solid #E8EAED',
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        scrollbarWidth: 'none',
      }}
    >
      <div className="flex items-baseline gap-1.5 flex-shrink-0">
        <span className="text-lg font-black text-gray-900 leading-none">{stats.total}</span>
        <span className="text-xs text-gray-400 font-medium">publicaciones en {MONTHS_ES[month]}</span>
      </div>

      <div className="w-px h-4 bg-gray-100 flex-shrink-0" />

      <div className="flex items-center gap-3 flex-shrink-0">
        {stats.tipoEntries.map(({ tipo, count }) => (
          <span key={tipo} className="flex items-center gap-1.5 text-gray-400">
            <TypeIcon tipo={tipo} size={12} />
            <span className="text-xs font-semibold text-gray-500">{count}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
