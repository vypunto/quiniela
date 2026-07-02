import { useState, useEffect, useMemo } from 'react'
import RequestForm from './RequestForm'
import { getProjectColor } from '../utils/colors'
import { DAYS_ES, MONTHS_ES, parseDate } from '../utils/dateUtils'
import { fetchRequestsData, updateRequest } from '../utils/googleSheets'
import { REQUESTS_SHEET_URL, PROJECTS } from '../config'

const STATUS_STYLES = {
  'Pendiente':   { bg: '#FFF3CC', text: '#7A5500', dot: '#FFBE00' },
  'En revisión': { bg: '#E0F0FF', text: '#00428A', dot: '#0077FF' },
  'Aprobado':    { bg: '#CCFFE0', text: '#006622', dot: '#00CC44' },
  'Rechazado':   { bg: '#FFD6D6', text: '#AA0000', dot: '#FF2200' },
}
const STATUS_OPTIONS = ['Pendiente', 'En revisión', 'Aprobado', 'Rechazado']

function StatusBadge({ estado }) {
  const s = STATUS_STYLES[estado] || STATUS_STYLES['Pendiente']
  return (
    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold flex-shrink-0"
      style={{ backgroundColor: s.bg, color: s.text }}>
      {estado || 'Pendiente'}
    </span>
  )
}

function EditModal({ req, scriptUrl, onSave, onClose }) {
  const [form, setForm] = useState({
    titulo: req.titulo || '',
    info: req.info || '',
    estado: req.estado || 'Pendiente',
    fecha: req.fecha instanceof Date ? req.fecha.toISOString().slice(0, 10) : '',
    canal: req.canal || '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      if (scriptUrl && req.id.startsWith('sheet-')) {
        const rowIndex = parseInt(req.id.replace('sheet-', ''))
        await updateRequest(scriptUrl, rowIndex, form)
      }
      onSave({ ...req, ...form, fecha: new Date(form.fecha) })
    } catch (e) {
      setError('No se pudo guardar en la hoja. Los cambios se aplicaron localmente.')
      onSave({ ...req, ...form, fecha: new Date(form.fecha) })
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl sm:max-w-md w-full overflow-hidden"
        style={{ animation: 'modalIn 180ms cubic-bezier(0.16,1,0.3,1)' }}>

        {/* Handle */}
        <div className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0" style={{ backgroundColor: color.bg }}>
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: color.dot, opacity: 0.35 }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100" style={{ backgroundColor: color.bg }}>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-1"
              style={{ backgroundColor: color.dot, color: '#fff' }}>
              {req.proyecto}
            </div>
            <div className="text-sm font-black text-gray-900">Editar petición</div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.1)', color: color.text }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="p-5 space-y-4">
          {/* Estado */}
          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Estado</label>
            <div className="flex flex-wrap gap-1.5">
              {STATUS_OPTIONS.map(s => {
                const style = STATUS_STYLES[s]
                const isActive = form.estado === s
                return (
                  <button key={s} type="button" onClick={() => set('estado', s)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border"
                    style={isActive
                      ? { backgroundColor: style.dot, color: '#fff', borderColor: style.dot }
                      : { backgroundColor: style.bg, color: style.text, borderColor: 'transparent' }
                    }>
                    {s}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Título */}
          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">Título</label>
            <input type="text" value={form.titulo} onChange={e => set('titulo', e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#732442]/20 focus:border-[#732442]/40" />
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">Fecha</label>
            <input type="date" value={form.fecha} onChange={e => set('fecha', e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#732442]/20 focus:border-[#732442]/40" />
          </div>

          {/* Info */}
          <div>
            <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">Información adicional</label>
            <textarea value={form.info} onChange={e => set('info', e.target.value)} rows={3}
              className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#732442]/20 focus:border-[#732442]/40 resize-none" />
          </div>

          {error && <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 py-2.5 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50">
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

    if (REQUESTS_SHEET_URL) {
      setLoadingSheet(true)
      try {
        const sheetData = await fetchRequestsData(REQUESTS_SHEET_URL)
        const sheetKeys = new Set(sheetData.map(r => `${r.proyecto}||${r.titulo}`))
        const localOnly = local.filter(r => !sheetKeys.has(`${r.proyecto}||${r.titulo}`))
        const all = [...sheetData, ...localOnly].sort((a, b) => (a.fecha || 0) - (b.fecha || 0))
        setRequests(all)
        onCountChange && onCountChange(all.filter(r => !r.estado || r.estado === 'Pendiente').length)
      } catch {
        setRequests(local)
        onCountChange && onCountChange(local.filter(r => !r.estado || r.estado === 'Pendiente').length)
      } finally {
        setLoadingSheet(false)
      }
    } else {
      setRequests(local)
      onCountChange && onCountChange(local.filter(r => !r.estado || r.estado === 'Pendiente').length)
    }
  }

  useEffect(() => { loadRequests() }, [isDemo])

  const handleSaveEdit = (updated) => {
    setRequests(prev => prev.map(r => r.id === updated.id ? updated : r))
    setEditingReq(null)
    const all = requests.map(r => r.id === updated.id ? updated : r)
    onCountChange && onCountChange(all.filter(r => !r.estado || r.estado === 'Pendiente').length)
  }

  const sorted = [...requests].sort((a, b) => (a.fecha || 0) - (b.fecha || 0))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-5">
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
          <div className="bg-white rounded-2xl shadow border border-gray-200 flex flex-col items-center justify-center py-16 text-gray-400">
            <div className="text-4xl mb-3">📬</div>
            <p className="text-sm">Aún no hay peticiones enviadas</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
              <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Peticiones recibidas</span>
              <span className="text-xs text-gray-400">{sorted.length} total</span>
            </div>
            <div className="divide-y divide-gray-100">
              {sorted.map(req => {
                const color = getProjectColor(req.proyecto)
                const d = req.fecha instanceof Date ? req.fecha : new Date()
                return (
                  <div key={req.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group">
                    {/* Date */}
                    <div className="w-10 text-center flex-shrink-0">
                      <div className="text-[10px] font-bold text-gray-400 leading-none">{DAYS_ES[d.getDay()].slice(0, 3).toUpperCase()}</div>
                      <div className="text-base font-black text-gray-800 leading-tight">{d.getDate()}</div>
                      <div className="text-[10px] text-gray-400 leading-none">{MONTHS_ES[d.getMonth()].slice(0, 3)}</div>
                    </div>

                    <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: color.dot }} />

                    <div className="px-2.5 py-0.5 rounded-full text-xs font-bold flex-shrink-0 hidden sm:block"
                      style={{ backgroundColor: color.bg, color: color.text }}>
                      {req.proyecto}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-800 truncate">{req.titulo}</div>
                      <div className="text-xs text-gray-400 truncate flex items-center gap-1.5 mt-0.5">
                        {req.canal && <span className="font-medium text-gray-500">{req.canal}</span>}
                        {req.canal && req.solicitante && <span>·</span>}
                        {req.solicitante && <span>por {req.solicitante}</span>}
                      </div>
                    </div>

                    <StatusBadge estado={req.estado} />

                    <button
                      onClick={() => setEditingReq(req)}
                      className="flex-shrink-0 w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
                      title="Editar"
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M8.5 1.5a1.5 1.5 0 0 1 2 2L4 10H2v-2L8.5 1.5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
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
