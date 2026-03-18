<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { Image } from '@tiptap/extension-image'
import {
  BoldIcon, ItalicIcon,
  PhotoIcon, FilmIcon, MusicalNoteIcon, PaperClipIcon, PlusIcon,
  TrashIcon, Bars3BottomLeftIcon, Bars3Icon, ArrowsPointingOutIcon,
} from '@heroicons/vue/24/outline'
import { VideoBlock } from './VideoBlock'
import { AudioBlock } from './AudioBlock'
import { FileBlock } from './FileBlock'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const wrapperRef = ref<HTMLDivElement | null>(null)
const imageInputRef = ref<HTMLInputElement | null>(null)
const audioInputRef = ref<HTMLInputElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const showInsertMenu = ref(false)
const showVideoInput = ref(false)
const videoUrl = ref('')

const showBubbleMenu = ref(false)
const showFloatingMenu = ref(false)
const bubbleMenuStyle = ref({ top: '0px', left: '0px' })
const floatingMenuStyle = ref({ top: '0px' })
const selectionType = ref<'text' | 'image' | 'video' | null>(null)

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
      class: 'prose prose-base max-w-none focus:outline-none p-10 min-h-[400px]',
    },
  },
  onUpdate({ editor }) {
    emit('update:modelValue', editor.getHTML())
    updateMenuState(editor)
  },
  onSelectionUpdate({ editor }) {
    updateMenuState(editor)
  },
  onFocus({ editor }) {
    updateMenuState(editor)
  },
  onBlur() {
    showBubbleMenu.value = false
    showInsertMenu.value = false
    showVideoInput.value = false
    // keep showFloatingMenu visible so (+) stays on empty lines after blur
  },
})

function updateMenuState(ed: any) {
  const wrapper = wrapperRef.value
  if (!wrapper) return

  const { state, view } = ed
  const { from, to, $from } = state.selection
  const wrapperRect = wrapper.getBoundingClientRect()

  const hasSelection = from !== to
  const isEmptyLine = !hasSelection && $from.parent.textContent === '' && $from.parent.type.name !== 'doc'

  if (hasSelection) {
    const nodeName = (state.selection as any).node?.type?.name ?? null
    if (nodeName === 'image') selectionType.value = 'image'
    else if (nodeName === 'videoBlock') selectionType.value = 'video'
    else selectionType.value = 'text'

    const startCoords = view.coordsAtPos(from)
    const endCoords = view.coordsAtPos(to)
    const midX = (startCoords.left + endCoords.left) / 2
    bubbleMenuStyle.value = {
      top: `${startCoords.top - 44}px`,
      left: `${midX}px`,
    }
  }

  if (isEmptyLine) {
    const coords = view.coordsAtPos(from)
    const lineCenter = coords.top + (coords.bottom - coords.top) / 2
    floatingMenuStyle.value = {
      top: `${lineCenter - wrapperRect.top - 12}px`,
    }
  }

  showBubbleMenu.value = hasSelection
  showFloatingMenu.value = isEmptyLine
}

onBeforeUnmount(() => editor.value?.destroy())

const isActive = (name: string, attrs?: Record<string, unknown>) =>
  editor.value?.isActive(name, attrs) ?? false

function onImageFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file || !editor.value) return
  const src = URL.createObjectURL(file)
  editor.value.chain().focus().setImage({ src }).run()
  ;(e.target as HTMLInputElement).value = ''
}

function onAudioFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file || !editor.value) return
  const src = URL.createObjectURL(file)
  editor.value.chain().focus().setAudioBlock({ src }).run()
  ;(e.target as HTMLInputElement).value = ''
}

function onFileFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file || !editor.value) return
  const src = URL.createObjectURL(file)
  editor.value.chain().focus().setFileBlock({ src, filename: file.name }).run()
  ;(e.target as HTMLInputElement).value = ''
}

function insertVideo() {
  if (!videoUrl.value.trim() || !editor.value) return
  editor.value.chain().focus().setVideoBlock({ src: videoUrl.value.trim() }).run()
  videoUrl.value = ''
  showVideoInput.value = false
}
</script>

<template>
  <div ref="wrapperRef" class="relative">
    <!-- Bubble menu — fixed to escape scroll containers, centered above selection -->
    <div
      v-show="showBubbleMenu"
      class="fixed z-[200] -translate-x-1/2 flex items-center gap-0.5 px-1.5 py-1 bg-gray-900 rounded-lg shadow-xl"
      :style="bubbleMenuStyle"
      @mousedown.prevent
    >
      <!-- Text selection -->
      <template v-if="selectionType === 'text'">
        <button type="button" class="px-1.5 py-1 rounded text-xs font-semibold transition-colors" :class="isActive('heading', { level: 1 }) ? 'text-white bg-white/20' : 'text-gray-300 hover:text-white'" @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()">H1</button>
        <button type="button" class="px-1.5 py-1 rounded text-xs font-semibold transition-colors" :class="isActive('heading', { level: 2 }) ? 'text-white bg-white/20' : 'text-gray-300 hover:text-white'" @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()">H2</button>
        <button type="button" class="px-1.5 py-1 rounded text-xs font-semibold transition-colors" :class="isActive('heading', { level: 3 }) ? 'text-white bg-white/20' : 'text-gray-300 hover:text-white'" @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()">H3</button>
        <div class="w-px h-3.5 bg-white/20 mx-0.5" />
        <button type="button" class="p-1 rounded transition-colors" :class="isActive('bold') ? 'text-white bg-white/20' : 'text-gray-300 hover:text-white'" @click="editor?.chain().focus().toggleBold().run()"><BoldIcon class="h-3.5 w-3.5" /></button>
        <button type="button" class="p-1 rounded transition-colors" :class="isActive('italic') ? 'text-white bg-white/20' : 'text-gray-300 hover:text-white'" @click="editor?.chain().focus().toggleItalic().run()"><ItalicIcon class="h-3.5 w-3.5" /></button>
      </template>

      <!-- Image selection -->
      <template v-else-if="selectionType === 'image'">
        <button type="button" class="p-1 rounded transition-colors text-gray-300 hover:text-white" title="Align left" @click="editor?.chain().focus().updateAttributes('image', { style: 'display:block;margin-right:auto' }).run()"><Bars3BottomLeftIcon class="h-3.5 w-3.5" /></button>
        <button type="button" class="p-1 rounded transition-colors text-gray-300 hover:text-white" title="Align center" @click="editor?.chain().focus().updateAttributes('image', { style: 'display:block;margin:0 auto' }).run()"><Bars3Icon class="h-3.5 w-3.5" /></button>
        <button type="button" class="p-1 rounded transition-colors text-gray-300 hover:text-white" title="Full width" @click="editor?.chain().focus().updateAttributes('image', { style: 'display:block;width:100%' }).run()"><ArrowsPointingOutIcon class="h-3.5 w-3.5" /></button>
        <div class="w-px h-3.5 bg-white/20 mx-0.5" />
        <button type="button" class="p-1 rounded transition-colors text-red-400 hover:text-red-300" title="Delete" @click="editor?.chain().focus().deleteSelection().run()"><TrashIcon class="h-3.5 w-3.5" /></button>
      </template>

      <!-- Video selection -->
      <template v-else-if="selectionType === 'video'">
        <button type="button" class="p-1 rounded transition-colors text-red-400 hover:text-red-300" title="Delete" @click="editor?.chain().focus().deleteSelection().run()"><TrashIcon class="h-3.5 w-3.5" /></button>
      </template>
    </div>

    <!-- Editor -->
    <EditorContent :editor="editor" />

    <!-- Floating insert menu — always visible at cursor line -->
    <!-- @mousedown.prevent keeps editor focused when interacting with menu -->
    <div
      v-show="showFloatingMenu"
      class="absolute left-1 z-40"
      :style="floatingMenuStyle"
      @mousedown.prevent
    >
      <div v-if="!showVideoInput" class="flex items-center h-7 bg-white border border-gray-200 rounded-full shadow-sm px-1 overflow-hidden" style="transition: width 200ms cubic-bezier(0.4,0,0.2,1)">
        <button
          type="button"
          class="flex items-center justify-center h-5 w-5 shrink-0 rounded-full text-gray-400 hover:text-gray-700 transition-colors"
          @click="showInsertMenu = !showInsertMenu"
        >
          <PlusIcon class="h-3.5 w-3.5 transition-transform duration-200" :class="showInsertMenu ? 'rotate-45' : 'rotate-0'" />
        </button>
        <div
          class="flex items-center gap-0.5 overflow-hidden transition-all duration-200"
          :class="showInsertMenu ? 'max-w-[120px] opacity-100 ml-0.5' : 'max-w-0 opacity-0'"
        >
          <div class="w-px h-3.5 bg-gray-200 shrink-0" />
          <button type="button" class="p-1 shrink-0 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors" title="Image"
            @click="imageInputRef?.click(); showInsertMenu = false">
            <PhotoIcon class="h-4 w-4" />
          </button>
          <button type="button" class="p-1 shrink-0 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors" title="Video"
            @click="showVideoInput = true; showInsertMenu = false">
            <FilmIcon class="h-4 w-4" />
          </button>
          <button type="button" class="p-1 shrink-0 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors" title="Audio"
            @click="audioInputRef?.click(); showInsertMenu = false">
            <MusicalNoteIcon class="h-4 w-4" />
          </button>
          <button type="button" class="p-1 shrink-0 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors" title="File"
            @click="fileInputRef?.click(); showInsertMenu = false">
            <PaperClipIcon class="h-4 w-4" />
          </button>
        </div>
      </div>
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

    <!-- Hidden file inputs -->
    <input ref="imageInputRef" type="file" accept="image/*" class="hidden" @change="onImageFile" />
    <input ref="audioInputRef" type="file" accept="audio/*" class="hidden" @change="onAudioFile" />
    <input ref="fileInputRef" type="file" class="hidden" @change="onFileFile" />
  </div>
</template>

<style scoped>
:deep(.ProseMirror p:has(> br:only-child)::before) {
  content: 'Add your content here';
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
