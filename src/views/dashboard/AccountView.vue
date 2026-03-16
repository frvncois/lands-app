<script setup lang="ts">
import { ref, watch } from 'vue'
import { UserCircleIcon, LockClosedIcon, ExclamationTriangleIcon, TrashIcon } from '@heroicons/vue/24/outline'
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

watch(() => userStore.user, (user) => {
  if (!user) return
  firstName.value = user.first_name
  lastName.value = user.last_name
  email.value = user.email
}, { immediate: false })
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
  // Session is already gone server-side — just clear local state and redirect
  await authService.logout()
  router.push('/auth')
}
</script>

<template>
  <section class="h-full overflow-y-auto">
    <section class="max-w-2xl m-auto pt-4 space-y-8">

    <div class="pb-8">
      <h1 class="text-2xl">Account</h1>
      <p class="text-sm text-gray-400 mt-1">Manage your profile, password and account settings.</p>
    </div>

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
      <BaseInput size="lg" label="Email" placeholder="user@example.com" v-model="email" :disabled="true" />
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
      <button
        class="group flex items-center rounded-xl border border-red-100 hover:bg-red-50 transition-all p-1.5 gap-2 cursor-pointer w-full text-left"
        @click="showDeleteModal = true"
      >
        <div class="shrink-0 flex items-center justify-center h-9 w-9 rounded-lg bg-red-500 text-white">
          <TrashIcon class="h-4 w-4" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-red-600">Delete account</p>
          <p class="text-xs text-gray-400">Permanently removes your account and all projects</p>
        </div>
        <TrashIcon class="h-4 w-4 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mr-1" />
      </button>
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
