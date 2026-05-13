<script setup lang="ts">
import { ref, watch } from 'vue'
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'
import BaseButton from '../ui/BaseButton.vue'
import HeaderSettings from './settings/HeaderSettings.vue'
import ContentMediaSettings from './settings/ContentMediaSettings.vue'
import ListSettings from './settings/ListSettings.vue'
import CollectionSettings from './settings/CollectionSettings.vue'
import StoreSettings from './settings/StoreSettings.vue'
import MonetizeSettings from './settings/MonetizeSettings.vue'
import FooterSettings from './settings/FooterSettings.vue'
import CampaignSettings from './settings/CampaignSettings.vue'
import type { Section } from '@/types/section'
import { useEditorActions } from '@/composables/useEditorActions'
import { sectionLabelMap, sectionIconMap } from '@/composables/useSectionTree'

const props = defineProps<{ section: Section; hideHeader?: boolean }>()
const emit = defineEmits<{ close: [], 'editing-change': [isEditing: boolean] }>()

const { restoreSectionSnapshot } = useEditorActions()

// ─── Child refs ───
const listRef = ref<InstanceType<typeof ListSettings> | null>(null)
const collectionRef = ref<InstanceType<typeof CollectionSettings> | null>(null)
const monetizeRef = ref<InstanceType<typeof MonetizeSettings> | null>(null)
const storeRef = ref<InstanceType<typeof StoreSettings> | null>(null)

// ─── Snapshot ───
interface SectionSnapshot { content: unknown; settings_json: unknown; style_variant: string }
const snapshot = ref<SectionSnapshot | null>(null)
const isEditingSubItem = ref(false)

function takeSnapshot() {
  snapshot.value = {
    content: JSON.parse(JSON.stringify(props.section.content ?? {})),
    settings_json: JSON.parse(JSON.stringify(props.section.settings_json ?? {})),
    style_variant: props.section.style_variant,
  }
}

takeSnapshot()
watch(() => props.section.id, takeSnapshot)

// ─── Save / Cancel ───
function handleSave() {
  emit('close')
}

function handleCancel() {
  if (snapshot.value) {
    restoreSectionSnapshot(props.section.id, snapshot.value)
  }
  emit('close')
}

defineExpose({
  handleSave,
  handleCancel,
  cancelSubItem: () => listRef.value?.cancelSubItem(),
  saveSubItem: () => { listRef.value?.saveSubItem(); takeSnapshot() },
  addItem: () => (collectionRef.value ?? monetizeRef.value)?.addItem(),
  addListItem: () => listRef.value?.addListItem(),
  addStoreItem: () => storeRef.value?.addStoreItem(),
})
</script>

<template>
  <!-- Panel header (only shown when not embedded in sidebar/mobile bar) -->
  <div v-if="!props.hideHeader" class="flex flex-1 items-center justify-between p-4 border-b border-gray-200">
    <div class="flex flex-1 items-center gap-2">
      <button v-if="isEditingSubItem" class="text-gray-400 hover:text-gray-700" @click="listRef?.cancelSubItem()">
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
      <HeaderSettings v-if="section.type === 'header'" :section="section" />
      <ContentMediaSettings v-else-if="section.type === 'content_media'" :section="section" />
      <ListSettings
        v-else-if="section.type === 'list'"
        ref="listRef"
        :section="section"
        @editing-change="isEditingSubItem = $event; emit('editing-change', $event)"
      />
      <CollectionSettings v-else-if="section.type === 'collection'" ref="collectionRef" :section="section" />
      <StoreSettings v-else-if="section.type === 'store'" ref="storeRef" :section="section" />
      <MonetizeSettings v-else-if="section.type === 'monetize'" ref="monetizeRef" :section="section" />
      <FooterSettings v-else-if="section.type === 'footer'" :section="section" />
      <CampaignSettings v-else-if="section.type === 'campaign'" :section="section" />
    </div>

</template>
