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
    class="rounded border border-sidebar-border bg-card overflow-hidden"
    :style="{ marginLeft: `${depth * 6}px` }"
  >
    <!-- Compact Block Header -->
    <button
      class="w-full flex items-center gap-1.5 px-2 py-1.5 bg-secondary/20 hover:bg-secondary/40 transition-colors"
      @click="selectBlock"
    >
      <Icon :name="blockIcon" class="text-muted-foreground" :size="12" />
      <span class="text-[11px] font-medium text-foreground truncate flex-1 text-left">{{
        block.name
      }}</span>
      <span class="text-[9px] text-muted-foreground uppercase">{{
        blockLabel
      }}</span>
    </button>

    <!-- Compact Content Fields -->
    <div class="p-2 space-y-2">
      <div v-for="field in fields" :key="field.key">
        <!-- Inline label for compact fields -->
        <div v-if="field.type === 'text' || field.type === 'select'" class="flex items-center gap-2">
          <label class="text-[10px] text-muted-foreground w-12 shrink-0">{{
            field.label
          }}</label>
          <TextInput
            v-if="field.type === 'text'"
            :model-value="
              field.key === 'content' ? stripHtml(getSetting(field.key)) : getSetting(field.key)
            "
            size="sm"
            class="flex-1"
            @update:model-value="updateSetting(field.key, $event)"
          />
          <SelectInput
            v-else-if="field.type === 'select'"
            :model-value="getSetting(field.key)"
            :options="field.options || []"
            size="sm"
            class="flex-1"
            @update:model-value="updateSetting(field.key, $event)"
          />
        </div>

        <!-- Stacked for textarea and image -->
        <div v-else class="space-y-1">
          <label class="text-[10px] text-muted-foreground">{{ field.label }}</label>
          <textarea
            v-if="field.type === 'textarea'"
            :value="stripHtml(getSetting(field.key))"
            rows="2"
            class="w-full px-2 py-1.5 text-[11px] bg-secondary border border-sidebar-border rounded resize-none focus:outline-none focus:ring-1 focus:ring-primary"
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
        </div>
      </div>

      <!-- List Item Management (for containers with shared style children) -->
      <div
        v-if="isListContainer"
        class="pt-2 mt-2 border-t border-sidebar-border"
      >
        <div class="flex items-center justify-between">
          <span class="text-[10px] text-muted-foreground"
            >{{ listItems.length }} items</span
          >
          <Button variant="ghost" size="xs" class="h-5 text-[10px] px-1.5" @click="addListItem">
            + Add
          </Button>
        </div>

        <div v-if="listItems.length > 0" class="mt-1.5 space-y-0.5">
          <div
            v-for="(item, index) in listItems"
            :key="item.id"
            class="flex items-center justify-between px-1.5 py-1 bg-secondary/30 rounded text-[10px]"
          >
            <span class="text-muted-foreground">{{ index + 1 }}. {{ item.name }}</span>
            <button
              class="text-destructive/70 hover:text-destructive text-[9px]"
              @click="removeListItem(item.id)"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
