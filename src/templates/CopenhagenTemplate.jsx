/**
 * Copenhagen — two-column layout with themed accent colors and fonts
 */
import React from 'react'
import { sortBySectionOrder } from '../utils/sectionOrder'

const DARK        = '#0f172a'
const BODY        = '#374151'
const MUTED       = '#6b7280'
const LIGHT_MUTED = '#9ca3af'
const BORDER      = '#e5e7eb'
const CONTACT_BG  = '#f8fafc'

function makeCss(accent, accentLight, accentMid, accentXlight, timeline, fontFamily) {
  return {
    root: {
      fontFamily,
      width: '794px',
      minHeight: '1122px',
      background: '#ffffff',
      fontSize: '10.5px',
      lineHeight: '1.55',
      color: DARK,
      boxSizing: 'border-box',
    },
    header:   { padding: '28px 30px 14px 30px' },
    name:     { fontSize: '30px', fontWeight: '800', color: DARK, letterSpacing: '-0.5px', lineHeight: '1.15', marginBottom: '3px' },
    jobTitle: { fontSize: '13.5px', fontWeight: '500', color: accent, marginBottom: '9px' },
    summary:  { fontSize: '9.5px', color: '#4b5563', lineHeight: '1.6', marginBottom: '12px' },
    contactBar: {
      background: CONTACT_BG,
      border: `1px solid ${BORDER}`,
      borderRadius: '5px',
      padding: '8px 12px',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '5px 12px',
    },
    contactItem: { display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 },
    contactIcon: {
      width: '17px', height: '17px', minWidth: '17px',
      background: '#1e293b', borderRadius: '2px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#ffffff', fontSize: '8px', fontWeight: '700',
    },
    contactText: { fontSize: '9px', color: BODY, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    body:    { display: 'flex', borderTop: `1px solid ${BORDER}` },
    leftCol: { flex: 1, minWidth: 0, padding: '18px 22px 28px 30px', borderRight: `1px solid ${BORDER}` },
    rightCol:{ width: '295px', flexShrink: 0, padding: '18px 30px 28px 18px' },
    section: { marginBottom: '18px' },
    sectionTitle: {
      fontSize: '10px', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase',
      color: accent, borderBottom: `2px solid ${accent}`, paddingBottom: '4px', marginBottom: '12px',
    },
    expEntry: { position: 'relative', paddingLeft: '15px', marginBottom: '14px', borderLeft: `2px solid ${timeline}` },
    dot: {
      position: 'absolute', left: '-5px', top: '4px',
      width: '8px', height: '8px', borderRadius: '50%',
      background: accent, border: '2px solid #fff', outline: `2px solid ${timeline}`, boxSizing: 'border-box',
    },
    expTitle:   { fontWeight: '700', fontSize: '11.5px', color: DARK, lineHeight: '1.3', marginBottom: '1px' },
    expCompany: { fontWeight: '600', fontSize: '10.5px', color: '#1e3a5f', marginBottom: '3px' },
    expMeta:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' },
    expDates:   { fontSize: '9px', color: MUTED, fontStyle: 'italic' },
    expLoc:     { fontSize: '9px', color: MUTED, fontStyle: 'italic' },
    expDesc:    { fontSize: '9px', color: LIGHT_MUTED, fontStyle: 'italic', lineHeight: '1.5', marginBottom: '4px' },
    bullet:     { display: 'flex', gap: '5px', marginBottom: '3px', alignItems: 'flex-start' },
    bulletDot:  { color: accent, fontSize: '6px', flexShrink: 0, marginTop: '3.5px' },
    bulletText: { fontSize: '10px', color: BODY, lineHeight: '1.5' },
    tagWrap:    { display: 'flex', flexWrap: 'wrap', gap: '5px' },
    skillTag: {
      background: accentLight, color: accentMid,
      fontSize: '9.5px', fontWeight: '500', padding: '3px 9px',
      borderRadius: '4px', lineHeight: '1.4', whiteSpace: 'nowrap',
    },
    toolTag: {
      background: accentXlight, color: accentMid,
      fontSize: '9.5px', fontWeight: '500', padding: '3px 9px',
      borderRadius: '4px', lineHeight: '1.4', border: `1px solid ${accentLight}`, whiteSpace: 'nowrap',
    },
    projectEntry:     { marginBottom: '10px' },
    projectHeader:    { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '4px', marginBottom: '2px' },
    projectName:      { fontWeight: '700', fontSize: '10.5px', color: DARK, lineHeight: '1.3', flex: 1, minWidth: 0 },
    projectDates:     { fontSize: '8.5px', color: MUTED, fontStyle: 'italic', flexShrink: 0 },
    projectBullet:    { display: 'flex', gap: '5px', alignItems: 'flex-start', marginBottom: '2px' },
    projDot:          { color: accent, fontSize: '6px', flexShrink: 0, marginTop: '3px' },
    projectBulletText:{ fontSize: '9.5px', color: '#4b5563', lineHeight: '1.45' },
    certEntry: { paddingLeft: '10px', borderLeft: `2px solid ${timeline}`, marginBottom: '8px' },
    certName:  { fontWeight: '600', fontSize: '10px', color: DARK },
    certMeta:  { fontSize: '9px', color: MUTED },
    langItem:  { display: 'flex', alignItems: 'center', gap: '7px', fontSize: '10px', color: BODY, marginBottom: '4px' },
    langDot:   { width: '6px', height: '6px', borderRadius: '50%', background: accent, flexShrink: 0 },
  }
}

// Left column sections — reorderable within this zone
const LEFT_KEYS  = ['experience', 'education', 'awards']
// Right column sections — reorderable within this zone
const RIGHT_KEYS = ['skills', 'tools', 'projects', 'certifications', 'languages']

export default function CopenhagenTemplate({ data, theme = {}, sectionOrder = [] }) {
  const accent      = theme.hex      || '#1565c0'
  const accentLight = theme.light    || '#dbeafe'
  const accentMid   = theme.mid      || '#1e40af'
  const accentXlight= theme.xlight   || '#eff6ff'
  const timeline    = theme.timeline || '#bfdbfe'
  const fontFamily  = theme.font     || "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"

  const css = makeCss(accent, accentLight, accentMid, accentXlight, timeline, fontFamily)

  const leftOrder  = sortBySectionOrder(sectionOrder, LEFT_KEYS)
  const rightOrder = sortBySectionOrder(sectionOrder, RIGHT_KEYS)

  const {
    name, title, email, phone, location, linkedin, github, website,
    summary, experience, education, skills, tools, certifications,
    languages, projects, awards,
  } = data

  const contacts = [
    email    && { icon: '✉',  label: email },
    phone    && { icon: '✆',  label: phone },
    location && { icon: '⌖',  label: location },
    linkedin && { icon: 'in', label: linkedin },
    github   && { icon: '⌥',  label: github },
    website  && { icon: '⊕',  label: website },
  ].filter(Boolean)

  // ── Left column section renderers ──────────────────────────────────────────
  const leftSections = {
    experience: experience?.length > 0 && (
      <div style={css.section}>
        <div style={css.sectionTitle} data-pdf-section-title="true">Work Experience</div>
        {experience.map((exp, i) => (
          <div key={i} style={css.expEntry} data-pdf-block="true">
            <div style={css.dot} />
            <div style={css.expTitle}>{exp.title}</div>
            <div style={css.expCompany}>{exp.company}</div>
            <div style={css.expMeta}>
              <span style={css.expDates}>{exp.dates}</span>
              {exp.location && <span style={css.expLoc}>{exp.location}</span>}
            </div>
            {exp.description && <div style={css.expDesc}>{exp.description}</div>}
            {exp.bullets?.map((b, j) => b && (
              <div key={j} style={css.bullet}>
                <span style={css.bulletDot}>◆</span>
                <span style={css.bulletText}>{b}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    ),

    education: education?.length > 0 && (
      <div style={css.section}>
        <div style={css.sectionTitle} data-pdf-section-title="true">Education</div>
        {education.map((edu, i) => (
          <div key={i} style={css.expEntry} data-pdf-block="true">
            <div style={css.dot} />
            <div style={css.expTitle}>{edu.degree}</div>
            <div style={css.expCompany}>{edu.school}</div>
            {edu.year && <div style={css.expDates}>{edu.year}</div>}
            {edu.details?.map((d, j) => (
              <div key={j} style={css.bullet}>
                <span style={css.bulletDot}>◆</span>
                <span style={css.bulletText}>{d}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    ),

    awards: awards?.length > 0 && (
      <div style={css.section}>
        <div style={css.sectionTitle}>Awards</div>
        {awards.map((a, i) => (
          <div key={i} style={css.bullet}>
            <span style={css.bulletDot}>◆</span>
            <span style={css.bulletText}>{a}</span>
          </div>
        ))}
      </div>
    ),
  }

  // ── Right column section renderers ─────────────────────────────────────────
  const rightSections = {
    skills: skills?.length > 0 && (
      <div style={css.section}>
        <div style={css.sectionTitle}>Skills</div>
        <div style={css.tagWrap}>
          {skills.map((s, i) => <span key={i} style={css.skillTag}>{s}</span>)}
        </div>
      </div>
    ),

    tools: tools?.length > 0 && (
      <div style={css.section}>
        <div style={css.sectionTitle}>Tools</div>
        <div style={css.tagWrap}>
          {tools.map((t, i) => <span key={i} style={css.toolTag}>{t}</span>)}
        </div>
      </div>
    ),

    projects: projects?.length > 0 && (
      <div style={css.section}>
        <div style={css.sectionTitle} data-pdf-section-title="true">Projects</div>
        {projects.map((p, i) => (
          <div key={i} style={css.projectEntry} data-pdf-block="true">
            <div style={css.projectHeader}>
              <span style={css.projectName}>{p.title || p.name}</span>
              {p.dates && <span style={css.projectDates}>{p.dates}</span>}
            </div>
            {p.bullets?.map((b, j) => b && (
              <div key={j} style={css.projectBullet}>
                <span style={css.projDot}>◆</span>
                <span style={css.projectBulletText}>{b}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    ),

    certifications: certifications?.length > 0 && (
      <div style={css.section}>
        <div style={css.sectionTitle} data-pdf-section-title="true">Certifications</div>
        {certifications.map((c, i) => (
          <div key={i} style={css.certEntry} data-pdf-block="true">
            <div style={css.certName}>{c.name}</div>
            {(c.issuer || c.year) && (
              <div style={css.certMeta}>{c.issuer}{c.year ? ` · ${c.year}` : ''}</div>
            )}
          </div>
        ))}
      </div>
    ),

    languages: languages?.length > 0 && (
      <div style={css.section}>
        <div style={css.sectionTitle}>Languages</div>
        {languages.map((lang, i) => (
          <div key={i} style={css.langItem}>
            <span style={css.langDot} />
            {lang}
          </div>
        ))}
      </div>
    ),
  }

  return (
    <div style={css.root} id="resume-template">

      {/* ═══════════════════════ HEADER ═══════════════════════ */}
      <div style={css.header}>
        <div style={css.name}>{name || 'Your Name'}</div>
        {title && <div style={css.jobTitle}>{title}</div>}
        {summary && <div style={css.summary}>{summary}</div>}
        {contacts.length > 0 && (
          <div style={css.contactBar}>
            {contacts.map((c, i) => (
              <div key={i} style={css.contactItem}>
                <span style={css.contactIcon}>{c.icon}</span>
                <span style={css.contactText}>{c.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═══════════════════════ BODY ═════════════════════════ */}
      <div style={css.body}>

        {/* ─── LEFT: ordered sections ─── */}
        <div style={css.leftCol}>
          {leftOrder.map(k => leftSections[k]
            ? <React.Fragment key={k}>{leftSections[k]}</React.Fragment>
            : null
          )}
        </div>

        {/* ─── RIGHT: ordered sections ─── */}
        <div style={css.rightCol}>
          {rightOrder.map(k => rightSections[k]
            ? <React.Fragment key={k}>{rightSections[k]}</React.Fragment>
            : null
          )}
        </div>
      </div>
    </div>
  )
}
