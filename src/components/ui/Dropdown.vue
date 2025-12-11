<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Button from './Button.vue'
import Icon from './Icon.vue'

interface Props {
  icon?: string
  align?: 'left' | 'right'
  position?: 'bottom' | 'top'
  width?: string
  closeOnClick?: boolean
  noPadding?: boolean
}

withDefaults(defineProps<Props>(), {
  icon: 'app-more',
  align: 'right',
  position: 'bottom',
  width: 'min-w-30',
  closeOnClick: true,
  noPadding: false,
})

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

function toggle() {
  isOpen.value = !isOpen.value
}

function close() {
  isOpen.value = false
}

function handleClickOutside(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

defineExpose({ close })
</script>

<script lang="ts">
import DropdownItem from './DropdownItem.vue'
import DropdownDivider from './DropdownDivider.vue'

export default {
  Item: DropdownItem,
  Divider: DropdownDivider,
}
</script>

<template>
  <div ref="dropdownRef" class="relative">
    <slot name="trigger" :toggle="toggle" :is-open="isOpen">
      <Button
        variant="outline"
        size="icon"
        @click="toggle"
      >
        <Icon :name="icon" :size="18" />
      </Button>
    </slot>

    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        :class="[
          'absolute bg-popover backdrop-blur-sm border border-border/75 rounded-xl shadow-lg z-10',
          noPadding ? '' : 'p-1.5',
          width,
          position === 'top' ? 'bottom-full mb-1 origin-bottom' : 'top-full mt-1 origin-top',
          align === 'right' ? 'right-0' : 'left-0',
        ]"
        @click="closeOnClick && close()"
      >
        <slot />
      </div>
    </Transition>
  </div>
</template>
