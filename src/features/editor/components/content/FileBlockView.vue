<script setup lang="ts">
import { NodeViewWrapper } from '@tiptap/vue-3'
import { DocumentIcon, XMarkIcon } from '@heroicons/vue/24/outline'

defineProps<{
  node: { attrs: { src: string; filename: string } }
  deleteNode: () => void
}>()
</script>

<template>
  <NodeViewWrapper>
    <div class="relative my-3 rounded-xl border border-gray-200 group flex items-center gap-3 px-4 py-3">
      <DocumentIcon class="h-5 w-5 text-gray-400 shrink-0" />
      <a :href="node.attrs.src" :download="node.attrs.filename" class="flex-1 text-sm text-gray-700 hover:text-gray-900 truncate">
        {{ node.attrs.filename }}
      </a>
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
