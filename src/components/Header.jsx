import { MONTHS_ES_UPPER, MONTHS_ES_SHORT } from '../utils/dateUtils'
import { CalendappLogo } from './Icons'

export default function Header({
  year, month, activeTab, setActiveTab,
  viewMode, setViewMode,
  onPrev, onNext, onSettings, onSync, loading, hasConfig,
  isDemo, onDemo, onExitDemo,
  pendingCount,
}) {
  const tabBar = (extraClass = '') => (
    <div className={`flex items-center bg-gray-100 rounded-xl p-0.5 flex-shrink-0 ${extraClass}`}>
      {['publicaciones', 'peticiones'].map(tab => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`relative px-3 sm:px-3.5 py-2 sm:py-1.5 rounded-[10px] text-xs sm:text-xs font-black transition-all tracking-wide ${
            activeTab === tab
              ? 'bg-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
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
  )

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-200">

      {/* ── Main row ─────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-[62px] sm:h-[58px] flex items-center gap-2 sm:gap-3">

        {/* Logo */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
          <CalendappLogo height={52} />
          <div className="leading-none">
            <div className="text-sm font-black tracking-tight" style={{ color: '#732442' }}>CALENDAPP</div>
            <div className="text-[10px] font-medium mt-0.5 text-gray-400">by El Chandrio Group</div>
          </div>
        </div>

        {/* Desktop tabs (after logo) */}
        <div className="hidden sm:block ml-1">
          {tabBar()}
        </div>

        {/* Spacer — pushes mobile tabs right, separates desktop controls */}
        <div className="flex-1" />

        {/* Mobile tabs (right-aligned) */}
        <div className="sm:hidden">
          {tabBar()}
        </div>

        {/* Month nav — desktop only */}
        {activeTab === 'publicaciones' && viewMode !== 'week' && (
          <div className="hidden sm:flex items-center gap-1.5">
            <button onClick={onPrev} className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-600">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <span className="font-black tracking-tight text-gray-900 text-sm min-w-[140px] text-center">{MONTHS_ES_UPPER[month]} {year}</span>
            <button onClick={onNext} className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-600">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        )}

        {/* View toggle — desktop only */}
        {activeTab === 'publicaciones' && (
          <div className="hidden sm:flex items-center bg-gray-100 rounded-lg p-0.5">
            {[['grid','Mes'],['week','Semana'],['list','Lista']].map(([mode, label]) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  viewMode === mode ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
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
              <button onClick={onExitDemo} className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors" style={{ border: '1px solid #732442', color: '#732442', backgroundColor: '#fdf0f3' }}>
                Salir del demo
              </button>
            ) : (
              <button onClick={onDemo} className="px-3 py-1.5 rounded-xl border border-gray-200 text-gray-400 text-xs font-medium hover:bg-gray-50 transition-colors">
                Ver demo
              </button>
            )}
          </div>
        )}

        {/* Sync — desktop only */}
        {hasConfig && activeTab === 'publicaciones' && (
          <button onClick={onSync} disabled={loading} title="Sincronizar" className="hidden sm:flex w-8 h-8 rounded-xl border border-gray-200 items-center justify-center hover:bg-gray-50 transition-colors text-gray-500 disabled:opacity-50">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className={loading ? 'animate-spin' : ''}>
              <path d="M12 7A5 5 0 1 1 7 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M10 2h2v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>

      {/* ── Mobile second row (publicaciones only) ───────────────── */}
      {activeTab === 'publicaciones' && (
        <div className="sm:hidden flex items-center justify-between px-3 pb-2.5 gap-2">
          {viewMode !== 'week' && (
            <div className="flex items-center gap-1">
              <button onClick={onPrev} className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-700 active:bg-gray-100 shadow-sm">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <span className="font-black tracking-tight text-gray-900 text-sm px-2 min-w-[72px] text-center">
                <span className="sm:hidden">{MONTHS_ES_SHORT[month]}</span>
                <span className="hidden sm:inline">{MONTHS_ES_UPPER[month]}</span>
                {' '}{year}
              </span>
              <button onClick={onNext} className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-700 active:bg-gray-100 shadow-sm">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          )}
          {viewMode === 'week' && <div className="flex-1" />}

          <div className="flex items-center gap-1.5">
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
              {[['grid','Mes'],['week','Sem'],['list','Lista']].map(([mode, label]) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-2 py-1 rounded-md text-xs font-semibold transition-all ${
                    viewMode === mode ? 'bg-white shadow-sm' : 'text-gray-500'
                  }`}
                  style={viewMode === mode ? { color: '#732442' } : {}}
                >
                  {label}
                </button>
              ))}
            </div>

            {isDemo ? (
              <button onClick={onExitDemo} className="px-2 py-1.5 rounded-xl text-[10px] font-semibold" style={{ border: '1px solid #732442', color: '#732442', backgroundColor: '#fdf0f3' }}>
                Salir
              </button>
            ) : (
              <button onClick={onDemo} className="px-2 py-1.5 rounded-xl border border-gray-200 text-gray-400 text-[10px] font-medium">
                Demo
              </button>
            )}

            {hasConfig && (
              <button onClick={onSync} disabled={loading} className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-50">
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
