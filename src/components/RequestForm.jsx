import { useState } from 'react'
import { submitRequest } from '../utils/googleSheets'
import { TypeIcon } from './Icons'

const TIPOS = ['imagen', 'video', 'reel', 'carrusel', 'historia', 'texto']

export default function RequestForm({ projects, scriptUrl, onSubmitted }) {
  const [form, setForm] = useState({ proyecto: '', fecha: '', titulo: '', info: '', solicitante: '', tipo: 'imagen' })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.proyecto || !form.fecha || !form.titulo) return

    setSending(true)
    setError(null)

    const payload = { ...form, fechaSolicitud: new Date().toLocaleDateString('es-ES'), estado: 'Pendiente' }

    // Always save locally
    try {
      const existing = JSON.parse(localStorage.getItem('pubcal_requests') || '[]')
      existing.unshift({ ...payload, id: Date.now().toString() })
      localStorage.setItem('pubcal_requests', JSON.stringify(existing))
    } catch { /* ignore */ }

    // Also POST to Apps Script if configured
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
      setForm({ proyecto: '', fecha: '', titulo: '', info: '', solicitante: '', tipo: 'imagen' })
    }, 2500)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <h3 className="text-sm font-bold text-gray-900 mb-4">Nueva petición de publicación</h3>

      {sent ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">✅</div>
          <p className="text-sm font-semibold text-gray-800">¡Petición enviada!</p>
          <p className="text-xs text-gray-400 mt-1">El equipo de marketing la revisará pronto</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Proyecto */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Proyecto *</label>
            {projects.length > 0 ? (
              <select
                value={form.proyecto}
                onChange={e => set('proyecto', e.target.value)}
                required
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 bg-white"
              >
                <option value="">Selecciona un proyecto</option>
                {projects.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            ) : (
              <input
                type="text"
                value={form.proyecto}
                onChange={e => set('proyecto', e.target.value)}
                placeholder="Nombre del proyecto"
                required
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
              />
            )}
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Fecha deseada de publicación *</label>
            <input
              type="date"
              value={form.fecha}
              onChange={e => set('fecha', e.target.value)}
              required
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
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
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
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
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 resize-none"
            />
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Tipo de contenido</label>
            <div className="flex flex-wrap gap-2">
              {TIPOS.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => set('tipo', t)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all capitalize ${
                    form.tipo === t
                      ? 'bg-black text-white border-black'
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
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
            />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={sending || !form.proyecto || !form.fecha || !form.titulo}
            className="w-full py-2.5 bg-black text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {sending ? 'Enviando...' : 'Enviar petición'}
          </button>

          {!scriptUrl && (
            <p className="text-xs text-gray-400 text-center">
              Las peticiones se guardan en este dispositivo. Configura un Apps Script para compartirlas con el equipo.
            </p>
          )}
        </form>
      )}
    </div>
  )
}
