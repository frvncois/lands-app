<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import BaseButton from '@/shared/ui/BaseButton.vue'
import ReleaseItemEditor from './ReleaseItemEditor.vue'
import ConcertItemEditor from './ConcertItemEditor.vue'
import VideoItemEditor from './VideoItemEditor.vue'
import StoreItemEditor from './StoreItemEditor.vue'
import type { CollectionItem } from '@/features/sections/types/collection'
import type { StoreItem } from '@/features/sections/types/store'

const props = defineProps<{
  type: 'releases' | 'concert' | 'videos' | 'store'
  item: CollectionItem | StoreItem
  sectionId: string
  collectionId?: string
  storeId?: string
}>()

const emit = defineEmits<{ close: [] }>()

const visible = ref(false)
onMounted(() => nextTick(() => { visible.value = true }))

function dismiss() {
  visible.value = false
  setTimeout(() => emit('close'), 220)
}

interface EditorRef { save: () => void }
const editorRef = ref<EditorRef | null>(null)

function handleSave() {
  editorRef.value?.save()
  dismiss()
}

const headerLabel = computed(() => {
  if (props.type === 'store') return 'Product'
  if (props.type === 'releases') return 'Release'
  if (props.type === 'concert') return 'Date'
  return 'Video'
})

const headerTitle = computed(() => props.item.title)
</script>

<template>
  <Teleport to="body">
    <Transition name="item-modal">
      <div v-if="visible" class="fixed inset-0 z-[70] flex items-center justify-center p-6">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="dismiss" />
        <div class="item-modal-panel relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl flex flex-col" style="max-height: 90vh">

          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
            <div>
              <p class="text-[10px] font-medium uppercase tracking-widest text-gray-400 mb-0.5">{{ headerLabel }}</p>
              <h2 class="text-sm font-semibold text-gray-900 truncate max-w-xs">{{ headerTitle || 'Untitled' }}</h2>
            </div>
            <div class="flex items-center gap-2">
              <BaseButton variant="outline" size="sm" @click="dismiss">Cancel</BaseButton>
              <BaseButton variant="solid" size="sm" @click="handleSave">Save</BaseButton>
            </div>
          </div>

          <!-- Body — sub-editor fills the remaining space -->
          <div class="flex flex-1 min-h-0 overflow-hidden">
            <ReleaseItemEditor
              v-if="type === 'releases'"
              ref="editorRef"
              :item="(item as CollectionItem)"
              :section-id="sectionId"
              :collection-id="collectionId!"
            />
            <ConcertItemEditor
              v-else-if="type === 'concert'"
              ref="editorRef"
              :item="(item as CollectionItem)"
              :section-id="sectionId"
              :collection-id="collectionId!"
            />
            <VideoItemEditor
              v-else-if="type === 'videos'"
              ref="editorRef"
              :item="(item as CollectionItem)"
              :section-id="sectionId"
              :collection-id="collectionId!"
            />
            <StoreItemEditor
              v-else-if="type === 'store'"
              ref="editorRef"
              :item="(item as StoreItem)"
              :section-id="sectionId"
              :store-id="storeId!"
            />
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.item-modal-enter-active,
.item-modal-leave-active {
  transition: opacity 200ms cubic-bezier(0.4, 0, 0.2, 1);
}
.item-modal-enter-active .item-modal-panel,
.item-modal-leave-active .item-modal-panel {
  transition: opacity 200ms cubic-bezier(0.4, 0, 0.2, 1),
              transform 200ms cubic-bezier(0.4, 0, 0.2, 1);
}
.item-modal-enter-from,
.item-modal-leave-to {
  opacity: 0;
}
.item-modal-enter-from .item-modal-panel,
.item-modal-leave-to .item-modal-panel {
  opacity: 0;
  transform: scale(0.96) translateY(8px);
}
</style>
