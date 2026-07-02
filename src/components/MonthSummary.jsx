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
    <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm mb-3 overflow-x-auto scrollbar-none" style={{ scrollbarWidth: 'none' }}>
      <span className="text-xs font-bold text-gray-800 dark:text-gray-100 flex-shrink-0">
        {stats.total} <span className="font-normal text-gray-400 dark:text-gray-500">en {MONTHS_ES[month]}</span>
      </span>

      <span className="text-gray-200 dark:text-gray-700 flex-shrink-0">·</span>

      <div className="flex items-center gap-2 flex-shrink-0">
        {stats.tipoEntries.map(({ tipo, count }) => (
          <span key={tipo} className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs">
            <TypeIcon tipo={tipo} size={12} />
            <span className="font-medium">{count}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
