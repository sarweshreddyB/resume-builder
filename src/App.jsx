import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { parseResume } from './utils/resumeParser'
import { downloadAsPDF } from './utils/pdfGenerator'
import { GenevaTemplate, StockholmTemplate, TokyoTemplate, NewYorkTemplate, CopenhagenTemplate, TEMPLATES } from './templates'
import ResumeEditor from './components/ResumeEditor'
import CommandPalette from './components/CommandPalette'
import AIChatPanel from './components/AIChatPanel'
import SectionOrderPanel from './components/SectionOrderPanel'
import Dashboard from './components/Dashboard'
import { DEFAULT_SECTION_ORDER } from './utils/sectionOrder'

// ── Color / font presets ─────────────────────────────────────────────────────
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

// ── Editor sections metadata ─────────────────────────────────────────────────
const EDITOR_SECTIONS = [
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

// ── ATS completeness checks ─────────────────────────────────────────────────
const COMPLETENESS_CHECKS = [
  { key: 'name',       label: 'Full name',    check: d => !!d.name },
  { key: 'title',      label: 'Job title',    check: d => !!d.title },
  { key: 'email',      label: 'Email',        check: d => !!d.email },
  { key: 'phone',      label: 'Phone',        check: d => !!d.phone },
  { key: 'summary',    label: 'Summary (40+)',check: d => (d.summary?.length ?? 0) > 40 },
  { key: 'experience', label: 'Experience',   check: d => (d.experience?.length ?? 0) >= 1 },
  { key: 'education',  label: 'Education',    check: d => (d.education?.length ?? 0) >= 1 },
  { key: 'skills',     label: 'Skills (3+)',  check: d => (d.skills?.length ?? 0) >= 3 },
  { key: 'projects',   label: 'Projects',     check: d => (d.projects?.length ?? 0) >= 1 },
  { key: 'linkedin',   label: 'LinkedIn URL', check: d => !!d.linkedin },
]

function computeCompleteness(data) {
  const results = COMPLETENESS_CHECKS.map(c => ({ ...c, pass: c.check(data) }))
  const score   = Math.round(results.filter(r => r.pass).length / results.length * 100)
  return { score, results }
}

function sectionHasContent(sectionId, data) {
  if (!data) return false
  if (sectionId === 'personal')       return !!(data.name || data.email || data.phone)
  if (sectionId === 'summary')        return !!(data.summary?.trim())
  if (sectionId === 'experience')     return (data.experience?.length     ?? 0) > 0
  if (sectionId === 'education')      return (data.education?.length      ?? 0) > 0
  if (sectionId === 'skills')         return (data.skills?.length         ?? 0) > 0
  if (sectionId === 'projects')       return (data.projects?.length       ?? 0) > 0
  if (sectionId === 'certifications') return (data.certifications?.length ?? 0) > 0
  if (sectionId === 'languages')      return (data.languages?.length      ?? 0) > 0
  if (sectionId === 'awards')         return (data.awards?.length         ?? 0) > 0
  return false
}

// ── ATS keyword helpers ─────────────────────────────────────────────────────
const STOP_WORDS = new Set(['the','and','for','are','with','that','this','from','have','will','your','can','our','all','not','but','what','use','their','they','also','been','has','its','was','were','you','more','who','one','had','him','his','her','she','them','when','then','into','out','about','how','we','an','if','or','as','at','by','in','is','it','of','on','so','to','do','be','me','my','no','us','any','may','should','would','could','some','need','each','other','only','than','both','which','who','whom','well','work','experience','strong','looking','ability','must','highly','years','year'])

function extractKeywords(jd) {
  const freq = {}
  jd.toLowerCase()
    .replace(/[^a-z0-9+#.\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 3 && !STOP_WORDS.has(w))
    .forEach(w => { freq[w] = (freq[w] || 0) + 1 })
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 28)
    .map(([w]) => w)
}

function kwFound(kw, data) {
  return JSON.stringify(data).toLowerCase().includes(kw.toLowerCase())
}

// ── JSON Resume export ──────────────────────────────────────────────────────
function exportAsJSONResume(data) {
  const out = {
    $schema: 'https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json',
    basics: {
      name: data.name || '', label: data.title || '',
      email: data.email || '', phone: data.phone || '',
      url: data.website || '', summary: data.summary || '',
      location: { address: data.location || '' },
      profiles: [
        data.linkedin && { network: 'LinkedIn', url: data.linkedin },
        data.github   && { network: 'GitHub',   url: data.github },
      ].filter(Boolean),
    },
    work: (data.experience || []).map(e => ({
      name: e.company || '', position: e.title || '', location: e.location || '',
      startDate: e.dates?.split(/[-–to]+/)?.[0]?.trim() || '',
      endDate:   e.dates?.split(/[-–to]+/)?.[1]?.trim() || '',
      highlights: e.bullets || [],
    })),
    education: (data.education || []).map(e => ({
      institution: e.school || '', area: e.degree || '', endDate: e.year || '', courses: e.details || [],
    })),
    skills: (data.skills || []).map(s => ({ name: s, keywords: [] })),
    projects: (data.projects || []).map(p => ({
      name: p.name || '', description: (p.bullets || []).join(' '),
      keywords: p.tech ? p.tech.split(',').map(t => t.trim()) : [], url: p.link || '',
    })),
    certificates: (data.certifications || []).map(c => ({ name: c.name || '', issuer: c.issuer || '', date: c.year || '' })),
    languages: (data.languages || []).map(l => ({ language: l, fluency: '' })),
  }
  const blob = new Blob([JSON.stringify(out, null, 2)], { type: 'application/json' })
  const url  = URL.createObjectURL(blob)
  const a = Object.assign(document.createElement('a'), { href: url, download: `${(data.name||'resume').replace(/\s+/g,'-').toLowerCase()}-resume.json` })
  a.click()
  URL.revokeObjectURL(url)
}

// ── Template component map ──────────────────────────────────────────────────
const templateComponents = {
  copenhagen: CopenhagenTemplate,
  geneva:     GenevaTemplate,
  stockholm:  StockholmTemplate,
  tokyo:      TokyoTemplate,
  newyork:    NewYorkTemplate,
}

const EMPTY_RESUME = {
  name:'', title:'', email:'', phone:'', location:'', linkedin:'', github:'', website:'',
  summary:'', experience:[], education:[], skills:[], skillLevels:{}, tools:[],
  projects:[], certifications:[], languages:[], awards:[],
}

const SAMPLE_RESUME = `John Doe
Senior Software Engineer

john.doe@email.com | (555) 123-4567 | San Francisco, CA | linkedin.com/in/johndoe | github.com/johndoe

[Summary]
Results-driven software engineer with 8+ years of experience building scalable web applications and distributed systems. Passionate about clean architecture, team mentorship, and delivering high-impact products. Proven track record of reducing latency, increasing reliability, and leading cross-functional engineering teams.

[Experience]

Senior Software Engineer | Google | San Francisco, CA | June 2020 - Present
- Led re-architecture of core search indexing pipeline, reducing query latency by 40%
- Mentored team of 6 junior engineers, conducting weekly code reviews and design sessions
- Drove adoption of gRPC microservices, cutting inter-service communication overhead by 30%
- Collaborated with product and ML teams to ship 3 major features to 200M+ users

Software Engineer | Meta | Menlo Park, CA | January 2017 - May 2020
- Built real-time bidding engine for Facebook Ads, contributing $8M in additional annual revenue
- Developed reusable React component library adopted by 12 frontend teams
- Reduced CI/CD pipeline runtime from 45 minutes to 12 minutes through build system optimizations

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

// ════════════════════════════════════════════════════════════════
export default function App() {
  // ── View state ─────────────────────────────────────────────
  const [view,       setView]       = useState('dashboard')  // 'dashboard' | 'editor'
  const [resumeName, setResumeName] = useState('My Resume')

  // ── Resume data ─────────────────────────────────────────────
  const [resumeData,       setResumeData]       = useState(null)
  const [photo,            setPhoto]            = useState(null)  // base64

  // ── Template / theme ────────────────────────────────────────
  const [selectedTemplate, setSelectedTemplate] = useState('copenhagen')
  const [theme,            setTheme]            = useState({ colorIdx: 0, fontId: 'inter' })
  const [sectionOrder,     setSectionOrder]     = useState(DEFAULT_SECTION_ORDER)

  // ── UI state ────────────────────────────────────────────────
  const [activeSection,    setActiveSection]    = useState('personal')
  const [showTemplatePicker, setShowTemplatePicker] = useState(false)
  const [showATSPanel,     setShowATSPanel]     = useState(false)
  const [showCP,           setShowCP]           = useState(false)
  const [showAIChat,       setShowAIChat]       = useState(false)
  const [showRawJSON,      setShowRawJSON]      = useState(false)
  const [showSectionOrder, setShowSectionOrder] = useState(false)
  const [isDownloading,    setIsDownloading]    = useState(false)
  const [numPages,         setNumPages]         = useState(1)
  const [previewZoom,      setPreviewZoom]      = useState(0.75)
  const [jobDescription,   setJobDescription]   = useState('')

  const fileInputRef = useRef(null)
  const previewRef   = useRef(null)

  // ── Derived ─────────────────────────────────────────────────
  const TemplateComponent = templateComponents[selectedTemplate]
  const activeTheme = {
    ...COLOR_PRESETS[theme.colorIdx],
    font: FONT_OPTIONS.find(f => f.id === theme.fontId)?.family || "'Inter', sans-serif",
  }
  const completeness = resumeData ? computeCompleteness(resumeData) : null
  const jdKeywords   = jobDescription.trim().length > 20 ? extractKeywords(jobDescription) : []

  // ── Zoom ────────────────────────────────────────────────────
  const zoomIn  = () => setPreviewZoom(z => Math.min(1.2,  parseFloat((z + 0.05).toFixed(2))))
  const zoomOut = () => setPreviewZoom(z => Math.max(0.35, parseFloat((z - 0.05).toFixed(2))))

  // ── Section order ────────────────────────────────────────────
  const moveSection = useCallback((key, dir) => {
    setSectionOrder(prev => {
      const idx = prev.indexOf(key)
      if (idx === -1) return prev
      const next = idx + dir
      if (next < 0 || next >= prev.length) return prev
      const arr = [...prev];
      [arr[idx], arr[next]] = [arr[next], arr[idx]]
      return arr
    })
  }, [])

  // ── numPages observer ────────────────────────────────────────
  useEffect(() => {
    if (!resumeData) { setNumPages(1); return }
    const measure = () => {
      const el = document.getElementById('resume-template')
      if (el) setNumPages(Math.max(1, Math.ceil(el.scrollHeight / 1122)))
    }
    const el = document.getElementById('resume-template')
    if (!el) { setTimeout(measure, 150); return }
    measure()
    const obs = new ResizeObserver(measure)
    obs.observe(el)
    return () => obs.disconnect()
  }, [resumeData, selectedTemplate, theme, sectionOrder])

  // ── Keyboard shortcuts ───────────────────────────────────────
  useEffect(() => {
    if (view !== 'editor') return
    const handler = e => {
      const inInput = ['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault(); setShowCP(o => !o); return
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'p') {
        e.preventDefault(); if (resumeData) handleDownload(); return
      }
      if (e.key === 'Escape') {
        if (showRawJSON) { setShowRawJSON(false); return }
        if (showCP)      { setShowCP(false);       return }
        if (showTemplatePicker) { setShowTemplatePicker(false); return }
        return
      }
      if (e.key === 'j' && !inInput && !e.metaKey && !e.ctrlKey) {
        if (resumeData) setShowRawJSON(o => !o); return
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [view, resumeData, showCP, showRawJSON, showTemplatePicker])

  // ── File handling ────────────────────────────────────────────
  const processFile = useCallback((file) => {
    if (!file) return
    if (!file.name.endsWith('.txt') && file.type !== 'text/plain') return
    const reader = new FileReader()
    reader.onload = e => {
      try {
        const parsed = parseResume(e.target.result)
        setResumeData(parsed)
        setResumeName(parsed.name || 'My Resume')
        setView('editor')
        setActiveSection('personal')
      } catch { /* silently ignore */ }
    }
    reader.readAsText(file)
  }, [])

  const handleFileChange = e => { const f = e.target.files?.[0]; if (f) processFile(f) }

  const loadSample = () => {
    const parsed = parseResume(SAMPLE_RESUME)
    setResumeData(parsed)
    setResumeName(parsed.name || 'Sample Resume')
    setView('editor')
    setActiveSection('personal')
  }

  const handleNewResume = () => {
    setResumeData({ ...EMPTY_RESUME })
    setResumeName('My Resume')
    setPhoto(null)
    setView('editor')
    setActiveSection('personal')
  }

  const handleDownload = async () => {
    if (!resumeData) return
    setIsDownloading(true)
    try {
      const safe = (resumeData.name || 'resume').replace(/\s+/g,'-').toLowerCase()
      await downloadAsPDF('resume-template', `${safe}-resume.pdf`)
    } catch { /* ignore */ }
    finally { setIsDownloading(false) }
  }

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_RESUME], { type: 'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a = Object.assign(document.createElement('a'), { href: url, download: 'sample-resume.txt' })
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── Command palette commands ─────────────────────────────────
  const paletteCommands = useMemo(() => {
    const cmds = []
    TEMPLATES.forEach(t => cmds.push({
      id: `tpl-${t.id}`, group: 'Template', label: `Switch to ${t.name}`, icon: '◻',
      badge: selectedTemplate === t.id ? 'active' : null,
      action: () => { setSelectedTemplate(t.id); setShowCP(false) },
    }))
    COLOR_PRESETS.forEach((c, i) => cmds.push({
      id: `color-${i}`, group: 'Color', label: `Accent ${c.hex}`, icon: '⬤', iconColor: c.hex,
      badge: theme.colorIdx === i ? 'active' : null,
      action: () => { setTheme(t => ({...t, colorIdx: i})); setShowCP(false) },
    }))
    FONT_OPTIONS.forEach(f => cmds.push({
      id: `font-${f.id}`, group: 'Font', label: `Use ${f.label}`, icon: 'Aa', iconFont: f.family,
      badge: theme.fontId === f.id ? 'active' : null,
      action: () => { setTheme(t => ({...t, fontId: f.id})); setShowCP(false) },
    }))
    EDITOR_SECTIONS.forEach(s => cmds.push({
      id: `sec-${s.id}`, group: 'Navigate', label: `Go to ${s.label}`, icon: s.icon,
      action: () => { setActiveSection(s.id); setShowCP(false) },
    }))
    cmds.push({ id: 'tpl-picker', group: 'View', label: 'Open template picker', icon: '◻', action: () => { setShowTemplatePicker(true); setShowCP(false) } })
    cmds.push({ id: 'ats-panel',  group: 'View', label: 'Toggle ATS score panel',icon: '⚡', action: () => { setShowATSPanel(o => !o); setShowCP(false) } })
    cmds.push({ id: 'zoom-in',   group: 'View', label: 'Zoom in preview',  icon: '+', action: () => { zoomIn();  setShowCP(false) } })
    cmds.push({ id: 'zoom-out',  group: 'View', label: 'Zoom out preview', icon: '−', action: () => { zoomOut(); setShowCP(false) } })
    cmds.push({ id: 'zoom-fit',  group: 'View', label: 'Reset zoom',       icon: '⊡', action: () => { setPreviewZoom(0.75); setShowCP(false) } })
    cmds.push({ id: 'load-sample',    group: 'Actions', label: 'Load sample resume',      icon: '◈', action: () => { loadSample(); setShowCP(false) } })
    cmds.push({ id: 'download-sample',group: 'Help',    label: 'Download sample .txt',    icon: '↓', action: () => { downloadSample(); setShowCP(false) } })
    if (resumeData) {
      cmds.push({ id: 'pdf', group: 'Actions', label: 'Download PDF', icon: '↓', shortcut: '⇧⌘P', action: () => { handleDownload(); setShowCP(false) } })
      cmds.push({ id: 'json-export', group: 'Actions', label: 'Export JSON Resume', icon: '{}', action: () => { exportAsJSONResume(resumeData); setShowCP(false) } })
      cmds.push({ id: 'raw-json', group: 'Developer', label: 'View raw JSON', icon: '</>', shortcut: 'J', action: () => { setShowRawJSON(true); setShowCP(false) } })
      cmds.push({ id: 'ai-chat', group: 'AI', label: 'Chat with Resume (AI)', icon: '✦', action: () => { setShowAIChat(true); setShowCP(false) } })
    }
    return cmds
  }, [resumeData, selectedTemplate, theme, sectionOrder])

  // ── DASHBOARD VIEW ───────────────────────────────────────────
  if (view === 'dashboard') {
    return <Dashboard onNew={handleNewResume} onLoadSample={loadSample} />
  }

  // ── EDITOR VIEW ──────────────────────────────────────────────
  const activeSec = EDITOR_SECTIONS.find(s => s.id === activeSection)

  return (
    <div className="nv-app">

      {/* ── Command Palette ── */}
      {showCP && <CommandPalette commands={paletteCommands} onClose={() => setShowCP(false)} />}

      {/* ── Raw JSON overlay ── */}
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

      {/* ── Top Bar ── */}
      <header className="nv-topbar">
        <button className="nv-topbar-back btn-icon" onClick={() => setView('dashboard')} title="Back to home">
          ←
        </button>
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
            onClick={() => setShowATSPanel(o => !o)}
            style={showATSPanel ? {background:'var(--brand-light)',color:'var(--brand)'} : {}}
            title="ATS Optimizer"
          >
            ⚡ {completeness ? `${completeness.score}%` : 'ATS'}
          </button>
          <button className="btn-ghost btn-sm" onClick={() => setShowCP(true)} title="Command Palette (⌘K)">
            ⌘K
          </button>
          <button className="btn-outline btn-sm" onClick={() => setShowTemplatePicker(true)}>
            ◻ Templates
          </button>
          {resumeData && (
            <button className="btn-primary btn-sm" onClick={handleDownload} disabled={isDownloading}>
              {isDownloading ? <><span className="spinner" /> Generating…</> : '↓ PDF'}
            </button>
          )}
        </div>
      </header>

      {/* ── Workspace ── */}
      <div className="nv-workspace">

        {/* ── Section Nav Sidebar ── */}
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
                <span className="nv-snav-icon" style={{background: sec.color + '20', color: sec.color}}>
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

            {/* Section order panel */}
            {resumeData && (
              <div style={{padding:'0 10px', marginTop: 4}}>
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
                  onClick={() => setTheme(t => ({...t, colorIdx: i}))}
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
                  onClick={() => setTheme(t => ({...t, fontId: f.id}))}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ── Editor Panel ── */}
        <div className="nv-editor">
          <div className="nv-editor-header">
            <div className="nv-editor-title">
              {activeSec && (
                <span className="nv-editor-title-icon"
                  style={{background: activeSec.color + '18', color: activeSec.color}}>
                  {activeSec.icon}
                </span>
              )}
              {activeSec?.label}
            </div>
          </div>

          <div className="nv-editor-body">
            {resumeData ? (
              <ResumeEditor
                data={resumeData}
                onChange={setResumeData}
                activeSection={activeSection}
                photo={photo}
                onPhotoChange={setPhoto}
              />
            ) : (
              <div className="nv-editor-empty">
                <div className="nv-editor-empty-icon">📝</div>
                <p>Start building your resume</p>
                <div style={{display:'flex',flexDirection:'column',gap:8,marginTop:4,width:'100%'}}>
                  <button className="btn-primary" style={{justifyContent:'center'}}
                    onClick={() => { setResumeData({...EMPTY_RESUME}); }}>
                    Start from scratch
                  </button>
                  <button className="btn-outline" style={{justifyContent:'center'}} onClick={loadSample}>
                    Load sample resume
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Preview Area ── */}
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
              onClick={() => setShowAIChat(o => !o)}
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
                      {i > 0 && (
                        <div className="nv-page-sep">
                          <span>Page {i + 1}</span>
                        </div>
                      )}
                      <div className="nv-page-card">
                        <div className="nv-page-clip">
                          <div style={{marginTop: `${-i * 1122}px`}}>
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

      {/* ── Template Picker Modal ── */}
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
                        <div style={{height:3,background:tpl.accent+'80',borderRadius:2,width:'42%'}} />
                        <div style={{height:1,background:'#e2e8f0',margin:'3px 0'}} />
                        <div style={{height:3,background:'#e2e8f0',borderRadius:2,width:'80%'}} />
                        <div style={{height:3,background:'#f1f5f9',borderRadius:2,width:'60%'}} />
                        <div style={{height:3,background:'#f1f5f9',borderRadius:2,width:'72%'}} />
                        <div style={{height:3,background:'#e2e8f0',borderRadius:2,width:'50%',marginTop:4}} />
                        <div style={{height:3,background:'#f1f5f9',borderRadius:2,width:'68%'}} />
                        <div style={{height:3,background:'#f1f5f9',borderRadius:2,width:'55%'}} />
                      </div>
                    </div>
                  </div>
                  <div className="nv-tpl-card-label">
                    <span>{tpl.name}</span>
                    {selectedTemplate === tpl.id && <span className="nv-tpl-active-badge">✓ Active</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── ATS / Score Panel ── */}
      <div className={`nv-ats-panel ${showATSPanel ? 'open' : ''}`}>
        <div className="nv-ats-header">
          <div className="nv-ats-header-text">
            <h3>ATS Optimizer</h3>
            <p>Resume score and keyword analysis</p>
          </div>
          <button className="btn-icon" onClick={() => setShowATSPanel(false)}>✕</button>
        </div>
        <div className="nv-ats-body">
          {completeness ? (
            <>
              {/* Score ring */}
              <div className="nv-ats-score-ring">
                <div className="nv-ats-ring-wrap">
                  <svg className="nv-ats-ring-svg" viewBox="0 0 110 110">
                    <circle cx="55" cy="55" r="44" fill="none" stroke="#e2e8f0" strokeWidth="7" />
                    <circle cx="55" cy="55" r="44" fill="none"
                      stroke={completeness.score >= 80 ? '#22c55e' : completeness.score >= 50 ? '#f59e0b' : '#ef4444'}
                      strokeWidth="7"
                      strokeDasharray={`${completeness.score * 2.765} 276.5`}
                      strokeLinecap="round"
                      transform="rotate(-90 55 55)"
                    />
                  </svg>
                  <div className="nv-ats-ring-num">
                    {completeness.score}
                    <span className="nv-ats-ring-label">/ 100</span>
                  </div>
                </div>
                <div className="nv-ats-ring-status" style={{
                  color: completeness.score >= 80 ? '#16a34a' : completeness.score >= 50 ? '#d97706' : '#dc2626'
                }}>
                  {completeness.score >= 80 ? '🎉 Excellent Resume' : completeness.score >= 50 ? '👍 Good — keep improving' : '⚠️ Needs more content'}
                </div>
              </div>

              {/* Checks */}
              <div className="nv-ats-checks">
                {completeness.results.map(r => (
                  <div key={r.key} className={`nv-ats-check ${r.pass ? 'pass' : 'fail'}`}>
                    <span className="nv-ats-check-icon">{r.pass ? '✓' : '○'}</span>
                    <span className="nv-ats-check-label">{r.label}</span>
                  </div>
                ))}
              </div>

              <div style={{height:1,background:'var(--border)',margin:'4px 0 16px'}} />
            </>
          ) : (
            <div style={{padding:'24px 0',textAlign:'center',color:'var(--muted)',fontSize:13}}>
              Add resume content to see your ATS score
            </div>
          )}

          {/* Job description analyzer */}
          <div>
            <div className="nv-ats-jd-label">Job Description Match</div>
            <div className="nv-ats-jd-sub">
              Paste a job posting to see which keywords your resume covers
            </div>
            <textarea
              className="nv-ats-jd-textarea"
              placeholder="Paste a job description here…"
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              rows={5}
            />
            {jdKeywords.length > 0 && resumeData && (
              <div>
                <div className="nv-ats-keywords-title">
                  Keywords (
                  <span style={{color:'#16a34a'}}>{jdKeywords.filter(k => kwFound(k, resumeData)).length} found</span>
                  {' · '}
                  <span style={{color:'#dc2626'}}>{jdKeywords.filter(k => !kwFound(k, resumeData)).length} missing</span>
                  )
                </div>
                <div className="nv-ats-keywords">
                  {jdKeywords.map(kw => (
                    <span key={kw} className={`nv-ats-keyword ${kwFound(kw, resumeData) ? 'found' : 'missing'}`}>
                      {kwFound(kw, resumeData) ? '✓' : '+'} {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Export actions */}
          {resumeData && (
            <div style={{marginTop:20,display:'flex',flexDirection:'column',gap:8}}>
              <button className="btn-outline" style={{justifyContent:'center'}}
                onClick={() => exportAsJSONResume(resumeData)}>
                {} Export JSON Resume
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
