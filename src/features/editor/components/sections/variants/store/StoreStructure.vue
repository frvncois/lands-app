<script setup lang="ts">
import { computed, ref } from 'vue'
import { sortByPosition } from '@/shared/lib/position'
import { useEditorStore } from '@/features/editor/stores/editor'
import { useLandStore } from '@/features/lands/stores/land'
import { supabase } from '@/shared/lib/supabase'
import type { Section } from '@/features/sections/types'
import type { Store, StoreItem } from '@/features/sections/types/store'

const props = defineProps<{ section: Section }>()
const stores = computed<Store[]>(() => sortByPosition((props.section.content as any)?.stores ?? []))
const variant = computed(() => props.section.style_variant)
const gridClass = computed(() => {
  if (variant.value === 'list') return 'flex flex-col divide-y'
  return 'grid grid-cols-3 gap-8'
})

const editorStore = useEditorStore()
const landStore = useLandStore()
const isEditMode = computed(() => editorStore.isEditMode)

const loadingItemId = ref<string | null>(null)
const checkoutError = ref<string | null>(null)

async function buyItem(store: Store, item: StoreItem) {
  const landId = landStore.activeLand?.id
  if (!landId) return

  loadingItemId.value = item.id
  checkoutError.value = null

  try {
    const { data, error } = await supabase.functions.invoke('stripe-checkout', {
      body: {
        landId,
        sectionId: props.section.id,
        storeId: store.id,
        itemId: item.id,
        origin: window.location.origin,
      },
    })

    if (error || !data?.url) {
      checkoutError.value = error?.message ?? 'Could not start checkout'
      return
    }

    window.location.href = data.url
  } finally {
    loadingItemId.value = null
  }
}
</script>

<template>
  <div v-for="store in stores" :key="store.id" class="max-w-5xl mx-auto py-8 space-y-8">
    <h2 class="text-4xl font-medium" style="color: var(--theme-main)">{{ store.title }}</h2>

    <p v-if="checkoutError" class="text-sm text-red-500">{{ checkoutError }}</p>

    <!-- List layout -->
    <ul v-if="variant === 'list'" :class="gridClass">
      <li v-for="item in sortByPosition(store.items)" :key="item.id" class="flex gap-4 py-3 items-center">
        <div class="h-14 w-20 shrink-0 overflow-hidden" style="background: var(--theme-main); opacity: 0.15">
          <img v-if="item.image" :src="item.image" class="w-full h-full object-cover" style="opacity: 100%" />
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="text-base font-medium" style="color: var(--theme-main)">{{ item.title }}</h3>
          <p class="text-sm font-semibold mt-0.5" style="color: var(--theme-main)">${{ item.price.toFixed(2) }}</p>
        </div>
        <button
          v-if="!isEditMode && item.price > 0"
          class="shrink-0 px-4 py-2 text-sm font-medium transition-opacity disabled:opacity-50"
          style="color: var(--theme-main); border: 1.5px solid var(--theme-main)"
          :disabled="loadingItemId === item.id"
          @click.stop="buyItem(store, item)"
        >
          {{ loadingItemId === item.id ? 'Loading…' : 'Buy' }}
        </button>
      </li>
    </ul>

    <!-- Grid layout (default) -->
    <ul v-else :class="gridClass">
      <li v-for="item in sortByPosition(store.items)" :key="item.id" class="flex flex-col gap-2 pb-4">
        <div class="aspect-square overflow-hidden rounded-xl" style="background: var(--theme-accent)">
          <img v-if="item.image" :src="item.image" class="w-full h-full object-cover" />
        </div>
        <div>
          <h3 class="text-2xl font-medium" style="color: var(--theme-main)">{{ item.title }}</h3>
          <p class="text-sm mt-0.5" style="color: var(--theme-main); opacity: 0.5">${{ item.price.toFixed(2) }}</p>
          <button
            v-if="!isEditMode && item.price > 0"
            class="mt-3 px-4 py-2 text-sm font-medium transition-opacity disabled:opacity-50"
            style="color: var(--theme-main); border: 1.5px solid var(--theme-main)"
            :disabled="loadingItemId === item.id"
            @click.stop="buyItem(store, item)"
          >
            {{ loadingItemId === item.id ? 'Loading…' : 'Buy' }}
          </button>
        </div>
      </li>
    </ul>
  </div>
  <p v-if="stores.length === 0" class="text-sm text-gray-400 px-6 py-4">No store items yet</p>
</template>
