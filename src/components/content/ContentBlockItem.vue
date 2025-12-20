<script setup lang="ts">
import { computed } from 'vue'
import { useDesignerStore } from '@/stores/designer'
import type { SectionBlock, SectionBlockType } from '@/types/designer'
import { sectionBlockIcons, sectionBlockLabels } from '@/lib/designer-utils'
import { Icon, Button } from '@/components/ui'
import TextInput from '@/components/inspector/TextInput.vue'
import ImageInput from '@/components/inspector/ImageInput.vue'
import SelectInput from '@/components/inspector/SelectInput.vue'

const props = defineProps<{
  block: SectionBlock
  depth: number
  path: string[]
}>()

const designerStore = useDesignerStore()

// Field configuration per block type
interface FieldConfig {
  key: string
  label: string
  type: 'text' | 'textarea' | 'image' | 'select' | 'link'
  options?: { value: string; label: string }[]
}

const fieldConfigs: Partial<Record<SectionBlockType, FieldConfig[]>> = {
  heading: [
    { key: 'content', label: 'Text', type: 'text' },
    {
      key: 'level',
      label: 'Level',
      type: 'select',
      options: [
        { value: 'h1', label: 'H1' },
        { value: 'h2', label: 'H2' },
        { value: 'h3', label: 'H3' },
        { value: 'h4', label: 'H4' },
        { value: 'h5', label: 'H5' },
        { value: 'h6', label: 'H6' },
      ],
    },
  ],
  text: [{ key: 'content', label: 'Content', type: 'textarea' }],
  image: [
    { key: 'src', label: 'Image', type: 'image' },
    { key: 'alt', label: 'Alt Text', type: 'text' },
    { key: 'caption', label: 'Caption', type: 'text' },
    { key: 'linkUrl', label: 'Link URL', type: 'text' },
  ],
  video: [
    { key: 'src', label: 'Video URL', type: 'text' },
    { key: 'thumbnail', label: 'Thumbnail', type: 'image' },
  ],
  button: [
    { key: 'label', label: 'Label', type: 'text' },
    { key: 'url', label: 'URL', type: 'text' },
  ],
  icon: [{ key: 'icon', label: 'Icon Name', type: 'text' }],
}

const fields = computed(() => fieldConfigs[props.block.type] || [])

function updateSetting(key: string, value: string) {
  designerStore.updateBlockSettings(props.block.id, { [key]: value })
}

function getSetting(key: string): string {
  return ((props.block.settings as Record<string, unknown>)[key] as string) || ''
}

// Strip HTML tags for display in text input
function stripHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return doc.body.textContent || ''
}

// Check if this block has children with shared styles (list container)
const isListContainer = computed(() => {
  if (!props.block.children || props.block.children.length === 0) return false
  // Check if children have sharedStyleId (indicating list items)
  return props.block.children.some((child) => child.sharedStyleId)
})

const listItems = computed(() => {
  if (!isListContainer.value) return []
  return props.block.children || []
})

function addListItem() {
  designerStore.addListItem(props.block.id)
}

function removeListItem(itemId: string) {
  designerStore.deleteBlock(itemId)
}

// Navigate to block in designer
function selectBlock() {
  designerStore.selectBlock(props.block.id)
}

const blockIcon = computed(() => sectionBlockIcons[props.block.type])
const blockLabel = computed(() => sectionBlockLabels[props.block.type])
</script>

<template>
  <div
    class="rounded-lg border border-sidebar-border bg-card overflow-hidden"
    :style="{ marginLeft: `${depth * 8}px` }"
  >
    <!-- Block Header -->
    <button
      class="w-full flex items-center gap-2 px-3 py-2 border-b border-sidebar-border bg-secondary/30 hover:bg-secondary/50 transition-colors"
      @click="selectBlock"
    >
      <Icon :name="blockIcon" class="text-muted-foreground" :size="14" />
      <span class="text-xs font-medium text-foreground truncate">{{
        block.name
      }}</span>
      <span class="text-[10px] text-muted-foreground ml-auto">{{
        blockLabel
      }}</span>
    </button>

    <!-- Content Fields -->
    <div class="p-3 space-y-3">
      <div v-for="field in fields" :key="field.key" class="space-y-1">
        <label class="text-[11px] text-muted-foreground font-medium">{{
          field.label
        }}</label>

        <TextInput
          v-if="field.type === 'text'"
          :model-value="
            field.key === 'content' ? stripHtml(getSetting(field.key)) : getSetting(field.key)
          "
          size="sm"
          @update:model-value="updateSetting(field.key, $event)"
        />

        <textarea
          v-else-if="field.type === 'textarea'"
          :value="stripHtml(getSetting(field.key))"
          rows="3"
          class="w-full px-3 py-2 text-xs bg-secondary border border-sidebar-border rounded-md resize-none focus:outline-none focus:ring-1 focus:ring-primary"
          @input="
            updateSetting(
              field.key,
              ($event.target as HTMLTextAreaElement).value
            )
          "
        />

        <ImageInput
          v-else-if="field.type === 'image'"
          :model-value="getSetting(field.key)"
          @update:model-value="updateSetting(field.key, $event)"
        />

        <SelectInput
          v-else-if="field.type === 'select'"
          :model-value="getSetting(field.key)"
          :options="field.options || []"
          size="sm"
          @update:model-value="updateSetting(field.key, $event)"
        />
      </div>

      <!-- List Item Management (for containers with shared style children) -->
      <div
        v-if="isListContainer"
        class="pt-3 mt-3 border-t border-sidebar-border"
      >
        <div class="flex items-center justify-between mb-2">
          <span class="text-[11px] font-medium text-muted-foreground"
            >Items ({{ listItems.length }})</span
          >
          <Button variant="ghost" size="xs" @click="addListItem">
            + Add Item
          </Button>
        </div>

        <div class="space-y-1">
          <div
            v-for="(item, index) in listItems"
            :key="item.id"
            class="flex items-center justify-between px-2 py-1.5 bg-secondary/50 rounded text-xs"
          >
            <span class="text-muted-foreground">Item {{ index + 1 }}</span>
            <button
              class="text-destructive hover:underline text-[10px]"
              @click="removeListItem(item.id)"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
