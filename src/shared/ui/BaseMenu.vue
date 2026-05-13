<script setup lang="ts">
import { ref, computed } from 'vue'

defineEmits<{ logout: [] }>()
import { ChevronDownIcon, UserCircleIcon, SparklesIcon, QuestionMarkCircleIcon, ArrowRightStartOnRectangleIcon } from '@heroicons/vue/24/outline'
import { useRouter, useRoute } from 'vue-router'
import LandsLogo from '@/assets/LandsLogo.vue'
import BaseButton from './BaseButton.vue'
import BaseProject from './BaseProject.vue'
import CreateProjectModal from '@/features/modals/modals/CreateProjectModal.vue'
import ConfirmLeaveModal from '@/features/modals/modals/ConfirmLeaveModal.vue'
import { useLandStore } from '@/features/lands/stores/land'
import { useUserStore } from '@/features/auth/stores/user'
import { useEditorStore } from '@/features/editor/stores/editor'
import { useThemeStore } from '@/features/theme/stores/theme'

const router = useRouter()
const route = useRoute()
const landStore = useLandStore()
const userStore = useUserStore()
const editorStore = useEditorStore()
const themeStore = useThemeStore()

const routeLabels: Record<string, string> = {
  '/dashboard/account': 'Account',
  '/dashboard/plans': 'Plans',
  '/dashboard/support': 'Support',
}

const subLabel = computed(() => {
  return routeLabels[route.path] ?? landStore.activeLand?.title ?? 'My Land'
})

const open = ref(false)
const showCreateModal = ref(false)
const showLeaveModal = ref(false)
const pendingNav = ref<(() => void) | null>(null)

function navigate(action: () => void) {
  open.value = false
  if (editorStore.isDirty) {
    pendingNav.value = action
    showLeaveModal.value = true
  } else {
    action()
  }
}

function confirmLeave() {
  // Restore land + theme to their pre-edit snapshot
  if (editorStore.landSnapshot) {
    landStore.updateLand(editorStore.landSnapshot.id, editorStore.landSnapshot)
  }
  if (editorStore.themeSnapshot) {
    themeStore.setTheme(editorStore.themeSnapshot)
  }
  editorStore.exitEditMode()
  pendingNav.value?.()
  pendingNav.value = null
  showLeaveModal.value = false
}

function cancelLeave() {
  pendingNav.value = null
  showLeaveModal.value = false
  open.value = false
}

function switchProject(landId: string) {
  const wasEditing = editorStore.isEditMode
  editorStore.exitEditMode()
  landStore.isLoading = true
  router.push('/dashboard')
  // If editor was open, delay the land switch until the sidebar has collapsed
  setTimeout(() => {
    landStore.setActiveLand(landId)
    setTimeout(() => { landStore.isLoading = false }, 600)
  }, wasEditing ? 500 : 0)
}

const navButtonClass = 'w-full !justify-start text-gray-700'
</script>

<template>
  <div class="relative">
    <button
      class="flex items-center gap-3 px-3 py-1 rounded-xl w-70 hover:bg-gray-50 transition-colors"
      @click="open = !open"
    >
      <LandsLogo class="h-5 w-5 shrink-0" />
      <div class="text-left leading-tight w-[250px]">
        <p class="text-sm font-medium text-gray-900 truncate">{{ userStore.fullName || 'My account' }}</p>
        <p class="text-xs text-gray-400 truncate">{{ subLabel }}</p>
      </div>
      <ChevronDownIcon class="h-3.5 w-3.5 text-gray-400 shrink-0 ml-auto" />
    </button>

    <Transition name="modal-grow">
      <div
        v-if="open"
        class="absolute top-full left-0 mt-2 z-50 rounded-xl bg-white border border-gray-200 shadow-xl/5 overflow-hidden origin-top-left"
      >
        <div class="p-2 flex flex-col gap-1 border-b border-gray-100">
          <BaseProject
            v-for="land in landStore.lands"
            :key="land.id"
            :title="land.title"
            :url="land.handle + '.lands.app'"
            :image="(land.sections.find(s => s.type === 'header')?.settings_json as any)?.cover_media_value || undefined"
            :plan="land.plan"
            :active="landStore.activeLandId === land.id && route.path === '/dashboard'"
            @click="navigate(() => switchProject(land.id))"
          />
          <BaseButton size="sm" class="w-full" variant="outline" @click="showCreateModal = true; open = false">
            + Create new project
          </BaseButton>
        </div>
        <div class="p-1 border-b border-gray-100">
          <BaseButton size="sm" :class="navButtonClass" :active="route.path === '/dashboard/account'" @click="navigate(() => router.push('/dashboard/account'))">
            <UserCircleIcon class="h-4 w-4" />Account
          </BaseButton>
          <BaseButton size="sm" :class="navButtonClass" :active="route.path === '/dashboard/plans'" @click="navigate(() => router.push('/dashboard/plans'))">
            <SparklesIcon class="h-4 w-4" />Plans
          </BaseButton>
          <BaseButton size="sm" :class="navButtonClass" :active="route.path === '/dashboard/support'" @click="navigate(() => router.push('/dashboard/support'))">
            <QuestionMarkCircleIcon class="h-4 w-4" />Support
          </BaseButton>
        </div>
        <div class="p-1">
          <BaseButton size="sm" :class="navButtonClass" @click="$emit('logout'); open = false">
            <ArrowRightStartOnRectangleIcon class="h-4 w-4" />Logout
          </BaseButton>
        </div>
      </div>
    </Transition>

    <div v-if="open" class="fixed inset-0 z-40" @click="open = false" />
  </div>

  <Transition name="modal-center">
    <CreateProjectModal v-if="showCreateModal" @close="showCreateModal = false" />
  </Transition>

  <Transition name="modal-center">
    <ConfirmLeaveModal v-if="showLeaveModal" @confirm="confirmLeave" @cancel="cancelLeave" />
  </Transition>
</template>
