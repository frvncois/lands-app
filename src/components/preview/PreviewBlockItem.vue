<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useEditorStore } from '@/stores/editor'
import type { BlockItem } from '@/types/editor'
import { buildItemClasses, buildInlineStyles, getSelfAlignClass } from '@/lib/style-utils'
import ProjectUpload from '@/components/modal/ProjectUpload.vue'

const props = defineProps<{
  item: BlockItem
  blockId: string
}>()

const route = useRoute()

const editorStore = useEditorStore()

const isEditing = ref(false)
const editableRef = ref<HTMLElement | null>(null)
const showUploadModal = ref(false)

const projectId = computed(() => route.params.projectId as string)

const isSelected = computed(() =>
  editorStore.selectedBlockId === props.blockId &&
  editorStore.selectedItemId === props.item.id
)

const itemClasses = computed(() => buildItemClasses(props.item.styles))
const itemStyles = computed(() => buildInlineStyles(props.item.styles))
const alignClass = computed(() => getSelfAlignClass(props.item.styles.align))

// Get content based on item type
const content = computed(() => {
  const settings = props.item.settings as any
  return settings.content ?? settings.title ?? ''
})

// Default placeholder content
const placeholderContent: Record<string, string> = {
  heading: 'Enter your heading',
  subheading: 'Enter your subheading',
  text: 'Enter your text content here. Click to edit and add your own message.',
  button: 'Button',
}

const displayContent = computed(() => {
  return content.value || placeholderContent[props.item.type] || ''
})

function handleClick(event: MouseEvent) {
  event.stopPropagation()
  editorStore.selectBlock(props.blockId, props.item.id)
}

function handleDoubleClick() {
  if (['heading', 'subheading', 'text', 'button'].includes(props.item.type)) {
    isEditing.value = true
    nextTick(() => {
      if (editableRef.value) {
        editableRef.value.focus()
        // Select all text
        const range = document.createRange()
        range.selectNodeContents(editableRef.value)
        const selection = window.getSelection()
        selection?.removeAllRanges()
        selection?.addRange(range)
      }
    })
  }
}

function handleBlur() {
  isEditing.value = false
  if (editableRef.value) {
    const newContent = editableRef.value.innerText.trim()
    const settingsKey = props.item.type === 'button' ? 'title' : 'content'
    editorStore.updateBlockItemSettings(props.blockId, props.item.id, {
      [settingsKey]: newContent,
    })
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    editableRef.value?.blur()
  }
  if (event.key === 'Escape') {
    isEditing.value = false
  }
}

function handleImageUpload() {
  showUploadModal.value = true
}

function handleImageUploaded(url: string) {
  editorStore.updateBlockItemSettings(props.blockId, props.item.id, {
    src: url,
  })
}

function handleImageRemove(event: MouseEvent) {
  event.stopPropagation()
  editorStore.updateBlockItemSettings(props.blockId, props.item.id, {
    src: '',
  })
}
</script>

<template>
  <div
    class="relative group"
    :class="[alignClass]"
    @click="handleClick"
  >
    <!-- Selection outline -->
    <div
      v-if="isSelected"
      class="absolute -inset-1 border-2 border-primary rounded pointer-events-none z-10"
    />

    <!-- Heading -->
    <component
      v-if="item.type === 'heading'"
      :is="(item.settings as any).level || 'h2'"
      ref="editableRef"
      class="outline-none"
      :class="[itemClasses, isEditing ? '' : 'cursor-pointer hover:bg-accent/10']"
      :style="itemStyles"
      :contenteditable="isEditing"
      @dblclick="handleDoubleClick"
      @blur="handleBlur"
      @keydown="handleKeydown"
    >{{ displayContent }}</component>

    <!-- Subheading -->
    <p
      v-else-if="item.type === 'subheading'"
      ref="editableRef"
      class="outline-none"
      :class="[itemClasses, isEditing ? '' : 'cursor-pointer hover:bg-accent/10']"
      :style="itemStyles"
      :contenteditable="isEditing"
      @dblclick="handleDoubleClick"
      @blur="handleBlur"
      @keydown="handleKeydown"
    >{{ displayContent }}</p>

    <!-- Text -->
    <p
      v-else-if="item.type === 'text'"
      ref="editableRef"
      class="outline-none whitespace-pre-wrap"
      :class="[itemClasses, isEditing ? '' : 'cursor-pointer hover:bg-accent/10']"
      :style="itemStyles"
      :contenteditable="isEditing"
      @dblclick="handleDoubleClick"
      @blur="handleBlur"
      @keydown="handleKeydown"
    >{{ displayContent }}</p>

    <!-- Button -->
    <button
      v-else-if="item.type === 'button'"
      ref="editableRef"
      class="px-6 py-2 rounded-md outline-none"
      :class="[
        itemClasses,
        (item.settings as any).variant === 'primary' ? 'bg-primary text-primary-foreground' : '',
        (item.settings as any).variant === 'secondary' ? 'bg-secondary text-secondary-foreground' : '',
        (item.settings as any).variant === 'outline' ? 'border border-border text-foreground' : '',
        isEditing ? '' : 'cursor-pointer hover:opacity-90',
      ]"
      :style="itemStyles"
      :contenteditable="isEditing"
      @dblclick.prevent="handleDoubleClick"
      @blur="handleBlur"
      @keydown="handleKeydown"
    >{{ displayContent }}</button>

    <!-- Image -->
    <div
      v-else-if="item.type === 'image'"
      class="overflow-hidden relative"
      :class="[itemClasses]"
      :style="itemStyles"
    >
      <!-- Image with overlay controls -->
      <template v-if="(item.settings as any).src">
        <img
          :src="(item.settings as any).src"
          :alt="(item.settings as any).alt || ''"
          class="w-full h-full object-cover"
        />
        <!-- Hover overlay with actions -->
        <div
          class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity flex items-center justify-center gap-2"
        >
          <button
            type="button"
            class="w-10 h-10 bg-background/90 backdrop-blur-sm border border-border rounded-full flex items-center justify-center text-foreground hover:bg-background transition-colors pointer-events-auto"
            title="Replace image"
            @click.stop="handleImageUpload"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
          <button
            type="button"
            class="w-10 h-10 bg-destructive/90 backdrop-blur-sm border border-destructive rounded-full flex items-center justify-center text-destructive-foreground hover:bg-destructive transition-colors pointer-events-auto"
            title="Remove image"
            @click.stop="handleImageRemove"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </template>
      <!-- Empty state with upload prompt -->
      <div
        v-else
        class="w-full h-48 bg-secondary flex items-center justify-center cursor-pointer hover:bg-secondary/80 transition-colors"
        @click.stop="handleImageUpload"
      >
        <div class="text-center text-muted-foreground">
          <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p class="text-sm font-medium">Click to upload image</p>
          <p class="text-xs mt-1">or drag & drop</p>
        </div>
      </div>

      <!-- Upload Modal -->
      <ProjectUpload
        v-model:open="showUploadModal"
        :project-id="projectId"
        @uploaded="handleImageUploaded"
      />
    </div>

    <!-- Video -->
    <div
      v-else-if="item.type === 'video'"
      class="overflow-hidden"
      :class="[itemClasses]"
      :style="itemStyles"
    >
      <video
        v-if="(item.settings as any).src"
        :src="(item.settings as any).src"
        :poster="(item.settings as any).poster"
        :autoplay="(item.settings as any).autoplay"
        :loop="(item.settings as any).loop"
        :muted="(item.settings as any).muted"
        controls
        class="w-full h-full object-cover"
      />
      <div
        v-else
        class="w-full h-48 bg-secondary flex items-center justify-center"
      >
        <div class="text-center text-muted-foreground">
          <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-sm">Add video URL in inspector</p>
        </div>
      </div>
    </div>

    <!-- Accordion -->
    <div
      v-else-if="item.type === 'accordion'"
      class="w-full space-y-2"
      :class="[itemClasses]"
      :style="itemStyles"
    >
      <div
        v-for="accordionItem in (item.settings as any).items"
        :key="accordionItem.id"
        class="border border-border rounded-md"
      >
        <div class="px-4 py-3 font-medium">{{ accordionItem.title }}</div>
      </div>
    </div>

    <!-- Post -->
    <div
      v-else-if="item.type === 'post'"
      class="p-4 border border-border rounded-md"
      :class="[itemClasses]"
      :style="itemStyles"
    >
      <p class="text-sm text-muted-foreground">Post placeholder</p>
    </div>
  </div>
</template>
