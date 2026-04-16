// Stockholm — Classic Professional template (single column, elegant)
import React from 'react'
import { sortBySectionOrder } from '../utils/sectionOrder'

const ACCENT = '#1a1a2e'
const MUTED  = '#6b7280'

// Top full-width sections — reorderable within this zone
const TOP_KEYS   = ['summary', 'experience']
// Two-col left sections — reorderable within this zone
const LEFT_KEYS  = ['education', 'projects']
// Two-col right sections — reorderable within this zone
const RIGHT_KEYS = ['skills', 'languages', 'certifications', 'awards']

export default function StockholmTemplate({ data, theme = {}, sectionOrder = [] }) {
  const RED  = theme.hex  || '#c0392b'
  const FONT = theme.font || "'Merriweather', 'Georgia', serif"

  const topOrder   = sortBySectionOrder(sectionOrder, TOP_KEYS)
  const leftOrder  = sortBySectionOrder(sectionOrder, LEFT_KEYS)
  const rightOrder = sortBySectionOrder(sectionOrder, RIGHT_KEYS)

  const s = {
  root: {
    fontFamily: FONT,
    width: '794px',
    minHeight: '1122px',
    background: '#fff',
    color: ACCENT,
    padding: '52px 56px',
    fontSize: '11px',
    lineHeight: '1.6',
    boxSizing: 'border-box',
  },
  header: {
    textAlign: 'center',
    marginBottom: '28px',
    paddingBottom: '20px',
    borderBottom: `3px double ${ACCENT}`,
  },
  name: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '32px',
    fontWeight: '700',
    letterSpacing: '3px',
    textTransform: 'uppercase',
    marginBottom: '6px',
    color: ACCENT,
  },
  jobTitle: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '12px',
    fontWeight: '400',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    color: RED,
    marginBottom: '12px',
  },
  contactRow: {
    fontFamily: "'Inter', sans-serif",
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '4px 14px',
    fontSize: '10px',
    color: MUTED,
  },
  contactSep: {
    color: '#d1d5db',
  },
  section: {
    marginBottom: '24px',
  },
  sectionTitle: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '10px',
    fontWeight: '700',
    letterSpacing: '2.5px',
    textTransform: 'uppercase',
    color: RED,
    marginBottom: '10px',
    paddingBottom: '4px',
    borderBottom: `1px solid ${RED}`,
  },
  summaryText: {
    fontStyle: 'italic',
    fontSize: '11px',
    color: '#374151',
    lineHeight: '1.7',
  },
  expEntry: {
    marginBottom: '18px',
    paddingBottom: '14px',
    borderBottom: '1px dotted #e5e7eb',
  },
  expHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: '2px',
  },
  expTitle: {
    fontFamily: "'Inter', sans-serif",
    fontWeight: '600',
    fontSize: '12px',
    color: ACCENT,
  },
  expDates: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '10px',
    color: MUTED,
    fontStyle: 'italic',
  },
  expCompany: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '11px',
    color: RED,
    fontWeight: '500',
    marginBottom: '6px',
  },
  bullet: {
    display: 'flex',
    gap: '8px',
    marginBottom: '3px',
    fontSize: '10.5px',
    color: '#374151',
  },
  bulletDot: {
    color: RED,
    flexShrink: 0,
  },
  eduEntry: {
    marginBottom: '12px',
  },
  eduRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  eduDegree: {
    fontFamily: "'Inter', sans-serif",
    fontWeight: '600',
    fontSize: '11.5px',
  },
  eduYear: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '10px',
    color: MUTED,
    fontStyle: 'italic',
  },
  eduSchool: {
    fontFamily: "'Inter', sans-serif",
    color: RED,
    fontSize: '10.5px',
    fontWeight: '500',
  },
  skillsGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  skillItem: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '10px',
    padding: '3px 10px',
    border: `1px solid ${ACCENT}`,
    borderRadius: '2px',
    color: ACCENT,
  },
  certEntry: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '6px',
  },
  certName: {
    fontFamily: "'Inter', sans-serif",
    fontWeight: '500',
    fontSize: '10.5px',
  },
  certMeta: {
    fontFamily: "'Inter', sans-serif",
    color: MUTED,
    fontSize: '10px',
  },
  twoCol: {
    display: 'flex',
    gap: '40px',
  },
  col: {
    flex: 1,
  },
  }

  const { name, title, email, phone, location, linkedin, github, website,
    summary, experience, education, skills, certifications, languages, projects, awards } = data

  const contactItems = [email, phone, location, linkedin, github, website].filter(Boolean)

  // ── Top (full-width) section renderers ─────────────────────────────────────
  const topSections = {
    summary: summary && (
      <div style={s.section}>
        <div style={s.sectionTitle}>Professional Profile</div>
        <div style={s.summaryText}>{summary}</div>
      </div>
    ),

    experience: experience?.length > 0 && (
      <div style={s.section}>
        <div style={s.sectionTitle} data-pdf-section-title="true">Experience</div>
        {experience.map((exp, i) => (
          <div
            key={i}
            style={{ ...s.expEntry, ...(i === experience.length - 1 ? { borderBottom: 'none', paddingBottom: 0 } : {}) }}
            data-pdf-block="true"
          >
            <div style={s.expHeaderRow}>
              <div style={s.expTitle}>{exp.title}</div>
              <div style={s.expDates}>{exp.dates}</div>
            </div>
            <div style={s.expCompany}>{exp.company}{exp.location ? ` | ${exp.location}` : ''}</div>
            {exp.bullets?.map((b, j) => (
              <div key={j} style={s.bullet}>
                <span style={s.bulletDot}>—</span>
                <span>{b}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    ),
  }

  // ── Two-col LEFT section renderers ─────────────────────────────────────────
  const leftSections = {
    education: education?.length > 0 && (
      <div style={s.section}>
        <div style={s.sectionTitle} data-pdf-section-title="true">Education</div>
        {education.map((edu, i) => (
          <div key={i} style={s.eduEntry} data-pdf-block="true">
            <div style={s.eduRow}>
              <div style={s.eduDegree}>{edu.degree}</div>
              <div style={s.eduYear}>{edu.year}</div>
            </div>
            <div style={s.eduSchool}>{edu.school}</div>
          </div>
        ))}
      </div>
    ),

    projects: projects?.length > 0 && (
      <div style={s.section}>
        <div style={s.sectionTitle} data-pdf-section-title="true">Projects</div>
        {projects.map((p, i) => (
          <div key={i} style={{ marginBottom: '10px' }} data-pdf-block="true">
            <div style={{ ...s.eduRow }}>
              <div style={{ ...s.expTitle, fontSize: '11px' }}>{p.name}</div>
              {p.link && <div style={s.certMeta}>{p.link}</div>}
            </div>
            {p.tech && <div style={{ ...s.certMeta, marginBottom: '4px' }}>{p.tech}</div>}
            {p.bullets?.map((b, j) => (
              <div key={j} style={s.bullet}>
                <span style={s.bulletDot}>—</span>
                <span>{b}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    ),
  }

  // ── Two-col RIGHT section renderers ────────────────────────────────────────
  const rightSections = {
    skills: skills?.length > 0 && (
      <div style={s.section}>
        <div style={s.sectionTitle}>Skills</div>
        <div style={s.skillsGrid}>
          {skills.map((skill, i) => (
            <span key={i} style={s.skillItem}>{skill}</span>
          ))}
        </div>
      </div>
    ),

    languages: languages?.length > 0 && (
      <div style={s.section}>
        <div style={s.sectionTitle}>Languages</div>
        {languages.map((lang, i) => (
          <div key={i} style={{ ...s.bullet, marginBottom: '4px' }}>
            <span style={s.bulletDot}>·</span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '10.5px' }}>{lang}</span>
          </div>
        ))}
      </div>
    ),

    certifications: certifications?.length > 0 && (
      <div style={s.section}>
        <div style={s.sectionTitle} data-pdf-section-title="true">Certifications</div>
        {certifications.map((cert, i) => (
          <div key={i} style={s.certEntry} data-pdf-block="true">
            <div>
              <div style={s.certName}>{cert.name}</div>
              <div style={s.certMeta}>{cert.issuer}</div>
            </div>
            <div style={s.certMeta}>{cert.year}</div>
          </div>
        ))}
      </div>
    ),

    awards: awards?.length > 0 && (
      <div style={s.section}>
        <div style={s.sectionTitle}>Awards</div>
        {awards.map((award, i) => (
          <div key={i} style={{ ...s.bullet, marginBottom: '4px' }}>
            <span style={s.bulletDot}>·</span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '10.5px' }}>{award}</span>
          </div>
        ))}
      </div>
    ),
  }

  return (
    <div style={s.root} id="resume-template">
      {/* Header */}
      <div style={s.header}>
        <div style={s.name}>{name || 'Your Name'}</div>
        {title && <div style={s.jobTitle}>{title}</div>}
        <div style={s.contactRow}>
          {contactItems.map((item, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span style={s.contactSep}>·</span>}
              <span>{item}</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Full-width top sections — ordered */}
      {topOrder.map(k => topSections[k]
        ? <React.Fragment key={k}>{topSections[k]}</React.Fragment>
        : null
      )}

      {/* Two-column section */}
      <div style={s.twoCol}>
        <div style={s.col}>
          {leftOrder.map(k => leftSections[k]
            ? <React.Fragment key={k}>{leftSections[k]}</React.Fragment>
            : null
          )}
        </div>
        <div style={s.col}>
          {rightOrder.map(k => rightSections[k]
            ? <React.Fragment key={k}>{rightSections[k]}</React.Fragment>
            : null
          )}
        </div>
      </div>
    </div>
  )
}
