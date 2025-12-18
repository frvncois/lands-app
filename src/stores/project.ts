import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import type {
  ProjectSettings,
  SEOSettings,
  AnalyticsSettings,
  PublishSettings,
  DomainSettings,
  ProjectPlan,
} from '@/types/project'
import { getDefaultProjectSettings } from '@/types/project'
import { useProjectsStore } from '@/stores/projects'
import { useToast } from '@/stores/toast'

export const useProjectStore = defineStore('project', () => {
  const toast = useToast()

  // State
  const settings = ref<ProjectSettings>(getDefaultProjectSettings())
  const currentProjectId = ref<string | null>(null)
  const isLoading = ref(false)
  const isSaving = ref(false)
  const hasUnsavedChanges = ref(false)

  // Save settings to database
  async function saveToDatabase() {
    if (!currentProjectId.value) return

    isSaving.value = true
    try {
      // Update main project table
      const { error: projectError } = await supabase
        .from('projects')
        .update({
          title: settings.value.title,
          slug: settings.value.slug,
          description: settings.value.description,
          is_published: settings.value.publish.isPublished,
          custom_domain: settings.value.domain.customDomain || null,
          plan: settings.value.plan,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentProjectId.value)

      if (projectError) throw projectError

      // Upsert extended settings (SEO, visibility, etc.)
      const { error: settingsError } = await supabase
        .from('project_settings')
        .upsert({
          project_id: currentProjectId.value,
          meta_title: settings.value.seo.metaTitle || null,
          meta_description: settings.value.seo.metaDescription || null,
          keywords: settings.value.seo.keywords || null,
          og_image: settings.value.seo.ogImage || null,
          favicon: settings.value.seo.favicon || null,
          visibility: settings.value.publish.visibility,
          password: settings.value.publish.password || null,
          published_at: settings.value.publish.publishedAt || null,
          google_analytics_id: settings.value.analytics.googleAnalyticsId || null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'project_id' })

      if (settingsError) throw settingsError

      // Also update the projects store so the sidebar reflects changes
      const projectsStore = useProjectsStore()
      await projectsStore.fetchProjects()

      // Reset unsaved changes flag
      hasUnsavedChanges.value = false
      toast.success('Settings saved')
    } catch (e) {
      console.error('Failed to save project settings:', e)
      toast.error('Failed to save settings')
    } finally {
      isSaving.value = false
    }
  }

  // Actions
  async function loadProject(projectId: string, forceReload = false) {
    if (currentProjectId.value === projectId && !forceReload) return

    isLoading.value = true
    hasUnsavedChanges.value = false
    currentProjectId.value = projectId

    try {
      // Fetch project directly from database to ensure fresh data
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('id, title, slug, description, plan, is_published, custom_domain, created_at, updated_at')
        .eq('id', projectId)
        .single()

      if (projectError) throw projectError

      if (project) {
        // Load base settings from project
        settings.value = {
          ...getDefaultProjectSettings(),
          id: project.id,
          title: project.title,
          slug: project.slug,
          description: project.description || '',
          plan: project.plan,
          createdAt: project.created_at,
          updatedAt: project.updated_at,
          publish: {
            ...getDefaultProjectSettings().publish,
            isPublished: project.is_published,
          },
          domain: {
            ...getDefaultProjectSettings().domain,
            subdomain: project.slug,
            customDomain: project.custom_domain || '',
          },
        }

        // Load extended settings from project_settings table (may not exist for new projects)
        const { data: extendedSettings } = await supabase
          .from('project_settings')
          .select('meta_title, meta_description, keywords, og_image, favicon, visibility, password, published_at, umami_site_id, umami_enabled, google_analytics_id')
          .eq('project_id', projectId)
          .maybeSingle()

        if (extendedSettings) {
          settings.value.seo = {
            metaTitle: extendedSettings.meta_title || '',
            metaDescription: extendedSettings.meta_description || '',
            keywords: extendedSettings.keywords || '',
            ogImage: extendedSettings.og_image || '',
            favicon: extendedSettings.favicon || '',
          }
          settings.value.publish = {
            ...settings.value.publish,
            visibility: extendedSettings.visibility || 'public',
            password: extendedSettings.password || '',
            publishedAt: extendedSettings.published_at || '',
          }
          settings.value.analytics = {
            ...settings.value.analytics,
            umamiSiteId: extendedSettings.umami_site_id || '',
            umamiEnabled: extendedSettings.umami_enabled || false,
          }
        }
      } else {
        // Reset to defaults if project not found
        settings.value = getDefaultProjectSettings()
      }
    } catch (e) {
      console.error('Failed to load project settings:', e)
      settings.value = getDefaultProjectSettings()
    } finally {
      isLoading.value = false
    }
  }

  function updateSettings(updates: Partial<ProjectSettings>) {
    settings.value = {
      ...settings.value,
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    hasUnsavedChanges.value = true
  }

  function updateTitle(title: string) {
    settings.value.title = title
    settings.value.updatedAt = new Date().toISOString()
    hasUnsavedChanges.value = true
  }

  function updateSlug(slug: string) {
    // Sanitize slug: lowercase, replace spaces with hyphens, remove special chars
    const sanitizedSlug = slug
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
    settings.value.slug = sanitizedSlug
    settings.value.domain.subdomain = sanitizedSlug
    settings.value.updatedAt = new Date().toISOString()
    hasUnsavedChanges.value = true
  }

  function updateSEO(seo: Partial<SEOSettings>) {
    settings.value.seo = { ...settings.value.seo, ...seo }
    settings.value.updatedAt = new Date().toISOString()
    hasUnsavedChanges.value = true
  }

  function updateAnalytics(analytics: Partial<AnalyticsSettings>) {
    settings.value.analytics = { ...settings.value.analytics, ...analytics }
    settings.value.updatedAt = new Date().toISOString()
    hasUnsavedChanges.value = true
  }

  function updatePublish(publish: Partial<PublishSettings>) {
    settings.value.publish = { ...settings.value.publish, ...publish }
    if (publish.isPublished && !settings.value.publish.publishedAt) {
      settings.value.publish.publishedAt = new Date().toISOString()
    }
    settings.value.updatedAt = new Date().toISOString()
    hasUnsavedChanges.value = true
  }

  function updateDomain(domain: Partial<DomainSettings>) {
    settings.value.domain = { ...settings.value.domain, ...domain }
    settings.value.updatedAt = new Date().toISOString()
    hasUnsavedChanges.value = true
  }

  function updatePlan(plan: ProjectPlan) {
    settings.value.plan = plan
    settings.value.updatedAt = new Date().toISOString()
    hasUnsavedChanges.value = true
  }

  // Setup Umami analytics for Pro/Business plans
  async function setupUmamiAnalytics(): Promise<{ success: boolean; siteId?: string; error?: string }> {
    if (!currentProjectId.value) {
      return { success: false, error: 'No project loaded' }
    }

    // Check if plan allows analytics
    if (settings.value.plan === 'free') {
      return { success: false, error: 'Analytics requires Pro or Business plan' }
    }

    // Check if already set up
    if (settings.value.analytics.umamiSiteId) {
      return { success: true, siteId: settings.value.analytics.umamiSiteId }
    }

    try {
      const { data, error } = await supabase.functions.invoke('setup-umami-site', {
        body: {
          projectId: currentProjectId.value,
          action: 'create',
        },
      })

      if (error) throw error

      if (data?.success && data?.siteId) {
        // Update local state
        settings.value.analytics.umamiSiteId = data.siteId
        settings.value.analytics.umamiEnabled = true
        toast.success('Analytics enabled', 'Your site analytics are now active')
        return { success: true, siteId: data.siteId }
      }

      return { success: false, error: data?.error || 'Failed to setup analytics' }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to setup analytics'
      toast.error('Analytics setup failed', errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Disable Umami analytics
  async function disableUmamiAnalytics(): Promise<{ success: boolean; error?: string }> {
    if (!currentProjectId.value) {
      return { success: false, error: 'No project loaded' }
    }

    if (!settings.value.analytics.umamiSiteId) {
      return { success: true }
    }

    try {
      const { data, error } = await supabase.functions.invoke('setup-umami-site', {
        body: {
          projectId: currentProjectId.value,
          action: 'delete',
        },
      })

      if (error) throw error

      if (data?.success) {
        // Update local state
        settings.value.analytics.umamiSiteId = ''
        settings.value.analytics.umamiEnabled = false
        toast.success('Analytics disabled', 'Your site analytics have been removed')
        return { success: true }
      }

      return { success: false, error: data?.error || 'Failed to disable analytics' }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to disable analytics'
      toast.error('Failed to disable analytics', errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  function resetSettings() {
    settings.value = getDefaultProjectSettings()
    currentProjectId.value = null
  }

  return {
    // State
    settings,
    currentProjectId,
    isLoading,
    isSaving,
    hasUnsavedChanges,
    // Actions
    loadProject,
    updateSettings,
    updateTitle,
    updateSlug,
    updateSEO,
    updateAnalytics,
    updatePublish,
    updateDomain,
    updatePlan,
    setupUmamiAnalytics,
    disableUmamiAnalytics,
    resetSettings,
    saveToDatabase,
  }
})
