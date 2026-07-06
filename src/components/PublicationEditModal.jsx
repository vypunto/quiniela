import { useState, useEffect } from 'react'
import { getProjectColor } from '../utils/colors'
import { PROJECTS } from '../config'

const TYPE_OPTIONS   = ['imagen', 'video', 'reel', 'carrusel', 'historia', 'texto']
const CANAL_OPTIONS  = ['Instagram', 'TikTok', 'LinkedIn', 'Facebook', 'Web', 'Otros']
const ESTADO_OPTIONS = ['Programado', 'Publicado', 'Borrador', 'Cancelado', 'En edición']

const inputClass = "w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e84530]/15 focus:border-[#e84530]/30 transition-all duration-150 bg-white"
const labelClass = "block text-xs font-semibold text-gray-400 uppercase tracking-[0.1em] mb-2"

export default function PublicationEditModal({ publication: pub, projects = PROJECTS, onSave, onClose }) {
  const toDateStr = d => d instanceof Date && !isNaN(d) ? d.toISOString().slice(0, 10) : ''

  const [form, setForm] = useState({
    proyecto: pub.proyecto || '',
    fecha: toDateStr(pub.fecha),
    titulo: pub.titulo || '',
    copy: pub.copy || '',
    media: pub.media || '',
    tipo: pub.tipo || 'imagen',
    canal: pub.canal || '',
    estado: pub.estado || '',
    url_post: pub.url_post || '',
    promocionado: (pub.promocionado || 'No').toLowerCase().startsWith('s'),
    presupuesto: pub.presupuesto || '',
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const color = getProjectColor(form.proyecto)
  const allProjects = [...new Set([...projects, pub.proyecto].filter(Boolean))].sort()

  useEffect(() => {
    const handle = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [onClose])

  const handleSave = () => {
    onSave({
      ...pub,
      ...form,
      fecha: form.fecha ? new Date(form.fecha + 'T12:00:00') : pub.fecha,
      promocionado: form.promocionado ? 'Sí' : 'No',
    })
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[6px]" onClick={onClose} />
      <div
        className="relative bg-white rounded-[24px] max-w-md w-full overflow-hidden max-h-[92vh] flex flex-col"
        style={{ animation: 'modalIn 200ms cubic-bezier(0.16,1,0.3,1)', boxShadow: '0 8px 40px rgba(0,0,0,0.14), 0 32px 80px rgba(0,0,0,0.08)' }}
      >
        {/* Mobile handle */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0" style={{ backgroundColor: color.bg }}>
          <div className="w-8 h-1 rounded-full" style={{ backgroundColor: color.dot, opacity: 0.3 }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0" style={{ backgroundColor: color.bg }}>
          <div>
            <div className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold mb-1.5" style={{ backgroundColor: color.dot, color: '#fff' }}>
              {pub.proyecto}
            </div>
            <div className="text-sm font-bold text-gray-900">Editar publicación</div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 hover:brightness-90"
            style={{ backgroundColor: 'rgba(0,0,0,0.09)', color: color.text }}
          >
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Scrollable form */}
        <div className="overflow-y-auto flex-1 p-6 space-y-4">

          {/* Proyecto */}
          <div>
            <label className={labelClass}>Proyecto</label>
            <select value={form.proyecto} onChange={e => set('proyecto', e.target.value)} className={inputClass}>
              {allProjects.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* Fecha */}
          <div>
            <label className={labelClass}>Fecha</label>
            <input type="date" value={form.fecha} onChange={e => set('fecha', e.target.value)} className={inputClass} />
          </div>

          {/* Título */}
          <div>
            <label className={labelClass}>Título</label>
            <input type="text" value={form.titulo} onChange={e => set('titulo', e.target.value)} className={inputClass} />
          </div>

          {/* Tipo */}
          <div>
            <label className={labelClass}>Tipo</label>
            <div className="flex flex-wrap gap-1.5">
              {TYPE_OPTIONS.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => set('tipo', t)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold border capitalize transition-all duration-150"
                  style={form.tipo === t
                    ? { backgroundColor: '#e84530', color: '#fff', borderColor: '#e84530' }
                    : { backgroundColor: '#F9FAFB', color: '#6B7280', borderColor: 'transparent' }
                  }
                >{t}</button>
              ))}
            </div>
          </div>

          {/* Canal */}
          <div>
            <label className={labelClass}>Canal</label>
            <div className="flex flex-wrap gap-1.5">
              {CANAL_OPTIONS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => set('canal', form.canal === c ? '' : c)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150"
                  style={form.canal === c
                    ? { backgroundColor: '#111827', color: '#fff', borderColor: '#111827' }
                    : { backgroundColor: '#F9FAFB', color: '#6B7280', borderColor: 'transparent' }
                  }
                >{c}</button>
              ))}
            </div>
          </div>

          {/* Copy */}
          <div>
            <label className={labelClass}>Copy</label>
            <textarea value={form.copy} onChange={e => set('copy', e.target.value)} rows={4} className={`${inputClass} resize-none`} />
          </div>

          {/* Media */}
          <div>
            <label className={labelClass}>Imagen / Vídeo (URLs separadas por coma)</label>
            <textarea value={form.media} onChange={e => set('media', e.target.value)} rows={2} className={`${inputClass} resize-none`} placeholder="https://..." />
          </div>

          {/* URL post publicado */}
          <div>
            <label className={labelClass}>URL post publicado</label>
            <input type="url" value={form.url_post} onChange={e => set('url_post', e.target.value)} className={inputClass} placeholder="https://instagram.com/p/..." />
          </div>

          {/* Estado */}
          <div>
            <label className={labelClass}>Estado</label>
            <select value={form.estado} onChange={e => set('estado', e.target.value)} className={inputClass}>
              <option value="">Sin estado</option>
              {ESTADO_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              {form.estado && !ESTADO_OPTIONS.includes(form.estado) && (
                <option value={form.estado}>{form.estado}</option>
              )}
            </select>
          </div>

          {/* Pauta */}
          <div>
            <label className={labelClass}>Campaña de Ads</label>
            <button
              type="button"
              onClick={() => set('promocionado', !form.promocionado)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all duration-150"
              style={form.promocionado
                ? { backgroundColor: '#e84530', color: '#fff', borderColor: '#e84530' }
                : { backgroundColor: '#fff', color: '#6B7280', borderColor: '#E5E7EB' }
              }
            >
              {form.promocionado ? 'Sí, con campaña' : 'Sin campaña'}
            </button>
            {form.promocionado && (
              <div className="mt-2.5">
                <label className={labelClass}>Presupuesto (€)</label>
                <input type="number" min="0" step="0.01" value={form.presupuesto} onChange={e => set('presupuesto', e.target.value)} placeholder="0.00" className={inputClass} />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2.5 p-6 pt-4 flex-shrink-0 border-t border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-all duration-150"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 hover:brightness-90"
            style={{ backgroundColor: '#e84530' }}
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  )
}
