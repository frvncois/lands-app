import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import type { Project, ProjectIntegration, IntegrationProvider, ProjectContent, Collaborator, CollaboratorInvite, CollaboratorRole } from '@/types/project'
import { getDefaultPageSettings } from '@/lib/editor-utils'
import { useUserStore } from '@/stores/user'
import { useToast } from '@/stores/toast'
import type { ProjectLayout } from '@/lib/layouts'

export const useProjectsStore = defineStore('projects', () => {
  const toast = useToast()

  // State
  const projects = ref<Project[]>([])
  const projectContents = ref<Map<string, ProjectContent>>(new Map())
  const integrations = ref<ProjectIntegration[]>([])
  const collaborators = ref<Collaborator[]>([])
  const collaboratorInvites = ref<CollaboratorInvite[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const projectCount = computed(() => projects.value.length)
  const publishedProjects = computed(() => projects.value.filter(p => p.isPublished))
  const draftProjects = computed(() => projects.value.filter(p => !p.isPublished))

  function getProjectById(id: string): Project | undefined {
    return projects.value.find(p => p.id === id)
  }

  function getProjectIntegrations(projectId: string): ProjectIntegration[] {
    return integrations.value.filter(i => i.projectId === projectId)
  }

  function getProjectIntegration(projectId: string, provider: IntegrationProvider): ProjectIntegration | undefined {
    return integrations.value.find(i => i.projectId === projectId && i.provider === provider)
  }

  function getProjectContent(projectId: string): ProjectContent | undefined {
    return projectContents.value.get(projectId)
  }

  function getProjectCollaborators(projectId: string): Collaborator[] {
    return collaborators.value.filter(c => c.projectId === projectId)
  }

  function getProjectInvites(projectId: string): CollaboratorInvite[] {
    return collaboratorInvites.value.filter(i => i.projectId === projectId)
  }

  function getPendingInvites(projectId: string): CollaboratorInvite[] {
    return collaboratorInvites.value.filter(i => i.projectId === projectId && i.status === 'pending')
  }

  // Helper to map database row to Project type
  function mapDbToProject(row: {
    id: string
    user_id: string
    title: string
    slug: string
    description: string | null
    thumbnail_url: string | null
    is_published: boolean
    published_url: string | null
    custom_domain: string | null
    plan: 'free' | 'pro' | 'business'
    created_at: string
    updated_at: string
  }): Project {
    return {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      slug: row.slug,
      description: row.description || undefined,
      thumbnailUrl: row.thumbnail_url || undefined,
      isPublished: row.is_published,
      publishedUrl: row.published_url || undefined,
      customDomain: row.custom_domain || undefined,
      plan: row.plan,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }

  // Actions - Projects
  async function fetchProjects() {
    isLoading.value = true
    error.value = null
    try {
      const { data, error: fetchError } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false })

      if (fetchError) throw fetchError

      projects.value = (data || []).map(mapDbToProject)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch projects'
    } finally {
      isLoading.value = false
    }
  }

  async function createProject(title: string, layout?: ProjectLayout): Promise<Project | null> {
    const userStore = useUserStore()
    if (!userStore.authUser) {
      error.value = 'You must be logged in to create a project'
      console.error('createProject: No authenticated user')
      return null
    }

    const slug = title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')

    // Use layout content if provided, otherwise use defaults
    const defaultContent: ProjectContent = layout
      ? {
          blocks: layout.blocks,
          pageSettings: layout.pageSettings,
        }
      : {
          blocks: [],
          pageSettings: getDefaultPageSettings(),
        }

    try {
      console.log('createProject: Inserting project for user', userStore.authUser.id)

      // Insert project
      const { data, error: insertError } = await supabase
        .from('projects')
        .insert({
          user_id: userStore.authUser.id,
          title,
          slug,
          is_published: false,
          plan: 'free',
        })
        .select()
        .single()

      if (insertError) {
        console.error('createProject: Insert error', insertError)
        throw insertError
      }

      console.log('createProject: Project created', data)

      // Insert default content
      const { error: contentError } = await supabase.from('project_content').insert({
        project_id: data.id,
        blocks: defaultContent.blocks,
        page_settings: defaultContent.pageSettings,
      })

      if (contentError) {
        console.error('createProject: Content insert error', contentError)
        // Don't throw, project was created successfully
      }

      const newProject = mapDbToProject(data)
      projects.value.unshift(newProject)
      projectContents.value.set(newProject.id, defaultContent)

      toast.success('Project created', `"${title}" is ready to edit`)
      return newProject
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message :
        (e && typeof e === 'object' && 'message' in e) ? String(e.message) : 'Failed to create project'
      error.value = errorMessage
      console.error('createProject: Error', e)
      toast.error('Failed to create project', errorMessage)
      return null
    }
  }

  async function updateProject(id: string, updates: Partial<Project>): Promise<boolean> {
    const index = projects.value.findIndex(p => p.id === id)
    if (index === -1) return false

    // Store previous state for rollback
    const previousProject = { ...projects.value[index] }

    // Optimistic update
    projects.value[index] = {
      ...projects.value[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    try {
      const { error: updateError } = await supabase
        .from('projects')
        .update({
          title: updates.title,
          slug: updates.slug,
          description: updates.description,
          thumbnail_url: updates.thumbnailUrl,
          is_published: updates.isPublished,
          published_url: updates.publishedUrl,
          custom_domain: updates.customDomain,
          plan: updates.plan,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (updateError) throw updateError
      return true
    } catch (e) {
      // Rollback on error
      projects.value[index] = previousProject
      error.value = e instanceof Error ? e.message : 'Failed to update project'
      toast.error('Failed to update project')
      return false
    }
  }

  async function deleteProject(id: string): Promise<boolean> {
    // Store previous state for rollback
    const projectIndex = projects.value.findIndex(p => p.id === id)
    const previousProject = projectIndex !== -1 ? { ...projects.value[projectIndex] } : null
    const previousContent = projectContents.value.get(id)
    const previousIntegrations = integrations.value.filter(i => i.projectId === id)
    const previousCollaborators = collaborators.value.filter(c => c.projectId === id)
    const previousInvites = collaboratorInvites.value.filter(i => i.projectId === id)

    // Optimistic delete
    projects.value = projects.value.filter(p => p.id !== id)
    projectContents.value.delete(id)
    integrations.value = integrations.value.filter(i => i.projectId !== id)
    collaborators.value = collaborators.value.filter(c => c.projectId !== id)
    collaboratorInvites.value = collaboratorInvites.value.filter(i => i.projectId !== id)

    try {
      const { error: deleteError } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError
      toast.success('Project deleted')
      return true
    } catch (e) {
      // Rollback on error
      if (previousProject && projectIndex !== -1) {
        projects.value.splice(projectIndex, 0, previousProject)
      }
      if (previousContent) {
        projectContents.value.set(id, previousContent)
      }
      integrations.value.push(...previousIntegrations)
      collaborators.value.push(...previousCollaborators)
      collaboratorInvites.value.push(...previousInvites)

      error.value = e instanceof Error ? e.message : 'Failed to delete project'
      toast.error('Failed to delete project')
      return false
    }
  }

  async function fetchProjectContent(projectId: string): Promise<ProjectContent | null> {
    try {
      const { data, error: fetchError } = await supabase
        .from('project_content')
        .select('*')
        .eq('project_id', projectId)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError

      if (data) {
        const content: ProjectContent = {
          blocks: data.blocks as ProjectContent['blocks'],
          pageSettings: data.page_settings as ProjectContent['pageSettings'],
        }
        projectContents.value.set(projectId, content)
        return content
      }

      // Return default content if none exists
      const defaultContent: ProjectContent = {
        blocks: [],
        pageSettings: getDefaultPageSettings(),
      }
      projectContents.value.set(projectId, defaultContent)
      return defaultContent
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch project content'
      return null
    }
  }

  async function saveProjectContent(projectId: string, content: ProjectContent): Promise<boolean> {
    // Store previous state for rollback
    const previousContent = projectContents.value.get(projectId)
    const projectIndex = projects.value.findIndex(p => p.id === projectId)
    const previousProject = projectIndex !== -1 ? { ...projects.value[projectIndex] } : null

    // Optimistic update
    const contentSnapshot: ProjectContent = JSON.parse(JSON.stringify(content))
    projectContents.value.set(projectId, contentSnapshot)

    if (projectIndex !== -1) {
      projects.value[projectIndex] = {
        ...projects.value[projectIndex],
        updatedAt: new Date().toISOString(),
      }
    }

    try {
      const { error: upsertError } = await supabase
        .from('project_content')
        .upsert(
          {
            project_id: projectId,
            blocks: content.blocks,
            page_settings: content.pageSettings,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'project_id',
          }
        )

      if (upsertError) throw upsertError

      // Also update project's updated_at
      await supabase
        .from('projects')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', projectId)

      return true
    } catch (e) {
      // Rollback on error
      if (previousContent) {
        projectContents.value.set(projectId, previousContent)
      } else {
        projectContents.value.delete(projectId)
      }
      if (previousProject && projectIndex !== -1) {
        projects.value[projectIndex] = previousProject
      }

      error.value = e instanceof Error ? e.message : 'Failed to save project content'
      return false
    }
  }

  async function duplicateProject(id: string): Promise<Project | null> {
    const userStore = useUserStore()
    if (!userStore.authUser) {
      error.value = 'You must be logged in to duplicate a project'
      return null
    }

    const original = getProjectById(id)
    if (!original) return null

    try {
      // Insert duplicated project
      const { data, error: insertError } = await supabase
        .from('projects')
        .insert({
          user_id: userStore.authUser.id,
          title: `${original.title} (Copy)`,
          slug: `${original.slug}-copy-${Date.now()}`,
          description: original.description,
          is_published: false,
          plan: original.plan,
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Copy the content too
      const originalContent = projectContents.value.get(id)
      const newContent: ProjectContent = originalContent
        ? JSON.parse(JSON.stringify(originalContent))
        : { blocks: [], pageSettings: getDefaultPageSettings() }

      await supabase.from('project_content').insert({
        project_id: data.id,
        blocks: newContent.blocks,
        page_settings: newContent.pageSettings,
      })

      const newProject = mapDbToProject(data)
      projects.value.unshift(newProject)
      projectContents.value.set(newProject.id, newContent)

      toast.success('Project duplicated')
      return newProject
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to duplicate project'
      toast.error('Failed to duplicate project')
      return null
    }
  }

  // Actions - Integrations
  async function fetchIntegrations(projectId: string) {
    try {
      const { data, error: fetchError } = await supabase
        .from('project_integrations')
        .select('*')
        .eq('project_id', projectId)

      if (fetchError) throw fetchError

      // Map and merge with existing integrations
      const projectIntegrations = (data || []).map(row => ({
        id: row.id,
        projectId: row.project_id,
        provider: row.provider as IntegrationProvider,
        config: row.config as Record<string, string>,
        isConnected: row.is_connected,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }))

      // Remove old integrations for this project and add new ones
      integrations.value = integrations.value.filter(i => i.projectId !== projectId)
      integrations.value.push(...projectIntegrations)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch integrations'
    }
  }

  async function connectIntegration(
    projectId: string,
    provider: IntegrationProvider,
    config: Record<string, string>
  ): Promise<ProjectIntegration | null> {
    const existing = getProjectIntegration(projectId, provider)

    // Store previous state for rollback
    const previousIntegration = existing ? { ...existing } : null
    const existingIndex = existing ? integrations.value.findIndex(i => i.id === existing.id) : -1

    const integration: ProjectIntegration = {
      id: existing?.id || crypto.randomUUID(),
      projectId,
      provider,
      config,
      isConnected: true,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Optimistic update
    if (existing && existingIndex !== -1) {
      integrations.value[existingIndex] = integration
    } else {
      integrations.value.push(integration)
    }

    try {
      const { data, error: upsertError } = await supabase
        .from('project_integrations')
        .upsert({
          id: integration.id,
          project_id: projectId,
          provider,
          config,
          is_connected: true,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (upsertError) throw upsertError

      // Update with actual data from DB
      integration.id = data.id
      toast.success('Integration connected')
      return integration
    } catch (e) {
      // Rollback on error
      if (previousIntegration && existingIndex !== -1) {
        integrations.value[existingIndex] = previousIntegration
      } else if (!previousIntegration) {
        integrations.value = integrations.value.filter(i => i.id !== integration.id)
      }
      error.value = e instanceof Error ? e.message : 'Failed to connect integration'
      toast.error('Failed to connect integration')
      return null
    }
  }

  async function disconnectIntegration(projectId: string, provider: IntegrationProvider): Promise<boolean> {
    // Store previous state for rollback
    const integrationToRemove = integrations.value.find(
      i => i.projectId === projectId && i.provider === provider
    )
    const previousIndex = integrationToRemove
      ? integrations.value.findIndex(i => i.id === integrationToRemove.id)
      : -1

    // Optimistic delete
    integrations.value = integrations.value.filter(
      i => !(i.projectId === projectId && i.provider === provider)
    )

    try {
      const { error: deleteError } = await supabase
        .from('project_integrations')
        .delete()
        .eq('project_id', projectId)
        .eq('provider', provider)

      if (deleteError) throw deleteError
      toast.success('Integration disconnected')
      return true
    } catch (e) {
      // Rollback on error
      if (integrationToRemove && previousIndex !== -1) {
        integrations.value.splice(previousIndex, 0, integrationToRemove)
      }
      error.value = e instanceof Error ? e.message : 'Failed to disconnect integration'
      toast.error('Failed to disconnect integration')
      return false
    }
  }

  // Actions - Collaborators
  async function fetchCollaborators(projectId: string) {
    try {
      const { data, error: fetchError } = await supabase
        .from('collaborators')
        .select('*')
        .eq('project_id', projectId)

      if (fetchError) throw fetchError

      const projectCollaborators = (data || []).map(row => ({
        id: row.id,
        projectId: row.project_id,
        userId: row.user_id,
        email: row.email,
        name: row.name || undefined,
        avatar: row.avatar_url || undefined,
        role: row.role as CollaboratorRole,
        joinedAt: row.joined_at,
      }))

      // Remove old collaborators for this project and add new ones
      collaborators.value = collaborators.value.filter(c => c.projectId !== projectId)
      collaborators.value.push(...projectCollaborators)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch collaborators'
    }
  }

  async function fetchCollaboratorInvites(projectId: string) {
    try {
      const { data, error: fetchError } = await supabase
        .rpc('get_project_invites', { p_project_id: projectId })

      if (fetchError) throw fetchError

      const projectInvites = (data || []).map(row => ({
        id: row.id,
        projectId: row.project_id,
        email: row.email,
        role: row.role as CollaboratorRole,
        status: row.status as CollaboratorInvite['status'],
        token: row.token,
        invitedBy: row.invited_by,
        invitedByName: row.invited_by_name || undefined,
        createdAt: row.created_at,
        expiresAt: row.expires_at,
      }))

      // Remove old invites for this project and add new ones
      collaboratorInvites.value = collaboratorInvites.value.filter(i => i.projectId !== projectId)
      collaboratorInvites.value.push(...projectInvites)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch invites'
    }
  }

  async function inviteCollaborator(
    projectId: string,
    email: string,
    role: CollaboratorRole
  ): Promise<CollaboratorInvite | null> {
    const userStore = useUserStore()
    if (!userStore.authUser) {
      error.value = 'You must be logged in to invite collaborators'
      return null
    }

    // Check if already invited or is a collaborator (local check for quick feedback)
    const existingInvite = collaboratorInvites.value.find(
      i => i.projectId === projectId && i.email === email && i.status === 'pending'
    )
    if (existingInvite) {
      error.value = 'This email has already been invited'
      return null
    }

    const existingCollaborator = collaborators.value.find(
      c => c.projectId === projectId && c.email === email
    )
    if (existingCollaborator) {
      error.value = 'This user is already a collaborator'
      return null
    }

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

    try {
      // Use RPC to bypass RLS issues
      const { data, error: insertError } = await supabase
        .rpc('create_project_invite', {
          p_project_id: projectId,
          p_email: email,
          p_role: role,
          p_invited_by: userStore.authUser.id,
          p_invited_by_name: userStore.user?.name || 'Unknown',
          p_expires_at: expiresAt,
        })

      if (insertError) throw insertError

      const invite: CollaboratorInvite = {
        id: data.id,
        projectId,
        email,
        role,
        status: 'pending',
        token: data.token,
        invitedBy: userStore.authUser.id,
        invitedByName: userStore.user?.name || 'Unknown',
        createdAt: data.created_at,
        expiresAt: data.expires_at,
      }

      // Add to local state
      collaboratorInvites.value.push(invite)

      // Call edge function to send email (don't await to not block UI)
      supabase.functions.invoke('send-invite-email', {
        body: { invite },
      }).catch(err => {
        console.error('Failed to send invite email:', err)
        // Email failed but invite was created, don't rollback
      })

      toast.success('Invitation sent', `Invite sent to ${email}`)
      return invite
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to send invite'
      toast.error('Failed to send invitation')
      return null
    }
  }

  async function cancelInvite(inviteId: string): Promise<boolean> {
    // Store previous state for rollback
    const inviteToRemove = collaboratorInvites.value.find(i => i.id === inviteId)
    const previousIndex = inviteToRemove
      ? collaboratorInvites.value.findIndex(i => i.id === inviteId)
      : -1

    // Optimistic delete
    collaboratorInvites.value = collaboratorInvites.value.filter(i => i.id !== inviteId)

    try {
      const { error: deleteError } = await supabase
        .from('collaborator_invites')
        .delete()
        .eq('id', inviteId)

      if (deleteError) throw deleteError
      toast.success('Invitation cancelled')
      return true
    } catch (e) {
      // Rollback on error
      if (inviteToRemove && previousIndex !== -1) {
        collaboratorInvites.value.splice(previousIndex, 0, inviteToRemove)
      }
      error.value = e instanceof Error ? e.message : 'Failed to cancel invite'
      toast.error('Failed to cancel invitation')
      return false
    }
  }

  async function resendInvite(inviteId: string): Promise<boolean> {
    const invite = collaboratorInvites.value.find(i => i.id === inviteId)
    if (!invite) {
      error.value = 'Invite not found'
      return false
    }

    // Store previous state for rollback
    const previousExpiresAt = invite.expiresAt
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

    // Optimistic update
    invite.expiresAt = newExpiresAt

    try {
      const { error: updateError } = await supabase
        .from('collaborator_invites')
        .update({ expires_at: newExpiresAt })
        .eq('id', inviteId)

      if (updateError) throw updateError

      // Call edge function to resend email
      await supabase.functions.invoke('send-invite-email', {
        body: { invite },
      })

      toast.success('Invitation resent')
      return true
    } catch (e) {
      // Rollback on error
      invite.expiresAt = previousExpiresAt
      error.value = e instanceof Error ? e.message : 'Failed to resend invite'
      toast.error('Failed to resend invitation')
      return false
    }
  }

  async function updateCollaboratorRole(collaboratorId: string, role: CollaboratorRole): Promise<boolean> {
    const collaborator = collaborators.value.find(c => c.id === collaboratorId)
    if (!collaborator) {
      error.value = 'Collaborator not found'
      return false
    }

    // Store previous state for rollback
    const previousRole = collaborator.role

    // Optimistic update
    collaborator.role = role

    try {
      const { error: updateError } = await supabase
        .from('collaborators')
        .update({ role })
        .eq('id', collaboratorId)

      if (updateError) throw updateError
      toast.success('Role updated')
      return true
    } catch (e) {
      // Rollback on error
      collaborator.role = previousRole
      error.value = e instanceof Error ? e.message : 'Failed to update role'
      toast.error('Failed to update role')
      return false
    }
  }

  async function removeCollaborator(collaboratorId: string): Promise<boolean> {
    // Store previous state for rollback
    const collaboratorToRemove = collaborators.value.find(c => c.id === collaboratorId)
    const previousIndex = collaboratorToRemove
      ? collaborators.value.findIndex(c => c.id === collaboratorId)
      : -1

    // Optimistic delete
    collaborators.value = collaborators.value.filter(c => c.id !== collaboratorId)

    try {
      const { error: deleteError } = await supabase
        .from('collaborators')
        .delete()
        .eq('id', collaboratorId)

      if (deleteError) throw deleteError
      toast.success('Collaborator removed')
      return true
    } catch (e) {
      // Rollback on error
      if (collaboratorToRemove && previousIndex !== -1) {
        collaborators.value.splice(previousIndex, 0, collaboratorToRemove)
      }
      error.value = e instanceof Error ? e.message : 'Failed to remove collaborator'
      toast.error('Failed to remove collaborator')
      return false
    }
  }

  // Actions - Publishing
  async function publishProject(projectId: string): Promise<boolean> {
    const project = getProjectById(projectId)
    if (!project) {
      error.value = 'Project not found'
      return false
    }

    const content = projectContents.value.get(projectId)
    if (!content) {
      error.value = 'Project content not found'
      toast.error('Failed to publish', 'Project content not found')
      return false
    }

    // Store previous state for rollback
    const previousIsPublished = project.isPublished
    const previousPublishedUrl = project.publishedUrl
    const projectIndex = projects.value.findIndex(p => p.id === projectId)

    // Optimistic update
    if (projectIndex !== -1) {
      projects.value[projectIndex] = {
        ...projects.value[projectIndex],
        isPublished: true,
        publishedUrl: `https://${project.slug}.lands.app`,
      }
    }

    try {
      const { data, error: publishError } = await supabase.functions.invoke('publish-project', {
        body: {
          projectId,
          action: 'publish',
        },
      })

      if (publishError) throw publishError
      if (data?.error) throw new Error(data.error)

      toast.success('Project published', `Live at ${project.slug}.lands.app`)
      return true
    } catch (e) {
      // Rollback on error
      if (projectIndex !== -1) {
        projects.value[projectIndex] = {
          ...projects.value[projectIndex],
          isPublished: previousIsPublished,
          publishedUrl: previousPublishedUrl,
        }
      }
      error.value = e instanceof Error ? e.message : 'Failed to publish project'
      toast.error('Failed to publish', error.value)
      return false
    }
  }

  async function unpublishProject(projectId: string): Promise<boolean> {
    const project = getProjectById(projectId)
    if (!project) {
      error.value = 'Project not found'
      return false
    }

    // Store previous state for rollback
    const previousIsPublished = project.isPublished
    const previousPublishedUrl = project.publishedUrl
    const projectIndex = projects.value.findIndex(p => p.id === projectId)

    // Optimistic update
    if (projectIndex !== -1) {
      projects.value[projectIndex] = {
        ...projects.value[projectIndex],
        isPublished: false,
        publishedUrl: undefined,
      }
    }

    try {
      const { data, error: unpublishError } = await supabase.functions.invoke('publish-project', {
        body: {
          projectId,
          action: 'unpublish',
        },
      })

      if (unpublishError) throw unpublishError
      if (data?.error) throw new Error(data.error)

      toast.success('Project unpublished')
      return true
    } catch (e) {
      // Rollback on error
      if (projectIndex !== -1) {
        projects.value[projectIndex] = {
          ...projects.value[projectIndex],
          isPublished: previousIsPublished,
          publishedUrl: previousPublishedUrl,
        }
      }
      error.value = e instanceof Error ? e.message : 'Failed to unpublish project'
      toast.error('Failed to unpublish', error.value)
      return false
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    projects,
    projectContents,
    integrations,
    collaborators,
    collaboratorInvites,
    isLoading,
    error,
    // Getters
    projectCount,
    publishedProjects,
    draftProjects,
    getProjectById,
    getProjectIntegrations,
    getProjectIntegration,
    getProjectContent,
    getProjectCollaborators,
    getProjectInvites,
    getPendingInvites,
    // Actions - Projects
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    duplicateProject,
    // Actions - Project Content
    fetchProjectContent,
    saveProjectContent,
    // Actions - Integrations
    fetchIntegrations,
    connectIntegration,
    disconnectIntegration,
    // Actions - Collaborators
    fetchCollaborators,
    fetchCollaboratorInvites,
    inviteCollaborator,
    cancelInvite,
    resendInvite,
    updateCollaboratorRole,
    removeCollaborator,
    // Actions - Publishing
    publishProject,
    unpublishProject,
    clearError,
  }
})
