<script setup lang="ts">
import { ref, computed } from 'vue'
import { useEditorStore } from '@/stores/editor'
import type { SectionBlock, PostSectionStyles, LinkSectionStyles, ProductSectionStyles } from '@/types/editor'
import { buildSectionClasses, buildInlineStyles } from '@/lib/style-utils'
import { socialPlatformIcons } from '@/lib/editor-utils'
import PreviewBlockItem from './PreviewBlockItem.vue'
import PreviewPostItem from './PreviewPostItem.vue'
import PreviewLinkItem from './PreviewLinkItem.vue'
import PreviewProductItem from './PreviewProductItem.vue'
import PreviewFormField from './PreviewFormField.vue'

const props = defineProps<{
  block: SectionBlock
  index: number
  total: number
}>()

const editorStore = useEditorStore()

const isHovered = ref(false)

const isSelected = computed(() =>
  editorStore.selectedBlockId === props.block.id &&
  !editorStore.selectedItemId
)

const canMoveUp = computed(() => props.index > 0)
const canMoveDown = computed(() => props.index < props.total - 1)

const isPostSection = computed(() => props.block.type === 'post')
const isLinkSection = computed(() => props.block.type === 'link')
const isProductSection = computed(() => props.block.type === 'product')
const isHeaderSection = computed(() => props.block.type === 'header')
const isFooterSection = computed(() => props.block.type === 'footer')
const isFormSection = computed(() => props.block.type === 'form')

// Check if header/footer should be hidden
const isHeaderHidden = computed(() => isHeaderSection.value && props.block.headerSettings?.isHidden)
const isFooterHidden = computed(() => isFooterSection.value && props.block.footerSettings?.isHidden)

// Check if this is a protected block (header/footer)
const isProtectedBlock = computed(() => isHeaderSection.value || isFooterSection.value)

const sectionClasses = computed(() => buildSectionClasses(props.block.styles))
const sectionStyles = computed(() => buildInlineStyles(props.block.styles))

// Post section specific styles
const postGridStyles = computed(() => {
  if (!isPostSection.value) return {}
  const styles = props.block.styles as PostSectionStyles
  const columns = styles.columns || 3
  const gap = styles.gap || '24'

  if (styles.layout === 'list') {
    return {
      display: 'flex',
      flexDirection: 'column',
      gap: `${gap}px`,
    }
  }

  return {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    gap: `${gap}px`,
  }
})

// Link section specific styles
const linkGridStyles = computed(() => {
  if (!isLinkSection.value) return {}
  const styles = props.block.styles as LinkSectionStyles
  const columns = styles.columns || 3
  const gap = styles.gap || '24'

  if (styles.layout === 'list') {
    return {
      display: 'flex',
      flexDirection: 'column',
      gap: `${gap}px`,
    }
  }

  return {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    gap: `${gap}px`,
  }
})

// Product section specific styles
const productGridStyles = computed(() => {
  if (!isProductSection.value) return {}
  const styles = props.block.styles as ProductSectionStyles
  const columns = styles.columns || 3
  const gap = styles.gap || '24'

  if (styles.layout === 'list') {
    return {
      display: 'flex',
      flexDirection: 'column',
      gap: `${gap}px`,
    }
  }

  return {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    gap: `${gap}px`,
  }
})

function handleClick(event: MouseEvent) {
  // Only select section if clicking on the section itself, not children
  if (event.target === event.currentTarget) {
    editorStore.selectBlock(props.block.id)
  }
}

function handleMoveUp() {
  if (canMoveUp.value) {
    editorStore.reorderBlocks(props.index, props.index - 1)
  }
}

function handleMoveDown() {
  if (canMoveDown.value) {
    editorStore.reorderBlocks(props.index, props.index + 1)
  }
}

function handleDuplicate() {
  editorStore.duplicateBlock(props.block.id)
}

function handleDelete() {
  editorStore.deleteBlock(props.block.id)
}

function handleSettings() {
  editorStore.selectBlock(props.block.id)
}
</script>

<template>
  <section
    class="relative w-full"
    :class="[sectionClasses]"
    :style="sectionStyles"
    @click="handleClick"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <!-- Hover outline -->
    <div
      v-if="isHovered && !isSelected"
      class="absolute -inset-1 border-2 border-primary/40 rounded pointer-events-none z-10"
    />

    <!-- Selection outline -->
    <div
      v-if="isSelected"
      class="absolute -inset-1 border-2 border-primary rounded pointer-events-none z-10"
    />

    <!-- Section label (on hover or selected) -->
    <div
      v-if="isHovered || isSelected"
      class="absolute -top-6 left-0 px-2 py-0.5 text-xs font-medium rounded z-20"
      :class="isSelected ? 'bg-primary text-primary-foreground' : 'bg-primary/80 text-primary-foreground'"
    >
      {{ block.name }}
    </div>

    <!-- Quick actions (on hover or selected) -->
    <div
      v-if="isHovered || isSelected"
      class="absolute -top-6 right-0 flex items-center gap-0.5 z-20"
    >
      <!-- Move Up (not for protected blocks) -->
      <button
        v-if="!isProtectedBlock"
        class="p-1 rounded text-primary-foreground transition-colors"
        :class="canMoveUp ? 'bg-primary/80 hover:bg-primary' : 'bg-primary/40 cursor-not-allowed'"
        :disabled="!canMoveUp"
        title="Move up"
        @click.stop="handleMoveUp"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
        </svg>
      </button>

      <!-- Move Down (not for protected blocks) -->
      <button
        v-if="!isProtectedBlock"
        class="p-1 rounded text-primary-foreground transition-colors"
        :class="canMoveDown ? 'bg-primary/80 hover:bg-primary' : 'bg-primary/40 cursor-not-allowed'"
        :disabled="!canMoveDown"
        title="Move down"
        @click.stop="handleMoveDown"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <!-- Duplicate (not for protected blocks) -->
      <button
        v-if="!isProtectedBlock"
        class="p-1 rounded bg-primary/80 hover:bg-primary text-primary-foreground transition-colors"
        title="Duplicate"
        @click.stop="handleDuplicate"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </button>

      <!-- Delete (not for protected blocks) -->
      <button
        v-if="!isProtectedBlock"
        class="p-1 rounded bg-destructive/80 hover:bg-destructive text-destructive-foreground transition-colors"
        title="Delete"
        @click.stop="handleDelete"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>

      <!-- Settings -->
      <button
        class="p-1 rounded bg-primary/80 hover:bg-primary text-primary-foreground transition-colors"
        title="Settings"
        @click.stop="handleSettings"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
    </div>

    <!-- Post section -->
    <div v-if="isPostSection && block.postSettings" :style="postGridStyles">
      <PreviewPostItem
        v-for="post in block.postSettings.posts"
        :key="post.id"
        :post="post"
        :settings="block.postSettings"
        :block-id="block.id"
      />
    </div>

    <!-- Link section -->
    <div v-else-if="isLinkSection && block.linkSettings" :style="linkGridStyles">
      <PreviewLinkItem
        v-for="link in block.linkSettings.links"
        :key="link.id"
        :link="link"
        :settings="block.linkSettings"
        :block-id="block.id"
      />
    </div>

    <!-- Product section -->
    <div v-else-if="isProductSection && block.productSettings" :style="productGridStyles">
      <PreviewProductItem
        v-for="product in block.productSettings.products"
        :key="product.id"
        :product="product"
        :settings="block.productSettings"
        :block-id="block.id"
      />
    </div>

    <!-- Header section -->
    <template v-else-if="isHeaderSection && block.headerSettings">
      <div v-if="!isHeaderHidden" class="flex items-center justify-between gap-4">
        <!-- Logo -->
        <div class="flex items-center gap-2">
          <img
            v-if="block.headerSettings.logo"
            :src="block.headerSettings.logo"
            :alt="block.headerSettings.logoAlt || 'Logo'"
            class="h-8 w-auto object-contain"
          />
          <span v-else class="text-lg font-semibold">Logo</span>
        </div>

        <!-- Navigation -->
        <nav class="flex items-center gap-6">
          <a
            v-for="link in block.headerSettings.navLinks"
            :key="link.id"
            :href="link.url || '#'"
            class="text-sm font-medium hover:opacity-80 transition-opacity"
          >
            {{ link.label }}
          </a>
        </nav>

        <!-- CTA Button -->
        <a
          v-if="block.headerSettings.ctaButton.show"
          :href="block.headerSettings.ctaButton.url || '#'"
          class="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          {{ block.headerSettings.ctaButton.label || 'Get Started' }}
        </a>
      </div>
      <div v-else class="py-4 text-center text-muted-foreground text-sm italic border-2 border-dashed border-border rounded-lg">
        Header is hidden
      </div>
    </template>

    <!-- Footer section -->
    <template v-else-if="isFooterSection && block.footerSettings">
      <div v-if="!isFooterHidden" class="flex flex-col gap-6">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <!-- Footer links -->
          <nav class="flex flex-wrap items-center gap-4">
            <a
              v-for="link in block.footerSettings.links"
              :key="link.id"
              :href="link.url || '#'"
              class="text-sm hover:opacity-80 transition-opacity"
            >
              {{ link.label }}
            </a>
          </nav>

          <!-- Social links -->
          <div class="flex items-center gap-3">
            <a
              v-for="social in block.footerSettings.socialLinks"
              :key="social.id"
              :href="social.url || '#'"
              class="text-muted-foreground hover:text-foreground transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i :class="['lni', socialPlatformIcons[social.platform], 'text-lg']"></i>
            </a>
          </div>
        </div>

        <!-- Copyright -->
        <p v-if="block.footerSettings.copyrightText" class="text-sm text-muted-foreground text-center">
          {{ block.footerSettings.copyrightText }}
        </p>
      </div>
      <div v-else class="py-4 text-center text-muted-foreground text-sm italic border-2 border-dashed border-border rounded-lg">
        Footer is hidden
      </div>
    </template>

    <!-- Form section -->
    <template v-else-if="isFormSection && block.formSettings">
      <form class="flex flex-col gap-4" @submit.prevent>
        <PreviewFormField
          v-for="field in block.formSettings.fields"
          :key="field.id"
          :field="field"
          :block-id="block.id"
        />
        <button
          type="submit"
          class="self-start px-6 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          {{ block.formSettings.submitButtonText || 'Submit' }}
        </button>
      </form>
    </template>

    <!-- Regular block items -->
    <div v-else class="flex flex-col gap-4">
      <PreviewBlockItem
        v-for="item in block.children"
        :key="item.id"
        :item="item"
        :block-id="block.id"
      />
    </div>
  </section>
</template>
