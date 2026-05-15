import type { Section } from '@/features/sections/types'
import type { LandTheme } from '@/features/theme/types'
import type { LandPlan } from '@/features/plan/types'
import type { Collaborator } from '@/features/integrations/types/collaborator'
import type { CampaignIntegration } from '@/features/integrations/types/campaign'

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
  meta_title?: string | null
  meta_description?: string | null
  og_image?: string | null
  is_published: boolean
  is_private: boolean
  private_password: string | null
  created_at: string
  updated_at: string
}
