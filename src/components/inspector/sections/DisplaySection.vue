<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import InspectorSection from '../InspectorSection.vue'
import InspectorField from '../InspectorField.vue'
import SegmentedControl from '../SegmentedControl.vue'
import SelectInput from '../SelectInput.vue'
import SliderInput from '../SliderInput.vue'
import SizeInput from '../SizeInput.vue'
import { Icon } from '@/components/ui'

const props = defineProps<{
  // Size
  width?: string
  height?: string
  // Layout
  direction?: string
  justify?: string
  align?: string
  gap?: string
  columns?: number
  rows?: number
  // Grid item span (for children of grid)
  columnSpan?: number
  rowSpan?: number
  maxColumns?: number
  // Flex child (for Stack/Container children)
  flexMode?: string
  flexValue?: string
  // Visibility flags
  hideDirection?: boolean
  hideLayout?: boolean
  isGrid?: boolean
  isGridChild?: boolean
  isFlexChild?: boolean
  // HTML Tag (for layout blocks)
  blockType?: string
  htmlTag?: string
}>()

const emit = defineEmits<{
  'update:width': [value: string]
  'update:height': [value: string]
  'update:direction': [value: string]
  'update:justify': [value: string]
  'update:align': [value: string]
  'update:gap': [value: string]
  'update:columns': [value: number]
  'update:rows': [value: number]
  'update:columnSpan': [value: number]
  'update:rowSpan': [value: number]
  'update:flexMode': [value: string]
  'update:flexValue': [value: string]
  'update:htmlTag': [value: string]
}>()

// Computed: is this a row direction flex layout?
const isRow = computed(() => props.direction === 'row')

// Flexbox justify-content options (main axis)
// Row: horizontal distribution | Column: vertical distribution
const flexJustifyOptions = computed(() => [
  { value: 'flex-start', label: isRow.value ? 'Left' : 'Top' },
  { value: 'center', label: 'Center' },
  { value: 'flex-end', label: isRow.value ? 'Right' : 'Bottom' },
  { value: 'space-between', label: 'Space Between' },
  { value: 'space-around', label: 'Space Around' },
  { value: 'space-evenly', label: 'Space Evenly' },
])

// Flexbox align-items options (cross axis)
// Row: vertical alignment | Column: horizontal alignment
const flexAlignOptions = computed(() => [
  { value: 'flex-start', label: isRow.value ? 'Top' : 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'flex-end', label: isRow.value ? 'Bottom' : 'Right' },
  { value: 'stretch', label: 'Stretch' },
  { value: 'baseline', label: 'Baseline' },
])

// Grid justify-items options (horizontal alignment within cells)
const gridJustifyOptions = [
  { value: 'start', label: 'Start' },
  { value: 'center', label: 'Center' },
  { value: 'end', label: 'End' },
  { value: 'stretch', label: 'Stretch' },
]

// Grid align-items options (vertical alignment within cells)
const gridAlignOptions = [
  { value: 'start', label: 'Start' },
  { value: 'center', label: 'Center' },
  { value: 'end', label: 'End' },
  { value: 'stretch', label: 'Stretch' },
  { value: 'baseline', label: 'Baseline' },
]

// Use appropriate options based on layout type
const justifyOptions = computed(() => props.isGrid ? gridJustifyOptions : flexJustifyOptions.value)
const alignOptions = computed(() => props.isGrid ? gridAlignOptions : flexAlignOptions.value)

// Labels change based on context
const justifyLabel = computed(() => {
  if (props.isGrid) return 'Justify Items'
  return isRow.value ? 'Justify' : 'Justify'
})

const alignLabel = computed(() => {
  if (props.isGrid) return 'Align Items'
  return isRow.value ? 'Align' : 'Align'
})

// Default values
const defaultJustify = computed(() => props.isGrid ? 'stretch' : 'flex-start')
const defaultAlign = computed(() => props.isGrid ? 'stretch' : 'stretch')

// Flex mode options (for children of Stack/Container)
const flexModeOptions = [
  { value: 'auto', label: 'AUTO' },
  { value: 'grow', label: 'GROW' },
  { value: 'shrink', label: 'SHRINK' },
]

// Flex dropdown state
const isFlexDropdownOpen = ref(false)
const flexDropdownRef = ref<HTMLElement | null>(null)

function selectFlexMode(mode: string) {
  emit('update:flexMode', mode)
  isFlexDropdownOpen.value = false
}

function handleFlexClickOutside(event: MouseEvent) {
  if (flexDropdownRef.value && !flexDropdownRef.value.contains(event.target as Node)) {
    isFlexDropdownOpen.value = false
  }
}

function handleFlexKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    event.preventDefault()
    const currentNum = parseFloat(props.flexValue || '1') || 1
    const step = event.shiftKey ? 1 : 0.1
    const newNum = event.key === 'ArrowUp' ? currentNum + step : currentNum - step
    const finalNum = Math.max(0, Math.round(newNum * 10) / 10)
    emit('update:flexValue', String(finalNum))
  }
}

onMounted(() => {
  document.addEventListener('click', handleFlexClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleFlexClickOutside)
})

// HTML Tag options
const containerHtmlTagOptions = [
  { value: 'section', label: 'Section' },
  { value: 'div', label: 'Div' },
]

const layoutHtmlTagOptions = [
  { value: 'div', label: 'Div' },
  { value: 'header', label: 'Header' },
  { value: 'nav', label: 'Nav' },
  { value: 'footer', label: 'Footer' },
  { value: 'article', label: 'Article' },
]

const showHtmlTag = computed(() => ['container', 'stack', 'grid'].includes(props.blockType || ''))
const htmlTagOptions = computed(() => props.blockType === 'container' ? containerHtmlTagOptions : layoutHtmlTagOptions)
const defaultHtmlTag = computed(() => props.blockType === 'container' ? 'section' : 'div')
</script>

<template>
  <InspectorSection title="Display" icon="style-row">
    <!-- Size -->
    <InspectorField label="Width" horizontal>
      <SizeInput
        :model-value="width || ''"
        placeholder="auto"
        @update:model-value="emit('update:width', $event)"
      />
    </InspectorField>
    <InspectorField label="Height" horizontal>
      <SizeInput
        :model-value="height || ''"
        placeholder="auto"
        @update:model-value="emit('update:height', $event)"
      />
    </InspectorField>

    <!-- Grid child span (for blocks inside a grid) -->
    <template v-if="isGridChild">
      <InspectorField label="Span Column" horizontal>
        <SliderInput
          :model-value="String(columnSpan || 1)"
          :min="1"
          :max="maxColumns || 12"
          :step="1"
          unit=""
          @update:model-value="emit('update:columnSpan', Number($event))"
        />
      </InspectorField>
      <InspectorField label="Span Row" horizontal>
        <SliderInput
          :model-value="String(rowSpan || 1)"
          :min="1"
          :max="6"
          :step="1"
          unit=""
          @update:model-value="emit('update:rowSpan', Number($event))"
        />
      </InspectorField>
    </template>

    <!-- Flex child (for blocks inside Stack/Container) -->
    <InspectorField v-if="isFlexChild" label="Flex" horizontal>
      <div ref="flexDropdownRef" class="flex max-w-30">
        <!-- Number input -->
        <input
          type="text"
          inputmode="decimal"
          :value="flexValue || '1'"
          placeholder="1"
          class="flex-1 min-w-0 px-2.5 py-1.5 text-xs bg-sidebar-accent border border-sidebar-border rounded-l-lg text-sidebar-foreground placeholder:text-sidebar-foreground/50 focus:outline-none focus:ring-1 focus:ring-sidebar-ring/25 transition-colors"
          @input="emit('update:flexValue', ($event.target as HTMLInputElement).value)"
          @keydown="handleFlexKeydown"
        />

        <!-- Mode dropdown trigger -->
        <div class="relative">
          <button
            type="button"
            class="h-full flex items-center gap-1 px-2 border border-l-0 border-sidebar-border bg-sidebar-accent hover:bg-sidebar-accent/75 text-sidebar-foreground font-mono uppercase text-[10px] rounded-r-lg transition-colors cursor-pointer"
            @click.stop="isFlexDropdownOpen = !isFlexDropdownOpen"
          >
            <span>{{ (flexMode || 'auto').toUpperCase() }}</span>
            <Icon
              name="chevron-down"
              :size="8"
              class="transition-transform"
              :class="{ 'rotate-180': isFlexDropdownOpen }"
            />
          </button>

          <!-- Dropdown menu -->
          <Transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            <div
              v-if="isFlexDropdownOpen"
              class="absolute top-full right-0 mt-1 min-w-16 bg-sidebar-background backdrop-blur-sm p-1 border border-sidebar-border rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto origin-top-right"
            >
              <button
                v-for="opt in flexModeOptions"
                :key="opt.value"
                type="button"
                class="w-full flex items-center px-2.5 py-1.5 text-xs font-mono rounded-md transition-colors cursor-pointer text-left"
                :class="[
                  opt.value === (flexMode || 'auto')
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent'
                ]"
                @click="selectFlexMode(opt.value)"
              >
                {{ opt.label }}
              </button>
            </div>
          </Transition>
        </div>
      </div>
    </InspectorField>

    <!-- Layout (only for layout blocks) -->
    <template v-if="!hideLayout">
      <InspectorField v-if="!hideDirection" label="Direction" horizontal>
        <SegmentedControl
          :options="[
            { value: 'column', label: 'Column', icon: 'style-column' },
            { value: 'row', label: 'Row', icon: 'style-row' },
          ]"
          :model-value="direction || 'column'"
          icon-only
          @update:model-value="emit('update:direction', $event)"
        />
      </InspectorField>
      <InspectorField :label="justifyLabel" horizontal>
        <SelectInput
          :options="justifyOptions"
          :model-value="justify || defaultJustify"
          @update:model-value="emit('update:justify', $event)"
        />
      </InspectorField>
      <InspectorField :label="alignLabel" horizontal>
        <SelectInput
          :options="alignOptions"
          :model-value="align || defaultAlign"
          @update:model-value="emit('update:align', $event)"
        />
      </InspectorField>
      <!-- Grid-specific: Columns and Rows -->
      <template v-if="isGrid">
        <InspectorField label="Columns" horizontal>
          <SliderInput
            :model-value="String(columns || 2)"
            :min="1"
            :max="12"
            :step="1"
            unit=""
            @update:model-value="emit('update:columns', Number($event))"
          />
        </InspectorField>
        <InspectorField label="Rows" horizontal>
          <SliderInput
            :model-value="String(rows || 2)"
            :min="1"
            :max="12"
            :step="1"
            unit=""
            @update:model-value="emit('update:rows', Number($event))"
          />
        </InspectorField>
      </template>
      <InspectorField label="Gap" horizontal>
        <SizeInput
          :model-value="gap"
          placeholder="16px"
          @update:model-value="emit('update:gap', $event)"
        />
      </InspectorField>
    </template>

    <!-- HTML Tag Type (for layout blocks) -->
    <InspectorField v-if="showHtmlTag" label="Type" horizontal>
      <SelectInput
        :model-value="htmlTag || defaultHtmlTag"
        :options="htmlTagOptions"
        @update:model-value="emit('update:htmlTag', $event)"
      />
    </InspectorField>
  </InspectorSection>
</template>
