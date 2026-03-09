<script setup lang="ts">
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { sectionPrimitives } from '@/sections/index'

defineEmits<{ close: [], select: [id: string] }>()
</script>

<template>
  <div class="fixed top-20 right-[21rem] w-72 z-50 bg-white shadow-xl rounded-2xl">
    <div class="flex items-center justify-between p-4 border-b border-gray-200">
      <h2 class="text-sm font-semibold text-gray-900">Add section</h2>
      <button @click="$emit('close')">
        <XMarkIcon class="h-4 w-4 text-gray-400 hover:text-gray-600" />
      </button>
    </div>
    <div class="grid grid-cols-2 gap-2 p-4">
      <button
        v-for="section in sectionPrimitives"
        :key="section.id"
        class="flex flex-col items-center justify-center gap-1.5 p-4 rounded-xl border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-colors"
        @click="$emit('select', section.id); $emit('close')"
      >
        <span class="text-sm font-medium text-gray-900">{{ section.label }}</span>
      </button>
    </div>
  </div>
</template>
