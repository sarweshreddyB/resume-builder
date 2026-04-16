export const DEFAULT_SECTION_ORDER = [
  'summary', 'experience', 'education', 'skills', 'tools',
  'projects', 'certifications', 'languages', 'awards',
]

/**
 * Returns `keys` sorted by their position in `order`.
 * Keys not present in `order` are appended at the end in their original relative order.
 */
export function sortBySectionOrder(order, keys) {
  if (!order || order.length === 0) return keys
  return [...keys].sort((a, b) => {
    const ia = order.indexOf(a)
    const ib = order.indexOf(b)
    if (ia === -1 && ib === -1) return 0
    if (ia === -1) return 1
    if (ib === -1) return -1
    return ia - ib
  })
}
