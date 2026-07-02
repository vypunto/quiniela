import { MONTHS_ES } from '../utils/dateUtils'
import { CalendappLogo } from './Icons'

export default function Header({
  year, month, activeTab, setActiveTab,
  viewMode, setViewMode,
  onPrev, onNext, onSettings, onSync, loading, hasConfig,
  isDemo, onDemo, onExitDemo,
  pendingCount, darkMode, onToggleDark,
}) {
  return (
    <header className="sticky top-0 z-20 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">

      {/* ── Main row ─────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-[58px] flex items-center gap-2 sm:gap-3">

        {/* Logo */}
        <div className="flex items-center gap-2 sm:gap-2.5 mr-1 sm:mr-3 flex-shrink-0">
          <CalendappLogo height={44} />
          <div className="leading-none hidden sm:block">
            <div className="text-sm font-black tracking-tight" style={{ color: '#732442' }}>CALENDAPP</div>
            <div className="text-[10px] font-medium mt-0.5 text-gray-400">by El Chandrio Group</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5 flex-shrink-0">
          {['publicaciones', 'peticiones'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-2 sm:px-3 py-1.5 rounded-md text-[10px] sm:text-xs font-black transition-all tracking-wide ${
                activeTab === tab
                  ? 'bg-white dark:bg-gray-700 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
              style={activeTab === tab ? { color: '#732442' } : {}}
            >
              {tab === 'publicaciones' ? 'PUBLICACIONES' : 'PETICIONES'}
              {tab === 'peticiones' && pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">
                  {pendingCount > 9 ? '9+' : pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Month nav — desktop only */}
        {activeTab === 'publicaciones' && viewMode !== 'week' && (
          <div className="hidden sm:flex items-center gap-1.5">
            <button onClick={onPrev} className="w-7 h-7 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <span className="font-black tracking-tight text-gray-900 dark:text-white text-sm min-w-[130px] text-center">{MONTHS_ES[month]} {year}</span>
            <button onClick={onNext} className="w-7 h-7 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        )}

        {/* View toggle — desktop only */}
        {activeTab === 'publicaciones' && (
          <div className="hidden sm:flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
            {[['grid','Mes'],['week','Semana'],['list','Lista']].map(([mode, label]) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  viewMode === mode
                    ? 'bg-white dark:bg-gray-700 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
                style={viewMode === mode ? { color: '#732442' } : {}}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Demo toggle — desktop only */}
        {activeTab === 'publicaciones' && (
          <div className="hidden sm:block">
            {isDemo ? (
              <button onClick={onExitDemo} className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors" style={{ border: '1px solid #732442', color: '#732442', backgroundColor: '#fdf0f3' }}>
                Salir del demo
              </button>
            ) : (
              <button onClick={onDemo} className="px-2.5 py-1 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Ver demo
              </button>
            )}
          </div>
        )}

        {/* Sync — desktop only */}
        {hasConfig && activeTab === 'publicaciones' && (
          <button onClick={onSync} disabled={loading} title="Sincronizar" className="hidden sm:flex w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-700 items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400 disabled:opacity-50">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className={loading ? 'animate-spin' : ''}>
              <path d="M12 7A5 5 0 1 1 7 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M10 2h2v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}

        {/* Dark mode toggle */}
        <button onClick={onToggleDark} title={darkMode ? 'Modo claro' : 'Modo oscuro'} className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400 flex-shrink-0">
          {darkMode ? (
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="3" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.6 2.6l1.1 1.1M10.3 10.3l1.1 1.1M2.6 11.4l1.1-1.1M10.3 3.7l1.1-1.1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path d="M12 8.5A5.5 5.5 0 0 1 5.5 2a5.5 5.5 0 1 0 6.5 6.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      </div>

      {/* ── Mobile second row (publicaciones only) ───────────────── */}
      {activeTab === 'publicaciones' && (
        <div className="sm:hidden flex items-center justify-between px-3 pb-2 gap-2">
          {/* Month nav */}
          {viewMode !== 'week' && (
            <div className="flex items-center gap-1">
              <button onClick={onPrev} className="w-7 h-7 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 active:bg-gray-100">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <span className="font-black tracking-tight text-gray-900 dark:text-white text-sm px-2">{MONTHS_ES[month]} {year}</span>
              <button onClick={onNext} className="w-7 h-7 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 active:bg-gray-100">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          )}
          {viewMode === 'week' && <div className="flex-1" />}

          <div className="flex items-center gap-1.5">
            {/* View toggle */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
              {[['grid','Mes'],['week','Sem'],['list','Lista']].map(([mode, label]) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-2 py-1 rounded-md text-xs font-semibold transition-all ${
                    viewMode === mode ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500 dark:text-gray-400'
                  }`}
                  style={viewMode === mode ? { color: '#732442' } : {}}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Demo toggle mobile */}
            {isDemo ? (
              <button onClick={onExitDemo} className="px-2 py-1 rounded-lg text-[10px] font-semibold" style={{ border: '1px solid #732442', color: '#732442', backgroundColor: '#fdf0f3' }}>
                Salir
              </button>
            ) : (
              <button onClick={onDemo} className="px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-400 text-[10px] font-medium">
                Demo
              </button>
            )}

            {/* Sync */}
            {hasConfig && (
              <button onClick={onSync} disabled={loading} className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 disabled:opacity-50">
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className={loading ? 'animate-spin' : ''}>
                  <path d="M12 7A5 5 0 1 1 7 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M10 2h2v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
