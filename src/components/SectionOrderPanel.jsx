import React from 'react'

const SECTION_META = {
  summary:        { label: 'Summary / Profile',  icon: '≡' },
  experience:     { label: 'Experience',          icon: '⌚' },
  education:      { label: 'Education',           icon: '⬡' },
  skills:         { label: 'Skills',              icon: '⚡' },
  tools:          { label: 'Tools',               icon: '⚙' },
  projects:       { label: 'Projects',            icon: '◈' },
  certifications: { label: 'Certifications',      icon: '✦' },
  languages:      { label: 'Languages',           icon: '◎' },
  awards:         { label: 'Awards',              icon: '★' },
}

function hasContent(key, data) {
  if (!data) return false
  if (key === 'summary')        return !!(data.summary?.trim())
  if (key === 'experience')     return (data.experience?.length     ?? 0) > 0
  if (key === 'education')      return (data.education?.length      ?? 0) > 0
  if (key === 'skills')         return (data.skills?.length         ?? 0) > 0
  if (key === 'tools')          return (data.tools?.length          ?? 0) > 0
  if (key === 'projects')       return (data.projects?.length       ?? 0) > 0
  if (key === 'certifications') return (data.certifications?.length ?? 0) > 0
  if (key === 'languages')      return (data.languages?.length      ?? 0) > 0
  if (key === 'awards')         return (data.awards?.length         ?? 0) > 0
  return false
}

export default function SectionOrderPanel({ sectionOrder, onMove, data }) {
  return (
    <div className="so-panel">
      <div className="so-hint">Reorder sections — templates respect this order within each column</div>
      <ul className="so-list">
        {sectionOrder.map((key, i) => {
          const meta    = SECTION_META[key] || { label: key, icon: '·' }
          const active  = hasContent(key, data)
          const isFirst = i === 0
          const isLast  = i === sectionOrder.length - 1

          return (
            <li key={key} className={`so-item ${active ? 'so-item--active' : 'so-item--empty'}`}>
              <span className="so-drag" aria-hidden="true">⠿</span>
              <span className="so-icon">{meta.icon}</span>
              <span className="so-label">{meta.label}</span>
              {!active && <span className="so-empty-tag">empty</span>}
              <div className="so-buttons">
                <button
                  className="so-btn"
                  onClick={() => onMove(key, -1)}
                  disabled={isFirst}
                  aria-label={`Move ${meta.label} up`}
                  title="Move up"
                >↑</button>
                <button
                  className="so-btn"
                  onClick={() => onMove(key, 1)}
                  disabled={isLast}
                  aria-label={`Move ${meta.label} down`}
                  title="Move down"
                >↓</button>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
