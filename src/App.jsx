import React, { useRef, useCallback, useEffect, useMemo } from 'react'
import { Switch, Route, useLocation } from 'wouter'
import { parseResume }    from './utils/resumeParser'
import { downloadAsPDF }  from './utils/pdfGenerator'
import { GenevaTemplate, StockholmTemplate, TokyoTemplate, NewYorkTemplate, CopenhagenTemplate, TEMPLATES } from './templates'
import ResumeEditor       from './components/ResumeEditor'
import CommandPalette     from './components/CommandPalette'
import AIChatPanel        from './components/AIChatPanel'
import SectionOrderPanel  from './components/SectionOrderPanel'
import Dashboard          from './components/Dashboard'
import { useResumeStore, EMPTY_RESUME } from './store/useResumeStore'

// ── Static constants (never change — defined once at module level) ─────────────

const COLOR_PRESETS = [
  { hex: '#6366f1', light: '#eef2ff',  mid: '#4f46e5', xlight: '#f5f3ff', timeline: '#c7d2fe' },
  { hex: '#1565c0', light: '#dbeafe',  mid: '#1e40af', xlight: '#eff6ff', timeline: '#bfdbfe' },
  { hex: '#0f766e', light: '#ccfbf1',  mid: '#115e59', xlight: '#f0fdfa', timeline: '#99f6e4' },
  { hex: '#7c3aed', light: '#ede9fe',  mid: '#5b21b6', xlight: '#f5f3ff', timeline: '#ddd6fe' },
  { hex: '#15803d', light: '#dcfce7',  mid: '#166534', xlight: '#f0fdf4', timeline: '#bbf7d0' },
  { hex: '#be123c', light: '#ffe4e6',  mid: '#9f1239', xlight: '#fff1f2', timeline: '#fecdd3' },
  { hex: '#c2410c', light: '#ffedd5',  mid: '#9a3412', xlight: '#fff7ed', timeline: '#fed7aa' },
  { hex: '#334155', light: '#f1f5f9',  mid: '#1e293b', xlight: '#f8fafc', timeline: '#e2e8f0' },
]

const FONT_OPTIONS = [
  { id: 'inter',        label: 'Inter',    family: "'Inter', sans-serif" },
  { id: 'roboto',       label: 'Roboto',   family: "'Roboto', sans-serif" },
  { id: 'lato',         label: 'Lato',     family: "'Lato', sans-serif" },
  { id: 'georgia',      label: 'Georgia',  family: "Georgia, serif" },
  { id: 'playfair',     label: 'Playfair', family: "'Playfair Display', serif" },
  { id: 'merriweather', label: 'Merri.',   family: "'Merriweather', serif" },
]

export const EDITOR_SECTIONS = [
  { id: 'personal',       label: 'Contact Info',    icon: '👤', color: '#6366f1' },
  { id: 'summary',        label: 'Summary',         icon: '≡',  color: '#0ea5e9' },
  { id: 'experience',     label: 'Work Experience', icon: '💼', color: '#f59e0b' },
  { id: 'education',      label: 'Education',       icon: '🎓', color: '#10b981' },
  { id: 'skills',         label: 'Skills',          icon: '⚡', color: '#8b5cf6' },
  { id: 'projects',       label: 'Projects',        icon: '◈',  color: '#f43f5e' },
  { id: 'certifications', label: 'Certifications',  icon: '✦',  color: '#06b6d4' },
  { id: 'languages',      label: 'Languages',       icon: '◎',  color: '#84cc16' },
  { id: 'awards',         label: 'Awards',          icon: '★',  color: '#f97316' },
]

const templateComponents = {
  copenhagen: CopenhagenTemplate,
  geneva:     GenevaTemplate,
  stockholm:  StockholmTemplate,
  tokyo:      TokyoTemplate,
  newyork:    NewYorkTemplate,
}

// ── ATS helpers ────────────────────────────────────────────────────────────────

const COMPLETENESS_CHECKS = [
  { key: 'name',       label: 'Full name',     check: d => !!d.name },
  { key: 'title',      label: 'Job title',     check: d => !!d.title },
  { key: 'email',      label: 'Email',         check: d => !!d.email },
  { key: 'phone',      label: 'Phone',         check: d => !!d.phone },
  { key: 'summary',    label: 'Summary (40+)', check: d => (d.summary?.length ?? 0) > 40 },
  { key: 'experience', label: 'Experience',    check: d => (d.experience?.length ?? 0) >= 1 },
  { key: 'education',  label: 'Education',     check: d => (d.education?.length ?? 0) >= 1 },
  { key: 'skills',     label: 'Skills (3+)',   check: d => (d.skills?.length ?? 0) >= 3 },
  { key: 'projects',   label: 'Projects',      check: d => (d.projects?.length ?? 0) >= 1 },
  { key: 'linkedin',   label: 'LinkedIn URL',  check: d => !!d.linkedin },
]

function computeCompleteness(data) {
  const results = COMPLETENESS_CHECKS.map(c => ({ ...c, pass: c.check(data) }))
  const score   = Math.round(results.filter(r => r.pass).length / results.length * 100)
  return { score, results }
}

function sectionHasContent(id, data) {
  if (!data) return false
  if (id === 'personal')       return !!(data.name || data.email || data.phone)
  if (id === 'summary')        return !!(data.summary?.trim())
  if (id === 'experience')     return (data.experience?.length     ?? 0) > 0
  if (id === 'education')      return (data.education?.length      ?? 0) > 0
  if (id === 'skills')         return (data.skills?.length         ?? 0) > 0
  if (id === 'projects')       return (data.projects?.length       ?? 0) > 0
  if (id === 'certifications') return (data.certifications?.length ?? 0) > 0
  if (id === 'languages')      return (data.languages?.length      ?? 0) > 0
  if (id === 'awards')         return (data.awards?.length         ?? 0) > 0
  return false
}

const STOP_WORDS = new Set(['the','and','for','are','with','that','this','from','have','will',
  'your','can','our','all','not','but','what','use','their','they','also','been','has','its',
  'was','were','you','more','who','one','had','him','his','her','she','them','when','then',
  'into','out','about','how','we','an','if','or','as','at','by','in','is','it','of','on',
  'so','to','do','be','me','my','no','us','any','may','should','would','could','some','need',
  'each','other','only','than','both','which','whom','well','work','experience','strong',
  'looking','ability','must','highly','years','year'])

function extractKeywords(jd) {
  const freq = {}
  jd.toLowerCase().replace(/[^a-z0-9+#.\s]/g,' ').split(/\s+/)
    .filter(w => w.length >= 3 && !STOP_WORDS.has(w))
    .forEach(w => { freq[w] = (freq[w] || 0) + 1 })
  return Object.entries(freq).sort((a,b) => b[1]-a[1]).slice(0,28).map(([w]) => w)
}

function kwFound(kw, data) {
  return JSON.stringify(data).toLowerCase().includes(kw.toLowerCase())
}

function exportAsJSONResume(data) {
  const out = {
    $schema: 'https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json',
    basics: {
      name: data.name||'', label: data.title||'', email: data.email||'', phone: data.phone||'',
      url: data.website||'', summary: data.summary||'',
      location: { address: data.location||'' },
      profiles: [
        data.linkedin && { network:'LinkedIn', url: data.linkedin },
        data.github   && { network:'GitHub',   url: data.github },
      ].filter(Boolean),
    },
    work: (data.experience||[]).map(e => ({
      name: e.company||'', position: e.title||'', location: e.location||'',
      startDate: e.dates?.split(/[-–to]+/)?.[0]?.trim()||'',
      endDate:   e.dates?.split(/[-–to]+/)?.[1]?.trim()||'',
      highlights: e.bullets||[],
    })),
    education: (data.education||[]).map(e => ({
      institution: e.school||'', area: e.degree||'', endDate: e.year||'', courses: e.details||[],
    })),
    skills: (data.skills||[]).map(s => ({ name:s, keywords:[] })),
    projects: (data.projects||[]).map(p => ({
      name: p.name||'', description: (p.bullets||[]).join(' '),
      keywords: p.tech ? p.tech.split(',').map(t=>t.trim()) : [], url: p.link||'',
    })),
    certificates: (data.certifications||[]).map(c => ({ name:c.name||'', issuer:c.issuer||'', date:c.year||'' })),
    languages: (data.languages||[]).map(l => ({ language:l, fluency:'' })),
  }
  const blob = new Blob([JSON.stringify(out,null,2)], { type:'application/json' })
  const url  = URL.createObjectURL(blob)
  Object.assign(document.createElement('a'), {
    href: url,
    download: `${(data.name||'resume').replace(/\s+/g,'-').toLowerCase()}-resume.json`,
  }).click()
  URL.revokeObjectURL(url)
}

// ── Sample data ────────────────────────────────────────────────────────────────

const SAMPLE_TEXT = `John Doe
Senior Software Engineer

john.doe@email.com | (555) 123-4567 | San Francisco, CA | linkedin.com/in/johndoe | github.com/johndoe

[Summary]
Results-driven software engineer with 8+ years of experience building scalable web applications and distributed systems. Passionate about clean architecture, team mentorship, and delivering high-impact products.

[Experience]

Senior Software Engineer | Google | San Francisco, CA | June 2020 - Present
- Led re-architecture of core search indexing pipeline, reducing query latency by 40%
- Mentored team of 6 junior engineers, conducting weekly code reviews and design sessions
- Drove adoption of gRPC microservices, cutting inter-service communication overhead by 30%

Software Engineer | Meta | Menlo Park, CA | January 2017 - May 2020
- Built real-time bidding engine for Facebook Ads, contributing $8M in additional annual revenue
- Developed reusable React component library adopted by 12 frontend teams

[Education]

B.S. Computer Science | Stanford University | 2016
- GPA: 3.8 / 4.0

[Skills]
JavaScript, TypeScript, React, Node.js, Python, Go, GraphQL, gRPC, PostgreSQL, Redis, AWS, Docker, Kubernetes

[Certifications]
AWS Certified Solutions Architect – Professional | Amazon | 2022
Google Cloud Professional Data Engineer | Google | 2021

[Languages]
English (Native), Spanish (Conversational)

[Projects]

OpenSearch Contrib | github.com/opensearch | TypeScript, React
- Contributed 30+ PRs improving query builder UI performance by 25%
- Implemented custom tokenizer plugin used by 500+ enterprise deployments

DevFlow CLI | github.com/johndoe/devflow | Go, Bash
- Built developer productivity tool with 2,000+ GitHub stars

[Awards]
Google Spot Bonus — Exceptional performance on Search Infrastructure (2022)
Stanford CS Department Award for Outstanding Senior Thesis (2016)
`

// ── Root: just the router shell ────────────────────────────────────────────────

export default function App() {
  return (
    <Switch>
      <Route path="/"       component={DashboardView} />
      <Route path="/editor" component={EditorView}    />
      {/* Fallback: anything unknown goes to dashboard */}
      <Route component={DashboardView} />
    </Switch>
  )
}

// ── Dashboard view ─────────────────────────────────────────────────────────────

function DashboardView() {
  const [, navigate]      = useLocation()
  const loadNewResume     = useResumeStore(s => s.loadNewResume)
  const loadParsedResume  = useResumeStore(s => s.loadParsedResume)

  const handleNew = () => {
    loadNewResume()
    navigate('/editor')
  }

  const handleLoadSample = () => {
    const parsed = parseResume(SAMPLE_TEXT)
    loadParsedResume(parsed)
    navigate('/editor')
  }

  return <Dashboard onNew={handleNew} onLoadSample={handleLoadSample} />
}

// ── Editor view ────────────────────────────────────────────────────────────────

function EditorView() {
  const [, navigate] = useLocation()

  // ── Store reads ────────────────────────────────────────────────────────────
  const resumeData         = useResumeStore(s => s.resumeData)
  const photo              = useResumeStore(s => s.photo)
  const resumeName         = useResumeStore(s => s.resumeName)
  const selectedTemplate   = useResumeStore(s => s.selectedTemplate)
  const theme              = useResumeStore(s => s.theme)
  const sectionOrder       = useResumeStore(s => s.sectionOrder)
  const activeSection      = useResumeStore(s => s.activeSection)
  const showTemplatePicker = useResumeStore(s => s.showTemplatePicker)
  const showATSPanel       = useResumeStore(s => s.showATSPanel)
  const showCP             = useResumeStore(s => s.showCP)
  const showAIChat         = useResumeStore(s => s.showAIChat)
  const showRawJSON        = useResumeStore(s => s.showRawJSON)
  const showSectionOrder   = useResumeStore(s => s.showSectionOrder)
  const isDownloading      = useResumeStore(s => s.isDownloading)
  const numPages           = useResumeStore(s => s.numPages)
  const previewZoom        = useResumeStore(s => s.previewZoom)
  const jobDescription     = useResumeStore(s => s.jobDescription)

  // ── Store actions (stable references — safe outside useMemo/useCallback) ──
  const loadNewResume      = useResumeStore(s => s.loadNewResume)
  const loadParsedResume   = useResumeStore(s => s.loadParsedResume)
  const setResumeName      = useResumeStore(s => s.setResumeName)
  const setSelectedTemplate= useResumeStore(s => s.setSelectedTemplate)
  const setTheme           = useResumeStore(s => s.setTheme)
  const moveSection        = useResumeStore(s => s.moveSection)
  const setActiveSection   = useResumeStore(s => s.setActiveSection)
  const setShowTemplatePicker = useResumeStore(s => s.setShowTemplatePicker)
  const toggleATSPanel     = useResumeStore(s => s.toggleATSPanel)
  const toggleCP           = useResumeStore(s => s.toggleCP)
  const setShowCP          = useResumeStore(s => s.setShowCP)
  const setShowAIChat      = useResumeStore(s => s.setShowAIChat)
  const toggleRawJSON      = useResumeStore(s => s.toggleRawJSON)
  const setShowRawJSON     = useResumeStore(s => s.setShowRawJSON)
  const setShowSectionOrder= useResumeStore(s => s.setShowSectionOrder)
  const setIsDownloading   = useResumeStore(s => s.setIsDownloading)
  const setNumPages        = useResumeStore(s => s.setNumPages)
  const setPreviewZoom     = useResumeStore(s => s.setPreviewZoom)
  const setJobDescription  = useResumeStore(s => s.setJobDescription)

  const fileInputRef = useRef(null)
  const previewRef   = useRef(null)

  // ── Derived values ─────────────────────────────────────────────────────────
  const TemplateComponent = templateComponents[selectedTemplate]
  const activeTheme = {
    ...COLOR_PRESETS[theme.colorIdx],
    font: FONT_OPTIONS.find(f => f.id === theme.fontId)?.family || "'Inter', sans-serif",
  }
  const completeness = resumeData ? computeCompleteness(resumeData) : null
  const jdKeywords   = jobDescription.trim().length > 20 ? extractKeywords(jobDescription) : []
  const activeSec    = EDITOR_SECTIONS.find(s => s.id === activeSection)

  // ── Zoom ───────────────────────────────────────────────────────────────────
  const zoomIn  = () => setPreviewZoom(z => Math.min(1.2,  parseFloat((z + 0.05).toFixed(2))))
  const zoomOut = () => setPreviewZoom(z => Math.max(0.35, parseFloat((z - 0.05).toFixed(2))))

  // ── numPages observer ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!resumeData) { setNumPages(1); return }
    const measure = () => {
      const el = document.getElementById('resume-template')
      if (el) setNumPages(Math.max(1, Math.ceil(el.scrollHeight / 1122)))
    }
    const el = document.getElementById('resume-template')
    if (!el) { const t = setTimeout(measure, 150); return () => clearTimeout(t) }
    measure()
    const obs = new ResizeObserver(measure)
    obs.observe(el)
    return () => obs.disconnect()
  }, [resumeData, selectedTemplate, theme, sectionOrder])

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    const handler = e => {
      const inInput = ['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault(); toggleCP(); return
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'p') {
        e.preventDefault(); if (resumeData) handleDownload(); return
      }
      if (e.key === 'Escape') {
        if (showRawJSON)        { setShowRawJSON(false);        return }
        if (showCP)             { setShowCP(false);             return }
        if (showTemplatePicker) { setShowTemplatePicker(false); return }
        return
      }
      if (e.key === 'j' && !inInput && !e.metaKey && !e.ctrlKey) {
        if (resumeData) toggleRawJSON()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [resumeData, showCP, showRawJSON, showTemplatePicker])

  // ── File / sample handling ─────────────────────────────────────────────────
  const processFile = useCallback((file) => {
    if (!file || (!file.name.endsWith('.txt') && file.type !== 'text/plain')) return
    const reader = new FileReader()
    reader.onload = e => {
      try {
        const parsed = parseResume(e.target.result)
        loadParsedResume(parsed)
      } catch { /* ignore */ }
    }
    reader.readAsText(file)
  }, [loadParsedResume])

  const handleFileChange = e => { const f = e.target.files?.[0]; if (f) processFile(f) }

  const loadSample = useCallback(() => {
    const parsed = parseResume(SAMPLE_TEXT)
    loadParsedResume(parsed)
  }, [loadParsedResume])

  const handleDownload = useCallback(async () => {
    if (!resumeData) return
    setIsDownloading(true)
    try {
      const safe = (resumeData.name || 'resume').replace(/\s+/g,'-').toLowerCase()
      await downloadAsPDF('resume-template', `${safe}-resume.pdf`)
    } catch { /* ignore */ }
    finally { setIsDownloading(false) }
  }, [resumeData])

  const downloadSampleTxt = () => {
    const blob = new Blob([SAMPLE_TEXT], { type:'text/plain' })
    const url  = URL.createObjectURL(blob)
    Object.assign(document.createElement('a'), { href:url, download:'sample-resume.txt' }).click()
    URL.revokeObjectURL(url)
  }

  // ── Command palette ────────────────────────────────────────────────────────
  // Actions are stable store refs; only badge-state values drive re-computation.
  const paletteCommands = useMemo(() => {
    const cmds = []
    TEMPLATES.forEach(t => cmds.push({
      id: `tpl-${t.id}`, group:'Template', label:`Switch to ${t.name}`, icon:'◻',
      badge: selectedTemplate === t.id ? 'active' : null,
      action: () => { setSelectedTemplate(t.id); setShowCP(false) },
    }))
    COLOR_PRESETS.forEach((c, i) => cmds.push({
      id: `color-${i}`, group:'Color', label:`Accent ${c.hex}`, icon:'⬤', iconColor: c.hex,
      badge: theme.colorIdx === i ? 'active' : null,
      action: () => { setTheme(t => ({...t, colorIdx:i})); setShowCP(false) },
    }))
    FONT_OPTIONS.forEach(f => cmds.push({
      id: `font-${f.id}`, group:'Font', label:`Use ${f.label}`, icon:'Aa', iconFont:f.family,
      badge: theme.fontId === f.id ? 'active' : null,
      action: () => { setTheme(t => ({...t, fontId:f.id})); setShowCP(false) },
    }))
    EDITOR_SECTIONS.forEach(s => cmds.push({
      id: `sec-${s.id}`, group:'Navigate', label:`Go to ${s.label}`, icon:s.icon,
      action: () => { setActiveSection(s.id); setShowCP(false) },
    }))
    cmds.push({ id:'tpl-picker',  group:'View',    label:'Open template picker',    icon:'◻', action:() => { setShowTemplatePicker(true); setShowCP(false) } })
    cmds.push({ id:'ats-panel',   group:'View',    label:'Toggle ATS score panel',  icon:'⚡', action:() => { toggleATSPanel(); setShowCP(false) } })
    cmds.push({ id:'zoom-in',     group:'View',    label:'Zoom in preview',         icon:'+', action:() => { zoomIn();  setShowCP(false) } })
    cmds.push({ id:'zoom-out',    group:'View',    label:'Zoom out preview',        icon:'−', action:() => { zoomOut(); setShowCP(false) } })
    cmds.push({ id:'zoom-fit',    group:'View',    label:'Reset zoom',              icon:'⊡', action:() => { setPreviewZoom(0.75); setShowCP(false) } })
    cmds.push({ id:'load-sample', group:'Actions', label:'Load sample resume',      icon:'◈', action:() => { loadSample(); setShowCP(false) } })
    cmds.push({ id:'dl-sample',   group:'Help',    label:'Download sample .txt',   icon:'↓', action:() => { downloadSampleTxt(); setShowCP(false) } })
    if (resumeData) {
      cmds.push({ id:'pdf',        group:'Actions',   label:'Download PDF',          icon:'↓', shortcut:'⇧⌘P', action:() => { handleDownload(); setShowCP(false) } })
      cmds.push({ id:'json-export',group:'Actions',   label:'Export JSON Resume',    icon:'{}', action:() => { exportAsJSONResume(resumeData); setShowCP(false) } })
      cmds.push({ id:'raw-json',   group:'Developer', label:'View raw JSON',         icon:'</>', shortcut:'J', action:() => { setShowRawJSON(true); setShowCP(false) } })
      cmds.push({ id:'ai-chat',    group:'AI',        label:'Chat with Resume (AI)', icon:'✦', action:() => { setShowAIChat(true); setShowCP(false) } })
    }
    return cmds
  }, [resumeData, selectedTemplate, theme])   // badge states — actions are stable store refs

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="nv-app">

      {/* Command Palette */}
      {showCP && <CommandPalette commands={paletteCommands} onClose={() => setShowCP(false)} />}

      {/* Raw JSON overlay */}
      {showRawJSON && resumeData && (
        <div className="raw-json-overlay" onClick={() => setShowRawJSON(false)}>
          <div className="raw-json-modal" onClick={e => e.stopPropagation()}>
            <div className="raw-json-header">
              <span className="raw-json-title">
                Parsed Resume JSON
                <span style={{opacity:.45,fontSize:11,fontWeight:400,marginLeft:8}}>— press J or Esc to close</span>
              </span>
              <button className="raw-json-close" onClick={() => setShowRawJSON(false)}>✕</button>
            </div>
            <pre className="raw-json-body">{JSON.stringify(resumeData, null, 2)}</pre>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <header className="nv-topbar">
        <button className="nv-topbar-back btn-icon" onClick={() => navigate('/')} title="Back to home">←</button>
        <div className="nv-topbar-brand">
          <div style={{width:28,height:28,borderRadius:7,background:'var(--brand)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:13,flexShrink:0}}>R</div>
        </div>
        <input
          className="nv-topbar-resume-name"
          value={resumeName}
          onChange={e => setResumeName(e.target.value)}
          placeholder="Resume name…"
        />
        <div className="nv-topbar-actions">
          <button
            className="btn-ghost btn-sm"
            onClick={toggleATSPanel}
            style={showATSPanel ? {background:'var(--brand-light)',color:'var(--brand)'} : {}}
            title="ATS Optimizer"
          >
            ⚡ {completeness ? `${completeness.score}%` : 'ATS'}
          </button>
          <button className="btn-ghost btn-sm" onClick={toggleCP} title="Command Palette (⌘K)">⌘K</button>
          <button className="btn-outline btn-sm" onClick={() => setShowTemplatePicker(true)}>◻ Templates</button>
          {resumeData && (
            <button className="btn-primary btn-sm" onClick={handleDownload} disabled={isDownloading}>
              {isDownloading ? <><span className="spinner" /> Generating…</> : '↓ PDF'}
            </button>
          )}
        </div>
      </header>

      {/* Workspace */}
      <div className="nv-workspace">

        {/* Section Nav Sidebar */}
        <aside className="nv-snav">
          <div className="nv-snav-header">
            <div className="nv-snav-title">Sections</div>
          </div>
          <div className="nv-snav-body">
            {EDITOR_SECTIONS.map(sec => (
              <button
                key={sec.id}
                className={`nv-snav-item ${activeSection === sec.id ? 'active' : ''}`}
                onClick={() => setActiveSection(sec.id)}
              >
                <span className="nv-snav-icon" style={{background:sec.color+'20', color:sec.color}}>
                  {sec.icon}
                </span>
                <span className="nv-snav-label">{sec.label}</span>
                {resumeData && sectionHasContent(sec.id, resumeData) && (
                  <span className="nv-snav-dot" />
                )}
              </button>
            ))}

            <div className="nv-snav-divider" />
            <div className="nv-snav-section-label">Tools</div>

            <button className="nv-snav-item" onClick={() => fileInputRef.current?.click()}>
              <span className="nv-snav-icon" style={{background:'#64748b20',color:'#64748b'}}>↑</span>
              <span className="nv-snav-label">Import .txt</span>
            </button>
            <input ref={fileInputRef} type="file" accept=".txt,text/plain" onChange={handleFileChange} style={{display:'none'}} />

            <button className="nv-snav-item" onClick={loadSample}>
              <span className="nv-snav-icon" style={{background:'#64748b20',color:'#64748b'}}>◈</span>
              <span className="nv-snav-label">Load Sample</span>
            </button>

            {resumeData && (
              <button className="nv-snav-item" onClick={() => exportAsJSONResume(resumeData)}>
                <span className="nv-snav-icon" style={{background:'#64748b20',color:'#64748b'}}>{'{}'}</span>
                <span className="nv-snav-label">Export JSON</span>
              </button>
            )}

            {resumeData && (
              <div style={{padding:'0 10px', marginTop:4}}>
                <button className="so-collapse-btn" onClick={() => setShowSectionOrder(o => !o)}>
                  <span className="so-collapse-icon">{showSectionOrder ? '▾' : '▸'}</span>
                  <span style={{fontSize:12,color:'rgba(255,255,255,0.4)'}}>Section Order</span>
                </button>
                {showSectionOrder && (
                  <SectionOrderPanel sectionOrder={sectionOrder} onMove={moveSection} data={resumeData} />
                )}
              </div>
            )}
          </div>

          {/* Design panel */}
          <div className="nv-design-section">
            <div className="nv-design-label">Color</div>
            <div className="nv-color-swatches">
              {COLOR_PRESETS.map((c, i) => (
                <button
                  key={i}
                  className="nv-color-swatch"
                  style={{
                    background: c.hex,
                    boxShadow: theme.colorIdx === i ? `0 0 0 2px #0f172a, 0 0 0 4px ${c.hex}` : 'none',
                  }}
                  onClick={() => setTheme(t => ({...t, colorIdx:i}))}
                  title={c.hex}
                />
              ))}
            </div>
            <div className="nv-design-label" style={{marginTop:10}}>Font</div>
            <div className="nv-font-pills">
              {FONT_OPTIONS.map(f => (
                <button
                  key={f.id}
                  className={`nv-font-pill ${theme.fontId === f.id ? 'active' : ''}`}
                  style={{fontFamily: f.family}}
                  onClick={() => setTheme(t => ({...t, fontId:f.id}))}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Editor Panel */}
        <div className="nv-editor">
          <div className="nv-editor-header">
            <div className="nv-editor-title">
              {activeSec && (
                <span className="nv-editor-title-icon" style={{background:activeSec.color+'18', color:activeSec.color}}>
                  {activeSec.icon}
                </span>
              )}
              {activeSec?.label}
            </div>
          </div>
          <div className="nv-editor-body">
            {resumeData
              ? <ResumeEditor />
              : (
                <div className="nv-editor-empty">
                  <div className="nv-editor-empty-icon">📝</div>
                  <p>Start building your resume</p>
                  <div style={{display:'flex',flexDirection:'column',gap:8,marginTop:4,width:'100%'}}>
                    <button className="btn-primary" style={{justifyContent:'center'}} onClick={loadNewResume}>
                      Start from scratch
                    </button>
                    <button className="btn-outline" style={{justifyContent:'center'}} onClick={loadSample}>
                      Load sample resume
                    </button>
                  </div>
                </div>
              )
            }
          </div>
        </div>

        {/* Preview */}
        <div className="nv-preview">
          <div className="nv-preview-toolbar">
            <span className="nv-preview-label">
              {TEMPLATES.find(t => t.id === selectedTemplate)?.name}
              {numPages > 1 && <span className="nv-page-badge">{numPages} pages</span>}
            </span>
            <div className="nv-zoom-controls">
              <button className="zoom-btn" onClick={zoomOut} disabled={previewZoom <= 0.35}>−</button>
              <button className="zoom-pct" onClick={() => setPreviewZoom(0.75)}>{Math.round(previewZoom * 100)}%</button>
              <button className="zoom-btn" onClick={zoomIn}  disabled={previewZoom >= 1.2}>+</button>
            </div>
            <button
              className={`btn-ghost btn-sm ai-chat-toggle ${showAIChat ? 'ai-chat-toggle--active' : ''}`}
              onClick={() => setShowAIChat(!showAIChat)}
              title="Chat with Resume AI"
            >
              <span className="ai-sparkle">✦</span> AI
            </button>
          </div>

          <div className="nv-preview-scroll" ref={previewRef}>
            {resumeData ? (
              <div className="pages-scale-wrap" style={{zoom: previewZoom}}>
                <div className="nv-page-stack">
                  {Array.from({length: numPages}, (_, i) => (
                    <React.Fragment key={i}>
                      {i > 0 && <div className="nv-page-sep"><span>Page {i+1}</span></div>}
                      <div className="nv-page-card">
                        <div className="nv-page-clip">
                          <div style={{marginTop:`${-i * 1122}px`}}>
                            <TemplateComponent
                              data={{...resumeData, photo}}
                              theme={activeTheme}
                              sectionOrder={sectionOrder}
                            />
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ) : (
              <div className="nv-preview-empty">
                <div className="nv-preview-empty-icon">📄</div>
                <p>Your resume preview will appear here once you add content</p>
              </div>
            )}
          </div>

          {showAIChat && (
            <div className="ai-panel-wrap">
              <AIChatPanel resumeData={resumeData} onClose={() => setShowAIChat(false)} />
            </div>
          )}
        </div>
      </div>

      {/* Template Picker Modal */}
      {showTemplatePicker && (
        <div className="nv-tpl-overlay" onClick={() => setShowTemplatePicker(false)}>
          <div className="nv-tpl-modal" onClick={e => e.stopPropagation()}>
            <div className="nv-tpl-header">
              <div>
                <h2 style={{fontSize:20,fontWeight:700,color:'var(--text)'}}>Choose a Template</h2>
                <p style={{fontSize:13,color:'var(--muted)',marginTop:4}}>Pick a design that matches your style</p>
              </div>
              <button className="btn-icon" onClick={() => setShowTemplatePicker(false)} style={{fontSize:18,color:'var(--muted)'}}>✕</button>
            </div>
            <div className="nv-tpl-grid">
              {TEMPLATES.map(tpl => (
                <button
                  key={tpl.id}
                  className={`nv-tpl-card ${selectedTemplate === tpl.id ? 'active' : ''}`}
                  onClick={() => { setSelectedTemplate(tpl.id); setShowTemplatePicker(false) }}
                >
                  <div className="nv-tpl-card-preview">
                    <div className="nv-tpl-thumb">
                      <div style={{height:18,background:tpl.accent}} />
                      <div style={{padding:'6px 8px',display:'flex',flexDirection:'column',gap:3}}>
                        <div style={{height:5,background:'#94a3b8',borderRadius:2,width:'65%'}} />
                        <div style={{height:3,background:'#cbd5e1',borderRadius:2,width:'45%'}} />
                        <div style={{height:1,background:'#e2e8f0',margin:'3px 0'}} />
                        <div style={{height:3,background:'#cbd5e1',borderRadius:2,width:'90%'}} />
                        <div style={{height:3,background:'#cbd5e1',borderRadius:2,width:'80%'}} />
                        <div style={{height:3,background:'#cbd5e1',borderRadius:2,width:'70%'}} />
                      </div>
                    </div>
                  </div>
                  <div className="nv-tpl-card-name">{tpl.name}</div>
                  {selectedTemplate === tpl.id && <div className="nv-tpl-card-badge">Active</div>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ATS Panel */}
      <div className={`nv-ats-panel ${showATSPanel ? 'open' : ''}`}>
        <div className="nv-ats-header">
          <div className="nv-ats-title">⚡ ATS Optimizer</div>
          <button className="btn-icon" onClick={toggleATSPanel}>✕</button>
        </div>
        <div className="nv-ats-body">
          {completeness && (
            <>
              <div className="nv-ats-score-ring-wrap">
                <svg width="90" height="90" viewBox="0 0 90 90">
                  <circle cx="45" cy="45" r="38" fill="none" stroke="var(--border)" strokeWidth="7" />
                  <circle
                    cx="45" cy="45" r="38"
                    fill="none"
                    stroke={completeness.score >= 80 ? '#10b981' : completeness.score >= 50 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="7"
                    strokeDasharray={`${2 * Math.PI * 38}`}
                    strokeDashoffset={`${2 * Math.PI * 38 * (1 - completeness.score / 100)}`}
                    strokeLinecap="round"
                    transform="rotate(-90 45 45)"
                  />
                  <text x="45" y="51" textAnchor="middle" fontSize="18" fontWeight="700" fill="var(--text)">
                    {completeness.score}%
                  </text>
                </svg>
              </div>
              <div className="nv-ats-checks">
                {completeness.results.map(r => (
                  <div key={r.key} className={`nv-ats-check ${r.pass ? 'pass' : 'fail'}`}>
                    <span>{r.pass ? '✓' : '✗'}</span>
                    <span>{r.label}</span>
                  </div>
                ))}
              </div>
            </>
          )}
          <div className="nv-ats-jd-section">
            <div className="nv-ats-jd-label">Job Description Keywords</div>
            <textarea
              className="nv-input nv-ats-jd-input"
              rows={5}
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              placeholder="Paste a job description to see which keywords your resume is missing…"
            />
            {jdKeywords.length > 0 && (
              <div className="nv-ats-keywords">
                {jdKeywords.map(kw => (
                  <span key={kw} className={`nv-ats-keyword ${kwFound(kw, resumeData) ? 'found' : 'missing'}`}>
                    {kw}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}
