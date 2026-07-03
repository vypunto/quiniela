import { useState, useEffect, useCallback } from 'react'
import Header from './components/Header'
import CalendarGrid from './components/CalendarGrid'
import CalendarList from './components/CalendarList'
import VisualFeed from './components/VisualFeed'
import CalendarSkeleton from './components/CalendarSkeleton'
import PublicationModal from './components/PublicationModal'
import SettingsModal from './components/SettingsModal'
import ProjectLegend from './components/ProjectLegend'
import RequestsView from './components/RequestsView'
import MonthSummary from './components/MonthSummary'
import { fetchSheetData } from './utils/googleSheets'
import { SPREADSHEET_URL, REQUESTS_SCRIPT_URL } from './config'

const now = new Date()
const Y = now.getFullYear()
const M = now.getMonth()

const DEMO = [
  { id: 'd0',  proyecto: 'PREVENIDOS Y ACCION', fecha: new Date(Y,M,2),  titulo: '5 consejos para una vuelta al cole sin estrés', copy: '¿Preparados para el nuevo curso? Os compartimos los 5 consejos que más nos funcionan para arrancar septiembre con energía y sin agobios. 👇', media: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=900&q=80', tipo: 'imagen', estado: '' },
  { id: 'd1',  proyecto: 'PLAZA EL CHANDRIO',   fecha: new Date(Y,M,4),  titulo: 'La terraza más bonita del barrio ya está abierta', copy: 'Sol, buena compañía y las mejores tapas de la plaza. Nuestra terraza de verano abre esta semana. ¡Te esperamos! ☀️🍻', media: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=80', tipo: 'imagen', estado: '' },
  { id: 'd2',  proyecto: 'EL CHANDRIO GROUP',   fecha: new Date(Y,M,7),  titulo: 'Nos expandimos: tres nuevas ciudades en 2026', copy: 'El Chandrio Group da el salto. Este año abrimos en Valencia, Málaga y Bilbao. 🚀', media: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&q=80', tipo: 'imagen', estado: '' },
  { id: 'd3',  proyecto: 'GLOBALY LIVE',        fecha: new Date(Y,M,9),  titulo: 'Concierto en directo este sábado — entrada libre', copy: '🎵 Este sábado música en vivo desde las 20h. Acceso libre hasta completar aforo.', media: 'https://www.youtube.com/watch?v=ZbZSe6N_BXs', tipo: 'video', estado: '' },
  { id: 'd4',  proyecto: 'DEL POBLE FEST',      fecha: new Date(Y,M,12), titulo: 'Programa completo del festival — ¡ya disponible!', copy: '¡Por fin! Ya puedes consultar todos los artistas, horarios y escenarios. Corre que las entradas vuelan 🎪', media: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=900&q=80', tipo: 'imagen', estado: '' },
  { id: 'd5',  proyecto: 'GASTRO LEAGUE',       fecha: new Date(Y,M,15), titulo: 'Menú especial de temporada: sabores de verano', copy: 'Tomate de huerta, gazpacho de la abuela y nuestro arroz caldoso de bogavante. 🦞🍅', media: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&q=80', tipo: 'imagen', estado: '' },
  { id: 'd6',  proyecto: 'TEATRO ALICANTE',     fecha: new Date(Y,M,18), titulo: 'Estreno: "La noche de los sueños" — viernes 18', copy: 'Una historia de amor, memoria y segundas oportunidades. 🎭', media: 'https://www.youtube.com/watch?v=LXb3EKWsInQ', tipo: 'video', estado: '' },
  { id: 'd7',  proyecto: 'TEATRO SEVILLA',      fecha: new Date(Y,M,22), titulo: 'Ruta por el casco histórico: 10 rincones que no conoces', copy: 'Sevilla tiene secretos que solo los que saben mirar encuentran. 🗺️', media: 'https://images.unsplash.com/photo-1559060017-445fb9313ede?w=900&q=80', tipo: 'imagen', estado: '' },
  { id: 'd8',  proyecto: 'LA CRUZ DE CELIA',    fecha: new Date(Y,M,25), titulo: 'Nueva colección Otoño — disponible desde hoy', copy: 'Piezas únicas hechas a mano, con tejidos naturales. 🍂✨', media: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=900&q=80', tipo: 'imagen', estado: '' },
  { id: 'd9',  proyecto: 'GASTRO LEAGUE',       fecha: new Date(Y,M,9),  titulo: 'El postre del mes: tarta de queso con membrillo', copy: 'Nuestra tarta de queso con membrillo casero se ha convertido en la más pedida del mes. 🧀', media: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=900&q=80', tipo: 'imagen', estado: '' },
  { id: 'd10', proyecto: 'PREVENIDOS Y ACCION', fecha: new Date(Y,M,16), titulo: 'Taller gratuito de primeros auxilios — plazas limitadas', copy: 'Aprende a actuar en los primeros minutos de una emergencia. 🚑', media: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=900&q=80', tipo: 'video', estado: '' },
  { id: 'd11', proyecto: 'GLOBALY LIVE',        fecha: new Date(Y,M,20), titulo: 'Recap del concierto del sábado 🔥', copy: 'Qué noche más especial. Gracias a todos los que vinisteis. ❤️🎶', media: 'https://www.youtube.com/watch?v=09R8_2nJtjg', tipo: 'video', estado: '' },
  { id: 'd12', proyecto: 'PLAZA EL CHANDRIO',   fecha: new Date(Y,M,27), titulo: 'Martes de vermut: 2x1 hasta las 14h', copy: 'Todos los martes, vermut de la casa al 2x1 hasta las 2 de la tarde. 🥂', media: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=900&q=80', tipo: 'imagen', estado: '' },
]

export default function App() {
  const [year, setYear]           = useState(Y)
  const [month, setMonth]         = useState(M)
  const [navDir, setNavDir]       = useState(0)
  const [viewMode, setViewMode]   = useState('grid')
  const [activeTab, setActiveTab] = useState('publicaciones')
  const [activeFilter, setActiveFilter] = useState([])
  const [publications, setPublications] = useState([])
  const [isDemo, setIsDemo]       = useState(false)
  const [realPublications, setRealPublications] = useState([])
  const [selectedPub, setSelectedPub] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState(null)
  const [pendingCount, setPendingCount] = useState(0)

  const [config] = useState(() => {
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

  const toggleFilter = name => setActiveFilter(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name])
  const clearFilter = () => setActiveFilter([])

  const loadDemo = () => { setIsDemo(true); setYear(Y); setMonth(M); setActiveFilter([]) }
  const exitDemo = () => { setIsDemo(false); setPublications(realPublications) }

  const displayPubs = isDemo ? DEMO : publications

  const prevMonth = () => {
    setNavDir(-1)
    if (month === 0) { setYear(y => y - 1); setMonth(11) } else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    setNavDir(1)
    if (month === 11) { setYear(y => y + 1); setMonth(0) } else setMonth(m => m + 1)
  }

  const hasConfig    = !!config.spreadsheetId
  const showCalendar = hasConfig || isDemo
  const animClass    = navDir > 0 ? 'slide-next' : navDir < 0 ? 'slide-prev' : ''

  // Publications list available for swipe navigation in modal (sorted by date)
  const sortedPubs = [...displayPubs].sort((a, b) => (a.fecha || 0) - (b.fecha || 0))

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F8FA' }}>
      {/* Ambient background orbs */}
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: '-180px', right: '-140px',
          width: '800px', height: '800px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(250,82,60,0.14) 0%, rgba(250,82,60,0.05) 40%, transparent 65%)',
          animation: 'orbFloat1 18s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '-200px', left: '-160px',
          width: '850px', height: '850px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(90,209,181,0.13) 0%, rgba(90,209,181,0.04) 40%, transparent 65%)',
          animation: 'orbFloat2 22s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', top: '40%', left: '35%',
          width: '620px', height: '620px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,191,3,0.12) 0%, rgba(255,191,3,0.04) 42%, transparent 65%)',
          animation: 'orbFloat3 14s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', top: '10%', left: '20%',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(250,82,60,0.10) 0%, transparent 60%)',
          animation: 'orbFloat2 26s ease-in-out infinite reverse',
        }} />
      </div>
      <div className="relative" style={{ zIndex: 1 }}>
      <Header
        year={year} month={month}
        activeTab={activeTab} setActiveTab={setActiveTab}
        viewMode={viewMode} setViewMode={setViewMode}
        onPrev={prevMonth} onNext={nextMonth}
        onSettings={() => setShowSettings(true)}
        onSync={syncData} loading={loading} hasConfig={hasConfig}
        isDemo={isDemo} onDemo={loadDemo} onExitDemo={exitDemo}
        pendingCount={pendingCount}
      />

      {/* Banner strip */}
      <div className="w-full overflow-hidden" style={{ height: '7px' }}>
        <img
          src="https://www.elchandriogroup.com/wp-content/uploads/hogueras-2026/logo-fondo-gradient.png"
          alt=""
          className="w-full h-full object-cover"
          draggable="false"
        />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">

        {/* Error */}
        {error && activeTab === 'publicaciones' && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm flex items-start gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 mt-0.5">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M8 5v3M8 10.5v.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <div className="flex-1">
              <div className="font-semibold text-xs mb-0.5">Error al sincronizar</div>
              <div className="text-xs opacity-80">{error}</div>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <button onClick={loadDemo} className="text-xs underline hover:no-underline opacity-60">Ver ejemplo</button>
              <button onClick={() => setShowSettings(true)} className="text-xs underline hover:no-underline">Configurar</button>
            </div>
          </div>
        )}

        {/* Publications tab */}
        {activeTab === 'publicaciones' && (
          <>
            {!showCalendar && (
              <div className="flex flex-col items-center justify-center py-24 px-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                  style={{ backgroundColor: '#732442' }}
                >
                  <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
                    <rect x="2" y="2" width="11" height="11" rx="2" fill="white"/>
                    <rect x="15" y="2" width="11" height="11" rx="2" fill="white"/>
                    <rect x="2" y="15" width="11" height="11" rx="2" fill="white"/>
                    <rect x="15" y="15" width="11" height="11" rx="2" fill="white" opacity="0.4"/>
                  </svg>
                </div>
                <h2 className="text-2xl font-black tracking-tight text-gray-900 mb-2">Calendario de publicaciones</h2>
                <p className="text-sm text-gray-400 mb-8 text-center max-w-xs leading-relaxed">Conecta tu Google Sheet o prueba el modo demo para ver cómo funciona</p>
                <div className="flex gap-3">
                  <button
                    onClick={loadDemo}
                    className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-white hover:border-gray-300 transition-all duration-150"
                  >
                    Ver demo
                  </button>
                  <button
                    onClick={() => setShowSettings(true)}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:brightness-90"
                    style={{ backgroundColor: '#732442' }}
                  >
                    Conectar Google Sheets
                  </button>
                </div>
              </div>
            )}

            {showCalendar && (
              <>
                {viewMode !== 'feed' && <ProjectLegend publications={displayPubs} activeFilter={activeFilter} onFilter={toggleFilter} onClear={clearFilter} />}
                {viewMode !== 'feed' && <MonthSummary publications={displayPubs} year={year} month={month} />}

                {loading && publications.length === 0 && <CalendarSkeleton />}

                {(!loading || displayPubs.length > 0) && (
                  <div key={`${year}-${month}`} className={animClass}>
                    {viewMode === 'grid' && <CalendarGrid year={year} month={month} publications={displayPubs} onSelect={setSelectedPub} activeFilter={activeFilter} />}
                    {viewMode === 'list' && <CalendarList year={year} month={month} publications={displayPubs} onSelect={setSelectedPub} activeFilter={activeFilter} />}
                    {viewMode === 'feed' && <VisualFeed publications={displayPubs} onSelect={setSelectedPub} selectedPub={selectedPub} activeFilter={activeFilter} />}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Requests tab */}
        {activeTab === 'peticiones' && (
          <RequestsView config={config} isDemo={isDemo} calendarPubs={displayPubs} onCountChange={setPendingCount} />
        )}
      </main>

      {selectedPub && (
        <PublicationModal
          publication={selectedPub}
          allPublications={sortedPubs}
          onNavigate={setSelectedPub}
          onClose={() => setSelectedPub(null)}
        />
      )}
      {showSettings && <SettingsModal config={config} onClose={() => setShowSettings(false)} />}
      </div>
    </div>
  )
}
