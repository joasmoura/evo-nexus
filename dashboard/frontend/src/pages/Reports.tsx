import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { FileText, Search, Filter, LayoutGrid } from 'lucide-react'
import { api } from '../lib/api'
import Markdown from '../components/Markdown'

interface Report {
  title: string
  name?: string
  path: string
  date: string
  area: string
  type: string
  extension: string
}

// --- Area color mapping (same as Overview.tsx) ---
const AREA_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Operations': { bg: 'rgba(34,211,238,0.10)', text: '#22D3EE', border: 'rgba(34,211,238,0.25)' },
  'Finance': { bg: 'rgba(52,211,153,0.10)', text: '#34D399', border: 'rgba(52,211,153,0.25)' },
  'Projects': { bg: 'rgba(96,165,250,0.10)', text: '#60A5FA', border: 'rgba(96,165,250,0.25)' },
  'Community': { bg: 'rgba(251,191,36,0.10)', text: '#FBBF24', border: 'rgba(251,191,36,0.25)' },
  'Social': { bg: 'rgba(168,85,247,0.10)', text: '#A855F7', border: 'rgba(168,85,247,0.25)' },
  'Strategy': { bg: 'rgba(244,114,182,0.10)', text: '#F472B6', border: 'rgba(244,114,182,0.25)' },
  'Health': { bg: 'rgba(251,113,133,0.10)', text: '#FB7185', border: 'rgba(251,113,133,0.25)' },
  'Licensing': { bg: 'rgba(45,212,191,0.10)', text: '#2DD4BF', border: 'rgba(45,212,191,0.25)' },
}

function getAreaStyle(area: string) {
  const key = Object.keys(AREA_COLORS).find((k) => area.toLowerCase().includes(k.toLowerCase()))
  return key ? AREA_COLORS[key] : { bg: 'rgba(0,255,167,0.08)', text: '#00FFA7', border: 'rgba(0,255,167,0.20)' }
}

// --- Relative time helper ---
function relativeTime(dateStr: string): string {
  if (!dateStr) return ''
  try {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    if (diffMin < 1) return 'just now'
    if (diffMin < 60) return `${diffMin}m ago`
    const diffHr = Math.floor(diffMin / 60)
    if (diffHr < 24) return `${diffHr}h ago`
    const diffDay = Math.floor(diffHr / 24)
    if (diffDay < 7) return `${diffDay}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return dateStr
  }
}

export default function Reports() {
  const { path } = useParams()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedContent, setSelectedContent] = useState<string | null>(null)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [areaFilter, setAreaFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/reports')
      .then((data) => setReports((data || []).map((r: any) => ({ ...r, title: r.title || r.name || r.path?.split('/').pop() || 'Untitled' }))))
      .catch(() => setReports([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (path) {
      api.getRaw(`/reports/${path}`)
        .then(setSelectedContent)
        .catch(() => setSelectedContent('Failed to load report'))
      const report = reports.find((r) => r.path === decodeURIComponent(path))
      if (report) setSelectedReport(report)
    } else {
      setSelectedContent(null)
      setSelectedReport(null)
    }
  }, [path, reports])

  const areas = [...new Set(reports.map((r) => r.area))].filter(Boolean)
  const types = [...new Set(reports.map((r) => r.type))].filter(Boolean)

  const filtered = reports.filter((r) => {
    if (areaFilter && r.area !== areaFilter) return false
    if (typeFilter && r.type !== typeFilter) return false
    if (search && !r.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  if (selectedContent && selectedReport) {
    const isHtml = selectedReport.extension === '.html' || selectedReport.extension === 'html' || selectedReport.path?.endsWith('.html')
    const areaStyle = getAreaStyle(selectedReport.area)
    return (
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-6">
          <button
            onClick={() => window.history.back()}
            className="text-[#00FFA7] text-sm hover:underline mb-4 inline-flex items-center gap-1 transition-colors"
          >
            &larr; Back to reports
          </button>
          <h1 className="text-2xl font-bold text-[#e6edf3] tracking-tight">{selectedReport.title}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-sm text-[#667085]">{relativeTime(selectedReport.date)}</span>
            <span
              className="text-[10px] font-medium px-2 py-0.5 rounded-full border"
              style={{
                backgroundColor: areaStyle.bg,
                color: areaStyle.text,
                borderColor: areaStyle.border,
              }}
            >
              {selectedReport.area}
            </span>
          </div>
        </div>
        <div className="bg-[#161b22] border border-[#21262d] rounded-2xl p-6">
          {isHtml ? (
            <iframe
              srcDoc={selectedContent}
              className="w-full rounded-lg border-0"
              style={{ height: 'calc(100vh - 200px)', minHeight: '700px' }}
              title={selectedReport.title}
            />
          ) : (
            <div className="markdown-content">
              <Markdown>{selectedContent}</Markdown>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#e6edf3] tracking-tight">Reports</h1>
        <p className="text-[#667085] text-sm mt-1">Browse generated reports</p>

        {/* Stats bar */}
        {!loading && (
          <div className="mt-4 flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-5 h-5 rounded bg-[#00FFA7]/10">
                <LayoutGrid size={12} className="text-[#00FFA7]" />
              </div>
              <span className="text-[#8b949e]">
                <span className="font-medium text-[#e6edf3]">{filtered.length}</span> of {reports.length} reports
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-5 h-5 rounded bg-[#00FFA7]/10">
                <Filter size={12} className="text-[#00FFA7]" />
              </div>
              <span className="text-[#8b949e]">
                <span className="font-medium text-[#e6edf3]">{areas.length}</span> areas
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#667085]" />
          <input
            type="text"
            placeholder="Search reports..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#161b22] border border-[#21262d] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#e6edf3] placeholder-[#667085] focus:outline-none focus:border-[#00FFA7]/50 focus:shadow-[0_0_12px_rgba(0,255,167,0.08)] transition-all"
          />
        </div>
        <select
          value={areaFilter}
          onChange={(e) => setAreaFilter(e.target.value)}
          className="bg-[#161b22] border border-[#21262d] rounded-xl px-4 py-2.5 text-sm text-[#8b949e] focus:outline-none focus:border-[#00FFA7]/50 transition-all"
        >
          <option value="">All Areas</option>
          {areas.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-[#161b22] border border-[#21262d] rounded-xl px-4 py-2.5 text-sm text-[#8b949e] focus:outline-none focus:border-[#00FFA7]/50 transition-all"
        >
          <option value="">All Types</option>
          {types.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Report Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-[#21262d] bg-[#161b22] p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="h-9 w-9 rounded-xl bg-[#21262d] animate-pulse" />
                <div className="h-5 w-12 rounded-full bg-[#21262d] animate-pulse" />
              </div>
              <div className="h-4 w-3/4 rounded bg-[#21262d] animate-pulse mb-2" />
              <div className="h-3 w-1/3 rounded bg-[#21262d] animate-pulse mb-3" />
              <div className="h-5 w-20 rounded-full bg-[#21262d] animate-pulse" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#161b22] border border-[#21262d]">
            <FileText size={32} className="text-[#3F3F46]" />
          </div>
          <p className="text-[#667085] text-lg">No reports found</p>
          <p className="text-[#3F3F46] text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r, i) => {
            const areaStyle = getAreaStyle(r.area)
            return (
              <a
                key={i}
                href={`/reports/${encodeURIComponent(r.path)}`}
                className="group relative bg-[#161b22] border border-[#21262d] rounded-2xl p-5 transition-all duration-300 hover:border-transparent block"
              >
                {/* Hover glow */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    boxShadow: `inset 0 0 0 1px ${areaStyle.text}44, 0 0 20px ${areaStyle.bg}`,
                    borderRadius: 'inherit',
                  }}
                />

                {/* Top gradient accent */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00FFA7]/20 to-transparent rounded-t-2xl" />

                <div className="relative flex items-start justify-between mb-3">
                  <div
                    className="flex items-center justify-center w-9 h-9 rounded-xl transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: areaStyle.bg }}
                  >
                    <FileText size={16} style={{ color: areaStyle.text }} />
                  </div>
                  <span
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full border uppercase"
                    style={{
                      backgroundColor: 'rgba(0,255,167,0.08)',
                      color: '#00FFA7',
                      borderColor: 'rgba(0,255,167,0.20)',
                    }}
                  >
                    {r.extension}
                  </span>
                </div>

                <h3 className="relative text-sm font-semibold text-[#e6edf3] group-hover:text-white transition-colors mb-1.5 line-clamp-2">
                  {r.title}
                </h3>
                <p className="relative text-xs text-[#667085] mb-3">{relativeTime(r.date)}</p>
                <span
                  className="relative text-[10px] font-medium px-2 py-0.5 rounded-full border"
                  style={{
                    backgroundColor: areaStyle.bg,
                    color: areaStyle.text,
                    borderColor: areaStyle.border,
                  }}
                >
                  {r.area}
                </span>
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}
