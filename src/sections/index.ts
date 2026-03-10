import {
  UserCircleIcon,
  DocumentTextIcon,
  ListBulletIcon,
  RectangleStackIcon,
  ShoppingBagIcon,
  MegaphoneIcon,
  Bars3BottomLeftIcon,
  PhotoIcon,
  NewspaperIcon,
} from '@heroicons/vue/24/outline'
import type { FunctionalComponent } from 'vue'

export interface SectionSettings {
  layout: 'full-width' | 'contained' | 'split'
}

export interface SectionPrimitive {
  id: string
  label: string
  description: string
  icon: FunctionalComponent
  defaultSettings: SectionSettings
}

export const sectionPrimitives: SectionPrimitive[] = [
  { id: 'header', label: 'Header', description: 'Name, bio and profile photo', icon: UserCircleIcon, defaultSettings: { layout: 'full-width' } },
  { id: 'text', label: 'Text', description: 'A block of rich text content', icon: DocumentTextIcon, defaultSettings: { layout: 'contained' } },
  { id: 'media', label: 'Media', description: 'Photos and videos gallery', icon: PhotoIcon, defaultSettings: { layout: 'full-width' } },
  { id: 'content_media', label: 'Content + Media', description: 'Text, buttons and an image or video', icon: NewspaperIcon, defaultSettings: { layout: 'split' } },
  { id: 'list', label: 'List', description: 'Links and external resources', icon: ListBulletIcon, defaultSettings: { layout: 'contained' } },
  { id: 'collection', label: 'Collection', description: 'Curated groups of items', icon: RectangleStackIcon, defaultSettings: { layout: 'full-width' } },
  { id: 'store', label: 'Sell & Monetize', description: 'Products, memberships and digital goods', icon: ShoppingBagIcon, defaultSettings: { layout: 'full-width' } },
  { id: 'campaign', label: 'Campaign', description: 'Call to action or newsletter', icon: MegaphoneIcon, defaultSettings: { layout: 'contained' } },
  { id: 'footer', label: 'Footer', description: 'Social links and closing info', icon: Bars3BottomLeftIcon, defaultSettings: { layout: 'full-width' } },
]

export const layoutOptions = ['full-width', 'contained', 'split']
