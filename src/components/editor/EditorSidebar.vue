<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Squares2X2Icon, SwatchIcon, SparklesIcon, EyeDropperIcon, LanguageIcon, GlobeAltIcon, Cog6ToothIcon, TrashIcon } from '@heroicons/vue/24/outline'
import BaseButton from '../ui/BaseButton.vue'
import BaseTree from '../ui/BaseTree.vue'
import BaseTab from '../ui/BaseTab.vue'
import BaseColorInput from '../ui/BaseColorInput.vue'
import BaseFont from '../ui/BaseFont.vue'
import BaseInput from '../ui/BaseInput.vue'
import BaseCard from '../ui/BaseCard.vue'
import BaseToggle from '../ui/BaseToggle.vue'
import SectionSettingsModal from '@/components/modals/SectionSettingsModal.vue'
import SectionsModal from '@/components/modals/SectionsModal.vue'
import CustomDomainModal from '@/components/modals/CustomDomainModal.vue'
import DeleteProjectModal from '@/components/modals/DeleteProjectModal.vue'
import ConfirmUnpublishModal from '@/components/modals/ConfirmUnpublishModal.vue'
import type { TreeNode } from '../ui/BaseTree.vue'
import { useLandStore } from '@/stores/land'
import { useEditorStore } from '@/stores/editor'
import { landService } from '@/services/land.service'
import { useAppModals } from '@/stores/appModals'

const appModals = useAppModals()
import { useThemeStore } from '@/stores/theme'
import { useEditorActions } from '@/composables/useEditorActions'
import { usePlan } from '@/composables/usePlan'
import { sortByPosition, generatePositionAfter, generatePositionBetween, generatePositionBefore } from '@/lib/utils/position'
import type { SectionType } from '@/types/section'
import { THEME_PRESET_DEFINITIONS } from '@/lib/primitives/themePresets'
import { sectionPrimitives } from '@/sections/index'

const landStore = useLandStore()
const editorStore = useEditorStore()
const themeStore = useThemeStore()
const { addSection, deleteSection, duplicateSection, reorderSection, updateTheme } = useEditorActions()
const { isPaid, withinSectionLimit, maxSections } = usePlan()

const showDeleteModal = ref(false)

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

// ─── Settings sub-panel ───
const settingsTitle = ref(landStore.activeLand?.title ?? '')
const settingsUrl = ref(landStore.activeLand?.handle ?? '')
const showDomainModal = ref(false)
const showUnpublishModal = ref(false)
const isPrivate = ref(landStore.activeLand?.is_private ?? false)
const privatePassword = ref(landStore.activeLand?.private_password ?? '')

watch(() => landStore.activeLand?.id, () => {
  settingsTitle.value = landStore.activeLand?.title ?? ''
  settingsUrl.value = landStore.activeLand?.handle ?? ''
  isPrivate.value = landStore.activeLand?.is_private ?? false
  privatePassword.value = landStore.activeLand?.private_password ?? ''
})

function onSettingsChange() {
  const land = landStore.activeLand
  if (!land) return
  landStore.updateLand(land.id, { title: settingsTitle.value, handle: settingsUrl.value })
  editorStore.markDirty()
}

function handlePublishedToggle(val: boolean) {
  const land = landStore.activeLand
  if (!land) return
  if (!val && land.is_published) {
    showUnpublishModal.value = true
  } else if (val) {
    landStore.updateLand(land.id, { is_published: true })
    landService.updateLand(land.id, { is_published: true })
  }
}

async function confirmUnpublish() {
  const land = landStore.activeLand
  if (!land) return
  showUnpublishModal.value = false
  landStore.updateLand(land.id, { is_published: false })
  await landService.updateLand(land.id, { is_published: false })
}

async function handlePrivateToggle(val: boolean) {
  const land = landStore.activeLand
  if (!land) return
  isPrivate.value = val
  if (!val) {
    privatePassword.value = ''
    landStore.updateLand(land.id, { is_private: false, private_password: null })
    await landService.updateLand(land.id, { is_private: false, private_password: null })
  } else {
    landStore.updateLand(land.id, { is_private: true })
    await landService.updateLand(land.id, { is_private: true })
  }
}

async function savePrivatePassword() {
  const land = landStore.activeLand
  if (!land || !privatePassword.value) return
  landStore.updateLand(land.id, { private_password: privatePassword.value })
  await landService.updateLand(land.id, { private_password: privatePassword.value })
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

const activePairings = computed(() => {
  const preset = themeStore.theme?.theme_preset
  if (!preset) return THEME_PRESET_DEFINITIONS.minimal.pairings
  return THEME_PRESET_DEFINITIONS[preset].pairings
})

function applyPreset(preset: typeof presets[number]) {
  updateTheme(preset.defaults)
}

// ─── Content tree ───
const sectionIconMap = Object.fromEntries(sectionPrimitives.map((p) => [p.id, p.icon]))
const sectionLabelMap = Object.fromEntries(sectionPrimitives.map((p) => [p.id, p.label]))

const sectionCount = computed(() =>
  (landStore.activeLand?.sections ?? []).filter(s => s.type !== 'header' && s.type !== 'footer').length
)
const atMaxSections = computed(() => !withinSectionLimit(sectionCount.value))

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
          <Transition name="modal-title" mode="out-in">
            <h2 :key="isSubItemEditing ? 'item' : 'section'" class="text-sm font-semibold text-gray-900">{{ (sectionLabelMap[editorStore.activeSection.type] ?? editorStore.activeSection.type) + (isSubItemEditing ? ' item' : '') }}</h2>
          </Transition>
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
    <div class="flex flex-col flex-1 min-h-0 overflow-y-auto">
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
                <div v-if="atMaxSections && !isPaid" class="rounded-xl border border-gray-200 p-3 flex flex-col gap-3 text-center items-center">
                  <p class="text-xs text-gray-500 leading-relaxed">You've reached the section limit. Upgrade to Pro for unlimited sections.</p>
                  <BaseButton size="sm" variant="solid" class="w-full justify-center" @click="appModals.openUpgrade()">Upgrade to Pro</BaseButton>
                </div>
              </Transition>
            </div>

            <!-- Options tab: tree + settings card -->
            <div v-else-if="activeTab === 'design' && !activeDesignPanel" key="design-list" class="flex flex-col gap-4 flex-1">
              <div class="flex flex-col gap-4">
              <BaseTree
                :nodes="designNodes"
                :group="{ name: 'design', pull: false, put: false }"
                @settings="handleDesignSettings"
              />
              </div>

              <div class="flex flex-col flex-1 gap-2">
                <BaseCard :icon="Cog6ToothIcon" title="Publish Settings">
                  <div class="flex flex-col gap-3">
                    <BaseInput size="sm" label="Project title" v-model="settingsTitle" placeholder="My project" @update:modelValue="onSettingsChange" />
                    <BaseInput size="sm" type="slug" label="URL" v-model="settingsUrl" placeholder="my-project" @update:modelValue="onSettingsChange" />
                    <div class="border-t border-gray-100 pt-3 flex flex-col gap-3">
                      <BaseToggle
                        size="sm"
                        label="Published"
                        description="Make this project accessible publicly"
                        :model-value="landStore.activeLand?.is_published ?? false"
                        @update:model-value="handlePublishedToggle"
                      />
                      <BaseToggle
                        size="sm"
                        label="Private"
                        description="Protect with a password"
                        :model-value="isPrivate"
                        @update:model-value="handlePrivateToggle"
                      >
                        <BaseInput
                          size="sm"
                          type="password"
                          label="Password"
                          v-model="privatePassword"
                          placeholder="Enter password"
                          @blur="savePrivatePassword"
                          @keydown.enter="savePrivatePassword"
                        />
                      </BaseToggle>
                    </div>
                  </div>
                </BaseCard>
                <BaseCard v-if="isPaid" :icon="GlobeAltIcon" title="Custom domain" description="Connect your own domain">
                  <template #actions>
                    <BaseButton size="sm" variant="outline" class="w-full justify-center" @click="showDomainModal = true">Setup</BaseButton>
                  </template>
                </BaseCard>

                <!-- Upgrade card (free plan only) -->
                <div v-if="!isPaid" class="rounded-xl border border-gray-200 px-4 py-4 flex flex-col flex-1 justify-center items-center gap-4 text-center">
                  <div class="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center">
                    <SparklesIcon class="h-5 w-5 text-gray-700" />
                  </div>
                  <p class="text-sm font-semibold text-gray-900">Upgrade to Pro</p>
                  <div class="flex flex-wrap justify-center gap-1.5">
                    <span class="text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">Marketing</span>
                    <span class="text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">Custom Domain</span>
                    <span class="text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">Unlimited</span>
                  </div>
                  <BaseButton size="sm" variant="solid" class="w-full justify-center" @click="appModals.openUpgrade()">Upgrade — $10/mo</BaseButton>
                </div>

                <!-- Danger zone -->
                <button
                  class="group flex items-center rounded-xl border border-red-100 hover:bg-red-50 transition-all p-1.5 gap-2 cursor-pointer w-full text-left"
                  @click="showDeleteModal = true"
                >
                  <div class="shrink-0 flex items-center justify-center h-7 w-7 rounded-lg bg-red-100 text-red-500">
                    <TrashIcon class="h-4 w-4" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-red-600">Delete project</p>
                  </div>
                  <TrashIcon class="h-4 w-4 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mr-1" />
                </button>
                </div>
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
            <div v-else-if="activeDesignPanel === 'typography'" key="design-typography" class="flex flex-col gap-1.5">
              <BaseFont
                v-for="pairing in activePairings"
                :key="pairing.id"
                :label="pairing.label"
                :titleFont="pairing.titleFont"
                :bodyFont="pairing.bodyFont"
                :titleGoogleFont="pairing.titleGoogleFont"
                :bodyGoogleFont="pairing.bodyGoogleFont"
                :active="themeStore.theme?.font_title === pairing.titleFont && themeStore.theme?.font_body === pairing.bodyFont"
                @click="updateTheme({ font_title: pairing.titleFont, font_body: pairing.bodyFont })"
              />
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
      <Transition name="modal-center">
        <DeleteProjectModal v-if="showDeleteModal" @close="showDeleteModal = false" />
      </Transition>
      <Transition name="modal-center">
        <ConfirmUnpublishModal v-if="showUnpublishModal" @confirm="confirmUnpublish" @cancel="showUnpublishModal = false" />
      </Transition>
    </Teleport>
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
