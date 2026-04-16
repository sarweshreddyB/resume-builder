// ─── Section keyword detection ────────────────────────────────────────────────
const SECTION_KEYWORDS = {
  personal:       ['personal info', 'personal', 'contact info', 'contact'],
  summary:        ['summary', 'objective', 'profile', 'about me', 'about', 'professional summary', 'career objective'],
  experience:     ['experience', 'work experience', 'employment history', 'work history', 'professional experience', 'employment'],
  education:      ['education', 'academic background', 'academics', 'educational background'],
  skills:         ['skills', 'technical skills', 'core competencies', 'competencies', 'key skills', 'areas of expertise'],
  tools:          ['tools', 'tool', 'dev tools', 'development tools', 'software tools'],
  certifications: ['certifications', 'certification', 'licenses', 'credentials', 'certificates'],
  languages:      ['languages', 'language skills'],
  projects:       ['projects', 'personal projects', 'side projects', 'key projects'],
  awards:         ['awards', 'honors', 'achievements', 'recognitions'],
  volunteer:      ['volunteer', 'volunteering', 'community service', 'volunteer experience'],
}

// Broad date pattern: MM/YYYY, Month YYYY, YYYY — to/from present
const DATE_PATTERN = /(\d{1,2}\/\d{4}|\w{3,9}\.?\s+\d{4}|\d{4})\s*[-–]\s*(\d{1,2}\/\d{4}|\w{3,9}\.?\s+\d{4}|\d{4}|present|current)/i

function isDateLine(str) {
  return DATE_PATTERN.test(str.trim())
}

function isBulletLine(str) {
  return /^[-•*]\s/.test(str.trim())
}

function isLongDescription(str) {
  const t = str.trim()
  return t.length > 70 && !isBulletLine(str) && !isDateLine(str)
}

function isAchievementsLabel(str) {
  return /^(achievements\/tasks|responsibilities|duties|key responsibilities)$/i.test(str.trim())
}
// kept for backward compat
function isSkipLabel(str) { return false }

function isSeparatorLine(str) {
  return /^[-=*]{4,}\s*$/.test(str.trim())
}

// ─── Detect section type ──────────────────────────────────────────────────────
function detectSectionType(line) {
  const normalized = line.toLowerCase().replace(/[[\]]/g, '').trim()
  for (const [type, keywords] of Object.entries(SECTION_KEYWORDS)) {
    if (keywords.some(k =>
      normalized === k ||
      normalized.startsWith(k + ':') ||
      normalized.endsWith(k)
    )) return type
  }
  return null
}

function isLikelySectionHeader(line) {
  const trimmed = line.trim()
  if (!trimmed || isSeparatorLine(trimmed)) return false
  if (/^\[.+\]$/.test(trimmed)) return true                               // [Bracket]
  if (/^[A-Z\s&\/]{3,}$/.test(trimmed) && trimmed.length <= 40) return true  // ALL CAPS
  if (detectSectionType(trimmed)) return true                              // Known keyword
  return false
}

// ─── Contact-line parsing (pipe-separated or raw) ─────────────────────────────
function extractContactFromLine(line, out) {
  const parts = line.includes('|')
    ? line.split(/\s*\|\s*/).map(s => s.trim()).filter(Boolean)
    : [line.trim()]

  for (const part of parts) {
    if (!part) continue
    if (!out.email    && /^[\w._%+-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(part))  { out.email    = part; continue }
    if (!out.phone    && /^(\+?[\d\s\-().]{7,15})$/.test(part))             { out.phone    = part; continue }
    if (!out.linkedin && /linkedin\.com/i.test(part))                        { out.linkedin = part.replace(/^https?:\/\//i,''); continue }
    if (!out.github   && /github\.com/i.test(part))                          { out.github   = part.replace(/^https?:\/\//i,''); continue }
    if (!out.website  && /^https?:\/\//i.test(part))                         { out.website  = part; continue }
    if (!out.location && part.length > 2 && part.length < 60 &&
        !out.email && !isDateLine(part))                                      { out.location = part }
  }
}

// ─── Parse experience / project entries (multi-line OR pipe format) ───────────
function parseMultiLineEntries(lines, isProject = false) {
  // Split the section into groups separated by blank lines
  const groups = []
  let cur = []
  for (const line of lines) {
    if (!line.trim()) {
      if (cur.length) { groups.push(cur); cur = [] }
    } else {
      cur.push(line)
    }
  }
  if (cur.length) groups.push(cur)

  return groups.map(group => {
    const entry = { title:'', company:'', location:'', dates:'', description:'', bullets:[], tech:'', link:'' }
    let phase = 'title'

    for (let i = 0; i < group.length; i++) {
      const raw  = group[i]
      const line = raw.trim()
      if (!line || isSeparatorLine(line)) continue

      // "Achievements/Tasks" label — stop meta phase, start bullets
      if (isAchievementsLabel(line)) { phase = 'bullets'; continue }

      // Bullet → always collect
      if (isBulletLine(raw)) {
        entry.bullets.push(line.replace(/^[-•*]\s+/, ''))
        phase = 'bullets'
        continue
      }

      // Pipe-separated single line: Title | Company | [Location |] Dates
      if (phase === 'title' && line.includes('|')) {
        const parts = line.split(/\s*\|\s*/)
        entry.title = parts[0] || ''
        if (isProject) {
          entry.link = parts[1] || ''
          entry.tech = parts[2] || ''
        } else {
          const dateIdx = parts.findIndex((p, idx) => idx > 0 && isDateLine(p))
          if (dateIdx !== -1) {
            entry.dates   = parts[dateIdx]
            entry.company = parts[1] || ''
            if (dateIdx > 2) entry.location = parts[2] || ''
          } else {
            entry.company  = parts[1] || ''
            entry.location = parts[2] || ''
            entry.dates    = parts[3] || ''
          }
        }
        phase = 'bullets'
        continue
      }

      if (phase === 'title') {
        entry.title = line
        phase = isProject ? 'dates' : 'company'
        continue
      }

      if (phase === 'company') {
        if (isDateLine(line)) { entry.dates = line; phase = 'meta'; continue }
        entry.company = line
        phase = 'dates'
        continue
      }

      if (phase === 'dates') {
        if (isDateLine(line)) { entry.dates = line; phase = 'meta'; continue }
        if (/^[A-Za-z][a-zA-Z\s,]+$/.test(line) && line.length < 50) {
          entry.location = line; continue
        }
        if (isLongDescription(line)) { entry.description = line; phase = 'meta'; continue }
        entry.dates = line
        phase = 'meta'
        continue
      }

      if (phase === 'meta') {
        if (isDateLine(line) && !entry.dates)   { entry.dates = line; continue }
        if (!entry.location && /^[A-Za-z][a-zA-Z\s,]+$/.test(line) && line.length < 50) {
          entry.location = line; continue
        }
        if (!entry.description && isLongDescription(line)) { entry.description = line; continue }
      }

      if (phase === 'dates' && isProject) {
        if (isDateLine(line)) { entry.dates = line; phase = 'meta'; continue }
      }
    }

    return entry
  }).filter(e => e.title && !isSeparatorLine(e.title))
}

// ─── Education entries ────────────────────────────────────────────────────────
function parseEducationEntries(lines) {
  const groups = []
  let cur = []
  for (const line of lines) {
    if (!line.trim()) {
      if (cur.length) { groups.push(cur); cur = [] }
    } else {
      cur.push(line)
    }
  }
  if (cur.length) groups.push(cur)

  return groups.map(group => {
    const entry = { degree:'', school:'', year:'', details:[] }
    let phase = 'degree'

    for (const raw of group) {
      const line = raw.trim()
      if (!line || isSeparatorLine(line) || isSkipLabel(line)) continue

      if (isBulletLine(raw)) {
        entry.details.push(line.replace(/^[-•*]\s+/, ''))
        continue
      }

      // Single pipe-separated line
      if (phase === 'degree' && line.includes('|')) {
        const parts = line.split(/\s*\|\s*/)
        entry.degree = parts[0] || ''
        entry.school = parts[1] || ''
        entry.year   = parts[2] || ''
        phase = 'done'
        continue
      }

      if (phase === 'degree') {
        entry.degree = line
        phase = 'school'
        continue
      }

      if (phase === 'school') {
        if (isDateLine(line)) {
          // Extract graduation year (last year in range)
          const years = line.match(/\d{4}/g)
          entry.year = years ? years[years.length - 1] : line
          phase = 'details'
        } else {
          entry.school = line
          phase = 'year'
        }
        continue
      }

      if (phase === 'year') {
        if (isDateLine(line)) {
          const years = line.match(/\d{4}/g)
          entry.year = years ? years[years.length - 1] : line
        } else if (/^\d{4}$/.test(line)) {
          entry.year = line
        } else if (!/^[A-Za-z][a-zA-Z\s,]+$/.test(line) || line.length > 50) {
          // Probably a detail
          entry.details.push(line.replace(/^[-•*]\s+/,''))
        }
        phase = 'details'
        continue
      }
    }

    return entry
  }).filter(e => e.degree && !isSeparatorLine(e.degree))
}

// ─── Main parse function ──────────────────────────────────────────────────────
export function parseResume(text) {
  // ── Pre-process: remove separator lines ────────────────────────────────────
  const cleaned = text.split('\n')
    .map(l => isSeparatorLine(l) ? '' : l)
    .join('\n')

  const lines = cleaned.split('\n')

  const data = {
    name:'', title:'', email:'', phone:'', location:'', linkedin:'', github:'', website:'',
    summary:'', experience:[], education:[], skills:[], tools:[], certifications:[],
    languages:[], projects:[], awards:[],
  }

  // ── Split into raw sections ─────────────────────────────────────────────────
  const sections = []
  let current = { type:'header', lines:[] }

  for (const line of lines) {
    if (isLikelySectionHeader(line)) {
      sections.push(current)
      const sType = detectSectionType(line) || line.trim().replace(/[\[\]]/g,'').toLowerCase()
      current = { type: sType, header: line.trim(), lines:[] }
    } else {
      current.lines.push(line)
    }
  }
  sections.push(current)

  // ── Parse HEADER section ────────────────────────────────────────────────────
  const headerSection = sections.find(s => s.type === 'header')
  if (headerSection) {
    const hLines = headerSection.lines
    const nonEmpty = hLines.filter(l => l.trim())

    // Pass 1: pick up structured key:value lines
    for (const line of nonEmpty) {
      const kv = line.trim().match(/^([A-Za-z\s]+):\s*(.+)$/)
      if (kv) {
        const key = kv[1].trim().toLowerCase()
        const val = kv[2].trim()
        if (key === 'name' && !data.name)                    data.name     = val
        else if ((key === 'title'||key==='position')&&!data.title) data.title = val
        else if (key === 'email' && !data.email)             data.email    = val
        else if (key === 'phone' && !data.phone)             data.phone    = val
        else if ((key==='location'||key==='city'||key==='address') && !data.location) data.location = val
        else if (key === 'linkedin' && !data.linkedin)       data.linkedin = val
        else if (key === 'github' && !data.github)           data.github   = val
        else if (key === 'website' && !data.website)         data.website  = val
      }
    }

    // Pass 2: infer from lines that don't have key:value structure
    const summaryLines = []
    for (let i = 0; i < nonEmpty.length; i++) {
      const line = nonEmpty[i].trim()
      if (!line) continue
      // URLs must be checked BEFORE the key:value skip (https: would match key:value regex)
      if (!data.linkedin && /linkedin\.com/i.test(line)) {
        data.linkedin = line.replace(/^https?:\/\//i, ''); continue
      }
      if (!data.github && /github\.com/i.test(line)) {
        data.github = line.replace(/^https?:\/\//i, ''); continue
      }
      if (!data.website && /^https?:\/\//i.test(line)) {
        data.website = line; continue
      }
      if (line.match(/^([A-Za-z\s]+):\s*(.+)$/)) continue  // already handled

      // Index 0 → name
      if (i === 0 && !data.name) { data.name = line; continue }

      // Email
      if (!data.email && /^[\w._%+-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(line)) {
        data.email = line; continue
      }
      // Phone (pure digits or formatted)
      if (!data.phone && /^(\+?[\d\s\-().]{7,15})$/.test(line)) {
        data.phone = line; continue
      }
      // LinkedIn URL
      if (!data.linkedin && /linkedin\.com/i.test(line)) {
        data.linkedin = line.replace(/^https?:\/\//i,''); continue
      }
      // GitHub URL
      if (!data.github && /github\.com/i.test(line)) {
        data.github = line.replace(/^https?:\/\//i,''); continue
      }
      // Any URL
      if (!data.website && /^https?:\/\//i.test(line)) {
        data.website = line; continue
      }
      // Pipe-separated contact line
      if (line.includes('|')) {
        extractContactFromLine(line, data); continue
      }
      // Location: short, looks like "City" or "City, Country"
      if (!data.location && /^[A-Z][a-zA-Z\s]+(,\s*[A-Za-z\s]+)?$/.test(line) && line.length < 50 && !isDateLine(line)) {
        // Only set if we've already got name (avoid setting name as location)
        if (data.name && !data.title) { /* might be title */ }
        if (data.name && data.email) { data.location = line; continue }
      }
      // Short line that looks like a job title (has no sentence structure) → title
      if (!data.title && line.length < 70 && !isDateLine(line) &&
          !/[.!?]/.test(line) && data.name && (data.email || data.phone)) {
        data.title = line; continue
      }
      // Long sentence → candidate for summary
      if (line.length > 30) {
        summaryLines.push(line)
      }
    }

    // If we haven't found a title yet, look for the shortest non-contact short line after name
    if (!data.title) {
      for (const line of nonEmpty) {
        const t = line.trim()
        if (t && t !== data.name && !t.includes('@') && !isDateLine(t) &&
            !/^https?:\/\//i.test(t) && t.length < 70 && !/[.!?]/.test(t) &&
            !/^[\d\s\-().+]{7,}$/.test(t)) {
          data.title = t; break
        }
      }
    }

    // Summary: long sentence lines that aren't contact/title
    const summaryCandidates = summaryLines.filter(l => {
      const t = l.trim()
      return t !== data.name && t !== data.title && t !== data.email &&
             t !== data.phone && t !== data.location && t !== data.linkedin &&
             t !== data.github && t !== data.website &&
             !t.includes('@') && !/^[\d\s\-().+]{7,}$/.test(t) &&
             !/linkedin\.com/i.test(t) && !/github\.com/i.test(t)
    })
    if (summaryCandidates.length && !data.summary) {
      data.summary = summaryCandidates.join(' ').trim()
    }
  }

  // ── Parse each named section ────────────────────────────────────────────────
  for (const section of sections) {
    if (section.type === 'header') continue
    const lines = section.lines

    switch (section.type) {

      case 'personal':
      case 'contact':
      case 'contact info':
        for (const line of lines) {
          const kv = line.trim().match(/^([A-Za-z\s]+):\s*(.+)$/)
          if (kv) {
            const k = kv[1].trim().toLowerCase(), v = kv[2].trim()
            if (k==='name'&&!data.name)                    data.name     = v
            if ((k==='title'||k==='position')&&!data.title) data.title   = v
            if (k==='email'&&!data.email)                  data.email    = v
            if (k==='phone'&&!data.phone)                  data.phone    = v
            if ((k==='location'||k==='city')&&!data.location) data.location = v
            if (k==='linkedin'&&!data.linkedin)            data.linkedin = v
            if (k==='github'&&!data.github)                data.github   = v
            if (k==='website'&&!data.website)              data.website  = v
          } else {
            extractContactFromLine(line, data)
          }
        }
        break

      case 'summary':
      case 'objective':
      case 'profile':
      case 'about':
      case 'about me':
        data.summary = lines.filter(l => l.trim()).join(' ').trim()
        break

      case 'experience':
      case 'work experience':
      case 'employment':
        data.experience = parseMultiLineEntries(lines, false)
        break

      case 'education':
        data.education = parseEducationEntries(lines)
        break

      case 'skills':
      case 'technical skills':
      case 'competencies': {
        // Handle both "skill1, skill2" and one-per-line-with-dash formats
        const rawText = lines.join('\n')
        const hasPipeOrComma = rawText.includes(',') || rawText.includes(';')
        if (hasPipeOrComma) {
          const allText = lines.filter(l => l.trim()).join(' ')
          const newSkills = allText.split(/[,;\|•\n]/)
            .map(s => s.trim().replace(/^[-*•]\s*/, ''))
            .filter(s => s.length > 1 && s.length < 60)
          data.skills.push(...newSkills.filter(s => !data.skills.includes(s)))
        } else {
          lines.filter(l => l.trim()).forEach(l => {
            const skill = l.trim().replace(/^[-*•]\s*/, '').trim()
            if (skill && skill.length > 1 && skill.length < 60 && !data.skills.includes(skill)) {
              data.skills.push(skill)
            }
          })
        }
        break
      }

      case 'tools': {
        lines.filter(l => l.trim() && !isSeparatorLine(l)).forEach(l => {
          const item = l.trim().replace(/^[-*•]\s*/, '').trim()
          if (item && item.length > 1 && item.length < 60 && !data.tools.includes(item)) {
            data.tools.push(item)
          }
        })
        break
      }

      case 'certifications':
      case 'certification': {
        const certLines = lines.filter(l => l.trim() && !isSeparatorLine(l))
        data.certifications = certLines.map(l => {
          const t = l.trim().replace(/^[-•*]\s*/, '')
          const parts = t.split(/\s*\|\s*/)
          return { name: parts[0]||'', issuer: parts[1]||'', year: parts[2]||'' }
        }).filter(c => c.name)
        break
      }

      case 'languages': {
        const allText = lines.filter(l => l.trim()).join(' ')
        const hasSep = allText.includes(',') || allText.includes(';')
        if (hasSep) {
          data.languages = allText.split(/[,;\n]/).map(s => s.trim().replace(/^[-•*]\s*/,'')).filter(Boolean)
        } else {
          data.languages = lines.filter(l=>l.trim()).map(l=>l.trim().replace(/^[-•*]\s*/,'')).filter(Boolean)
        }
        break
      }

      case 'projects':
        data.projects = parseMultiLineEntries(lines, true)
        break

      case 'awards':
      case 'honors':
      case 'achievements':
        data.awards = lines
          .filter(l => l.trim() && !isSeparatorLine(l))
          .map(l => l.trim().replace(/^[-•*]\s*/, ''))
          .filter(Boolean)
        break

      default:
        break
    }
  }

  return data
}
