<script setup lang="ts">
import { onMounted } from 'vue'
import { loadGoogleFont } from '@/lib/utils/fonts'

const props = defineProps<{
  label: string
  fontFamily: string
  googleFont?: string
  active?: boolean
}>()

defineEmits<{ click: [] }>()

onMounted(() => {
  if (props.googleFont) loadGoogleFont(props.googleFont)
})
</script>

<template>
  <button
    class="group w-full text-left px-3 py-2.5 rounded-xl border transition-all duration-150"
    :class="active
      ? 'border-gray-900 bg-gray-950'
      : 'border-gray-100 bg-gray-50 hover:border-gray-300'"
    @click="$emit('click')"
  >
    <p
      class="text-3xl leading-none mb-2 transition-colors"
      :class="active ? 'text-white' : 'text-gray-900'"
      :style="{ fontFamily }"
    >Ag</p>
    <p
      class="text-[10px] uppercase tracking-widest font-medium transition-colors"
      :class="active ? 'text-gray-400' : 'text-gray-400'"
      style="font-family: ui-sans-serif, system-ui, sans-serif"
    >{{ label }}</p>
  </button>
</template>
