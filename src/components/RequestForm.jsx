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

const CANALES = ['Instagram', 'TikTok', 'LinkedIn', 'Facebook', 'Web']

const CANAL_ICONS = {
  Instagram: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>
    </svg>
  ),
  TikTok: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.78a4.85 4.85 0 0 1-1.01-.09z"/>
    </svg>
  ),
  LinkedIn: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/>
      <circle cx="4" cy="4" r="2"/>
    </svg>
  ),
  Facebook: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  ),
  Web: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
}

const EMPTY_FORM = { proyecto: '', proyectoOtros: '', fecha: '', titulo: '', info: '', solicitante: '', tipo: 'imagen', canal: '' }

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

  const allProjects = [...(projects || []), '__otros__']

  return (
    <div className="bg-white rounded-2xl shadow border border-gray-200 p-5">
      <h3 className="text-sm font-bold text-gray-900 mb-4">Nueva petición de publicación</h3>

      {sent ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">✅</div>
          <p className="text-sm font-semibold text-gray-800">¡Petición enviada!</p>
          <p className="text-xs text-gray-400 mt-1">El equipo de marketing la revisará pronto</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">

          {/* Proyecto — tags */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Proyecto *</label>
            <div className="flex flex-wrap gap-1.5">
              {allProjects.map(p => {
                const isOtros = p === '__otros__'
                const label = isOtros ? 'Otros' : p
                const isActive = form.proyecto === p
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => set('proyecto', p)}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                      isActive
                        ? 'bg-[#732442] text-white border-[#732442]'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-[#732442]/40 hover:text-[#732442]'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
            {form.proyecto === '__otros__' && (
              <input
                type="text"
                value={form.proyectoOtros}
                onChange={e => set('proyectoOtros', e.target.value)}
                placeholder="Nombre del proyecto"
                required
                autoFocus
                className="mt-2 w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#732442]/20"
              />
            )}
          </div>

          {/* Canal */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Canal</label>
            <div className="flex flex-wrap gap-1.5">
              {CANALES.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => set('canal', form.canal === c ? '' : c)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                    form.canal === c
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {CANAL_ICONS[c]}
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Fecha deseada de publicación *</label>
            <input
              type="date"
              value={form.fecha}
              onChange={e => set('fecha', e.target.value)}
              required
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#732442]/20"
            />
          </div>

          {/* Título */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Título del post *</label>
            <input
              type="text"
              value={form.titulo}
              onChange={e => set('titulo', e.target.value)}
              placeholder="¿De qué trata el post?"
              required
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#732442]/20"
            />
          </div>

          {/* Info */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Información adicional</label>
            <textarea
              value={form.info}
              onChange={e => set('info', e.target.value)}
              placeholder="Contexto, mensajes clave, links, referencias..."
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#732442]/20 resize-none"
            />
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Tipo de contenido</label>
            <div className="flex flex-wrap gap-1.5">
              {TIPOS.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => set('tipo', t)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all capitalize ${
                    form.tipo === t
                      ? (TIPO_ACTIVE[t] || 'bg-black text-white border-black')
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <TypeIcon tipo={t} size={13} />
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Solicitante */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Tu nombre (opcional)</label>
            <input
              type="text"
              value={form.solicitante}
              onChange={e => set('solicitante', e.target.value)}
              placeholder="¿Quién hace la petición?"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#732442]/20"
            />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={sending || !proyectoFinal || !form.fecha || !form.titulo}
            className="w-full py-2.5 bg-black text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {sending ? 'Enviando...' : 'Enviar petición'}
          </button>
        </form>
      )}
    </div>
  )
}
