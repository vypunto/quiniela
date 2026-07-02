import { useMemo } from 'react'
import { getProjectColor } from '../utils/colors'

export default function ProjectLegend({ publications, activeFilter, onFilter }) {
  const projects = useMemo(() => {
    const set = new Set(publications.map(p => p.proyecto).filter(Boolean))
    return Array.from(set).sort()
  }, [publications])

  if (projects.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1.5 mb-4">
      {projects.map(name => {
        const color = getProjectColor(name)
        const isActive = activeFilter === name
        const isDimmed = !!activeFilter && !isActive
        return (
          <button
            key={name}
            onClick={() => onFilter(isActive ? null : name)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all flex-shrink-0"
            style={{
              backgroundColor: isActive ? color.dot : color.bg,
              color: isActive ? '#fff' : color.text,
              boxShadow: isActive ? `0 0 0 2px #fff, 0 0 0 4px ${color.dot}` : 'none',
              opacity: isDimmed ? 0.35 : 1,
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: isActive ? '#fff' : color.dot }} />
            {name}
          </button>
        )
      })}
      {activeFilter && (
        <button
          onClick={() => onFilter(null)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
        >
          ✕ Quitar filtro
        </button>
      )}
    </div>
  )
}
