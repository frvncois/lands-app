<script setup lang="ts">
import { computed } from 'vue'
import { useLandStore } from '@/stores/land'
import type { Section, HeaderContent } from '@/types/section'

const props = defineProps<{ section: Section }>()
const content = computed(() => props.section.content as HeaderContent | null)
const landStore = useLandStore()
const projectName = computed(() => landStore.activeLand?.title ?? '')
</script>

<template>
  <div class="flex flex-col">
    <div class="flex flex-col gap-6 justify-center items-center text-center h-[40em] p-16 relative">
      <div class="absolute top-12">
        <img v-if="content?.logo" :src="content.logo" class="h-8 w-auto object-contain" />
        <span v-else class="text-2xl font-semibold" style="color: var(--theme-main)">{{ projectName }}</span>
      </div>
      <div class="flex flex-col pt-12 gap-6 items-center">
        <h1 class="text-xs uppsercase border rounded-xl px-2" style="color: var(--theme-main)">{{ content?.title }}</h1>
        <h2 class="text-6xl w-[15ch]" style="color: var(--theme-main);">{{ content?.subtitle }}</h2>
        <p v-if="content?.description" class="w-[35ch] leading-tight" style="color: var(--theme-main); opacity: 0.5">{{ content.description }}</p>
        <div v-if="content?.buttons?.length" class="flex flex-wrap items-center justify-center gap-3">
          <a
            v-for="btn in content.buttons"
            :key="btn.id"
            :href="btn.url || '#'"
            class="inline-flex items-center px-6 py-2.5 text-sm font-medium rounded-xl border-2 transition-opacity hover:opacity-80"
            style="border-color: var(--theme-main); color: var(--theme-main)"
          >
            {{ btn.label }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
