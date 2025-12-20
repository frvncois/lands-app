<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted, defineAsyncComponent } from 'vue'
import type { SectionBlock, SectionBlockType, SliderSettings, SliderStyles, ViewportSize } from '@/types/designer'
import type { ListPresetType } from '@/lib/list-presets'
import { BackgroundMedia } from './index'
import SidebarBlockPicker from '@/components/builder/SidebarBlockPicker.vue'
import { useDesignerStore } from '@/stores/designer'

// Use async component to avoid circular dependency
const PreviewSection = defineAsyncComponent(() => import('../PreviewSection.vue'))

const designerStore = useDesignerStore()

/**
 * SliderBlock - Renders a carousel/slider with navigation
 */
const props = defineProps<{
  block: SectionBlock
  styles: Record<string, string>
  isDropTarget: boolean
  childDropIndex: number | null
  isSelected: boolean
}>()

const emit = defineEmits<{
  (e: 'dragEnter', event: DragEvent): void
  (e: 'dragOver', event: DragEvent): void
  (e: 'dragLeave', event: DragEvent): void
  (e: 'drop', event: DragEvent): void
  (e: 'childDragOver', index: number, event: DragEvent): void
  (e: 'childDragLeave'): void
  (e: 'addBlock', type: SectionBlockType): void
  (e: 'addListPreset', type: ListPresetType): void
}>()

const settings = computed(() => props.block.settings as SliderSettings)
const sliderStyles = computed(() => props.block.styles as SliderStyles)

// Current viewport from editor store
const viewport = computed(() => designerStore.viewport as ViewportSize)

// Get responsive slides in view
const slidesInView = computed(() => {
  if (viewport.value === 'mobile' && settings.value.slidesInViewMobile !== undefined) {
    return settings.value.slidesInViewMobile
  }
  if (viewport.value === 'tablet' && settings.value.slidesInViewTablet !== undefined) {
    return settings.value.slidesInViewTablet
  }
  return settings.value.slidesInView ?? 1
})

// Separate children into arrows and slides
const prevArrow = computed(() => {
  const roles = settings.value.childRoles || {}
  return props.block.children?.find(child => roles[child.id] === 'arrow-prev')
})

const nextArrow = computed(() => {
  const roles = settings.value.childRoles || {}
  return props.block.children?.find(child => roles[child.id] === 'arrow-next')
})

const slides = computed(() => {
  const roles = settings.value.childRoles || {}
  return props.block.children?.filter(child =>
    !roles[child.id] || roles[child.id] === 'slide'
  ) || []
})

// Current slide index (0-based)
const currentIndex = ref(0)

// Total slides
const totalSlides = computed(() => slides.value.length)

// Can navigate
const canGoPrev = computed(() => currentIndex.value > 0)
const canGoNext = computed(() => currentIndex.value < totalSlides.value - Math.ceil(slidesInView.value))

// Navigation handlers
function goToSlide(index: number) {
  const maxIndex = Math.max(0, totalSlides.value - Math.ceil(slidesInView.value))
  currentIndex.value = Math.max(0, Math.min(index, maxIndex))
}

function goPrev() {
  if (canGoPrev.value) {
    goToSlide(currentIndex.value - 1)
  }
}

function goNext() {
  if (canGoNext.value) {
    goToSlide(currentIndex.value + 1)
  } else if (settings.value.autoplay) {
    // Loop back to start when autoplay is on
    goToSlide(0)
  }
}

// Autoplay
let autoplayTimer: ReturnType<typeof setInterval> | null = null
const isPaused = ref(false)

function startAutoplay() {
  if (!settings.value.autoplay || autoplayTimer) return
  autoplayTimer = setInterval(() => {
    if (!isPaused.value) {
      if (canGoNext.value) {
        goNext()
      } else {
        // Loop back to start
        goToSlide(0)
      }
    }
  }, settings.value.autoplayInterval || 3000)
}

function stopAutoplay() {
  if (autoplayTimer) {
    clearInterval(autoplayTimer)
    autoplayTimer = null
  }
}

function handleMouseEnter() {
  if (settings.value.pauseOnHover) {
    isPaused.value = true
  }
}

function handleMouseLeave() {
  isPaused.value = false
}

// Watch for autoplay setting changes
watch(() => settings.value.autoplay, (enabled) => {
  if (enabled) {
    startAutoplay()
  } else {
    stopAutoplay()
  }
}, { immediate: true })

// Reset current index when slides change
watch(() => slides.value.length, () => {
  if (currentIndex.value >= totalSlides.value - Math.ceil(slidesInView.value)) {
    currentIndex.value = Math.max(0, totalSlides.value - Math.ceil(slidesInView.value))
  }
})

onMounted(() => {
  if (settings.value.autoplay) {
    startAutoplay()
  }
})

onUnmounted(() => {
  stopAutoplay()
})

// Compute transform for slide transition
const slideTransform = computed(() => {
  if (settings.value.transition === 'fade') {
    return {} // Fade uses opacity, not transform
  }
  const slideWidth = 100 / slidesInView.value
  const offset = currentIndex.value * slideWidth
  return {
    transform: `translateX(-${offset}%)`,
    transition: `transform ${settings.value.transitionDuration || 300}ms ease-out`,
  }
})

// Compute slide width
const slideWidthStyle = computed(() => {
  const gapValue = settings.value.slideGap || '0px'
  const width = 100 / slidesInView.value
  // Account for gap: each slide is narrower by (gap * (n-1) / n) where n = slidesInView
  return `calc(${width}% - ${gapValue} * ${(slidesInView.value - 1) / slidesInView.value})`
})
</script>

<template>
  <div
    class="relative overflow-visible"
    :style="{
      ...styles,
      backgroundColor: settings?.backgroundType && settings.backgroundType !== 'color' ? undefined : styles.backgroundColor,
    }"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @dragenter="emit('dragEnter', $event)"
    @dragover="emit('dragOver', $event)"
    @dragleave="emit('dragLeave', $event)"
    @drop="emit('drop', $event)"
  >
    <!-- Background Media -->
    <BackgroundMedia
      :type="settings?.backgroundType"
      :image="settings?.backgroundImage"
      :video="settings?.backgroundVideo"
      :image-opacity="settings?.backgroundImageOpacity"
      :image-blur="settings?.backgroundImageBlur"
      :image-saturation="settings?.backgroundImageSaturation"
      :image-overlay="settings?.backgroundImageOverlay"
      :image-overlay-opacity="settings?.backgroundImageOverlayOpacity"
    />

    <!-- Slides container -->
    <div class="relative w-full overflow-hidden z-10">
      <div
        class="flex"
        :style="{
          ...slideTransform,
          gap: settings.slideGap || '0',
        }"
      >
        <template v-for="(slide, slideIndex) in slides" :key="slide.id">
          <div
            class="flex-shrink-0"
            :style="{ width: slideWidthStyle }"
            :class="{
              'transition-opacity duration-300': settings.transition === 'fade',
              'opacity-100': settings.transition !== 'fade' || slideIndex === currentIndex,
              'opacity-0 absolute inset-0': settings.transition === 'fade' && slideIndex !== currentIndex,
            }"
            @dragover="emit('childDragOver', slideIndex, $event)"
            @dragleave="emit('childDragLeave')"
          >
            <PreviewSection
              :block="slide"
              :index="slideIndex"
              :total="slides.length"
            />
          </div>
        </template>
      </div>
    </div>

    <!-- OUTSIDE arrows - positioned outside the container with negative offset -->
    <template v-if="settings.showArrows && settings.arrowPosition === 'outside'">
      <div
        v-if="prevArrow"
        class="absolute z-20 cursor-pointer hover:opacity-80 transition-opacity"
        :style="{ left: 0, top: '50%', transform: 'translateX(-100%) translateY(-50%)' }"
        :class="{ 'opacity-30 pointer-events-none': !canGoPrev }"
        @click.stop="goPrev"
      >
        <PreviewSection
          :block="prevArrow"
          :index="0"
          :total="1"
        />
      </div>
      <div
        v-if="nextArrow"
        class="absolute z-20 cursor-pointer hover:opacity-80 transition-opacity"
        :style="{ right: 0, top: '50%', transform: 'translateX(100%) translateY(-50%)' }"
        :class="{ 'opacity-30 pointer-events-none': !canGoNext && !settings.autoplay }"
        @click.stop="goNext"
      >
        <PreviewSection
          :block="nextArrow"
          :index="0"
          :total="1"
        />
      </div>
    </template>

    <!-- INSIDE arrows - positioned inside the container -->
    <template v-if="settings.showArrows && settings.arrowPosition === 'inside'">
      <div
        v-if="prevArrow"
        class="absolute left-4 top-1/2 -translate-y-1/2 z-20 cursor-pointer hover:opacity-80 transition-opacity"
        :class="{ 'opacity-30 pointer-events-none': !canGoPrev }"
        @click.stop="goPrev"
      >
        <PreviewSection
          :block="prevArrow"
          :index="0"
          :total="1"
        />
      </div>
      <div
        v-if="nextArrow"
        class="absolute right-4 top-1/2 -translate-y-1/2 z-20 cursor-pointer hover:opacity-80 transition-opacity"
        :class="{ 'opacity-30 pointer-events-none': !canGoNext && !settings.autoplay }"
        @click.stop="goNext"
      >
        <PreviewSection
          :block="nextArrow"
          :index="0"
          :total="1"
        />
      </div>
    </template>

    <!-- Current slide indicator (editor only - when selected) -->
    <div
      v-if="isSelected && totalSlides > 1"
      class="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-20"
    >
      <button
        v-for="(_, idx) in slides"
        :key="idx"
        class="w-2 h-2 rounded-full transition-colors"
        :class="idx === currentIndex ? 'bg-primary' : 'bg-primary/30 hover:bg-primary/50'"
        @click.stop="goToSlide(idx)"
      />
    </div>

    <!-- Empty State (no slides) -->
    <div
      v-if="slides.length === 0"
      class="relative z-30 flex flex-col items-center justify-center py-12 text-muted-foreground border-1 border-dashed border-border/50"
    >
      <SidebarBlockPicker
        mode="nested"
        trigger-label="Add slide"
        @select="(type: string) => emit('addBlock', type as SectionBlockType)"
        @select-list-preset="(type: ListPresetType) => emit('addListPreset', type)"
      />
    </div>
  </div>
</template>
