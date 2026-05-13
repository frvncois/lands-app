export interface ListItem {
  id: string
  section_id: string
  title: string
  subtitle: string
  url: string
  description: string
  icon: string // URL to favicon or custom icon, empty string if none
  icon_type?: 'image' | 'lucide' | 'none'
  icon_name?: string // lucide icon component name
  position: string // fractional index
}

