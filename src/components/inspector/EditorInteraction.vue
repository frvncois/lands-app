<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useEditorStore } from '@/stores/editor'
import { Icon } from '@/components/ui'
import InspectorSection from './InspectorSection.vue'
import InspectorField from './InspectorField.vue'
import TextInput from './TextInput.vue'
import SelectInput from './SelectInput.vue'
import SegmentedControl from './SegmentedControl.vue'
import SliderInput from './SliderInput.vue'
import ColorInput from './ColorInput.vue'
import BlockSelector from './BlockSelector.vue'
import type {
  InteractionTrigger,
  InteractionEffect,
  InteractionEasing,
  InteractionStyles,
} from '@/types/editor'
import { BorderSection } from './sections'

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
const targetBlockId = ref('')
const effectType = ref<InteractionEffect>('transition')
const duration = ref('300')
const easing = ref<InteractionEasing>('ease')
const delay = ref('0')
const styles = ref<InteractionStyles>({})
const isAddStyleMenuOpen = ref(false)

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
    targetBlockId.value = interaction.targetBlockId
    effectType.value = interaction.effectType
    duration.value = interaction.duration.replace('ms', '')
    easing.value = interaction.easing
    delay.value = interaction.delay?.replace('ms', '') || '0'
    styles.value = { ...interaction.styles }
  } else {
    // Defaults for new interaction
    name.value = 'New Interaction'
    trigger.value = 'hover'
    targetBlockId.value = props.triggerBlockId // Default to same block
    effectType.value = 'transition'
    duration.value = '300'
    easing.value = 'ease'
    delay.value = '0'
    styles.value = {}
  }
}, { immediate: true })

// Trigger options - using exact icons as specified
const triggerOptions = [
  { value: 'hover', label: 'Hover', icon: 'app-hover' },
  { value: 'click', label: 'Click', icon: 'app-pressed' },
  { value: 'load', label: 'Page Load', icon: 'style-page-load' },
  { value: 'appear', label: 'Appear', icon: 'app-show' },
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

// Available style sections to add - using normal style icons
const availableStyleSections = [
  { id: 'background', label: 'Background', icon: 'style-color' },
  { id: 'border', label: 'Border', icon: 'style-border-top' },
  { id: 'opacity', label: 'Opacity', icon: 'app-show' },
  { id: 'transform', label: 'Transform', icon: 'style-animation' },
  { id: 'color', label: 'Text Color', icon: 'style-typography' },
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
      case 'background':
        delete newStyles.backgroundColor
        break
      case 'border':
        delete newStyles.border
        break
      case 'opacity':
        delete newStyles.opacity
        break
      case 'transform':
        delete newStyles.transform
        delete newStyles.scale
        delete newStyles.rotate
        delete newStyles.translateX
        delete newStyles.translateY
        break
      case 'color':
        delete newStyles.color
        break
    }
    styles.value = newStyles
  }
}

// Update style property
function updateStyle(key: keyof InteractionStyles, value: unknown) {
  styles.value = { ...styles.value, [key]: value }
}

// Save interaction (create or update) - exposed for parent to call
function save() {
  if (props.interactionId) {
    // Update existing
    editorStore.updateInteraction(props.interactionId, {
      name: name.value,
      trigger: trigger.value,
      targetBlockId: targetBlockId.value,
      effectType: effectType.value,
      duration: `${duration.value}ms`,
      easing: easing.value,
      delay: delay.value ? `${delay.value}ms` : undefined,
      styles: styles.value,
    })
    emit('close')
  } else {
    // Create new
    const newInteraction = editorStore.createInteraction({
      name: name.value,
      trigger: trigger.value,
      triggerBlockId: props.triggerBlockId,
      targetBlockId: targetBlockId.value,
      effectType: effectType.value,
      duration: `${duration.value}ms`,
      easing: easing.value,
      delay: delay.value ? `${delay.value}ms` : undefined,
      styles: styles.value,
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
    if (interaction.styles.backgroundColor) sections.push('background')
    if (interaction.styles.border) sections.push('border')
    if (interaction.styles.opacity !== undefined) sections.push('opacity')
    if (interaction.styles.transform || interaction.styles.scale || interaction.styles.rotate || interaction.styles.translateX || interaction.styles.translateY) {
      sections.push('transform')
    }
    if (interaction.styles.color) sections.push('color')
    activeStyleSections.value = sections
  }
}, { immediate: true })
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
          <div class="grid grid-cols-2 gap-2">
            <button
              v-for="option in triggerOptions"
              :key="option.value"
              type="button"
              class="flex items-center gap-2 px-3 py-2 text-xs rounded-lg border transition-colors"
              :class="trigger === option.value
                ? 'border-violet-500 bg-violet-500/10 text-violet-600 dark:text-violet-400'
                : 'border-border hover:bg-muted/50 text-muted-foreground'"
              @click="trigger = option.value as InteractionTrigger"
            >
              <Icon :name="option.icon" :size="14" />
              <span>{{ option.label }}</span>
            </button>
          </div>
        </InspectorField>
      </InspectorSection>

      <!-- Target Section -->
      <InspectorSection title="Applied to" icon="style-applied-to">
        <InspectorField label="Target Block">
          <BlockSelector
            v-model="targetBlockId"
            :current-block-id="triggerBlockId"
          />
        </InspectorField>
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
        <!-- Active style sections -->
        <div v-if="activeStyleSections.length > 0" class="space-y-3">
          <!-- Background -->
          <div v-if="activeStyleSections.includes('background')" class="relative">
            <button
              type="button"
              class="absolute -top-1 -right-1 p-0.5 rounded bg-muted hover:bg-destructive/20 transition-colors z-10"
              @click="removeStyleSection('background')"
            >
              <Icon name="xmark" :size="10" class="text-muted-foreground" />
            </button>
            <InspectorField label="Background" horizontal>
              <ColorInput
                :model-value="styles.backgroundColor || ''"
                swatch-only
                @update:model-value="updateStyle('backgroundColor', $event)"
              />
            </InspectorField>
          </div>

          <!-- Border -->
          <div v-if="activeStyleSections.includes('border')" class="relative">
            <button
              type="button"
              class="absolute -top-1 -right-1 p-0.5 rounded bg-muted hover:bg-destructive/20 transition-colors z-10"
              @click="removeStyleSection('border')"
            >
              <Icon name="xmark" :size="10" class="text-muted-foreground" />
            </button>
            <BorderSection
              :model-value="styles.border || {}"
              @update:model-value="updateStyle('border', $event)"
            />
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
            <InspectorField label="Move X" horizontal>
              <SliderInput
                :model-value="styles.translateX || '0'"
                :min="-100"
                :max="100"
                :step="5"
                unit="px"
                @update:model-value="updateStyle('translateX', $event)"
              />
            </InspectorField>
            <InspectorField label="Move Y" horizontal>
              <SliderInput
                :model-value="styles.translateY || '0'"
                :min="-100"
                :max="100"
                :step="5"
                unit="px"
                @update:model-value="updateStyle('translateY', $event)"
              />
            </InspectorField>
          </div>

          <!-- Text Color -->
          <div v-if="activeStyleSections.includes('color')" class="relative">
            <button
              type="button"
              class="absolute -top-1 -right-1 p-0.5 rounded bg-muted hover:bg-destructive/20 transition-colors z-10"
              @click="removeStyleSection('color')"
            >
              <Icon name="xmark" :size="10" class="text-muted-foreground" />
            </button>
            <InspectorField label="Text Color" horizontal>
              <ColorInput
                :model-value="styles.color || ''"
                swatch-only
                @update:model-value="updateStyle('color', $event)"
              />
            </InspectorField>
          </div>
        </div>

        <!-- Add style property button -->
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
    </div>
  </div>
</template>
