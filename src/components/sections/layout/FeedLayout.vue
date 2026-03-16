<script setup lang="ts">
import { computed, ref } from 'vue'
import { useLandStore } from '@/stores/land'
import { useEditorStore } from '@/stores/editor'
import { sortByPosition } from '@/lib/utils/position'
import type { Section, HeaderContent, HeaderSettings } from '@/types/section'
import SectionCollection from '@/components/sections/SectionCollection.vue'
import SectionList from '@/components/sections/SectionList.vue'
import SectionMonetize from '@/components/sections/SectionMonetize.vue'
import SectionStore from '@/components/sections/SectionStore.vue'
import SectionContentMedia from '@/components/sections/SectionContentMedia.vue'
import SectionFooter from '@/components/sections/SectionFooter.vue'

const landStore = useLandStore()
const editorStore = useEditorStore()

const sections = computed(() => sortByPosition(landStore.activeLand?.sections ?? []))

const headerSection = computed(() => sections.value.find(s => s.type === 'header'))
const footerSection = computed(() => sections.value.find(s => s.type === 'footer'))
const collectionSections = computed(() => sections.value.filter(s => s.type === 'collection'))
const listSections = computed(() => sections.value.filter(s => s.type === 'list'))
const monetizeSections = computed(() => sections.value.filter(s => s.type === 'monetize'))
const storeSections = computed(() => sections.value.filter(s => s.type === 'store'))
const contentMediaSections = computed(() => sections.value.filter(s => s.type === 'content_media'))

const headerContent = computed(() => headerSection.value?.content as HeaderContent | null)
const headerSettings = computed(() => headerSection.value?.settings_json as HeaderSettings | null)
const projectName = computed(() => landStore.activeLand?.title ?? '')

interface Tab { id: string; label: string; sections: Section[]; component: any }

const tabs = computed((): Tab[] => {
  const t: Tab[] = [{ id: 'feed', label: 'Feed', sections: collectionSections.value, component: SectionCollection }]
  if (listSections.value.length)         t.push({ id: 'links',        label: 'Links',        sections: listSections.value,         component: SectionList })
  if (monetizeSections.value.length)     t.push({ id: 'subscription', label: 'Subscription', sections: monetizeSections.value,     component: SectionMonetize })
  if (storeSections.value.length)        t.push({ id: 'store',        label: 'Store',        sections: storeSections.value,        component: SectionStore })
  if (contentMediaSections.value.length) t.push({ id: 'about',        label: 'About',        sections: contentMediaSections.value, component: SectionContentMedia })
  return t
})

const activeTabId = ref('feed')
const activeTab = computed(() => tabs.value.find(t => t.id === activeTabId.value) ?? tabs.value[0])

function selectSection(section: Section) {
  editorStore.setActiveSection(section, true)
}
</script>

<template>
  <div style="font-family: var(--theme-font)">

    <!-- Hero -->
    <div
      class="relative overflow-hidden"
      style="height: 380px; background-color: var(--theme-accent)"
      :class="editorStore.isEditMode ? 'cursor-pointer' : ''"
      @click="editorStore.isEditMode && headerSection ? selectSection(headerSection) : undefined"
    >
      <!-- Cover image -->
      <img
        v-if="headerSettings?.cover_media_value"
        :src="headerSettings.cover_media_value"
        class="absolute inset-0 w-full h-full object-cover"
      />

      <!-- Dark gradient scrim -->
      <div class="absolute inset-0" style="background: linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.65) 100%)" />

      <!-- Edit overlay in edit mode -->
      <div
        v-if="editorStore.isEditMode"
        class="absolute inset-0 border-2 border-transparent hover:border-blue-300 transition-colors"
        :class="editorStore.activeSection?.id === headerSection?.id ? 'border-blue-500' : ''"
      />

      <!-- Content bottom-left -->
      <div class="absolute bottom-0 left-0 right-0 p-8 flex items-end justify-between">
        <div class="flex flex-col gap-2">
          <img v-if="headerContent?.logo" :src="headerContent.logo" class="h-8 w-auto object-contain object-left" style="filter: brightness(0) invert(1)" />
          <h1 class="text-4xl font-bold text-white leading-tight">{{ headerContent?.title || projectName }}</h1>
          <p v-if="headerContent?.subtitle" class="text-sm text-white opacity-70">{{ headerContent.subtitle }}</p>
        </div>
      </div>
    </div>

    <!-- Tab bar -->
    <div class="sticky top-0 z-10 border-b flex gap-0 px-6 overflow-x-auto" style="background: white; border-color: var(--theme-surface)">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="px-4 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors -mb-px"
        :style="activeTabId === tab.id
          ? { borderColor: 'var(--theme-accent)', color: 'var(--theme-accent)' }
          : { borderColor: 'transparent', color: 'var(--theme-main)', opacity: '0.5' }"
        @click="activeTabId = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Tab content -->
    <div>
      <template v-if="activeTab">
        <!-- Empty feed state -->
        <div
          v-if="activeTab.sections.length === 0"
          class="flex flex-col items-center justify-center py-24 gap-3"
        >
          <p class="text-sm" style="color: var(--theme-main); opacity: 0.4">No content yet in this tab</p>
        </div>

        <!-- Sections -->
        <template v-else>
          <div
            v-for="section in activeTab.sections"
            :key="section.id"
            class="relative"
            :class="editorStore.isEditMode ? 'cursor-pointer' : ''"
            @click="editorStore.isEditMode ? selectSection(section) : undefined"
          >
            <component :is="activeTab.component" :section="section" />

            <!-- Edit overlay -->
            <div
              v-if="editorStore.isEditMode"
              class="absolute inset-0 border-2 transition-colors pointer-events-none"
              :class="editorStore.activeSection?.id === section.id ? 'border-blue-500' : 'border-transparent hover:border-blue-200'"
            />
          </div>
        </template>
      </template>
    </div>

    <!-- Footer -->
    <div
      v-if="footerSection"
      class="relative"
      :class="editorStore.isEditMode ? 'cursor-pointer' : ''"
      @click="editorStore.isEditMode ? selectSection(footerSection) : undefined"
    >
      <SectionFooter :section="footerSection" />
      <div
        v-if="editorStore.isEditMode"
        class="absolute inset-0 border-2 transition-colors pointer-events-none"
        :class="editorStore.activeSection?.id === footerSection.id ? 'border-blue-500' : 'border-transparent hover:border-blue-200'"
      />
    </div>

  </div>
</template>
