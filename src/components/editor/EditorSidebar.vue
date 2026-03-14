<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Squares2X2Icon, SwatchIcon, SparklesIcon, EyeDropperIcon, LanguageIcon, GlobeAltIcon, Cog6ToothIcon } from '@heroicons/vue/24/outline'
import BaseButton from '../ui/BaseButton.vue'
import BaseTree from '../ui/BaseTree.vue'
import BaseTab from '../ui/BaseTab.vue'
import BaseColorInput from '../ui/BaseColorInput.vue'
import BaseInput from '../ui/BaseInput.vue'
import BaseCard from '../ui/BaseCard.vue'
import SectionSettingsModal from '@/components/modals/SectionSettingsModal.vue'
import SectionsModal from '@/components/modals/SectionsModal.vue'
import CustomDomainModal from '@/components/modals/CustomDomainModal.vue'
import type { TreeNode } from '../ui/BaseTree.vue'
import { useLandStore } from '@/stores/land'
import { useEditorStore } from '@/stores/editor'
import { useThemeStore } from '@/stores/theme'
import { useEditorActions } from '@/composables/useEditorActions'
import { sortByPosition, generatePositionAfter, generatePositionBetween, generatePositionBefore } from '@/lib/utils/position'
import type { SectionType } from '@/types/section'
import { THEME_PRESET_DEFINITIONS } from '@/lib/primitives/themePresets'
import { sectionPrimitives } from '@/sections/index'

const landStore = useLandStore()
const editorStore = useEditorStore()
const themeStore = useThemeStore()
const { addSection, deleteSection, duplicateSection, reorderSection, updateTheme } = useEditorActions()

// ─── Section settings ───
const showSections = ref(false)
const direction = ref<'forward' | 'back'>('forward')
const sectionSettingsRef = ref<InstanceType<typeof SectionSettingsModal> | null>(null)
const isSubItemEditing = ref(false)

watch(() => editorStore.showSectionSettings, (val) => {
  direction.value = val ? 'forward' : 'back'
  if (!val) { isSubItemEditing.value = false }
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
  colors: 'Color palette',
  typography: 'Typography',
}

const activeDesignPanel = ref<DesignPanel | null>(null)

const designNodes: TreeNode[] = [
  { id: 'theme',      label: 'Theme',          icon: SparklesIcon,    locked: true },
  { id: 'colors',     label: 'Color palette',  icon: EyeDropperIcon,  locked: true },
  { id: 'typography', label: 'Typography',     icon: LanguageIcon,    locked: true },
]

// ─── Settings sub-panel ───
const settingsTitle = ref(landStore.activeLand?.title ?? '')
const settingsUrl = ref(landStore.activeLand?.handle ?? '')
const showDomainModal = ref(false)

watch(() => landStore.activeLand?.id, () => {
  settingsTitle.value = landStore.activeLand?.title ?? ''
  settingsUrl.value = landStore.activeLand?.handle ?? ''
})

function onSettingsChange() {
  const land = landStore.activeLand
  if (!land) return
  landStore.updateLand(land.id, { title: settingsTitle.value, handle: settingsUrl.value })
  editorStore.markDirty()
}

function handleDesignSettings(node: TreeNode) {
  tabDirection.value = 'forward'
  activeDesignPanel.value = node.id as DesignPanel
}

function backFromDesign() {
  tabDirection.value = 'back'
  activeDesignPanel.value = null
}

// ─── Design data ───
const presets = Object.values(THEME_PRESET_DEFINITIONS)

const activeColorSlots = computed(() => {
  const preset = themeStore.theme?.theme_preset
  if (!preset) return THEME_PRESET_DEFINITIONS.minimal.colorSlots
  return THEME_PRESET_DEFINITIONS[preset].colorSlots
})

const activeTypographyOptions = computed(() => {
  const preset = themeStore.theme?.theme_preset
  if (!preset) return THEME_PRESET_DEFINITIONS.minimal.typographyOptions
  return THEME_PRESET_DEFINITIONS[preset].typographyOptions
})

function applyPreset(preset: typeof presets[number]) {
  updateTheme(preset.defaults)
}

// ─── Content tree ───
const sectionIconMap = Object.fromEntries(sectionPrimitives.map((p) => [p.id, p.icon]))
const sectionLabelMap = Object.fromEntries(sectionPrimitives.map((p) => [p.id, p.label]))

const sectionCount = computed(() => landStore.activeLand?.sections?.length ?? 0)
const atMaxSections = computed(() => sectionCount.value >= 12)

const nodes = computed<TreeNode[]>(() => {
  const sections = landStore.activeLand?.sections ?? []
  return sortByPosition(sections).map((s) => ({
    id: s.id,
    label: sectionLabelMap[s.type] ?? (s.type.charAt(0).toUpperCase() + s.type.slice(1)),
    icon: sectionIconMap[s.type],
    locked: s.type === 'header' || s.type === 'footer',
  }))
})

function handleSectionDrop(sectionType: string, newIndex: number) {
  const sorted = sortByPosition(landStore.activeLand?.sections ?? [])
  const footerIdx = sorted.findIndex((s) => s.type === 'footer')
  const clampedIndex = footerIdx !== -1 ? Math.min(newIndex, footerIdx) : newIndex
  const prev = sorted[clampedIndex - 1]?.position ?? null
  const next = sorted[clampedIndex]?.position ?? null
  const position = prev === null
    ? generatePositionBefore(next)
    : next === null
      ? generatePositionAfter(prev)
      : generatePositionBetween(prev, next)
  addSection(sectionType as SectionType, position)
}

function handleReorder(oldIndex: number, newIndex: number) {
  if (oldIndex === newIndex) return
  const sorted = sortByPosition(landStore.activeLand?.sections ?? [])
  const moved = sorted[oldIndex]
  if (!moved) return
  if (moved.type === 'header' || moved.type === 'footer') return
  if (sorted[newIndex]?.type === 'header' && newIndex === 0) return
  if (sorted[newIndex]?.type === 'footer' && newIndex === sorted.length - 1) return
  const remaining = sorted.filter((_, i) => i !== oldIndex)
  const prevPos = remaining[newIndex - 1]?.position ?? null
  const nextPos = remaining[newIndex]?.position ?? null
  const newPosition = prevPos === null
    ? generatePositionBefore(nextPos)
    : nextPos === null
      ? generatePositionAfter(prevPos)
      : generatePositionBetween(prevPos, nextPos)
  reorderSection(moved.id, newPosition)
}

function handleAddSection(type: string) {
  const sorted = sortByPosition(landStore.activeLand?.sections ?? [])
  const footerIdx = sorted.findIndex((s) => s.type === 'footer')
  const insertIdx = footerIdx !== -1 ? footerIdx : sorted.length
  const prev = sorted[insertIdx - 1]?.position ?? null
  const next = sorted[insertIdx]?.position ?? null
  const position = prev === null
    ? generatePositionBefore(next)
    : next === null
      ? generatePositionAfter(prev)
      : generatePositionBetween(prev, next)
  addSection(type as SectionType, position)
}
</script>

<template>
  <aside class="w-72 h-full bg-white flex flex-col overflow-hidden">

    <!-- Header -->
    <div class="flex border-b border-gray-200 shrink-0 h-16">
      <Transition name="modal-fade" mode="out-in">

        <!-- Section settings header -->
        <div v-if="editorStore.showSectionSettings && editorStore.activeSection" :key="editorStore.activeSection.id" class="flex items-center flex-1 justify-between pl-4 pr-2">
          <h2 class="text-sm font-semibold text-gray-900">{{ sectionLabelMap[editorStore.activeSection.type] ?? editorStore.activeSection.type }}</h2>
          <div class="flex items-center gap-1">
            <template v-if="isSubItemEditing">
              <BaseButton variant="outline" size="xs" @click="sectionSettingsRef?.cancelSubItem">Cancel</BaseButton>
              <BaseButton variant="solid" size="xs" @click="sectionSettingsRef?.saveSubItem">Save</BaseButton>
            </template>
            <template v-else>
              <BaseButton variant="outline" size="xs" @click="sectionSettingsRef?.handleSave">Back</BaseButton>
            </template>
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
    <div class="flex-1 min-h-0 overflow-y-auto">
      <Transition
        :name="direction === 'forward' ? 'modal-forward' : 'modal-back'"
        mode="out-in"
      >

        <!-- Section settings content -->
        <div v-if="editorStore.showSectionSettings && editorStore.activeSection" :key="editorStore.activeSection.id">
          <SectionSettingsModal
            ref="sectionSettingsRef"
            :section="editorStore.activeSection"
            :hide-header="true"
            @close="editorStore.showSectionSettings = false; editorStore.setActiveSection(null)"
            @editing-change="isSubItemEditing = $event"
          />
        </div>

        <!-- Default view -->
        <div v-else key="default" class="pl-2 py-4">
          <Transition
            :name="tabDirection === 'forward' ? 'modal-forward' : 'modal-back'"
            mode="out-in"
          >
            <!-- Content tab -->
            <div v-if="activeTab === 'content'" key="content" class="flex flex-col gap-4">
              <BaseTree :nodes="nodes" @settings="handleTreeSettings" @delete="deleteSection($event.id)" @duplicate="duplicateSection($event.id)" @reorder="handleReorder" @add="handleSectionDrop" />
              <BaseButton variant="outline" size="sm" :disabled="atMaxSections" @click="showSections = !showSections">
                {{ atMaxSections ? 'Max 12 sections reached' : '+ Add section' }}
              </BaseButton>
            </div>

            <!-- Options tab: tree + settings card -->
            <div v-else-if="activeTab === 'design' && !activeDesignPanel" key="design-list" class="flex flex-col gap-8">
              <div class="flex flex-col gap-4">
              <span class="text-xs font-medium text-gray-500">Sections</span>
              <BaseTree
                :nodes="designNodes"
                :group="{ name: 'design', pull: false, put: false }"
                @settings="handleDesignSettings"
              />
              </div>

              <BaseCard :icon="Cog6ToothIcon" title="Settings">
                <div class="flex flex-col gap-2">
                  <BaseInput size="sm" label="Project title" v-model="settingsTitle" placeholder="My project" @update:modelValue="onSettingsChange" />
                  <BaseInput size="sm" type="slug" label="URL" v-model="settingsUrl" placeholder="my-project" @update:modelValue="onSettingsChange" />
                </div>
              </BaseCard>
                <BaseCard :icon="GlobeAltIcon" title="Custom domain" description="Connect your own domain">
                  <template #actions>
                    <BaseButton size="sm" variant="outline" class="w-full justify-center" @click="showDomainModal = true">Setup</BaseButton>
                  </template>
                </BaseCard>
            </div>

            <!-- Design sub-panel: Theme -->
            <div v-else-if="activeDesignPanel === 'theme'" key="design-theme" class="flex flex-col gap-2">
              <button
                v-for="preset in presets"
                :key="preset.label"
                class="flex items-start gap-3 p-3 rounded-xl border transition-colors text-left"
                :class="themeStore.theme?.theme_preset === preset.defaults.theme_preset
                  ? 'border-gray-900 bg-gray-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'"
                @click="applyPreset(preset)"
              >
                <div class="flex gap-1 pt-0.5 shrink-0">
                  <span class="h-3 w-3 rounded-full border border-black/10" :style="{ background: preset.defaults.color_main }" />
                  <span class="h-3 w-3 rounded-full border border-black/10" :style="{ background: preset.defaults.color_accent }" />
                  <span class="h-3 w-3 rounded-full border border-black/10" :style="{ background: preset.defaults.color_surface }" />
                </div>
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ preset.label }}</p>
                  <p class="text-xs text-gray-400">{{ preset.description }}</p>
                </div>
              </button>
            </div>

            <!-- Design sub-panel: Color palette -->
            <div v-else-if="activeDesignPanel === 'colors'" key="design-colors" class="flex flex-col divide-y divide-gray-100">
              <BaseColorInput
                v-for="slot in activeColorSlots"
                :key="slot.key"
                :label="slot.label"
                :modelValue="themeStore.theme?.[slot.key] ?? '#000000'"
                @update:modelValue="updateTheme({ [slot.key]: $event })"
              />
            </div>

            <!-- Design sub-panel: Typography -->
            <div v-else-if="activeDesignPanel === 'typography'" key="design-typography" class="flex gap-1">
              <button
                v-for="option in activeTypographyOptions"
                :key="option.value"
                class="flex-1 py-1.5 text-xs rounded-lg border transition-colors"
                :class="themeStore.theme?.typography_style === option.value
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-200 text-gray-600 hover:border-gray-400'"
                @click="updateTheme({ typography_style: option.value })"
              >
                {{ option.label }}
              </button>
            </div>

          </Transition>
        </div>

      </Transition>
    </div>

    <Transition name="modal-grow">
      <SectionsModal v-if="showSections" @close="showSections = false" @select="handleAddSection($event); showSections = false" />
    </Transition>

    <Teleport to="body">
      <Transition name="modal-center">
        <CustomDomainModal v-if="showDomainModal" @close="showDomainModal = false" />
      </Transition>
    </Teleport>
  </aside>
</template>
