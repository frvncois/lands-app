import { useLandStore } from '@/stores/land'
import type { Collaborator, CollaboratorRole } from '@/types/collaborator'

export function useCollaboratorActions() {
  const landStore = useLandStore()

  function getCollaborators(): Collaborator[] {
    return landStore.activeLand?.collaborators ?? []
  }

  function invite(email: string, role: CollaboratorRole): Collaborator | null {
    if (!landStore.activeLand) return null

    const existing = landStore.activeLand.collaborators.find(c => c.email === email)
    if (existing) return existing

    const collaborator: Collaborator = {
      id: crypto.randomUUID(),
      land_id: landStore.activeLand.id,
      email,
      role,
      status: 'pending',
      invited_at: new Date().toISOString(),
      joined_at: null,
    }

    landStore.activeLand.collaborators.push(collaborator)
    return collaborator
  }

  function updateRole(collaboratorId: string, role: CollaboratorRole): void {
    const c = landStore.activeLand?.collaborators.find(c => c.id === collaboratorId)
    if (c) c.role = role
  }

  function remove(collaboratorId: string): void {
    if (!landStore.activeLand) return
    const idx = landStore.activeLand.collaborators.findIndex(c => c.id === collaboratorId)
    if (idx !== -1) landStore.activeLand.collaborators.splice(idx, 1)
  }

  function resendInvite(collaboratorId: string): void {
    const c = landStore.activeLand?.collaborators.find(c => c.id === collaboratorId)
    if (c && c.status === 'pending') {
      c.invited_at = new Date().toISOString()
    }
  }

  return {
    getCollaborators,
    invite,
    updateRole,
    remove,
    resendInvite,
  }
}
