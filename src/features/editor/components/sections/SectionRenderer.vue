<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '@/features/theme/stores/theme'
import { SECTION_REGISTRY } from '@/features/sections/registry'
import type { Section } from '@/features/sections/types'
import {
  MOCK_LINKS_ITEMS,
  MOCK_COLLECTIONS,
  MOCK_STORES,
  MOCK_MONETIZE_COLLECTIONS,
} from '@/shared/mock/mockSectionContent'

const props = defineProps<{ section: Section }>()
const themeStore = useThemeStore()

/** Resolve the variant component for the active theme, falling back to minimal. */
const variant = computed(() => {
  const entry = SECTION_REGISTRY[props.section.type]
  const preset = themeStore.theme?.theme_preset ?? 'minimal'
  return entry.variants[preset] ?? entry.variants.minimal
})

/**
 * Inject mock content for sections that are visually empty.
 * Uses the discriminated union so TypeScript narrows each branch correctly.
 */
const displaySection = computed((): Section => {
  const s = props.section

  switch (s.type) {
    case 'links': {
      if (!s.content?.items?.length) {
        return {
          ...s,
          content: {
            title: s.content?.title || '[ Section Title ]',
            description: s.content?.description ?? '',
            items: MOCK_LINKS_ITEMS,
          },
        }
      }
      break
    }
    case 'collection': {
      if (!s.content?.collections?.length) {
        return { ...s, content: { ...s.content, collections: MOCK_COLLECTIONS } }
      }
      break
    }
    case 'store': {
      if (!s.content?.stores?.length) {
        return { ...s, content: { ...s.content, stores: MOCK_STORES } }
      }
      break
    }
    case 'monetize': {
      if (!s.content?.collections?.length) {
        return { ...s, content: { ...s.content, collections: MOCK_MONETIZE_COLLECTIONS } }
      }
      break
    }
    case 'content_media': {
      if (!s.content?.title && !s.content?.media_url) {
        return {
          ...s,
          content: {
            media_type: 'image' as const,
            media_url: '',
            title: 'Lorem ipsum dolor',
            subtitle: 'Sit amet consectetur',
            body: 'Add a short description to support your headline and guide readers.',
            buttons: [{ id: 'mock-1', label: 'Button', url: '#' }],
          },
        }
      }
      break
    }
  }

  return s
})
</script>

<template>
  <div class="relative">
    <component :is="variant" :section="displaySection" />
  </div>
</template>
