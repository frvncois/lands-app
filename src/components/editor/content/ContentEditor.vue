<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import { BubbleMenuPlugin } from '@tiptap/extension-bubble-menu'
import { FloatingMenuPlugin } from '@tiptap/extension-floating-menu'
import StarterKit from '@tiptap/starter-kit'
import { Image } from '@tiptap/extension-image'
import {
  BoldIcon, ItalicIcon,
  PhotoIcon, FilmIcon, MusicalNoteIcon, PaperClipIcon, PlusIcon,
} from '@heroicons/vue/24/outline'
import { VideoBlock } from './VideoBlock'
import { AudioBlock } from './AudioBlock'
import { FileBlock } from './FileBlock'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

// ─── Refs for menus and inputs ───
const bubbleMenuEl = ref<HTMLElement | null>(null)
const floatingMenuEl = ref<HTMLElement | null>(null)
const imageInputRef = ref<HTMLInputElement | null>(null)
const audioInputRef = ref<HTMLInputElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const showVideoInput = ref(false)
const videoUrl = ref('')
const showFloatingMenu = ref(false)

// ─── Editor ───
const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Image.configure({ inline: false }),
    VideoBlock,
    AudioBlock,
    FileBlock,
  ],
  editorProps: {
    attributes: {
      class: 'prose prose-base max-w-none focus:outline-none px-8 py-6 min-h-[400px]',
    },
  },
  onUpdate({ editor }) {
    emit('update:modelValue', editor.getHTML())
  },
  onCreate({ editor }) {
    // Bubble menu — appears on text selection
    if (bubbleMenuEl.value) {
      const plugin = BubbleMenuPlugin({
        editor,
        element: bubbleMenuEl.value,
        pluginKey: 'bubbleMenu',
        tippyOptions: { duration: 100, placement: 'top' },
        shouldShow: ({ state }) => {
          const { from, to } = state.selection
          return from !== to
        },
      })
      editor.registerPlugin(plugin)
    }

    // Floating menu — appears on empty line
    if (floatingMenuEl.value) {
      const plugin = FloatingMenuPlugin({
        editor,
        element: floatingMenuEl.value,
        pluginKey: 'floatingMenu',
        tippyOptions: { duration: 100, placement: 'left' },
        shouldShow: ({ state }) => {
          const { $from } = state.selection
          const isEmptyBlock = $from.parent.textContent === '' && $from.parent.type.name !== 'doc'
          showFloatingMenu.value = isEmptyBlock
          return isEmptyBlock
        },
      })
      editor.registerPlugin(plugin)
    }
  },
})

onBeforeUnmount(() => editor.value?.destroy())

// ─── Inline formatting helpers ───
const isActive = (name: string, attrs?: Record<string, unknown>) =>
  editor.value?.isActive(name, attrs) ?? false

// ─── Media inserts ───
function onImageFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file || !editor.value) return
  const src = URL.createObjectURL(file)
  editor.value.chain().focus().setImage({ src }).run()
  ;(e.target as HTMLInputElement).value = ''
  showFloatingMenu.value = false
}

function onAudioFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file || !editor.value) return
  const src = URL.createObjectURL(file)
  editor.value.chain().focus().setAudioBlock({ src }).run()
  ;(e.target as HTMLInputElement).value = ''
  showFloatingMenu.value = false
}

function onFileFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file || !editor.value) return
  const src = URL.createObjectURL(file)
  editor.value.chain().focus().setFileBlock({ src, filename: file.name }).run()
  ;(e.target as HTMLInputElement).value = ''
  showFloatingMenu.value = false
}

function insertVideo() {
  if (!videoUrl.value.trim() || !editor.value) return
  editor.value.chain().focus().setVideoBlock({ src: videoUrl.value.trim() }).run()
  videoUrl.value = ''
  showVideoInput.value = false
  showFloatingMenu.value = false
}
</script>

<template>
  <!-- Bubble menu — appears on text selection -->
  <div ref="bubbleMenuEl" class="flex items-center gap-0.5 px-1.5 py-1 bg-gray-900 rounded-lg shadow-xl">
    <button
      type="button"
      class="px-1.5 py-1 rounded text-xs font-semibold transition-colors"
      :class="isActive('heading', { level: 1 }) ? 'text-white bg-white/20' : 'text-gray-300 hover:text-white'"
      @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()"
    >H1</button>
    <button
      type="button"
      class="px-1.5 py-1 rounded text-xs font-semibold transition-colors"
      :class="isActive('heading', { level: 2 }) ? 'text-white bg-white/20' : 'text-gray-300 hover:text-white'"
      @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
    >H2</button>
    <button
      type="button"
      class="px-1.5 py-1 rounded text-xs font-semibold transition-colors"
      :class="isActive('heading', { level: 3 }) ? 'text-white bg-white/20' : 'text-gray-300 hover:text-white'"
      @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()"
    >H3</button>
    <div class="w-px h-3.5 bg-white/20 mx-0.5" />
    <button
      type="button"
      class="p-1 rounded transition-colors"
      :class="isActive('bold') ? 'text-white bg-white/20' : 'text-gray-300 hover:text-white'"
      @click="editor?.chain().focus().toggleBold().run()"
    ><BoldIcon class="h-3.5 w-3.5" /></button>
    <button
      type="button"
      class="p-1 rounded transition-colors"
      :class="isActive('italic') ? 'text-white bg-white/20' : 'text-gray-300 hover:text-white'"
      @click="editor?.chain().focus().toggleItalic().run()"
    ><ItalicIcon class="h-3.5 w-3.5" /></button>
  </div>

  <!-- Floating menu — appears on empty line -->
  <div ref="floatingMenuEl" class="-ml-10">
    <div v-if="!showVideoInput" class="relative group">
      <button
        type="button"
        class="flex items-center justify-center h-6 w-6 rounded-full border border-gray-300 text-gray-400 hover:border-gray-500 hover:text-gray-600 transition-colors bg-white"
        title="Insert block"
      >
        <PlusIcon class="h-3.5 w-3.5" />
      </button>
      <!-- Popover on hover -->
      <div class="absolute left-8 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1 px-2 py-1.5 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
        <button type="button" class="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors" title="Image" @click="imageInputRef?.click()">
          <PhotoIcon class="h-4 w-4" />
        </button>
        <button type="button" class="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors" title="Video" @click="showVideoInput = true">
          <FilmIcon class="h-4 w-4" />
        </button>
        <button type="button" class="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors" title="Audio" @click="audioInputRef?.click()">
          <MusicalNoteIcon class="h-4 w-4" />
        </button>
        <button type="button" class="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors" title="File" @click="fileInputRef?.click()">
          <PaperClipIcon class="h-4 w-4" />
        </button>
      </div>
    </div>
    <!-- Video URL inline input -->
    <div v-else class="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl shadow-lg px-2 py-1.5">
      <input
        v-model="videoUrl"
        type="url"
        placeholder="Paste video URL…"
        class="text-xs w-48 focus:outline-none text-gray-700 placeholder-gray-400"
        autofocus
        @keydown.enter.prevent="insertVideo"
        @keydown.escape="showVideoInput = false; videoUrl = ''"
      />
      <button type="button" class="text-xs font-medium px-2 py-0.5 rounded-lg bg-gray-900 text-white hover:bg-gray-700 transition-colors shrink-0" @click="insertVideo">Insert</button>
      <button type="button" class="text-xs text-gray-400 hover:text-gray-700 shrink-0" @click="showVideoInput = false; videoUrl = ''">✕</button>
    </div>
  </div>

  <!-- Editor -->
  <EditorContent :editor="editor" />

  <!-- Hidden file inputs -->
  <input ref="imageInputRef" type="file" accept="image/*" class="hidden" @change="onImageFile" />
  <input ref="audioInputRef" type="file" accept="audio/*" class="hidden" @change="onAudioFile" />
  <input ref="fileInputRef" type="file" class="hidden" @change="onFileFile" />
</template>

<style scoped>
:deep(.ProseMirror p.is-editor-empty:first-child::before) {
  content: 'Start writing…';
  color: #9ca3af;
  pointer-events: none;
  height: 0;
  float: left;
}

:deep(.ProseMirror) {
  caret-color: #111;
}

:deep(.ProseMirror h1) {
  font-size: 2em;
  font-weight: 700;
  line-height: 1.2;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}

:deep(.ProseMirror h2) {
  font-size: 1.4em;
  font-weight: 600;
  margin-top: 1.25rem;
  margin-bottom: 0.4rem;
}

:deep(.ProseMirror h3) {
  font-size: 1.15em;
  font-weight: 600;
  margin-top: 1rem;
  margin-bottom: 0.3rem;
}

:deep(.ProseMirror p) {
  line-height: 1.75;
  margin-bottom: 0.5rem;
}
</style>
