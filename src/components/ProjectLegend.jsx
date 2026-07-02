import { useMemo } from 'react'
import { getProjectColor } from '../utils/colors'

export default function ProjectLegend({ publications, activeFilter, onFilter }) {
  const projects = useMemo(() => {
    const set = new Set(publications.map(p => p.proyecto).filter(Boolean))
    return Array.from(set).sort()
  }, [publications])

  if (projects.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {projects.map(name => {
        const color = getProjectColor(name)
        const isActive = activeFilter === name
        return (
          <button
            key={name}
            onClick={() => onFilter(isActive ? null : name)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all"
            style={{
              backgroundColor: isActive ? color.dot : color.bg,
              color: isActive ? '#fff' : color.text,
              outline: isActive ? `2px solid ${color.dot}` : 'none',
              outlineOffset: '1px',
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
