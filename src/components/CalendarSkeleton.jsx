const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const HAS_PILL = new Set([1,3,8,10,14,16,20,22,24,28,30])

export default function CalendarSkeleton() {
  return (
    <div
      className="bg-white rounded-2xl overflow-hidden flex flex-col animate-pulse"
      style={{
        height: 'calc(100dvh - 270px)',
        minHeight: '360px',
        maxHeight: '800px',
        border: '1px solid #E8EAED',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.05)',
      }}
    >
      <div className="grid grid-cols-7 border-b border-gray-100 flex-shrink-0">
        {DAYS.map(d => (
          <div key={d} className="py-3 text-center text-[10px] font-semibold text-gray-300 uppercase tracking-[0.1em]">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 flex-1" style={{ gridTemplateRows: 'repeat(5, 1fr)' }}>
        {Array.from({ length: 35 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col p-2 gap-1.5"
            style={{
              borderRight: i % 7 < 6 ? '1px solid #F3F4F6' : 'none',
              borderBottom: i < 28 ? '1px solid #F3F4F6' : 'none',
            }}
          >
            <div className="w-5 h-5 rounded-full bg-gray-100" />
            {HAS_PILL.has(i) && <div className="h-[18px] rounded-lg bg-gray-100 w-full" />}
            {HAS_PILL.has(i + 1) && i % 3 === 0 && <div className="h-[18px] rounded-lg bg-gray-100 w-3/4" />}
          </div>
        ))}
      </div>
    </div>
  )
}
