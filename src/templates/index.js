export { default as GenevaTemplate } from './GenevaTemplate'
export { default as StockholmTemplate } from './StockholmTemplate'
export { default as TokyoTemplate } from './TokyoTemplate'
export { default as NewYorkTemplate } from './NewYorkTemplate'
export { default as CopenhagenTemplate } from './CopenhagenTemplate'

export const TEMPLATES = [
  {
    id: 'copenhagen',
    name: 'Copenhagen',
    description: 'Two-column, teal accent, timeline experience',
    accent: '#0284c7',
    preview: {
      bg: '#0284c7',
      secondary: '#e0f2fe',
      text: '#0369a1',
    },
  },
  {
    id: 'geneva',
    name: 'Geneva',
    description: 'Modern two-column with blue header',
    accent: '#2563eb',
    preview: {
      bg: '#2563eb',
      secondary: '#f1f5f9',
      text: '#1e293b',
    },
  },
  {
    id: 'stockholm',
    name: 'Stockholm',
    description: 'Classic professional, single column',
    accent: '#c0392b',
    preview: {
      bg: '#1a1a2e',
      secondary: '#fff',
      text: '#c0392b',
    },
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    description: 'Creative with dark sidebar',
    accent: '#1b98e0',
    preview: {
      bg: '#0f4c75',
      secondary: '#fff',
      text: '#1b98e0',
    },
  },
  {
    id: 'newyork',
    name: 'New York',
    description: 'Executive minimal, bold typography',
    accent: '#9b1c1c',
    preview: {
      bg: '#111827',
      secondary: '#fef2f2',
      text: '#9b1c1c',
    },
  },
]
