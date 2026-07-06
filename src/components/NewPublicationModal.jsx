import { useState } from 'react'

const TIPOS = ['imagen', 'video', 'reel', 'carrusel', 'historia', 'texto']
const CANALES = ['Instagram', 'TikTok', 'Facebook', 'LinkedIn', 'Twitter', 'YouTube', 'Web']
const ESTADOS = ['Programado', 'Publicado', 'Borrador', 'Cancelado']

const labelClass = 'text-[10px] font-bold text-gray-400 mb-1.5 tracking-[0.12em] uppercase block'
const inputClass = 'w-full px-3 py-2.5 rounded-xl text-[13px] font-medium border border-gray-200 bg-white focus:outline-none focus:border-[#fa523c]'

const EMPTY = {
  proyecto: '', fecha: '', titulo: '', copy: '', media: [''],
  tipo: 'imagen', canal: '', estado: 'Programado', presupuesto: '',
}

export default function NewPublicationModal({ onClose, config, projects, onSaved }) {
  const [form, setForm] = useState(EMPTY)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const addMedia = () => setForm(f => ({ ...f, media: [...f.media, ''] }))
  const removeMedia = i => setForm(f => ({ ...f, media: f.media.filter((_, n) => n !== i) }))
  const updateMedia = (i, v) => setForm(f => ({ ...f, media: f.media.map((m, n) => n === i ? v : m) }))
  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setSending(true)
    setError('')
    try {
      const payload = {
        ...form,
        media: form.media.filter(m => m.trim()).join(','),
        action: 'publicacion',
        fechaSolicitud: new Date().toLocaleDateString('es-ES'),
      }
      await fetch(config.requestsScriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      setSent(true)
      setForm({ ...EMPTY, proyecto: form.proyecto })
      onSaved && onSaved()
      setTimeout(() => setSent(false), 3000)
    } catch {
      setError('Error de conexión.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden"
        style={{ maxHeight: '92vh', boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="font-black text-gray-900" style={{ fontSize: '17px' }}>Nueva publicación</h2>
            <p className="text-[11px] text-gray-400 mt-0.5">Se añadirá a la hoja PUBLICACIONES</p>
          </div>
          <button
            onClick={() => onClose()}
            className="w-8 h-8 flex items-center justify-center rounded-full"
            style={{ backgroundColor: '#f0f0f0' }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 2l8 8" stroke="#666" strokeWidth="2" strokeLinecap="round"/>
              <path d="M10 2l-8 8" stroke="#666" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(92vh - 130px)' }}>
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Proyecto *</label>
                <select name="proyecto" value={form.proyecto} onChange={handleChange} required className={inputClass}>
                  <option value="">Selecciona...</option>
                  {(projects || []).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Fecha *</label>
                <input type="date" name="fecha" value={form.fecha} onChange={handleChange} required className={inputClass} />
              </div>
            </div>

            <div>
              <label className={labelClass}>Título *</label>
              <input type="text" name="titulo" value={form.titulo} onChange={handleChange} required placeholder="¿De qué trata el post?" className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Copy</label>
              <textarea name="copy" value={form.copy} onChange={handleChange} placeholder="Texto del post..." rows={3} className={`${inputClass} resize-none`} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={labelClass}>Imagen / Vídeo</label>
                {form.media.length < 8 && (
                  <button type="button" onClick={addMedia} className="flex items-center gap-1 text-[11px] font-bold text-[#fa523c]">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                    Añadir
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {form.media.map((m, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="text"
                      value={m}
                      onChange={e => updateMedia(i, e.target.value)}
                      placeholder={i === 0 ? 'URL de Drive...' : `URL ${i + 1}...`}
                      className={`flex-1 ${inputClass}`}
                    />
                    {form.media.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMedia(i)}
                        className="w-9 h-9 flex items-center justify-center rounded-xl flex-shrink-0"
                        style={{ backgroundColor: '#fff0ee', color: '#fa523c' }}
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Tipo *</label>
                <select name="tipo" value={form.tipo} onChange={handleChange} required className={inputClass}>
                  {TIPOS.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Canal</label>
                <select name="canal" value={form.canal} onChange={handleChange} className={inputClass}>
                  <option value="">Todos</option>
                  {CANALES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Estado</label>
                <select name="estado" value={form.estado} onChange={handleChange} className={inputClass}>
                  {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Presupuesto €</label>
                <input type="number" name="presupuesto" value={form.presupuesto} onChange={handleChange} placeholder="0" min="0" className={inputClass} />
              </div>
            </div>

            {error && <p className="text-xs font-semibold text-[#fa523c] text-center">{error}</p>}

            {sent && (
              <p className="text-xs font-bold text-green-600 text-center bg-green-50 rounded-xl px-4 py-2.5">
                ¡Publicación enviada correctamente!
              </p>
            )}

            <button
              type="submit"
              disabled={sending}
              className="w-full py-3 rounded-xl text-sm font-bold text-white disabled:opacity-40"
              style={{ backgroundColor: '#fa523c' }}
            >
              {sending ? 'Enviando...' : 'Añadir publicación'}
            </button>

            <div className="pb-1" />
          </form>
        </div>
      </div>
    </div>
  )
}
