<script setup lang="ts">
import { computed, ref } from 'vue'
import InspectorSection from '../InspectorSection.vue'
import type { SectionBlock } from '@/types/designer'

const props = defineProps<{
  block: SectionBlock | null
}>()

// Collapsible sections state
const expandedSections = ref<Record<string, boolean>>({
  info: true,
  settings: false,
  desktop: false,
  tablet: false,
  mobile: false,
  children: false,
  full: false,
})

function toggleSection(key: string) {
  expandedSections.value[key] = !expandedSections.value[key]
}

// Extract desktop styles (base styles without tablet/mobile)
const desktopStyles = computed(() => {
  if (!props.block?.styles) return null
  const { tablet, mobile, ...desktop } = props.block.styles as Record<string, unknown>
  return desktop
})

// Extract tablet overrides
const tabletStyles = computed(() => {
  if (!props.block?.styles) return null
  return (props.block.styles as Record<string, unknown>).tablet || null
})

// Extract mobile overrides
const mobileStyles = computed(() => {
  if (!props.block?.styles) return null
  return (props.block.styles as Record<string, unknown>).mobile || null
})

// Format children for display (recursive)
function formatChildren(children: SectionBlock[] | undefined, depth = 0): object[] {
  if (!children || children.length === 0) return []
  return children.map(child => ({
    id: child.id,
    type: child.type,
    name: child.name,
    settings: child.settings,
    styles: {
      desktop: (() => {
        const { tablet, mobile, ...desktop } = (child.styles || {}) as Record<string, unknown>
        return desktop
      })(),
      tablet: (child.styles as Record<string, unknown>)?.tablet || null,
      mobile: (child.styles as Record<string, unknown>)?.mobile || null,
    },
    children: formatChildren(child.children, depth + 1),
  }))
}

const formattedChildren = computed(() => {
  return formatChildren(props.block?.children)
})

// Full block data for copy
const fullBlockData = computed(() => {
  if (!props.block) return null
  return {
    id: props.block.id,
    type: props.block.type,
    name: props.block.name,
    settings: props.block.settings,
    styles: {
      desktop: desktopStyles.value,
      tablet: tabletStyles.value,
      mobile: mobileStyles.value,
    },
    children: formattedChildren.value,
  }
})

// Copy to clipboard
function copyToClipboard(data: unknown) {
  navigator.clipboard.writeText(JSON.stringify(data, null, 2))
}

// Count non-null keys in object
function countKeys(obj: unknown): number {
  if (!obj || typeof obj !== 'object') return 0
  return Object.keys(obj).length
}

// Total children count (recursive)
function countAllChildren(children: SectionBlock[] | undefined): number {
  if (!children) return 0
  return children.reduce((count, child) => {
    return count + 1 + countAllChildren(child.children)
  }, 0)
}

const totalChildrenCount = computed(() => countAllChildren(props.block?.children))
</script>

<template>
  <InspectorSection title="Debug" icon="code">
    <div v-if="block" class="space-y-2">
      <!-- Quick Info (always visible) -->
      <div
        class="flex items-center justify-between text-xs cursor-pointer hover:bg-muted/50 -mx-3 px-3 py-1 rounded"
        @click="toggleSection('info')"
      >
        <span class="font-medium">Info</span>
        <i :class="expandedSections.info ? 'lni lni-chevron-down' : 'lni lni-chevron-right'" class="text-[10px] text-muted-foreground" />
      </div>
      <div v-if="expandedSections.info" class="space-y-1 pl-2 border-l-2 border-muted">
        <div class="flex items-center justify-between text-xs">
          <span class="text-muted-foreground">ID:</span>
          <code class="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono truncate max-w-[140px]" :title="block.id">{{ block.id }}</code>
        </div>
        <div class="flex items-center justify-between text-xs">
          <span class="text-muted-foreground">Type:</span>
          <code class="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">{{ block.type }}</code>
        </div>
        <div class="flex items-center justify-between text-xs">
          <span class="text-muted-foreground">Name:</span>
          <code class="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono truncate max-w-[140px]" :title="block.name">{{ block.name || '—' }}</code>
        </div>
        <div class="flex items-center justify-between text-xs">
          <span class="text-muted-foreground">Children:</span>
          <code class="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">{{ totalChildrenCount }}</code>
        </div>
      </div>

      <!-- Settings -->
      <div
        class="flex items-center justify-between text-xs cursor-pointer hover:bg-muted/50 -mx-3 px-3 py-1 rounded"
        @click="toggleSection('settings')"
      >
        <span class="font-medium">Settings</span>
        <div class="flex items-center gap-2">
          <span class="text-[10px] text-muted-foreground">{{ countKeys(block.settings) }} props</span>
          <i :class="expandedSections.settings ? 'lni lni-chevron-down' : 'lni lni-chevron-right'" class="text-[10px] text-muted-foreground" />
        </div>
      </div>
      <div v-if="expandedSections.settings" class="pl-2 border-l-2 border-muted">
        <pre class="p-2 bg-muted/50 rounded-md text-[10px] font-mono text-muted-foreground overflow-auto max-h-48 whitespace-pre-wrap break-all">{{ JSON.stringify(block.settings, null, 2) }}</pre>
      </div>

      <!-- Desktop Styles -->
      <div
        class="flex items-center justify-between text-xs cursor-pointer hover:bg-muted/50 -mx-3 px-3 py-1 rounded"
        @click="toggleSection('desktop')"
      >
        <span class="font-medium">
          <span class="inline-flex items-center gap-1.5">
            <i class="lni lni-display text-[10px]" />
            Desktop Styles
          </span>
        </span>
        <div class="flex items-center gap-2">
          <span class="text-[10px] text-muted-foreground">{{ countKeys(desktopStyles) }} props</span>
          <i :class="expandedSections.desktop ? 'lni lni-chevron-down' : 'lni lni-chevron-right'" class="text-[10px] text-muted-foreground" />
        </div>
      </div>
      <div v-if="expandedSections.desktop" class="pl-2 border-l-2 border-blue-500">
        <pre class="p-2 bg-muted/50 rounded-md text-[10px] font-mono text-muted-foreground overflow-auto max-h-48 whitespace-pre-wrap break-all">{{ JSON.stringify(desktopStyles, null, 2) }}</pre>
      </div>

      <!-- Tablet Styles -->
      <div
        class="flex items-center justify-between text-xs cursor-pointer hover:bg-muted/50 -mx-3 px-3 py-1 rounded"
        @click="toggleSection('tablet')"
      >
        <span class="font-medium">
          <span class="inline-flex items-center gap-1.5">
            <i class="lni lni-tablet text-[10px]" />
            Tablet Overrides
          </span>
        </span>
        <div class="flex items-center gap-2">
          <span v-if="tabletStyles" class="text-[10px] text-muted-foreground">{{ countKeys(tabletStyles) }} props</span>
          <span v-else class="text-[10px] text-muted-foreground/50">none</span>
          <i :class="expandedSections.tablet ? 'lni lni-chevron-down' : 'lni lni-chevron-right'" class="text-[10px] text-muted-foreground" />
        </div>
      </div>
      <div v-if="expandedSections.tablet" class="pl-2 border-l-2 border-purple-500">
        <pre v-if="tabletStyles" class="p-2 bg-muted/50 rounded-md text-[10px] font-mono text-muted-foreground overflow-auto max-h-48 whitespace-pre-wrap break-all">{{ JSON.stringify(tabletStyles, null, 2) }}</pre>
        <p v-else class="text-[10px] text-muted-foreground/50 py-2">No tablet overrides</p>
      </div>

      <!-- Mobile Styles -->
      <div
        class="flex items-center justify-between text-xs cursor-pointer hover:bg-muted/50 -mx-3 px-3 py-1 rounded"
        @click="toggleSection('mobile')"
      >
        <span class="font-medium">
          <span class="inline-flex items-center gap-1.5">
            <i class="lni lni-mobile text-[10px]" />
            Mobile Overrides
          </span>
        </span>
        <div class="flex items-center gap-2">
          <span v-if="mobileStyles" class="text-[10px] text-muted-foreground">{{ countKeys(mobileStyles) }} props</span>
          <span v-else class="text-[10px] text-muted-foreground/50">none</span>
          <i :class="expandedSections.mobile ? 'lni lni-chevron-down' : 'lni lni-chevron-right'" class="text-[10px] text-muted-foreground" />
        </div>
      </div>
      <div v-if="expandedSections.mobile" class="pl-2 border-l-2 border-orange-500">
        <pre v-if="mobileStyles" class="p-2 bg-muted/50 rounded-md text-[10px] font-mono text-muted-foreground overflow-auto max-h-48 whitespace-pre-wrap break-all">{{ JSON.stringify(mobileStyles, null, 2) }}</pre>
        <p v-else class="text-[10px] text-muted-foreground/50 py-2">No mobile overrides</p>
      </div>

      <!-- Children -->
      <div
        v-if="totalChildrenCount > 0"
        class="flex items-center justify-between text-xs cursor-pointer hover:bg-muted/50 -mx-3 px-3 py-1 rounded"
        @click="toggleSection('children')"
      >
        <span class="font-medium">Children</span>
        <div class="flex items-center gap-2">
          <span class="text-[10px] text-muted-foreground">{{ totalChildrenCount }} blocks</span>
          <i :class="expandedSections.children ? 'lni lni-chevron-down' : 'lni lni-chevron-right'" class="text-[10px] text-muted-foreground" />
        </div>
      </div>
      <div v-if="expandedSections.children && totalChildrenCount > 0" class="pl-2 border-l-2 border-green-500">
        <pre class="p-2 bg-muted/50 rounded-md text-[10px] font-mono text-muted-foreground overflow-auto max-h-64 whitespace-pre-wrap break-all">{{ JSON.stringify(formattedChildren, null, 2) }}</pre>
      </div>

      <!-- Full Data -->
      <div class="mt-3 pt-3 border-t border-border">
        <div
          class="flex items-center justify-between text-xs cursor-pointer hover:bg-muted/50 -mx-3 px-3 py-1 rounded"
          @click="toggleSection('full')"
        >
          <span class="font-medium">Full Block Data</span>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
              @click.stop="copyToClipboard(fullBlockData)"
            >
              Copy
            </button>
            <i :class="expandedSections.full ? 'lni lni-chevron-down' : 'lni lni-chevron-right'" class="text-[10px] text-muted-foreground" />
          </div>
        </div>
        <div v-if="expandedSections.full" class="mt-2">
          <pre class="p-2 bg-muted/50 rounded-md text-[10px] font-mono text-muted-foreground overflow-auto max-h-96 whitespace-pre-wrap break-all">{{ JSON.stringify(fullBlockData, null, 2) }}</pre>
        </div>
      </div>
    </div>
    <div v-else class="text-xs text-muted-foreground">
      No block selected
    </div>
  </InspectorSection>
</template>
