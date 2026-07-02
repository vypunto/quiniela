import { useMemo } from 'react'
import { getProjectColor } from '../utils/colors'
import { PROJECTS } from '../config'

export default function ProjectLegend({ publications, activeFilter, onFilter }) {
  const projects = useMemo(() => {
    const fromPubs = new Set(publications.map(p => p.proyecto).filter(Boolean))
    const all = new Set([...PROJECTS, ...fromPubs])
    return Array.from(all).sort()
  }, [publications])

  if (projects.length === 0) return null

  return (
    <div className="mb-4">
      <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-1.5">
        {projects.map(name => {
          const color = getProjectColor(name)
          const isActive = activeFilter === name
          const isDimmed = !!activeFilter && !isActive
          return (
            <button
              key={name}
              onClick={() => onFilter(isActive ? null : name)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl sm:rounded-full text-[11px] sm:text-xs font-semibold transition-all w-full sm:w-auto"
              style={{
                backgroundColor: isActive ? color.dot : color.bg,
                color: isActive ? '#fff' : color.text,
                boxShadow: isActive ? `0 0 0 2px #fff, 0 0 0 3.5px ${color.dot}` : 'none',
                opacity: isDimmed ? 0.3 : 1,
              }}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: isActive ? 'rgba(255,255,255,0.7)' : color.dot }}
              />
              <span className="truncate leading-tight">{name}</span>
            </button>
          )
        })}
      </div>
      {activeFilter && (
        <button
          onClick={() => onFilter(null)}
          className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          ✕ Quitar filtro
        </button>
      )}
    </div>
  )
}
