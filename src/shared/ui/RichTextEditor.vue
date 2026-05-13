<script setup lang="ts">
import { watch } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { BoldIcon, ItalicIcon } from '@heroicons/vue/24/outline'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const editor = useEditor({
  content: props.modelValue,
  extensions: [StarterKit],
  editorProps: {
    attributes: {
      class: 'prose max-w-none text-sm focus:outline-none min-h-[160px] px-3 py-2',
    },
  },
  onUpdate({ editor }) {
    emit('update:modelValue', editor.getHTML())
  },
})

watch(() => props.modelValue, (val) => {
  if (editor.value && editor.value.getHTML() !== val) {
    editor.value.commands.setContent(val, false)
  }
})

const btnClass = (active: boolean) =>
  `p-1.5 rounded-lg transition-colors ${active ? 'bg-gray-200 text-gray-900' : 'text-gray-500 hover:bg-gray-200'}`
</script>

<template>
  <div class="border border-gray-200 rounded-xl overflow-hidden focus-within:border-gray-400 focus-within:ring-2 focus-within:ring-black/5">
    <!-- Toolbar -->
    <div class="flex items-center gap-0.5 p-1.5 border-b border-gray-100 bg-gray-50">
      <button type="button" :class="btnClass(!!editor?.isActive('bold'))" @click="editor?.chain().focus().toggleBold().run()">
        <BoldIcon class="h-3.5 w-3.5" />
      </button>
      <button type="button" :class="btnClass(!!editor?.isActive('italic'))" @click="editor?.chain().focus().toggleItalic().run()">
        <ItalicIcon class="h-3.5 w-3.5" />
      </button>
      <div class="w-px h-4 bg-gray-200 mx-1" />
      <button type="button" class="text-xs font-bold" :class="btnClass(!!editor?.isActive('heading', { level: 1 }))" @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()">H1</button>
      <button type="button" class="text-xs font-bold" :class="btnClass(!!editor?.isActive('heading', { level: 2 }))" @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()">H2</button>
      <button type="button" class="text-xs font-bold" :class="btnClass(!!editor?.isActive('heading', { level: 3 }))" @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()">H3</button>
      <button type="button" class="text-xs" :class="btnClass(!!editor?.isActive('paragraph'))" @click="editor?.chain().focus().setParagraph().run()">P</button>
    </div>

    <!-- Editor -->
    <EditorContent :editor="editor" />
  </div>
</template>
