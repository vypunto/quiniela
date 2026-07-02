import { useMemo } from 'react'
import { getProjectColor } from '../utils/colors'
import { PROJECTS } from '../config'

export default function ProjectLegend({ publications, activeFilter, onFilter, onClear }) {
  const projects = useMemo(() => {
    const fromPubs = new Set(publications.map(p => p.proyecto).filter(Boolean))
    const all = new Set([...PROJECTS, ...fromPubs])
    return Array.from(all).sort()
  }, [publications])

  if (projects.length === 0) return null

  const hasFilter = activeFilter.length > 0

  return (
    <div className="mb-4">
      <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-1.5">
        {projects.map(name => {
          const color = getProjectColor(name)
          const isActive = activeFilter.includes(name)
          const isDimmed = hasFilter && !isActive
          return (
            <button
              key={name}
              onClick={() => onFilter(name)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl sm:rounded-full text-[11px] sm:text-xs font-semibold transition-all duration-150 w-full sm:w-auto"
              style={{
                backgroundColor: isActive ? color.dot : color.bg,
                color: isActive ? '#fff' : color.text,
                boxShadow: isActive ? `0 0 0 2px #F7F8FA, 0 0 0 3.5px ${color.dot}` : 'none',
                opacity: isDimmed ? 0.28 : 1,
                transform: isActive ? 'scale(1.02)' : 'scale(1)',
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors"
                style={{ backgroundColor: isActive ? 'rgba(255,255,255,0.6)' : color.dot }}
              />
              <span className="truncate leading-tight">{name}</span>
            </button>
          )
        })}
      </div>
      {hasFilter && (
        <button
          onClick={onClear}
          className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold text-gray-400 border border-gray-200 hover:bg-white hover:text-gray-600 transition-all duration-150"
        >
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
            <path d="M1 1l7 7M8 1L1 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          Quitar filtros · {activeFilter.length} {activeFilter.length === 1 ? 'proyecto' : 'proyectos'}
        </button>
      )}
    </div>
  )
}
