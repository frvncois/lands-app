<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseAvatar from '@/components/ui/BaseAvatar.vue';
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

const avatarUrl = ref(userStore.user?.avatar_image ?? '')
const firstName = ref(userStore.user?.first_name ?? '')
const lastName = ref(userStore.user?.last_name ?? '')
const email = ref(userStore.user?.email ?? '')

function saveProfile() {
  if (!userStore.user) return
  userStore.setUser({ ...userStore.user, avatar_image: avatarUrl.value, first_name: firstName.value, last_name: lastName.value, email: email.value })
}
</script>

<template>
  <section class="max-w-2xl m-auto pt-8 space-y-8 divide-y divide-gray-300">

    <h1 class="text-2xl pb-8">Account</h1>

    <div class="flex flex-col gap-4 pb-8">
      <div class="flex flex-col gap-4">
        <h2>Profile</h2>
          <BaseAvatar
            v-model="avatarUrl"
            :alt="`${firstName} ${lastName}`"
          />
          <div class="flex gap-4">
            <BaseInput size="lg" label="First Name" placeholder="First name" v-model="firstName" />
            <BaseInput size="lg" label="Last Name" placeholder="Last name" v-model="lastName" />
          </div>
      </div>
      <div class="flex flex-col gap-4">
        <BaseInput size="lg" label="Email" placeholder="user@example.com" v-model="email" />
      </div>
      <div>
        <BaseButton variant="solid" size="md" @click="saveProfile">Save</BaseButton>
      </div>
    </div>
    <div class="flex flex-col gap-4 pb-8">
        <h2>Password</h2>
          <div class="flex gap-4">
            <BaseInput size="lg" label="Current Password" placeholder="************" />
          </div>
          <div class="flex gap-4">
            <BaseInput size="lg" label="New password" placeholder="**********" />
            <BaseInput size="lg" label="Confirm password" placeholder="**********" />
          </div>
          <div>
            <BaseButton variant="solid" size="md">Save</BaseButton>
          </div>
    </div>

    
  </section>
</template>
