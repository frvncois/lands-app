<script setup lang="ts">
import { onMounted } from 'vue'
import { loadGoogleFont } from '@/shared/lib/fonts'

const props = defineProps<{
  label: string
  titleFont: string
  bodyFont: string
  titleGoogleFont?: string
  bodyGoogleFont?: string
  active?: boolean
}>()

defineEmits<{ click: [] }>()

onMounted(() => {
  if (props.titleGoogleFont) loadGoogleFont(props.titleGoogleFont)
  if (props.bodyGoogleFont && props.bodyGoogleFont !== props.titleGoogleFont) loadGoogleFont(props.bodyGoogleFont)
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
    <div class="flex items-baseline gap-2 mb-1.5">
      <p
        class="text-2xl leading-none transition-colors"
        :class="active ? 'text-white' : 'text-gray-900'"
        :style="{ fontFamily: titleFont }"
      >Aa</p>
      <p
        class="text-base leading-none transition-colors"
        :class="active ? 'text-gray-300' : 'text-gray-500'"
        :style="{ fontFamily: bodyFont }"
      >Aa</p>
    </div>
    <p
      class="text-[10px] uppercase tracking-widest font-medium"
      :class="active ? 'text-gray-400' : 'text-gray-400'"
      style="font-family: ui-sans-serif, system-ui, sans-serif"
    >{{ label }}</p>
  </button>
</template>
