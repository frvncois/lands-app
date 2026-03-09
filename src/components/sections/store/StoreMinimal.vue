<script setup lang="ts">
import { computed } from 'vue'
import { getMockStores } from '@/lib/mock/provider'
import { sortByPosition } from '@/lib/utils/position'
import type { Section } from '@/types/section'

const props = defineProps<{ section: Section }>()
const stores = computed(() => sortByPosition(getMockStores(props.section.id)))
</script>

<template>
  <div v-for="store in stores" :key="store.id" class="max-w-5xl mx-auto py-8 space-y-8">
    <h2 class="text-4xl font-semibold" style="color: var(--theme-main)">{{ store.title }}</h2>
    <ul class="grid grid-cols-3 gap-8">
      <li
        v-for="item in sortByPosition(store.items)"
        :key="item.id"
        class="flex flex-col gap-3"
      >
        <div class="aspect-square overflow-hidden" style="background: var(--theme-surface)">
          <img v-if="item.image" :src="item.image" class="w-full h-full object-cover" />
        </div>
        <div class="flex flex-col gap-1">
          <h3 class="text-base font-medium" style="color: var(--theme-main)">{{ item.title }}</h3>
          <p v-if="item.description" class="text-sm" style="color: var(--theme-main); opacity: 0.5">{{ item.description }}</p>
          <p class="text-sm font-semibold mt-1" style="color: var(--theme-main)">${{ item.price.toFixed(2) }}</p>
        </div>
      </li>
    </ul>
  </div>
  <p v-if="stores.length === 0" class="text-sm text-gray-400 px-6 py-4">No store items yet</p>
</template>
