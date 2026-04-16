import React, { useState, useEffect, useRef, useMemo } from 'react'

export default function CommandPalette({ commands, onClose }) {
  const [query, setQuery]       = useState('')
  const [activeIdx, setActive]  = useState(0)
  const inputRef  = useRef(null)
  const listRef   = useRef(null)

  // Fuzzy-style filter: substring match on label + group
  const filtered = useMemo(() => {
    if (!query.trim()) return commands
    const q = query.toLowerCase()
    return commands.filter(c =>
      c.label.toLowerCase().includes(q) ||
      c.group.toLowerCase().includes(q)
    )
  }, [commands, query])

  // Group the filtered list for display
  const grouped = useMemo(() => {
    const g = {}
    filtered.forEach(cmd => {
      if (!g[cmd.group]) g[cmd.group] = []
      g[cmd.group].push(cmd)
    })
    return g
  }, [filtered])

  // Reset highlight when query changes
  useEffect(() => { setActive(0) }, [query])

  // Auto-focus on mount
  useEffect(() => { inputRef.current?.focus() }, [])

  // Scroll active item into view
  useEffect(() => {
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [activeIdx])

  const handleKey = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive(i => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      filtered[activeIdx]?.action()
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <div className="cp-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Command palette">
      <div className="cp-modal" onClick={e => e.stopPropagation()} onKeyDown={handleKey}>

        {/* Search row */}
        <div className="cp-search-row">
          <svg className="cp-search-icon" width="15" height="15" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            className="cp-input"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type a command or search…"
            spellCheck={false}
            autoComplete="off"
          />
          <kbd className="cp-esc-key" onClick={onClose}>esc</kbd>
        </div>

        {/* Results */}
        <div className="cp-results" ref={listRef}>
          {filtered.length === 0 ? (
            <div className="cp-empty">No results for "{query}"</div>
          ) : (
            Object.entries(grouped).map(([group, items]) => (
              <div key={group} className="cp-group">
                <div className="cp-group-label">{group}</div>
                {items.map(cmd => {
                  const idx     = filtered.indexOf(cmd)
                  const isActive = idx === activeIdx
                  return (
                    <button
                      key={cmd.id}
                      className={`cp-item ${isActive ? 'cp-item--active' : ''}`}
                      data-active={isActive}
                      onClick={cmd.action}
                      onMouseMove={() => setActive(idx)}
                    >
                      <span
                        className="cp-item-icon"
                        style={{ color: cmd.iconColor ?? undefined, fontFamily: cmd.iconFont ?? undefined }}
                      >
                        {cmd.icon}
                      </span>
                      <span className="cp-item-label">{cmd.label}</span>
                      <div className="cp-item-meta">
                        {cmd.badge && <span className="cp-item-badge">{cmd.badge}</span>}
                        {cmd.shortcut && <kbd className="cp-item-kbd">{cmd.shortcut}</kbd>}
                      </div>
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer hints */}
        <div className="cp-footer">
          <span><kbd>↑↓</kbd> navigate</span>
          <span><kbd>↵</kbd> select</span>
          <span><kbd>esc</kbd> close</span>
        </div>
      </div>
    </div>
  )
}
