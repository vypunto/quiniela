import { MONTHS_ES } from '../utils/dateUtils'
import { CalendappLogo } from './Icons'

export default function Header({
  year, month, activeTab, setActiveTab,
  viewMode, setViewMode,
  onPrev, onNext, onSettings, onSync, loading, hasConfig,
  isDemo, onDemo, onExitDemo
}) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-20">

      {/* ── Main row ─────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-[58px] flex items-center gap-2 sm:gap-3">

        {/* Logo */}
        <div className="flex items-center gap-2 sm:gap-2.5 mr-1 sm:mr-3 flex-shrink-0">
          <CalendappLogo height={44} />
          <div className="leading-none">
            <div className="text-[11px] sm:text-sm font-black text-gray-900 tracking-tight">CALENDAPP</div>
            <div className="text-[8px] sm:text-[10px] text-gray-400 font-medium mt-0.5">by El Chandrio Group</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center bg-gray-100 rounded-lg p-0.5 flex-shrink-0">
          {['publicaciones', 'peticiones'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-2 sm:px-3 py-1.5 rounded-md text-[10px] sm:text-xs font-black transition-all tracking-wide ${
                activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'publicaciones' ? 'PUBLICACIONES' : 'PETICIONES'}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Month nav — desktop only */}
        {activeTab === 'publicaciones' && (
          <div className="hidden sm:flex items-center gap-1.5">
            <button onClick={onPrev} className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-600">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <span className="font-semibold text-gray-900 text-sm min-w-[120px] text-center">{MONTHS_ES[month]} {year}</span>
            <button onClick={onNext} className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-600">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        )}

        {/* View toggle — desktop only */}
        {activeTab === 'publicaciones' && (
          <div className="hidden sm:flex items-center bg-gray-100 rounded-lg p-0.5">
            {[['grid','Calendario'],['list','Lista']].map(([mode, label]) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === mode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
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
              <button onClick={onExitDemo} className="px-2.5 py-1 rounded-lg border border-amber-300 bg-amber-50 text-amber-700 text-xs font-semibold hover:bg-amber-100 transition-colors">
                Salir del demo
              </button>
            ) : (
              <button onClick={onDemo} className="px-2.5 py-1 rounded-lg border border-gray-200 text-gray-500 text-xs font-medium hover:bg-gray-50 transition-colors">
                Ver demo
              </button>
            )}
          </div>
        )}

        {/* Sync — desktop only */}
        {hasConfig && activeTab === 'publicaciones' && (
          <button onClick={onSync} disabled={loading} title="Sincronizar" className="hidden sm:flex w-9 h-9 rounded-lg border border-gray-200 items-center justify-center hover:bg-gray-50 transition-colors text-gray-600 disabled:opacity-50">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={loading ? 'animate-spin' : ''}>
              <path d="M12 7A5 5 0 1 1 7 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M10 2h2v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}

        {/* Settings */}
        <button onClick={onSettings} title="Configuración" className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-600 flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.6 2.6l1.1 1.1M10.3 10.3l1.1 1.1M2.6 11.4l1.1-1.1M10.3 3.7l1.1-1.1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* ── Mobile second row (publicaciones only) ───────────────── */}
      {activeTab === 'publicaciones' && (
        <div className="sm:hidden flex items-center justify-between px-3 pb-2 gap-2">
          {/* Month nav */}
          <div className="flex items-center gap-1">
            <button onClick={onPrev} className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 active:bg-gray-100">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <span className="font-semibold text-gray-900 text-sm px-2">{MONTHS_ES[month]} {year}</span>
            <button onClick={onNext} className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 active:bg-gray-100">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {/* View toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
              {[['grid','Cal'],['list','Lista']].map(([mode, label]) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    viewMode === mode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Demo toggle mobile */}
            {isDemo ? (
              <button onClick={onExitDemo} className="px-2 py-1 rounded-lg border border-amber-300 bg-amber-50 text-amber-700 text-[10px] font-semibold active:bg-amber-100">
                Salir demo
              </button>
            ) : (
              <button onClick={onDemo} className="px-2 py-1 rounded-lg border border-gray-200 text-gray-500 text-[10px] font-medium active:bg-gray-100">
                Demo
              </button>
            )}

            {/* Sync */}
            {hasConfig && (
              <button onClick={onSync} disabled={loading} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 disabled:opacity-50 active:bg-gray-100">
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
