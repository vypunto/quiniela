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
  // ── Imágenes ──
  { id: 'd0',  proyecto: 'PREVENIDOS Y ACCION', fecha: new Date(Y,M,2),  titulo: '5 consejos para una vuelta al cole sin estrés', copy: '¿Preparados para el nuevo curso? Os compartimos los 5 consejos que más nos funcionan para arrancar septiembre con energía y sin agobios. 👇', media: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=900&q=80', tipo: 'imagen', estado: '' },
  { id: 'd1',  proyecto: 'PLAZA EL CHANDRIO',   fecha: new Date(Y,M,4),  titulo: 'La terraza más bonita del barrio ya está abierta', copy: 'Sol, buena compañía y las mejores tapas de la plaza. Nuestra terraza de verano abre esta semana. ¡Te esperamos! ☀️🍻', media: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=80', tipo: 'imagen', estado: '' },
  { id: 'd2',  proyecto: 'EL CHANDRIO GROUP',   fecha: new Date(Y,M,7),  titulo: 'Nos expandimos: tres nuevas ciudades en 2026', copy: 'El Chandrio Group da el salto. Este año abrimos en Valencia, Málaga y Bilbao. 🚀', media: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&q=80', tipo: 'imagen', estado: '' },
  { id: 'd4',  proyecto: 'DEL POBLE FEST',      fecha: new Date(Y,M,12), titulo: 'Programa completo del festival — ¡ya disponible!', copy: '¡Por fin! Ya puedes consultar todos los artistas, horarios y escenarios. Corre que las entradas vuelan 🎪', media: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=900&q=80', tipo: 'imagen', estado: '' },
  { id: 'd5',  proyecto: 'GASTRO LEAGUE',       fecha: new Date(Y,M,15), titulo: 'Menú especial de temporada: sabores de verano', copy: 'Tomate de huerta, gazpacho de la abuela y nuestro arroz caldoso de bogavante. 🦞🍅', media: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=900&q=80', tipo: 'imagen', estado: '' },
  { id: 'd7',  proyecto: 'TEATRO SEVILLA',      fecha: new Date(Y,M,22), titulo: 'Ruta por el casco histórico: 10 rincones que no conoces', copy: 'Sevilla tiene secretos que solo los que saben mirar encuentran. 🗺️', media: 'https://images.unsplash.com/photo-1559060017-445fb9313ede?w=900&q=80', tipo: 'imagen', estado: '' },
  { id: 'd8',  proyecto: 'LA CRUZ DE CELIA',    fecha: new Date(Y,M,25), titulo: 'Nueva colección Otoño — disponible desde hoy', copy: 'Piezas únicas hechas a mano, con tejidos naturales. 🍂✨', media: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=900&q=80', tipo: 'imagen', estado: '' },
  { id: 'd9',  proyecto: 'GASTRO LEAGUE',       fecha: new Date(Y,M,9),  titulo: 'El postre del mes: tarta de queso con membrillo', copy: 'Nuestra tarta de queso con membrillo casero se ha convertido en la más pedida del mes. 🧀', media: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=900&q=80', tipo: 'imagen', estado: '' },
  { id: 'd12', proyecto: 'PLAZA EL CHANDRIO',   fecha: new Date(Y,M,27), titulo: 'Martes de vermut: 2x1 hasta las 14h', copy: 'Todos los martes, vermut de la casa al 2x1 hasta las 2 de la tarde. 🥂', media: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=900&q=80', tipo: 'imagen', estado: '' },
  { id: 'n11', proyecto: 'TEATRO ALICANTE',     fecha: new Date(Y,M,19), titulo: 'El equipo al completo antes del estreno', copy: 'Nervios, ilusión y mucho talento. Esta noche hay magia sobre el escenario 🎭✨', media: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&q=80', tipo: 'imagen', estado: '' },
  { id: 'n12', proyecto: 'PREVENIDOS Y ACCION', fecha: new Date(Y,M,24), titulo: 'Voluntarios del mes — ¡gracias!', copy: 'Gracias a estas personas increíbles que hacen posible nuestro proyecto cada semana ❤️🙌', media: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=900&q=80', tipo: 'imagen', estado: '' },
  { id: 'n13', proyecto: 'GLOBALY LIVE',        fecha: new Date(Y,M,29), titulo: 'El público que nos hace grandes', copy: '3.000 personas que lo dieron todo. Esto es por vosotros 🔥🎤', media: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=900&q=80', tipo: 'imagen', estado: '' },

  // ── Vídeos ──
  { id: 'd3',  proyecto: 'GLOBALY LIVE',        fecha: new Date(Y,M,9),  titulo: 'Concierto en directo este sábado — entrada libre', copy: '🎵 Este sábado música en vivo desde las 20h. Acceso libre hasta completar aforo.', media: 'https://www.youtube.com/watch?v=ZbZSe6N_BXs', tipo: 'video', estado: '' },
  { id: 'd6',  proyecto: 'TEATRO ALICANTE',     fecha: new Date(Y,M,18), titulo: 'Estreno: "La noche de los sueños" — viernes 18', copy: 'Una historia de amor, memoria y segundas oportunidades. 🎭', media: 'https://www.youtube.com/watch?v=LXb3EKWsInQ', tipo: 'video', estado: '' },
  { id: 'd11', proyecto: 'GLOBALY LIVE',        fecha: new Date(Y,M,20), titulo: 'Recap del concierto del sábado 🔥', copy: 'Qué noche más especial. Gracias a todos los que vinisteis. ❤️🎶', media: 'https://www.youtube.com/watch?v=09R8_2nJtjg', tipo: 'video', estado: '' },
  { id: 'n8',  proyecto: 'GASTRO LEAGUE',       fecha: new Date(Y,M,5),  titulo: 'Vídeo: Así elaboramos nuestro pan de masa madre', copy: '72 horas de fermentación. No hay atajos para el sabor real 🍞🔥', media: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk', tipo: 'video', estado: '' },
  { id: 'n9',  proyecto: 'LA CRUZ DE CELIA',    fecha: new Date(Y,M,14), titulo: 'Vídeo: Cómo nace una pieza artesanal', copy: 'De la materia prima a tus manos. Este proceso nos lleva 3 días ✂️🧵', media: 'https://www.youtube.com/watch?v=JGwWNGJdvx8', tipo: 'video', estado: '' },
  { id: 'n10', proyecto: 'TEATRO SEVILLA',      fecha: new Date(Y,M,23), titulo: 'Vídeo: Sevilla desde el aire al amanecer', copy: 'Así se ve nuestra ciudad a las 6 de la mañana. Un regalo para los que madrugan 🌅', media: 'https://www.youtube.com/watch?v=OPf0YbXqDm0', tipo: 'video', estado: '' },

  // ── Reels ──
  { id: 'n0',  proyecto: 'EL CHANDRIO GROUP',   fecha: new Date(Y,M,3),  titulo: 'Reel: 2025 en 30 segundos', copy: 'Un año que no para. Desliza hacia arriba 🚀', media: 'https://www.youtube.com/watch?v=9bZkp7q19f0', tipo: 'reel', estado: '' },
  { id: 'n1',  proyecto: 'PREVENIDOS Y ACCION', fecha: new Date(Y,M,6),  titulo: 'Reel: RCP en 4 pasos — guarda este vídeo', copy: 'Comparte. Puede salvar una vida 🚨 Solo necesitas saber esto.', media: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ', tipo: 'reel', estado: '' },
  { id: 'n2',  proyecto: 'DEL POBLE FEST',      fecha: new Date(Y,M,10), titulo: 'Reel: El cartel cobra vida 🎪', copy: 'Sonido al máximo 🔊 Ya queda menos para el mejor festival del año.', media: 'https://www.youtube.com/watch?v=oHg5SJYRHA0', tipo: 'reel', estado: '' },
  { id: 'd10', proyecto: 'GASTRO LEAGUE',       fecha: new Date(Y,M,13), titulo: 'Reel: El plato del día en tiempo récord', copy: 'Mira cómo montamos un pulpo a la gallega en 45 segundos 🐙⚡', media: 'https://www.youtube.com/watch?v=3AAdKl1UYZs', tipo: 'reel', estado: '' },
  { id: 'n14', proyecto: 'PLAZA EL CHANDRIO',   fecha: new Date(Y,M,17), titulo: 'Reel: ¿Eres de vermut o de caña?', copy: 'La pregunta del millón 🍻 Comenta abajo y debatimos.', media: 'https://www.youtube.com/watch?v=CevxZvSJLk8', tipo: 'reel', estado: '' },
  { id: 'n15', proyecto: 'LA CRUZ DE CELIA',    fecha: new Date(Y,M,26), titulo: 'Reel: Lookbook en movimiento — otoño 2026', copy: 'Las piezas de esta temporada merec­en verse en movimiento 🍂✨', media: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', tipo: 'reel', estado: '' },

  // ── Carruseles ──
  { id: 'n3',  proyecto: 'TEATRO ALICANTE',     fecha: new Date(Y,M,8),  titulo: 'Carrusel: Detrás de los bastidores del estreno', copy: 'Lo que no ves antes del telón. Así es el backstage real 🎭 Desliza →', media: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&q=80', tipo: 'carrusel', estado: '' },
  { id: 'n4',  proyecto: 'LA CRUZ DE CELIA',    fecha: new Date(Y,M,11), titulo: 'Carrusel: Lookbook otoño — 10 looks', copy: '¿Con cuál te quedas? Guarda el que más te guste y etiqueta a alguien 🍂', media: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&q=80', tipo: 'carrusel', estado: '' },
  { id: 'n5',  proyecto: 'EL CHANDRIO GROUP',   fecha: new Date(Y,M,16), titulo: 'Carrusel: El equipo detrás del grupo', copy: 'Las personas que hacen posible todo esto cada día 💚 Desliza para conocernos.', media: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&q=80', tipo: 'carrusel', estado: '' },
  { id: 'n6',  proyecto: 'GASTRO LEAGUE',       fecha: new Date(Y,M,21), titulo: 'Carrusel: Los 5 platos del mes de agosto', copy: 'Agosto sabe así 🌞 Nuestras propuestas favoritas. ¿Cuál es la tuya?', media: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=900&q=80', tipo: 'carrusel', estado: '' },
  { id: 'n7',  proyecto: 'GLOBALY LIVE',        fecha: new Date(Y,M,28), titulo: 'Carrusel: 12 momentos del mes', copy: '12 momentos, 12 fotos, 1 mes que no olvidaremos 📸 Desliza hasta el final 👉', media: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=900&q=80', tipo: 'carrusel', estado: '' },
  { id: 'n16', proyecto: 'DEL POBLE FEST',      fecha: new Date(Y,M,30), titulo: 'Carrusel: Así fue el último día del festival', copy: 'Fin de fiesta. Gracias a todos. Nos vemos el año que viene 🎉🎪', media: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&q=80', tipo: 'carrusel', estado: '' },

  // ── Historias ──
  { id: 'h0',  proyecto: 'GASTRO LEAGUE',       fecha: new Date(Y,M,4),  titulo: 'Historia: Especial del día — pulpo a la gallega', copy: '¡Solo hasta las 16h! Ven antes de que se acabe 🐙', media: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=900&q=80', tipo: 'historia', estado: '' },
  { id: 'h1',  proyecto: 'TEATRO ALICANTE',     fecha: new Date(Y,M,17), titulo: 'Historia: Cuenta atrás — 3 días para el estreno', copy: '¡Ya queda poquito! Os mandamos mucha energía desde los camerinos 🎭', media: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&q=80', tipo: 'historia', estado: '' },
  { id: 'h2',  proyecto: 'GLOBALY LIVE',        fecha: new Date(Y,M,9),  titulo: 'Historia: Soundcheck en directo ahora mismo', copy: 'Estamos preparando algo especial para esta noche 🎶 Os vemos pronto.', media: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=900&q=80', tipo: 'historia', estado: '' },
  { id: 'h3',  proyecto: 'PLAZA EL CHANDRIO',   fecha: new Date(Y,M,12), titulo: 'Historia: ¿Qué queréis ver en la carta de otoño?', copy: 'Encuesta 👆 Tu voto cuenta para el menú de temporada 🍂', media: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=80', tipo: 'historia', estado: '' },
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
          width: '900px', height: '900px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(250,82,60,0.28) 0%, rgba(250,82,60,0.10) 35%, transparent 60%)',
          animation: 'orbFloat1 16s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '-200px', left: '-160px',
          width: '950px', height: '950px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(90,209,181,0.26) 0%, rgba(90,209,181,0.08) 35%, transparent 60%)',
          animation: 'orbFloat2 20s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', top: '40%', left: '35%',
          width: '700px', height: '700px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,191,3,0.24) 0%, rgba(255,191,3,0.07) 38%, transparent 62%)',
          animation: 'orbFloat3 12s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', top: '10%', left: '20%',
          width: '560px', height: '560px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(250,82,60,0.20) 0%, rgba(250,82,60,0.05) 40%, transparent 62%)',
          animation: 'orbFloat2 23s ease-in-out infinite reverse',
        }} />
        <div style={{
          position: 'absolute', bottom: '20%', right: '10%',
          width: '480px', height: '480px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, rgba(139,92,246,0.05) 40%, transparent 62%)',
          animation: 'orbFloat1 19s ease-in-out infinite reverse',
        }} />
      </div>
      <div className="relative" style={{ zIndex: 1 }}>
      {/* Banner strip — top of page */}
      <div className="w-full overflow-hidden" style={{ height: '7px' }}>
        <img
          src="https://www.elchandriogroup.com/wp-content/uploads/hogueras-2026/logo-fondo-gradient.png"
          alt=""
          className="w-full h-full object-cover"
          draggable="false"
        />
      </div>
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
                  style={{ backgroundColor: '#e84530' }}
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
                    style={{ backgroundColor: '#e84530' }}
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
