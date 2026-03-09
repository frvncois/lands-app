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
    <div class="relative my-3 rounded-xl overflow-hidden border border-gray-200 group">
      <video :src="node.attrs.src" controls class="w-full block" />
      <button
        type="button"
        class="absolute top-2 right-2 p-1 rounded-lg bg-white/90 text-gray-500 hover:text-red-500 shadow opacity-0 group-hover:opacity-100 transition-opacity"
        @click="deleteNode"
      >
        <XMarkIcon class="h-3.5 w-3.5" />
      </button>
    </div>
  </NodeViewWrapper>
</template>
