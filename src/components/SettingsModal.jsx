import { useState } from 'react'

const COLUMNS = ['Proyecto','Fecha','Título','Copy','Imagen/Video','Tipo']
const EXAMPLE  = ['gastro league','15/07/2026','Post verano','El copy...','https://...','imagen']

export default function SettingsModal({ config, onSave, onClose }) {
  const [tab, setTab] = useState('publicaciones')
  const [pubUrl, setPubUrl] = useState(config.spreadsheetId || '')
  const [scriptUrl, setScriptUrl] = useState(config.requestsScriptUrl || '')

  const handleSave = () => {
    onSave({ spreadsheetId: pubUrl.trim(), requestsScriptUrl: scriptUrl.trim() })
  }

  const handleClear = () => {
    onSave({ spreadsheetId: '', requestsScriptUrl: '' })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-base font-bold text-gray-900">Configuración</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-5 flex-shrink-0">
          {[['publicaciones','📅 Publicaciones'],['peticiones','📬 Peticiones']].map(([t,label]) => (
            <button key={t} onClick={() => setTab(t)}
              className={`pb-2.5 pt-2 mr-4 text-xs font-semibold border-b-2 transition-colors ${tab === t ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
              {label}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {tab === 'publicaciones' && (
            <>
              <div className="bg-blue-50 rounded-xl p-4 space-y-3">
                <p className="text-xs font-semibold text-blue-900">Columnas necesarias en tu Google Sheet:</p>
                <div className="bg-white rounded-lg overflow-hidden border border-blue-100">
                  <div className="grid text-center" style={{ gridTemplateColumns: `repeat(${COLUMNS.length}, 1fr)` }}>
                    {COLUMNS.map(col => (
                      <div key={col} className="px-1 py-1.5 text-xs font-semibold text-blue-700 border-r border-blue-100 last:border-r-0 bg-blue-50/50">{col}</div>
                    ))}
                  </div>
                  <div className="grid border-t border-blue-100" style={{ gridTemplateColumns: `repeat(${COLUMNS.length}, 1fr)` }}>
                    {EXAMPLE.map((ex, i) => (
                      <div key={i} className="px-1 py-1 text-xs text-gray-400 border-r border-blue-100 last:border-r-0 truncate text-center">{ex}</div>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-blue-800">
                  La columna <strong>Tipo</strong> acepta: <code className="bg-blue-100 px-1 rounded">imagen</code>, <code className="bg-blue-100 px-1 rounded">video</code>, <code className="bg-blue-100 px-1 rounded">reel</code>, <code className="bg-blue-100 px-1 rounded">historia</code>
                </p>
                <ol className="space-y-1 text-xs text-blue-800">
                  <li className="flex gap-2"><span className="font-bold text-blue-500">1.</span> Ve a <strong>Archivo → Compartir → Publicar en la web</strong></li>
                  <li className="flex gap-2"><span className="font-bold text-blue-500">2.</span> Elige <strong>Hoja 1</strong> y formato <strong>CSV</strong> → Publicar</li>
                  <li className="flex gap-2"><span className="font-bold text-blue-500">3.</span> Copia la URL que aparece y pégala abajo</li>
                </ol>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">URL de la hoja publicada</label>
                <input type="text" value={pubUrl} onChange={e => setPubUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/e/…/pub?output=csv"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 font-mono" />
                <p className="text-xs text-gray-400 mt-1">También puedes pegar la URL de edición o solo el ID</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500"><strong>Fechas:</strong> DD/MM/YYYY · YYYY-MM-DD · DD-MM-YYYY</p>
              </div>
            </>
          )}

          {tab === 'peticiones' && (
            <>
              <div className="bg-amber-50 rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-amber-900">¿Cómo funciona el sistema de peticiones?</p>
                <p className="text-xs text-amber-800">
                  Empleados y socios rellenan el formulario y las peticiones se guardan automáticamente. Para que varias personas puedan verlas, necesitas un <strong>Google Apps Script</strong> como intermediario.
                </p>
                <ol className="space-y-1 text-xs text-amber-800 mt-2">
                  <li className="flex gap-2"><span className="font-bold text-amber-500">1.</span> Ve a <strong>script.google.com</strong> y crea un nuevo proyecto</li>
                  <li className="flex gap-2"><span className="font-bold text-amber-500">2.</span> Pega el código del script (disponible en el repositorio)</li>
                  <li className="flex gap-2"><span className="font-bold text-amber-500">3.</span> Despliégalo como <strong>Web App</strong> (acceso: "Cualquiera")</li>
                  <li className="flex gap-2"><span className="font-bold text-amber-500">4.</span> Copia la URL del Web App y pégala abajo</li>
                </ol>
                <p className="text-xs text-amber-700 bg-amber-100 rounded-lg p-2 mt-2">
                  Sin este paso, las peticiones solo se guardan en el navegador de quien las envía.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">URL del Apps Script (opcional)</label>
                <input type="text" value={scriptUrl} onChange={e => setScriptUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/…/exec"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 font-mono" />
                <p className="text-xs text-gray-400 mt-1">Deja vacío para guardar peticiones solo localmente</p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 p-5 border-t border-gray-100 flex-shrink-0">
          {(config.spreadsheetId || config.requestsScriptUrl) && (
            <button onClick={handleClear} className="px-3 py-2.5 text-gray-400 hover:text-gray-600 text-sm transition-colors">
              Limpiar
            </button>
          )}
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave} className="flex-1 px-4 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}
