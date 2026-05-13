<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Squares2X2Icon, SwatchIcon, SparklesIcon, EyeDropperIcon, LanguageIcon, ChevronLeftIcon } from '@heroicons/vue/24/outline'
import BaseButton from '../ui/BaseButton.vue'
import BaseTree from '../ui/BaseTree.vue'
import BaseTab from '../ui/BaseTab.vue'
import SectionSettingsModal from '@/components/editor/SectionSettings.vue'
import SectionsModal from '@/components/modals/SectionsModal.vue'
import ThemePresetPicker from '@/components/editor/panel/design/ThemePresetPicker.vue'
import ColorPalette from '@/components/editor/panel/design/ColorPalette.vue'
import TypographyPicker from '@/components/editor/panel/design/TypographyPicker.vue'
import PublishSettingsCard from '@/components/editor/panel/PublishSettingsCard.vue'
import UpgradeCard from '@/components/editor/panel/UpgradeCard.vue'
import DangerZoneCard from '@/components/editor/panel/DangerZoneCard.vue'
import type { TreeNode } from '../ui/BaseTree.vue'
import { useLandStore } from '@/stores/land'
import { useEditorStore } from '@/stores/editor'
import { useSectionLifecycle } from '@/composables/useSectionLifecycle'
import { useSectionInsert } from '@/composables/useSectionInsert'
import { useSectionTree } from '@/composables/useSectionTree'
import { usePlan } from '@/composables/usePlan'
import { sortByPosition } from '@/lib/utils/position'
import type { SectionType } from '@/types/section'

const landStore = useLandStore()
const editorStore = useEditorStore()
const { deleteSection, duplicateSection } = useSectionLifecycle()
const { insertAt, insertBeforeFooter, moveTo } = useSectionInsert()
const { sectionLabelMap, nodes } = useSectionTree()
const { isPaid, withinSectionLimit, maxSections } = usePlan()

// ─── Section settings ───
const showSections = ref(false)
const direction = ref<'forward' | 'back'>('forward')
const sectionSettingsRef = ref<InstanceType<typeof SectionSettingsModal> | null>(null)
const isSubItemEditing = ref(false)

watch(() => editorStore.showSectionSettings, (val) => {
  direction.value = val ? 'forward' : 'back'
  if (!val) {
    isSubItemEditing.value = false
    activeTab.value = 'content'
    activeDesignPanel.value = null
  }
})

watch(() => editorStore.isEditMode, (val) => {
  if (!val) {
    activeTab.value = 'content'
    activeDesignPanel.value = null
  }
})

function handleTreeSettings(node: TreeNode) {
  const section = landStore.activeLand?.sections.find(s => s.id === node.id)
  if (section) {
    showSections.value = false
    editorStore.setActiveSection(section, true)
  }
}

// ─── Tabs ───
type Tab = 'content' | 'design'
const tabs: Tab[] = ['content', 'design']
const activeTab = ref<Tab>('content')
const tabDirection = ref<'forward' | 'back'>('forward')

function setTab(tab: Tab) {
  tabDirection.value = tabs.indexOf(tab) > tabs.indexOf(activeTab.value) ? 'forward' : 'back'
  activeTab.value = tab
  activeDesignPanel.value = null
}

// ─── Design sub-panels ───
type DesignPanel = 'theme' | 'colors' | 'typography'

const DESIGN_PANEL_LABELS: Record<DesignPanel, string> = {
  theme: 'Theme',
  colors: 'Color Palette',
  typography: 'Typography',
}

const activeDesignPanel = ref<DesignPanel | null>(null)

const designNodes: TreeNode[] = [
  { id: 'theme',      label: 'Theme',          icon: SparklesIcon,    locked: true },
  { id: 'colors',     label: 'Color Palette',  icon: EyeDropperIcon,  locked: true },
  { id: 'typography', label: 'Typography',     icon: LanguageIcon,    locked: true },
]

function handleDesignSettings(node: TreeNode) {
  tabDirection.value = 'forward'
  activeDesignPanel.value = node.id as DesignPanel
}

function backFromDesign() {
  tabDirection.value = 'back'
  activeDesignPanel.value = null
}

// ─── Content tree ───
const sectionCount = computed(() =>
  (landStore.activeLand?.sections ?? []).filter(s => s.type !== 'header' && s.type !== 'footer').length
)
const atMaxSections = computed(() => !withinSectionLimit(sectionCount.value))

function handleSectionDrop(sectionType: string, newIndex: number) {
  insertAt(sectionType as SectionType, newIndex)
}

function handleReorder(oldIndex: number, newIndex: number) {
  const s = sortByPosition(landStore.activeLand?.sections ?? [])
  const sectionId = s[oldIndex]?.id
  if (sectionId) moveTo(sectionId, newIndex)
}

function handleAddSection(type: string) {
  insertBeforeFooter(type as SectionType)
}
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
          <Transition
            :name="tabDirection === 'forward' ? 'modal-forward' : 'modal-back'"
            mode="out-in"
          >
            <!-- Content tab -->
            <div v-if="activeTab === 'content'" key="content" class="flex flex-col gap-4">
              <BaseTree :nodes="nodes" @settings="handleTreeSettings" @delete="deleteSection($event.id)" @duplicate="duplicateSection($event.id)" @reorder="handleReorder" @add="handleSectionDrop" />
              <BaseButton variant="outline" size="sm" :disabled="atMaxSections" @click="showSections = !showSections">
                {{ atMaxSections ? `Max ${maxSections + 2} sections reached` : '+ Add Section' }}
              </BaseButton>
              <Transition name="section-limit">
                <UpgradeCard v-if="atMaxSections && !isPaid" variant="compact" />
              </Transition>
            </div>

            <!-- Options tab: tree + settings cards -->
            <div v-else-if="activeTab === 'design' && !activeDesignPanel" key="design-list" class="flex flex-col gap-4 flex-1">
              <div class="flex flex-col gap-4">
                <BaseTree
                  :nodes="designNodes"
                  :group="{ name: 'design', pull: false, put: false }"
                  @settings="handleDesignSettings"
                />
              </div>

              <div class="flex flex-col flex-1 gap-2">
                <PublishSettingsCard />
                <UpgradeCard v-if="!isPaid" variant="full" />
                <DangerZoneCard />
              </div>
            </div>

            <!-- Design sub-panel: Theme -->
            <div v-else-if="activeDesignPanel === 'theme'" key="design-theme" class="flex flex-col gap-2">
              <ThemePresetPicker />
            </div>

            <!-- Design sub-panel: Color palette -->
            <div v-else-if="activeDesignPanel === 'colors'" key="design-colors" class="flex flex-col divide-y divide-gray-100">
              <ColorPalette />
            </div>

            <!-- Design sub-panel: Typography -->
            <div v-else-if="activeDesignPanel === 'typography'" key="design-typography" class="flex flex-col gap-1.5">
              <TypographyPicker />
            </div>

          </Transition>
        </div>

      </Transition>
    </div>

    <Transition name="modal-grow">
      <SectionsModal v-if="showSections" @close="showSections = false" @select="handleAddSection($event); showSections = false" />
    </Transition>
  </aside>
</template>

<style scoped>
.section-limit-enter-active {
  transition: opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1), transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}
.section-limit-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}
.section-limit-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.section-limit-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
