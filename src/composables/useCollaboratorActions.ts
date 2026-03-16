import { useLandStore } from '@/stores/land'
import { collaboratorService } from '@/services/collaborator.service'
import type { Collaborator, CollaboratorRole } from '@/types/collaborator'

export function useCollaboratorActions() {
  const landStore = useLandStore()

  function getCollaborators(): Collaborator[] {
    return landStore.activeLand?.collaborators ?? []
  }

  async function invite(email: string, role: CollaboratorRole): Promise<Collaborator | null> {
    if (!landStore.activeLand) return null

    const collaborator = await collaboratorService.invite(landStore.activeLand.id, email, role)

    // Optimistically update local store
    landStore.activeLand.collaborators.push(collaborator)
    return collaborator
  }

  async function updateRole(collaboratorId: string, role: CollaboratorRole): Promise<void> {
    await collaboratorService.updateRole(collaboratorId, role)

    // Update local store
    const c = landStore.activeLand?.collaborators.find(c => c.id === collaboratorId)
    if (c) c.role = role
  }

  async function remove(collaboratorId: string): Promise<void> {
    await collaboratorService.remove(collaboratorId)

    // Update local store
    if (!landStore.activeLand) return
    const idx = landStore.activeLand.collaborators.findIndex(c => c.id === collaboratorId)
    if (idx !== -1) landStore.activeLand.collaborators.splice(idx, 1)
  }

  async function resendInvite(collaboratorId: string): Promise<void> {
    const c = landStore.activeLand?.collaborators.find(c => c.id === collaboratorId)
    if (!c || !landStore.activeLand) return

    await collaboratorService.resendInvite(landStore.activeLand.id, c.email, c.role)

    // Update invited_at locally
    c.invited_at = new Date().toISOString()
  }

  return {
    getCollaborators,
    invite,
    updateRole,
    remove,
    resendInvite,
  }
}
