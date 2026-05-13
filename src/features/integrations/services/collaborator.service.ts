import { supabase } from '@/shared/lib/supabase'
import type { Collaborator, CollaboratorRole } from '@/features/integrations/types/collaborator'

export const collaboratorService = {
  async invite(landId: string, email: string, role: CollaboratorRole): Promise<Collaborator> {
    const { data, error } = await supabase.functions.invoke('invite-collaborator', {
      body: { landId, email, role },
    })
    if (error) {
      // Extract the actual error message from the response body when available
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let message = error.message
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const body = await (error as any).context?.json?.()
        if (body?.error) message = body.error
      } catch { /* ignore */ }
      throw new Error(message)
    }
    if (data?.error) throw new Error(data.error)
    return data.collaborator as Collaborator
  },

  async updateRole(collaboratorId: string, role: CollaboratorRole): Promise<void> {
    const { error } = await supabase
      .from('collaborators')
      .update({ role })
      .eq('id', collaboratorId)
    if (error) throw new Error(error.message)
  },

  async remove(collaboratorId: string): Promise<void> {
    const { error } = await supabase
      .from('collaborators')
      .delete()
      .eq('id', collaboratorId)
    if (error) throw new Error(error.message)
  },

  async resendInvite(landId: string, email: string, role: CollaboratorRole): Promise<void> {
    // Re-invoke the invite function — Supabase re-sends the email if the user exists
    const { data, error } = await supabase.functions.invoke('invite-collaborator', {
      body: { landId, email, role },
    })
    // 409 Conflict means they already exist — resend is a no-op from our side
    // (Supabase handles re-sending the email on a duplicate inviteUserByEmail call)
    if (error && !error.message.includes('already been invited')) throw new Error(error.message)
    if (data?.error && !data.error.includes('already been invited')) throw new Error(data.error)
  },

  async acceptInvite(landId: string): Promise<void> {
    const { data, error } = await supabase.functions.invoke('accept-invite', {
      body: { landId },
    })
    if (error) throw new Error(error.message)
    if (data?.error) throw new Error(data.error)
  },

  async refuseInvite(landId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Find collaborator row by current user's email + landId
    const { error } = await supabase
      .from('collaborators')
      .delete()
      .eq('land_id', landId)
      .eq('email', user.email!)

    if (error) throw new Error(error.message)
  },

  async deleteAccount(transferMap: Record<string, string>): Promise<void> {
    const { data, error } = await supabase.functions.invoke('delete-account', {
      body: { transferMap },
    })
    if (error) throw new Error(error.message)
    if (data?.error) throw new Error(data.error)
  },
}
