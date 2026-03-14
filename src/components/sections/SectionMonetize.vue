<script setup lang="ts">
import { computed } from 'vue'
import { useEditorStore } from '@/stores/editor'
import { MOCK_MONETIZE_COLLECTIONS } from '@/lib/primitives/mockSectionContent'
import { sortByPosition } from '@/lib/utils/position'
import type { Section } from '@/types/section'
import type { Collection } from '@/types/collection'

const props = defineProps<{ section: Section }>()
const editorStore = useEditorStore()
const isEditMode = computed(() => editorStore.isEditMode)

const isMock = computed(() => ((props.section.content as any)?.collections ?? []).length === 0)

const collections = computed<Collection[]>(() =>
  isMock.value
    ? MOCK_MONETIZE_COLLECTIONS
    : (props.section.content as any)?.collections ?? []
)
</script>

<template>
  <div class="px-6 py-10">
    <div v-for="col in collections" :key="col.id" class="max-w-sm mx-auto flex flex-col gap-6">
      <!-- Price card -->
      <div class="rounded-2xl border-2 p-6 flex flex-col gap-4 text-center" style="border-color: var(--theme-accent)">
        <div class="flex flex-col gap-1">
          <h2 class="text-xl font-bold" style="color: var(--theme-main)">{{ col.title || '[ Collection Name ]' }}</h2>
          <p v-if="col.description" class="text-sm" style="color: var(--theme-main); opacity: 0.6">{{ col.description }}</p>
        </div>
        <div class="flex items-baseline justify-center gap-1">
          <span class="text-4xl font-black" style="color: var(--theme-main)">${{ col.price ?? 0 }}</span>
          <span class="text-sm" style="color: var(--theme-main); opacity: 0.5">/ month</span>
        </div>
        <button
          v-if="!isEditMode"
          class="w-full py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-80"
          style="background: var(--theme-accent); color: var(--theme-surface)"
        >
          Buy access
        </button>
        <div
          v-else
          class="w-full py-3 rounded-xl font-semibold text-sm opacity-40 cursor-default"
          style="background: var(--theme-accent); color: var(--theme-surface)"
        >
          Buy access
        </div>
      </div>

      <!-- Items preview -->
      <div v-if="sortByPosition(col.items).length > 0" class="flex flex-col gap-3">
        <div
          v-for="item in sortByPosition(col.items)"
          :key="item.id"
          class="flex items-start gap-4 p-4 rounded-xl border border-gray-200"
        >
          <img v-if="item.media_url" :src="item.media_url" class="h-12 w-12 rounded-lg object-cover shrink-0" />
          <div class="flex flex-col gap-0.5 min-w-0">
            <p class="text-sm font-medium" style="color: var(--theme-main)">{{ item.title }}</p>
            <p v-if="item.description" class="text-xs" style="color: var(--theme-main); opacity: 0.6">{{ item.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
