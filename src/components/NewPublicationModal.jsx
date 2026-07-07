import { useState, useRef, useEffect, useCallback } from 'react'
import { uploadFile } from '../utils/googleSheets'

const TIPOS = ['imagen', 'video', 'reel', 'carrusel', 'historia', 'texto']
const CANALES = ['Instagram', 'TikTok', 'Facebook', 'LinkedIn', 'Twitter', 'YouTube', 'Web']
const ESTADOS = ['Programado', 'Publicado', 'Borrador', 'Cancelado']

const labelClass = 'text-[10px] font-bold text-gray-400 mb-1.5 tracking-[0.12em] uppercase block'
const inputClass = 'w-full px-3 py-2.5 rounded-xl text-[13px] font-medium border border-gray-200 bg-white focus:outline-none focus:border-[#fa523c]'

const EMPTY = {
  proyecto: '', fecha: '', titulo: '', copy: '', media: '',
  tipo: 'imagen', canal: '', estado: 'Programado', presupuesto: '',
}

export default function NewPublicationModal({ onClose, config, projects, onSaved }) {
  const [form, setForm] = useState(EMPTY)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [adjunto, setAdjunto] = useState(null)
  const fileInputRef = useRef(null)
  const prevPreviewRef = useRef(null)

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleFile = useCallback(async (file) => {
    if (prevPreviewRef.current) { URL.revokeObjectURL(prevPreviewRef.current); prevPreviewRef.current = null }
    if (!file) { setAdjunto(null); return }
    const isImage = file.type.startsWith('image/')
    const preview = isImage ? URL.createObjectURL(file) : null
    prevPreviewRef.current = preview
    if (file.size >= 50 * 1024 * 1024) {
      setAdjunto({ nombre: file.name, tipo: file.type, preview, size: file.size, status: 'toobig' })
      return
    }
    setAdjunto({ nombre: file.name, tipo: file.type, preview, size: file.size, status: 'uploading' })
    const scriptUrl = config?.requestsScriptUrl
    if (!scriptUrl) { setAdjunto(prev => prev ? { ...prev, status: 'error' } : null); return }
    try {
      const datos = await new Promise((res, rej) => {
        const r = new FileReader(); r.onload = e => res(e.target.result); r.onerror = rej; r.readAsDataURL(file)
      })
      const result = await uploadFile(scriptUrl, file.name, file.type, datos)
      if (result?.url) {
        setForm(f => ({ ...f, media: f.media ? `${f.media}, ${result.url}` : result.url }))
        setAdjunto(prev => prev ? { ...prev, status: 'done' } : null)
      } else {
        setAdjunto(prev => prev ? { ...prev, status: 'error' } : null)
      }
    } catch (err) {
      console.error('Upload error:', err?.message || err)
      setAdjunto(prev => prev ? { ...prev, status: 'error' } : null)
    }
  }, [config?.requestsScriptUrl])

  useEffect(() => () => { if (prevPreviewRef.current) URL.revokeObjectURL(prevPreviewRef.current) }, [])

  const handleSubmit = async e => {
    e.preventDefault()
    setSending(true)
    setError('')
    try {
      const payload = {
        ...form,
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
      handleFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="w-full max-w-lg bg-white rounded-3xl flex flex-col"
        style={{ maxHeight: 'min(90vh, 700px)', boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}
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
        <div className="overflow-y-auto flex-1" style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}>
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Proyecto *</label>
                <select name="proyecto" value={form.proyecto} onChange={handleChange} required className={inputClass}>
                  <option value="">Selecciona...</option>
                  {(projects || []).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Fecha *</label>
                <input type="date" name="fecha" value={form.fecha} onChange={handleChange} required className={`${inputClass} appearance-none`} style={{ width: '100%', minWidth: 0 }} />
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
              <label className={labelClass}>Imagen / Vídeo</label>
              <input
                type="text"
                name="media"
                value={form.media}
                onChange={handleChange}
                placeholder="URL de Drive, imagen o vídeo… (separa varios con comas)"
                className={inputClass}
              />
              <div className="mt-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={e => handleFile(e.target.files?.[0] || null)}
                />
                {!adjunto ? (
                  <label
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-gray-300 text-xs text-gray-400 cursor-pointer hover:border-gray-400 hover:text-gray-500 transition-colors w-fit"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    Adjuntar imagen o vídeo
                  </label>
                ) : (
                  <div className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-200 bg-gray-50">
                    {adjunto.preview
                      ? <img src={adjunto.preview} alt="" className="w-12 h-12 object-cover rounded-lg flex-shrink-0" />
                      : <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                        </div>
                    }
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700 truncate">{adjunto.nombre}</p>
                      <p className="text-[10px] text-gray-400">
                        {adjunto.size < 1024*1024 ? `${(adjunto.size/1024).toFixed(0)} KB` : `${(adjunto.size/(1024*1024)).toFixed(1)} MB`}
                        {adjunto.status === 'uploading' && <span className="ml-1.5 text-blue-500">· Subiendo a Drive…</span>}
                        {adjunto.status === 'done'     && <span className="ml-1.5 text-green-600">· Guardado en Drive</span>}
                        {adjunto.status === 'error'    && <span className="ml-1.5 text-amber-600">· Error al subir — añade el link manualmente</span>}
                        {adjunto.status === 'toobig'   && <span className="ml-1.5 text-amber-600">· Supera 50 MB</span>}
                      </p>
                    </div>
                    {adjunto.status === 'uploading'
                      ? <svg className="animate-spin flex-shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                      : <button type="button" onClick={() => { handleFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }} className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                    }
                  </div>
                )}
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
