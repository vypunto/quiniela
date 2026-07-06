import { useState, useRef, useEffect, useCallback } from 'react'
import { submitRequest, uploadFile } from '../utils/googleSheets'
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

const inputClass = "w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e84530]/15 focus:border-[#e84530]/30 transition-all duration-150 bg-white placeholder:text-gray-300"
const labelClass = "block text-xs font-semibold text-gray-500 mb-2 tracking-wide"

function CustomSelect({ value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selected = options.find(o => o === value)

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full px-3.5 py-2.5 text-sm border rounded-xl bg-white flex items-center justify-between transition-all duration-150 focus:outline-none"
        style={{
          borderColor: open ? 'rgba(232,69,48,0.3)' : '#E5E7EB',
          boxShadow: open ? '0 0 0 3px rgba(232,69,48,0.08)' : 'none',
        }}
      >
        <span className={selected ? 'text-gray-800 font-medium' : 'text-gray-300'}>
          {selected || placeholder}
        </span>
        <svg
          width="12" height="12" viewBox="0 0 12 12" fill="none"
          className="flex-shrink-0 transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <path d="M2 4l4 4 4-4" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div
          className="absolute z-50 mt-1.5 w-full bg-white rounded-2xl border border-gray-100 overflow-hidden"
          style={{ boxShadow: '0 12px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)', animation: 'accountDropIn 150ms cubic-bezier(0.16,1,0.3,1)' }}
        >
          <div className="p-1.5 max-h-56 overflow-y-auto">
            {options.map(opt => {
              const isActive = value === opt
              const isOtros = opt === '__otros__'
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => { onChange(opt); setOpen(false) }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-100 flex items-center gap-2.5"
                  style={isActive
                    ? { backgroundColor: '#e84530', color: '#fff' }
                    : { color: isOtros ? '#9CA3AF' : '#374151', backgroundColor: 'transparent' }
                  }
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = '#F9FAFB' }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  {!isOtros && (
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: isActive ? 'rgba(255,255,255,0.7)' : '#D1D5DB' }}
                    />
                  )}
                  {isOtros ? 'OTROS…' : opt}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

const PRIORIDAD_OPTIONS = ['Baja', 'Media', 'Alta', 'Muy alta']
const PRIORIDAD_STYLES = {
  'Baja':     { active: { backgroundColor: '#6B7280', color: '#fff', borderColor: '#6B7280' } },
  'Media':    { active: { backgroundColor: '#3B82F6', color: '#fff', borderColor: '#3B82F6' } },
  'Alta':     { active: { backgroundColor: '#F59E0B', color: '#fff', borderColor: '#F59E0B' } },
  'Muy alta': { active: { backgroundColor: '#e84530', color: '#fff', borderColor: '#e84530' } },
}

const SOLICITANTE_KEY = 'pubcal_solicitante'
const EMPTY_FORM = { proyecto: '', proyectoOtros: '', fecha: '', titulo: '', info: '', contenido: '', solicitante: '', tipo: 'imagen', canal: '', prioridad: 'Media', promocionado: false, presupuesto: '' }

export default function RequestForm({ projects, scriptUrl, onSubmitted }) {
  const [form, setForm] = useState(() => ({
    ...EMPTY_FORM,
    solicitante: localStorage.getItem(SOLICITANTE_KEY) || '',
  }))
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)
  const [adjunto, setAdjunto] = useState(null)
  const fileInputRef = useRef(null)
  const prevPreviewRef = useRef(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

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
    if (!scriptUrl) { setAdjunto(prev => prev ? { ...prev, status: 'error' } : null); return }
    try {
      const datos = await new Promise((res, rej) => {
        const r = new FileReader(); r.onload = e => res(e.target.result); r.onerror = rej; r.readAsDataURL(file)
      })
      const result = await uploadFile(scriptUrl, file.name, file.type, datos)
      if (result?.url) {
        setForm(f => ({ ...f, contenido: f.contenido ? `${f.contenido}, ${result.url}` : result.url }))
        setAdjunto(prev => prev ? { ...prev, status: 'done' } : null)
      } else {
        setAdjunto(prev => prev ? { ...prev, status: 'error' } : null)
      }
    } catch (err) {
      console.warn('Upload error:', err)
      setAdjunto(prev => prev ? { ...prev, status: 'error' } : null)
    }
  }, [scriptUrl])

  useEffect(() => () => { if (prevPreviewRef.current) URL.revokeObjectURL(prevPreviewRef.current) }, [])

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
      promocionado: form.promocionado ? 'Sí' : 'No',
    }
    delete payload.proyectoOtros

    try {
      const existing = JSON.parse(localStorage.getItem('pubcal_requests') || '[]')
      existing.unshift({ ...payload, id: Date.now().toString() })
      localStorage.setItem('pubcal_requests', JSON.stringify(existing))
    } catch { /* ignore */ }

    if (form.solicitante.trim()) {
      localStorage.setItem(SOLICITANTE_KEY, form.solicitante.trim())
    }

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
      setForm({ ...EMPTY_FORM, solicitante: localStorage.getItem(SOLICITANTE_KEY) || '' })
      handleFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }, 2500)
  }

  return (
    <div
      className="bg-white rounded-2xl p-4 sm:p-6"
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
              <path d="M5 12l5 5L20 7" stroke="#e84530" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="text-sm font-bold text-gray-800">¡Petición enviada!</p>
          <p className="text-xs text-gray-400 mt-1">El equipo la revisará pronto</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Proyecto */}
          <div>
            <label className={labelClass}>Proyecto <span className="text-[#e84530]">*</span></label>
            <CustomSelect
              value={form.proyecto}
              onChange={v => set('proyecto', v)}
              placeholder="Selecciona un proyecto…"
              options={[...(projects || []), '__otros__']}
            />
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
            <label className={labelClass}>Fecha deseada <span className="text-[#e84530]">*</span></label>
            <div className="w-full overflow-hidden rounded-xl">
              <input type="date" value={form.fecha} onChange={e => set('fecha', e.target.value)} required className={inputClass} style={{ minWidth: 0 }} />
            </div>
          </div>

          {/* Título */}
          <div>
            <label className={labelClass}>Título del post <span className="text-[#e84530]">*</span></label>
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
            <label className={labelClass}>Contenido</label>
            <input
              type="text"
              value={form.contenido}
              onChange={e => set('contenido', e.target.value)}
              placeholder="Link de Drive, imagen o vídeo… (separa varios con comas)"
              className={inputClass}
            />
            <label className="mt-2 flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-gray-200 text-xs font-medium text-gray-400 cursor-pointer hover:border-[#e84530]/40 hover:text-gray-500 hover:bg-gray-50/60 transition-all duration-150">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              {adjunto ? <span className="truncate text-gray-600 font-semibold">{adjunto.nombre}</span> : 'o adjunta un archivo del dispositivo'}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={e => handleFile(e.target.files[0])}
              />
            </label>
            {adjunto && (
              <div className="mt-1.5 flex items-center gap-2.5 px-3 py-2 bg-gray-50 rounded-xl">
                {adjunto.preview
                  ? <img src={adjunto.preview} alt="" className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />
                  : <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                    </div>
                }
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-gray-700 truncate">{adjunto.nombre}</div>
                  <div className="text-[11px] text-gray-400">
                    {adjunto.size >= 1024*1024 ? `${(adjunto.size/1024/1024).toFixed(1)} MB` : `${(adjunto.size/1024).toFixed(0)} KB`}
                    {adjunto.status === 'uploading' && <span className="ml-1.5 text-blue-500">· Subiendo a Drive…</span>}
                    {adjunto.status === 'done'     && <span className="ml-1.5 text-green-600">· Guardado en Drive</span>}
                    {adjunto.status === 'error'    && <span className="ml-1.5 text-amber-600">· Error al subir — añade el link manualmente</span>}
                    {adjunto.status === 'toobig'   && <span className="ml-1.5 text-amber-600">· Supera 50 MB — añade el link manualmente</span>}
                  </div>
                </div>
                {adjunto.status === 'uploading'
                  ? <svg className="animate-spin flex-shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                  : <button
                      type="button"
                      onClick={() => { handleFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                      className="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-all duration-150 flex-shrink-0"
                    >
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
                    </button>
                }
              </div>
            )}
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

          {/* Prioridad */}
          <div>
            <label className={labelClass}>Prioridad</label>
            <div className="flex flex-wrap gap-1.5">
              {PRIORIDAD_OPTIONS.map(p => {
                const isActive = form.prioridad === p
                const activeStyle = PRIORIDAD_STYLES[p]?.active || {}
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => set('prioridad', p)}
                    className="px-3 py-1 rounded-full text-[11px] font-semibold border transition-all duration-150"
                    style={isActive ? activeStyle : { backgroundColor: '#fff', color: '#6B7280', borderColor: '#E5E7EB' }}
                  >
                    {p}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Campaña de Ads */}
          <div>
            <label className={labelClass}>Campaña de Ads</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => set('promocionado', !form.promocionado)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all duration-150"
                style={form.promocionado
                  ? { backgroundColor: '#e84530', color: '#fff', borderColor: '#e84530' }
                  : { backgroundColor: '#fff', color: '#6B7280', borderColor: '#E5E7EB' }
                }
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M2 8h5M11 5l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4 5H2v6h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {form.promocionado ? 'Sí, con campaña' : 'Sin campaña'}
              </button>
            </div>
            {form.promocionado && (
              <div className="mt-2.5">
                <label className={labelClass}>Presupuesto estimado (€)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.presupuesto}
                  onChange={e => set('presupuesto', e.target.value)}
                  placeholder="0.00"
                  className={inputClass}
                />
              </div>
            )}
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
            style={{ backgroundColor: '#e84530', color: '#fff' }}
          >
            {sending ? 'Enviando...' : 'Enviar petición'}
          </button>
        </form>
      )}
    </div>
  )
}
