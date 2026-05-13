<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'
import BaseButton from '@/shared/ui/BaseButton.vue'
import type { Section } from '@/features/sections/types'
import { useSectionSnapshot } from '@/features/editor/composables/useSectionSnapshot'
import { useSectionTree } from '@/features/editor/composables/useSectionTree'
import { SECTION_REGISTRY } from '@/features/sections/registry'
import { useThemeStore } from '@/features/theme/stores/theme'

const props = defineProps<{ section: Section; hideHeader?: boolean }>()
const emit = defineEmits<{ close: [], 'editing-change': [isEditing: boolean] }>()

const themeStore = useThemeStore()
const { sectionLabelMap, sectionIconMap } = useSectionTree()

// ─── Registry-driven settings panel (resolved by theme preset) ───
const settingsPanelComponent = computed(() => {
  const { settingsPanel } = SECTION_REGISTRY[props.section.type]
  const preset = themeStore.theme?.theme_preset
  return (preset && settingsPanel[preset]) ?? settingsPanel.default
})

// ─── Single ref for all settings panels (methods accessed via optional chaining) ───
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const settingsRef = ref<any>(null)

// ─── Snapshot ───
const isEditingSubItem = ref(false)
const { capture: takeSnapshot, restore: restoreSnapshot } = useSectionSnapshot(() => props.section)

takeSnapshot()
watch(() => props.section.id, takeSnapshot)

// ─── Save / Cancel ───
function handleSave() {
  emit('close')
}

function handleCancel() {
  restoreSnapshot()
  emit('close')
}

defineExpose({
  handleSave,
  handleCancel,
  cancelSubItem: () => settingsRef.value?.cancelSubItem?.(),
  saveSubItem: () => { settingsRef.value?.saveSubItem?.(); takeSnapshot() },
  addItem: () => settingsRef.value?.addItem?.(),
  addLinksItem: () => settingsRef.value?.addLinksItem?.(),
  addStoreItem: () => settingsRef.value?.addStoreItem?.(),
})
</script>

<template>
  <!-- Panel header (only shown when not embedded in sidebar/mobile bar) -->
  <div v-if="!props.hideHeader" class="flex flex-1 items-center justify-between p-4 border-b border-gray-200">
    <div class="flex flex-1 items-center gap-2">
      <button v-if="isEditingSubItem" class="text-gray-400 hover:text-gray-700" @click="settingsRef?.cancelSubItem?.()">
        <ArrowLeftIcon class="h-4 w-4" />
      </button>
      <component v-if="!isEditingSubItem" :is="sectionIconMap[section.type]" class="h-4 w-4 text-gray-400 shrink-0" />
      <Transition name="modal-fade" mode="out-in">
        <h2 :key="isEditingSubItem ? 'edit' : section.type" class="text-sm font-semibold text-gray-900">
          {{ isEditingSubItem ? `${sectionLabelMap[section.type] ?? section.type} item` : (sectionLabelMap[section.type] ?? section.type) }}
        </h2>
      </Transition>
    </div>
    <div class="flex items-center gap-1">
      <BaseButton variant="outline" size="xs" @click="handleCancel">Cancel</BaseButton>
      <BaseButton variant="solid" size="xs" @click="handleSave">Save</BaseButton>
    </div>
  </div>


    <div class="flex flex-col gap-2 p-2">
      <component
        :is="settingsPanelComponent"
        ref="settingsRef"
        :section="section"
        @editing-change="isEditingSubItem = $event; emit('editing-change', $event)"
      />
    </div>

</template>
