<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  name: string
  size?: number | string
}>(), {
  size: 16
})

// Dynamically import SVG icons
const iconModules = import.meta.glob('@/assets/icons/*.svg', {
  eager: true,
  query: '?raw',
  import: 'default'
}) as Record<string, string>

// Build icon map from file names
const icons: Record<string, string> = {}
for (const path in iconModules) {
  const name = path.split('/').pop()?.replace('.svg', '') || ''
  const content = iconModules[path]
  if (content) {
    icons[name] = content
  }
}

// Map old Lineicons names to new MyIcons names
const iconMapping: Record<string, string> = {
  // App icons
  'lni-bar-chart-4': 'app-analytics',
  'lni-user-multiple-4': 'app-collaborators',
  'lni-users': 'app-collaborators',
  'lni-home-2': 'app-dashboard',
  'lni-trash-3': 'app-delete',
  'lni-globe-1': 'app-domain',
  'lni-layers-1': 'app-duplicate',
  'lni-pencil-1': 'app-editor',
  'lni-eye': 'app-show',
  'lni-eye-2': 'app-show',
  'lni-bolt-3': 'app-integration',
  'lni-bell-1': 'app-notification',
  'lni-crown': 'app-plan',
  'lni-cloud-upload': 'app-publish',
  'lni-upload': 'app-publish',
  'lni-upload-1': 'app-publish',
  'lni-xmark': 'app-remove',
  'lni-x': 'app-remove',
  'lni-cross-circle': 'app-remove',
  'lni-xmark-circle': 'app-remove',
  'xmark': 'app-delete',
  'xmark-circle': 'app-delete',
  'lni-search-1': 'app-seo',
  'search-1': 'app-search',
  'lni-gear-1': 'app-settings',
  'lni-cog-1': 'app-settings',
  'lni-sun-1': 'app-theme',
  'lni-reload': 'app-undo',
  'lni-user-4': 'app-user',
  'lni-ban': 'app-hide',
  'lni-power-button': 'app-unpublish',
  'lni-file-multiple': 'app-duplicate',
  'trash-3': 'app-delete',
  'eye': 'app-show',
  'layers-1': 'app-duplicate',
  'globe-1': 'app-language',
  'bold': 'style-text-bold',
  'italic': 'style-text-italic',
  'underline': 'style-text-underline',
  'strikethrough': 'style-text-strike',
  'plus': '+',
  'add-1': '+',
  'lni-plus': '+',

  // Chevrons
  'lni-chevron-down': 'chevron-down',
  'lni-chevron-down-circle': 'chevron-down',
  'lni-chevron-up': 'chevron-top',
  'lni-chevron-right': 'chevron-right',
  'lni-arrow-down': 'chevron-down',
  'lni-arrow-up': 'chevron-top',
  'lni-navigation-down': 'chevron-down',
  'lni-navigation-up': 'chevron-top',

  // Content blocks
  'lni-pointer-1': 'content-button',
  'lni-slice-2': 'content-canvas',
  'lni-line': 'content-divider',
  'lni-line-dashed': 'content-divider',
  'lni-line-dotted': 'content-divider',
  'lni-minus': 'content-divider',
  'lni-clipboard-data': 'content-form',
  'lni-text-format': 'content-heading',
  'lni-star-1': 'content-icon',
  'lni-star': 'content-icon',
  'lni-photos': 'content-image',
  'lni-gallery': 'content-image',
  'lni-text-paragraph': 'content-text',
  'lni-play': 'content-video',
  'lni-video-alt': 'content-video',

  // Layout blocks
  'lni-select-multiple': 'layout-container',
  'lni-grid-3': 'layout-grid',
  'lni-layout-9': 'layout-stack',

  // Lists
  'lni-list-bulleted-1': 'list-link',
  'lni-link-1': 'list-link',
  'lni-link-2': 'list-link',
  'lni-link-2-angular-right': 'list-link',
  'lni-cart-2': 'list-product',
  'lni-credit-card-multiple': 'list-product',
  'lni-comment-1-text': 'list-testimonial',
  'lni-menu-hamburger-1': 'list-menu',
  'lni-menu-cheesburger': 'list-menu',

  // Style icons
  'lni-brush-2': 'style-color',
  'lni-layout-3': 'style-border-top',
  'lni-size': 'style-column',
  'lni-height': 'style-row',
  'lni-align-text-left': 'style-text-left',
  'lni-align-text-center': 'style-text-center',
  'lni-align-text-right': 'style-text-right',
  'lni-shift-left': 'style-justify-start',
  'lni-shift-right': 'style-justify-end',
  'lni-arrow-both-direction-horizontal-1': 'style-justify-between',
  'lni-arrow-both-direction-vertical-1': 'style-align-stretch',
  'lni-arrow-upward': 'style-align-start',
  'lni-arrow-downward': 'style-align-bottom',
  'lni-arrow-right': 'style-row',
  'lni-arrow-left': 'style-invert-row',
  'lni-shift-up': 'style-align-start',
  'lni-shift-down': 'style-align-bottom',
  'lni-layout-26': 'style-column',
  'lni-layout-4': 'layout-grid',
  'lni-enter': 'style-row',

  // Direct mappings for MyIcons names
  'app-ai': 'app-ai',
  'app-analytics': 'app-analytics',
  'app-collaborators': 'app-collaborators',
  'app-dashboard': 'app-dashboard',
  'app-delete': 'app-delete',
  'app-domain': 'app-domain',
  'app-duplicate': 'app-duplicate',
  'app-editor': 'app-editor',
  'app-hide': 'app-hide',
  'app-integration': 'app-integration',
  'app-invoice': 'app-invoice',
  'app-language': 'app-language',
  'app-notification': 'app-notification',
  'app-plan': 'app-plan',
  'app-publish': 'app-publish',
  'app-remove': 'app-remove',
  'app-save': 'app-save',
  'app-seo': 'app-seo',
  'app-settings': 'app-settings',
  'app-show': 'app-show',
  'app-theme': 'app-theme',
  'app-undo': 'app-undo',
  'app-unpublish': 'app-unpublish',
  'app-user': 'app-user',
}

const resolvedName = computed(() => {
  // First check if it's a direct MyIcons name
  if (icons[props.name]) return props.name
  // Then check the mapping
  return iconMapping[props.name] || props.name
})

const isTextIcon = computed(() => {
  return resolvedName.value === '+'
})

const iconExists = computed(() => {
  return isTextIcon.value || !!icons[resolvedName.value]
})

const svgContent = computed(() => {
  const svg = icons[resolvedName.value]
  if (!svg) {
    console.warn(`Icon "${props.name}" not found (resolved: "${resolvedName.value}")`)
    return ''
  }

  // Check if SVG uses class-based styling (has <style> with stroke definitions)
  const hasStrokeStyle = /<style[^>]*>[\s\S]*stroke:/.test(svg)

  let content = svg
    .replace(/<svg[^>]*>/, '')
    .replace(/<\/svg>/, '')
    // Remove <defs> and <style> blocks entirely
    .replace(/<defs>[\s\S]*?<\/defs>/g, '')
    // Replace inline stroke/fill color attributes
    .replace(/stroke="#[^"]*"/g, 'stroke="currentColor"')
    .replace(/fill="#[^"]*"/g, 'fill="currentColor"')
    // Replace CSS stroke/fill properties
    .replace(/stroke:[^;"}]*/g, 'stroke:currentColor')
    .replace(/fill:[^;"}]*/g, 'fill:currentColor')

  // If SVG had class-based stroke styling, add stroke attributes to elements with class="a" etc.
  if (hasStrokeStyle) {
    content = content.replace(/(<(?:path|circle|rect|line|polyline|polygon|ellipse)[^>]*)(class="[^"]*")/g,
      '$1stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"')
  }

  // Remove class attributes
  content = content.replace(/\s*class="[^"]*"/g, '')

  return content
})

const sizeValue = computed(() => {
  return typeof props.size === 'number' ? `${props.size}px` : props.size
})
</script>

<template>
  <!-- Missing icon indicator -->
  <span
    v-if="!iconExists"
    class="missing-icon"
    :style="{ width: sizeValue, height: sizeValue }"
    :title="`Missing: ${name}`"
  />
  <!-- Text icon (like +) -->
  <span
    v-else-if="isTextIcon"
    class="text-icon"
    :style="{ width: sizeValue, height: sizeValue, fontSize: sizeValue }"
    aria-hidden="true"
  >{{ resolvedName }}</span>
  <!-- Actual icon -->
  <svg
    v-else
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    :width="sizeValue"
    :height="sizeValue"
    class="icon"
    aria-hidden="true"
    v-html="svgContent"
  />
</template>

<style scoped>
.icon {
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
}

.missing-icon {
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
  background-color: #ef4444;
  border-radius: 50%;
}

.text-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  flex-shrink: 0;
  font-weight: 400;
  line-height: 1;
}
</style>
