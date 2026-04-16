// New York — Executive Minimal template (bold typography, crimson accents)
import React from 'react'
import { sortBySectionOrder } from '../utils/sectionOrder'

const DARK  = '#111827'
const MUTED = '#6b7280'

// Main flow sections — reorderable
const MAIN_KEYS        = ['summary', 'experience', 'education', 'skills', 'projects']
// Two-col bottom left — reorderable within this zone
const BOTTOM_LEFT_KEYS = ['certifications', 'awards']
// Two-col bottom right — single item, kept for consistency
const BOTTOM_RIGHT_KEYS = ['languages']

export default function NewYorkTemplate({ data, theme = {}, sectionOrder = [] }) {
  const CRIMSON  = theme.hex  || '#9b1c1c'
  const LIGHT_BG = theme.light || '#fef2f2'
  const FONT     = theme.font || "'Inter', sans-serif"

  const mainOrder        = sortBySectionOrder(sectionOrder, MAIN_KEYS)
  const bottomLeftOrder  = sortBySectionOrder(sectionOrder, BOTTOM_LEFT_KEYS)
  const bottomRightOrder = sortBySectionOrder(sectionOrder, BOTTOM_RIGHT_KEYS)

  const s = {
  root: {
    fontFamily: FONT,
    width: '794px',
    minHeight: '1122px',
    background: '#fff',
    color: DARK,
    fontSize: '11px',
    lineHeight: '1.5',
    display: 'flex',
    flexDirection: 'column',
  },
  headerStrip: {
    background: DARK,
    height: '8px',
  },
  header: {
    padding: '36px 48px 28px',
    borderBottom: `1px solid #e5e7eb`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerLeft: {
    flex: 1,
  },
  name: {
    fontFamily: "'Raleway', sans-serif",
    fontSize: '36px',
    fontWeight: '800',
    letterSpacing: '-1px',
    color: DARK,
    lineHeight: '1',
    marginBottom: '6px',
  },
  jobTitle: {
    fontSize: '14px',
    fontWeight: '300',
    color: CRIMSON,
    letterSpacing: '1px',
    textTransform: 'uppercase',
  },
  contactBlock: {
    textAlign: 'right',
    fontSize: '10px',
    color: MUTED,
    lineHeight: '1.8',
  },
  contactStrong: {
    color: DARK,
    fontWeight: '500',
  },
  body: {
    padding: '32px 48px',
    flex: 1,
  },
  section: {
    marginBottom: '26px',
  },
  sectionTitle: {
    fontFamily: "'Raleway', sans-serif",
    fontSize: '13px',
    fontWeight: '700',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    color: CRIMSON,
    marginBottom: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  sectionTitleLine: {
    flex: 1,
    height: '1px',
    background: `${CRIMSON}60`,
  },
  summaryText: {
    fontSize: '11px',
    color: '#374151',
    lineHeight: '1.7',
    background: LIGHT_BG,
    padding: '12px 16px',
    borderLeft: `3px solid ${CRIMSON}`,
    borderRadius: '0 4px 4px 0',
  },
  expGrid: {
    display: 'grid',
    gridTemplateColumns: '140px 1fr',
    gap: '0 24px',
    marginBottom: '16px',
  },
  expLeft: {
    paddingTop: '2px',
  },
  expDates: {
    fontSize: '10px',
    color: CRIMSON,
    fontWeight: '600',
    marginBottom: '2px',
  },
  expCompany: {
    fontSize: '10px',
    color: MUTED,
    lineHeight: '1.4',
  },
  expRight: {},
  expTitle: {
    fontWeight: '700',
    fontSize: '12.5px',
    color: DARK,
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
    color: CRIMSON,
    fontWeight: '700',
    flexShrink: 0,
  },
  eduGrid: {
    display: 'grid',
    gridTemplateColumns: '140px 1fr',
    gap: '0 24px',
    marginBottom: '12px',
  },
  eduYear: {
    fontSize: '10px',
    color: CRIMSON,
    fontWeight: '600',
  },
  eduDegree: {
    fontWeight: '700',
    fontSize: '12px',
    color: DARK,
    marginBottom: '2px',
  },
  eduSchool: {
    fontSize: '10.5px',
    color: MUTED,
  },
  skillsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  skillChip: {
    fontSize: '10px',
    padding: '4px 12px',
    background: DARK,
    color: '#fff',
    borderRadius: '2px',
    fontWeight: '500',
  },
  twoCol: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0 40px',
  },
  certEntry: {
    marginBottom: '8px',
    paddingLeft: '12px',
    borderLeft: `2px solid ${CRIMSON}`,
  },
  certName: {
    fontWeight: '600',
    fontSize: '10.5px',
  },
  certMeta: {
    fontSize: '10px',
    color: MUTED,
  },
  projectEntry: {
    display: 'grid',
    gridTemplateColumns: '140px 1fr',
    gap: '0 24px',
    marginBottom: '12px',
  },
  projectLeft: {
    paddingTop: '2px',
  },
  projectLink: {
    fontSize: '9.5px',
    color: CRIMSON,
    wordBreak: 'break-all',
  },
  projectTech: {
    fontSize: '9.5px',
    color: MUTED,
    marginTop: '2px',
  },
  projectName: {
    fontWeight: '700',
    fontSize: '12px',
    color: DARK,
    marginBottom: '4px',
  },
  awardItem: {
    fontSize: '10.5px',
    marginBottom: '4px',
    paddingLeft: '12px',
    borderLeft: `2px solid ${CRIMSON}`,
  },
  langItem: {
    fontSize: '10.5px',
    color: '#374151',
    marginBottom: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  langDot: {
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    background: CRIMSON,
    flexShrink: 0,
  },
  }

  const { name, title, email, phone, location, linkedin, github, website,
    summary, experience, education, skills, certifications, languages, projects, awards } = data

  // ── Main flow section renderers ────────────────────────────────────────────
  const mainSections = {
    summary: summary && (
      <div style={s.section}>
        <div style={s.sectionTitle}>
          Profile
          <span style={s.sectionTitleLine} />
        </div>
        <div style={s.summaryText}>{summary}</div>
      </div>
    ),

    experience: experience?.length > 0 && (
      <div style={s.section}>
        <div style={s.sectionTitle} data-pdf-section-title="true">
          Experience
          <span style={s.sectionTitleLine} />
        </div>
        {experience.map((exp, i) => (
          <div key={i} style={s.expGrid} data-pdf-block="true">
            <div style={s.expLeft}>
              <div style={s.expDates}>{exp.dates || '—'}</div>
              <div style={s.expCompany}>{exp.company}</div>
              {exp.location && <div style={{ ...s.expCompany, marginTop: '2px' }}>{exp.location}</div>}
            </div>
            <div style={s.expRight}>
              <div style={s.expTitle}>{exp.title}</div>
              {exp.bullets?.map((b, j) => (
                <div key={j} style={s.bullet}>
                  <span style={s.bulletDot}>›</span>
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    ),

    education: education?.length > 0 && (
      <div style={s.section}>
        <div style={s.sectionTitle} data-pdf-section-title="true">
          Education
          <span style={s.sectionTitleLine} />
        </div>
        {education.map((edu, i) => (
          <div key={i} style={s.eduGrid} data-pdf-block="true">
            <div>
              <div style={s.eduYear}>{edu.year}</div>
            </div>
            <div>
              <div style={s.eduDegree}>{edu.degree}</div>
              <div style={s.eduSchool}>{edu.school}</div>
              {edu.details?.map((d, j) => (
                <div key={j} style={s.bullet}>
                  <span style={s.bulletDot}>›</span>
                  <span>{d}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    ),

    skills: skills?.length > 0 && (
      <div style={s.section}>
        <div style={s.sectionTitle}>
          Skills
          <span style={s.sectionTitleLine} />
        </div>
        <div style={s.skillsRow}>
          {skills.map((skill, i) => (
            <span key={i} style={s.skillChip}>{skill}</span>
          ))}
        </div>
      </div>
    ),

    projects: projects?.length > 0 && (
      <div style={s.section}>
        <div style={s.sectionTitle} data-pdf-section-title="true">
          Projects
          <span style={s.sectionTitleLine} />
        </div>
        {projects.map((p, i) => (
          <div key={i} style={s.projectEntry} data-pdf-block="true">
            <div style={s.projectLeft}>
              {p.link && <div style={s.projectLink}>{p.link}</div>}
              {p.tech && <div style={s.projectTech}>{p.tech}</div>}
            </div>
            <div>
              <div style={s.projectName}>{p.name}</div>
              {p.bullets?.map((b, j) => (
                <div key={j} style={s.bullet}>
                  <span style={s.bulletDot}>›</span>
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    ),
  }

  // ── Bottom two-col section renderers ───────────────────────────────────────
  const bottomLeftSections = {
    certifications: certifications?.length > 0 && (
      <div style={s.section}>
        <div style={s.sectionTitle}>
          Certifications
          <span style={s.sectionTitleLine} />
        </div>
        {certifications.map((cert, i) => (
          <div key={i} style={s.certEntry} data-pdf-block="true">
            <div style={s.certName}>{cert.name}</div>
            <div style={s.certMeta}>{cert.issuer}{cert.year ? ` · ${cert.year}` : ''}</div>
          </div>
        ))}
      </div>
    ),

    awards: awards?.length > 0 && (
      <div style={s.section}>
        <div style={s.sectionTitle}>
          Awards
          <span style={s.sectionTitleLine} />
        </div>
        {awards.map((award, i) => (
          <div key={i} style={s.awardItem}>{award}</div>
        ))}
      </div>
    ),
  }

  const bottomRightSections = {
    languages: languages?.length > 0 && (
      <div>
        <div style={s.section}>
          <div style={s.sectionTitle}>
            Languages
            <span style={s.sectionTitleLine} />
          </div>
          {languages.map((lang, i) => (
            <div key={i} style={s.langItem}>
              <span style={s.langDot} />
              {lang}
            </div>
          ))}
        </div>
      </div>
    ),
  }

  const hasBottomLeft  = bottomLeftOrder.some(k  => bottomLeftSections[k])
  const hasBottomRight = bottomRightOrder.some(k => bottomRightSections[k])

  return (
    <div style={s.root} id="resume-template">
      <div style={s.headerStrip} />
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <div style={s.name}>{name || 'Your Name'}</div>
          {title && <div style={s.jobTitle}>{title}</div>}
        </div>
        <div style={s.contactBlock}>
          {email    && <div><span style={s.contactStrong}>{email}</span></div>}
          {phone    && <div>{phone}</div>}
          {location && <div>{location}</div>}
          {linkedin && <div>{linkedin}</div>}
          {github   && <div>{github}</div>}
          {website  && <div>{website}</div>}
        </div>
      </div>

      <div style={s.body}>
        {/* Main flow — ordered sections */}
        {mainOrder.map(k => mainSections[k]
          ? <React.Fragment key={k}>{mainSections[k]}</React.Fragment>
          : null
        )}

        {/* Two-column bottom */}
        {(hasBottomLeft || hasBottomRight) && (
          <div style={s.twoCol}>
            <div>
              {bottomLeftOrder.map(k => bottomLeftSections[k]
                ? <React.Fragment key={k}>{bottomLeftSections[k]}</React.Fragment>
                : null
              )}
            </div>
            <div>
              {bottomRightOrder.map(k => bottomRightSections[k]
                ? <React.Fragment key={k}>{bottomRightSections[k]}</React.Fragment>
                : null
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
