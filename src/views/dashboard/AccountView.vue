<script setup lang="ts">
import { ref } from 'vue'
import { UserCircleIcon, LockClosedIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import ConfirmDeleteAccountModal from '@/components/modals/ConfirmDeleteAccountModal.vue'
import { useUserStore } from '@/stores/user'
import { userService } from '@/services/user.service'
import authService from '@/services/auth.service'
import { useToast } from '@/composables/useToast'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const { addToast } = useToast()
const router = useRouter()

const firstName = ref(userStore.user?.first_name ?? '')
const lastName = ref(userStore.user?.last_name ?? '')
const email = ref(userStore.user?.email ?? '')
const isSaving = ref(false)

const newPassword = ref('')
const confirmPassword = ref('')
const isChangingPassword = ref(false)

const showDeleteModal = ref(false)

async function saveProfile() {
  if (!userStore.user) return
  isSaving.value = true
  try {
    const updated = await userService.updateMe({
      first_name: firstName.value,
      last_name: lastName.value,
      email: email.value,
    })
    userStore.setUser(updated)
    addToast('Profile saved')
  } catch {
    addToast('Failed to save profile', 'error')
  } finally {
    isSaving.value = false
  }
}

async function changePassword() {
  if (!newPassword.value) return
  if (newPassword.value !== confirmPassword.value) {
    addToast('Passwords do not match', 'error')
    return
  }
  if (newPassword.value.length < 8) {
    addToast('Password must be at least 8 characters', 'error')
    return
  }
  isChangingPassword.value = true
  try {
    await authService.resetPassword(newPassword.value)
    newPassword.value = ''
    confirmPassword.value = ''
    addToast('Password updated')
  } catch {
    addToast('Failed to update password', 'error')
  } finally {
    isChangingPassword.value = false
  }
}

async function onAccountDeleted() {
  showDeleteModal.value = false
  // TODO: Call account deletion API when SMTP + deletion endpoint are ready
  await authService.logout()
  router.push('/auth')
}
</script>

<template>
  <section class="h-full overflow-y-auto">
    <section class="max-w-2xl m-auto pt-4 space-y-8">

    <h1 class="text-2xl pb-8">Account</h1>

    <!-- Profile -->
    <div class="flex flex-col gap-4 pb-8">
      <div class="flex items-center gap-3">
        <div class="shrink-0 flex items-center justify-center h-8 w-8 rounded-xl bg-gray-100">
          <UserCircleIcon class="h-4 w-4 text-gray-600" />
        </div>
        <div>
          <h2 class="text-base font-semibold text-gray-900">Profile</h2>
          <p class="text-xs text-gray-400">Your personal information</p>
        </div>
      </div>
      <div class="flex gap-4">
        <BaseInput size="lg" label="First Name" placeholder="First name" v-model="firstName" />
        <BaseInput size="lg" label="Last Name" placeholder="Last name" v-model="lastName" />
      </div>
      <BaseInput size="lg" label="Email" placeholder="user@example.com" v-model="email" />
      <div>
        <BaseButton variant="solid" size="md" :disabled="isSaving" @click="saveProfile">
          {{ isSaving ? 'Saving…' : 'Save' }}
        </BaseButton>
      </div>
    </div>

    <!-- Password -->
    <div class="flex flex-col gap-4 pt-8 pb-8">
      <div class="flex items-center gap-3">
        <div class="shrink-0 flex items-center justify-center h-8 w-8 rounded-xl bg-gray-100">
          <LockClosedIcon class="h-4 w-4 text-gray-600" />
        </div>
        <div>
          <h2 class="text-base font-semibold text-gray-900">Password</h2>
          <p class="text-xs text-gray-400">Change your login password</p>
        </div>
      </div>
      <div class="flex gap-4">
        <BaseInput size="lg" label="New password" type="password" placeholder="**********" v-model="newPassword" />
        <BaseInput size="lg" label="Confirm password" type="password" placeholder="**********" v-model="confirmPassword" />
      </div>
      <div>
        <BaseButton variant="solid" size="md" :disabled="isChangingPassword" @click="changePassword">
          {{ isChangingPassword ? 'Saving…' : 'Save' }}
        </BaseButton>
      </div>
    </div>

    <!-- Danger zone -->
    <div class="flex flex-col gap-4 pt-8 pb-8">
      <div class="flex items-center gap-3">
        <div class="shrink-0 flex items-center justify-center h-8 w-8 rounded-xl bg-red-50">
          <ExclamationTriangleIcon class="h-4 w-4 text-red-400" />
        </div>
        <div>
          <h2 class="text-base font-semibold text-red-500">Danger zone</h2>
          <p class="text-xs text-gray-400">Irreversible account actions</p>
        </div>
      </div>
      <p class="text-sm text-gray-500">
        Deleting your account is permanent. All your projects will be deleted unless you transfer ownership to a collaborator.
      </p>
      <div>
        <BaseButton variant="remove" size="md" @click="showDeleteModal = true">
          Delete account
        </BaseButton>
      </div>
    </div>

    </section>

    <Transition name="modal-center">
      <ConfirmDeleteAccountModal
        v-if="showDeleteModal"
        @confirm="onAccountDeleted"
        @cancel="showDeleteModal = false"
      />
    </Transition>
  </section>
</template>
