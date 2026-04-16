import React, { useState } from 'react'

export default function TagInput({ tags = [], onChange, placeholder = 'Type and press Enter…', color = 'brand' }) {
  const [input, setInput] = useState('')

  const commit = () => {
    const val = input.trim().replace(/,+$/, '')
    if (val && !tags.includes(val)) onChange([...tags, val])
    setInput('')
  }

  const remove = (i) => onChange(tags.filter((_, idx) => idx !== i))

  const handleKey = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); commit() }
    else if (e.key === 'Backspace' && !input && tags.length) remove(tags.length - 1)
  }

  return (
    <div className={`tag-input-wrap tag-color-${color}`} onClick={e => e.currentTarget.querySelector('input')?.focus()}>
      {tags.map((tag, i) => (
        <span key={i} className="tag-pill">
          {tag}
          <button className="tag-pill-remove" onClick={() => remove(i)}>×</button>
        </span>
      ))}
      <input
        className="tag-text-input"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKey}
        onBlur={commit}
        placeholder={tags.length === 0 ? placeholder : ''}
      />
    </div>
  )
}
