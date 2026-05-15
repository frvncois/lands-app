<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ChartBarIcon, MegaphoneIcon, UsersIcon, CurrencyDollarIcon, PuzzlePieceIcon, GlobeAltIcon, MagnifyingGlassIcon, QrCodeIcon, Cog6ToothIcon } from '@heroicons/vue/24/outline'
import BaseItem from '@/shared/ui/BaseItem.vue'
import BaseButton from '@/shared/ui/BaseButton.vue'
import IntegrationSettingsModal, { type Integration } from './IntegrationSettingsModal.vue'
import { useAppModals } from '@/features/modals/stores/appModals'
import { usePlan } from '@/features/plan/composables/usePlan'

const emit = defineEmits<{ close: [], openCustomDomain: [] }>()

const router = useRouter()
const appModals = useAppModals()
const { canUseCustomDomain } = usePlan()

function goToSupport() {
  appModals.close()
  router.push('/dashboard/support')
}

const integrations: Integration[] = [
  { id: 'publish_settings', title: 'Publish Settings', description: 'Title, URL, visibility and password protection', icon: Cog6ToothIcon },
  { id: 'analytics',     title: 'Analytics',        description: 'Track visits and engagement',              icon: ChartBarIcon },
  { id: 'campaign',      title: 'Campaign',          description: 'Manage marketing campaigns',               icon: MegaphoneIcon },
  { id: 'collaborators', title: 'Collaborators',     description: 'Invite team members to your project',      icon: UsersIcon },
  { id: 'custom_domain', title: 'Custom Domain',     description: 'Connect your own domain to this land',     icon: GlobeAltIcon },
  { id: 'qr_code',       title: 'QR Code',           description: 'Download a QR code for your project',      icon: QrCodeIcon },
  { id: 'seo',           title: 'SEO',               description: 'Meta title, description and social image', icon: MagnifyingGlassIcon },
  { id: 'sell',          title: 'Sell',              description: 'Manage products, orders and payments',      icon: CurrencyDollarIcon },
]

const active = ref<Integration | null>(null)

watch(() => appModals.activeIntegration, (id) => {
  if (id) {
    const integration = integrations.find(p => p.id === id)
    if (integration) { direction.value = 'forward'; active.value = integration }
  } else {
    active.value = null
  }
}, { immediate: true })
const direction = ref<'forward' | 'back'>('forward')
const contentWrapper = ref<HTMLElement | null>(null)

function goTo(integration: Integration) {
  if (integration.id === 'custom_domain' && canUseCustomDomain.value) {
    emit('openCustomDomain')
    return
  }
  direction.value = 'forward'
  active.value = integration
}

function goBack() {
  direction.value = 'back'
  active.value = null
  appModals.activeIntegration = null
}

function onBeforeLeave() {
  if (!contentWrapper.value) return
  contentWrapper.value.style.height = contentWrapper.value.scrollHeight + 'px'
  contentWrapper.value.style.overflow = 'hidden'
}

function onEnter(el: Element) {
  if (!contentWrapper.value) return
  const newHeight = (el as HTMLElement).scrollHeight
  contentWrapper.value.style.transition = 'height 0.22s ease'
  contentWrapper.value.style.height = newHeight + 'px'
}

function onAfterEnter() {
  if (!contentWrapper.value) return
  contentWrapper.value.style.height = ''
  contentWrapper.value.style.overflow = ''
  contentWrapper.value.style.transition = ''
}
</script>

<template>
  <div class="fixed top-20 right-8 w-80 z-50 bg-white shadow-xl rounded-2xl overflow-hidden origin-top-right border border-gray-200">

    <!-- Unified header -->
    <div class="flex items-center justify-between p-4 border-b border-gray-200 shrink-0">
      <div class="flex items-center gap-2.5">
        <Transition name="modal-fade" mode="out-in">
          <component :is="active?.icon ?? PuzzlePieceIcon" :key="active?.id ?? 'list'" class="h-4 w-4 text-gray-900" />
        </Transition>
        <Transition name="modal-title" mode="out-in">
          <h2 :key="active?.id ?? 'list'" class="text-sm font-semibold text-gray-900">{{ active?.title ?? 'Settings' }}</h2>
        </Transition>
      </div>
      <div class="flex items-center gap-1 shrink-0">
        <template v-if="active">
          <BaseButton variant="outline" size="xs" @click="goBack">Back</BaseButton>
        </template>
        <template v-else>
          <BaseButton variant="outline" size="xs" @click="emit('close')">Close</BaseButton>
        </template>
      </div>
    </div>

    <!-- Content: slides with direction, height animates -->
    <div ref="contentWrapper">
      <Transition
        :name="direction === 'forward' ? 'modal-forward' : 'modal-back'"
        mode="out-in"
        @before-leave="onBeforeLeave"
        @enter="onEnter"
        @after-enter="onAfterEnter"
      >
        <div v-if="active" :key="active.id">
          <IntegrationSettingsModal
            :integration="active"
            :hide-header="true"
            @back="goBack"
            @save="goBack"
          />
        </div>
        <div v-else key="list" class="flex flex-col gap-2 p-4">
          <BaseItem
            v-for="integration in integrations"
            :key="integration.id"
            clickable
            :icon="integration.icon"
            :title="integration.title"
            :description="integration.description"
            @click="goTo(integration)"
          />
          <BaseButton size="sm" variant="outline" class="mt-2" @click="goToSupport">Need help?</BaseButton>
        </div>
      </Transition>
    </div>

  </div>
</template>
