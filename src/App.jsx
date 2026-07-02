import { useState, useEffect, useCallback } from 'react'
import Header from './components/Header'
import CalendarGrid from './components/CalendarGrid'
import CalendarList from './components/CalendarList'
import PublicationModal from './components/PublicationModal'
import SettingsModal from './components/SettingsModal'
import ProjectLegend from './components/ProjectLegend'
import { fetchSheetData } from './utils/googleSheets'

export default function App() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [viewMode, setViewMode] = useState('grid')
  const [publications, setPublications] = useState([])
  const [selectedPub, setSelectedPub] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [config, setConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('pubcal_config')
      return saved ? JSON.parse(saved) : { spreadsheetId: '' }
    } catch {
      return { spreadsheetId: '' }
    }
  })

  const syncData = useCallback(async () => {
    if (!config.spreadsheetId) return
    setLoading(true)
    setError(null)
    try {
      const data = await fetchSheetData(config.spreadsheetId)
      setPublications(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [config.spreadsheetId])

  useEffect(() => {
    syncData()
  }, [syncData])

  const saveConfig = (newConfig) => {
    setConfig(newConfig)
    try {
      localStorage.setItem('pubcal_config', JSON.stringify(newConfig))
    } catch { /* ignore */ }
    setShowSettings(false)
  }

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  const goToToday = () => {
    const n = new Date()
    setYear(n.getFullYear())
    setMonth(n.getMonth())
  }

  const hasConfig = !!config.spreadsheetId

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        year={year}
        month={month}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onPrev={prevMonth}
        onNext={nextMonth}
        onToday={goToToday}
        onSettings={() => setShowSettings(true)}
        onSync={syncData}
        loading={loading}
        hasConfig={hasConfig}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm flex items-start gap-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0 mt-0.5">
              <circle cx="8" cy="8" r="7" stroke="#EF4444" strokeWidth="1.3"/>
              <path d="M8 5v3M8 10.5v.5" stroke="#EF4444" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <div>
              <div className="font-semibold text-xs mb-0.5">Error al sincronizar</div>
              <div className="text-xs text-red-600">{error}</div>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="ml-auto text-xs text-red-600 underline hover:no-underline flex-shrink-0"
            >
              Configurar
            </button>
          </div>
        )}

        {/* Empty state — no config */}
        {!hasConfig && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-4">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect x="2" y="2" width="11" height="11" rx="2" fill="white"/>
                <rect x="15" y="2" width="11" height="11" rx="2" fill="white"/>
                <rect x="2" y="15" width="11" height="11" rx="2" fill="white"/>
                <rect x="15" y="15" width="11" height="11" rx="2" fill="white" opacity="0.3"/>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Calendario de Publicaciones</h2>
            <p className="text-sm text-gray-400 mb-6 text-center max-w-xs">
              Conecta tu Google Sheet para ver todas tus publicaciones organizadas por fecha y proyecto
            </p>
            <button
              onClick={() => setShowSettings(true)}
              className="px-5 py-2.5 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors"
            >
              Conectar Google Sheets
            </button>
          </div>
        )}

        {/* Calendar content */}
        {hasConfig && (
          <>
            {/* Project legend */}
            <ProjectLegend publications={publications} />

            {/* Loading indicator */}
            {loading && publications.length === 0 && (
              <div className="text-center py-16 text-gray-400 text-sm">
                <div className="animate-spin w-6 h-6 border-2 border-gray-200 border-t-gray-600 rounded-full mx-auto mb-3" />
                Cargando publicaciones...
              </div>
            )}

            {/* Views */}
            {!loading || publications.length > 0 ? (
              viewMode === 'grid' ? (
                <CalendarGrid
                  year={year}
                  month={month}
                  publications={publications}
                  onSelect={setSelectedPub}
                />
              ) : (
                <CalendarList
                  year={year}
                  month={month}
                  publications={publications}
                  onSelect={setSelectedPub}
                />
              )
            ) : null}
          </>
        )}
      </main>

      {/* Modals */}
      {selectedPub && (
        <PublicationModal
          publication={selectedPub}
          onClose={() => setSelectedPub(null)}
        />
      )}
      {showSettings && (
        <SettingsModal
          config={config}
          onSave={saveConfig}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}
