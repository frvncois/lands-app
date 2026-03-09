<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { Squares2X2Icon, SwatchIcon } from '@heroicons/vue/24/outline'
import BaseButton from '../ui/BaseButton.vue'
import BaseTree from '../ui/BaseTree.vue'
import BaseTab from '../ui/BaseTab.vue'
import Accordion from '../ui/Accordion.vue'
import BaseColorInput from '../ui/BaseColorInput.vue'
import SectionSettingsModal from './SectionSettingsModal.vue'
import SectionsModal from './SectionsModal.vue'
import type { TreeNode } from '../ui/BaseTree.vue'
import { useLandStore } from '@/stores/land'
import { useEditorStore } from '@/stores/editor'
import { useThemeStore } from '@/stores/theme'
import { useEditorActions } from '@/composables/useEditorActions'
import { sortByPosition, generatePositionAfter, generatePositionBetween, generatePositionBefore } from '@/lib/utils/position'
import type { SectionType } from '@/types/section'
import { THEME_PRESET_DEFINITIONS } from '@/lib/primitives/themePresets'
import { TYPOGRAPHY_STYLES } from '@/types/theme'

const landStore = useLandStore()
const editorStore = useEditorStore()
const themeStore = useThemeStore()
const { addSection, deleteSection, reorderSection, updateTheme } = useEditorActions()

const showSections = ref(false)
const openAccordion = ref<'theme' | 'colors' | 'typography'>('theme')
const direction = ref<'forward' | 'back'>('forward')
const sectionSettingsRef = ref<InstanceType<typeof SectionSettingsModal> | null>(null)
const contentWrapper = ref<HTMLElement | null>(null)
const isSubItemEditing = ref(false)
const isMonetizeOpen = ref(false)

watch(() => editorStore.showSectionSettings, (val) => {
  direction.value = val ? 'forward' : 'back'
  if (!val) { isSubItemEditing.value = false; isMonetizeOpen.value = false }
})

function onBeforeLeave() {
  if (!contentWrapper.value) return
  contentWrapper.value.style.height = contentWrapper.value.scrollHeight + 'px'
  contentWrapper.value.style.overflow = 'hidden'
}

function onEnter(el: Element) {
  if (!contentWrapper.value) return
  const newHeight = (el as HTMLElement).scrollHeight
  contentWrapper.value.style.transition = 'height 0.22s ease'
  contentWrapper.value.style.height = newHeight + 'px'
}

function onAfterEnter() {
  if (!contentWrapper.value) return
  contentWrapper.value.style.height = ''
  contentWrapper.value.style.overflow = ''
  contentWrapper.value.style.transition = ''
}

function onTabBeforeLeave() {
  if (!contentWrapper.value) return
  contentWrapper.value.style.height = contentWrapper.value.scrollHeight + 'px'
  contentWrapper.value.style.overflow = 'hidden'
}

function onTabEnter(el: Element) {
  if (!contentWrapper.value) return
  contentWrapper.value.style.transition = 'height 0.22s ease'
  contentWrapper.value.style.height = (el as HTMLElement).scrollHeight + 'px'
}

function onTabAfterEnter() {
  if (!contentWrapper.value) return
  contentWrapper.value.style.height = ''
  contentWrapper.value.style.overflow = ''
  contentWrapper.value.style.transition = ''
}

function handleTreeSettings(node: TreeNode) {
  const section = landStore.activeLand?.sections.find(s => s.id === node.id)
  if (section) {
    editorStore.setActiveSection(section, true)
  }
}

const presets = Object.values(THEME_PRESET_DEFINITIONS)

function applyPreset(preset: typeof presets[number]) {
  updateTheme(preset.defaults)
}

type Tab = 'content' | 'design'
const tabs: Tab[] = ['content', 'design']
const activeTab = ref<Tab>('content')
const tabDirection = ref<'forward' | 'back'>('forward')

function setTab(tab: Tab) {
  tabDirection.value = tabs.indexOf(tab) > tabs.indexOf(activeTab.value) ? 'forward' : 'back'
  activeTab.value = tab
}

const nodes = computed<TreeNode[]>(() => {
  const sections = landStore.activeLand?.sections ?? []
  return sortByPosition(sections).map((s) => ({
    id: s.id,
    label: s.type.charAt(0).toUpperCase() + s.type.slice(1),
  }))
})

function handleReorder(oldIndex: number, newIndex: number) {
  if (oldIndex === newIndex) return
  const sorted = sortByPosition(landStore.activeLand?.sections ?? [])
  const moved = sorted[oldIndex]
  if (!moved) return
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
  const sections = landStore.activeLand?.sections ?? []
  const sorted = sortByPosition(sections)
  const lastPos = sorted[sorted.length - 1]?.position ?? null
  addSection(type as SectionType, generatePositionAfter(lastPos))
  editorStore.showSectionSettings = true
}

// ─── Drag ───
let dragOffset = { x: 0, y: 0 }

function onDragStart(e: MouseEvent) {
  dragOffset = {
    x: e.clientX - editorStore.panelPos.x,
    y: e.clientY - editorStore.panelPos.y,
  }
  window.addEventListener('mousemove', onDragMove)
  window.addEventListener('mouseup', onDragEnd)
}

function onDragMove(e: MouseEvent) {
  editorStore.setPanelPos({
    x: e.clientX - dragOffset.x,
    y: e.clientY - dragOffset.y,
  })
}

function onDragEnd() {
  window.removeEventListener('mousemove', onDragMove)
  window.removeEventListener('mouseup', onDragEnd)
}

onUnmounted(() => {
  window.removeEventListener('mousemove', onDragMove)
  window.removeEventListener('mouseup', onDragEnd)
})
</script>

<template>
  <div
    class="fixed w-80 z-50 bg-white shadow-xl rounded-2xl select-none origin-top-right overflow-hidden"
    :style="{ left: editorStore.panelPos.x + 'px', top: editorStore.panelPos.y + 'px' }"
  >
    <!-- Drag handle -->
    <div
      class="flex items-center justify-center h-5 shrink-0 cursor-grab active:cursor-grabbing rounded-t-2xl border-b border-gray-200"
      @mousedown.prevent="onDragStart"
    >
      <div class="flex gap-0.5">
        <span v-for="i in 6" :key="i" class="h-1 w-1 rounded-full bg-gray-200" />
      </div>
    </div>

    <!-- Unified header -->
    <div class="border-b border-gray-200 shrink-0">
      <Transition name="modal-fade" mode="out-in">

        <!-- Section settings header -->
        <div v-if="editorStore.showSectionSettings && editorStore.activeSection" :key="editorStore.activeSection.id" class="flex items-center justify-between p-4">
          <h2 class="text-sm font-semibold text-gray-900 capitalize">{{ editorStore.activeSection.type }}</h2>
          <div class="flex items-center gap-1">
            <template v-if="isMonetizeOpen">
              <BaseButton variant="outline" size="xs" @click="sectionSettingsRef?.closeMonetize">Back</BaseButton>
            </template>
            <template v-else-if="isSubItemEditing">
              <BaseButton variant="outline" size="xs" @click="sectionSettingsRef?.cancelSubItem">Cancel</BaseButton>
              <BaseButton variant="solid" size="xs" @click="sectionSettingsRef?.saveSubItem">Save</BaseButton>
            </template>
            <template v-else-if="editorStore.activeSection?.type === 'list' || editorStore.activeSection?.type === 'collection' || editorStore.activeSection?.type === 'store'">
              <BaseButton variant="outline" size="xs" @click="sectionSettingsRef?.handleSave">Back</BaseButton>
              <BaseButton variant="solid" size="xs" @click="editorStore.activeSection?.type === 'store' ? sectionSettingsRef?.addStoreItem() : sectionSettingsRef?.addItem()">+ Add item</BaseButton>
            </template>
            <template v-else>
              <BaseButton variant="outline" size="xs" @click="sectionSettingsRef?.handleCancel">Cancel</BaseButton>
              <BaseButton variant="solid" size="xs" @click="sectionSettingsRef?.handleSave">Save</BaseButton>
            </template>
          </div>
        </div>

        <!-- Default tabs header -->
        <div v-else key="tabs" class="flex">
          <BaseTab label="Content" :icon="Squares2X2Icon" :active="activeTab === 'content'" @click="setTab('content')" />
          <BaseTab label="Design" :icon="SwatchIcon" :active="activeTab === 'design'" @click="setTab('design')" />
        </div>

      </Transition>
    </div>

    <!-- Content wrapper with height animation -->
    <div ref="contentWrapper">
      <Transition
        :name="direction === 'forward' ? 'modal-forward' : 'modal-back'"
        mode="out-in"
        @before-leave="onBeforeLeave"
        @enter="onEnter"
        @after-enter="onAfterEnter"
      >

        <!-- Section settings content -->
        <div v-if="editorStore.showSectionSettings && editorStore.activeSection" :key="editorStore.activeSection.id">
          <SectionSettingsModal
            ref="sectionSettingsRef"
            :section="editorStore.activeSection"
            :hide-header="true"
            @close="editorStore.showSectionSettings = false; editorStore.setActiveSection(null)"
            @editing-change="isSubItemEditing = $event"
            @monetize-open="isMonetizeOpen = $event"
          />
        </div>

        <!-- Default view -->
        <div v-else key="default">
          <div>
            <Transition
              :name="tabDirection === 'forward' ? 'modal-forward' : 'modal-back'"
              mode="out-in"
              @before-leave="onTabBeforeLeave"
              @enter="onTabEnter"
              @after-enter="onTabAfterEnter"
            >
              <div v-if="activeTab === 'content'" key="content" class="flex flex-col gap-4 p-4">
                <BaseTree :nodes="nodes" @settings="handleTreeSettings" @delete="deleteSection($event.id)" @reorder="handleReorder" />
                <BaseButton variant="outline" size="sm" @click="showSections = !showSections">+ Add section</BaseButton>
              </div>
              <div v-else key="design" class="flex flex-col divide-y divide-gray-100">
                <!-- Presets -->
                <Accordion label="Theme" :open="openAccordion === 'theme'" @open="openAccordion = 'theme'">
                  <div class="flex flex-col gap-2 pt-0 p-4">
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
                </Accordion>

                <!-- Colors -->
                <Accordion label="Color palette" :open="openAccordion === 'colors'" @open="openAccordion = 'colors'">
                  <div class="flex flex-col pt-0 p-4 divide-y divide-gray-100">
                    <BaseColorInput
                      label="Main"
                      :modelValue="themeStore.theme?.color_main ?? '#18181B'"
                      @update:modelValue="updateTheme({ color_main: $event })"
                    />
                    <BaseColorInput
                      label="Accent"
                      :modelValue="themeStore.theme?.color_accent ?? '#6366F1'"
                      @update:modelValue="updateTheme({ color_accent: $event })"
                    />
                    <BaseColorInput
                      label="Surface"
                      :modelValue="themeStore.theme?.color_surface ?? '#F4F4F5'"
                      @update:modelValue="updateTheme({ color_surface: $event })"
                    />
                  </div>
                </Accordion>

                <!-- Typography -->
                <Accordion label="Typography" :open="openAccordion === 'typography'" @open="openAccordion = 'typography'">
                  <div class="flex gap-1 pt-0 p-4">
                    <button
                      v-for="style in Object.values(TYPOGRAPHY_STYLES)"
                      :key="style"
                      class="flex-1 py-1.5 text-xs rounded-lg border transition-colors capitalize"
                      :class="themeStore.theme?.typography_style === style
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-200 text-gray-600 hover:border-gray-400'"
                      @click="updateTheme({ typography_style: style })"
                    >
                      {{ style }}
                    </button>
                  </div>
                </Accordion>
              </div>
            </Transition>
          </div>
        </div>

      </Transition>
    </div>

    <Transition name="modal-grow">
      <SectionsModal v-if="showSections" class="origin-top-right" @close="showSections = false" @select="handleAddSection($event); showSections = false" />
    </Transition>
  </div>
</template>
