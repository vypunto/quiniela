import { SPREADSHEET_URL } from '../config'

const COLUMNS = ['Proyecto','Fecha','Título','Copy','Imagen/Video','Tipo']
const EXAMPLE  = ['gastro league','15/07/2026','Post verano','El copy...','https://...','imagen']

export default function SettingsModal({ config, onSave, onClose }) {
  const sheetLocked = !!SPREADSHEET_URL

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[6px]" onClick={onClose} />

      <div
        className="relative bg-white rounded-[24px] max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col"
        style={{
          animation: 'modalIn 200ms cubic-bezier(0.16,1,0.3,1)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.14), 0 32px 80px rgba(0,0,0,0.08)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-base font-bold text-gray-900">Configuración</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all duration-150"
          >
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-4">
          {sheetLocked && (
            <div
              className="rounded-xl p-4 flex items-start gap-3"
              style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#DCFCE7' }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="3" y="6" width="8" height="7" rx="1.5" stroke="#16a34a" strokeWidth="1.3"/>
                  <path d="M5 6V4.5a2 2 0 1 1 4 0V6" stroke="#16a34a" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-green-800 mb-1">Google Sheet vinculado y protegido</p>
                <p className="text-xs text-green-700 leading-relaxed">La conexión está fijada y no puede modificarse desde la app. Solo un administrador puede cambiarla.</p>
              </div>
            </div>
          )}

          <div
            className="rounded-xl p-4 space-y-3"
            style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}
          >
            <p className="text-xs font-bold text-blue-900">Columnas necesarias en la hoja CALENDAPP:</p>
            <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #DBEAFE' }}>
              <div className="grid text-center" style={{ gridTemplateColumns: `repeat(${COLUMNS.length}, 1fr)` }}>
                {COLUMNS.map(col => (
                  <div key={col} className="px-1 py-2 text-[10px] font-bold text-blue-700 border-r border-blue-100 last:border-r-0 bg-blue-50/60">{col}</div>
                ))}
              </div>
              <div className="grid border-t border-blue-100" style={{ gridTemplateColumns: `repeat(${COLUMNS.length}, 1fr)` }}>
                {EXAMPLE.map((ex, i) => (
                  <div key={i} className="px-1 py-2 text-[10px] text-gray-400 border-r border-blue-50 last:border-r-0 truncate text-center">{ex}</div>
                ))}
              </div>
            </div>
            <div className="space-y-1.5 text-xs text-blue-800">
              <p><span className="font-semibold">Tipo:</span>{' '}
                {['imagen','video','reel','carrusel','historia'].map(t => (
                  <code key={t} className="bg-blue-100 px-1.5 py-0.5 rounded-md text-[10px] font-mono ml-1">{t}</code>
                ))}
              </p>
              <p><span className="font-semibold">Imagen/Video:</span> link de Google Drive, YouTube, o URL directa</p>
              <p><span className="font-semibold">Fechas:</span> DD/MM/YYYY · YYYY-MM-DD · DD-MM-YYYY</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:brightness-90"
            style={{ backgroundColor: '#e84530' }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
