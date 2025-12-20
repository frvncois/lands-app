/**
 * Lucide Icons Utility
 * Provides icon names and search functionality for the icon picker
 */
import * as allIcons from 'lucide-vue-next'

// Get all icon component names (PascalCase, excluding utilities)
const iconEntries = Object.entries(allIcons).filter(
  ([key]) => !key.endsWith('Icon') && key !== 'default' && key !== 'icons' && key !== 'createLucideIcon'
)

// Export the icons object for dynamic component rendering
export const icons = Object.fromEntries(iconEntries) as Record<string, unknown>

// All icon names in PascalCase
export const allLucideIconNames: string[] = iconEntries.map(([key]) => key).sort()

// Convert PascalCase to display format (e.g., "ArrowRight" -> "Arrow Right")
export function formatIconName(name: string): string {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
}

// Convert PascalCase to search-friendly format (lowercase with spaces)
function toSearchable(name: string): string {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1 $2').toLowerCase()
}

// Search icons by query
export function searchLucideIcons(query: string): string[] {
  if (!query.trim()) return allLucideIconNames

  const searchTerm = query.toLowerCase().trim()

  return allLucideIconNames.filter(name => {
    const searchable = toSearchable(name)
    return searchable.includes(searchTerm) || name.toLowerCase().includes(searchTerm)
  })
}

// Icon categories based on common prefixes/patterns
export interface IconCategory {
  id: string
  label: string
  pattern: RegExp
}

export const iconCategories: IconCategory[] = [
  { id: 'arrows', label: 'Arrows', pattern: /^(Arrow|Chevron|Move|Corner|Expand|Shrink|Maximize|Minimize)/i },
  { id: 'files', label: 'Files', pattern: /^(File|Folder|Document|Archive|Clipboard)/i },
  { id: 'media', label: 'Media', pattern: /^(Image|Video|Camera|Music|Play|Pause|Stop|Volume|Mic|Speaker|Film|Youtube|Radio)/i },
  { id: 'communication', label: 'Communication', pattern: /^(Mail|Message|Phone|Send|Inbox|Bell|At|Contact)/i },
  { id: 'social', label: 'Social', pattern: /^(User|Users|Heart|ThumbsUp|ThumbsDown|Share|Star|Like|Follow|Friend)/i },
  { id: 'shapes', label: 'Shapes', pattern: /^(Circle|Square|Triangle|Rectangle|Diamond|Hexagon|Pentagon|Octagon|Star|Box)/i },
  { id: 'editing', label: 'Editing', pattern: /^(Edit|Pen|Pencil|Scissors|Cut|Copy|Paste|Delete|Trash|Eraser|Brush|Paint)/i },
  { id: 'navigation', label: 'Navigation', pattern: /^(Home|Menu|Grid|List|Search|Filter|Sort|Map|Compass|Navigation|Globe|Pin|Location)/i },
  { id: 'devices', label: 'Devices', pattern: /^(Monitor|Laptop|Tablet|Smartphone|Keyboard|Mouse|Printer|Cpu|Server|Database|Wifi|Bluetooth|Usb)/i },
  { id: 'commerce', label: 'Commerce', pattern: /^(Shopping|Cart|Bag|Credit|Wallet|Dollar|Euro|Pound|Receipt|Tag|Gift|Package|Store)/i },
  { id: 'weather', label: 'Weather', pattern: /^(Sun|Moon|Cloud|Rain|Snow|Wind|Thunder|Umbrella|Thermometer|Droplet)/i },
  { id: 'time', label: 'Time', pattern: /^(Clock|Timer|Calendar|Alarm|Watch|Hourglass|History)/i },
  { id: 'security', label: 'Security', pattern: /^(Lock|Unlock|Key|Shield|Eye|EyeOff|Fingerprint|Scan)/i },
  { id: 'settings', label: 'Settings', pattern: /^(Settings|Sliders|Toggle|Switch|Cog|Wrench|Tool|Hammer)/i },
  { id: 'layout', label: 'Layout', pattern: /^(Layout|Sidebar|Panel|Split|Columns|Rows|Kanban|Table)/i },
  { id: 'text', label: 'Text', pattern: /^(Text|Type|Font|Bold|Italic|Underline|Strikethrough|Align|Heading|Quote|Code)/i },
  { id: 'charts', label: 'Charts', pattern: /^(Chart|Bar|Line|Pie|Graph|Trending|Activity|Analytics)/i },
]

// Get icons by category
export function getIconsByCategory(categoryId: string): string[] {
  if (categoryId === 'all') return allLucideIconNames

  const category = iconCategories.find(c => c.id === categoryId)
  if (!category) return []

  return allLucideIconNames.filter(name => category.pattern.test(name))
}

// Get icon component by name
export function getLucideIcon(name: string): unknown {
  return icons[name] || null
}

// Popular/common icons for quick access
export const popularIcons = [
  'Star', 'Heart', 'Check', 'X', 'Plus', 'Minus',
  'ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown',
  'ChevronRight', 'ChevronLeft', 'ChevronUp', 'ChevronDown',
  'Search', 'Settings', 'User', 'Home', 'Mail', 'Phone',
  'Calendar', 'Clock', 'Bell', 'Menu', 'MoreHorizontal', 'MoreVertical',
  'Edit', 'Trash', 'Copy', 'Share', 'Download', 'Upload',
  'Eye', 'EyeOff', 'Lock', 'Unlock', 'Link', 'ExternalLink',
  'Image', 'Video', 'Music', 'File', 'Folder', 'Cloud',
  'Zap', 'Sun', 'Moon', 'Globe', 'MapPin', 'Send',
]
