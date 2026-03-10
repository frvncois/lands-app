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

export interface SectionPrimitive {
  id: string
  label: string
  description: string
  icon: FunctionalComponent
}

export const sectionPrimitives: SectionPrimitive[] = [
  { id: 'header', label: 'Header', description: 'Name, bio and profile photo', icon: UserCircleIcon },
  { id: 'text', label: 'Text', description: 'A block of rich text content', icon: DocumentTextIcon },
  { id: 'media', label: 'Media', description: 'Photos and videos gallery', icon: PhotoIcon },
  { id: 'content_media', label: 'Content + Media', description: 'Text, buttons and an image or video', icon: NewspaperIcon },
  { id: 'list', label: 'List', description: 'Links and external resources', icon: ListBulletIcon },
  { id: 'collection', label: 'Collection', description: 'Curated groups of items', icon: RectangleStackIcon },
  { id: 'store', label: 'Sell & Monetize', description: 'Products, memberships and digital goods', icon: ShoppingBagIcon },
  { id: 'campaign', label: 'Campaign', description: 'Call to action or newsletter', icon: MegaphoneIcon },
  { id: 'footer', label: 'Footer', description: 'Social links and closing info', icon: Bars3BottomLeftIcon },
]
