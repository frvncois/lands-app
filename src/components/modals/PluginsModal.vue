<script setup lang="ts">
import { ref } from 'vue'
import { ChartBarIcon, MegaphoneIcon, UsersIcon, ShoppingCartIcon, BuildingStorefrontIcon, PuzzlePieceIcon } from '@heroicons/vue/24/outline'
import BaseItem from '../ui/BaseItem.vue'
import BaseButton from '../ui/BaseButton.vue'
import PluginsSettingsModal, { type Plugin } from './PluginsSettingsModal.vue'

defineEmits<{ close: [] }>()

const plugins: Plugin[] = [
  { id: 'analytics',     title: 'Analytics',     description: 'Track visits and engagement',          icon: ChartBarIcon },
  { id: 'campaign',      title: 'Campaign',       description: 'Manage marketing campaigns',           icon: MegaphoneIcon },
  { id: 'collaborators', title: 'Collaborators',  description: 'Invite team members to your project', icon: UsersIcon },
  { id: 'monetize',      title: 'Monetize',       description: 'Add a store to your project',         icon: ShoppingCartIcon },
  { id: 'store',         title: 'Store',          description: 'Manage products, orders and payments', icon: BuildingStorefrontIcon },
]

const active = ref<Plugin | null>(null)
const direction = ref<'forward' | 'back'>('forward')
const contentWrapper = ref<HTMLElement | null>(null)

function goTo(plugin: Plugin) {
  direction.value = 'forward'
  active.value = plugin
}

function goBack() {
  direction.value = 'back'
  active.value = null
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
  <div class="fixed top-20 right-8 w-80 z-50 bg-white shadow-xl rounded-2xl overflow-hidden origin-top-right">

    <!-- Unified header: title fades, buttons switch instantly -->
    <div class="flex items-center justify-between p-4 border-b border-gray-200 shrink-0">
      <div class="flex items-center gap-2">
        <Transition name="modal-fade" mode="out-in">
          <component :is="active?.icon ?? PuzzlePieceIcon" :key="active?.id ?? 'list'" class="h-4 w-4 text-gray-400" />
        </Transition>
        <Transition name="modal-title" mode="out-in">
          <h2 :key="active?.id ?? 'list'" class="text-sm font-semibold text-gray-900">{{ active?.title ?? 'Plugins' }}</h2>
        </Transition>
      </div>
      <div class="flex items-center gap-1 shrink-0">
        <template v-if="active">
          <BaseButton variant="outline" size="xs" @click="goBack">Back</BaseButton>
        </template>
        <template v-else>
          <BaseButton variant="outline" size="xs" @click="$emit('close')">Close</BaseButton>
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
          <PluginsSettingsModal
            :plugin="active"
            :hide-header="true"
            @back="goBack"
            @save="goBack"
          />
        </div>
        <div v-else key="list" class="flex flex-col gap-2 p-4">
          <BaseItem
            v-for="plugin in plugins"
            :key="plugin.id"
            clickable
            :icon="plugin.icon"
            :title="plugin.title"
            :description="plugin.description"
            @click="goTo(plugin)"
          />
            <BaseButton size="sm" variant="outline" class="mt-2">About plugins</BaseButton>

        </div>
      </Transition>
    </div>

  </div>
</template>
