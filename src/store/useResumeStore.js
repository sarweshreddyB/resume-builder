import { create }                  from 'zustand'
import { subscribeWithSelector }   from 'zustand/middleware'
import { immer }                   from 'zustand/middleware/immer'
import { shallow }                 from 'zustand/shallow'
import { DEFAULT_SECTION_ORDER }   from '../utils/sectionOrder'

// ── Storage keys ───────────────────────────────────────────────────────────────
const RESUME_KEY = 'rf-resume-v1'
const PHOTO_KEY  = 'rf-photo-v1'
const PREFS_KEY  = 'rf-prefs-v1'

// ── Empty document shape ───────────────────────────────────────────────────────
export const EMPTY_RESUME = {
  name:'', title:'', email:'', phone:'', location:'', linkedin:'', github:'', website:'',
  summary:'', experience:[], education:[], skills:[], skillLevels:{}, tools:[],
  projects:[], certifications:[], languages:[], awards:[],
}

// ── Hydration ──────────────────────────────────────────────────────────────────
function tryLoad(key) {
  try   { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null }
  catch { return null }
}
function trySave(key, value) {
  try   { localStorage.setItem(key, JSON.stringify(value)) }
  catch { /* QuotaExceeded or private browsing — fail silently */ }
}

const _saved  = tryLoad(RESUME_KEY)
const _photo  = tryLoad(PHOTO_KEY)
const _prefs  = tryLoad(PREFS_KEY)

// ── Store ──────────────────────────────────────────────────────────────────────
export const useResumeStore = create(
  subscribeWithSelector(
    immer((set) => ({

      // ── Resume document ────────────────────────────────────────────────────
      resumeData: _saved?.resumeData ?? null,
      photo:      _photo             ?? null,
      resumeName: _saved?.resumeName ?? 'My Resume',

      // ── Preferences (template / theme / section order) ─────────────────────
      selectedTemplate: _prefs?.selectedTemplate ?? 'copenhagen',
      theme:            _prefs?.theme            ?? { colorIdx: 0, fontId: 'inter' },
      sectionOrder:     _prefs?.sectionOrder     ?? [...DEFAULT_SECTION_ORDER],

      // ── Ephemeral UI state (not persisted) ─────────────────────────────────
      activeSection:      'personal',
      showTemplatePicker: false,
      showATSPanel:       false,
      showCP:             false,
      showAIChat:         false,
      showRawJSON:        false,
      showSectionOrder:   false,
      isDownloading:      false,
      numPages:           1,
      previewZoom:        0.75,
      jobDescription:     '',

      // ── Resume lifecycle ───────────────────────────────────────────────────

      loadNewResume: () => set(s => {
        s.resumeData    = { ...EMPTY_RESUME }
        s.photo         = null
        s.resumeName    = 'My Resume'
        s.activeSection = 'personal'
      }),

      loadParsedResume: (parsed, name) => set(s => {
        s.resumeData    = parsed
        s.resumeName    = name || parsed.name || 'My Resume'
        s.activeSection = 'personal'
      }),

      setResumeData:  (data)  => set(s => { s.resumeData = data }),
      setPhoto:       (photo) => set(s => { s.photo      = photo }),
      setResumeName:  (name)  => set(s => { s.resumeName = name }),

      // ── Atomic field mutations (immer drafts — no spread required) ─────────

      // Top-level string fields: name, title, email, phone, location, etc.
      setField: (field, value) => set(s => {
        s.resumeData[field] = value
      }),

      // List item field: experience[i].company, projects[i].name …
      setListField: (list, i, field, value) => set(s => {
        s.resumeData[list][i][field] = value
      }),

      addListItem: (list, template) => set(s => {
        s.resumeData[list].push(template)
      }),

      removeListItem: (list, i) => set(s => {
        s.resumeData[list].splice(i, 1)
      }),

      // Bullet points inside experience / projects
      setBullet:    (list, i, j, value) => set(s => { s.resumeData[list][i].bullets[j] = value }),
      addBullet:    (list, i)           => set(s => { s.resumeData[list][i].bullets.push('') }),
      removeBullet: (list, i, j)        => set(s => { s.resumeData[list][i].bullets.splice(j, 1) }),

      // Education details sub-list
      setEduDetail:    (i, j, value) => set(s => { s.resumeData.education[i].details[j] = value }),
      addEduDetail:    (i)           => set(s => { s.resumeData.education[i].details.push('') }),
      removeEduDetail: (i, j)        => set(s => { s.resumeData.education[i].details.splice(j, 1) }),

      // Skill proficiency dots
      setSkillLevel: (skill, level) => set(s => {
        if (!s.resumeData.skillLevels) s.resumeData.skillLevels = {}
        if (level === s.resumeData.skillLevels[skill]) delete s.resumeData.skillLevels[skill]
        else s.resumeData.skillLevels[skill] = level
      }),

      // Awards (plain string array)
      setAward:    (i, value) => set(s => { s.resumeData.awards[i] = value }),
      addAward:    ()         => set(s => { s.resumeData.awards.push('') }),
      removeAward: (i)        => set(s => { s.resumeData.awards.splice(i, 1) }),

      // ── Preferences ────────────────────────────────────────────────────────
      setSelectedTemplate: (id) => set(s => { s.selectedTemplate = id }),

      setTheme: (updater) => set(s => {
        s.theme = typeof updater === 'function' ? updater(s.theme) : updater
      }),

      moveSection: (key, dir) => set(s => {
        const i = s.sectionOrder.indexOf(key)
        if (i === -1) return
        const j = i + dir
        if (j < 0 || j >= s.sectionOrder.length) return
        ;[s.sectionOrder[i], s.sectionOrder[j]] = [s.sectionOrder[j], s.sectionOrder[i]]
      }),

      resetSectionOrder: () => set(s => { s.sectionOrder = [...DEFAULT_SECTION_ORDER] }),

      // ── UI state ───────────────────────────────────────────────────────────
      setActiveSection:      (v) => set(s => { s.activeSection      = v }),
      setShowTemplatePicker: (v) => set(s => { s.showTemplatePicker  = v }),
      toggleATSPanel:        ()  => set(s => { s.showATSPanel        = !s.showATSPanel }),
      toggleCP:              ()  => set(s => { s.showCP              = !s.showCP }),
      setShowCP:             (v) => set(s => { s.showCP              = v }),
      setShowAIChat:         (v) => set(s => { s.showAIChat          = v }),
      toggleRawJSON:         ()  => set(s => { s.showRawJSON         = !s.showRawJSON }),
      setShowRawJSON:        (v) => set(s => { s.showRawJSON         = v }),
      setShowSectionOrder:   (v) => set(s => {
        s.showSectionOrder = typeof v === 'function' ? v(s.showSectionOrder) : v
      }),
      setIsDownloading: (v) => set(s => { s.isDownloading = v }),
      setNumPages:      (v) => set(s => { s.numPages      = v }),
      setPreviewZoom:   (v) => set(s => {
        s.previewZoom = typeof v === 'function' ? v(s.previewZoom) : v
      }),
      setJobDescription: (v) => set(s => { s.jobDescription = v }),
    }))
  )
)

// ── Out-of-React persistence subscriptions ─────────────────────────────────────
// These run once at module load, outside the React tree.

let resumeDebounce = null
let photoDebounce  = null

// Resume data — debounced 800 ms so rapid keystrokes don't thrash localStorage.
useResumeStore.subscribe(
  s => s.resumeData,
  (resumeData) => {
    clearTimeout(resumeDebounce)
    resumeDebounce = setTimeout(() => {
      trySave(RESUME_KEY, { resumeData, resumeName: useResumeStore.getState().resumeName })
    }, 800)
  }
)

// Resume name — shares the same debounce slot as resumeData.
useResumeStore.subscribe(
  s => s.resumeName,
  (resumeName) => {
    clearTimeout(resumeDebounce)
    resumeDebounce = setTimeout(() => {
      trySave(RESUME_KEY, { resumeData: useResumeStore.getState().resumeData, resumeName })
    }, 800)
  }
)

// Photo — isolated debounce: a QuotaExceededError here must not corrupt the resume save.
useResumeStore.subscribe(
  s => s.photo,
  (photo) => {
    clearTimeout(photoDebounce)
    photoDebounce = setTimeout(() => trySave(PHOTO_KEY, photo), 800)
  }
)

// Preferences — saved immediately (small payload, infrequent writes).
// shallow equality prevents firing on every resumeData keystroke.
useResumeStore.subscribe(
  s => ({ selectedTemplate: s.selectedTemplate, theme: s.theme, sectionOrder: s.sectionOrder }),
  (prefs) => trySave(PREFS_KEY, prefs),
  { equalityFn: shallow }
)
