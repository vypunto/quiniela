import { useState, useEffect } from 'react'
import { toast } from '../utils/toast'

const ICONS = {
  success: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="6.5" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M4 7l2.5 2.5L10 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  error: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="6.5" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M9 5L5 9M5 5l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  info: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="6.5" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M7 6v4M7 4.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
}

const STYLES = {
  success: { color: '#15803D', bg: '#F0FDF4', border: '#BBF7D0' },
  error:   { color: '#BE123C', bg: '#FFF1F2', border: '#FECDD3' },
  info:    { color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE' },
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    return toast.subscribe(t => {
      setToasts(prev => [...prev, { ...t, visible: true }])
      setTimeout(() => {
        setToasts(prev => prev.map(p => p.id === t.id ? { ...p, visible: false } : p))
        setTimeout(() => setToasts(prev => prev.filter(p => p.id !== t.id)), 300)
      }, t.duration)
    })
  }, [])

  if (toasts.length === 0) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        pointerEvents: 'none',
      }}
    >
      {toasts.map(t => {
        const s = STYLES[t.type]
        return (
          <div
            key={t.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 16px',
              borderRadius: '14px',
              border: `1px solid ${s.border}`,
              backgroundColor: s.bg,
              color: s.color,
              fontSize: '13px',
              fontWeight: 600,
              boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
              maxWidth: '320px',
              opacity: t.visible ? 1 : 0,
              transform: t.visible ? 'translateY(0)' : 'translateY(8px)',
              transition: 'opacity 250ms ease, transform 250ms ease',
              pointerEvents: 'auto',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ flexShrink: 0 }}>{ICONS[t.type]}</span>
            <span>{t.message}</span>
          </div>
        )
      })}
    </div>
  )
}
