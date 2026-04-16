import React from 'react'

const FEATURES = [
  { icon: '⚡', title: 'ATS Optimized', desc: 'Templates designed to pass applicant tracking systems' },
  { icon: '✦',  title: 'AI-Powered',    desc: 'Chat with AI to improve your resume content' },
  { icon: '◈',  title: '5 Templates',   desc: 'Professional designs for any industry' },
  { icon: '↓',  title: 'PDF Export',    desc: 'Download print-ready, professional PDFs instantly' },
  { icon: '⌘',  title: 'Quick Actions', desc: 'Press ⌘K for lightning-fast command palette' },
  { icon: '≡',  title: 'Reorder Sections', desc: 'Arrange resume sections to fit your story' },
]

export default function Dashboard({ onNew, onLoadSample }) {
  return (
    <div className="nv-dash">
      {/* Header */}
      <header className="nv-dash-header">
        <div className="nv-dash-brand">
          <div className="nv-dash-logo">R</div>
          <span>ResumeForge</span>
        </div>
        <div className="nv-dash-header-right">
          <span className="nv-dash-tagline">Professional Resume Builder</span>
        </div>
      </header>

      <div className="nv-dash-body">
        {/* Hero */}
        <div className="nv-dash-hero">
          <div className="nv-dash-hero-badge">✦ AI-powered · ATS-optimized</div>
          <h1 className="nv-dash-hero-title">
            Build a resume that<br />gets you hired
          </h1>
          <p className="nv-dash-hero-sub">
            Professional templates, instant PDF export, AI writing assistance.
          </p>
          <div className="nv-dash-hero-cta">
            <button className="nv-dash-cta-primary" onClick={onNew}>
              <span>+</span> Create New Resume
            </button>
            <button className="nv-dash-cta-outline" onClick={onLoadSample}>
              Try Sample Resume
            </button>
          </div>
        </div>

        {/* Resume cards row */}
        <div className="nv-dash-cards-section">
          <h2 className="nv-dash-section-title">Quick Start</h2>
          <div className="nv-dash-grid">
            {/* New resume card */}
            <button className="nv-dash-card nv-dash-card--new" onClick={onNew}>
              <div className="nv-dash-new-icon">
                <span>+</span>
              </div>
              <div className="nv-dash-card-name">New Resume</div>
              <div className="nv-dash-card-sub">Start from scratch</div>
            </button>

            {/* Sample card */}
            <button className="nv-dash-card" onClick={onLoadSample}>
              <div className="nv-dash-card-preview">
                <MiniResume color="#6366f1" />
              </div>
              <div className="nv-dash-card-meta">
                <div className="nv-dash-card-name">Sample Resume</div>
                <div className="nv-dash-card-sub">Software Engineer · Copenhagen</div>
              </div>
            </button>

            {/* Template previews */}
            {[
              { name: 'Geneva', color: '#2563eb' },
              { name: 'Tokyo',  color: '#1b98e0' },
              { name: 'New York', color: '#9b1c1c' },
            ].map(t => (
              <button key={t.name} className="nv-dash-card nv-dash-card--template" onClick={onNew}>
                <div className="nv-dash-card-preview">
                  <MiniResume color={t.color} />
                </div>
                <div className="nv-dash-card-meta">
                  <div className="nv-dash-card-name">{t.name} Template</div>
                  <div className="nv-dash-card-sub">Click to use</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="nv-dash-features-section">
          <h2 className="nv-dash-section-title">Everything you need</h2>
          <div className="nv-dash-features">
            {FEATURES.map((f, i) => (
              <div key={i} className="nv-dash-feature">
                <span className="nv-dash-feature-icon">{f.icon}</span>
                <strong className="nv-dash-feature-title">{f.title}</strong>
                <span className="nv-dash-feature-desc">{f.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function MiniResume({ color }) {
  return (
    <div className="nv-mini-resume">
      <div className="nv-mini-header" style={{ background: color }} />
      <div className="nv-mini-body">
        <div className="nv-mini-line nv-mini-name" />
        <div className="nv-mini-line nv-mini-title" style={{ background: color + '60' }} />
        <div className="nv-mini-sep" />
        <div className="nv-mini-row">
          <div className="nv-mini-col-left">
            <div className="nv-mini-label" style={{ background: color }} />
            <div className="nv-mini-line nv-mini-sm" />
            <div className="nv-mini-line nv-mini-sm" />
            <div className="nv-mini-line nv-mini-xs" />
          </div>
          <div className="nv-mini-col-right">
            <div className="nv-mini-label" style={{ background: color }} />
            <div className="nv-mini-line nv-mini-sm" />
            <div className="nv-mini-line nv-mini-xs" />
          </div>
        </div>
      </div>
    </div>
  )
}
