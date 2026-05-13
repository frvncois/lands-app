<script setup lang="ts">
import { ref } from 'vue'
import { ChevronDownIcon } from '@heroicons/vue/24/outline'
import BaseButton from './BaseButton.vue'

defineProps<{
  label: string
  options: string[]
  modelValue?: string
}>()

defineEmits<{ 'update:modelValue': [value: string] }>()

const open = ref(false)
</script>

<template>
  <div class="flex items-center justify-between py-1.5">
    <span class="text-sm text-gray-700">{{ label }}</span>
    <div class="relative">
      <BaseButton size="sm" variant="outline" @click="open = !open">
        {{ modelValue ?? options[0] }}
        <ChevronDownIcon class="h-3.5 w-3.5 text-gray-400 transition-transform" :class="{ 'rotate-180': open }" />
      </BaseButton>
      <div v-if="open" class="absolute right-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden min-w-full">
        <BaseButton
          v-for="option in options"
          :key="option"
          size="sm"
          class="w-full !justify-start"
          :class="{ 'text-gray-900': option === (modelValue ?? options[0]), 'text-gray-500': option !== (modelValue ?? options[0]) }"
          @click="$emit('update:modelValue', option); open = false"
        >
          {{ option }}
        </BaseButton>
      </div>
      <div v-if="open" class="fixed inset-0 z-40" @click="open = false" />
    </div>
  </div>
</template>
