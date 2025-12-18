<script setup lang="ts">
import { computed } from 'vue'
import type { Spacing, BorderStyle, ShadowStyle, GradientStyle, AspectRatio, ObjectFit, MaskShape } from '@/types/editor'
import InspectorSection from '../InspectorSection.vue'
import InspectorField from '../InspectorField.vue'
import Popover from '@/components/ui/Popover.vue'
import Button from '@/components/ui/Button.vue'
import Icon from '@/components/ui/Icon.vue'
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
  backgroundImageOverlay?: string
  backgroundImageOverlayOpacity?: number
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
  mixBlendMode?: string
  // Blur (filter)
  blur?: string
  // Image-specific options
  aspectRatio?: AspectRatio | '3:2' | '2:3'
  objectFit?: ObjectFit
  mask?: MaskShape
  // Image adjustments
  brightness?: number
  contrast?: number
  saturation?: number
  hue?: number
  grayscale?: number
  // Transform
  translateX?: string
  translateY?: string
  rotate?: string
  scale?: string
  zIndex?: number | string
  position?: 'relative' | 'absolute' | 'fixed' | 'sticky'
  // Inset (for absolute/fixed/sticky positioning)
  top?: string
  right?: string
  bottom?: string
  left?: string
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
  'update:backgroundImageOverlay': [value: string]
  'update:backgroundImageOverlayOpacity': [value: number]
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
  'update:mixBlendMode': [value: string]
  // Blur
  'update:blur': [value: string]
  // Image-specific
  'update:aspectRatio': [value: AspectRatio | '3:2' | '2:3']
  'update:objectFit': [value: ObjectFit]
  'update:mask': [value: MaskShape]
  // Image adjustments
  'update:brightness': [value: number]
  'update:contrast': [value: number]
  'update:saturation': [value: number]
  'update:hue': [value: number]
  'update:grayscale': [value: number]
  // Transform
  'update:translateX': [value: string]
  'update:translateY': [value: string]
  'update:rotate': [value: string]
  'update:scale': [value: string]
  'update:zIndex': [value: string]
  'update:position': [value: 'relative' | 'absolute' | 'fixed' | 'sticky']
  // Inset
  'update:top': [value: string]
  'update:right': [value: string]
  'update:bottom': [value: string]
  'update:left': [value: string]
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

// Mix blend mode options
const mixBlendModeOptions = [
  { value: 'normal', label: 'Normal' },
  { value: 'multiply', label: 'Multiply' },
  { value: 'screen', label: 'Screen' },
  { value: 'overlay', label: 'Overlay' },
  { value: 'darken', label: 'Darken' },
  { value: 'lighten', label: 'Lighten' },
  { value: 'color-dodge', label: 'Color Dodge' },
  { value: 'color-burn', label: 'Color Burn' },
  { value: 'hard-light', label: 'Hard Light' },
  { value: 'soft-light', label: 'Soft Light' },
  { value: 'difference', label: 'Difference' },
  { value: 'exclusion', label: 'Exclusion' },
  { value: 'hue', label: 'Hue' },
  { value: 'saturation', label: 'Saturation' },
  { value: 'color', label: 'Color' },
  { value: 'luminosity', label: 'Luminosity' },
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

// Gradient options
const gradientTypeOptions = [
  { value: 'linear', label: 'Linear' },
  { value: 'radial', label: 'Radial' },
]

const defaultGradientStops = [
  { color: '#000000', position: 0 },
  { color: '#ffffff', position: 100 },
]

// Gradient helper functions
function getGradientWithDefaults(): GradientStyle {
  return {
    type: props.backgroundGradient?.type || 'linear',
    angle: props.backgroundGradient?.angle ?? 180,
    stops: props.backgroundGradient?.stops || [...defaultGradientStops],
  }
}

function updateGradient(updates: Partial<GradientStyle>) {
  const current = getGradientWithDefaults()
  emit('update:backgroundGradient', { ...current, ...updates })
}

function updateGradientStop(index: number, updates: { color?: string; position?: number }) {
  const current = getGradientWithDefaults()
  const newStops = [...current.stops]
  const existingStop = newStops[index]
  if (!existingStop) return
  newStops[index] = {
    color: updates.color ?? existingStop.color,
    position: updates.position ?? existingStop.position,
  }
  emit('update:backgroundGradient', { ...current, stops: newStops })
}

function addGradientStop() {
  const current = getGradientWithDefaults()
  const newStops = [...current.stops]
  // Add a new stop at 50% with a mid-gray color
  newStops.push({ color: '#888888', position: 50 })
  // Sort by position
  newStops.sort((a, b) => a.position - b.position)
  emit('update:backgroundGradient', { ...current, stops: newStops })
}

function removeGradientStop(index: number) {
  const current = getGradientWithDefaults()
  if (current.stops.length <= 2) return
  const newStops = current.stops.filter((_, i) => i !== index)
  emit('update:backgroundGradient', { ...current, stops: newStops })
}

// Reset functions
function resetSpacing() {
  emit('update:margin', { top: '0', bottom: '0', left: '0', right: '0' })
  emit('update:padding', { top: '0', bottom: '0', left: '0', right: '0' })
}

function resetBackground() {
  emit('update:backgroundType', 'color')
  emit('update:backgroundColor', '')
  emit('update:backgroundImage', '')
  emit('update:backgroundVideo', '')
}

function resetShadow() {
  emit('update:shadow', { enabled: false })
}

function resetRadius() {
  emit('update:borderRadius', '0')
}

function resetBorder() {
  emit('update:border', { width: '0', color: '', style: 'solid' })
}

function resetOverflow() {
  emit('update:overflow', 'visible')
}

function resetOpacity() {
  emit('update:opacity', 100)
  emit('update:mixBlendMode', 'normal')
}

function resetBlur() {
  emit('update:blur', '0')
}

function resetAspectRatio() {
  emit('update:aspectRatio', 'auto')
}

function resetObjectFit() {
  emit('update:objectFit', 'cover')
}

function resetMask() {
  emit('update:mask', 'none')
}

function resetAdjustments() {
  emit('update:brightness', 100)
  emit('update:contrast', 100)
  emit('update:saturation', 100)
  emit('update:hue', 0)
  emit('update:grayscale', 0)
}

function resetTransform() {
  emit('update:position', 'relative')
  emit('update:zIndex', '0')
  emit('update:translateX', '0')
  emit('update:translateY', '0')
  emit('update:rotate', '0')
  emit('update:top', '')
  emit('update:right', '')
  emit('update:bottom', '')
  emit('update:left', '')
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
  const blend = props.mixBlendMode
  if (blend && blend !== 'normal') {
    return `${value}% / ${blend}`
  }
  return `${value}%`
}

function getBlurPreview(): string {
  const value = props.blur ?? '0'
  if (value === '0' || value === '') return 'None'
  return `${value}px`
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

// Get adjustments preview text
function getAdjustmentsPreview(): string {
  const parts: string[] = []
  if (props.brightness !== undefined && props.brightness !== 100) parts.push(`B:${props.brightness}%`)
  if (props.contrast !== undefined && props.contrast !== 100) parts.push(`C:${props.contrast}%`)
  if (props.saturation !== undefined && props.saturation !== 100) parts.push(`S:${props.saturation}%`)
  if (props.hue !== undefined && props.hue !== 0) parts.push(`H:${props.hue}°`)
  if (props.grayscale !== undefined && props.grayscale !== 0) parts.push(`G:${props.grayscale}%`)
  return parts.length > 0 ? parts.join(', ') : 'None'
}

// Get transform preview text
function getTransformPreview(): string {
  const parts: string[] = []
  if (props.translateX && props.translateX !== '0') parts.push(`X:${props.translateX}`)
  if (props.translateY && props.translateY !== '0') parts.push(`Y:${props.translateY}`)
  if (props.rotate && props.rotate !== '0') parts.push(`${props.rotate}deg`)
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
      <Popover align="right" width="w-80">
        <template #trigger="{ toggle }">
          <button
            class="flex items-center gap-1.5 px-2 py-1 text-xs rounded-md bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors cursor-pointer"
            @click="toggle"
          >
            <span class="w-2 h-2 rounded-full shrink-0 bg-white"></span>
            <span class="truncate">Edit</span>
          </button>
        </template>
        <template #default="{ close }">
          <div class="p-3" @click.stop>
            <!-- Header -->
            <div class="flex items-center gap-2 mb-3 pb-2">
              <span class="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wide">
                <Icon name="style-color" :size="14" class="text-muted-foreground" />
                Spacing
              </span>
              <div class="flex-1" />
              <Button size="sm" variant="outline" @click.stop.prevent="resetSpacing(); close()">Reset</Button>
              <Button size="sm" @click.stop.prevent="close()">Apply</Button>
            </div>
            <!-- Content -->
            <BoxModelInput
              :margin="margin"
              :padding="padding"
              @update:margin="emit('update:margin', $event)"
              @update:padding="emit('update:padding', $event)"
            />
          </div>
        </template>
      </Popover>
    </InspectorField>

    <!-- Background -->
    <InspectorField v-if="!hideBackground" label="Background" horizontal>
      <Popover align="right" width="w-80">
        <template #trigger="{ toggle }">
          <button
            class="flex items-center gap-1.5 px-2 py-1 text-xs rounded-md bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors cursor-pointer"
            @click="toggle"
          >
            <span
              class="w-2 h-2 rounded-full shrink-0"
              :class="backgroundColor || backgroundImage || backgroundVideo ? 'bg-white' : 'bg-muted-foreground/30'"
            ></span>
            <span class="truncate max-w-20">{{ getBackgroundPreview() }}</span>
          </button>
        </template>
        <template #default="{ close }">
          <div class="p-3" @click.stop>
            <!-- Header -->
            <div class="flex items-center gap-2 mb-3 pb-2">
              <span class="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wide">
                <Icon name="style-color" :size="14" class="text-muted-foreground" />
                Background
              </span>
              <div class="flex-1" />
              <Button size="sm" variant="outline" @click.stop.prevent="resetBackground(); close()">Reset</Button>
              <Button size="sm" @click.stop.prevent="close()">Apply</Button>
            </div>
            <!-- Content -->
            <div class="space-y-3">
              <InspectorField label="Type" horizontal>
                <SegmentedControl
                  :options="backgroundTypeOptions"
                  :model-value="backgroundType || 'color'"
                  icon-only
                  @update:model-value="emit('update:backgroundType', $event as 'color' | 'image' | 'video' | 'gradient')"
                />
              </InspectorField>

              <!-- Color -->
              <ColorInput
                v-if="backgroundType === 'color' || !backgroundType"
                :model-value="backgroundColor"
                inline
                @update:model-value="emit('update:backgroundColor', $event)"
              />

              <!-- Image -->
              <template v-else-if="backgroundType === 'image'">
                <InspectorField label="Image">
                  <ImageInput
                    :model-value="backgroundImage || ''"
                    placeholder="Upload background image"
                    @update:model-value="emit('update:backgroundImage', $event)"
                  />
                </InspectorField>
                <InspectorField label="Overlay" horizontal>
                  <div class="flex items-center gap-2">
                    <ColorInput
                      :model-value="backgroundImageOverlay || ''"
                      swatch-only
                      side="left"
                      @update:model-value="emit('update:backgroundImageOverlay', $event)"
                    />
                    <SliderInput
                      v-if="backgroundImageOverlay"
                      class="flex-1"
                      :model-value="String(backgroundImageOverlayOpacity ?? 50)"
                      :min="0"
                      :max="100"
                      :step="5"
                      unit="%"
                      @update:model-value="emit('update:backgroundImageOverlayOpacity', Number($event))"
                    />
                  </div>
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

              <!-- Gradient -->
              <template v-else-if="backgroundType === 'gradient'">
                <InspectorField label="Type" horizontal>
                  <SelectInput
                    :model-value="backgroundGradient?.type || 'linear'"
                    :options="gradientTypeOptions"
                    @update:model-value="updateGradient({ type: $event as 'linear' | 'radial' })"
                  />
                </InspectorField>

                <InspectorField v-if="backgroundGradient?.type !== 'radial'" label="Angle" horizontal>
                  <SliderInput
                    :model-value="String(backgroundGradient?.angle ?? 180)"
                    :min="0"
                    :max="360"
                    :step="1"
                    unit="°"
                    @update:model-value="updateGradient({ angle: Number($event) })"
                  />
                </InspectorField>

                <!-- Gradient Stops -->
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-xs text-muted-foreground">Color Stops</span>
                    <button
                      type="button"
                      class="text-xs text-primary hover:text-primary/80 transition-colors"
                      @click.stop.prevent="addGradientStop"
                    >
                      + Add
                    </button>
                  </div>

                  <div
                    v-for="(stop, index) in (backgroundGradient?.stops || defaultGradientStops)"
                    :key="index"
                    class="flex items-center gap-2"
                  >
                    <ColorInput
                      :model-value="stop.color"
                      swatch-only
                      side="left"
                      @update:model-value="updateGradientStop(index, { color: $event })"
                    />
                    <SliderInput
                      class="flex-1"
                      :model-value="String(stop.position)"
                      :min="0"
                      :max="100"
                      :step="1"
                      unit="%"
                      @update:model-value="updateGradientStop(index, { position: Number($event) })"
                    />
                    <button
                      v-if="(backgroundGradient?.stops?.length || 2) > 2"
                      type="button"
                      class="p-1 text-muted-foreground hover:text-destructive transition-colors"
                      @click.stop.prevent="removeGradientStop(index)"
                    >
                      <Icon name="app-delete" :size="12" />
                    </button>
                  </div>
                </div>

              </template>
            </div>
          </div>
        </template>
      </Popover>
    </InspectorField>

    <!-- Shadow -->
    <InspectorField label="Shadow" horizontal>
      <Popover align="right" width="w-80">
        <template #trigger="{ toggle }">
          <button
            class="flex items-center gap-1.5 px-2 py-1 text-xs rounded-md bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors cursor-pointer"
            @click="toggle"
          >
            <span
              class="w-2 h-2 rounded-full shrink-0"
              :class="shadow?.enabled ? 'bg-white' : 'bg-muted-foreground/30'"
            ></span>
            <span class="truncate">{{ getShadowPreview() }}</span>
          </button>
        </template>
        <template #default="{ close }">
          <div class="p-3" @click.stop>
            <!-- Header -->
            <div class="flex items-center gap-2 mb-3 pb-2">
              <span class="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wide">
                <Icon name="style-color" :size="14" class="text-muted-foreground" />
                Shadow
              </span>
              <div class="flex-1" />
              <Button size="sm" variant="outline" @click.stop.prevent="resetShadow(); close()">Reset</Button>
              <Button size="sm" @click.stop.prevent="close()">Apply</Button>
            </div>
            <!-- Content -->
            <div class="space-y-3">
              <!-- Blur -->
              <InspectorField label="Blur" horizontal>
                <SliderInput
                  :model-value="shadow?.blur || '0'"
                  :min="0"
                  :max="100"
                  unit="px"
                  @update:model-value="emit('update:shadow', { ...shadow, enabled: true, blur: $event })"
                />
              </InspectorField>

              <!-- Spread -->
              <InspectorField label="Spread" horizontal>
                <SliderInput
                  :model-value="shadow?.spread || '0'"
                  :min="-50"
                  :max="100"
                  unit="px"
                  @update:model-value="emit('update:shadow', { ...shadow, enabled: true, spread: $event })"
                />
              </InspectorField>

              <!-- H Position -->
              <InspectorField label="H Position" horizontal>
                <SliderInput
                  :model-value="shadow?.x || '0'"
                  :min="-100"
                  :max="100"
                  unit="px"
                  @update:model-value="emit('update:shadow', { ...shadow, enabled: true, x: $event })"
                />
              </InspectorField>

              <!-- V Position -->
              <InspectorField label="V Position" horizontal>
                <SliderInput
                  :model-value="shadow?.y || '0'"
                  :min="-100"
                  :max="100"
                  unit="px"
                  @update:model-value="emit('update:shadow', { ...shadow, enabled: true, y: $event })"
                />
              </InspectorField>

              <!-- Color -->
              <InspectorField label="Color" horizontal>
                <ColorInput
                  :model-value="shadow?.color || '#000000'"
                  swatch-only
                  side="left"
                  @update:model-value="emit('update:shadow', { ...shadow, enabled: true, color: $event })"
                />
              </InspectorField>

              <!-- Opacity -->
              <InspectorField label="Opacity" horizontal>
                <SliderInput
                  :model-value="String(shadow?.opacity ?? 20)"
                  :min="0"
                  :max="100"
                  unit="%"
                  @update:model-value="emit('update:shadow', { ...shadow, enabled: true, opacity: parseInt($event) || 0 })"
                />
              </InspectorField>
            </div>
          </div>
        </template>
      </Popover>
    </InspectorField>

    <!-- Radius -->
    <InspectorField label="Radius" horizontal>
      <Popover align="right" width="w-80">
        <template #trigger="{ toggle }">
          <button
            class="flex items-center gap-1.5 px-2 py-1 text-xs rounded-md bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors cursor-pointer"
            @click="toggle"
          >
            <span
              class="w-2 h-2 rounded-full shrink-0"
              :class="borderRadius && borderRadius !== '0' && borderRadius !== '0px' ? 'bg-white' : 'bg-muted-foreground/30'"
            ></span>
            <span class="truncate">{{ getRadiusPreview() }}</span>
          </button>
        </template>
        <template #default="{ close }">
          <div class="p-3" @click.stop>
            <!-- Header -->
            <div class="flex items-center gap-2 mb-3 pb-2">
              <span class="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wide">
                <Icon name="style-color" :size="14" class="text-muted-foreground" />
                Radius
              </span>
              <div class="flex-1" />
              <Button size="sm" variant="outline" @click.stop.prevent="resetRadius(); close()">Reset</Button>
              <Button size="sm" @click.stop.prevent="close()">Apply</Button>
            </div>
            <!-- Content -->
            <InspectorField label="Radius" horizontal>
              <SizeInput
                :model-value="borderRadius || ''"
                placeholder="0"
                @update:model-value="emit('update:borderRadius', $event)"
              />
            </InspectorField>
          </div>
        </template>
      </Popover>
    </InspectorField>

    <!-- Border -->
    <InspectorField label="Border" horizontal>
      <Popover align="right" width="w-80">
        <template #trigger="{ toggle }">
          <button
            class="flex items-center gap-1.5 px-2 py-1 text-xs rounded-md bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors cursor-pointer"
            @click="toggle"
          >
            <span
              class="w-2 h-2 rounded-full shrink-0"
              :class="border?.width && border.width !== '0' && border.width !== '0px' ? 'bg-white' : 'bg-muted-foreground/30'"
            ></span>
            <span class="truncate">{{ getBorderPreview() }}</span>
          </button>
        </template>
        <template #default="{ close }">
          <div class="p-3" @click.stop>
            <!-- Header -->
            <div class="flex items-center gap-2 mb-3 pb-2">
              <span class="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wide">
                <Icon name="style-color" :size="14" class="text-muted-foreground" />
                Border
              </span>
              <div class="flex-1" />
              <Button size="sm" variant="outline" @click.stop.prevent="resetBorder(); close()">Reset</Button>
              <Button size="sm" @click.stop.prevent="close()">Apply</Button>
            </div>
            <!-- Content -->
            <BorderInput
              :model-value="border"
              @update:model-value="emit('update:border', $event)"
            />
          </div>
        </template>
      </Popover>
    </InspectorField>

    <!-- Overflow -->
    <InspectorField label="Overflow" horizontal>
      <Popover align="right" width="w-80">
        <template #trigger="{ toggle }">
          <button
            class="flex items-center gap-1.5 px-2 py-1 text-xs rounded-md bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors cursor-pointer"
            @click="toggle"
          >
            <span
              class="w-2 h-2 rounded-full shrink-0"
              :class="overflow === 'hidden' ? 'bg-white' : 'bg-muted-foreground/30'"
            ></span>
            <span class="truncate">{{ getOverflowPreview() }}</span>
          </button>
        </template>
        <template #default="{ close }">
          <div class="p-3" @click.stop>
            <!-- Header -->
            <div class="flex items-center gap-2 mb-3 pb-2">
              <span class="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wide">
                <Icon name="style-color" :size="14" class="text-muted-foreground" />
                Overflow
              </span>
              <div class="flex-1" />
              <Button size="sm" variant="outline" @click.stop.prevent="resetOverflow(); close()">Reset</Button>
              <Button size="sm" @click.stop.prevent="close()">Apply</Button>
            </div>
            <!-- Content -->
            <InspectorField label="Overflow" horizontal>
              <SegmentedControl
                :options="overflowOptions"
                :model-value="overflow || 'visible'"
                @update:model-value="emit('update:overflow', $event as 'visible' | 'hidden')"
              />
            </InspectorField>
          </div>
        </template>
      </Popover>
    </InspectorField>

    <!-- Opacity -->
    <InspectorField label="Opacity" horizontal>
      <Popover align="right" width="w-80">
        <template #trigger="{ toggle }">
          <button
            class="flex items-center gap-1.5 px-2 py-1 text-xs rounded-md bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors cursor-pointer"
            @click="toggle"
          >
            <span
              class="w-2 h-2 rounded-full shrink-0"
              :class="(opacity !== undefined && opacity !== 100 && opacity !== '100') || (mixBlendMode && mixBlendMode !== 'normal') ? 'bg-white' : 'bg-muted-foreground/30'"
            ></span>
            <span class="truncate max-w-24">{{ getOpacityPreview() }}</span>
          </button>
        </template>
        <template #default="{ close }">
          <div class="p-3" @click.stop>
            <!-- Header -->
            <div class="flex items-center gap-2 mb-3 pb-2">
              <span class="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wide">
                <Icon name="style-color" :size="14" class="text-muted-foreground" />
                Opacity
              </span>
              <div class="flex-1" />
              <Button size="sm" variant="outline" @click.stop.prevent="resetOpacity(); close()">Reset</Button>
              <Button size="sm" @click.stop.prevent="close()">Apply</Button>
            </div>
            <!-- Content -->
            <div class="space-y-3">
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
              <InspectorField label="Blend Mode" horizontal>
                <SelectInput
                  :model-value="mixBlendMode || 'normal'"
                  :options="mixBlendModeOptions"
                  @update:model-value="emit('update:mixBlendMode', $event)"
                />
              </InspectorField>
            </div>
          </div>
        </template>
      </Popover>
    </InspectorField>

    <!-- Blur -->
    <InspectorField label="Blur" horizontal>
      <Popover align="right" width="w-80">
        <template #trigger="{ toggle }">
          <button
            class="flex items-center gap-1.5 px-2 py-1 text-xs rounded-md bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors cursor-pointer"
            @click="toggle"
          >
            <span
              class="w-2 h-2 rounded-full shrink-0"
              :class="blur && blur !== '0' && blur !== '' ? 'bg-white' : 'bg-muted-foreground/30'"
            ></span>
            <span class="truncate">{{ getBlurPreview() }}</span>
          </button>
        </template>
        <template #default="{ close }">
          <div class="p-3" @click.stop>
            <!-- Header -->
            <div class="flex items-center gap-2 mb-3 pb-2">
              <span class="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wide">
                <Icon name="style-color" :size="14" class="text-muted-foreground" />
                Blur
              </span>
              <div class="flex-1" />
              <Button size="sm" variant="outline" @click.stop.prevent="resetBlur(); close()">Reset</Button>
              <Button size="sm" @click.stop.prevent="close()">Apply</Button>
            </div>
            <!-- Content -->
            <InspectorField label="Blur Amount" horizontal>
              <SliderInput
                :model-value="blur ?? '0'"
                :min="0"
                :max="20"
                :step="1"
                unit="px"
                @update:model-value="emit('update:blur', $event)"
              />
            </InspectorField>
          </div>
        </template>
      </Popover>
    </InspectorField>

    <!-- Transform -->
    <InspectorField label="Transform" horizontal>
      <Popover align="right" width="w-80">
        <template #trigger="{ toggle }">
          <button
            class="flex items-center gap-1.5 px-2 py-1 text-xs rounded-md bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors cursor-pointer"
            @click="toggle"
          >
            <span
              class="w-2 h-2 rounded-full shrink-0"
              :class="(translateX && translateX !== '0') || (translateY && translateY !== '0') || (rotate && rotate !== '0') || (position && position !== 'relative') ? 'bg-white' : 'bg-muted-foreground/30'"
            ></span>
            <span class="truncate max-w-24">{{ getTransformPreview() }}</span>
          </button>
        </template>
        <template #default="{ close }">
          <div class="p-3" @click.stop>
            <!-- Header -->
            <div class="flex items-center gap-2 mb-3 pb-2">
              <span class="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wide">
                <Icon name="style-color" :size="14" class="text-muted-foreground" />
                Transform
              </span>
              <div class="flex-1" />
              <Button size="sm" variant="outline" @click.stop.prevent="resetTransform(); close()">Reset</Button>
              <Button size="sm" @click.stop.prevent="close()">Apply</Button>
            </div>
            <!-- Content -->
            <div class="space-y-3">
              <InspectorField label="Position" horizontal>
                <SelectInput
                  :model-value="position || 'relative'"
                  :options="positionOptions"
                  @update:model-value="emit('update:position', $event as any)"
                />
              </InspectorField>
              <!-- Inset fields (shown when position is not relative) -->
              <template v-if="position && position !== 'relative'">
                <InspectorField label="Top" horizontal>
                  <SizeInput
                    :model-value="top || ''"
                    placeholder="auto"
                    @update:model-value="emit('update:top', $event)"
                  />
                </InspectorField>
                <InspectorField label="Right" horizontal>
                  <SizeInput
                    :model-value="right || ''"
                    placeholder="auto"
                    @update:model-value="emit('update:right', $event)"
                  />
                </InspectorField>
                <InspectorField label="Bottom" horizontal>
                  <SizeInput
                    :model-value="bottom || ''"
                    placeholder="auto"
                    @update:model-value="emit('update:bottom', $event)"
                  />
                </InspectorField>
                <InspectorField label="Left" horizontal>
                  <SizeInput
                    :model-value="left || ''"
                    placeholder="auto"
                    @update:model-value="emit('update:left', $event)"
                  />
                </InspectorField>
              </template>
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
                  unit="deg"
                  @update:model-value="emit('update:rotate', $event)"
                />
              </InspectorField>
            </div>
          </div>
        </template>
      </Popover>
    </InspectorField>

    <!-- Image Options (Aspect Ratio, Object Fit, Mask) -->
    <template v-if="showImageOptions">
      <InspectorField label="Aspect Ratio" horizontal>
        <Popover align="right" width="w-80">
          <template #trigger="{ toggle }">
            <button
              class="flex items-center gap-1.5 px-2 py-1 text-xs rounded-md bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors cursor-pointer"
              @click="toggle"
            >
              <span
                class="w-2 h-2 rounded-full shrink-0"
                :class="aspectRatio && aspectRatio !== 'auto' ? 'bg-white' : 'bg-muted-foreground/30'"
              ></span>
              <span class="truncate">{{ getAspectRatioPreview() }}</span>
            </button>
          </template>
          <template #default="{ close }">
            <div class="p-3" @click.stop>
              <!-- Header -->
              <div class="flex items-center gap-2 mb-3 pb-2">
                <span class="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wide">
                  <Icon name="style-color" :size="14" class="text-muted-foreground" />
                  Aspect Ratio
                </span>
                <div class="flex-1" />
                <Button size="sm" variant="outline" @click.stop.prevent="resetAspectRatio(); close()">Reset</Button>
                <Button size="sm" @click.stop.prevent="close()">Apply</Button>
              </div>
              <!-- Content -->
              <InspectorField label="Aspect Ratio" horizontal>
                <SelectInput
                  :model-value="aspectRatio || 'auto'"
                  :options="aspectRatioOptions"
                  @update:model-value="emit('update:aspectRatio', $event as any)"
                />
              </InspectorField>
            </div>
          </template>
        </Popover>
      </InspectorField>

      <InspectorField label="Object Fit" horizontal>
        <Popover align="right" width="w-80">
          <template #trigger="{ toggle }">
            <button
              class="flex items-center gap-1.5 px-2 py-1 text-xs rounded-md bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors cursor-pointer"
              @click="toggle"
            >
              <span
                class="w-2 h-2 rounded-full shrink-0"
                :class="objectFit && objectFit !== 'cover' ? 'bg-white' : 'bg-muted-foreground/30'"
              ></span>
              <span class="truncate">{{ getObjectFitPreview() }}</span>
            </button>
          </template>
          <template #default="{ close }">
            <div class="p-3" @click.stop>
              <!-- Header -->
              <div class="flex items-center gap-2 mb-3 pb-2">
                <span class="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wide">
                  <Icon name="style-color" :size="14" class="text-muted-foreground" />
                  Object Fit
                </span>
                <div class="flex-1" />
                <Button size="sm" variant="outline" @click.stop.prevent="resetObjectFit(); close()">Reset</Button>
                <Button size="sm" @click.stop.prevent="close()">Apply</Button>
              </div>
              <!-- Content -->
              <InspectorField label="Object Fit" horizontal>
                <SelectInput
                  :model-value="objectFit || 'cover'"
                  :options="objectFitOptions"
                  @update:model-value="emit('update:objectFit', $event as any)"
                />
              </InspectorField>
            </div>
          </template>
        </Popover>
      </InspectorField>

      <InspectorField label="Mask" horizontal>
        <Popover align="right" width="w-80">
          <template #trigger="{ toggle }">
            <button
              class="flex items-center gap-1.5 px-2 py-1 text-xs rounded-md bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors cursor-pointer"
              @click="toggle"
            >
              <span
                class="w-2 h-2 rounded-full shrink-0"
                :class="mask && mask !== 'none' ? 'bg-white' : 'bg-muted-foreground/30'"
              ></span>
              <span class="truncate">{{ getMaskPreview() }}</span>
            </button>
          </template>
          <template #default="{ close }">
            <div class="p-3" @click.stop>
              <!-- Header -->
              <div class="flex items-center gap-2 mb-3 pb-2">
                <span class="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wide">
                  <Icon name="style-color" :size="14" class="text-muted-foreground" />
                  Mask
                </span>
                <div class="flex-1" />
                <Button size="sm" variant="outline" @click.stop.prevent="resetMask(); close()">Reset</Button>
                <Button size="sm" @click.stop.prevent="close()">Apply</Button>
              </div>
              <!-- Content -->
              <InspectorField label="Mask" horizontal>
                <SelectInput
                  :model-value="mask || 'none'"
                  :options="maskOptions"
                  @update:model-value="emit('update:mask', $event as any)"
                />
              </InspectorField>
            </div>
          </template>
        </Popover>
      </InspectorField>

      <InspectorField label="Adjustments" horizontal>
        <Popover align="right" width="w-80">
          <template #trigger="{ toggle }">
            <button
              class="flex items-center gap-1.5 px-2 py-1 text-xs rounded-md bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors cursor-pointer"
              @click="toggle"
            >
              <span
                class="w-2 h-2 rounded-full shrink-0"
                :class="(brightness !== undefined && brightness !== 100) || (contrast !== undefined && contrast !== 100) || (saturation !== undefined && saturation !== 100) || (hue !== undefined && hue !== 0) || (grayscale !== undefined && grayscale !== 0) ? 'bg-white' : 'bg-muted-foreground/30'"
              ></span>
              <span class="truncate max-w-24">{{ getAdjustmentsPreview() }}</span>
            </button>
          </template>
          <template #default="{ close }">
            <div class="p-3" @click.stop>
              <!-- Header -->
              <div class="flex items-center gap-2 mb-3 pb-2">
                <span class="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wide">
                  <Icon name="style-color" :size="14" class="text-muted-foreground" />
                  Adjustments
                </span>
                <div class="flex-1" />
                <Button size="sm" variant="outline" @click.stop.prevent="resetAdjustments(); close()">Reset</Button>
                <Button size="sm" @click.stop.prevent="close()">Apply</Button>
              </div>
              <!-- Content -->
              <div class="space-y-3">
                <InspectorField label="Brightness" horizontal>
                  <SliderInput
                    :model-value="String(brightness ?? 100)"
                    :min="0"
                    :max="200"
                    :step="5"
                    unit="%"
                    @update:model-value="emit('update:brightness', Number($event))"
                  />
                </InspectorField>
                <InspectorField label="Contrast" horizontal>
                  <SliderInput
                    :model-value="String(contrast ?? 100)"
                    :min="0"
                    :max="200"
                    :step="5"
                    unit="%"
                    @update:model-value="emit('update:contrast', Number($event))"
                  />
                </InspectorField>
                <InspectorField label="Saturation" horizontal>
                  <SliderInput
                    :model-value="String(saturation ?? 100)"
                    :min="0"
                    :max="200"
                    :step="5"
                    unit="%"
                    @update:model-value="emit('update:saturation', Number($event))"
                  />
                </InspectorField>
                <InspectorField label="Hue Rotate" horizontal>
                  <SliderInput
                    :model-value="String(hue ?? 0)"
                    :min="-180"
                    :max="180"
                    :step="5"
                    unit="°"
                    @update:model-value="emit('update:hue', Number($event))"
                  />
                </InspectorField>
                <InspectorField label="Grayscale" horizontal>
                  <SliderInput
                    :model-value="String(grayscale ?? 0)"
                    :min="0"
                    :max="100"
                    :step="5"
                    unit="%"
                    @update:model-value="emit('update:grayscale', Number($event))"
                  />
                </InspectorField>
              </div>
            </div>
          </template>
        </Popover>
      </InspectorField>
    </template>
  </InspectorSection>
</template>
