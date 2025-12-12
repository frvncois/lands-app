import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface UseCollaborationOptions {
  lastSavedAt: () => string | null
  onCollaboratorChange: () => void
  showToast: (type: 'info' | 'success' | 'error', title: string, description?: string) => void
}

export function useCollaboration(options: UseCollaborationOptions) {
  const { lastSavedAt, onCollaboratorChange, showToast } = options

  // Collaboration state
  let realtimeChannel: RealtimeChannel | null = null
  const hasCollaboratorChanges = ref(false)
  const lastCollaboratorUpdate = ref<string | null>(null)

  /**
   * Subscribe to project content changes
   */
  function subscribeToProjectChanges(projectId: string) {
    // Unsubscribe from previous channel if exists
    unsubscribeFromProjectChanges()

    // Subscribe to changes on project_content table
    realtimeChannel = supabase
      .channel(`project-content-${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'project_content',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          // Ignore our own changes (compare timestamps)
          const updatedAt = payload.new.updated_at as string
          const saved = lastSavedAt()

          // If we just saved, this is likely our own change
          if (saved && new Date(updatedAt).getTime() - new Date(saved).getTime() < 2000) {
            return
          }

          // Another collaborator made changes
          hasCollaboratorChanges.value = true
          lastCollaboratorUpdate.value = updatedAt

          showToast(
            'info',
            'Project updated',
            'A collaborator made changes. Click "Reload" to see the latest version.'
          )

          onCollaboratorChange()
        }
      )
      .subscribe()
  }

  /**
   * Unsubscribe from project changes
   */
  function unsubscribeFromProjectChanges() {
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel)
      realtimeChannel = null
    }
    hasCollaboratorChanges.value = false
    lastCollaboratorUpdate.value = null
  }

  /**
   * Clear collaborator change flags (after reloading)
   */
  function clearCollaboratorChanges() {
    hasCollaboratorChanges.value = false
    lastCollaboratorUpdate.value = null
  }

  return {
    hasCollaboratorChanges,
    lastCollaboratorUpdate,
    subscribeToProjectChanges,
    unsubscribeFromProjectChanges,
    clearCollaboratorChanges,
  }
}
