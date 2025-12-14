<script setup lang="ts">
import { computed, ref, watch, onUnmounted } from 'vue'
import { useEditorStore } from '@/stores/editor'
import { Icon } from '@/components/ui'
import InspectorSection from './InspectorSection.vue'
import InspectorField from './InspectorField.vue'
import TextInput from './TextInput.vue'
import SelectInput from './SelectInput.vue'
import SegmentedControl from './SegmentedControl.vue'
import SliderInput from './SliderInput.vue'
import ColorInput from './ColorInput.vue'
import type {
  InteractionTrigger,
  InteractionEffect,
  InteractionEasing,
  InteractionStyles,
  BorderStyle,
  ScrollAnimationConfig,
} from '@/types/editor'

const props = defineProps<{
  interactionId?: string  // Existing interaction to edit
  triggerBlockId: string  // Block that triggers the interaction
}>()

const emit = defineEmits<{
  close: []
  created: [interactionId: string]
}>()

const editorStore = useEditorStore()

// Form state
const name = ref('')
const trigger = ref<InteractionTrigger>('hover')
const targetBlockIds = ref<string[]>([])
const effectType = ref<InteractionEffect>('transition')
const duration = ref('300')
const easing = ref<InteractionEasing>('ease')
const delay = ref('0')
const styles = ref<InteractionStyles>({})
const fromStyles = ref<InteractionStyles>({})
const scrollConfig = ref<ScrollAnimationConfig>({ startOffset: 0, endOffset: 100 })
const isAddStyleMenuOpen = ref(false)

// From/To toggle for styles section
const styleMode = ref<'from' | 'to'>('to')

// Check if current trigger is scroll-based
const isScrollTrigger = computed(() =>
  trigger.value === 'while-scrolling' || trigger.value === 'page-scroll'
)

// Get the first target block and its styles (for "From" section)
// Note: For multi-target, From styles apply to all targets uniformly
const targetBlock = computed(() => {
  if (!targetBlockIds.value.length) return null
  return editorStore.findBlockById(targetBlockIds.value[0]!)
})

const targetBlockStyles = computed(() => {
  if (!targetBlock.value) return {}
  return targetBlock.value.styles || {}
})

// Update target block styles (for "From" changes) - applies to all targets
function updateTargetBlockStyle(key: string, value: unknown) {
  if (!targetBlockIds.value.length) return
  // Update all target blocks
  for (const blockId of targetBlockIds.value) {
    editorStore.updateBlockStyles(blockId, { [key]: value })
  }
}

// Get a specific style value from the target block
function getTargetBlockStyleValue(key: string): unknown {
  const styles = targetBlockStyles.value as Record<string, unknown>
  return styles[key]
}

// Get the "from" style value - uses fromStyles for scroll triggers, target block styles otherwise
function getFromStyleValue(key: string): unknown {
  if (isScrollTrigger.value) {
    return (fromStyles.value as Record<string, unknown>)[key]
  }
  return getTargetBlockStyleValue(key)
}

// Update the "from" style - uses fromStyles for scroll triggers, target block styles otherwise
function handleFromStyleUpdate(key: string, value: unknown) {
  if (isScrollTrigger.value) {
    updateFromStyle(key as keyof InteractionStyles, value)
  } else {
    updateTargetBlockStyle(key, value)
  }
}

// Load existing interaction data
const existingInteraction = computed(() => {
  if (!props.interactionId) return null
  return editorStore.getInteractionById(props.interactionId)
})

// Initialize form with existing data or defaults
watch(existingInteraction, (interaction) => {
  if (interaction) {
    name.value = interaction.name
    trigger.value = interaction.trigger
    targetBlockIds.value = [...interaction.targetBlockIds]
    effectType.value = interaction.effectType
    duration.value = interaction.duration.replace('ms', '')
    easing.value = interaction.easing
    delay.value = interaction.delay?.replace('ms', '') || '0'
    styles.value = { ...interaction.styles }
    fromStyles.value = interaction.fromStyles ? { ...interaction.fromStyles } : {}
    scrollConfig.value = interaction.scrollConfig
      ? { ...interaction.scrollConfig }
      : { startOffset: 0, endOffset: 100 }
  } else {
    // Defaults for new interaction
    name.value = 'New Interaction'
    trigger.value = 'hover'
    targetBlockIds.value = [props.triggerBlockId] // Default to same block
    effectType.value = 'transition'
    duration.value = '300'
    easing.value = 'ease'
    delay.value = '0'
    styles.value = {}
    fromStyles.value = {}
    scrollConfig.value = { startOffset: 0, endOffset: 100 }
  }
}, { immediate: true })

// Trigger options - using exact icons as specified
const triggerOptions = [
  { value: 'hover', label: 'Hover', icon: 'app-hover' },
  { value: 'click', label: 'Click', icon: 'app-pressed' },
  { value: 'load', label: 'Page Load', icon: 'style-page-load' },
  { value: 'appear', label: 'Appear', icon: 'app-show' },
  { value: 'while-scrolling', label: 'While Scrolling', icon: 'scroll-down' },
  { value: 'page-scroll', label: 'Page Scroll', icon: 'layers-1' },
]

// Effect type options
const effectTypeOptions = [
  { value: 'transition', label: 'Transition' },
  { value: 'animation', label: 'Animation' },
]

// Easing options
const easingOptions = [
  { value: 'linear', label: 'Linear' },
  { value: 'ease', label: 'Ease' },
  { value: 'ease-in', label: 'Ease In' },
  { value: 'ease-out', label: 'Ease Out' },
  { value: 'ease-in-out', label: 'Ease In Out' },
  { value: 'spring', label: 'Spring' },
]

// Active style sections (what user has chosen to configure)
const activeStyleSections = ref<string[]>([])

// Available style sections to add
const availableStyleSections = [
  { id: 'size', label: 'Size', icon: 'rulers' },
  { id: 'border', label: 'Border', icon: 'style-border-top' },
  { id: 'opacity', label: 'Opacity', icon: 'app-show' },
  { id: 'transform', label: 'Transform', icon: 'style-animation' },
]

// Add a style section
function addStyleSection(sectionId: string) {
  if (!activeStyleSections.value.includes(sectionId)) {
    activeStyleSections.value.push(sectionId)
  }
}

// Remove a style section
function removeStyleSection(sectionId: string) {
  const index = activeStyleSections.value.indexOf(sectionId)
  if (index !== -1) {
    activeStyleSections.value.splice(index, 1)
    // Also remove the related style properties
    const newStyles = { ...styles.value }
    switch (sectionId) {
      case 'size':
        delete newStyles.width
        delete newStyles.height
        break
      case 'border':
        delete newStyles.border
        break
      case 'opacity':
        delete newStyles.opacity
        break
      case 'transform':
        delete newStyles.scale
        delete newStyles.rotate
        delete newStyles.blur
        delete newStyles.translateX
        delete newStyles.translateY
        break
    }
    styles.value = newStyles
  }
}

// Update style property (to styles)
function updateStyle(key: keyof InteractionStyles, value: unknown) {
  styles.value = { ...styles.value, [key]: value }
}

// Update from style property (for scroll animations)
function updateFromStyle(key: keyof InteractionStyles, value: unknown) {
  fromStyles.value = { ...fromStyles.value, [key]: value }
}

// Update scroll config
function updateScrollConfig(key: keyof ScrollAnimationConfig, value: number) {
  scrollConfig.value = { ...scrollConfig.value, [key]: value }
}

// Preview the interaction animation on all targets
function handlePreview() {
  if (!targetBlockIds.value.length || Object.keys(styles.value).length === 0) return
  // Preview on all target blocks
  for (const blockId of targetBlockIds.value) {
    editorStore.previewInteractionStyles(
      blockId,
      styles.value,
      `${duration.value}ms`,
      easing.value,
      delay.value ? `${delay.value}ms` : undefined
    )
  }
}

// Save interaction (create or update) - exposed for parent to call
function save() {
  // Build scroll-specific fields only for scroll triggers
  const scrollFields = isScrollTrigger.value
    ? {
        scrollConfig: scrollConfig.value,
        fromStyles: Object.keys(fromStyles.value).length > 0 ? fromStyles.value : undefined,
      }
    : {}

  if (props.interactionId) {
    // Update existing
    editorStore.updateInteraction(props.interactionId, {
      name: name.value,
      trigger: trigger.value,
      targetBlockIds: targetBlockIds.value,
      effectType: effectType.value,
      duration: `${duration.value}ms`,
      easing: easing.value,
      delay: delay.value ? `${delay.value}ms` : undefined,
      styles: styles.value,
      ...scrollFields,
    })
    emit('close')
  } else {
    // Create new
    const newInteraction = editorStore.createInteraction({
      name: name.value,
      trigger: trigger.value,
      triggerBlockId: props.triggerBlockId,
      targetBlockIds: targetBlockIds.value,
      effectType: effectType.value,
      duration: `${duration.value}ms`,
      easing: easing.value,
      delay: delay.value ? `${delay.value}ms` : undefined,
      styles: styles.value,
      ...scrollFields,
    })
    if (newInteraction) {
      emit('created', newInteraction.id)
    }
    emit('close')
  }
}

// Expose save method for parent to call
defineExpose({ save })

// Initialize active sections from existing styles
watch(existingInteraction, (interaction) => {
  if (interaction) {
    const sections: string[] = []
    if (interaction.styles.width || interaction.styles.height) sections.push('size')
    if (interaction.styles.border) sections.push('border')
    if (interaction.styles.opacity !== undefined) sections.push('opacity')
    if (interaction.styles.scale || interaction.styles.rotate || interaction.styles.blur || interaction.styles.translateX || interaction.styles.translateY) {
      sections.push('transform')
    }
    activeStyleSections.value = sections
  }
}, { immediate: true })

// ============================================
// TARGET BLOCK SELECTION MODE
// ============================================

const isSelectingTarget = ref(false)

// Start target selection mode - clicking blocks in preview will add them
function startTargetSelection() {
  isSelectingTarget.value = true
  editorStore.startInteractionTargetSelection((blockId: string) => {
    // Toggle the block in targets
    if (targetBlockIds.value.includes(blockId)) {
      // Already selected - remove it (but keep at least one)
      if (targetBlockIds.value.length > 1) {
        targetBlockIds.value = targetBlockIds.value.filter(id => id !== blockId)
      }
    } else {
      // Add to targets
      targetBlockIds.value = [...targetBlockIds.value, blockId]
    }
  })
}

// Stop target selection mode
function stopTargetSelection() {
  isSelectingTarget.value = false
  editorStore.stopInteractionTargetSelection()
}

// Remove a specific block from targets
function removeTargetBlock(blockId: string) {
  if (targetBlockIds.value.length > 1) {
    targetBlockIds.value = targetBlockIds.value.filter(id => id !== blockId)
  }
}

// Get block name for display
function getBlockName(blockId: string): string {
  const block = editorStore.findBlockById(blockId)
  return block?.name || 'Unknown Block'
}

// Cleanup on unmount - stop selection mode if active
onUnmounted(() => {
  if (isSelectingTarget.value) {
    stopTargetSelection()
  }
})
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Name Field (no section wrapper) -->
    <div class="px-4 py-3 border-b border-sidebar-border">
      <InspectorField label="Name">
        <TextInput
          v-model="name"
          placeholder="Interaction name"
        />
      </InspectorField>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto">
      <!-- Trigger Section -->
      <InspectorSection title="When" icon="style-when">
        <InspectorField label="Trigger">
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="option in triggerOptions"
              :key="option.value"
              type="button"
              class="flex flex-col items-center gap-1.5 px-2 py-2.5 text-[10px] rounded-lg border transition-colors"
              :class="trigger === option.value
                ? 'border-violet-500 bg-violet-500/10 text-violet-600 dark:text-violet-400'
                : 'border-border hover:bg-muted/50 text-muted-foreground'"
              @click="trigger = option.value as InteractionTrigger"
            >
              <Icon :name="option.icon" :size="16" />
              <span class="leading-tight text-center">{{ option.label }}</span>
            </button>
          </div>
        </InspectorField>

        <!-- Scroll Range (only for scroll triggers) -->
        <template v-if="isScrollTrigger">
          <div class="mt-3 pt-3 border-t border-border/50">
            <p class="text-[10px] text-muted-foreground mb-3">
              {{ trigger === 'while-scrolling'
                ? 'Animates based on element position in viewport'
                : 'Animates based on page scroll position' }}
            </p>
            <InspectorField label="Start" horizontal>
              <SliderInput
                :model-value="String(scrollConfig.startOffset || 0)"
                :min="0"
                :max="100"
                :step="5"
                unit="%"
                @update:model-value="updateScrollConfig('startOffset', Number($event))"
              />
            </InspectorField>
            <InspectorField label="End" horizontal>
              <SliderInput
                :model-value="String(scrollConfig.endOffset || 100)"
                :min="0"
                :max="100"
                :step="5"
                unit="%"
                @update:model-value="updateScrollConfig('endOffset', Number($event))"
              />
            </InspectorField>
          </div>
        </template>
      </InspectorSection>

      <!-- Target Section -->
      <InspectorSection title="Applied to" icon="style-applied-to">
        <!-- Selected target blocks list -->
        <div v-if="targetBlockIds.length > 0" class="space-y-1.5 mb-3">
          <div
            v-for="blockId in targetBlockIds"
            :key="blockId"
            class="flex items-center gap-2 px-2.5 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-lg group"
          >
            <Icon name="cube" :size="12" class="text-violet-500 shrink-0" />
            <span class="flex-1 text-xs text-foreground truncate">{{ getBlockName(blockId) }}</span>
            <button
              v-if="targetBlockIds.length > 1"
              type="button"
              class="p-0.5 rounded hover:bg-destructive/20 opacity-0 group-hover:opacity-100 transition-opacity"
              @click="removeTargetBlock(blockId)"
            >
              <Icon name="xmark" :size="10" class="text-muted-foreground hover:text-destructive" />
            </button>
          </div>
        </div>

        <!-- Selection mode button -->
        <button
          type="button"
          class="w-full flex items-center justify-center gap-2 py-2 text-xs border border-dashed rounded-lg transition-colors"
          :class="isSelectingTarget
            ? 'text-violet-500 border-violet-500 bg-violet-500/10'
            : 'text-muted-foreground border-border hover:border-violet-500/50 hover:text-violet-500'"
          @click="isSelectingTarget ? stopTargetSelection() : startTargetSelection()"
        >
          <Icon :name="isSelectingTarget ? 'checkmark' : 'plus'" :size="12" />
          <span>{{ isSelectingTarget ? 'Done selecting' : 'Select a block to target' }}</span>
        </button>

        <p v-if="isSelectingTarget" class="text-[10px] text-violet-500 mt-2 text-center">
          Click on blocks in the preview to add or remove them
        </p>
      </InspectorSection>

      <!-- Effect Section -->
      <InspectorSection title="Effect" icon="style-effect">
        <InspectorField label="Type" horizontal>
          <SegmentedControl
            :options="effectTypeOptions"
            :model-value="effectType"
            @update:model-value="effectType = $event as InteractionEffect"
          />
        </InspectorField>
        <InspectorField label="Duration" horizontal>
          <SliderInput
            :model-value="duration"
            :min="0"
            :max="2000"
            :step="50"
            unit="ms"
            @update:model-value="duration = $event"
          />
        </InspectorField>
        <InspectorField label="Easing" horizontal>
          <SelectInput
            :options="easingOptions"
            :model-value="easing"
            @update:model-value="easing = $event as InteractionEasing"
          />
        </InspectorField>
        <InspectorField label="Delay" horizontal>
          <SliderInput
            :model-value="delay"
            :min="0"
            :max="1000"
            :step="50"
            unit="ms"
            @update:model-value="delay = $event"
          />
        </InspectorField>
      </InspectorSection>

      <!-- Styles Section -->
      <InspectorSection title="Styles" icon="style-color">
        <!-- From/To Toggle -->
        <div class="mb-3">
          <SegmentedControl
            :options="[
              { value: 'from', label: 'From' },
              { value: 'to', label: 'To' },
            ]"
            :model-value="styleMode"
            @update:model-value="styleMode = $event as 'from' | 'to'"
          />
        </div>

        <!-- FROM: Starting styles (scroll triggers use fromStyles, others use target block styles) -->
        <template v-if="styleMode === 'from'">
          <div v-if="!targetBlockIds.length" class="text-xs text-muted-foreground text-center py-4">
            Select target blocks first
          </div>
          <div v-else-if="activeStyleSections.length === 0" class="text-xs text-muted-foreground text-center py-4">
            Add style properties below to configure the starting state
          </div>
          <div v-else class="space-y-3">
            <!-- Info text for scroll triggers -->
            <p v-if="isScrollTrigger" class="text-[10px] text-muted-foreground -mt-1 mb-2">
              Starting styles at {{ scrollConfig.startOffset }}% scroll position
            </p>

            <!-- Size -->
            <div v-if="activeStyleSections.includes('size')" class="space-y-2">
              <InspectorField label="Width" horizontal>
                <TextInput
                  :model-value="(getFromStyleValue('width') as string) || ''"
                  placeholder="auto"
                  @update:model-value="handleFromStyleUpdate('width', $event)"
                />
              </InspectorField>
              <InspectorField label="Height" horizontal>
                <TextInput
                  :model-value="(getFromStyleValue('height') as string) || ''"
                  placeholder="auto"
                  @update:model-value="handleFromStyleUpdate('height', $event)"
                />
              </InspectorField>
            </div>

            <!-- Border -->
            <div v-if="activeStyleSections.includes('border')" class="space-y-2">
              <InspectorField label="Width" horizontal>
                <TextInput
                  :model-value="(getFromStyleValue('border') as BorderStyle)?.width || ''"
                  placeholder="0px"
                  @update:model-value="handleFromStyleUpdate('border', { ...(getFromStyleValue('border') as BorderStyle || {}), width: $event })"
                />
              </InspectorField>
              <InspectorField label="Rounded" horizontal>
                <TextInput
                  :model-value="(getFromStyleValue('border') as BorderStyle)?.radius || ''"
                  placeholder="0px"
                  @update:model-value="handleFromStyleUpdate('border', { ...(getFromStyleValue('border') as BorderStyle || {}), radius: $event })"
                />
              </InspectorField>
              <InspectorField label="Color" horizontal>
                <ColorInput
                  :model-value="(getFromStyleValue('border') as BorderStyle)?.color || ''"
                  swatch-only
                  @update:model-value="handleFromStyleUpdate('border', { ...(getFromStyleValue('border') as BorderStyle || {}), color: $event })"
                />
              </InspectorField>
            </div>

            <!-- Opacity -->
            <div v-if="activeStyleSections.includes('opacity')">
              <InspectorField label="Opacity" horizontal>
                <SliderInput
                  :model-value="String(getFromStyleValue('opacity') || '100')"
                  :min="0"
                  :max="100"
                  :step="5"
                  unit="%"
                  @update:model-value="handleFromStyleUpdate('opacity', $event)"
                />
              </InspectorField>
            </div>

            <!-- Transform -->
            <div v-if="activeStyleSections.includes('transform')" class="space-y-2">
              <InspectorField label="Scale" horizontal>
                <SliderInput
                  :model-value="String(getFromStyleValue('scale') || '1')"
                  :min="0"
                  :max="2"
                  :step="0.05"
                  @update:model-value="handleFromStyleUpdate('scale', $event)"
                />
              </InspectorField>
              <InspectorField label="Rotate" horizontal>
                <SliderInput
                  :model-value="String(getFromStyleValue('rotate') || '0')"
                  :min="-180"
                  :max="180"
                  :step="5"
                  unit="deg"
                  @update:model-value="handleFromStyleUpdate('rotate', $event)"
                />
              </InspectorField>
              <InspectorField label="Translate X" horizontal>
                <SliderInput
                  :model-value="String(getFromStyleValue('translateX') || '0')"
                  :min="-200"
                  :max="200"
                  :step="5"
                  unit="px"
                  @update:model-value="handleFromStyleUpdate('translateX', $event)"
                />
              </InspectorField>
              <InspectorField label="Translate Y" horizontal>
                <SliderInput
                  :model-value="String(getFromStyleValue('translateY') || '0')"
                  :min="-200"
                  :max="200"
                  :step="5"
                  unit="px"
                  @update:model-value="handleFromStyleUpdate('translateY', $event)"
                />
              </InspectorField>
              <InspectorField label="Blur" horizontal>
                <SliderInput
                  :model-value="String(getFromStyleValue('blur') || '0')"
                  :min="0"
                  :max="20"
                  :step="1"
                  unit="px"
                  @update:model-value="handleFromStyleUpdate('blur', $event)"
                />
              </InspectorField>
            </div>
          </div>
        </template>

        <!-- TO: Interaction target styles -->
        <template v-else>
          <!-- Active style sections -->
          <div v-if="activeStyleSections.length > 0" class="space-y-3">
            <!-- Size -->
            <div v-if="activeStyleSections.includes('size')" class="relative space-y-2">
              <button
                type="button"
                class="absolute -top-1 -right-1 p-0.5 rounded bg-muted hover:bg-destructive/20 transition-colors z-10"
                @click="removeStyleSection('size')"
              >
                <Icon name="xmark" :size="10" class="text-muted-foreground" />
              </button>
              <InspectorField label="Width" horizontal>
                <TextInput
                  :model-value="styles.width || ''"
                  placeholder="auto"
                  @update:model-value="updateStyle('width', $event)"
                />
              </InspectorField>
              <InspectorField label="Height" horizontal>
                <TextInput
                  :model-value="styles.height || ''"
                  placeholder="auto"
                  @update:model-value="updateStyle('height', $event)"
                />
              </InspectorField>
            </div>

            <!-- Border -->
            <div v-if="activeStyleSections.includes('border')" class="relative space-y-2">
              <button
                type="button"
                class="absolute -top-1 -right-1 p-0.5 rounded bg-muted hover:bg-destructive/20 transition-colors z-10"
                @click="removeStyleSection('border')"
              >
                <Icon name="xmark" :size="10" class="text-muted-foreground" />
              </button>
              <InspectorField label="Width" horizontal>
                <TextInput
                  :model-value="styles.border?.width || ''"
                  placeholder="0px"
                  @update:model-value="updateStyle('border', { ...styles.border, width: $event })"
                />
              </InspectorField>
              <InspectorField label="Rounded" horizontal>
                <TextInput
                  :model-value="styles.border?.radius || ''"
                  placeholder="0px"
                  @update:model-value="updateStyle('border', { ...styles.border, radius: $event })"
                />
              </InspectorField>
              <InspectorField label="Color" horizontal>
                <ColorInput
                  :model-value="styles.border?.color || ''"
                  swatch-only
                  @update:model-value="updateStyle('border', { ...styles.border, color: $event })"
                />
              </InspectorField>
            </div>

            <!-- Opacity -->
            <div v-if="activeStyleSections.includes('opacity')" class="relative">
              <button
                type="button"
                class="absolute -top-1 -right-1 p-0.5 rounded bg-muted hover:bg-destructive/20 transition-colors z-10"
                @click="removeStyleSection('opacity')"
              >
                <Icon name="xmark" :size="10" class="text-muted-foreground" />
              </button>
              <InspectorField label="Opacity" horizontal>
                <SliderInput
                  :model-value="String(styles.opacity || '100')"
                  :min="0"
                  :max="100"
                  :step="5"
                  unit="%"
                  @update:model-value="updateStyle('opacity', $event)"
                />
              </InspectorField>
            </div>

            <!-- Transform -->
            <div v-if="activeStyleSections.includes('transform')" class="relative space-y-2">
              <button
                type="button"
                class="absolute -top-1 -right-1 p-0.5 rounded bg-muted hover:bg-destructive/20 transition-colors z-10"
                @click="removeStyleSection('transform')"
              >
                <Icon name="xmark" :size="10" class="text-muted-foreground" />
              </button>
              <InspectorField label="Scale" horizontal>
                <SliderInput
                  :model-value="styles.scale || '1'"
                  :min="0"
                  :max="2"
                  :step="0.05"
                  @update:model-value="updateStyle('scale', $event)"
                />
              </InspectorField>
              <InspectorField label="Rotate" horizontal>
                <SliderInput
                  :model-value="styles.rotate || '0'"
                  :min="-180"
                  :max="180"
                  :step="5"
                  unit="deg"
                  @update:model-value="updateStyle('rotate', $event)"
                />
              </InspectorField>
              <InspectorField label="Translate X" horizontal>
                <SliderInput
                  :model-value="styles.translateX || '0'"
                  :min="-200"
                  :max="200"
                  :step="5"
                  unit="px"
                  @update:model-value="updateStyle('translateX', $event)"
                />
              </InspectorField>
              <InspectorField label="Translate Y" horizontal>
                <SliderInput
                  :model-value="styles.translateY || '0'"
                  :min="-200"
                  :max="200"
                  :step="5"
                  unit="px"
                  @update:model-value="updateStyle('translateY', $event)"
                />
              </InspectorField>
              <InspectorField label="Blur" horizontal>
                <SliderInput
                  :model-value="styles.blur || '0'"
                  :min="0"
                  :max="20"
                  :step="1"
                  unit="px"
                  @update:model-value="updateStyle('blur', $event)"
                />
              </InspectorField>
            </div>
          </div>
        </template>

        <!-- Add style property button (shown in both modes) -->
        <div class="mt-3">
          <div class="relative">
            <button
              type="button"
              class="w-full flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground hover:text-violet-500 border border-dashed border-border hover:border-violet-500/50 rounded-lg transition-colors"
              @click="isAddStyleMenuOpen = !isAddStyleMenuOpen"
            >
              <Icon name="plus" :size="12" />
              <span>Add style property</span>
            </button>

            <!-- Style property menu -->
            <Transition
              enter-active-class="transition duration-100 ease-out"
              enter-from-class="opacity-0 scale-95"
              enter-to-class="opacity-100 scale-100"
              leave-active-class="transition duration-75 ease-in"
              leave-from-class="opacity-100 scale-100"
              leave-to-class="opacity-0 scale-95"
            >
              <div
                v-if="isAddStyleMenuOpen"
                class="absolute z-50 bottom-full left-0 right-0 mb-1 bg-popover border border-border rounded-lg shadow-lg overflow-hidden"
              >
                <button
                  v-for="section in availableStyleSections.filter(s => !activeStyleSections.includes(s.id))"
                  :key="section.id"
                  type="button"
                  class="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-muted/50 transition-colors text-left"
                  @click="addStyleSection(section.id); isAddStyleMenuOpen = false"
                >
                  <Icon :name="section.icon" :size="12" class="text-muted-foreground" />
                  <span>{{ section.label }}</span>
                </button>
                <div
                  v-if="availableStyleSections.filter(s => !activeStyleSections.includes(s.id)).length === 0"
                  class="px-3 py-2 text-xs text-muted-foreground"
                >
                  All properties added
                </div>
              </div>
            </Transition>

            <!-- Click outside to close -->
            <div
              v-if="isAddStyleMenuOpen"
              class="fixed inset-0 z-40"
              @click="isAddStyleMenuOpen = false"
            />
          </div>
        </div>
      </InspectorSection>

      <!-- Preview Button -->
      <div class="px-4 py-3 border-t border-sidebar-border">
        <button
          type="button"
          class="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-medium text-violet-600 dark:text-violet-400 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 rounded-lg transition-colors"
          :disabled="!targetBlockIds.length || activeStyleSections.length === 0"
          :class="{ 'opacity-50 cursor-not-allowed': !targetBlockIds.length || activeStyleSections.length === 0 }"
          @click="handlePreview"
        >
          <Icon name="control-play" :size="14" />
          <span>Preview</span>
        </button>
      </div>
    </div>
  </div>
</template>
