const COLLABORATOR_ROLES = {
  admin: 'admin',
  editor: 'editor',
} as const

export type CollaboratorRole = typeof COLLABORATOR_ROLES[keyof typeof COLLABORATOR_ROLES]

const COLLABORATOR_STATUSES = {
  pending: 'pending',
  active: 'active',
  declined: 'declined',
} as const

export type CollaboratorStatus = typeof COLLABORATOR_STATUSES[keyof typeof COLLABORATOR_STATUSES]

export interface Collaborator {
  id: string
  land_id: string
  email: string
  role: CollaboratorRole
  status: CollaboratorStatus
  invited_at: string
  joined_at: string | null
}
