import type { Section } from './section'
import type { LandTheme } from './theme'
import type { LandPlan } from './plan'
import type { Collaborator } from './collaborator'
import type { CampaignIntegration } from './campaign'

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
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  custom_domain: string | null
  custom_domain_status: 'pending' | 'active' | 'error' | null
  campaign_integration: CampaignIntegration | null
  is_published: boolean
  is_private: boolean
  private_password: string | null
  purpose?: string
  created_at: string
  updated_at: string
}
