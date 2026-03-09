export interface ListItem {
  id: string
  section_id: string
  title: string
  url: string
  description: string
  icon: string // URL to favicon or custom icon, empty string if none
  position: string // fractional index
}

export interface ListSection {
  section_id: string
  items: ListItem[]
}
