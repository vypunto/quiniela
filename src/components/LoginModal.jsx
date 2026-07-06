import { useState } from 'react'

export default function LoginModal({ onClose }) {
  const [password, setPassword] = useState('')
  const [shake, setShake] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = e => {
    e.preventDefault()
    if (password === 'GL12345!') {
      localStorage.setItem('pubcal_auth', '1')
      onClose(true)
    } else {
      setError('Contraseña incorrecta')
      setShake(true)
      setTimeout(() => setShake(false), 600)
    }
  }

  return (
    <div
      onClick={() => onClose(false)}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(12px)' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 'min(340px, calc(100vw - 40px))',
          backgroundColor: '#fff',
          borderRadius: '24px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.28), 0 0 0 1px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}
      >
        <div style={{ height: '4px', background: 'linear-gradient(90deg,#fa523c,#ffbf03,#5ad1b5)' }} />
        <div style={{ padding: '28px 28px 24px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#111', margin: '0 0 4px' }}>
              Acceso del equipo
            </h3>
            <p style={{ fontSize: '11px', color: '#9ca3af', margin: '0' }}>
              Contraseña para añadir publicaciones
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoFocus
              style={{
                display: 'block',
                width: '100%',
                boxSizing: 'border-box',
                padding: '12px 16px',
                borderRadius: '14px',
                fontSize: '14px',
                fontWeight: '500',
                outline: 'none',
                border: shake ? '2px solid #fa523c' : '2px solid #ebebeb',
                background: '#f8f8f8',
                marginBottom: '8px',
                animation: shake ? 'shake 0.4s ease' : 'none',
              }}
            />
            {error && (
              <p style={{ fontSize: '11px', color: '#fa523c', fontWeight: '600', textAlign: 'center', margin: '0 0 8px' }}>
                {error}
              </p>
            )}
            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <button
                type="button"
                onClick={() => onClose(false)}
                style={{
                  flex: '1', padding: '11px', borderRadius: '14px', fontSize: '13px',
                  fontWeight: '600', border: '2px solid #ebebeb', background: 'transparent',
                  color: '#9ca3af', cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                style={{
                  flex: '1', padding: '11px', borderRadius: '14px', fontSize: '13px',
                  fontWeight: '700', border: 'none', background: '#fa523c',
                  color: '#fff', cursor: 'pointer',
                }}
              >
                Entrar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
