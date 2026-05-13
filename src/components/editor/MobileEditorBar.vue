<script setup lang="ts">
import { ref, computed } from 'vue'
import { Squares2X2Icon, SwatchIcon, SparklesIcon, EyeDropperIcon, LanguageIcon } from '@heroicons/vue/24/outline'
import { useLandStore } from '@/stores/land'
import { useEditorStore } from '@/stores/editor'
import { useThemeStore } from '@/stores/theme'
import { useEditorActions } from '@/composables/useEditorActions'
import { useIsMobile } from '@/composables/useIsMobile'
import { usePlan } from '@/composables/usePlan'
import { sortByPosition, generatePositionAfter, generatePositionBetween, generatePositionBefore } from '@/lib/utils/position'
import { THEME_PRESET_DEFINITIONS } from '@/lib/primitives/themePresets'
import { sectionPrimitives } from '@/sections/index'
import type { SectionType } from '@/types/section'
import type { TreeNode } from '@/components/ui/BaseTree.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseTree from '@/components/ui/BaseTree.vue'
import BaseColorInput from '@/components/ui/BaseColorInput.vue'
import BaseFont from '@/components/ui/BaseFont.vue'
import SectionSettingsModal from '@/components/editor/SectionSettings.vue'
import SectionsModal from '@/components/modals/SectionsModal.vue'

type Tab = 'content' | 'design'

const landStore = useLandStore()
const editorStore = useEditorStore()
const themeStore = useThemeStore()
const { isMobile } = useIsMobile()
const { addSection, deleteSection, duplicateSection, reorderSection, updateTheme } = useEditorActions()
const { withinSectionLimit, maxSections, isPaid } = usePlan()

// ─── Tab state ───
const activeTab = ref<Tab | null>(null)

function toggleTab(tab: Tab) {
  activeTab.value = activeTab.value === tab ? null : tab
}

// ─── Section settings sheet ───
const sectionSettingsRef = ref<InstanceType<typeof SectionSettingsModal> | null>(null)
const isSubItemEditing = ref(false)

// ─── Add sections sheet ───
const showSections = ref(false)

// ─── Section list ───
const sectionIconMap = Object.fromEntries(sectionPrimitives.map((p) => [p.id, p.icon]))
const sectionLabelMap = Object.fromEntries(sectionPrimitives.map((p) => [p.id, p.label]))

const FIXED_LABEL_TYPES = new Set(['header', 'footer', 'campaign'])

function getSectionTitle(s: { type: string; content: unknown }): string | null {
  if (FIXED_LABEL_TYPES.has(s.type)) return null
  const c = s.content as any
  if (s.type === 'collection' || s.type === 'monetize') return c?.collections?.[0]?.title || null
  if (s.type === 'store') return c?.stores?.[0]?.title || null
  return c?.title || null
}

const sectionCount = computed(() =>
  (landStore.activeLand?.sections ?? []).filter(s => s.type !== 'header' && s.type !== 'footer').length
)
const atMaxSections = computed(() => !withinSectionLimit(sectionCount.value))

const nodes = computed<TreeNode[]>(() =>
  sortByPosition(landStore.activeLand?.sections ?? []).map((s) => ({
    id: s.id,
    label: getSectionTitle(s) || (sectionLabelMap[s.type] ?? s.type),
    icon: sectionIconMap[s.type],
    locked: s.type === 'header' || s.type === 'footer',
  }))
)

function handleTreeSettings(node: TreeNode) {
  const section = landStore.activeLand?.sections.find(s => s.id === node.id)
  if (section) editorStore.setActiveSection(section, true)
}

function handleReorder(oldIndex: number, newIndex: number) {
  if (oldIndex === newIndex) return
  const sorted = sortByPosition(landStore.activeLand?.sections ?? [])
  const moved = sorted[oldIndex]
  if (!moved || moved.type === 'header' || moved.type === 'footer') return
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
  showSections.value = false
}

// ─── Design ───
const presets = Object.values(THEME_PRESET_DEFINITIONS)

const activeColorSlots = computed(() => {
  const preset = themeStore.theme?.theme_preset ?? 'minimal'
  return THEME_PRESET_DEFINITIONS[preset].colorSlots
})

const activePairings = computed(() => {
  const preset = themeStore.theme?.theme_preset ?? 'minimal'
  return THEME_PRESET_DEFINITIONS[preset].pairings
})
</script>

<template>
  <!-- Section settings bottom sheet (Teleport'd — guarded by isMobile to avoid desktop conflict) -->
  <Teleport to="body">
    <Transition name="mobile-sheet">
      <div
        v-if="isMobile && editorStore.showSectionSettings && editorStore.activeSection"
        class="fixed inset-0 z-50 flex flex-col justify-end"
      >
        <div
          class="absolute inset-0 bg-black/40"
          @click="editorStore.showSectionSettings = false; editorStore.setActiveSection(null)"
        />
        <div class="relative bg-white rounded-t-2xl flex flex-col overflow-hidden" style="max-height: 60vh">
          <div class="flex justify-center pt-3 pb-1 shrink-0">
            <div class="h-1 w-10 rounded-full bg-gray-300" />
          </div>
          <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200 shrink-0">
            <Transition name="modal-title" mode="out-in">
              <h2 :key="isSubItemEditing ? 'item' : 'section'" class="text-sm font-semibold text-gray-900">
                {{ (sectionLabelMap[editorStore.activeSection.type] ?? editorStore.activeSection.type) + (isSubItemEditing ? ' item' : '') }}
              </h2>
            </Transition>
            <div class="flex items-center gap-1">
              <template v-if="isSubItemEditing">
                <BaseButton variant="outline" size="xs" @click="sectionSettingsRef?.cancelSubItem">Cancel</BaseButton>
                <BaseButton variant="solid" size="xs" @click="sectionSettingsRef?.saveSubItem">Save</BaseButton>
              </template>
              <template v-else>
                <BaseButton variant="outline" size="xs" @click="editorStore.showSectionSettings = false; editorStore.setActiveSection(null)">Done</BaseButton>
              </template>
            </div>
          </div>
          <div class="overflow-y-auto flex-1">
            <SectionSettingsModal
              ref="sectionSettingsRef"
              :section="editorStore.activeSection"
              :hide-header="true"
              @close="editorStore.showSectionSettings = false; editorStore.setActiveSection(null)"
              @editing-change="isSubItemEditing = $event"
            />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- All visible content wrapped so lg:hidden applies correctly (fragment workaround) -->
  <div class="lg:hidden">

  <!-- Add section sheet -->
  <SectionsModal v-if="showSections" @close="showSections = false" @select="handleAddSection($event)" />

  <!-- Expanded tab sheet (slides up above the tab bar) -->
  <Transition name="mobile-sheet">
    <div
      v-if="activeTab"
      class="fixed left-0 right-0 bottom-16 z-40 bg-white rounded-t-2xl shadow-xl flex flex-col overflow-hidden"
      style="max-height: 65vh"
    >
      <!-- Handle -->
      <div class="flex justify-center pt-3 pb-1 shrink-0">
        <div class="h-1 w-10 rounded-full bg-gray-300" />
      </div>

      <!-- Content tab -->
      <div v-if="activeTab === 'content'" class="overflow-y-auto flex-1 px-4 pb-4 pt-2 flex flex-col gap-3">
        <BaseTree
          :nodes="nodes"
          @settings="handleTreeSettings"
          @delete="deleteSection($event.id)"
          @duplicate="duplicateSection($event.id)"
          @reorder="handleReorder"
        />
        <BaseButton variant="outline" size="sm" :disabled="atMaxSections" @click="showSections = true">
          {{ atMaxSections ? `Max ${maxSections + 2} sections reached` : '+ Add Section' }}
        </BaseButton>
        <div v-if="atMaxSections && !isPaid" class="rounded-xl border border-gray-200 p-3 flex flex-col gap-2 text-center items-center">
          <p class="text-xs text-gray-500 leading-relaxed">Upgrade to Pro for unlimited sections.</p>
          <BaseButton size="sm" variant="solid" class="w-full justify-center">Upgrade to Pro</BaseButton>
        </div>
      </div>

      <!-- Design tab -->
      <div v-else-if="activeTab === 'design'" class="overflow-y-auto flex-1 px-4 pb-4 pt-2 flex flex-col gap-5">
        <!-- Theme presets -->
        <div>
          <div class="flex items-center gap-2 mb-2">
            <SparklesIcon class="h-3.5 w-3.5 text-gray-400" />
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Theme</p>
          </div>
          <div class="flex flex-col gap-2">
            <button
              v-for="preset in presets"
              :key="preset.label"
              class="flex items-start gap-3 p-3 rounded-xl border transition-colors text-left"
              :class="themeStore.theme?.theme_preset === preset.defaults.theme_preset
                ? 'border-gray-900 bg-gray-50'
                : 'border-gray-200 hover:border-gray-300'"
              @click="updateTheme(preset.defaults)"
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
        </div>

        <!-- Colors -->
        <div>
          <div class="flex items-center gap-2 mb-2">
            <EyeDropperIcon class="h-3.5 w-3.5 text-gray-400" />
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Colors</p>
          </div>
          <div class="divide-y divide-gray-100 rounded-xl border border-gray-100 overflow-hidden">
            <BaseColorInput
              v-for="slot in activeColorSlots"
              :key="slot.key"
              :label="slot.label"
              :modelValue="themeStore.theme?.[slot.key] ?? '#000000'"
              @update:modelValue="updateTheme({ [slot.key]: $event })"
            />
          </div>
        </div>

        <!-- Typography -->
        <div>
          <div class="flex items-center gap-2 mb-2">
            <LanguageIcon class="h-3.5 w-3.5 text-gray-400" />
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Typography</p>
          </div>
          <div class="flex flex-col gap-1.5">
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
        </div>
      </div>
    </div>
  </Transition>

  <!-- Tab bar -->
  <div class="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex h-16">
    <button
      v-for="tab in (['content', 'design'] as Tab[])"
      :key="tab"
      class="flex-1 flex flex-col items-center justify-center gap-1 transition-colors"
      :class="activeTab === tab ? 'text-gray-900' : 'text-gray-400'"
      @click="toggleTab(tab)"
    >
      <component :is="tab === 'content' ? Squares2X2Icon : SwatchIcon" class="h-5 w-5" />
      <span class="text-xs font-medium capitalize">{{ tab }}</span>
    </button>
  </div>

  </div> <!-- end lg:hidden wrapper -->
</template>

<style scoped>
.mobile-sheet-enter-active,
.mobile-sheet-leave-active {
  transition: opacity 0.2s ease;
}
.mobile-sheet-enter-active > div:last-child,
.mobile-sheet-leave-active > div:last-child {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.mobile-sheet-enter-from,
.mobile-sheet-leave-to {
  opacity: 0;
}
.mobile-sheet-enter-from > div:last-child,
.mobile-sheet-leave-to > div:last-child {
  transform: translateY(100%);
}
</style>
