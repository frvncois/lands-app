<script setup lang="ts">
defineProps<{
  title: string
  url: string
  image?: string
  active?: boolean
  plan?: 'free' | 'paid'
}>()

defineEmits<{ click: [] }>()
</script>

<template>
  <button
    class="flex items-center gap-3 w-full px-2 py-2 text-sm border border-gray-200 rounded-xl transition-colors"
    :class="active ? 'bg-gray-100 text-gray-900 font-medium border-white' : 'text-gray-600 hover:bg-gray-50'"
    @click="$emit('click')"
  >
    <div class="rounded-full overflow-hidden shrink-0 h-8 w-8 text-xs bg-gray-900 flex items-center justify-center text-white font-medium">
      <img v-if="image" :src="image" :alt="title" class="h-full w-full object-cover" />
      <span v-else>{{ title.charAt(0).toUpperCase() }}</span>
    </div>
    <div class="text-left min-w-0 flex-1">
      <div class="truncate">{{ title }}</div>
      <div class="text-xs text-gray-400 truncate">{{ url }}</div>
    </div>
    <span
      v-if="plan"
      class="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full"
      :class="plan === 'paid' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'"
    >
      {{ plan === 'paid' ? 'Pro' : 'Free' }}
    </span>
  </button>
</template>
