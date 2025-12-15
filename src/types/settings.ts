import type { Component } from 'vue'
import type { ProjectPlan, PlanFeature } from '@/types/project'

export interface SettingsSection {
  id: string
  title: string
  description?: string
  icon?: string

  /** Settings page rendering */
  component?: Component

  /** Sidebar navigation */
  routeName?: string

  /** Feature / plan gating */
  requiresPlan?: ProjectPlan
  requiresFeature?: PlanFeature
  visible?: () => boolean

  /** Header / Command usage */
  showInHeader?: boolean
  showInCommand?: boolean

  /** Breadcrumbs */
  breadcrumbLabel?: string
}
