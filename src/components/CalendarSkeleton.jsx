const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
// Deterministic pattern: cells that "have" a pill
const HAS_PILL = new Set([1,3,8,10,14,16,20,22,24,28,30])

export default function CalendarSkeleton() {
  return (
    <div
      className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden flex flex-col animate-pulse"
      style={{ height: 'calc(100dvh - 260px)', minHeight: '340px', maxHeight: '780px' }}
    >
      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        {DAYS.map(d => (
          <div key={d} className="py-2.5 text-center text-[10px] sm:text-xs font-semibold text-gray-300 uppercase tracking-wider">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 divide-x divide-y divide-gray-100 flex-1" style={{ gridTemplateRows: 'repeat(5, 1fr)' }}>
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="flex flex-col p-1.5 gap-1">
            <div className="w-5 h-5 rounded-full bg-gray-100" />
            {HAS_PILL.has(i) && <div className="h-4 rounded-md bg-gray-100 w-full" />}
            {HAS_PILL.has(i + 1) && i % 3 === 0 && <div className="h-4 rounded-md bg-gray-100 w-3/4" />}
          </div>
        ))}
      </div>
    </div>
  )
}
