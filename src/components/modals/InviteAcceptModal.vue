<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { useLandStore } from '@/stores/land'
import { collaboratorService } from '@/services/collaborator.service'
import { landService } from '@/services/land.service'
import BaseButton from '@/components/ui/BaseButton.vue'

const route = useRoute()
const router = useRouter()
const landStore = useLandStore()

const landId = ref<string | null>(null)
const landTitle = ref<string>('')
const isLoading = ref(false)
const error = ref('')
const show = ref(false)

onMounted(async () => {
  // Priority 1: explicit ?invite= query param (new user arriving via invite link)
  const inviteId = route.query.invite as string | undefined

  if (inviteId) {
    landId.value = inviteId
  } else {
    // Priority 2: check DB for any pending invite for this user's email
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) return

    const { data: pending } = await supabase
      .from('collaborators')
      .select('land_id')
      .eq('email', user.email)
      .eq('status', 'pending')
      .limit(1)
      .maybeSingle()

    if (!pending?.land_id) return
    landId.value = pending.land_id
  }

  // Fetch the land name to show in the modal
  const { data } = await supabase
    .from('lands')
    .select('title')
    .eq('id', landId.value!)
    .maybeSingle()

  landTitle.value = data?.title ?? 'a project'
  show.value = true
})

async function accept() {
  if (!landId.value) return
  isLoading.value = true
  error.value = ''
  try {
    await collaboratorService.acceptInvite(landId.value)
    sessionStorage.removeItem('lands_invite_land')

    // Reload lands so the collaborated land appears in the list
    const lands = await landService.getMyLands()
    landStore.setLands(lands)

    // Activate the newly joined land
    const joined = lands.find((l) => l.id === landId.value)
    if (joined) landStore.setActiveLand(joined.id)

    dismiss()
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    isLoading.value = false
  }
}

async function refuse() {
  if (!landId.value) return
  isLoading.value = true
  error.value = ''
  try {
    await collaboratorService.refuseInvite(landId.value)
    sessionStorage.removeItem('lands_invite_land')

    // If user has no lands of their own, send them to onboarding
    if (landStore.lands.length === 0) {
      router.push('/onboarding')
      return
    }
    dismiss()
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    isLoading.value = false
  }
}

function dismiss() {
  show.value = false
  // Remove the ?invite= query param without triggering navigation
  const query = { ...route.query }
  delete query.invite
  router.replace({ query })
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/30" />

        <!-- Panel -->
        <div class="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div class="space-y-1">
            <h2 class="text-xl font-semibold text-gray-900">You've been invited</h2>
            <p class="text-sm text-gray-500">
              You have a pending invitation to collaborate on
              <span class="font-medium text-gray-900">{{ landTitle }}</span>.
            </p>
          </div>

          <p v-if="error" class="text-sm text-red-500">{{ error }}</p>

          <div class="flex gap-3">
            <BaseButton
              variant="solid"
              size="md"
              class="flex-1"
              :disabled="isLoading"
              @click="accept"
            >
              {{ isLoading ? 'Accepting…' : 'Accept' }}
            </BaseButton>
            <BaseButton
              variant="outline"
              size="md"
              class="flex-1"
              :disabled="isLoading"
              @click="refuse"
            >
              Decline
            </BaseButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
