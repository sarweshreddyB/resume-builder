import React, { useRef } from 'react'
import TagInput from './TagInput'

// ── Factories ─────────────────────────────────────────────────────────────────
const newExp  = () => ({ title:'', company:'', location:'', dates:'', bullets:[''] })
const newEdu  = () => ({ degree:'', school:'', year:'', details:[] })
const newProj = () => ({ name:'', dates:'', tech:'', link:'', bullets:[''] })
const newCert = () => ({ name:'', issuer:'', year:'' })

// ─────────────────────────────────────────────────────────────────────────────
export default function ResumeEditor({ data, onChange, activeSection, photo, onPhotoChange }) {
  const photoInputRef = useRef(null)

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const set = (field, value) => onChange({ ...data, [field]: value })

  const setListItem = (list, i, field, value) => {
    const arr = [...(data[list] || [])]
    arr[i] = { ...arr[i], [field]: value }
    onChange({ ...data, [list]: arr })
  }

  const addListItem    = (list, tmpl) => onChange({ ...data, [list]: [...(data[list]||[]), tmpl] })
  const removeListItem = (list, i)    => onChange({ ...data, [list]: (data[list]||[]).filter((_,j)=>j!==i) })

  const setBullet = (list, i, j, val) => {
    const arr = [...(data[list]||[])]
    const bullets = [...(arr[i].bullets||[])]
    bullets[j] = val
    arr[i] = { ...arr[i], bullets }
    onChange({ ...data, [list]: arr })
  }
  const addBullet    = (list, i) => {
    const arr = [...(data[list]||[])]
    arr[i] = { ...arr[i], bullets: [...(arr[i].bullets||[]), ''] }
    onChange({ ...data, [list]: arr })
  }
  const removeBullet = (list, i, j) => {
    const arr = [...(data[list]||[])]
    arr[i] = { ...arr[i], bullets: (arr[i].bullets||[]).filter((_,k)=>k!==j) }
    onChange({ ...data, [list]: arr })
  }

  const handlePhotoFile = e => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => onPhotoChange?.(ev.target.result)
    reader.readAsDataURL(file)
  }

  // ════════════════════════════════════════════════════════════════════════════
  // PERSONAL INFO
  // ════════════════════════════════════════════════════════════════════════════
  if (activeSection === 'personal') return (
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
            {photo && <button className="btn-ghost btn-sm" onClick={() => onPhotoChange?.(null)}>Remove</button>}
            <span style={{fontSize:11,color:'var(--muted)',lineHeight:1.5}}>JPG, PNG or GIF</span>
          </div>
        </div>
      </div>

      <div style={{height:1,background:'var(--border)',margin:'14px 0'}} />

      <div className="nv-row">
        <div className="nv-field">
          <label className="nv-label">Full Name</label>
          <input className="nv-input" value={data.name||''} onChange={e=>set('name',e.target.value)} placeholder="John Smith" />
        </div>
        <div className="nv-field">
          <label className="nv-label">Job Title</label>
          <input className="nv-input" value={data.title||''} onChange={e=>set('title',e.target.value)} placeholder="Senior Software Engineer" />
        </div>
      </div>
      <div className="nv-row">
        <div className="nv-field">
          <label className="nv-label">Email</label>
          <input className="nv-input" type="email" value={data.email||''} onChange={e=>set('email',e.target.value)} placeholder="john@example.com" />
        </div>
        <div className="nv-field">
          <label className="nv-label">Phone</label>
          <input className="nv-input" type="tel" value={data.phone||''} onChange={e=>set('phone',e.target.value)} placeholder="+1 (555) 000-0000" />
        </div>
      </div>
      <div className="nv-row">
        <div className="nv-field">
          <label className="nv-label">Location</label>
          <input className="nv-input" value={data.location||''} onChange={e=>set('location',e.target.value)} placeholder="San Francisco, CA" />
        </div>
        <div className="nv-field">
          <label className="nv-label">Website</label>
          <input className="nv-input" value={data.website||''} onChange={e=>set('website',e.target.value)} placeholder="yoursite.com" />
        </div>
      </div>
      <div className="nv-row">
        <div className="nv-field">
          <label className="nv-label">LinkedIn</label>
          <input className="nv-input" value={data.linkedin||''} onChange={e=>set('linkedin',e.target.value)} placeholder="linkedin.com/in/john" />
        </div>
        <div className="nv-field">
          <label className="nv-label">GitHub</label>
          <input className="nv-input" value={data.github||''} onChange={e=>set('github',e.target.value)} placeholder="github.com/john" />
        </div>
      </div>
    </div>
  )

  // ════════════════════════════════════════════════════════════════════════════
  // SUMMARY
  // ════════════════════════════════════════════════════════════════════════════
  if (activeSection === 'summary') return (
    <div>
      <div className="nv-field">
        <label className="nv-label">Professional Summary</label>
        <textarea
          className="nv-input"
          rows={8}
          value={data.summary||''}
          onChange={e=>set('summary',e.target.value)}
          placeholder="Write 3–5 sentences highlighting your key experience, skills, and what you bring to the role…"
        />
      </div>
      <div style={{fontSize:12,color:'var(--muted)',marginTop:4}}>
        {(data.summary||'').length > 0
          ? `${(data.summary||'').length} characters`
          : 'Tip: A strong summary is 3–5 sentences and starts with your title and years of experience.'}
      </div>
    </div>
  )

  // ════════════════════════════════════════════════════════════════════════════
  // WORK EXPERIENCE
  // ════════════════════════════════════════════════════════════════════════════
  if (activeSection === 'experience') return (
    <div>
      {(data.experience||[]).map((exp, i) => (
        <div key={i} className="nv-card">
          <div className="nv-card-header">
            <div className="nv-card-title">
              <span className="nv-card-num">{i+1}</span>
              {exp.title || exp.company || `Position #${i+1}`}
            </div>
            <button className="nv-card-remove" onClick={() => removeListItem('experience',i)}>✕</button>
          </div>
          <div className="nv-row">
            <div className="nv-field">
              <label className="nv-label">Job Title</label>
              <input className="nv-input" value={exp.title||''} onChange={e=>setListItem('experience',i,'title',e.target.value)} placeholder="Software Engineer" />
            </div>
            <div className="nv-field">
              <label className="nv-label">Company</label>
              <input className="nv-input" value={exp.company||''} onChange={e=>setListItem('experience',i,'company',e.target.value)} placeholder="Company Inc." />
            </div>
          </div>
          <div className="nv-row">
            <div className="nv-field">
              <label className="nv-label">Location</label>
              <input className="nv-input" value={exp.location||''} onChange={e=>setListItem('experience',i,'location',e.target.value)} placeholder="City, State" />
            </div>
            <div className="nv-field">
              <label className="nv-label">Dates</label>
              <input className="nv-input" value={exp.dates||''} onChange={e=>setListItem('experience',i,'dates',e.target.value)} placeholder="Jan 2020 – Present" />
            </div>
          </div>
          <div className="nv-field">
            <label className="nv-label">Achievements</label>
            <div className="nv-bullet-list">
              {(exp.bullets||[]).map((b, j) => (
                <div key={j} className="nv-bullet-row">
                  <span className="nv-bullet-drag">⠿</span>
                  <textarea className="nv-bullet-input" value={b}
                    onChange={e=>setBullet('experience',i,j,e.target.value)}
                    placeholder="Led a team that delivered X% improvement in…" rows={2} />
                  <button className="nv-bullet-remove" onClick={()=>removeBullet('experience',i,j)}>✕</button>
                </div>
              ))}
            </div>
            <button className="nv-add-bullet" onClick={()=>addBullet('experience',i)}>+ Add bullet</button>
          </div>
        </div>
      ))}
      <button className="nv-add-btn" onClick={()=>addListItem('experience',newExp())}>
        + Add Work Experience
      </button>
    </div>
  )

  // ════════════════════════════════════════════════════════════════════════════
  // EDUCATION
  // ════════════════════════════════════════════════════════════════════════════
  if (activeSection === 'education') return (
    <div>
      {(data.education||[]).map((edu, i) => (
        <div key={i} className="nv-card">
          <div className="nv-card-header">
            <div className="nv-card-title">
              <span className="nv-card-num">{i+1}</span>
              {edu.degree || edu.school || `Education #${i+1}`}
            </div>
            <button className="nv-card-remove" onClick={()=>removeListItem('education',i)}>✕</button>
          </div>
          <div className="nv-field">
            <label className="nv-label">Degree / Qualification</label>
            <input className="nv-input" value={edu.degree||''} onChange={e=>setListItem('education',i,'degree',e.target.value)} placeholder="B.S. Computer Science" />
          </div>
          <div className="nv-row">
            <div className="nv-field">
              <label className="nv-label">Institution</label>
              <input className="nv-input" value={edu.school||''} onChange={e=>setListItem('education',i,'school',e.target.value)} placeholder="Stanford University" />
            </div>
            <div className="nv-field">
              <label className="nv-label">Graduation Year</label>
              <input className="nv-input" value={edu.year||''} onChange={e=>setListItem('education',i,'year',e.target.value)} placeholder="2020" />
            </div>
          </div>
          <div className="nv-field">
            <label className="nv-label">Details <span style={{fontWeight:400,color:'var(--muted)'}}>— GPA, honors</span></label>
            <div className="nv-bullet-list">
              {(edu.details||[]).map((d, j) => (
                <div key={j} className="nv-bullet-row">
                  <span className="nv-bullet-drag">⠿</span>
                  <input className="nv-bullet-input" style={{minHeight:'auto',padding:'7px 10px'}} value={d}
                    onChange={e=>{
                      const arr=[...(data.education||[])]
                      const details=[...(arr[i].details||[])]
                      details[j]=e.target.value
                      arr[i]={...arr[i],details}
                      onChange({...data,education:arr})
                    }} placeholder="GPA: 3.8 / 4.0" />
                  <button className="nv-bullet-remove" onClick={()=>{
                    const arr=[...(data.education||[])]
                    arr[i]={...arr[i],details:(arr[i].details||[]).filter((_,k)=>k!==j)}
                    onChange({...data,education:arr})
                  }}>✕</button>
                </div>
              ))}
            </div>
            <button className="nv-add-bullet" onClick={()=>{
              const arr=[...(data.education||[])]
              arr[i]={...arr[i],details:[...(arr[i].details||[]),'']}
              onChange({...data,education:arr})
            }}>+ Add detail</button>
          </div>
        </div>
      ))}
      <button className="nv-add-btn" onClick={()=>addListItem('education',newEdu())}>
        + Add Education
      </button>
    </div>
  )

  // ════════════════════════════════════════════════════════════════════════════
  // SKILLS
  // ════════════════════════════════════════════════════════════════════════════
  if (activeSection === 'skills') return (
    <div>
      <div className="nv-field">
        <label className="nv-label">Skills</label>
        <div style={{fontSize:12,color:'var(--muted)',marginBottom:8}}>Type a skill and press Enter or comma to add</div>
        <TagInput value={data.skills||[]} onChange={v=>set('skills',v)} placeholder="JavaScript, Python, Docker…" color="var(--brand)" />
      </div>

      {(data.skills?.length??0) > 0 && (
        <div style={{marginTop:18}}>
          <div style={{fontSize:13,fontWeight:600,color:'var(--text-2)',marginBottom:3}}>
            Proficiency Levels <span style={{fontWeight:400,color:'var(--muted)'}}>— optional</span>
          </div>
          <div style={{fontSize:12,color:'var(--muted)',marginBottom:10}}>Click dots to rate each skill</div>
          {data.skills.map((skill, i) => {
            const level = data.skillLevels?.[skill] ?? 0
            return (
              <div key={i} className="nv-skill-row">
                <span className="nv-skill-name">{skill}</span>
                <div className="nv-skill-dots">
                  {[1,2,3,4,5].map(l => (
                    <button key={l}
                      className={`nv-skill-dot ${l<=level?'active':''}`}
                      title={['','Beginner','Basic','Intermediate','Advanced','Expert'][l]}
                      onClick={()=>{
                        const nl={...(data.skillLevels||{})}
                        if(l===level){delete nl[skill]}else{nl[skill]=l}
                        set('skillLevels',nl)
                      }}
                    />
                  ))}
                </div>
                {level > 0 && <span style={{fontSize:11,color:'var(--muted)',minWidth:70,textAlign:'right'}}>{['','Beginner','Basic','Intermediate','Advanced','Expert'][level]}</span>}
              </div>
            )
          })}
        </div>
      )}

      <div className="nv-section-sep" />

      <div className="nv-field">
        <label className="nv-label">Tools &amp; Technologies</label>
        <div style={{fontSize:12,color:'var(--muted)',marginBottom:8}}>Frameworks, platforms, tools you use</div>
        <TagInput value={data.tools||[]} onChange={v=>set('tools',v)} placeholder="AWS, Docker, Git, Figma…" color="#6366f1" />
      </div>
    </div>
  )

  // ════════════════════════════════════════════════════════════════════════════
  // PROJECTS
  // ════════════════════════════════════════════════════════════════════════════
  if (activeSection === 'projects') return (
    <div>
      {(data.projects||[]).map((p, i) => (
        <div key={i} className="nv-card">
          <div className="nv-card-header">
            <div className="nv-card-title">
              <span className="nv-card-num">{i+1}</span>
              {p.name || `Project #${i+1}`}
            </div>
            <button className="nv-card-remove" onClick={()=>removeListItem('projects',i)}>✕</button>
          </div>
          <div className="nv-row">
            <div className="nv-field">
              <label className="nv-label">Project Name</label>
              <input className="nv-input" value={p.name||''} onChange={e=>setListItem('projects',i,'name',e.target.value)} placeholder="My Awesome Project" />
            </div>
            <div className="nv-field">
              <label className="nv-label">Dates</label>
              <input className="nv-input" value={p.dates||''} onChange={e=>setListItem('projects',i,'dates',e.target.value)} placeholder="Jan – Mar 2023" />
            </div>
          </div>
          <div className="nv-row">
            <div className="nv-field">
              <label className="nv-label">Tech Stack</label>
              <input className="nv-input" value={p.tech||''} onChange={e=>setListItem('projects',i,'tech',e.target.value)} placeholder="React, Node.js, PostgreSQL" />
            </div>
            <div className="nv-field">
              <label className="nv-label">Link / URL</label>
              <input className="nv-input" value={p.link||''} onChange={e=>setListItem('projects',i,'link',e.target.value)} placeholder="github.com/user/repo" />
            </div>
          </div>
          <div className="nv-field">
            <label className="nv-label">Description</label>
            <div className="nv-bullet-list">
              {(p.bullets||[]).map((b, j) => (
                <div key={j} className="nv-bullet-row">
                  <span className="nv-bullet-drag">⠿</span>
                  <textarea className="nv-bullet-input" value={b}
                    onChange={e=>setBullet('projects',i,j,e.target.value)}
                    placeholder="Describe the impact or what you built…" rows={2} />
                  <button className="nv-bullet-remove" onClick={()=>removeBullet('projects',i,j)}>✕</button>
                </div>
              ))}
            </div>
            <button className="nv-add-bullet" onClick={()=>addBullet('projects',i)}>+ Add bullet</button>
          </div>
        </div>
      ))}
      <button className="nv-add-btn" onClick={()=>addListItem('projects',newProj())}>
        + Add Project
      </button>
    </div>
  )

  // ════════════════════════════════════════════════════════════════════════════
  // CERTIFICATIONS
  // ════════════════════════════════════════════════════════════════════════════
  if (activeSection === 'certifications') return (
    <div>
      {(data.certifications||[]).map((cert, i) => (
        <div key={i} className="nv-card">
          <div className="nv-card-header">
            <div className="nv-card-title">
              <span className="nv-card-num">{i+1}</span>
              {cert.name || `Certification #${i+1}`}
            </div>
            <button className="nv-card-remove" onClick={()=>removeListItem('certifications',i)}>✕</button>
          </div>
          <div className="nv-field">
            <label className="nv-label">Certification Name</label>
            <input className="nv-input" value={cert.name||''} onChange={e=>setListItem('certifications',i,'name',e.target.value)} placeholder="AWS Certified Solutions Architect" />
          </div>
          <div className="nv-row">
            <div className="nv-field">
              <label className="nv-label">Issuing Organization</label>
              <input className="nv-input" value={cert.issuer||''} onChange={e=>setListItem('certifications',i,'issuer',e.target.value)} placeholder="Amazon Web Services" />
            </div>
            <div className="nv-field">
              <label className="nv-label">Year</label>
              <input className="nv-input" value={cert.year||''} onChange={e=>setListItem('certifications',i,'year',e.target.value)} placeholder="2023" />
            </div>
          </div>
        </div>
      ))}
      <button className="nv-add-btn" onClick={()=>addListItem('certifications',newCert())}>
        + Add Certification
      </button>
    </div>
  )

  // ════════════════════════════════════════════════════════════════════════════
  // LANGUAGES
  // ════════════════════════════════════════════════════════════════════════════
  if (activeSection === 'languages') return (
    <div>
      <div className="nv-field">
        <label className="nv-label">Languages</label>
        <div style={{fontSize:12,color:'var(--muted)',marginBottom:8}}>
          Include proficiency level in parentheses
        </div>
        <TagInput value={data.languages||[]} onChange={v=>set('languages',v)} placeholder="English (Native), Spanish (B2)…" color="#84cc16" />
      </div>
      <div style={{fontSize:12,color:'var(--muted)',marginTop:10,padding:'10px 12px',background:'var(--bg)',borderRadius:8,lineHeight:1.6}}>
        💡 Levels: (Native) · (Fluent) · (Professional) · (Conversational) · (Basic)
      </div>
    </div>
  )

  // ════════════════════════════════════════════════════════════════════════════
  // AWARDS
  // ════════════════════════════════════════════════════════════════════════════
  if (activeSection === 'awards') return (
    <div>
      <div style={{fontSize:12,color:'var(--muted)',marginBottom:14,lineHeight:1.6}}>
        Add honors, recognitions, and achievements that strengthen your profile.
      </div>
      <div className="nv-bullet-list">
        {(data.awards||[]).map((award, i) => (
          <div key={i} className="nv-bullet-row">
            <span className="nv-bullet-drag">⠿</span>
            <input className="nv-bullet-input" style={{minHeight:'auto',padding:'8px 10px'}}
              value={award}
              onChange={e=>{
                const arr=[...(data.awards||[])]
                arr[i]=e.target.value
                set('awards',arr)
              }}
              placeholder="Dean's List, 2020–2022" />
            <button className="nv-bullet-remove" onClick={()=>set('awards',(data.awards||[]).filter((_,j)=>j!==i))}>✕</button>
          </div>
        ))}
      </div>
      <button className="nv-add-btn" style={{marginTop:8}} onClick={()=>set('awards',[...(data.awards||[]),''])}>
        + Add Award / Honor
      </button>
    </div>
  )

  return null
}
