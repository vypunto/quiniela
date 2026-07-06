import { useState, useEffect, useMemo } from 'react'
import RequestForm from './RequestForm'
import { getProjectColor } from '../utils/colors'
import { DAYS_ES, MONTHS_ES, parseDate } from '../utils/dateUtils'
import { fetchRequestsData, updateRequest, deleteRequest } from '../utils/googleSheets'
import { REQUESTS_SHEET_URL, PROJECTS } from '../config'

const PRIORIDAD_STYLES = {
  'Baja':     { bg: '#F3F4F6', text: '#6B7280', dot: '#9CA3AF' },
  'Media':    { bg: '#EFF6FF', text: '#3B82F6', dot: '#3B82F6' },
  'Alta':     { bg: '#FFF7ED', text: '#D97706', dot: '#F59E0B' },
  'Muy alta': { bg: '#FFF1F2', text: '#BE123C', dot: '#e84530' },
}
const PRIORIDAD_OPTIONS = ['Baja', 'Media', 'Alta', 'Muy alta']

const STATUS_STYLES = {
  'Pendiente':   { bg: '#FFF8E6', text: '#8A6000', dot: '#F59E0B' },
  'En revisión': { bg: '#EFF6FF', text: '#1D4ED8', dot: '#3B82F6' },
  'Aprobado':    { bg: '#F0FDF4', text: '#15803D', dot: '#22C55E' },
  'Rechazado':   { bg: '#FFF1F2', text: '#BE123C', dot: '#F43F5E' },
}
const STATUS_OPTIONS = ['Pendiente', 'En revisión', 'Aprobado', 'Rechazado']

function StatusBadge({ estado }) {
  const s = STATUS_STYLES[estado] || STATUS_STYLES['Pendiente']
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold flex-shrink-0"
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.dot }} />
      {estado || 'Pendiente'}
    </span>
  )
}

const inputClass = "w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#e84530]/15 focus:border-[#e84530]/30 transition-all duration-150"

function EditModal({ req, scriptUrl, onSave, onClose }) {
  const [form, setForm] = useState({
    titulo: req.titulo || '',
    info: req.info || '',
    estado: req.estado || 'Pendiente',
    fecha: req.fecha instanceof Date ? req.fecha.toISOString().slice(0, 10) : '',
    canal: req.canal || '',
    prioridad: req.prioridad || 'Media',
    promocionado: (req.promocionado || 'No').startsWith('S') || (req.promocionado || 'No').startsWith('s'),
    presupuesto: req.presupuesto || '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    const updated = { ...req, ...form, fecha: new Date(form.fecha), promocionado: form.promocionado ? 'Sí' : 'No' }
    try {
      if (scriptUrl && req.id.startsWith('sheet-')) {
        const rowIndex = parseInt(req.id.replace('sheet-', ''))
        await updateRequest(scriptUrl, rowIndex, form)
      }
      try {
        const saved = JSON.parse(localStorage.getItem('pubcal_requests') || '[]')
        const idx = saved.findIndex(r => r.id === req.id)
        if (idx >= 0) {
          saved[idx] = { ...saved[idx], ...form }
          localStorage.setItem('pubcal_requests', JSON.stringify(saved))
        }
      } catch { /* ignore */ }
      onSave(updated)
    } catch (e) {
      setError('No se pudo guardar en la hoja. Los cambios se aplicaron localmente.')
      try {
        const saved = JSON.parse(localStorage.getItem('pubcal_requests') || '[]')
        const idx = saved.findIndex(r => r.id === req.id)
        if (idx >= 0) {
          saved[idx] = { ...saved[idx], ...form }
          localStorage.setItem('pubcal_requests', JSON.stringify(saved))
        }
      } catch { /* ignore */ }
      onSave(updated)
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    const handle = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [onClose])

  const color = getProjectColor(req.proyecto)

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[6px]" onClick={onClose} />
      <div
        className="relative bg-white rounded-t-[28px] sm:rounded-[24px] sm:max-w-md w-full overflow-hidden"
        style={{
          animation: 'modalIn 200ms cubic-bezier(0.16,1,0.3,1)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.14), 0 32px 80px rgba(0,0,0,0.08)',
        }}
      >
        {/* Handle */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0" style={{ backgroundColor: color.bg }}>
          <div className="w-8 h-1 rounded-full" style={{ backgroundColor: color.dot, opacity: 0.3 }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100" style={{ backgroundColor: color.bg }}>
          <div>
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold mb-1.5"
              style={{ backgroundColor: color.dot, color: '#fff' }}
            >
              {req.proyecto}
            </div>
            <div className="text-sm font-bold text-gray-900">Editar petición</div>
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

        {/* Form */}
        <div className="p-6 space-y-4">
          {/* Estado */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-[0.1em] mb-2.5">Estado</label>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_OPTIONS.map(s => {
                const style = STATUS_STYLES[s]
                const isActive = form.estado === s
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => set('estado', s)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 border"
                    style={isActive
                      ? { backgroundColor: style.dot, color: '#fff', borderColor: style.dot }
                      : { backgroundColor: style.bg, color: style.text, borderColor: 'transparent' }
                    }
                  >
                    {s}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-[0.1em] mb-2">Título</label>
            <input type="text" value={form.titulo} onChange={e => set('titulo', e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-[0.1em] mb-2">Fecha</label>
            <input type="date" value={form.fecha} onChange={e => set('fecha', e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-[0.1em] mb-2">Información adicional</label>
            <textarea
              value={form.info}
              onChange={e => set('info', e.target.value)}
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-[0.1em] mb-2.5">Prioridad</label>
            <div className="flex flex-wrap gap-1.5">
              {PRIORIDAD_OPTIONS.map(p => {
                const s = PRIORIDAD_STYLES[p]
                const isActive = form.prioridad === p
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => set('prioridad', p)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 border"
                    style={isActive
                      ? { backgroundColor: s.dot, color: '#fff', borderColor: s.dot }
                      : { backgroundColor: s.bg, color: s.text, borderColor: 'transparent' }
                    }
                  >
                    {p}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-[0.1em] mb-2">Campaña de Ads</label>
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
                {form.promocionado ? 'Sí, con campaña' : 'Sin campaña'}
              </button>
            </div>
            {form.promocionado && (
              <div className="mt-2.5">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-[0.1em] mb-2">Presupuesto (€)</label>
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
            <p className="text-xs font-medium text-amber-700 bg-amber-50 rounded-xl px-4 py-2.5">{error}</p>
          )}

          <div className="flex gap-2.5 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 transition-all duration-150"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150 disabled:opacity-40"
              style={{ backgroundColor: '#e84530' }}
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const DEMO_REQUESTS = [
  { id: 'r0', proyecto: 'GASTRO LEAGUE', fecha: new Date(), titulo: 'Post inauguración menú de verano', info: 'Queremos anunciar el nuevo menú con foco en productos locales y de temporada.', solicitante: 'Carlos M.', estado: 'Aprobado', tipo: 'imagen', canal: 'Instagram' },
  { id: 'r1', proyecto: 'TEATRO ALICANTE', fecha: new Date(new Date().setDate(new Date().getDate() + 5)), titulo: 'Vídeo promocional obra de julio', info: 'Vídeo corto para redes sobre la obra de este mes. Tono emotivo.', solicitante: 'Ana P.', estado: 'En revisión', tipo: 'video', canal: 'Instagram' },
  { id: 'r2', proyecto: 'TEATRO SEVILLA', fecha: new Date(new Date().setDate(new Date().getDate() + 10)), titulo: 'Post ruta turística especial verano', info: 'Ruta temática por el Albaicín. Queremos llegar a turistas nacionales.', solicitante: 'Pedro L.', estado: 'Pendiente', tipo: 'imagen', canal: 'Facebook' },
  { id: 'r3', proyecto: 'PREVENIDOS Y ACCION', fecha: new Date(new Date().setDate(new Date().getDate() + 15)), titulo: 'Infografía prevención verano', info: 'Medidas de seguridad en la playa. Estilo visual limpio, colores claros.', solicitante: 'María G.', estado: 'Pendiente', tipo: 'imagen', canal: 'LinkedIn' },
]

export default function RequestsView({ config, isDemo, calendarPubs = [], onCountChange }) {
  const [requests, setRequests] = useState([])
  const [editingReq, setEditingReq] = useState(null)
  const [loadingSheet, setLoadingSheet] = useState(false)

  const projects = useMemo(() => {
    const fromSheet = calendarPubs.map(p => p.proyecto).filter(Boolean)
    const set = new Set([...PROJECTS, ...fromSheet])
    return Array.from(set).sort()
  }, [calendarPubs])

  const loadRequests = async () => {
    if (isDemo) {
      setRequests(DEMO_REQUESTS)
      const pending = DEMO_REQUESTS.filter(r => !r.estado || r.estado === 'Pendiente').length
      onCountChange && onCountChange(pending)
      return
    }

    let local = []
    try {
      const saved = JSON.parse(localStorage.getItem('pubcal_requests') || '[]')
      local = saved.map((r, i) => ({ ...r, fecha: parseDate(r.fecha) || new Date(), id: r.id || String(i) }))
    } catch { /* ignore */ }

    // Also load cached sheet data so list is never blank
    let sheetCache = []
    try {
      const raw = localStorage.getItem('pubcal_requests_cache')
      if (raw) sheetCache = JSON.parse(raw).map((r, i) => ({ ...r, fecha: parseDate(r.fecha) || new Date(), id: r.id || String(i) }))
    } catch { /* ignore */ }

    const localKeys = new Set(local.map(r => `${r.proyecto}||${r.titulo}`))
    const merged = [...local, ...sheetCache.filter(r => !localKeys.has(`${r.proyecto}||${r.titulo}`))]
      .sort((a, b) => (a.fecha || 0) - (b.fecha || 0))
    setRequests(merged)
    onCountChange && onCountChange(merged.filter(r => !r.estado || r.estado === 'Pendiente').length)

    if (REQUESTS_SHEET_URL) {
      setLoadingSheet(true)
      try {
        const sheetData = await fetchRequestsData(REQUESTS_SHEET_URL)
        const sheetKeys = new Set(sheetData.map(r => `${r.proyecto}||${r.titulo}`))
        const localOnly = local.filter(r => !sheetKeys.has(`${r.proyecto}||${r.titulo}`))
        const all = [...sheetData, ...localOnly].sort((a, b) => (a.fecha || 0) - (b.fecha || 0))
        setRequests(all)
        onCountChange && onCountChange(all.filter(r => !r.estado || r.estado === 'Pendiente').length)
        // Update cache
        localStorage.setItem('pubcal_requests_cache', JSON.stringify(
          sheetData.map(r => ({ ...r, fecha: r.fecha instanceof Date ? r.fecha.toISOString() : r.fecha }))
        ))
      } catch {
        // local items already displayed; nothing extra to do
      } finally {
        setLoadingSheet(false)
      }
    }
  }

  useEffect(() => { loadRequests() }, [isDemo])

  const handleSaveEdit = (updated) => {
    setRequests(prev => prev.map(r => r.id === updated.id ? updated : r))
    setEditingReq(null)
    const all = requests.map(r => r.id === updated.id ? updated : r)
    onCountChange && onCountChange(all.filter(r => !r.estado || r.estado === 'Pendiente').length)
  }

  const handleDelete = async (req) => {
    if (!window.confirm(`¿Eliminar la petición "${req.titulo}"?`)) return
    setRequests(prev => {
      const next = prev.filter(r => r.id !== req.id)
      onCountChange && onCountChange(next.filter(r => !r.estado || r.estado === 'Pendiente').length)
      return next
    })
    try {
      const saved = JSON.parse(localStorage.getItem('pubcal_requests') || '[]')
      localStorage.setItem('pubcal_requests', JSON.stringify(saved.filter(r => r.id !== req.id)))
    } catch { /* ignore */ }
    if (config.requestsScriptUrl && req.id.startsWith('sheet-')) {
      const rowIndex = parseInt(req.id.replace('sheet-', ''))
      try { await deleteRequest(config.requestsScriptUrl, rowIndex) } catch { /* ignore */ }
    }
  }

  const sorted = [...requests].sort((a, b) => (a.fecha || 0) - (b.fecha || 0))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      {/* Form */}
      <div className="lg:col-span-1">
        <RequestForm
          projects={projects}
          scriptUrl={config.requestsScriptUrl}
          onSubmitted={() => loadRequests()}
        />
      </div>

      {/* List */}
      <div className="lg:col-span-2">
        {sorted.length === 0 ? (
          <div
            className="bg-white rounded-2xl flex flex-col items-center justify-center py-20 text-center"
            style={{ border: '1px solid #E8EAED', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
          >
            <div className="text-4xl mb-4 opacity-40">📬</div>
            <p className="text-sm font-medium text-gray-400">Aún no hay peticiones enviadas</p>
          </div>
        ) : (
          <div
            className="bg-white rounded-2xl overflow-hidden"
            style={{ border: '1px solid #E8EAED', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)' }}
          >
            {/* List header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100" style={{ backgroundColor: '#FAFAFA' }}>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em]">Peticiones recibidas</span>
              <span className="text-xs font-medium text-gray-400">{sorted.length} total</span>
            </div>

            <div className="divide-y divide-gray-50">
              {sorted.map(req => {
                const color = getProjectColor(req.proyecto)
                const d = req.fecha instanceof Date ? req.fecha : new Date()
                return (
                  <div
                    key={req.id}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/60 transition-all duration-150"
                  >
                    {/* Date */}
                    <div className="w-10 text-center flex-shrink-0">
                      <div className="text-[10px] font-semibold text-gray-400 leading-none">{DAYS_ES[d.getDay()].slice(0, 3).toUpperCase()}</div>
                      <div className="text-base font-bold text-gray-800 leading-tight mt-0.5">{d.getDate()}</div>
                      <div className="text-[10px] font-medium text-gray-400 leading-none mt-0.5">{MONTHS_ES[d.getMonth()].slice(0, 3).toUpperCase()}</div>
                    </div>

                    <div className="w-0.5 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: color.dot }} />

                    <div
                      className="px-2.5 py-1 rounded-full text-[11px] font-semibold flex-shrink-0 hidden sm:block"
                      style={{ backgroundColor: color.bg, color: color.text }}
                    >
                      {req.proyecto}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-800 truncate">{req.titulo}</div>
                      <div className="text-[11px] text-gray-400 truncate flex items-center gap-1.5 mt-0.5">
                        {req.canal && <span className="font-medium text-gray-500">{req.canal}</span>}
                        {req.canal && req.solicitante && <span className="text-gray-300">·</span>}
                        {req.solicitante && <span>por {req.solicitante}</span>}
                      </div>
                    </div>

                    {req.promocionado && (req.promocionado.startsWith('S') || req.promocionado.startsWith('s')) && (
                      <span
                        className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold flex-shrink-0"
                        style={{ backgroundColor: '#FFF3CD', color: '#856404' }}
                        title={req.presupuesto ? `Pauta: ${req.presupuesto} €` : 'Con pauta'}
                      >
                        <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M2 8h5M11 5l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 5H2v6h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        {req.presupuesto ? `${req.presupuesto} €` : 'Pauta'}
                      </span>
                    )}

                    {req.prioridad && (
                      <span
                        className="hidden sm:inline-flex items-center px-2 py-1 rounded-full text-[10px] font-semibold flex-shrink-0"
                        style={{ backgroundColor: (PRIORIDAD_STYLES[req.prioridad] || PRIORIDAD_STYLES['Media']).bg, color: (PRIORIDAD_STYLES[req.prioridad] || PRIORIDAD_STYLES['Media']).text }}
                      >
                        {req.prioridad}
                      </span>
                    )}

                    <StatusBadge estado={req.estado} />

                    <button
                      onClick={() => setEditingReq(req)}
                      className="flex-shrink-0 w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-150"
                      title="Editar"
                    >
                      <svg width="11" height="11" viewBox="0 0 682.66669 682.66669" fill="none">
                        <g transform="matrix(1.3333333,0,0,-1.3333333,0,682.66667)">
                          <g transform="translate(436.2648,490.5177)">
                            <path d="m 0,0 55.186,-55.186 c 7.811,-7.811 7.811,-20.474 0,-28.285 L -0.151,-138.809 -83.622,-55.338 -28.284,0 C -20.474,7.81 -7.81,7.81 0,0 Z" stroke="currentColor" strokeWidth="75" strokeLinecap="round" strokeLinejoin="round"/>
                          </g>
                          <g transform="translate(310.4019,392.939)">
                            <path d="m 0,0 83.471,-83.471 42.24,42.241 -83.47,83.471 z" stroke="currentColor" strokeWidth="75" strokeLinecap="round" strokeLinejoin="round"/>
                          </g>
                          <g transform="translate(310.4019,392.939)">
                            <path d="m 0,0 -250.624,-250.624 83.47,-83.471 250.625,250.624 z" stroke="currentColor" strokeWidth="75" strokeLinecap="round" strokeLinejoin="round"/>
                          </g>
                          <g transform="translate(14.6909,15)">
                            <path d="m 0,0 128.557,43.844 -83.47,83.471 z" stroke="currentColor" strokeWidth="75" strokeLinecap="round" strokeLinejoin="round"/>
                          </g>
                          <g transform="translate(30.2175,58.8438)">
                            <path d="M 0,0 29.014,-29.014" stroke="currentColor" strokeWidth="75" strokeLinecap="round" strokeLinejoin="round"/>
                          </g>
                        </g>
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(req)}
                      className="flex-shrink-0 w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all duration-150"
                      title="Eliminar"
                    >
                      <svg width="11" height="11" viewBox="0 0 682.66669 682.66669" fill="none">
                        <g transform="matrix(1.3333333,0,0,-1.3333333,0,682.66667)">
                          <g transform="translate(196,435)">
                            <path d="M 0,0 V 62 H 120 V 0" stroke="currentColor" strokeWidth="75" strokeLinecap="round" strokeLinejoin="round"/>
                          </g>
                          <g transform="translate(406,375)">
                            <path d="M 0,0 -30,-360 H -270 L -300,0" stroke="currentColor" strokeWidth="75" strokeLinecap="round" strokeLinejoin="round"/>
                          </g>
                          <path d="M 436,375 H 76 v 60 h 360 z" stroke="currentColor" strokeWidth="75" strokeLinecap="round" strokeLinejoin="round"/>
                          <g transform="translate(256,285)">
                            <path d="M 0,0 V -180" stroke="currentColor" strokeWidth="75" strokeLinecap="round" strokeLinejoin="round"/>
                          </g>
                          <g transform="translate(196,285)">
                            <path d="M 0,0 V -180" stroke="currentColor" strokeWidth="75" strokeLinecap="round" strokeLinejoin="round"/>
                          </g>
                          <g transform="translate(316,285)">
                            <path d="M 0,0 V -180" stroke="currentColor" strokeWidth="75" strokeLinecap="round" strokeLinejoin="round"/>
                          </g>
                        </g>
                      </svg>
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {editingReq && (
        <EditModal
          req={editingReq}
          scriptUrl={config.requestsScriptUrl}
          onSave={handleSaveEdit}
          onClose={() => setEditingReq(null)}
        />
      )}
    </div>
  )
}
