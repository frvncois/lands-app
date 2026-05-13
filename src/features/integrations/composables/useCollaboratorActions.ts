import { useLandStore } from '@/features/lands/stores/land'
import { collaboratorService } from '@/features/integrations/services/collaborator.service'
import type { Collaborator, CollaboratorRole } from '@/features/integrations/types/collaborator'

export function useCollaboratorActions() {
  const landStore = useLandStore()

  function getCollaborators(): Collaborator[] {
    return landStore.activeLand?.collaborators ?? []
  }

  async function invite(email: string, role: CollaboratorRole): Promise<Collaborator | null> {
    const land = landStore.activeLand
    if (!land) return null

    // Prevent duplicate invites locally before hitting the API
    if (land.collaborators.some(c => c.email === email)) return null

    const collaborator = await collaboratorService.invite(land.id, email, role)

    landStore.updateLand(land.id, {
      collaborators: [...land.collaborators, collaborator],
    })
    return collaborator
  }

  async function updateRole(collaboratorId: string, role: CollaboratorRole): Promise<void> {
    const land = landStore.activeLand
    if (!land) return

    await collaboratorService.updateRole(collaboratorId, role)

    landStore.updateLand(land.id, {
      collaborators: land.collaborators.map(c => c.id === collaboratorId ? { ...c, role } : c),
    })
  }

  async function remove(collaboratorId: string): Promise<void> {
    const land = landStore.activeLand
    if (!land) return

    await collaboratorService.remove(collaboratorId)

    landStore.updateLand(land.id, {
      collaborators: land.collaborators.filter(c => c.id !== collaboratorId),
    })
  }

  async function resendInvite(collaboratorId: string): Promise<void> {
    const land = landStore.activeLand
    const c = land?.collaborators.find(c => c.id === collaboratorId)
    if (!c || !land) return

    await collaboratorService.resendInvite(land.id, c.email, c.role)

    landStore.updateLand(land.id, {
      collaborators: land.collaborators.map(col =>
        col.id === collaboratorId ? { ...col, invited_at: new Date().toISOString() } : col
      ),
    })
  }

  return {
    getCollaborators,
    invite,
    updateRole,
    remove,
    resendInvite,
  }
}
