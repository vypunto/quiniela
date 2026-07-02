import { useState, useEffect, useMemo } from 'react'
import RequestForm from './RequestForm'
import { getProjectColor } from '../utils/colors'
import { DAYS_ES, MONTHS_ES } from '../utils/dateUtils'
import { parseDate } from '../utils/dateUtils'
import PublicationModal from './PublicationModal'
import { fetchRequestsData } from '../utils/googleSheets'
import { REQUESTS_SHEET_URL } from '../config'

const STATUS_STYLES = {
  'Pendiente':   { bg: '#FFF3CC', text: '#7A5500', dot: '#FFBE00' },
  'En revisión': { bg: '#E0F0FF', text: '#00428A', dot: '#0077FF' },
  'Aprobado':    { bg: '#CCFFE0', text: '#006622', dot: '#00CC44' },
  'Rechazado':   { bg: '#FFD6D6', text: '#AA0000', dot: '#FF2200' },
}

function StatusBadge({ estado }) {
  const s = STATUS_STYLES[estado] || STATUS_STYLES['Pendiente']
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0"
      style={{ backgroundColor: s.bg, color: s.text }}>
      {estado || 'Pendiente'}
    </span>
  )
}

const DEMO_REQUESTS = [
  { id: 'r0', proyecto: 'gastro league', fecha: new Date(), titulo: 'Post inauguración menú de verano', info: 'Queremos anunciar el nuevo menú con foco en productos locales y de temporada.', solicitante: 'Carlos M.', estado: 'Aprobado', tipo: 'imagen' },
  { id: 'r1', proyecto: 'teatro alicante', fecha: new Date(new Date().setDate(new Date().getDate() + 5)), titulo: 'Vídeo promocional obra de julio', info: 'Vídeo corto para redes sobre la obra de este mes. Tono emotivo.', solicitante: 'Ana P.', estado: 'En revisión', tipo: 'video' },
  { id: 'r2', proyecto: 'sevilla', fecha: new Date(new Date().setDate(new Date().getDate() + 10)), titulo: 'Post ruta turística especial verano', info: 'Ruta temática por el Albaicín. Queremos llegar a turistas nacionales.', solicitante: 'Pedro L.', estado: 'Pendiente', tipo: 'imagen' },
  { id: 'r3', proyecto: 'prevenidos y accion', fecha: new Date(new Date().setDate(new Date().getDate() + 15)), titulo: 'Infografía prevención verano', info: 'Medidas de seguridad en la playa. Estilo visual limpio, colores claros.', solicitante: 'María G.', estado: 'Pendiente', tipo: 'imagen' },
]

export default function RequestsView({ config, isDemo }) {
  const [requests, setRequests] = useState([])
  const [selected, setSelected] = useState(null)
  const [loadingSheet, setLoadingSheet] = useState(false)

  const projects = useMemo(() => {
    const set = new Set(requests.map(r => r.proyecto).filter(Boolean))
    return Array.from(set).sort()
  }, [requests])

  const loadRequests = async () => {
    if (isDemo) {
      setRequests(DEMO_REQUESTS)
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
        setRequests([...sheetData, ...localOnly].sort((a, b) => (a.fecha || 0) - (b.fecha || 0)))
      } catch {
        setRequests(local)
      } finally {
        setLoadingSheet(false)
      }
    } else {
      setRequests(local)
    }
  }

  useEffect(() => { loadRequests() }, [isDemo])

  const handleSubmitted = () => { loadRequests() }

  const sorted = [...requests].sort((a, b) => (a.fecha || 0) - (b.fecha || 0))

  const adaptedSelected = selected ? {
    ...selected,
    copy: selected.info,
    media: selected.contenido || '',
  } : null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-5">
      {/* Form */}
      <div className="lg:col-span-1">
        <RequestForm
          projects={projects}
          scriptUrl={config.requestsScriptUrl}
          onSubmitted={handleSubmitted}
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
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Peticiones recibidas</span>
              <span className="text-xs text-gray-400">{sorted.length} total</span>
            </div>
            <div className="divide-y divide-gray-100">
              {sorted.map(req => {
                const color = getProjectColor(req.proyecto)
                const d = req.fecha instanceof Date ? req.fecha : new Date()
                return (
                  <button
                    key={req.id}
                    onClick={() => setSelected(req)}
                    className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group"
                  >
                    {/* Date */}
                    <div className="w-10 text-center flex-shrink-0">
                      <div className="text-xs text-gray-400 leading-none">{DAYS_ES[d.getDay()].slice(0,3).toUpperCase()}</div>
                      <div className="text-base font-bold text-gray-800 leading-tight">{d.getDate()}</div>
                      <div className="text-xs text-gray-400 leading-none">{MONTHS_ES[d.getMonth()].slice(0,3)}</div>
                    </div>

                    <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: color.dot }} />

                    <div
                      className="px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 hidden sm:block"
                      style={{ backgroundColor: color.bg, color: color.text }}
                    >
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

                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0 text-gray-300 group-hover:text-gray-500">
                      <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {adaptedSelected && (
        <PublicationModal publication={adaptedSelected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
