import { MONTHS_ES } from '../utils/dateUtils'
import { CalendappLogo } from './Icons'

export default function Header({
  year, month, activeTab, setActiveTab,
  viewMode, setViewMode,
  onPrev, onNext, onSettings, onSync, loading, hasConfig,
}) {
  return (
    <header className="sticky top-0 z-20" style={{ background: 'linear-gradient(135deg, #5a1a30 0%, #732442 100%)' }}>

      {/* ── Main row ─────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-[58px] flex items-center gap-2 sm:gap-3">

        {/* Logo */}
        <div className="flex items-center gap-2 sm:gap-2.5 mr-1 sm:mr-3 flex-shrink-0">
          <CalendappLogo height={44} />
          <div className="leading-none">
            <div className="text-[11px] sm:text-sm font-black text-white tracking-tight">CALENDAPP</div>
            <div className="text-[8px] sm:text-[10px] font-medium mt-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>by El Chandrio Group</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center rounded-lg p-0.5 flex-shrink-0" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
          {['publicaciones', 'peticiones'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-2 sm:px-3 py-1.5 rounded-md text-[10px] sm:text-xs font-black transition-all tracking-wide ${
                activeTab === tab ? 'bg-white text-[#732442] shadow-sm' : 'text-white/70 hover:text-white'
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
            <button onClick={onPrev} className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors text-white/80 hover:text-white hover:bg-white/10" style={{ border: '1px solid rgba(255,255,255,0.2)' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <span className="font-semibold text-white text-sm min-w-[120px] text-center">{MONTHS_ES[month]} {year}</span>
            <button onClick={onNext} className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors text-white/80 hover:text-white hover:bg-white/10" style={{ border: '1px solid rgba(255,255,255,0.2)' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        )}

        {/* View toggle — desktop only */}
        {activeTab === 'publicaciones' && (
          <div className="hidden sm:flex items-center rounded-lg p-0.5" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
            {[['grid','Calendario'],['list','Lista']].map(([mode, label]) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  viewMode === mode ? 'bg-white text-[#732442] shadow-sm' : 'text-white/70 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Sync — desktop only */}
        {hasConfig && activeTab === 'publicaciones' && (
          <button onClick={onSync} disabled={loading} title="Sincronizar" className="hidden sm:flex w-9 h-9 rounded-lg items-center justify-center transition-colors text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-40" style={{ border: '1px solid rgba(255,255,255,0.2)' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={loading ? 'animate-spin' : ''}>
              <path d="M12 7A5 5 0 1 1 7 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M10 2h2v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}

        {/* Settings */}
        <button onClick={onSettings} title="Configuración" className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors text-white/70 hover:text-white hover:bg-white/10 flex-shrink-0" style={{ border: '1px solid rgba(255,255,255,0.2)' }}>
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
            <button onClick={onPrev} className="w-7 h-7 rounded-lg flex items-center justify-center text-white/80 active:bg-white/10" style={{ border: '1px solid rgba(255,255,255,0.2)' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <span className="font-semibold text-white text-sm px-2">{MONTHS_ES[month]} {year}</span>
            <button onClick={onNext} className="w-7 h-7 rounded-lg flex items-center justify-center text-white/80 active:bg-white/10" style={{ border: '1px solid rgba(255,255,255,0.2)' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {/* View toggle */}
            <div className="flex items-center rounded-lg p-0.5" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
              {[['grid','Cal'],['list','Lista']].map(([mode, label]) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    viewMode === mode ? 'bg-white text-[#732442] shadow-sm' : 'text-white/70'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Sync */}
            {hasConfig && (
              <button onClick={onSync} disabled={loading} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/70 disabled:opacity-40 active:bg-white/10" style={{ border: '1px solid rgba(255,255,255,0.2)' }}>
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
