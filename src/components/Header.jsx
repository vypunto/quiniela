import { MONTHS_ES_UPPER, MONTHS_ES_SHORT } from '../utils/dateUtils'

export default function Header({
  year, month, activeTab, setActiveTab,
  viewMode, setViewMode,
  onPrev, onNext, onSettings, onSync, loading, hasConfig,
  isDemo, onDemo, onExitDemo,
  pendingCount,
  onAuth, isAuth,
}) {
  const tabBar = (extraClass = '') => (
    <div
      className={`flex items-center gap-0.5 p-1 rounded-xl flex-shrink-0 ${extraClass}`}
      style={{
        background: 'linear-gradient(to bottom, #e2e2e8, #d0d0d8)',
        boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.18), inset 0 1px 2px rgba(0,0,0,0.12), 0 1px 0 rgba(255,255,255,0.85)',
      }}
    >
      {['publicaciones', 'peticiones'].map(tab => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`relative px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-[10px] text-[9px] sm:text-[11px] font-bold tracking-wide transition-all duration-200 ${
            activeTab === tab ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
          }`}
          style={activeTab === tab ? {
            background: 'linear-gradient(to bottom, #ffffff, #eeeeF5)',
            boxShadow: '0 3px 6px rgba(0,0,0,0.20), 0 1px 3px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,1)',
            transform: 'translateY(-1px)',
          } : {}}
        >
          <span className="hidden sm:inline">{tab === 'publicaciones' ? 'PUBLICACIONES' : 'PETICIONES'}</span>
          <span className="sm:hidden">{tab === 'publicaciones' ? 'POSTS' : 'PETICIONES'}</span>
          {tab === 'peticiones' && pendingCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-[#e84530] text-white text-[8px] font-black rounded-full flex items-center justify-center">
              {pendingCount > 9 ? '9+' : pendingCount}
            </span>
          )}
        </button>
      ))}
    </div>
  )

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200/80" style={{ boxShadow: '0 1px 0 rgba(0,0,0,0.04)' }}>

      {/* ── Main row ─────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[64px] sm:h-[60px] flex items-center gap-2 sm:gap-4">

        {/* Logo */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <img
            src="https://elchandriogroup.com/calendapp/img/logo_calendapp.png"
            alt="CalendApp by El Chandrio Group"
            style={{ height: 'clamp(28px, 4vw, 40px)', width: 'auto', display: 'block' }}
          />
        </div>

        {/* Desktop tabs */}
        <div className="hidden sm:block ml-2">
          {tabBar()}
        </div>

        <div className="flex-1" />

        {/* Mobile tabs (right) */}
        <div className="sm:hidden">
          {tabBar()}
        </div>

        {/* Month nav — desktop */}
        {activeTab === 'publicaciones' && viewMode !== 'feed' && (
          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={onPrev}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-all duration-150"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <span className="font-bold text-gray-900 text-sm min-w-[150px] text-center tracking-tight">{MONTHS_ES_UPPER[month]} {year}</span>
            <button
              onClick={onNext}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-all duration-150"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        )}

        {/* Divider */}
        {activeTab === 'publicaciones' && (
          <div className="hidden sm:block w-px h-5 bg-gray-200" />
        )}

        {/* View toggle — desktop */}
        {activeTab === 'publicaciones' && (
          <div
            className="hidden sm:flex items-center gap-0.5 p-1 rounded-xl"
            style={{
              background: 'linear-gradient(to bottom, #e2e2e8, #d0d0d8)',
              boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.18), inset 0 1px 2px rgba(0,0,0,0.12), 0 1px 0 rgba(255,255,255,0.85)',
            }}
          >
            {[['grid','Mes'],['list','Lista'],['feed','Visual Feed']].map(([mode, label]) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-2.5 py-1.5 rounded-[9px] text-xs font-semibold transition-all duration-200 ${
                  viewMode === mode ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
                }`}
                style={viewMode === mode ? {
                  background: 'linear-gradient(to bottom, #ffffff, #eeeeF5)',
                  boxShadow: '0 3px 6px rgba(0,0,0,0.20), 0 1px 3px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,1)',
                  transform: 'translateY(-1px)',
                } : {}}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Demo toggle — desktop */}
        <div className="hidden sm:block">
          {isDemo ? (
            <button
              onClick={onExitDemo}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150"
              style={{ border: '1px solid rgba(115,36,66,0.3)', color: '#e84530', backgroundColor: 'rgba(115,36,66,0.06)' }}
            >
              Salir del demo
            </button>
          ) : (
            <button
              onClick={onDemo}
              className="px-3 py-1.5 rounded-xl border border-gray-200 text-gray-400 text-xs font-medium hover:bg-gray-50 hover:text-gray-600 transition-all duration-150"
            >
              Ver demo
            </button>
          )}
        </div>

        {/* Sync — desktop */}
        {hasConfig && (
          <button
            onClick={onSync}
            disabled={loading}
            title="Sincronizar"
            className="hidden sm:flex w-8 h-8 rounded-xl border border-gray-200 items-center justify-center hover:bg-gray-50 transition-all duration-150 text-gray-400 hover:text-gray-600 disabled:opacity-40"
          >
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className={loading ? 'animate-spin' : ''}>
              <path d="M12 7A5 5 0 1 1 7 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M10 2h2v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}

        {/* Auth button */}
        <button
          onClick={onAuth}
          title={isAuth ? 'Modo equipo activo' : 'Acceso equipo'}
          className="flex w-8 h-8 rounded-xl items-center justify-center transition-all duration-150 flex-shrink-0"
          style={isAuth
            ? { backgroundColor: '#22c55e', border: 'none', boxShadow: '0 2px 8px rgba(34,197,94,0.35)' }
            : { border: '1.5px solid #e8e8ec', backgroundColor: 'transparent' }
          }
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={isAuth ? '#fff' : '#9ca3af'}>
            <path d="M18 2c2.206 0 4 1.794 4 4v12c0 2.206-1.794 4-4 4h-12c-2.206 0-4-1.794-4-4v-12c0-2.206 1.794-4 4-4zm0-2h-12c-3.314 0-6 2.686-6 6v12c0 3.314 2.686 6 6 6h12c3.314 0 6-2.686 6-6v-12c0-3.314-2.686-6-6-6z"/>
            <path d="M12 15c-2.757 0-5-2.243-5-5s2.243-5 5-5 5 2.243 5 5-2.243 5-5 5zm0-8c-1.654 0-3 1.346-3 3s1.346 3 3 3 3-1.346 3-3-1.346-3-3-3z"/>
            <path d="M18.92 22h-2.02c-.46-2.28-2.48-4-4.9-4s-4.44 1.72-4.9 4h-2.02c.48-3.39 3.4-6 6.92-6s6.44 2.61 6.92 6z"/>
          </svg>
        </button>
      </div>

      {/* ── Mobile second row — peticiones ───────────────────────── */}
      {activeTab === 'peticiones' && (
        <div className="sm:hidden flex items-center justify-end px-4 pb-3 gap-1.5">
          {isDemo ? (
            <button
              onClick={onExitDemo}
              className="px-2.5 py-1.5 rounded-xl text-[10px] font-semibold"
              style={{ border: '1px solid rgba(115,36,66,0.3)', color: '#e84530', backgroundColor: 'rgba(115,36,66,0.06)' }}
            >
              Salir
            </button>
          ) : (
            <button
              onClick={onDemo}
              className="px-2.5 py-1.5 rounded-xl border border-gray-200 text-gray-400 text-[10px] font-medium"
            >
              Demo
            </button>
          )}
          {hasConfig && (
            <button
              onClick={onSync}
              disabled={loading}
              className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 disabled:opacity-40"
            >
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className={loading ? 'animate-spin' : ''}>
                <path d="M12 7A5 5 0 1 1 7 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M10 2h2v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>
      )}

      {/* ── Mobile second row — publicaciones ─────────────────────── */}
      {activeTab === 'publicaciones' && (
      <div className="sm:hidden flex items-center justify-between px-4 pb-3 gap-2">
        {viewMode !== 'feed' && (
            <div className="flex items-center gap-1">
              <button
                onClick={onPrev}
                className="w-8 h-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 active:bg-gray-100 shadow-sm transition-all"
              >
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <span className="font-bold text-gray-900 text-sm px-2 min-w-[68px] text-center">
                <span className="sm:hidden">{MONTHS_ES_SHORT[month]}</span>
                <span className="hidden sm:inline">{MONTHS_ES_UPPER[month]}</span>
                {' '}{year}
              </span>
              <button
                onClick={onNext}
                className="w-8 h-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 active:bg-gray-100 shadow-sm transition-all"
              >
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          )}
        {viewMode === 'feed' && <div className="flex-1" />}

          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5 p-1 bg-gray-100/70 rounded-xl">
              {[['grid','Mes'],['list','Lista'],['feed','Feed']].map(([mode, label]) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-2 py-1 rounded-[8px] text-xs font-semibold transition-all duration-150 ${
                    viewMode === mode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {isDemo ? (
              <button
                onClick={onExitDemo}
                className="px-2.5 py-1.5 rounded-xl text-[10px] font-semibold"
                style={{ border: '1px solid rgba(115,36,66,0.3)', color: '#e84530', backgroundColor: 'rgba(115,36,66,0.06)' }}
              >
                Salir
              </button>
            ) : (
              <button
                onClick={onDemo}
                className="px-2.5 py-1.5 rounded-xl border border-gray-200 text-gray-400 text-[10px] font-medium"
              >
                Demo
              </button>
            )}

            {hasConfig && (
              <button
                onClick={onSync}
                disabled={loading}
                className="w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 disabled:opacity-40"
              >
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
