<script setup lang="ts">
import type { Spacing, BorderStyle, ShadowStyle, GradientStyle, AspectRatio, ObjectFit, MaskShape } from '@/types/editor'
import InspectorSection from '../InspectorSection.vue'
import InspectorField from '../InspectorField.vue'
import Popover from '@/components/ui/Popover.vue'
import Icon from '@/components/ui/Icon.vue'
import Tooltip from '@/components/ui/Tooltip.vue'
import BoxModelInput from '../BoxModelInput.vue'
import BorderInput from '../BorderInput.vue'
import ColorInput from '../ColorInput.vue'
import SliderInput from '../SliderInput.vue'
import SizeInput from '../SizeInput.vue'
import ImageInput from '../ImageInput.vue'
import TextInput from '../TextInput.vue'
import SegmentedControl from '../SegmentedControl.vue'
import SelectInput from '../SelectInput.vue'

const props = defineProps<{
  // Spacing
  margin?: Spacing
  padding?: Spacing
  // Background
  backgroundType?: 'color' | 'image' | 'video' | 'gradient'
  backgroundColor?: string
  backgroundImage?: string
  backgroundVideo?: string
  backgroundGradient?: GradientStyle
  backgroundImageOpacity?: number
  backgroundImageBlur?: number
  backgroundImageSaturation?: number
  // Shadow
  shadow?: ShadowStyle
  // Radius
  borderRadius?: string
  // Border
  border?: BorderStyle
  // Overflow
  overflow?: 'visible' | 'hidden'
  // Opacity
  opacity?: number | string
  // Image-specific options
  aspectRatio?: AspectRatio | '3:2' | '2:3'
  objectFit?: ObjectFit
  mask?: MaskShape
  // Transform
  translateX?: string
  translateY?: string
  rotate?: string
  scale?: string
  zIndex?: number | string
  position?: 'relative' | 'absolute' | 'fixed' | 'sticky'
  // Control flags
  hideBackground?: boolean
  showImageOptions?: boolean
}>()

const emit = defineEmits<{
  // Spacing
  'update:margin': [value: Spacing]
  'update:padding': [value: Spacing]
  // Background
  'update:backgroundType': [value: 'color' | 'image' | 'video' | 'gradient']
  'update:backgroundColor': [value: string]
  'update:backgroundImage': [value: string]
  'update:backgroundVideo': [value: string]
  'update:backgroundGradient': [value: GradientStyle]
  'update:backgroundImageOpacity': [value: number]
  'update:backgroundImageBlur': [value: number]
  'update:backgroundImageSaturation': [value: number]
  // Shadow
  'update:shadow': [value: ShadowStyle]
  // Radius
  'update:borderRadius': [value: string]
  // Border
  'update:border': [value: BorderStyle]
  // Overflow
  'update:overflow': [value: 'visible' | 'hidden']
  // Opacity
  'update:opacity': [value: number | string]
  // Image-specific
  'update:aspectRatio': [value: AspectRatio | '3:2' | '2:3']
  'update:objectFit': [value: ObjectFit]
  'update:mask': [value: MaskShape]
  // Transform
  'update:translateX': [value: string]
  'update:translateY': [value: string]
  'update:rotate': [value: string]
  'update:scale': [value: string]
  'update:zIndex': [value: string]
  'update:position': [value: 'relative' | 'absolute' | 'fixed' | 'sticky']
}>()

// Background type options
const backgroundTypeOptions = [
  { value: 'color', label: 'Color', icon: 'style-color' },
  { value: 'gradient', label: 'Gradient', icon: 'style-gradient' },
  { value: 'image', label: 'Image', icon: 'content-image' },
  { value: 'video', label: 'Video', icon: 'content-video' },
]

// Position options
const positionOptions = [
  { value: 'relative', label: 'Relative' },
  { value: 'absolute', label: 'Absolute' },
  { value: 'fixed', label: 'Fixed' },
  { value: 'sticky', label: 'Sticky' },
]

// Overflow options
const overflowOptions = [
  { value: 'visible', label: 'Visible' },
  { value: 'hidden', label: 'Hidden' },
]

// Image-specific options
const aspectRatioOptions = [
  { value: 'auto', label: 'Auto' },
  { value: '1:1', label: '1:1 (Square)' },
  { value: '4:3', label: '4:3' },
  { value: '3:4', label: '3:4' },
  { value: '16:9', label: '16:9 (Wide)' },
  { value: '9:16', label: '9:16 (Portrait)' },
  { value: '3:2', label: '3:2' },
  { value: '2:3', label: '2:3' },
]

const objectFitOptions = [
  { value: 'cover', label: 'Cover' },
  { value: 'contain', label: 'Contain' },
  { value: 'fill', label: 'Fill' },
  { value: 'none', label: 'None' },
  { value: 'scale-down', label: 'Scale Down' },
]

const maskOptions = [
  { value: 'none', label: 'None' },
  { value: 'circle', label: 'Circle' },
  { value: 'ellipse', label: 'Ellipse' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'squircle', label: 'Squircle' },
  { value: 'diamond', label: 'Diamond' },
  { value: 'hexagon', label: 'Hexagon' },
  { value: 'octagon', label: 'Octagon' },
  { value: 'star', label: 'Star' },
  { value: 'triangle', label: 'Triangle' },
  { value: 'pentagon', label: 'Pentagon' },
]

// Shadow presets
function setShadowPreset(size: 'S' | 'M' | 'L' | 'none') {
  if (size === 'none') {
    emit('update:shadow', { enabled: false })
    return
  }

  const presets = {
    S: { enabled: true, x: '0', y: '2', blur: '8', color: props.shadow?.color || 'rgba(0,0,0,0.1)' },
    M: { enabled: true, x: '0', y: '4', blur: '16', color: props.shadow?.color || 'rgba(0,0,0,0.1)' },
    L: { enabled: true, x: '0', y: '8', blur: '32', color: props.shadow?.color || 'rgba(0,0,0,0.15)' },
  }
  emit('update:shadow', presets[size])
}

function isShadowPreset(size: 'S' | 'M' | 'L') {
  if (!props.shadow?.enabled) return false
  const blurs = { S: '8', M: '16', L: '32' }
  return props.shadow.blur === blurs[size]
}

// Get background preview text
function getBackgroundPreview(): string {
  if (props.backgroundType === 'image' && props.backgroundImage) return 'Image'
  if (props.backgroundType === 'video' && props.backgroundVideo) return 'Video'
  if (props.backgroundType === 'gradient') return 'Gradient'
  if (props.backgroundColor) return props.backgroundColor
  return 'None'
}

// Get shadow preview text
function getShadowPreview(): string {
  if (!props.shadow?.enabled) return 'None'
  if (props.shadow.blur === '8') return 'Small'
  if (props.shadow.blur === '16') return 'Medium'
  if (props.shadow.blur === '32') return 'Large'
  return 'Custom'
}

// Get border preview text
function getBorderPreview(): string {
  if (!props.border?.width || props.border.width === '0' || props.border.width === '0px') return 'None'
  return `${props.border.width} ${props.border.style || 'solid'}`
}

// Get radius preview text
function getRadiusPreview(): string {
  if (!props.borderRadius || props.borderRadius === '0' || props.borderRadius === '0px') return 'None'
  return props.borderRadius
}

// Get overflow preview text
function getOverflowPreview(): string {
  return props.overflow === 'hidden' ? 'Hidden' : 'Visible'
}

// Get opacity preview text
function getOpacityPreview(): string {
  const value = props.opacity ?? 100
  return `${value}%`
}

// Get aspect ratio preview text
function getAspectRatioPreview(): string {
  if (!props.aspectRatio || props.aspectRatio === 'auto') return 'Auto'
  return props.aspectRatio
}

// Get object fit preview text
function getObjectFitPreview(): string {
  if (!props.objectFit) return 'Cover'
  return props.objectFit.charAt(0).toUpperCase() + props.objectFit.slice(1)
}

// Get mask preview text
function getMaskPreview(): string {
  if (!props.mask || props.mask === 'none') return 'None'
  return props.mask.charAt(0).toUpperCase() + props.mask.slice(1)
}

// Get transform preview text
function getTransformPreview(): string {
  const parts: string[] = []
  if (props.translateX && props.translateX !== '0') parts.push(`X:${props.translateX}`)
  if (props.translateY && props.translateY !== '0') parts.push(`Y:${props.translateY}`)
  if (props.rotate && props.rotate !== '0') parts.push(`${props.rotate}°`)
  if (props.position && props.position !== 'relative') {
    parts.push(props.position.charAt(0).toUpperCase() + props.position.slice(1))
  }
  return parts.length > 0 ? parts.join(', ') : 'None'
}
</script>

<template>
  <InspectorSection title="Styles" icon="style-color">
    <!-- Spacing -->
    <InspectorField label="Spacing" horizontal>
      <Popover align="right" width="w-72">
        <template #trigger="{ toggle }">
          <button
            class="flex items-center gap-1.5 px-2 py-1 text-xs rounded-md bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/80 transition-colors"
            @click="toggle"
          >
            <Icon name="style-justify-between" :size="12" class="text-muted-foreground" />
            <span class="truncate">Edit</span>
          </button>
        </template>
        <div class="p-4">
          <BoxModelInput
            :margin="margin"
            :padding="padding"
            @update:margin="emit('update:margin', $event)"
            @update:padding="emit('update:padding', $event)"
          />
        </div>
      </Popover>
    </InspectorField>

    <!-- Image Options (Aspect Ratio, Object Fit, Mask) -->
    <template v-if="showImageOptions">
      <InspectorField label="Aspect Ratio" horizontal>
        <Popover align="right" width="w-48">
          <template #trigger="{ toggle }">
            <button
              class="flex items-center gap-1.5 px-2 py-1 text-xs rounded-md bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/80 transition-colors"
              @click="toggle"
            >
              <Icon name="style-aspect-ratio" :size="12" class="text-muted-foreground" />
              <span class="truncate">{{ getAspectRatioPreview() }}</span>
            </button>
          </template>
          <div class="p-4">
            <InspectorField label="Aspect Ratio" horizontal>
              <SelectInput
                :model-value="aspectRatio || 'auto'"
                :options="aspectRatioOptions"
                @update:model-value="emit('update:aspectRatio', $event as any)"
              />
            </InspectorField>
          </div>
        </Popover>
      </InspectorField>

      <InspectorField label="Object Fit" horizontal>
        <Popover align="right" width="w-48">
          <template #trigger="{ toggle }">
            <button
              class="flex items-center gap-1.5 px-2 py-1 text-xs rounded-md bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/80 transition-colors"
              @click="toggle"
            >
              <Icon name="style-object-fit" :size="12" class="text-muted-foreground" />
              <span class="truncate">{{ getObjectFitPreview() }}</span>
            </button>
          </template>
          <div class="p-4">
            <InspectorField label="Object Fit" horizontal>
              <SelectInput
                :model-value="objectFit || 'cover'"
                :options="objectFitOptions"
                @update:model-value="emit('update:objectFit', $event as any)"
              />
            </InspectorField>
          </div>
        </Popover>
      </InspectorField>

      <InspectorField label="Mask" horizontal>
        <Popover align="right" width="w-48">
          <template #trigger="{ toggle }">
            <button
              class="flex items-center gap-1.5 px-2 py-1 text-xs rounded-md bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/80 transition-colors"
              @click="toggle"
            >
              <Icon name="style-mask" :size="12" class="text-muted-foreground" />
              <span class="truncate">{{ getMaskPreview() }}</span>
            </button>
          </template>
          <div class="p-4">
            <InspectorField label="Mask" horizontal>
              <SelectInput
                :model-value="mask || 'none'"
                :options="maskOptions"
                @update:model-value="emit('update:mask', $event as any)"
              />
            </InspectorField>
          </div>
        </Popover>
      </InspectorField>
    </template>

    <!-- Background -->
    <InspectorField v-if="!hideBackground" label="Background" horizontal>
      <Popover align="right" width="w-72">
        <template #trigger="{ toggle }">
          <button
            class="flex items-center gap-1.5 px-2 py-1 text-xs rounded-md bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/80 transition-colors"
            @click="toggle"
          >
            <div
              v-if="backgroundColor && (backgroundType === 'color' || !backgroundType)"
              class="w-3 h-3 rounded-sm border border-sidebar-border"
              :style="{ backgroundColor }"
            />
            <Icon v-else name="content-image" :size="12" class="text-muted-foreground" />
            <span class="truncate max-w-20">{{ getBackgroundPreview() }}</span>
          </button>
        </template>
        <div class="p-4 space-y-3">
          <InspectorField label="Type" horizontal>
            <SegmentedControl
              :options="backgroundTypeOptions"
              :model-value="backgroundType || 'color'"
              icon-only
              @update:model-value="emit('update:backgroundType', $event as 'color' | 'image' | 'video' | 'gradient')"
            />
          </InspectorField>

          <!-- Color -->
          <InspectorField
            v-if="backgroundType === 'color' || !backgroundType"
            label="Color"
            horizontal
          >
            <ColorInput
              :model-value="backgroundColor"
              swatch-only
              @update:model-value="emit('update:backgroundColor', $event)"
            />
          </InspectorField>

          <!-- Image -->
          <template v-else-if="backgroundType === 'image'">
            <InspectorField label="Image">
              <ImageInput
                :model-value="backgroundImage || ''"
                placeholder="Upload background image"
                @update:model-value="emit('update:backgroundImage', $event)"
              />
            </InspectorField>
          </template>

          <!-- Video -->
          <InspectorField v-else-if="backgroundType === 'video'" label="Video URL">
            <TextInput
              :model-value="backgroundVideo || ''"
              placeholder="YouTube, Vimeo, or file URL"
              @update:model-value="emit('update:backgroundVideo', $event)"
            />
          </InspectorField>
        </div>
      </Popover>
    </InspectorField>

    <!-- Shadow -->
    <InspectorField label="Shadow" horizontal>
      <Popover align="right" width="w-64">
        <template #trigger="{ toggle }">
          <button
            class="flex items-center gap-1.5 px-2 py-1 text-xs rounded-md bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/80 transition-colors"
            @click="toggle"
          >
            <Icon name="style-shadow" :size="12" class="text-muted-foreground" />
            <span class="truncate">{{ getShadowPreview() }}</span>
          </button>
        </template>
        <div class="p-4 space-y-3">
          <InspectorField label="Size" horizontal>
            <div class="flex p-0.5 bg-secondary rounded-md">
              <Tooltip text="None">
                <button
                  type="button"
                  class="flex items-center justify-center w-7 h-7 rounded transition-colors text-[10px] font-semibold"
                  :class="!shadow?.enabled
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'"
                  @click="setShadowPreset('none')"
                >
                  <Icon name="xmark" class="text-xs" />
                </button>
              </Tooltip>
              <Tooltip text="Small">
                <button
                  type="button"
                  class="flex items-center justify-center w-7 h-7 rounded transition-colors text-[10px] font-semibold"
                  :class="isShadowPreset('S')
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'"
                  @click="setShadowPreset('S')"
                >
                  S
                </button>
              </Tooltip>
              <Tooltip text="Medium">
                <button
                  type="button"
                  class="flex items-center justify-center w-7 h-7 rounded transition-colors text-[10px] font-semibold"
                  :class="isShadowPreset('M')
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'"
                  @click="setShadowPreset('M')"
                >
                  M
                </button>
              </Tooltip>
              <Tooltip text="Large">
                <button
                  type="button"
                  class="flex items-center justify-center w-7 h-7 rounded transition-colors text-[10px] font-semibold"
                  :class="isShadowPreset('L')
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'"
                  @click="setShadowPreset('L')"
                >
                  L
                </button>
              </Tooltip>
            </div>
          </InspectorField>
          <InspectorField v-if="shadow?.enabled" label="Color" horizontal>
            <ColorInput
              :model-value="shadow?.color || 'rgba(0,0,0,0.1)'"
              swatch-only
              @update:model-value="emit('update:shadow', { ...shadow, color: $event })"
            />
          </InspectorField>
        </div>
      </Popover>
    </InspectorField>

    <!-- Radius -->
    <InspectorField label="Radius" horizontal>
      <Popover align="right" width="w-48">
        <template #trigger="{ toggle }">
          <button
            class="flex items-center gap-1.5 px-2 py-1 text-xs rounded-md bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/80 transition-colors"
            @click="toggle"
          >
            <Icon name="style-radius" :size="12" class="text-muted-foreground" />
            <span class="truncate">{{ getRadiusPreview() }}</span>
          </button>
        </template>
        <div class="p-4">
          <InspectorField label="Radius" horizontal>
            <SizeInput
              :model-value="borderRadius || ''"
              placeholder="0"
              @update:model-value="emit('update:borderRadius', $event)"
            />
          </InspectorField>
        </div>
      </Popover>
    </InspectorField>

    <!-- Border -->
    <InspectorField label="Border" horizontal>
      <Popover align="right" width="w-72">
        <template #trigger="{ toggle }">
          <button
            class="flex items-center gap-1.5 px-2 py-1 text-xs rounded-md bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/80 transition-colors"
            @click="toggle"
          >
            <Icon name="style-border-top" :size="12" class="text-muted-foreground" />
            <span class="truncate">{{ getBorderPreview() }}</span>
          </button>
        </template>
        <div class="p-4">
          <BorderInput
            :model-value="border"
            @update:model-value="emit('update:border', $event)"
          />
        </div>
      </Popover>
    </InspectorField>

    <!-- Overflow -->
    <InspectorField label="Overflow" horizontal>
      <Popover align="right" width="w-48">
        <template #trigger="{ toggle }">
          <button
            class="flex items-center gap-1.5 px-2 py-1 text-xs rounded-md bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/80 transition-colors"
            @click="toggle"
          >
            <Icon name="style-overflow" :size="12" class="text-muted-foreground" />
            <span class="truncate">{{ getOverflowPreview() }}</span>
          </button>
        </template>
        <div class="p-4">
          <InspectorField label="Overflow" horizontal>
            <SegmentedControl
              :options="overflowOptions"
              :model-value="overflow || 'visible'"
              @update:model-value="emit('update:overflow', $event as 'visible' | 'hidden')"
            />
          </InspectorField>
        </div>
      </Popover>
    </InspectorField>

    <!-- Opacity -->
    <InspectorField label="Opacity" horizontal>
      <Popover align="right" width="w-56">
        <template #trigger="{ toggle }">
          <button
            class="flex items-center gap-1.5 px-2 py-1 text-xs rounded-md bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/80 transition-colors"
            @click="toggle"
          >
            <Icon name="style-opacity" :size="12" class="text-muted-foreground" />
            <span class="truncate">{{ getOpacityPreview() }}</span>
          </button>
        </template>
        <div class="p-4">
          <InspectorField label="Opacity" horizontal>
            <SliderInput
              :model-value="String(opacity ?? 100)"
              :min="0"
              :max="100"
              :step="5"
              unit="%"
              @update:model-value="emit('update:opacity', $event)"
            />
          </InspectorField>
        </div>
      </Popover>
    </InspectorField>

    <!-- Transform -->
    <InspectorField label="Transform" horizontal>
      <Popover align="right" width="w-64">
        <template #trigger="{ toggle }">
          <button
            class="flex items-center gap-1.5 px-2 py-1 text-xs rounded-md bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/80 transition-colors"
            @click="toggle"
          >
            <Icon name="lni-move" :size="12" class="text-muted-foreground" />
            <span class="truncate max-w-24">{{ getTransformPreview() }}</span>
          </button>
        </template>
        <div class="p-4 space-y-3">
          <InspectorField label="Position" horizontal>
            <SelectInput
              :model-value="position || 'relative'"
              :options="positionOptions"
              @update:model-value="emit('update:position', $event as any)"
            />
          </InspectorField>
          <InspectorField label="Z-Index" horizontal>
            <SliderInput
              :model-value="zIndex?.toString() || '0'"
              :min="0"
              :max="100"
              :step="1"
              @update:model-value="emit('update:zIndex', $event)"
            />
          </InspectorField>
          <InspectorField label="Translate X" horizontal>
            <SizeInput
              :model-value="translateX || '0'"
              placeholder="0"
              @update:model-value="emit('update:translateX', $event)"
            />
          </InspectorField>
          <InspectorField label="Translate Y" horizontal>
            <SizeInput
              :model-value="translateY || '0'"
              placeholder="0"
              @update:model-value="emit('update:translateY', $event)"
            />
          </InspectorField>
          <InspectorField label="Rotate" horizontal>
            <SliderInput
              :model-value="rotate || '0'"
              :min="-180"
              :max="180"
              :step="1"
              unit="°"
              @update:model-value="emit('update:rotate', $event)"
            />
          </InspectorField>
        </div>
      </Popover>
    </InspectorField>
  </InspectorSection>
</template>
