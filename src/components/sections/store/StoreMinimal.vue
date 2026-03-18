<script setup lang="ts">
import { computed, ref } from 'vue'
import { sortByPosition } from '@/lib/utils/position'
import { useEditorStore } from '@/stores/editor'
import { useLandStore } from '@/stores/land'
import { supabase } from '@/lib/supabase'
import type { Section } from '@/types/section'
import type { Store, StoreItem } from '@/types/store'

const props = defineProps<{ section: Section }>()
const stores = computed<Store[]>(() => sortByPosition((props.section.content as any)?.stores ?? []))

function smartColumns(count: number): number {
  if (count <= 0) return 2
  if (count <= 4) return count
  const score = (cols: number) => count % cols === 0 ? cols : count % cols
  return [4, 3, 2].reduce((a, b) => score(a) >= score(b) ? a : b)
}

const gridClass = computed(() => {
  const count = stores.value.flatMap(s => s.items).length
  return `grid grid-cols-${smartColumns(count)} gap-8`
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
  <div v-for="store in stores" :key="store.id" class="flex flex-col mx-auto px-8 py-32 gap-16">
    <div class="flex flex-col gap-4">
      <h2 class="text-4xl font-semibold" style="color: var(--theme-main)">{{ store.title }}</h2>
      <p v-if="store.description" class="text-sm leading-relaxed max-w-[60ch]" style="color: var(--theme-main); opacity: 0.5">{{ store.description }}</p>
    </div>

    <p v-if="checkoutError" class="text-sm text-red-500">{{ checkoutError }}</p>

    <ul :class="gridClass">
      <li v-for="item in sortByPosition(store.items)" :key="item.id" class="flex flex-col gap-4">
        <div class="aspect-square overflow-hidden rounded-md" style="background: var(--theme-main)">
          <img v-if="item.image" :src="item.image" class="w-full h-full object-cover" />
        </div>
        <div class="flex flex-col gap-4">
          <div class="flex justify-between items-start">
            <h3 class="text-2xl font-semibold" style="color: var(--theme-main)">{{ item.title }}</h3>
            <p class="text-sm font-medium" style="color: var(--theme-main)">${{ item.price.toFixed(2) }}</p>
          </div>
          <p v-if="item.description" class="text-sm" style="color: var(--theme-main); opacity: 0.5">{{ item.description }}</p>
          <button
            v-if="item.price > 0"
            class="mt-2 py-2 text-sm font-medium rounded-lg transition-opacity disabled:opacity-50 text-gray-100"
            style="background: var(--theme-accent);"
            :disabled="loadingItemId === item.id"
            @click.stop="!isEditMode && buyItem(store, item)"
          >
            {{ loadingItemId === item.id ? 'Loading…' : 'Buy' }}
          </button>
        </div>
      </li>
    </ul>
  </div>
  <p v-if="stores.length === 0" class="text-sm text-gray-400 px-6 py-4">No store items yet</p>
</template>
