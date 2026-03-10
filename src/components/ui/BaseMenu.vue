<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChevronDownIcon } from '@heroicons/vue/24/outline'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import LandsLogo from '@/assets/LandsLogo.vue'
import BaseButton from './BaseButton.vue'
import BaseProject from './BaseProject.vue'
import CreateProjectModal from '@/components/modals/CreateProjectModal.vue'
import { useLandStore } from '@/stores/land'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const landStore = useLandStore()
const userStore = useUserStore()

const routeLabels: Record<string, string> = {
  '/dashboard/account': 'Account',
  '/dashboard/plans': 'Plans',
}

const subLabel = computed(() => {
  return routeLabels[route.path] ?? landStore.activeLand?.title ?? 'My Land'
})

const open = ref(false)
const showCreateModal = ref(false)

const navButtonClass = 'w-full !justify-start text-gray-700'
</script>

<template>
  <div class="relative">
    <button
      class="flex items-center gap-3 px-4 py-1 rounded-2xl hover:bg-gray-50 transition-colors"
      @click="open = !open"
    >
      <LandsLogo class="h-5 w-5 shrink-0" />
      <div class="text-left leading-tight w-[150px]">
        <p class="text-sm font-medium text-gray-900 truncate">{{ userStore.fullName || 'My account' }}</p>
        <p class="text-xs text-gray-400 truncate">{{ subLabel }}</p>
      </div>
      <ChevronDownIcon class="h-3.5 w-3.5 text-gray-400 shrink-0" />
    </button>

    <div
      v-if="open"
      class="absolute top-full left-0 mt-1 z-50 min-w-56 rounded-xl border border-gray-200 bg-white shadow-md overflow-hidden"
    >
      <div class="p-2 flex flex-col gap-1 border-b border-gray-100">
        <BaseProject
          v-for="land in landStore.lands"
          :key="land.id"
          :title="land.title"
          :url="land.handle + '.lands.app'"
          :image="land.avatar_image"
          :active="landStore.activeLandId === land.id && route.path === '/dashboard'"
          @click="landStore.setActiveLand(land.id); router.push('/dashboard'); open = false"
        />
        <BaseButton size="sm" :class="navButtonClass" @click="showCreateModal = true; open = false">
          + Create new project
        </BaseButton>
      </div>
      <div class="p-1 border-b border-gray-100">
        <RouterLink to="/dashboard/account" class="block" @click="open = false">
          <BaseButton size="sm" :class="navButtonClass" :active="route.path === '/dashboard/account'">Account</BaseButton>
        </RouterLink>
        <RouterLink to="/dashboard/plans" class="block" @click="open = false">
          <BaseButton size="sm" :class="navButtonClass" :active="route.path === '/dashboard/plans'">Plans</BaseButton>
        </RouterLink>
        <BaseButton size="sm" :class="navButtonClass" @click="open = false">Support</BaseButton>
      </div>
      <div class="p-1">
        <BaseButton size="sm" :class="navButtonClass" @click="console.log('logout'); open = false">
          Logout
        </BaseButton>
      </div>
    </div>

    <div v-if="open" class="fixed inset-0 z-40" @click="open = false" />
  </div>

  <Transition name="modal-center">
    <CreateProjectModal v-if="showCreateModal" @close="showCreateModal = false" />
  </Transition>
</template>
