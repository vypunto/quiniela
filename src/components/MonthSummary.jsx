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
    <div className="flex items-center gap-2 flex-shrink-0 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
      <span className="text-sm font-black text-gray-800 leading-none flex-shrink-0">{stats.total}</span>
      <span className="text-[11px] text-gray-400 font-medium flex-shrink-0 hidden sm:inline">pub. {MONTHS_ES[month]}</span>
      <div className="w-px h-3.5 bg-gray-200 flex-shrink-0" />
      <div className="flex items-center gap-2 flex-shrink-0">
        {stats.tipoEntries.map(({ tipo, count }) => (
          <span key={tipo} className="flex items-center gap-1 text-gray-400">
            <TypeIcon tipo={tipo} size={11} />
            <span className="text-[11px] font-semibold text-gray-500">{count}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
