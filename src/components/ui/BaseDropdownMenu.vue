<script setup lang="ts">
import { ref } from 'vue'
import type { FunctionalComponent } from 'vue'
import { EllipsisVerticalIcon } from '@heroicons/vue/24/outline'
import BaseButton from './BaseButton.vue'

export interface DropdownMenuItem {
  label: string
  icon?: FunctionalComponent
  danger?: boolean
  disabled?: boolean
  action: () => void
}

defineProps<{ items: DropdownMenuItem[] }>()

const open = ref(false)

function trigger(item: DropdownMenuItem) {
  item.action()
  open.value = false
}
</script>

<template>
  <div class="relative">
    <BaseButton variant="icon" size="xs" @click="open = !open">
      <EllipsisVerticalIcon class="h-4 w-4" />
    </BaseButton>

    <Transition name="dropdown-menu">
      <div
        v-if="open"
        class="absolute right-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden "
      >
        <BaseButton
          v-for="item in items"
          :key="item.label"
          variant="ghost"
          size="sm"
          :disabled="item.disabled"
          class="w-full !justify-start gap-2 !rounded-none"
          :class="item.danger ? '!text-red-500 hover:!bg-red-50' : 'text-gray-700'"
          @click="trigger(item)"
        >
          <component
            :is="item.icon"
            v-if="item.icon"
            class="h-3.5 w-3.5 shrink-0"
            :class="item.danger ? 'text-red-400' : 'text-gray-400'"
          />
          {{ item.label }}
        </BaseButton>
      </div>
    </Transition>

    <div v-if="open" class="fixed inset-0 z-40" @click="open = false" />
  </div>
</template>

<style scoped>
.dropdown-menu-enter-active { transition: opacity 0.15s ease, transform 0.15s cubic-bezier(0.16, 1, 0.3, 1); }
.dropdown-menu-leave-active { transition: opacity 0.1s ease, transform 0.1s ease; }
.dropdown-menu-enter-from  { opacity: 0; transform: scale(0.95) translateY(-4px); }
.dropdown-menu-leave-to    { opacity: 0; transform: scale(0.95) translateY(-4px); }
</style>
