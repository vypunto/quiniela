import { useState, useEffect, useCallback } from 'react'
import Header from './components/Header'
import CalendarGrid from './components/CalendarGrid'
import CalendarList from './components/CalendarList'
import PublicationModal from './components/PublicationModal'
import SettingsModal from './components/SettingsModal'
import ProjectLegend from './components/ProjectLegend'
import RequestsView from './components/RequestsView'
import { fetchSheetData } from './utils/googleSheets'
import { SPREADSHEET_URL, REQUESTS_SCRIPT_URL } from './config'

const now = new Date()
const Y = now.getFullYear()
const M = now.getMonth()

const DEMO = [
  { id: 'd0',  proyecto: 'prevenidos y accion', fecha: new Date(Y,M,2),  titulo: '5 consejos para una vuelta al cole sin estrés', copy: '¿Preparados para el nuevo curso? Os compartimos los 5 consejos que más nos funcionan para arrancar septiembre con energía y sin agobios. 👇', media: '', tipo: 'imagen' },
  { id: 'd1',  proyecto: 'plaza el chandrio',   fecha: new Date(Y,M,4),  titulo: 'La terraza más bonita del barrio ya está abierta', copy: 'Sol, buena compañía y las mejores tapas de la plaza. Nuestra terraza de verano abre esta semana. ¡Te esperamos! ☀️🍻', media: '', tipo: 'imagen' },
  { id: 'd2',  proyecto: 'el chandrio group',   fecha: new Date(Y,M,7),  titulo: 'Nos expandimos: tres nuevas ciudades en 2026', copy: 'El Chandrio Group da el salto. Este año abrimos en Valencia, Málaga y Bilbao. 🚀', media: '', tipo: 'imagen' },
  { id: 'd3',  proyecto: 'globaly live',        fecha: new Date(Y,M,9),  titulo: 'Concierto en directo este sábado — entrada libre', copy: '🎵 Este sábado música en vivo desde las 20h. Acceso libre hasta completar aforo.', media: '', tipo: 'video' },
  { id: 'd4',  proyecto: 'del poble fest',      fecha: new Date(Y,M,12), titulo: 'Programa completo del festival — ¡ya disponible!', copy: '¡Por fin! Ya puedes consultar todos los artistas, horarios y escenarios. Corre que las entradas vuelan 🎪', media: '', tipo: 'imagen' },
  { id: 'd5',  proyecto: 'gastro league',       fecha: new Date(Y,M,15), titulo: 'Menú especial de temporada: sabores de verano', copy: 'Tomate de huerta, gazpacho de la abuela y nuestro arroz caldoso de bogavante. 🦞🍅', media: '', tipo: 'imagen' },
  { id: 'd6',  proyecto: 'teatro alicante',     fecha: new Date(Y,M,18), titulo: 'Estreno: "La noche de los sueños" — viernes 18', copy: 'Una historia de amor, memoria y segundas oportunidades. 🎭', media: '', tipo: 'video' },
  { id: 'd7',  proyecto: 'sevilla',             fecha: new Date(Y,M,22), titulo: 'Ruta por el casco histórico: 10 rincones que no conoces', copy: 'Sevilla tiene secretos que solo los que saben mirar encuentran. 🗺️', media: '', tipo: 'imagen' },
  { id: 'd8',  proyecto: 'la cruz de celia',    fecha: new Date(Y,M,25), titulo: 'Nueva colección Otoño — disponible desde hoy', copy: 'Piezas únicas hechas a mano, con tejidos naturales. 🍂✨', media: '', tipo: 'imagen' },
  { id: 'd9',  proyecto: 'gastro league',       fecha: new Date(Y,M,9),  titulo: 'El postre del mes: tarta de queso con membrillo', copy: 'Nuestra tarta de queso con membrillo casero se ha convertido en la más pedida del mes. 🧀', media: '', tipo: 'imagen' },
  { id: 'd10', proyecto: 'prevenidos y accion', fecha: new Date(Y,M,16), titulo: 'Taller gratuito de primeros auxilios — plazas limitadas', copy: 'Aprende a actuar en los primeros minutos de una emergencia. 🚑', media: '', tipo: 'video' },
  { id: 'd11', proyecto: 'globaly live',        fecha: new Date(Y,M,20), titulo: 'Recap del concierto del sábado 🔥', copy: 'Qué noche más especial. Gracias a todos los que vinisteis. ❤️🎶', media: '', tipo: 'video' },
  { id: 'd12', proyecto: 'plaza el chandrio',   fecha: new Date(Y,M,27), titulo: 'Martes de vermut: 2x1 hasta las 14h', copy: 'Todos los martes, vermut de la casa al 2x1 hasta las 2 de la tarde. 🥂', media: '', tipo: 'imagen' },
]

export default function App() {
  const [year, setYear]         = useState(Y)
  const [month, setMonth]       = useState(M)
  const [viewMode, setViewMode] = useState('grid')
  const [activeTab, setActiveTab] = useState('publicaciones')
  const [activeFilter, setActiveFilter] = useState(null)
  const [publications, setPublications] = useState([])
  const [isDemo, setIsDemo]     = useState(false)
  const [realPublications, setRealPublications] = useState([])
  const [selectedPub, setSelectedPub] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  // Config: hardcoded values take priority over localStorage
  const [config, setConfig]     = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('pubcal_config') || '{}')
      return {
        spreadsheetId: SPREADSHEET_URL || saved.spreadsheetId || '',
        requestsScriptUrl: REQUESTS_SCRIPT_URL || saved.requestsScriptUrl || '',
      }
    } catch {
      return { spreadsheetId: SPREADSHEET_URL, requestsScriptUrl: REQUESTS_SCRIPT_URL }
    }
  })

  const syncData = useCallback(async () => {
    if (!config.spreadsheetId) return
    setLoading(true)
    setError(null)
    try {
      const data = await fetchSheetData(config.spreadsheetId)
      setRealPublications(data)
      setPublications(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [config.spreadsheetId])

  useEffect(() => { syncData() }, [syncData])

  const saveConfig = (newConfig) => {
    setConfig(newConfig)
    try { localStorage.setItem('pubcal_config', JSON.stringify(newConfig)) } catch { /* ignore */ }
    setShowSettings(false)
  }

  const loadDemo = () => { setIsDemo(true); setYear(Y); setMonth(M); setActiveFilter(null) }
  const exitDemo = () => { setIsDemo(false); setPublications(realPublications) }

  const displayPubs = isDemo ? DEMO : publications

  const prevMonth = () => { if (month === 0) { setYear(y => y-1); setMonth(11) } else setMonth(m => m-1) }
  const nextMonth = () => { if (month === 11) { setYear(y => y+1); setMonth(0) } else setMonth(m => m+1) }

  const hasConfig   = !!config.spreadsheetId
  const showCalendar = hasConfig || isDemo

  const handleFilter = (project) => {
    setActiveFilter(project)
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(150deg, #fdfcfd 0%, #f9f7fb 50%, #f5f5f7 100%)' }}>
      <Header
        year={year} month={month}
        activeTab={activeTab} setActiveTab={setActiveTab}
        viewMode={viewMode} setViewMode={setViewMode}
        onPrev={prevMonth} onNext={nextMonth}
        onSettings={() => setShowSettings(true)}
        onSync={syncData} loading={loading} hasConfig={hasConfig}
        isDemo={isDemo} onDemo={loadDemo} onExitDemo={exitDemo}
      />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-5">

        {/* Demo banner */}
        {isDemo && activeTab === 'publicaciones' && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-800 text-xs flex items-center gap-2">
            <span>✦</span>
            <span>Modo ejemplo activo. Los datos reales siguen guardados.</span>
            <div className="ml-auto flex items-center gap-2 flex-shrink-0">
              {realPublications.length > 0 && (
                <button onClick={exitDemo} className="font-semibold underline hover:no-underline">Volver a datos reales</button>
              )}
              {!hasConfig && (
                <button onClick={() => setShowSettings(true)} className="font-semibold underline hover:no-underline">Conectar</button>
              )}
            </div>
          </div>
        )}

        {/* Error */}
        {error && activeTab === 'publicaciones' && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm flex items-start gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 mt-0.5">
              <circle cx="8" cy="8" r="7" stroke="#EF4444" strokeWidth="1.3"/>
              <path d="M8 5v3M8 10.5v.5" stroke="#EF4444" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <div className="flex-1">
              <div className="font-semibold text-xs mb-0.5">Error al sincronizar</div>
              <div className="text-xs text-red-600">{error}</div>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <button onClick={loadDemo} className="text-xs text-red-400 underline hover:no-underline">Ver ejemplo</button>
              <button onClick={() => setShowSettings(true)} className="text-xs text-red-600 underline hover:no-underline">Configurar</button>
            </div>
          </div>
        )}

        {/* Publications tab */}
        {activeTab === 'publicaciones' && (
          <>
            {!showCalendar && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-4">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <rect x="2" y="2" width="11" height="11" rx="2" fill="white"/>
                    <rect x="15" y="2" width="11" height="11" rx="2" fill="white"/>
                    <rect x="2" y="15" width="11" height="11" rx="2" fill="white"/>
                    <rect x="15" y="15" width="11" height="11" rx="2" fill="white" opacity="0.3"/>
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Calendario de Publicaciones</h2>
                <p className="text-sm text-gray-400 mb-6 text-center max-w-xs">Conecta tu Google Sheet o prueba el ejemplo para ver cómo funciona</p>
                <div className="flex gap-3">
                  <button onClick={loadDemo} className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">Ver ejemplo</button>
                  <button onClick={() => setShowSettings(true)} className="px-5 py-2.5 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors">Conectar Google Sheets</button>
                </div>
              </div>
            )}

            {showCalendar && (
              <>
                <ProjectLegend publications={displayPubs} activeFilter={activeFilter} onFilter={handleFilter} />

                {loading && publications.length === 0 && (
                  <div className="text-center py-16 text-gray-400 text-sm">
                    <div className="animate-spin w-6 h-6 border-2 border-gray-200 border-t-gray-600 rounded-full mx-auto mb-3" />
                    Cargando publicaciones...
                  </div>
                )}

                {(!loading || displayPubs.length > 0) && (
                  viewMode === 'grid'
                    ? <CalendarGrid year={year} month={month} publications={displayPubs} onSelect={setSelectedPub} activeFilter={activeFilter} />
                    : <CalendarList year={year} month={month} publications={displayPubs} onSelect={setSelectedPub} activeFilter={activeFilter} />
                )}
              </>
            )}
          </>
        )}

        {/* Requests tab */}
        {activeTab === 'peticiones' && (
          <RequestsView config={config} isDemo={isDemo} />
        )}
      </main>

      {selectedPub && <PublicationModal publication={selectedPub} onClose={() => setSelectedPub(null)} />}
      {showSettings && <SettingsModal config={config} onSave={saveConfig} onClose={() => setShowSettings(false)} />}
    </div>
  )
}
