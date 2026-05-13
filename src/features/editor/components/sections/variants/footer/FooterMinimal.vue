<script setup lang="ts">
import { computed, ref } from 'vue'
import { useLandStore } from '@/features/lands/stores/land'
import type { Section } from '@/features/sections/types'

const props = defineProps<{ section: Section }>()
const c = computed(() => props.section.type === 'footer' ? props.section.content : null)

const landStore = useLandStore()
const projectName = computed(() => landStore.activeLand?.title ?? '')

const openModal = ref<'privacy' | 'terms' | null>(null)
</script>

<template>
  <div class="flex flex-col px-8 py-16 gap-12" style="background: var(--theme-surface)">

    <!-- Top row: project name + links -->
    <div class="flex items-center justify-between">
      <span class="text-sm font-semibold uppercase tracking-widest" style="color: var(--theme-main); opacity: 0.6">
        {{ projectName }}
      </span>
      <div v-if="c?.buttons?.length" class="flex items-center gap-6">
        <a
          v-for="btn in c.buttons"
          :key="btn.id"
          :href="btn.url || '#'"
          class="text-sm font-medium transition-opacity hover:opacity-60"
          style="color: var(--theme-main)"
        >
          {{ btn.label }}
        </a>
      </div>
    </div>

    <!-- Description -->
    <p v-if="c?.description" class="text-sm leading-relaxed max-w-[60ch]" style="color: var(--theme-main); opacity: 0.5">
      {{ c.description }}
    </p>

    <!-- Legal bar -->
    <div class="flex items-center justify-between border-t pt-6" style="border-color: var(--theme-main); opacity: 0.2" />
    <div class="flex items-center justify-between -mt-6">
      <div class="flex items-center gap-6">
        <button
          v-if="c?.privacy_policy"
          class="text-xs transition-opacity hover:opacity-60"
          style="color: var(--theme-main); opacity: 0.4"
          @click="openModal = 'privacy'"
        >
          Privacy Policy
        </button>
        <span v-else class="text-xs" style="color: var(--theme-main); opacity: 0.4">Privacy Policy</span>
        <button
          v-if="c?.terms_conditions"
          class="text-xs transition-opacity hover:opacity-60"
          style="color: var(--theme-main); opacity: 0.4"
          @click="openModal = 'terms'"
        >
          Terms & Conditions
        </button>
        <span v-else class="text-xs" style="color: var(--theme-main); opacity: 0.4">Terms & Conditions</span>
      </div>
      <a
        href="https://lands.app"
        target="_blank"
        class="text-xs transition-opacity hover:opacity-60"
        style="color: var(--theme-main); opacity: 0.4"
      >
        Made with Lands
      </a>
    </div>
  </div>

  <!-- Content modals -->
  <Teleport to="body">
    <div
      v-if="openModal"
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6"
      @click.self="openModal = null"
    >
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="openModal = null" />
      <div class="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden" style="max-height: 80vh">
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 class="text-sm font-semibold text-gray-900">
            {{ openModal === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions' }}
          </h2>
          <button class="text-gray-400 hover:text-gray-700 text-xs" @click="openModal = null">Close</button>
        </div>
        <div
          class="overflow-y-auto flex-1 px-6 py-5 prose prose-sm max-w-none"
          v-html="openModal === 'privacy' ? c?.privacy_policy : c?.terms_conditions"
        />
      </div>
    </div>
  </Teleport>
</template>
