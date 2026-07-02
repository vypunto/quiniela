import { useState } from 'react'
import { submitRequest } from '../utils/googleSheets'
import { TypeIcon } from './Icons'

const TIPOS = ['imagen', 'video', 'reel', 'carrusel', 'historia', 'texto']

const TIPO_ACTIVE = {
  imagen:   'bg-violet-600 text-white border-violet-600',
  video:    'bg-amber-500 text-white border-amber-500',
  reel:     'bg-pink-600 text-white border-pink-600',
  carrusel: 'bg-sky-600 text-white border-sky-600',
  historia: 'bg-emerald-600 text-white border-emerald-600',
  texto:    'bg-gray-700 text-white border-gray-700',
}

const CANALES = ['Instagram', 'TikTok', 'LinkedIn', 'Facebook', 'Web', 'Otros']

const CANAL_ICONS = {
  Instagram: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>
    </svg>
  ),
  TikTok: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.78a4.85 4.85 0 0 1-1.01-.09z"/>
    </svg>
  ),
  LinkedIn: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/>
      <circle cx="4" cy="4" r="2"/>
    </svg>
  ),
  Facebook: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  ),
  Web: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
}

const inputClass = "w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#732442]/15 focus:border-[#732442]/30 transition-all duration-150 bg-white placeholder:text-gray-300"
const labelClass = "block text-xs font-semibold text-gray-500 mb-2 tracking-wide"

const EMPTY_FORM = { proyecto: '', proyectoOtros: '', fecha: '', titulo: '', info: '', contenido: '', solicitante: '', tipo: 'imagen', canal: '' }

export default function RequestForm({ projects, scriptUrl, onSubmitted }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const proyectoFinal = form.proyecto === '__otros__' ? form.proyectoOtros.trim() : form.proyecto

  const handleSubmit = async e => {
    e.preventDefault()
    if (!proyectoFinal || !form.fecha || !form.titulo) return

    setSending(true)
    setError(null)

    const payload = {
      ...form,
      proyecto: proyectoFinal,
      fechaSolicitud: new Date().toLocaleDateString('es-ES'),
      estado: 'Pendiente',
    }
    delete payload.proyectoOtros

    try {
      const existing = JSON.parse(localStorage.getItem('pubcal_requests') || '[]')
      existing.unshift({ ...payload, id: Date.now().toString() })
      localStorage.setItem('pubcal_requests', JSON.stringify(existing))
    } catch { /* ignore */ }

    if (scriptUrl) {
      try {
        await submitRequest(scriptUrl, payload)
      } catch (err) {
        console.warn('Apps Script error:', err)
      }
    }

    setSending(false)
    setSent(true)
    onSubmitted && onSubmitted(payload)
    setTimeout(() => {
      setSent(false)
      setForm(EMPTY_FORM)
    }, 2500)
  }

  return (
    <div
      className="bg-white rounded-2xl p-6"
      style={{ border: '1px solid #E8EAED', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)' }}
    >
      <div className="mb-5">
        <h3 className="text-base font-bold text-gray-900">Nueva petición</h3>
        <p className="text-xs text-gray-400 mt-0.5 font-medium">El equipo de marketing la revisará pronto</p>
      </div>

      {sent ? (
        <div className="text-center py-10">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: 'rgba(115,36,66,0.08)' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M5 12l5 5L20 7" stroke="#732442" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="text-sm font-bold text-gray-800">¡Petición enviada!</p>
          <p className="text-xs text-gray-400 mt-1">El equipo la revisará pronto</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Proyecto */}
          <div>
            <label className={labelClass}>Proyecto <span className="text-[#732442]">*</span></label>
            <select
              value={form.proyecto}
              onChange={e => set('proyecto', e.target.value)}
              required
              className={inputClass}
              style={{ cursor: 'pointer', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'%3E%3Cpath d='M2 4l4 4 4-4' stroke='%239CA3AF' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
            >
              <option value="">Selecciona un proyecto…</option>
              {(projects || []).map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
              <option value="__otros__">OTROS</option>
            </select>
            {form.proyecto === '__otros__' && (
              <input
                type="text"
                value={form.proyectoOtros}
                onChange={e => set('proyectoOtros', e.target.value)}
                placeholder="Nombre del proyecto"
                required
                autoFocus
                className={`mt-2 ${inputClass}`}
              />
            )}
          </div>

          {/* Canal */}
          <div>
            <label className={labelClass}>Canal</label>
            <div className="flex flex-wrap gap-1.5">
              {CANALES.map(c => {
                const isActive = form.canal === c
                const icon = CANAL_ICONS[c]
                const isWeb = c === 'Web'
                const isOtros = c === 'Otros'
                const activeStyle = { backgroundColor: '#111827', color: '#fff', borderColor: '#111827' }
                const idleStyle   = { backgroundColor: '#fff', color: '#6B7280', borderColor: '#E5E7EB' }
                if (isOtros) {
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => set('canal', isActive ? '' : c)}
                      className="px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all duration-150"
                      style={isActive ? activeStyle : idleStyle}
                    >
                      Otros
                    </button>
                  )
                }
                if (isWeb) {
                  return (
                    <button
                      key={c}
                      type="button"
                      title="Web"
                      onClick={() => set('canal', isActive ? '' : c)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all duration-150"
                      style={isActive ? activeStyle : idleStyle}
                    >
                      {icon}
                      WEB
                    </button>
                  )
                }
                return (
                  <button
                    key={c}
                    type="button"
                    title={c}
                    onClick={() => set('canal', isActive ? '' : c)}
                    className="w-7 h-7 flex items-center justify-center rounded-full border transition-all duration-150"
                    style={isActive ? activeStyle : idleStyle}
                  >
                    {icon}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Fecha */}
          <div>
            <label className={labelClass}>Fecha deseada <span className="text-[#732442]">*</span></label>
            <input type="date" value={form.fecha} onChange={e => set('fecha', e.target.value)} required className={inputClass} />
          </div>

          {/* Título */}
          <div>
            <label className={labelClass}>Título del post <span className="text-[#732442]">*</span></label>
            <input
              type="text"
              value={form.titulo}
              onChange={e => set('titulo', e.target.value)}
              placeholder="¿De qué trata el post?"
              required
              className={inputClass}
            />
          </div>

          {/* Info */}
          <div>
            <label className={labelClass}>Información adicional</label>
            <textarea
              value={form.info}
              onChange={e => set('info', e.target.value)}
              placeholder="Contexto, mensajes clave, links, referencias..."
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Contenido */}
          <div>
            <label className={labelClass}>Link de contenido</label>
            <input
              type="url"
              value={form.contenido}
              onChange={e => set('contenido', e.target.value)}
              placeholder="Link de Drive, imagen o vídeo..."
              className={inputClass}
            />
          </div>

          {/* Tipo */}
          <div>
            <label className={labelClass}>Tipo de contenido</label>
            <div className="flex flex-wrap gap-1.5">
              {TIPOS.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => set('tipo', t)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium border transition-all duration-150 capitalize ${
                    form.tipo === t
                      ? (TIPO_ACTIVE[t] || 'bg-black text-white border-black')
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <TypeIcon tipo={t} size={12} />
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Solicitante */}
          <div>
            <label className={labelClass}>Tu nombre</label>
            <input
              type="text"
              value={form.solicitante}
              onChange={e => set('solicitante', e.target.value)}
              placeholder="¿Quién hace la petición?"
              className={inputClass}
            />
          </div>

          {error && (
            <p className="text-xs font-medium text-amber-700 bg-amber-50 rounded-xl px-4 py-2.5">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={sending || !proyectoFinal || !form.fecha || !form.titulo}
            className="w-full py-3 text-sm font-bold rounded-xl transition-all duration-150 disabled:opacity-35 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#732442', color: '#fff' }}
          >
            {sending ? 'Enviando...' : 'Enviar petición'}
          </button>
        </form>
      )}
    </div>
  )
}
