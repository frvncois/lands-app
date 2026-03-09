<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { Image } from '@tiptap/extension-image'
import {
  BoldIcon, ItalicIcon,
  ListBulletIcon, QueueListIcon,
  MinusIcon,
  PhotoIcon, FilmIcon, MusicalNoteIcon, PaperClipIcon,
} from '@heroicons/vue/24/outline'
import { VideoBlock } from './VideoBlock'
import { AudioBlock } from './AudioBlock'
import { FileBlock } from './FileBlock'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

// ─── Insert state ───
const videoUrl = ref('')
const showVideoInput = ref(false)
const imageInputRef = ref<HTMLInputElement | null>(null)
const audioInputRef = ref<HTMLInputElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

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
      class: 'prose max-w-none text-sm focus:outline-none min-h-[360px] px-4 py-3',
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

onBeforeUnmount(() => editor.value?.destroy())

// ─── Toolbar helpers ───
const btnClass = (active: boolean) =>
  `p-1.5 rounded-lg transition-colors text-xs font-medium ${active ? 'bg-gray-200 text-gray-900' : 'text-gray-500 hover:bg-gray-100'}`

// ─── Image insert ───
function onImageFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file || !editor.value) return
  const src = URL.createObjectURL(file)
  editor.value.chain().focus().setImage({ src }).run()
  ;(e.target as HTMLInputElement).value = ''
}

// ─── Video insert ───
function insertVideo() {
  if (!videoUrl.value.trim() || !editor.value) return
  editor.value.chain().focus().setVideoBlock({ src: videoUrl.value.trim() }).run()
  videoUrl.value = ''
  showVideoInput.value = false
}

// ─── Audio insert ───
function onAudioFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file || !editor.value) return
  const src = URL.createObjectURL(file)
  editor.value.chain().focus().setAudioBlock({ src }).run()
  ;(e.target as HTMLInputElement).value = ''
}

// ─── File insert ───
function onFileFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file || !editor.value) return
  const src = URL.createObjectURL(file)
  editor.value.chain().focus().setFileBlock({ src, filename: file.name }).run()
  ;(e.target as HTMLInputElement).value = ''
}
</script>

<template>
  <div class="border border-gray-200 rounded-xl overflow-hidden focus-within:border-gray-400 focus-within:ring-2 focus-within:ring-black/5">

    <!-- Toolbar -->
    <div class="flex flex-wrap items-center gap-0.5 p-1.5 border-b border-gray-100 bg-gray-50">

      <!-- Text / Headings -->
      <button type="button" :class="btnClass(!!editor?.isActive('paragraph'))" @click="editor?.chain().focus().setParagraph().run()">T</button>
      <button type="button" :class="btnClass(!!editor?.isActive('heading', { level: 1 }))" @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()">H1</button>
      <button type="button" :class="btnClass(!!editor?.isActive('heading', { level: 2 }))" @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()">H2</button>
      <button type="button" :class="btnClass(!!editor?.isActive('heading', { level: 3 }))" @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()">H3</button>

      <div class="w-px h-4 bg-gray-200 mx-0.5" />

      <!-- Formatting -->
      <button type="button" :class="btnClass(!!editor?.isActive('bold'))" @click="editor?.chain().focus().toggleBold().run()">
        <BoldIcon class="h-3.5 w-3.5" />
      </button>
      <button type="button" :class="btnClass(!!editor?.isActive('italic'))" @click="editor?.chain().focus().toggleItalic().run()">
        <ItalicIcon class="h-3.5 w-3.5" />
      </button>

      <div class="w-px h-4 bg-gray-200 mx-0.5" />

      <!-- Lists -->
      <button type="button" :class="btnClass(!!editor?.isActive('bulletList'))" @click="editor?.chain().focus().toggleBulletList().run()">
        <ListBulletIcon class="h-3.5 w-3.5" />
      </button>
      <button type="button" :class="btnClass(!!editor?.isActive('orderedList'))" @click="editor?.chain().focus().toggleOrderedList().run()">
        <QueueListIcon class="h-3.5 w-3.5" />
      </button>

      <div class="w-px h-4 bg-gray-200 mx-0.5" />

      <!-- Divider -->
      <button type="button" :class="btnClass(false)" @click="editor?.chain().focus().setHorizontalRule().run()">
        <MinusIcon class="h-3.5 w-3.5" />
      </button>

      <div class="w-px h-4 bg-gray-200 mx-0.5" />

      <!-- Media -->
      <button type="button" :class="btnClass(false)" title="Image" @click="imageInputRef?.click()">
        <PhotoIcon class="h-3.5 w-3.5" />
      </button>
      <button type="button" :class="btnClass(showVideoInput)" title="Video" @click="showVideoInput = !showVideoInput; videoUrl = ''">
        <FilmIcon class="h-3.5 w-3.5" />
      </button>
      <button type="button" :class="btnClass(false)" title="Audio" @click="audioInputRef?.click()">
        <MusicalNoteIcon class="h-3.5 w-3.5" />
      </button>
      <button type="button" :class="btnClass(false)" title="File" @click="fileInputRef?.click()">
        <PaperClipIcon class="h-3.5 w-3.5" />
      </button>
    </div>

    <!-- Video URL input bar -->
    <Transition name="modal-fade">
      <div v-if="showVideoInput" class="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-gray-50">
        <input
          v-model="videoUrl"
          type="url"
          placeholder="Paste video URL..."
          class="flex-1 text-xs bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-gray-400"
          @keydown.enter.prevent="insertVideo"
          @keydown.escape="showVideoInput = false"
        />
        <button
          type="button"
          class="text-xs font-medium px-3 py-1.5 rounded-lg bg-gray-900 text-white hover:bg-gray-700 transition-colors"
          @click="insertVideo"
        >
          Insert
        </button>
        <button
          type="button"
          class="text-xs text-gray-400 hover:text-gray-700"
          @click="showVideoInput = false"
        >
          Cancel
        </button>
      </div>
    </Transition>

    <!-- Editor area -->
    <EditorContent :editor="editor" />

    <!-- Hidden file inputs -->
    <input ref="imageInputRef" type="file" accept="image/*" class="hidden" @change="onImageFile" />
    <input ref="audioInputRef" type="file" accept="audio/*" class="hidden" @change="onAudioFile" />
    <input ref="fileInputRef" type="file" class="hidden" @change="onFileFile" />
  </div>
</template>
