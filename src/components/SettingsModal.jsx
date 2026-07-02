import { useState } from 'react'

export default function SettingsModal({ config, onSave, onClose }) {
  const [spreadsheetId, setSpreadsheetId] = useState(config.spreadsheetId || '')

  const handleSave = () => {
    const id = spreadsheetId.trim()
    if (!id) return
    onSave({ spreadsheetId: id })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">Conectar Google Sheets</h2>
            <p className="text-xs text-gray-400 mt-0.5">Sincroniza tu hoja de cálculo con el calendario</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Instructions */}
          <div className="bg-blue-50 rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-blue-900">Cómo configurarlo:</p>
            <ol className="space-y-2 text-xs text-blue-800">
              <li className="flex gap-2">
                <span className="font-bold text-blue-500 flex-shrink-0">1.</span>
                <span>Crea una hoja de Google Sheets con estas columnas exactas en la fila 1:</span>
              </li>
            </ol>
            {/* Column reference */}
            <div className="bg-white rounded-lg overflow-hidden border border-blue-100">
              <div className="grid grid-cols-5 text-center">
                {['Proyecto','Fecha','Título','Copy','Imagen/Video'].map((col, i) => (
                  <div key={i} className="px-1 py-1.5 text-xs font-semibold text-blue-700 border-r border-blue-100 last:border-r-0 bg-blue-50/50">
                    {col}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-5 text-center border-t border-blue-100">
                {['gastro league','15/07/2026','Post verano','El copy...','https://...'].map((ex, i) => (
                  <div key={i} className="px-1 py-1 text-xs text-gray-400 border-r border-blue-100 last:border-r-0 truncate">
                    {ex}
                  </div>
                ))}
              </div>
            </div>
            <ol className="space-y-2 text-xs text-blue-800" start={2}>
              <li className="flex gap-2">
                <span className="font-bold text-blue-500 flex-shrink-0">2.</span>
                <span>Ve a <strong>Archivo → Compartir → Publicar en la web</strong>, selecciona <strong>Hoja 1</strong> y formato <strong>CSV</strong> y haz clic en <strong>Publicar</strong></span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-blue-500 flex-shrink-0">3.</span>
                <span>Copia el ID de tu hoja desde la URL (la parte entre <code className="bg-blue-100 px-1 rounded">/d/</code> y <code className="bg-blue-100 px-1 rounded">/edit</code>)</span>
              </li>
            </ol>
          </div>

          {/* Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              ID de Google Sheets o URL completa
            </label>
            <input
              type="text"
              value={spreadsheetId}
              onChange={e => setSpreadsheetId(e.target.value)}
              placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition-all font-mono"
            />
            <p className="text-xs text-gray-400 mt-1">
              También puedes pegar la URL completa de la hoja
            </p>
          </div>

          {/* Date format note */}
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">
              <strong>Formato de fecha admitido:</strong> DD/MM/YYYY · YYYY-MM-DD · DD-MM-YYYY
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 p-5 pt-0">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!spreadsheetId.trim()}
            className="flex-1 px-4 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Guardar y sincronizar
          </button>
        </div>
      </div>
    </div>
  )
}
