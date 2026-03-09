<script setup lang="ts">
import { NodeViewWrapper } from '@tiptap/vue-3'
import { XMarkIcon } from '@heroicons/vue/24/outline'

defineProps<{
  node: { attrs: { src: string } }
  deleteNode: () => void
}>()
</script>

<template>
  <NodeViewWrapper>
    <div class="relative my-3 rounded-xl border border-gray-200 p-3 group flex items-center gap-3">
      <audio :src="node.attrs.src" controls class="flex-1 h-8" />
      <button
        type="button"
        class="p-1 rounded-lg text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        @click="deleteNode"
      >
        <XMarkIcon class="h-3.5 w-3.5" />
      </button>
    </div>
  </NodeViewWrapper>
</template>
