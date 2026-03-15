import type { Section } from './section'
import type { LandTheme } from './theme'
import type { LandPlan } from './plan'
import type { Collaborator } from './collaborator'

export interface Land {
  id: string
  user_id: string
  handle: string // URL slug — handle.lands.app
  title: string
  description: string
  avatar_image: string
  cover_image: string
  sections: Section[]
  theme: LandTheme
  plan: LandPlan
  collaborators: Collaborator[]
  stripe_account_id: string | null
  stripe_account_name: string | null
  is_published: boolean
  purpose?: string
  created_at: string
  updated_at: string
}
