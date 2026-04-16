// Geneva — Modern Blue template (Novoresume-style two-column)
import React from 'react'
import { sortBySectionOrder } from '../utils/sectionOrder'

const DARK  = '#1e293b'
const MUTED = '#64748b'

// Main column sections — reorderable within this zone
const MAIN_KEYS    = ['summary', 'experience', 'projects', 'education']
// Sidebar sections — reorderable within this zone
const SIDEBAR_KEYS = ['skills', 'languages', 'certifications', 'awards']

export default function GenevaTemplate({ data, theme = {}, sectionOrder = [] }) {
  const ACCENT = theme.hex  || '#2563eb'
  const FONT   = theme.font || "'Inter', sans-serif"

  const mainOrder    = sortBySectionOrder(sectionOrder, MAIN_KEYS)
  const sidebarOrder = sortBySectionOrder(sectionOrder, SIDEBAR_KEYS)

  const s = {
  root: {
    fontFamily: FONT,
    width: '794px',
    minHeight: '1122px',
    background: '#fff',
    display: 'flex',
    flexDirection: 'column',
    color: DARK,
    fontSize: '11px',
    lineHeight: '1.5',
  },
  header: {
    background: ACCENT,
    padding: '32px 40px 28px',
    color: '#fff',
  },
  name: {
    fontSize: '28px',
    fontWeight: '700',
    letterSpacing: '-0.3px',
    marginBottom: '4px',
  },
  jobTitle: {
    fontSize: '13px',
    fontWeight: '400',
    opacity: 0.9,
    marginBottom: '14px',
  },
  contactRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    fontSize: '10.5px',
    opacity: 0.9,
  },
  contactItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  body: {
    display: 'flex',
    flex: 1,
  },
  main: {
    flex: 1,
    padding: '28px 28px 28px 40px',
  },
  sidebar: {
    width: '210px',
    background: '#f1f5f9',
    padding: '28px 22px',
    borderLeft: '1px solid #e2e8f0',
  },
  section: {
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '10px',
    fontWeight: '700',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    color: ACCENT,
    borderBottom: `2px solid ${ACCENT}`,
    paddingBottom: '5px',
    marginBottom: '14px',
  },
  sidebarSectionTitle: {
    fontSize: '10px',
    fontWeight: '700',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    color: ACCENT,
    borderBottom: `2px solid ${ACCENT}`,
    paddingBottom: '5px',
    marginBottom: '12px',
  },
  expEntry: {
    marginBottom: '16px',
  },
  expHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2px',
  },
  expTitle: {
    fontWeight: '600',
    fontSize: '12px',
    color: DARK,
  },
  expDates: {
    fontSize: '10px',
    color: MUTED,
    whiteSpace: 'nowrap',
    marginLeft: '8px',
  },
  expCompany: {
    fontSize: '10.5px',
    color: ACCENT,
    fontWeight: '500',
    marginBottom: '6px',
  },
  bullet: {
    display: 'flex',
    gap: '6px',
    marginBottom: '3px',
    fontSize: '10.5px',
    color: '#334155',
  },
  bulletDot: {
    color: ACCENT,
    fontWeight: '700',
    flexShrink: 0,
    marginTop: '1px',
  },
  eduEntry: {
    marginBottom: '12px',
  },
  eduDegree: {
    fontWeight: '600',
    fontSize: '11.5px',
  },
  eduSchool: {
    color: ACCENT,
    fontSize: '10.5px',
    fontWeight: '500',
  },
  eduYear: {
    color: MUTED,
    fontSize: '10px',
  },
  skillTag: {
    display: 'inline-block',
    background: '#dbeafe',
    color: ACCENT,
    borderRadius: '4px',
    padding: '2px 7px',
    margin: '2px 3px 2px 0',
    fontSize: '10px',
    fontWeight: '500',
  },
  langItem: {
    fontSize: '10.5px',
    marginBottom: '4px',
    color: '#334155',
  },
  certItem: {
    marginBottom: '8px',
  },
  certName: {
    fontWeight: '600',
    fontSize: '10.5px',
  },
  certMeta: {
    color: MUTED,
    fontSize: '10px',
  },
  summaryText: {
    fontSize: '10.5px',
    color: '#334155',
    lineHeight: '1.6',
  },
  projectEntry: {
    marginBottom: '12px',
  },
  projectName: {
    fontWeight: '600',
    fontSize: '11px',
  },
  projectLink: {
    color: ACCENT,
    fontSize: '10px',
  },
  awardItem: {
    fontSize: '10.5px',
    marginBottom: '4px',
    color: '#334155',
    display: 'flex',
    gap: '6px',
  },
  }

  const { name, title, email, phone, location, linkedin, github, website,
    summary, experience, education, skills, certifications, languages, projects, awards } = data

  // ── Main column section renderers ──────────────────────────────────────────
  const mainSections = {
    summary: summary && (
      <div style={s.section}>
        <div style={s.sectionTitle}>Professional Summary</div>
        <div style={s.summaryText}>{summary}</div>
      </div>
    ),

    experience: experience?.length > 0 && (
      <div style={s.section}>
        <div style={s.sectionTitle} data-pdf-section-title="true">Work Experience</div>
        {experience.map((exp, i) => (
          <div key={i} style={s.expEntry} data-pdf-block="true">
            <div style={s.expHeader}>
              <div style={s.expTitle}>{exp.title}</div>
              {exp.dates && <div style={s.expDates}>{exp.dates}</div>}
            </div>
            <div style={s.expCompany}>
              {exp.company}{exp.location ? ` · ${exp.location}` : ''}
            </div>
            {exp.bullets?.map((b, j) => (
              <div key={j} style={s.bullet}>
                <span style={s.bulletDot}>▸</span>
                <span>{b}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    ),

    projects: projects?.length > 0 && (
      <div style={s.section}>
        <div style={s.sectionTitle} data-pdf-section-title="true">Projects</div>
        {projects.map((p, i) => (
          <div key={i} style={s.projectEntry} data-pdf-block="true">
            <div style={s.expHeader}>
              <div style={s.projectName}>{p.name}</div>
              {p.link && <div style={s.projectLink}>{p.link}</div>}
            </div>
            {p.tech && <div style={{ color: MUTED, fontSize: '10px', marginBottom: '4px' }}>{p.tech}</div>}
            {p.bullets?.map((b, j) => (
              <div key={j} style={s.bullet}>
                <span style={s.bulletDot}>▸</span>
                <span>{b}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    ),

    education: education?.length > 0 && (
      <div style={s.section}>
        <div style={s.sectionTitle} data-pdf-section-title="true">Education</div>
        {education.map((edu, i) => (
          <div key={i} style={s.eduEntry} data-pdf-block="true">
            <div style={s.expHeader}>
              <div style={s.eduDegree}>{edu.degree}</div>
              {edu.year && <div style={s.expDates}>{edu.year}</div>}
            </div>
            <div style={s.eduSchool}>{edu.school}</div>
            {edu.details?.map((d, j) => (
              <div key={j} style={s.bullet}>
                <span style={s.bulletDot}>▸</span>
                <span>{d}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    ),
  }

  // ── Sidebar section renderers ──────────────────────────────────────────────
  const sidebarSections = {
    skills: skills?.length > 0 && (
      <div style={s.section}>
        <div style={s.sidebarSectionTitle}>Skills</div>
        <div>{skills.map((skill, i) => (
          <span key={i} style={s.skillTag}>{skill}</span>
        ))}</div>
      </div>
    ),

    languages: languages?.length > 0 && (
      <div style={s.section}>
        <div style={s.sidebarSectionTitle}>Languages</div>
        {languages.map((lang, i) => (
          <div key={i} style={s.langItem}>• {lang}</div>
        ))}
      </div>
    ),

    certifications: certifications?.length > 0 && (
      <div style={s.section}>
        <div style={s.sidebarSectionTitle} data-pdf-section-title="true">Certifications</div>
        {certifications.map((cert, i) => (
          <div key={i} style={s.certItem} data-pdf-block="true">
            <div style={s.certName}>{cert.name}</div>
            {(cert.issuer || cert.year) && (
              <div style={s.certMeta}>{cert.issuer}{cert.year ? ` · ${cert.year}` : ''}</div>
            )}
          </div>
        ))}
      </div>
    ),

    awards: awards?.length > 0 && (
      <div style={s.section}>
        <div style={s.sidebarSectionTitle}>Awards</div>
        {awards.map((award, i) => (
          <div key={i} style={s.awardItem}>
            <span style={s.bulletDot}>▸</span>
            <span>{award}</span>
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
          {email    && <span style={s.contactItem}><span>✉</span> {email}</span>}
          {phone    && <span style={s.contactItem}><span>☎</span> {phone}</span>}
          {location && <span style={s.contactItem}><span>⌖</span> {location}</span>}
          {linkedin && <span style={s.contactItem}><span>in</span> {linkedin}</span>}
          {github   && <span style={s.contactItem}><span>⌥</span> {github}</span>}
          {website  && <span style={s.contactItem}><span>⊕</span> {website}</span>}
        </div>
      </div>

      {/* Body */}
      <div style={s.body}>
        {/* Main Column — ordered sections */}
        <div style={s.main}>
          {mainOrder.map(k => mainSections[k]
            ? <React.Fragment key={k}>{mainSections[k]}</React.Fragment>
            : null
          )}
        </div>

        {/* Sidebar — ordered sections */}
        <div style={s.sidebar}>
          {sidebarOrder.map(k => sidebarSections[k]
            ? <React.Fragment key={k}>{sidebarSections[k]}</React.Fragment>
            : null
          )}
        </div>
      </div>
    </div>
  )
}
