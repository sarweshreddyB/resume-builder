// Tokyo — Creative Sidebar template (dark sidebar + light main)
import React from 'react'
import { sortBySectionOrder } from '../utils/sectionOrder'

const SIDEBAR_TEXT = '#e8f4fd'
const MUTED = '#64748b'

function darkenHex(hex, factor = 0.42) {
  const r = parseInt(hex.slice(1,3), 16)
  const g = parseInt(hex.slice(3,5), 16)
  const b = parseInt(hex.slice(5,7), 16)
  const f = 1 - factor
  const h = n => Math.round(n * f).toString(16).padStart(2, '0')
  return '#' + h(r) + h(g) + h(b)
}

// Sidebar sections — reorderable within this zone
const SIDEBAR_KEYS = ['skills', 'languages', 'certifications', 'awards']
// Main column sections — reorderable within this zone
const MAIN_KEYS    = ['summary', 'experience', 'education', 'projects']

export default function TokyoTemplate({ data, theme = {}, sectionOrder = [] }) {
  const SIDEBAR_ACCENT = theme.hex  || '#1b98e0'
  const MAIN_ACCENT    = theme.hex  || '#0f4c75'
  const SIDEBAR_BG     = darkenHex(theme.hex || '#1b98e0', 0.55)
  const FONT           = theme.font || "'Inter', sans-serif"

  const sidebarOrder = sortBySectionOrder(sectionOrder, SIDEBAR_KEYS)
  const mainOrder    = sortBySectionOrder(sectionOrder, MAIN_KEYS)

  const s = {
  root: {
    fontFamily: FONT,
    width: '794px',
    minHeight: '1122px',
    background: '#fff',
    display: 'flex',
    fontSize: '11px',
    lineHeight: '1.5',
  },
  sidebar: {
    width: '230px',
    background: SIDEBAR_BG,
    color: SIDEBAR_TEXT,
    padding: '40px 22px',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
  },
  avatarPlaceholder: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: SIDEBAR_ACCENT,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '16px',
    border: '3px solid rgba(255,255,255,0.3)',
  },
  sidebarName: {
    fontFamily: "'Raleway', sans-serif",
    fontSize: '20px',
    fontWeight: '800',
    lineHeight: '1.2',
    marginBottom: '4px',
    color: '#fff',
  },
  sidebarTitle: {
    fontSize: '10.5px',
    color: SIDEBAR_ACCENT,
    fontWeight: '500',
    marginBottom: '24px',
    letterSpacing: '0.5px',
  },
  sidebarSection: {
    marginBottom: '22px',
  },
  sidebarSectionTitle: {
    fontSize: '9px',
    fontWeight: '700',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    color: SIDEBAR_ACCENT,
    marginBottom: '10px',
    paddingBottom: '5px',
    borderBottom: `1px solid rgba(27,152,224,0.4)`,
  },
  contactItem: {
    display: 'flex',
    gap: '8px',
    marginBottom: '7px',
    fontSize: '10px',
    color: 'rgba(232,244,253,0.85)',
    alignItems: 'flex-start',
  },
  contactIcon: {
    color: SIDEBAR_ACCENT,
    flexShrink: 0,
    width: '14px',
    marginTop: '1px',
  },
  skillBar: {
    marginBottom: '8px',
  },
  skillLabel: {
    fontSize: '10px',
    marginBottom: '3px',
    color: SIDEBAR_TEXT,
  },
  skillBarTrack: {
    height: '4px',
    background: 'rgba(255,255,255,0.15)',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  langItem: {
    fontSize: '10px',
    marginBottom: '5px',
    color: 'rgba(232,244,253,0.85)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  langDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: SIDEBAR_ACCENT,
    flexShrink: 0,
  },
  certItem: {
    fontSize: '10px',
    marginBottom: '6px',
    color: 'rgba(232,244,253,0.85)',
  },
  certName: {
    fontWeight: '500',
  },
  certMeta: {
    color: 'rgba(232,244,253,0.55)',
    fontSize: '9.5px',
  },
  main: {
    flex: 1,
    padding: '36px 32px',
  },
  mainHeader: {
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: `3px solid ${MAIN_ACCENT}`,
  },
  mainName: {
    display: 'none',
  },
  section: {
    marginBottom: '22px',
  },
  sectionTitle: {
    fontSize: '10px',
    fontWeight: '700',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    color: MAIN_ACCENT,
    marginBottom: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  sectionLine: {
    flex: 1,
    height: '1px',
    background: `${MAIN_ACCENT}30`,
  },
  summaryText: {
    fontSize: '10.5px',
    color: '#374151',
    lineHeight: '1.7',
  },
  expEntry: {
    marginBottom: '16px',
    paddingLeft: '12px',
    borderLeft: `2px solid ${SIDEBAR_ACCENT}20`,
  },
  expHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1px',
  },
  expTitle: {
    fontWeight: '600',
    fontSize: '12px',
    color: '#1e293b',
  },
  expDates: {
    fontSize: '9.5px',
    color: '#fff',
    background: MAIN_ACCENT,
    padding: '1px 7px',
    borderRadius: '10px',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    marginLeft: '8px',
  },
  expCompany: {
    fontSize: '10.5px',
    color: SIDEBAR_ACCENT,
    fontWeight: '500',
    marginBottom: '6px',
  },
  bullet: {
    display: 'flex',
    gap: '6px',
    marginBottom: '3px',
    fontSize: '10.5px',
    color: '#475569',
  },
  bulletDot: {
    color: SIDEBAR_ACCENT,
    flexShrink: 0,
    fontSize: '8px',
    marginTop: '3px',
  },
  eduEntry: {
    marginBottom: '12px',
    paddingLeft: '12px',
    borderLeft: `2px solid ${SIDEBAR_ACCENT}20`,
  },
  eduRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  eduDegree: {
    fontWeight: '600',
    fontSize: '11.5px',
    color: '#1e293b',
  },
  eduYear: {
    fontSize: '10px',
    color: '#fff',
    background: MAIN_ACCENT,
    padding: '1px 7px',
    borderRadius: '10px',
  },
  eduSchool: {
    fontSize: '10.5px',
    color: SIDEBAR_ACCENT,
    fontWeight: '500',
  },
  skillTagMain: {
    display: 'inline-block',
    background: `${MAIN_ACCENT}12`,
    border: `1px solid ${MAIN_ACCENT}40`,
    color: MAIN_ACCENT,
    borderRadius: '4px',
    padding: '2px 8px',
    margin: '2px 3px 2px 0',
    fontSize: '10px',
  },
  projectEntry: {
    marginBottom: '12px',
    paddingLeft: '12px',
    borderLeft: `2px solid ${SIDEBAR_ACCENT}20`,
  },
  }

  const getInitials = (n) => n ? n.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase() : '?'

  const { name, title, email, phone, location, linkedin, github, website,
    summary, experience, education, skills, certifications, languages, projects, awards } = data

  // ── Sidebar section renderers ──────────────────────────────────────────────
  const sidebarSections = {
    skills: skills?.length > 0 && (
      <div style={s.sidebarSection}>
        <div style={s.sidebarSectionTitle}>Skills</div>
        {skills.slice(0, 12).map((skill, i) => (
          <div key={i} style={s.skillBar}>
            <div style={s.skillLabel}>{skill}</div>
            <div style={s.skillBarTrack}>
              <div style={{
                height: '100%',
                width: `${75 + (i % 3) * 8}%`,
                background: `linear-gradient(90deg, ${SIDEBAR_ACCENT}, rgba(27,152,224,0.6))`,
                borderRadius: '2px',
              }} />
            </div>
          </div>
        ))}
      </div>
    ),

    languages: languages?.length > 0 && (
      <div style={s.sidebarSection}>
        <div style={s.sidebarSectionTitle}>Languages</div>
        {languages.map((lang, i) => (
          <div key={i} style={s.langItem}>
            <span style={s.langDot} />
            {lang}
          </div>
        ))}
      </div>
    ),

    certifications: certifications?.length > 0 && (
      <div style={s.sidebarSection}>
        <div style={s.sidebarSectionTitle}>Certifications</div>
        {certifications.map((cert, i) => (
          <div key={i} style={s.certItem}>
            <div style={s.certName}>{cert.name}</div>
            {(cert.issuer || cert.year) && (
              <div style={s.certMeta}>{cert.issuer}{cert.year ? ` · ${cert.year}` : ''}</div>
            )}
          </div>
        ))}
      </div>
    ),

    awards: awards?.length > 0 && (
      <div style={s.sidebarSection}>
        <div style={s.sidebarSectionTitle}>Awards</div>
        {awards.map((award, i) => (
          <div key={i} style={{ ...s.langItem }}>
            <span style={s.langDot} />
            {award}
          </div>
        ))}
      </div>
    ),
  }

  // ── Main column section renderers ──────────────────────────────────────────
  const mainSections = {
    summary: summary && (
      <div style={s.section}>
        <div style={s.sectionTitle}>
          About Me
          <span style={s.sectionLine} />
        </div>
        <div style={s.summaryText}>{summary}</div>
      </div>
    ),

    experience: experience?.length > 0 && (
      <div style={s.section}>
        <div style={s.sectionTitle} data-pdf-section-title="true">
          Experience
          <span style={s.sectionLine} />
        </div>
        {experience.map((exp, i) => (
          <div key={i} style={s.expEntry} data-pdf-block="true">
            <div style={s.expHeaderRow}>
              <div style={s.expTitle}>{exp.title}</div>
              {exp.dates && <div style={s.expDates}>{exp.dates}</div>}
            </div>
            <div style={s.expCompany}>{exp.company}{exp.location ? ` · ${exp.location}` : ''}</div>
            {exp.bullets?.map((b, j) => (
              <div key={j} style={s.bullet}>
                <span style={s.bulletDot}>◆</span>
                <span>{b}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    ),

    education: education?.length > 0 && (
      <div style={s.section}>
        <div style={s.sectionTitle} data-pdf-section-title="true">
          Education
          <span style={s.sectionLine} />
        </div>
        {education.map((edu, i) => (
          <div key={i} style={s.eduEntry} data-pdf-block="true">
            <div style={s.eduRow}>
              <div style={s.eduDegree}>{edu.degree}</div>
              {edu.year && <div style={s.eduYear}>{edu.year}</div>}
            </div>
            <div style={s.eduSchool}>{edu.school}</div>
            {edu.details?.map((d, j) => (
              <div key={j} style={s.bullet}>
                <span style={s.bulletDot}>◆</span>
                <span>{d}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    ),

    projects: projects?.length > 0 && (
      <div style={s.section}>
        <div style={s.sectionTitle} data-pdf-section-title="true">
          Projects
          <span style={s.sectionLine} />
        </div>
        {projects.map((p, i) => (
          <div key={i} style={s.projectEntry} data-pdf-block="true">
            <div style={s.expHeaderRow}>
              <div style={s.expTitle}>{p.name}</div>
              {p.link && <div style={{ fontSize: '9.5px', color: SIDEBAR_ACCENT }}>{p.link}</div>}
            </div>
            {p.tech && <div style={{ color: MUTED, fontSize: '10px', marginBottom: '4px' }}>{p.tech}</div>}
            {p.bullets?.map((b, j) => (
              <div key={j} style={s.bullet}>
                <span style={s.bulletDot}>◆</span>
                <span>{b}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    ),
  }

  return (
    <div style={s.root} id="resume-template">
      {/* Sidebar */}
      <div style={s.sidebar}>
        <div style={s.avatarPlaceholder}>{getInitials(name)}</div>
        <div style={s.sidebarName}>{name || 'Your Name'}</div>
        {title && <div style={s.sidebarTitle}>{title}</div>}

        {/* Contact — always first in sidebar */}
        <div style={s.sidebarSection}>
          <div style={s.sidebarSectionTitle}>Contact</div>
          {email && (
            <div style={s.contactItem}>
              <span style={s.contactIcon}>✉</span>
              <span style={{ wordBreak: 'break-all' }}>{email}</span>
            </div>
          )}
          {phone && (
            <div style={s.contactItem}>
              <span style={s.contactIcon}>☎</span>
              <span>{phone}</span>
            </div>
          )}
          {location && (
            <div style={s.contactItem}>
              <span style={s.contactIcon}>⌖</span>
              <span>{location}</span>
            </div>
          )}
          {linkedin && (
            <div style={s.contactItem}>
              <span style={s.contactIcon}>in</span>
              <span style={{ wordBreak: 'break-all' }}>{linkedin}</span>
            </div>
          )}
          {github && (
            <div style={s.contactItem}>
              <span style={s.contactIcon}>⌥</span>
              <span style={{ wordBreak: 'break-all' }}>{github}</span>
            </div>
          )}
          {website && (
            <div style={s.contactItem}>
              <span style={s.contactIcon}>⊕</span>
              <span style={{ wordBreak: 'break-all' }}>{website}</span>
            </div>
          )}
        </div>

        {/* Ordered sidebar sections */}
        {sidebarOrder.map(k => sidebarSections[k]
          ? <React.Fragment key={k}>{sidebarSections[k]}</React.Fragment>
          : null
        )}
      </div>

      {/* Main Content — ordered sections */}
      <div style={s.main}>
        {mainOrder.map(k => mainSections[k]
          ? <React.Fragment key={k}>{mainSections[k]}</React.Fragment>
          : null
        )}
      </div>
    </div>
  )
}
