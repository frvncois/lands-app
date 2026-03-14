import {
  UserCircleIcon,
  ListBulletIcon,
  RectangleStackIcon,
  ShoppingBagIcon,
  CreditCardIcon,
  MegaphoneIcon,
  Bars3BottomLeftIcon,
  NewspaperIcon,
} from '@heroicons/vue/24/outline'
import type { FunctionalComponent } from 'vue'
import type { SectionType } from '@/types/section'

export interface SectionPrimitive {
  id: SectionType
  label: string
  description: string
  icon: FunctionalComponent
}

export const sectionPrimitives: SectionPrimitive[] = [
  { id: 'header', label: 'Header', description: 'Name, bio and profile photo', icon: UserCircleIcon },
  { id: 'content_media', label: 'Content + Media', description: 'Text, buttons and an image or video', icon: NewspaperIcon },
  { id: 'list', label: 'List', description: 'Links and external resources', icon: ListBulletIcon },
  { id: 'collection', label: 'Collection', description: 'Curated groups of items', icon: RectangleStackIcon },
  { id: 'store', label: 'Store', description: 'Sell products and digital goods', icon: ShoppingBagIcon },
  { id: 'monetize', label: 'Monetize', description: 'Memberships and recurring revenue', icon: CreditCardIcon },
  { id: 'campaign', label: 'Campaign', description: 'Call to action or newsletter', icon: MegaphoneIcon },
  { id: 'footer', label: 'Footer', description: 'Social links and closing info', icon: Bars3BottomLeftIcon },
]
