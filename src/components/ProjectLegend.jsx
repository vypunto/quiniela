import { useMemo } from 'react'
import { getProjectColor } from '../utils/colors'

export default function ProjectLegend({ publications, activeFilter, onFilter }) {
  const projects = useMemo(() => {
    const set = new Set(publications.map(p => p.proyecto).filter(Boolean))
    return Array.from(set).sort()
  }, [publications])

  if (projects.length === 0) return null

  return (
    <div className="flex gap-2 mb-4 overflow-x-auto pb-1 sm:flex-wrap sm:pb-0 scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      {projects.map(name => {
        const color = getProjectColor(name)
        const isActive = activeFilter === name
        return (
          <button
            key={name}
            onClick={() => onFilter(isActive ? null : name)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all flex-shrink-0"
            style={{
              backgroundColor: isActive ? color.dot : color.bg,
              color: isActive ? '#fff' : color.text,
              boxShadow: isActive ? `0 0 0 2px #fff, 0 0 0 4px ${color.dot}` : 'none',
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
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs text-gray-400 border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          ✕ Quitar filtro
        </button>
      )}
    </div>
  )
}
