<script setup lang="ts">
const colors = [
  '#000000', '#374151', '#6B7280', '#D1D5DB', '#FFFFFF',
  '#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6',
  '#8B5CF6', '#EC4899', '#14B8A6', '#F59E0B', '#6366F1',
]

defineEmits<{ select: [color: string] }>()
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-xl shadow-xl p-3 w-44">
    <div class="grid grid-cols-5 gap-1.5">
      <button
        v-for="color in colors"
        :key="color"
        class="h-6 w-6 rounded-md border border-black/10 hover:scale-110 transition-transform"
        :style="{ backgroundColor: color }"
        @click="$emit('select', color)"
      />
    </div>
  </div>
</template>
