<script setup lang="ts">
import { computed } from 'vue'
import { useLandStore } from '@/features/lands/stores/land'
import type { Section } from '@/features/sections/types'
import { SECTION_REGISTRY } from '@/features/sections/registry'
import { getSectionTitle } from '@/features/editor/composables/useSectionTree'
import { sortByPosition } from '@/shared/lib/position'

const props = defineProps<{ section: Section }>()
const content = computed(() => props.section.type === 'header' ? props.section.content : null)
const landStore = useLandStore()
const projectName = computed(() => landStore.activeLand?.title ?? '')

const navItems = computed(() => {
  const sections = landStore.activeLand?.sections ?? []
  return sortByPosition(sections)
    .filter(s => s.visible !== false)
    .filter(s => SECTION_REGISTRY[s.type]?.inHeaderNav === true)
    .map(s => ({
      id: s.id,
      label: getSectionTitle(s) || SECTION_REGISTRY[s.type].label,
      href: `#section-${s.id}`,
    }))
})
</script>

<template>
  <div class="flex flex-col">
    <div class="flex flex-col gap-6 justify-center items-center text-center h-[40em] p-16 relative">
      <div class="absolute top-12">
        <img v-if="content?.logo" :src="content.logo" class="h-8 w-auto object-contain" />
        <span v-else class="text-2xl font-semibold" style="color: var(--theme-main)">{{ projectName }}</span>
      </div>
      <div class="flex flex-col pt-12 gap-6 items-center">
        <h1 class="text-xs uppsercase border rounded-xl px-2 tracking-widest uppercase" style="color: var(--theme-accent)">{{ content?.subtitle }}</h1>
        <h2 class="text-6xl w-[15ch]" style="color: var(--theme-accent);">{{ content?.title }}</h2>
        <p v-if="content?.description" class="w-[35ch] leading-tight" style="color: var(--theme-main);">{{ content.description }}</p>
        <nav v-if="navItems.length" class="flex flex-wrap items-center justify-center gap-3">
          <a
            v-for="item in navItems"
            :key="item.id"
            :href="item.href"
            class="inline-flex items-center px-6 py-2.5 text-sm font-medium rounded-xl border-2 transition-opacity hover:opacity-80"
            style="border-color: var(--theme-main); color: var(--theme-main)"
          >{{ item.label }}</a>
        </nav>
      </div>
    </div>
  </div>
</template>
