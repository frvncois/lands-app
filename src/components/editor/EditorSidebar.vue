<script setup lang="ts">
import { ref } from 'vue'
import { Squares2X2Icon, SwatchIcon, ChevronLeftIcon } from '@heroicons/vue/24/outline'
import BaseButton from '../ui/BaseButton.vue'
import BaseTab from '../ui/BaseTab.vue'
import SectionSettingsModal from '@/components/editor/SectionSettings.vue'
import EditorPanel from '@/components/editor/EditorPanel.vue'
import { useEditorStore } from '@/stores/editor'
import { useSectionTree } from '@/composables/useSectionTree'
import { useEditorPanel, DESIGN_PANEL_LABELS } from '@/composables/useEditorPanel'

const editorStore = useEditorStore()
const { sectionLabelMap } = useSectionTree()
const { activeTab, activeDesignPanel, direction, isSubItemEditing, setTab, backFromDesign } = useEditorPanel()

const sectionSettingsRef = ref<InstanceType<typeof SectionSettingsModal> | null>(null)
</script>

<template>
  <aside class="w-72 h-full bg-white flex flex-col overflow-hidden">

    <!-- Header -->
    <div class="flex border-b border-gray-200 shrink-0 h-16">
      <Transition name="modal-fade" mode="out-in">

        <!-- Section settings header -->
        <div v-if="editorStore.showSectionSettings && editorStore.activeSection" :key="editorStore.activeSection.id" class="flex items-center flex-1 justify-between pl-2 pr-2">
          <div class="flex items-center gap-1 flex-1 min-w-0">
            <button
              v-if="!isSubItemEditing"
              class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100 shrink-0"
              @click="sectionSettingsRef?.handleSave"
            >
              <ChevronLeftIcon class="h-3 w-3" />
            </button>
            <Transition name="modal-title" mode="out-in">
              <h2 :key="isSubItemEditing ? 'item' : 'section'" class="text-sm font-semibold text-gray-900 truncate">{{ (sectionLabelMap[editorStore.activeSection.type] ?? editorStore.activeSection.type) + (isSubItemEditing ? ' item' : '') }}</h2>
            </Transition>
          </div>
          <div v-if="isSubItemEditing" class="flex items-center gap-1 shrink-0">
            <BaseButton variant="outline" size="xs" @click="sectionSettingsRef?.cancelSubItem">Cancel</BaseButton>
            <BaseButton variant="solid" size="xs" @click="sectionSettingsRef?.saveSubItem">Save</BaseButton>
          </div>
        </div>

        <!-- Design sub-panel header -->
        <div v-else-if="activeDesignPanel" :key="activeDesignPanel" class="flex items-center flex-1 justify-between pl-4 pr-2">
          <h2 class="text-sm font-semibold text-gray-900">{{ DESIGN_PANEL_LABELS[activeDesignPanel] }}</h2>
          <BaseButton variant="outline" size="xs" @click="backFromDesign">Back</BaseButton>
        </div>

        <!-- Default tabs header -->
        <div v-else key="tabs" class="flex flex-1">
          <BaseTab label="Content" :icon="Squares2X2Icon" :active="activeTab === 'content'" @click="setTab('content')" />
          <BaseTab label="Options" :icon="SwatchIcon" :active="activeTab === 'design'" @click="setTab('design')" />
        </div>

      </Transition>
    </div>

    <!-- Scrollable content -->
    <div class="flex flex-col flex-1 min-h-0 overflow-y-auto">
      <Transition
        :name="direction === 'forward' ? 'modal-forward' : 'modal-back'"
        mode="out-in"
      >

        <!-- Section settings content -->
        <div class="flex-1" v-if="editorStore.showSectionSettings && editorStore.activeSection" :key="editorStore.activeSection.id">
          <SectionSettingsModal
            ref="sectionSettingsRef"
            :section="editorStore.activeSection"
            :hide-header="true"
            @close="editorStore.showSectionSettings = false; editorStore.setActiveSection(null)"
            @editing-change="isSubItemEditing = $event"
          />
        </div>

        <!-- Default view -->
        <div v-else key="default" class="flex flex-col pl-4 pr-2 pt-4 flex-1">
          <EditorPanel />
        </div>

      </Transition>
    </div>

  </aside>
</template>
