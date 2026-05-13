<script setup lang="ts">
import { ref } from 'vue'
import { Squares2X2Icon, SwatchIcon } from '@heroicons/vue/24/outline'
import { useEditorStore } from '@/features/editor/stores/editor'
import { useIsMobile } from '@/shared/composables/useIsMobile'
import { useEditorPanel } from '@/features/editor/composables/useEditorPanel'
import { useSectionTree } from '@/features/editor/composables/useSectionTree'
import BaseButton from '@/shared/ui/BaseButton.vue'
import SectionSettingsModal from '@/features/editor/components/SectionSettings.vue'
import EditorPanel from '@/features/editor/components/panel/EditorPanel.vue'

type Tab = 'content' | 'design'

const editorStore = useEditorStore()
const { isMobile } = useIsMobile()
const { activeTab, setTab } = useEditorPanel()
const { sectionLabelMap } = useSectionTree()

const sheetOpen = ref(false)
const sectionSettingsRef = ref<InstanceType<typeof SectionSettingsModal> | null>(null)
const isSubItemEditing = ref(false)

function toggleTab(tab: Tab) {
  if (activeTab.value === tab && sheetOpen.value) {
    sheetOpen.value = false
  } else {
    setTab(tab)
    sheetOpen.value = true
  }
}
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

    <!-- Expanded tab sheet (slides up above the tab bar) -->
    <Transition name="mobile-sheet">
      <div
        v-if="sheetOpen"
        class="fixed left-0 right-0 bottom-16 z-40 bg-white rounded-t-2xl shadow-xl flex flex-col overflow-hidden"
        style="max-height: 65vh"
      >
        <div class="flex justify-center pt-3 pb-1 shrink-0">
          <div class="h-1 w-10 rounded-full bg-gray-300" />
        </div>
        <div class="overflow-y-auto flex-1 px-4 pb-4 pt-2">
          <EditorPanel />
        </div>
      </div>
    </Transition>

    <!-- Tab bar -->
    <div class="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex h-16">
      <button
        v-for="tab in (['content', 'design'] as Tab[])"
        :key="tab"
        class="flex-1 flex flex-col items-center justify-center gap-1 transition-colors"
        :class="activeTab === tab && sheetOpen ? 'text-gray-900' : 'text-gray-400'"
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
