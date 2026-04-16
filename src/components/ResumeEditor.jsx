/**
 * ResumeEditor
 *
 * Reads ALL state directly from useResumeStore — no props.
 * Each list section is broken into per-item sub-components that subscribe
 * only to their specific store slice. Typing in ExperienceCard[0] causes:
 *   - ExperienceCard[0] to re-render  ✓
 *   - ExperienceCard[1] to NOT re-render  ✓
 *   - EducationSection, SkillsSection, etc. to NOT re-render  ✓
 *
 * BulletRow subscribes to a single primitive string, so typing in bullet[0]
 * does not re-render bullet[1].
 */
import React, { useRef } from 'react'
import TagInput from './TagInput'
import { useResumeStore } from '../store/useResumeStore'

// ── Item factories ─────────────────────────────────────────────────────────────
const newExp  = () => ({ title:'', company:'', location:'', dates:'', bullets:[''] })
const newEdu  = () => ({ degree:'', school:'', year:'', details:[] })
const newProj = () => ({ name:'', dates:'', tech:'', link:'', bullets:[''] })
const newCert = () => ({ name:'', issuer:'', year:'' })

// ══════════════════════════════════════════════════════════════════════════════
// Section gate — renders only the active section
// ══════════════════════════════════════════════════════════════════════════════
export default function ResumeEditor() {
  const activeSection = useResumeStore(s => s.activeSection)

  if (activeSection === 'personal')       return <PersonalSection />
  if (activeSection === 'summary')        return <SummarySection />
  if (activeSection === 'experience')     return <ExperienceSection />
  if (activeSection === 'education')      return <EducationSection />
  if (activeSection === 'skills')         return <SkillsSection />
  if (activeSection === 'projects')       return <ProjectsSection />
  if (activeSection === 'certifications') return <CertificationsSection />
  if (activeSection === 'languages')      return <LanguagesSection />
  if (activeSection === 'awards')         return <AwardsSection />
  return null
}

// ══════════════════════════════════════════════════════════════════════════════
// PERSONAL INFO
// ══════════════════════════════════════════════════════════════════════════════
function PersonalSection() {
  const photo        = useResumeStore(s => s.photo)
  const setPhoto     = useResumeStore(s => s.setPhoto)
  const setField     = useResumeStore(s => s.setField)
  const name         = useResumeStore(s => s.resumeData?.name         ?? '')
  const title        = useResumeStore(s => s.resumeData?.title        ?? '')
  const email        = useResumeStore(s => s.resumeData?.email        ?? '')
  const phone        = useResumeStore(s => s.resumeData?.phone        ?? '')
  const location     = useResumeStore(s => s.resumeData?.location     ?? '')
  const website      = useResumeStore(s => s.resumeData?.website      ?? '')
  const linkedin     = useResumeStore(s => s.resumeData?.linkedin     ?? '')
  const github       = useResumeStore(s => s.resumeData?.github       ?? '')
  const photoInputRef = useRef(null)

  const handlePhotoFile = e => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setPhoto(ev.target.result)
    reader.readAsDataURL(file)
  }

  return (
    <div>
      <div className="nv-field">
        <label className="nv-label">
          Profile Photo <span style={{fontWeight:400,color:'var(--muted)'}}>— optional</span>
        </label>
        <div style={{display:'flex',gap:16,alignItems:'center'}}>
          <div className="nv-photo-area" onClick={() => photoInputRef.current?.click()} title="Click to upload">
            <input ref={photoInputRef} type="file" accept="image/*" style={{display:'none'}} onChange={handlePhotoFile} />
            {photo
              ? <img src={photo} alt="profile" className="nv-photo-img" />
              : <div className="nv-photo-placeholder"><span className="nv-photo-icon">🖼</span><span>Add photo</span></div>
            }
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            <button className="btn-outline btn-sm" onClick={() => photoInputRef.current?.click()}>
              {photo ? 'Change photo' : 'Upload photo'}
            </button>
            {photo && <button className="btn-ghost btn-sm" onClick={() => setPhoto(null)}>Remove</button>}
            <span style={{fontSize:11,color:'var(--muted)',lineHeight:1.5}}>JPG, PNG or GIF</span>
          </div>
        </div>
      </div>

      <div style={{height:1,background:'var(--border)',margin:'14px 0'}} />

      <div className="nv-row">
        <div className="nv-field">
          <label className="nv-label">Full Name</label>
          <input className="nv-input" value={name} onChange={e => setField('name', e.target.value)} placeholder="John Smith" />
        </div>
        <div className="nv-field">
          <label className="nv-label">Job Title</label>
          <input className="nv-input" value={title} onChange={e => setField('title', e.target.value)} placeholder="Senior Software Engineer" />
        </div>
      </div>
      <div className="nv-row">
        <div className="nv-field">
          <label className="nv-label">Email</label>
          <input className="nv-input" type="email" value={email} onChange={e => setField('email', e.target.value)} placeholder="john@example.com" />
        </div>
        <div className="nv-field">
          <label className="nv-label">Phone</label>
          <input className="nv-input" type="tel" value={phone} onChange={e => setField('phone', e.target.value)} placeholder="+1 (555) 000-0000" />
        </div>
      </div>
      <div className="nv-row">
        <div className="nv-field">
          <label className="nv-label">Location</label>
          <input className="nv-input" value={location} onChange={e => setField('location', e.target.value)} placeholder="San Francisco, CA" />
        </div>
        <div className="nv-field">
          <label className="nv-label">Website</label>
          <input className="nv-input" value={website} onChange={e => setField('website', e.target.value)} placeholder="yoursite.com" />
        </div>
      </div>
      <div className="nv-row">
        <div className="nv-field">
          <label className="nv-label">LinkedIn</label>
          <input className="nv-input" value={linkedin} onChange={e => setField('linkedin', e.target.value)} placeholder="linkedin.com/in/john" />
        </div>
        <div className="nv-field">
          <label className="nv-label">GitHub</label>
          <input className="nv-input" value={github} onChange={e => setField('github', e.target.value)} placeholder="github.com/john" />
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// SUMMARY
// ══════════════════════════════════════════════════════════════════════════════
function SummarySection() {
  const summary  = useResumeStore(s => s.resumeData?.summary ?? '')
  const setField = useResumeStore(s => s.setField)
  return (
    <div>
      <div className="nv-field">
        <label className="nv-label">Professional Summary</label>
        <textarea
          className="nv-input"
          rows={8}
          value={summary}
          onChange={e => setField('summary', e.target.value)}
          placeholder="Write 3–5 sentences highlighting your key experience, skills, and what you bring to the role…"
        />
      </div>
      <div style={{fontSize:12,color:'var(--muted)',marginTop:4}}>
        {summary.length > 0
          ? `${summary.length} characters`
          : 'Tip: A strong summary is 3–5 sentences and starts with your title and years of experience.'}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// EXPERIENCE  —  list-level shell + per-card sub-components
// ══════════════════════════════════════════════════════════════════════════════
function ExperienceSection() {
  const count       = useResumeStore(s => s.resumeData?.experience?.length ?? 0)
  const addListItem = useResumeStore(s => s.addListItem)
  return (
    <div>
      {Array.from({length: count}, (_, i) => <ExperienceCard key={i} index={i} />)}
      <button className="nv-add-btn" onClick={() => addListItem('experience', newExp())}>
        + Add Work Experience
      </button>
    </div>
  )
}

// Subscribes only to experience[index] — other cards are not affected by this
// card's mutations because immer preserves references for untouched items.
function ExperienceCard({ index }) {
  const entry          = useResumeStore(s => s.resumeData?.experience?.[index])
  const bulletCount    = useResumeStore(s => s.resumeData?.experience?.[index]?.bullets?.length ?? 0)
  const setListField   = useResumeStore(s => s.setListField)
  const removeListItem = useResumeStore(s => s.removeListItem)
  const addBullet      = useResumeStore(s => s.addBullet)

  if (!entry) return null

  return (
    <div className="nv-card">
      <div className="nv-card-header">
        <div className="nv-card-title">
          <span className="nv-card-num">{index + 1}</span>
          {entry.title || entry.company || `Position #${index + 1}`}
        </div>
        <button className="nv-card-remove" onClick={() => removeListItem('experience', index)}>✕</button>
      </div>
      <div className="nv-row">
        <div className="nv-field">
          <label className="nv-label">Job Title</label>
          <input className="nv-input" value={entry.title||''} onChange={e => setListField('experience', index, 'title', e.target.value)} placeholder="Software Engineer" />
        </div>
        <div className="nv-field">
          <label className="nv-label">Company</label>
          <input className="nv-input" value={entry.company||''} onChange={e => setListField('experience', index, 'company', e.target.value)} placeholder="Company Inc." />
        </div>
      </div>
      <div className="nv-row">
        <div className="nv-field">
          <label className="nv-label">Location</label>
          <input className="nv-input" value={entry.location||''} onChange={e => setListField('experience', index, 'location', e.target.value)} placeholder="City, State" />
        </div>
        <div className="nv-field">
          <label className="nv-label">Dates</label>
          <input className="nv-input" value={entry.dates||''} onChange={e => setListField('experience', index, 'dates', e.target.value)} placeholder="Jan 2020 – Present" />
        </div>
      </div>
      <div className="nv-field">
        <label className="nv-label">Achievements</label>
        <div className="nv-bullet-list">
          {Array.from({length: bulletCount}, (_, j) => (
            <BulletRow key={j} list="experience" itemIndex={index} bulletIndex={j} />
          ))}
        </div>
        <button className="nv-add-bullet" onClick={() => addBullet('experience', index)}>+ Add bullet</button>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// EDUCATION
// ══════════════════════════════════════════════════════════════════════════════
function EducationSection() {
  const count       = useResumeStore(s => s.resumeData?.education?.length ?? 0)
  const addListItem = useResumeStore(s => s.addListItem)
  return (
    <div>
      {Array.from({length: count}, (_, i) => <EducationCard key={i} index={i} />)}
      <button className="nv-add-btn" onClick={() => addListItem('education', newEdu())}>
        + Add Education
      </button>
    </div>
  )
}

function EducationCard({ index }) {
  const entry          = useResumeStore(s => s.resumeData?.education?.[index])
  const detailCount    = useResumeStore(s => s.resumeData?.education?.[index]?.details?.length ?? 0)
  const setListField   = useResumeStore(s => s.setListField)
  const removeListItem = useResumeStore(s => s.removeListItem)
  const setEduDetail   = useResumeStore(s => s.setEduDetail)
  const addEduDetail   = useResumeStore(s => s.addEduDetail)
  const removeEduDetail= useResumeStore(s => s.removeEduDetail)

  if (!entry) return null

  return (
    <div className="nv-card">
      <div className="nv-card-header">
        <div className="nv-card-title">
          <span className="nv-card-num">{index + 1}</span>
          {entry.degree || entry.school || `Education #${index + 1}`}
        </div>
        <button className="nv-card-remove" onClick={() => removeListItem('education', index)}>✕</button>
      </div>
      <div className="nv-field">
        <label className="nv-label">Degree / Qualification</label>
        <input className="nv-input" value={entry.degree||''} onChange={e => setListField('education', index, 'degree', e.target.value)} placeholder="B.S. Computer Science" />
      </div>
      <div className="nv-row">
        <div className="nv-field">
          <label className="nv-label">Institution</label>
          <input className="nv-input" value={entry.school||''} onChange={e => setListField('education', index, 'school', e.target.value)} placeholder="Stanford University" />
        </div>
        <div className="nv-field">
          <label className="nv-label">Graduation Year</label>
          <input className="nv-input" value={entry.year||''} onChange={e => setListField('education', index, 'year', e.target.value)} placeholder="2020" />
        </div>
      </div>
      <div className="nv-field">
        <label className="nv-label">Details <span style={{fontWeight:400,color:'var(--muted)'}}>— GPA, honors</span></label>
        <div className="nv-bullet-list">
          {Array.from({length: detailCount}, (_, j) => {
            const detail = entry.details?.[j] ?? ''
            return (
              <div key={j} className="nv-bullet-row">
                <span className="nv-bullet-drag">⠿</span>
                <input
                  className="nv-bullet-input"
                  style={{minHeight:'auto',padding:'7px 10px'}}
                  value={detail}
                  onChange={e => setEduDetail(index, j, e.target.value)}
                  placeholder="GPA: 3.8 / 4.0"
                />
                <button className="nv-bullet-remove" onClick={() => removeEduDetail(index, j)}>✕</button>
              </div>
            )
          })}
        </div>
        <button className="nv-add-bullet" onClick={() => addEduDetail(index)}>+ Add detail</button>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// SKILLS
// ══════════════════════════════════════════════════════════════════════════════
function SkillsSection() {
  const skills      = useResumeStore(s => s.resumeData?.skills      ?? [])
  const skillLevels = useResumeStore(s => s.resumeData?.skillLevels ?? {})
  const tools       = useResumeStore(s => s.resumeData?.tools       ?? [])
  const setField    = useResumeStore(s => s.setField)
  const setSkillLevel = useResumeStore(s => s.setSkillLevel)

  return (
    <div>
      <div className="nv-field">
        <label className="nv-label">Skills</label>
        <div style={{fontSize:12,color:'var(--muted)',marginBottom:8}}>Type a skill and press Enter or comma to add</div>
        <TagInput value={skills} onChange={v => setField('skills', v)} placeholder="JavaScript, Python, Docker…" color="var(--brand)" />
      </div>

      {skills.length > 0 && (
        <div style={{marginTop:18}}>
          <div style={{fontSize:13,fontWeight:600,color:'var(--text-2)',marginBottom:3}}>
            Proficiency Levels <span style={{fontWeight:400,color:'var(--muted)'}}>— optional</span>
          </div>
          <div style={{fontSize:12,color:'var(--muted)',marginBottom:10}}>Click dots to rate each skill</div>
          {skills.map((skill, i) => {
            const level = skillLevels?.[skill] ?? 0
            return (
              <div key={i} className="nv-skill-row">
                <span className="nv-skill-name">{skill}</span>
                <div className="nv-skill-dots">
                  {[1,2,3,4,5].map(l => (
                    <button
                      key={l}
                      className={`nv-skill-dot ${l <= level ? 'active' : ''}`}
                      title={['','Beginner','Basic','Intermediate','Advanced','Expert'][l]}
                      onClick={() => setSkillLevel(skill, l)}
                    />
                  ))}
                </div>
                {level > 0 && (
                  <span style={{fontSize:11,color:'var(--muted)',minWidth:70,textAlign:'right'}}>
                    {['','Beginner','Basic','Intermediate','Advanced','Expert'][level]}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}

      <div className="nv-section-sep" />

      <div className="nv-field">
        <label className="nv-label">Tools &amp; Technologies</label>
        <div style={{fontSize:12,color:'var(--muted)',marginBottom:8}}>Frameworks, platforms, tools you use</div>
        <TagInput value={tools} onChange={v => setField('tools', v)} placeholder="AWS, Docker, Git, Figma…" color="#6366f1" />
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// PROJECTS
// ══════════════════════════════════════════════════════════════════════════════
function ProjectsSection() {
  const count       = useResumeStore(s => s.resumeData?.projects?.length ?? 0)
  const addListItem = useResumeStore(s => s.addListItem)
  return (
    <div>
      {Array.from({length: count}, (_, i) => <ProjectCard key={i} index={i} />)}
      <button className="nv-add-btn" onClick={() => addListItem('projects', newProj())}>
        + Add Project
      </button>
    </div>
  )
}

function ProjectCard({ index }) {
  const entry          = useResumeStore(s => s.resumeData?.projects?.[index])
  const bulletCount    = useResumeStore(s => s.resumeData?.projects?.[index]?.bullets?.length ?? 0)
  const setListField   = useResumeStore(s => s.setListField)
  const removeListItem = useResumeStore(s => s.removeListItem)
  const addBullet      = useResumeStore(s => s.addBullet)

  if (!entry) return null

  return (
    <div className="nv-card">
      <div className="nv-card-header">
        <div className="nv-card-title">
          <span className="nv-card-num">{index + 1}</span>
          {entry.name || `Project #${index + 1}`}
        </div>
        <button className="nv-card-remove" onClick={() => removeListItem('projects', index)}>✕</button>
      </div>
      <div className="nv-row">
        <div className="nv-field">
          <label className="nv-label">Project Name</label>
          <input className="nv-input" value={entry.name||''} onChange={e => setListField('projects', index, 'name', e.target.value)} placeholder="My Awesome Project" />
        </div>
        <div className="nv-field">
          <label className="nv-label">Dates</label>
          <input className="nv-input" value={entry.dates||''} onChange={e => setListField('projects', index, 'dates', e.target.value)} placeholder="Jan – Mar 2023" />
        </div>
      </div>
      <div className="nv-row">
        <div className="nv-field">
          <label className="nv-label">Tech Stack</label>
          <input className="nv-input" value={entry.tech||''} onChange={e => setListField('projects', index, 'tech', e.target.value)} placeholder="React, Node.js, PostgreSQL" />
        </div>
        <div className="nv-field">
          <label className="nv-label">Link / URL</label>
          <input className="nv-input" value={entry.link||''} onChange={e => setListField('projects', index, 'link', e.target.value)} placeholder="github.com/user/repo" />
        </div>
      </div>
      <div className="nv-field">
        <label className="nv-label">Description</label>
        <div className="nv-bullet-list">
          {Array.from({length: bulletCount}, (_, j) => (
            <BulletRow key={j} list="projects" itemIndex={index} bulletIndex={j} />
          ))}
        </div>
        <button className="nv-add-bullet" onClick={() => addBullet('projects', index)}>+ Add bullet</button>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// CERTIFICATIONS
// ══════════════════════════════════════════════════════════════════════════════
function CertificationsSection() {
  const count       = useResumeStore(s => s.resumeData?.certifications?.length ?? 0)
  const addListItem = useResumeStore(s => s.addListItem)
  return (
    <div>
      {Array.from({length: count}, (_, i) => <CertCard key={i} index={i} />)}
      <button className="nv-add-btn" onClick={() => addListItem('certifications', newCert())}>
        + Add Certification
      </button>
    </div>
  )
}

function CertCard({ index }) {
  const entry          = useResumeStore(s => s.resumeData?.certifications?.[index])
  const setListField   = useResumeStore(s => s.setListField)
  const removeListItem = useResumeStore(s => s.removeListItem)

  if (!entry) return null

  return (
    <div className="nv-card">
      <div className="nv-card-header">
        <div className="nv-card-title">
          <span className="nv-card-num">{index + 1}</span>
          {entry.name || `Certification #${index + 1}`}
        </div>
        <button className="nv-card-remove" onClick={() => removeListItem('certifications', index)}>✕</button>
      </div>
      <div className="nv-field">
        <label className="nv-label">Certification Name</label>
        <input className="nv-input" value={entry.name||''} onChange={e => setListField('certifications', index, 'name', e.target.value)} placeholder="AWS Certified Solutions Architect" />
      </div>
      <div className="nv-row">
        <div className="nv-field">
          <label className="nv-label">Issuing Organization</label>
          <input className="nv-input" value={entry.issuer||''} onChange={e => setListField('certifications', index, 'issuer', e.target.value)} placeholder="Amazon Web Services" />
        </div>
        <div className="nv-field">
          <label className="nv-label">Year</label>
          <input className="nv-input" value={entry.year||''} onChange={e => setListField('certifications', index, 'year', e.target.value)} placeholder="2023" />
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// LANGUAGES
// ══════════════════════════════════════════════════════════════════════════════
function LanguagesSection() {
  const languages = useResumeStore(s => s.resumeData?.languages ?? [])
  const setField  = useResumeStore(s => s.setField)
  return (
    <div>
      <div className="nv-field">
        <label className="nv-label">Languages</label>
        <div style={{fontSize:12,color:'var(--muted)',marginBottom:8}}>
          Include proficiency level in parentheses
        </div>
        <TagInput value={languages} onChange={v => setField('languages', v)} placeholder="English (Native), Spanish (B2)…" color="#84cc16" />
      </div>
      <div style={{fontSize:12,color:'var(--muted)',marginTop:10,padding:'10px 12px',background:'var(--bg)',borderRadius:8,lineHeight:1.6}}>
        💡 Levels: (Native) · (Fluent) · (Professional) · (Conversational) · (Basic)
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// AWARDS
// ══════════════════════════════════════════════════════════════════════════════
function AwardsSection() {
  const count      = useResumeStore(s => s.resumeData?.awards?.length ?? 0)
  const addAward   = useResumeStore(s => s.addAward)
  return (
    <div>
      <div style={{fontSize:12,color:'var(--muted)',marginBottom:14,lineHeight:1.6}}>
        Add honors, recognitions, and achievements that strengthen your profile.
      </div>
      <div className="nv-bullet-list">
        {Array.from({length: count}, (_, i) => <AwardRow key={i} index={i} />)}
      </div>
      <button className="nv-add-btn" style={{marginTop:8}} onClick={addAward}>
        + Add Award / Honor
      </button>
    </div>
  )
}

function AwardRow({ index }) {
  const value       = useResumeStore(s => s.resumeData?.awards?.[index] ?? '')
  const setAward    = useResumeStore(s => s.setAward)
  const removeAward = useResumeStore(s => s.removeAward)
  return (
    <div className="nv-bullet-row">
      <span className="nv-bullet-drag">⠿</span>
      <input
        className="nv-bullet-input"
        style={{minHeight:'auto',padding:'8px 10px'}}
        value={value}
        onChange={e => setAward(index, e.target.value)}
        placeholder="Dean's List, 2020–2022"
      />
      <button className="nv-bullet-remove" onClick={() => removeAward(index)}>✕</button>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// BULLET ROW — subscribes to a single primitive string
// Typing in bullet[j] does NOT re-render bullet[j+1].
// ══════════════════════════════════════════════════════════════════════════════
function BulletRow({ list, itemIndex, bulletIndex }) {
  const value        = useResumeStore(s => s.resumeData?.[list]?.[itemIndex]?.bullets?.[bulletIndex] ?? '')
  const setBullet    = useResumeStore(s => s.setBullet)
  const removeBullet = useResumeStore(s => s.removeBullet)

  return (
    <div className="nv-bullet-row">
      <span className="nv-bullet-drag">⠿</span>
      <textarea
        className="nv-bullet-input"
        value={value}
        onChange={e => setBullet(list, itemIndex, bulletIndex, e.target.value)}
        placeholder="Led a team that delivered X% improvement in…"
        rows={2}
      />
      <button className="nv-bullet-remove" onClick={() => removeBullet(list, itemIndex, bulletIndex)}>✕</button>
    </div>
  )
}
