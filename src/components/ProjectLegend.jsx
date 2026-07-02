import { useMemo } from 'react'
import { getProjectColor } from '../utils/colors'

export default function ProjectLegend({ publications }) {
  const projects = useMemo(() => {
    const set = new Set(publications.map(p => p.proyecto).filter(Boolean))
    return Array.from(set).sort()
  }, [publications])

  if (projects.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {projects.map(name => {
        const color = getProjectColor(name)
        return (
          <div
            key={name}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
            style={{ backgroundColor: color.bg, color: color.text }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color.dot }} />
            {name}
          </div>
        )
      })}
    </div>
  )
}
