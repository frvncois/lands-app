import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  SectionBlock,
  SectionBlockType,
  BlockItemType,
  BlockItemSettings,
  BlockItemStyles,
  SectionBlockStyles,
  PostItem,
  PostSectionSettings,
  LinkItem,
  LinkSectionSettings,
  ProductItem,
  ProductSectionSettings,
  PageSettings,
  FormField,
  FormFieldType,
  FormSectionSettings,
  HeaderSectionSettings,
  HeaderNavLink,
  FooterSectionSettings,
  FooterLink,
  FooterSocialLink,
} from '@/types/editor'
import type { ProjectContent } from '@/types/project'
import { createSectionBlock, createBlockItem, createPostItem, createLinkItem, createProductItem, createFormField, createHeaderNavLink, createFooterLink, createFooterSocialLink, getDefaultPageSettings, duplicateSectionBlock, duplicateBlockItem } from '@/lib/editor-utils'
import { getThemeById } from '@/lib/themes'
import { useProjectsStore } from '@/stores/projects'
import { useToast } from '@/stores/toast'

export type ViewportSize = 'desktop' | 'tablet' | 'mobile'

// Auto-save configuration
const AUTO_SAVE_DELAY = 2000 // 2 seconds after last change

export const useEditorStore = defineStore('editor', () => {
  const toast = useToast()

  // State
  const currentProjectId = ref<string | null>(null)
  const blocks = ref<SectionBlock[]>([])
  const pageSettings = ref<PageSettings>(getDefaultPageSettings())
  const selectedBlockId = ref<string | null>(null)
  const selectedItemId = ref<string | null>(null)
  const isLoading = ref(false)
  const isSaving = ref(false)
  const hasUnsavedChanges = ref(false)
  const viewport = ref<ViewportSize>('desktop')
  const isSidebarCollapsed = ref(false)
  const isInspectorCollapsed = ref(false)
  const autoSaveEnabled = ref(true)
  const lastSavedAt = ref<string | null>(null)

  // Auto-save timer
  let autoSaveTimer: ReturnType<typeof setTimeout> | null = null

  // Debounced auto-save function
  function scheduleAutoSave() {
    if (!autoSaveEnabled.value || !currentProjectId.value) return

    // Clear existing timer
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer)
    }

    // Schedule new save
    autoSaveTimer = setTimeout(async () => {
      if (hasUnsavedChanges.value && !isSaving.value) {
        await saveProject()
      }
    }, AUTO_SAVE_DELAY)
  }

  // Mark content as changed and schedule auto-save
  function markAsChanged() {
    hasUnsavedChanges.value = true
    scheduleAutoSave()
  }

  // Cancel pending auto-save (useful when navigating away)
  function cancelAutoSave() {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer)
      autoSaveTimer = null
    }
  }

  // Getters
  const selectedBlock = computed(() => {
    if (!selectedBlockId.value) return null
    return blocks.value.find((b) => b.id === selectedBlockId.value) ?? null
  })

  const selectedItem = computed(() => {
    if (!selectedBlockId.value || !selectedItemId.value) return null
    const block = blocks.value.find((b) => b.id === selectedBlockId.value)
    if (!block) return null
    return block.children.find((c) => c.id === selectedItemId.value) ?? null
  })

  // Get selected post item (for post sections)
  const selectedPostItem = computed(() => {
    if (!selectedBlockId.value || !selectedItemId.value) return null
    const block = blocks.value.find((b) => b.id === selectedBlockId.value)
    if (!block || block.type !== 'post' || !block.postSettings) return null
    return block.postSettings.posts.find((p) => p.id === selectedItemId.value) ?? null
  })

  // Get selected link item (for link sections)
  const selectedLinkItem = computed(() => {
    if (!selectedBlockId.value || !selectedItemId.value) return null
    const block = blocks.value.find((b) => b.id === selectedBlockId.value)
    if (!block || block.type !== 'link' || !block.linkSettings) return null
    return block.linkSettings.links.find((l) => l.id === selectedItemId.value) ?? null
  })

  // Get selected product item (for product sections)
  const selectedProductItem = computed(() => {
    if (!selectedBlockId.value || !selectedItemId.value) return null
    const block = blocks.value.find((b) => b.id === selectedBlockId.value)
    if (!block || block.type !== 'product' || !block.productSettings) return null
    return block.productSettings.products.find((p) => p.id === selectedItemId.value) ?? null
  })

  // Get selected form field (for form sections)
  const selectedFormField = computed(() => {
    if (!selectedBlockId.value || !selectedItemId.value) return null
    const block = blocks.value.find((b) => b.id === selectedBlockId.value)
    if (!block || block.type !== 'form' || !block.formSettings) return null
    return block.formSettings.fields.find((f) => f.id === selectedItemId.value) ?? null
  })

  // Get selected header nav link (for header sections)
  const selectedHeaderNavLink = computed(() => {
    if (!selectedBlockId.value || !selectedItemId.value) return null
    const block = blocks.value.find((b) => b.id === selectedBlockId.value)
    if (!block || block.type !== 'header' || !block.headerSettings) return null
    return block.headerSettings.navLinks.find((l) => l.id === selectedItemId.value) ?? null
  })

  // Get selected footer link (for footer sections)
  const selectedFooterLink = computed(() => {
    if (!selectedBlockId.value || !selectedItemId.value) return null
    const block = blocks.value.find((b) => b.id === selectedBlockId.value)
    if (!block || block.type !== 'footer' || !block.footerSettings) return null
    return block.footerSettings.links.find((l) => l.id === selectedItemId.value) ?? null
  })

  // Get selected footer social link (for footer sections)
  const selectedFooterSocialLink = computed(() => {
    if (!selectedBlockId.value || !selectedItemId.value) return null
    const block = blocks.value.find((b) => b.id === selectedBlockId.value)
    if (!block || block.type !== 'footer' || !block.footerSettings) return null
    return block.footerSettings.socialLinks.find((l) => l.id === selectedItemId.value) ?? null
  })

  // Helper to check if a block is protected (header/footer)
  function isProtectedBlock(blockId: string): boolean {
    const block = blocks.value.find(b => b.id === blockId)
    return block?.type === 'header' || block?.type === 'footer'
  }

  // Viewport width based on current viewport size
  const viewportWidth = computed(() => {
    switch (viewport.value) {
      case 'desktop': return '100%'
      case 'tablet': return '768px'
      case 'mobile': return '375px'
    }
  })

  // Actions
  function setViewport(size: ViewportSize) {
    viewport.value = size
  }

  function toggleSidebar() {
    isSidebarCollapsed.value = !isSidebarCollapsed.value
  }

  function toggleInspector() {
    isInspectorCollapsed.value = !isInspectorCollapsed.value
  }
  function addBlock(type: SectionBlockType, index?: number) {
    // Don't allow adding header or footer blocks manually
    if (type === 'header' || type === 'footer') return null

    const block = createSectionBlock(type)

    // Find the footer index (if exists)
    const footerIndex = blocks.value.findIndex(b => b.type === 'footer')

    if (index !== undefined) {
      // Ensure we don't insert at position 0 if header exists
      const headerExists = blocks.value[0]?.type === 'header'
      const minIndex = headerExists ? 1 : 0

      // Ensure we don't insert after footer
      const maxIndex = footerIndex !== -1 ? footerIndex : blocks.value.length

      const safeIndex = Math.max(minIndex, Math.min(index, maxIndex))
      blocks.value.splice(safeIndex, 0, block)
    } else {
      // When no index specified, insert before footer (or at end if no footer)
      if (footerIndex !== -1) {
        blocks.value.splice(footerIndex, 0, block)
      } else {
        blocks.value.push(block)
      }
    }
    selectedBlockId.value = block.id
    selectedItemId.value = null
    markAsChanged()
    return block
  }

  function deleteBlock(blockId: string) {
    // Protect header and footer blocks from deletion
    if (isProtectedBlock(blockId)) return

    const index = blocks.value.findIndex((b) => b.id === blockId)
    if (index !== -1) {
      blocks.value.splice(index, 1)
      if (selectedBlockId.value === blockId) {
        selectedBlockId.value = null
        selectedItemId.value = null
      }
      markAsChanged()
    }
  }

  function duplicateBlock(blockId: string) {
    // Protect header and footer blocks from duplication
    if (isProtectedBlock(blockId)) return null

    const index = blocks.value.findIndex((b) => b.id === blockId)
    if (index === -1) return null

    const block = blocks.value[index]
    if (!block) return null

    const newBlock = duplicateSectionBlock(block)
    blocks.value.splice(index + 1, 0, newBlock)
    selectedBlockId.value = newBlock.id
    selectedItemId.value = null
    markAsChanged()
    return newBlock
  }

  function reorderBlocks(fromIndex: number, toIndex: number) {
    const block = blocks.value[fromIndex]
    // Protect header and footer blocks from being moved
    if (!block || block.type === 'header' || block.type === 'footer') return

    // Don't allow moving to position 0 if header exists there
    if (toIndex === 0 && blocks.value[0]?.type === 'header') return

    // Don't allow moving to last position if footer exists there
    const lastIndex = blocks.value.length - 1
    if (toIndex === lastIndex && blocks.value[lastIndex]?.type === 'footer') return

    const [movedBlock] = blocks.value.splice(fromIndex, 1)
    if (movedBlock) {
      blocks.value.splice(toIndex, 0, movedBlock)
      markAsChanged()
    }
  }

  function selectBlock(blockId: string | null, itemId: string | null = null) {
    selectedBlockId.value = blockId
    selectedItemId.value = itemId
  }

  function addBlockItem(blockId: string, type: BlockItemType, index?: number) {
    const block = blocks.value.find((b) => b.id === blockId)
    if (!block) return null

    const item = createBlockItem(type)
    if (index !== undefined) {
      block.children.splice(index, 0, item)
    } else {
      block.children.push(item)
    }
    selectedItemId.value = item.id
    markAsChanged()
    return item
  }

  function deleteBlockItem(blockId: string, itemId: string) {
    const block = blocks.value.find((b) => b.id === blockId)
    if (!block) return

    const index = block.children.findIndex((c) => c.id === itemId)
    if (index !== -1) {
      block.children.splice(index, 1)
      if (selectedItemId.value === itemId) {
        selectedItemId.value = null
      }
      markAsChanged()
    }
  }

  function duplicateItem(blockId: string, itemId: string) {
    const block = blocks.value.find((b) => b.id === blockId)
    if (!block) return null

    const index = block.children.findIndex((c) => c.id === itemId)
    if (index === -1) return null

    const item = block.children[index]
    if (!item) return null

    const newItem = duplicateBlockItem(item)
    block.children.splice(index + 1, 0, newItem)
    selectedItemId.value = newItem.id
    markAsChanged()
    return newItem
  }

  function reorderBlockItems(blockId: string, fromIndex: number, toIndex: number) {
    const block = blocks.value.find((b) => b.id === blockId)
    if (!block) return

    const [item] = block.children.splice(fromIndex, 1)
    if (item) {
      block.children.splice(toIndex, 0, item)
      markAsChanged()
    }
  }

  function updateBlockStyles(blockId: string, styles: Partial<SectionBlockStyles>) {
    const block = blocks.value.find((b) => b.id === blockId)
    if (block) {
      block.styles = { ...block.styles, ...styles }
      markAsChanged()
    }
  }

  function updateBlockItemSettings(blockId: string, itemId: string, settings: Partial<BlockItemSettings>) {
    const block = blocks.value.find((b) => b.id === blockId)
    if (!block) return

    const item = block.children.find((c) => c.id === itemId)
    if (item) {
      item.settings = { ...item.settings, ...settings } as BlockItemSettings
      markAsChanged()
    }
  }

  function updateBlockItemStyles(blockId: string, itemId: string, styles: Partial<BlockItemStyles>) {
    const block = blocks.value.find((b) => b.id === blockId)
    if (!block) return

    const item = block.children.find((c) => c.id === itemId)
    if (item) {
      item.styles = { ...item.styles, ...styles }
      markAsChanged()
    }
  }

  function updateBlockName(blockId: string, name: string) {
    const block = blocks.value.find((b) => b.id === blockId)
    if (block) {
      block.name = name
      markAsChanged()
    }
  }

  // Post item actions
  function addPostItem(blockId: string) {
    const block = blocks.value.find((b) => b.id === blockId)
    if (!block || block.type !== 'post' || !block.postSettings) return null

    const post = createPostItem()
    block.postSettings.posts.push(post)
    selectedItemId.value = post.id
    markAsChanged()
    return post
  }

  function deletePostItem(blockId: string, postId: string) {
    const block = blocks.value.find((b) => b.id === blockId)
    if (!block || block.type !== 'post' || !block.postSettings) return

    const index = block.postSettings.posts.findIndex((p) => p.id === postId)
    if (index !== -1) {
      block.postSettings.posts.splice(index, 1)
      if (selectedItemId.value === postId) {
        selectedItemId.value = null
      }
      markAsChanged()
    }
  }

  function reorderPostItems(blockId: string, fromIndex: number, toIndex: number) {
    const block = blocks.value.find((b) => b.id === blockId)
    if (!block || block.type !== 'post' || !block.postSettings) return

    const [post] = block.postSettings.posts.splice(fromIndex, 1)
    if (post) {
      block.postSettings.posts.splice(toIndex, 0, post)
      markAsChanged()
    }
  }

  function updatePostItem(blockId: string, postId: string, updates: Partial<PostItem>) {
    const block = blocks.value.find((b) => b.id === blockId)
    if (!block || block.type !== 'post' || !block.postSettings) return

    const post = block.postSettings.posts.find((p) => p.id === postId)
    if (post) {
      Object.assign(post, updates)
      markAsChanged()
    }
  }

  function updatePostSectionSettings(blockId: string, settings: Partial<PostSectionSettings>) {
    const block = blocks.value.find((b) => b.id === blockId)
    if (!block || block.type !== 'post' || !block.postSettings) return

    block.postSettings = { ...block.postSettings, ...settings }
    markAsChanged()
  }

  // Link item actions
  function addLinkItem(blockId: string) {
    const block = blocks.value.find((b) => b.id === blockId)
    if (!block || block.type !== 'link' || !block.linkSettings) return null

    const link = createLinkItem()
    block.linkSettings.links.push(link)
    selectedItemId.value = link.id
    markAsChanged()
    return link
  }

  function deleteLinkItem(blockId: string, linkId: string) {
    const block = blocks.value.find((b) => b.id === blockId)
    if (!block || block.type !== 'link' || !block.linkSettings) return

    const index = block.linkSettings.links.findIndex((l) => l.id === linkId)
    if (index !== -1) {
      block.linkSettings.links.splice(index, 1)
      if (selectedItemId.value === linkId) {
        selectedItemId.value = null
      }
      markAsChanged()
    }
  }

  function reorderLinkItems(blockId: string, fromIndex: number, toIndex: number) {
    const block = blocks.value.find((b) => b.id === blockId)
    if (!block || block.type !== 'link' || !block.linkSettings) return

    const [link] = block.linkSettings.links.splice(fromIndex, 1)
    if (link) {
      block.linkSettings.links.splice(toIndex, 0, link)
      markAsChanged()
    }
  }

  function updateLinkItem(blockId: string, linkId: string, updates: Partial<LinkItem>) {
    const block = blocks.value.find((b) => b.id === blockId)
    if (!block || block.type !== 'link' || !block.linkSettings) return

    const link = block.linkSettings.links.find((l) => l.id === linkId)
    if (link) {
      Object.assign(link, updates)
      markAsChanged()
    }
  }

  function updateLinkSectionSettings(blockId: string, settings: Partial<LinkSectionSettings>) {
    const block = blocks.value.find((b) => b.id === blockId)
    if (!block || block.type !== 'link' || !block.linkSettings) return

    block.linkSettings = { ...block.linkSettings, ...settings }
    markAsChanged()
  }

  // Product item actions
  function addProductItem(blockId: string) {
    const block = blocks.value.find((b) => b.id === blockId)
    if (!block || block.type !== 'product' || !block.productSettings) return null

    const product = createProductItem()
    block.productSettings.products.push(product)
    selectedItemId.value = product.id
    markAsChanged()
    return product
  }

  function deleteProductItem(blockId: string, productId: string) {
    const block = blocks.value.find((b) => b.id === blockId)
    if (!block || block.type !== 'product' || !block.productSettings) return

    const index = block.productSettings.products.findIndex((p) => p.id === productId)
    if (index !== -1) {
      block.productSettings.products.splice(index, 1)
      if (selectedItemId.value === productId) {
        selectedItemId.value = null
      }
      markAsChanged()
    }
  }

  function reorderProductItems(blockId: string, fromIndex: number, toIndex: number) {
    const block = blocks.value.find((b) => b.id === blockId)
    if (!block || block.type !== 'product' || !block.productSettings) return

    const [product] = block.productSettings.products.splice(fromIndex, 1)
    if (product) {
      block.productSettings.products.splice(toIndex, 0, product)
      markAsChanged()
    }
  }

  function updateProductItem(blockId: string, productId: string, updates: Partial<ProductItem>) {
    const block = blocks.value.find((b) => b.id === blockId)
    if (!block || block.type !== 'product' || !block.productSettings) return

    const product = block.productSettings.products.find((p) => p.id === productId)
    if (product) {
      Object.assign(product, updates)
      markAsChanged()
    }
  }

  function updateProductSectionSettings(blockId: string, settings: Partial<ProductSectionSettings>) {
    const block = blocks.value.find((b) => b.id === blockId)
    if (!block || block.type !== 'product' || !block.productSettings) return

    block.productSettings = { ...block.productSettings, ...settings }
    markAsChanged()
  }

  // Form field actions
  function addFormField(blockId: string, type: FormFieldType) {
    const block = blocks.value.find((b) => b.id === blockId)
    if (!block || block.type !== 'form' || !block.formSettings) return null

    const field = createFormField(type)
    block.formSettings.fields.push(field)
    selectedItemId.value = field.id
    markAsChanged()
    return field
  }

  function deleteFormField(blockId: string, fieldId: string) {
    const block = blocks.value.find((b) => b.id === blockId)
    if (!block || block.type !== 'form' || !block.formSettings) return

    const index = block.formSettings.fields.findIndex((f) => f.id === fieldId)
    if (index !== -1) {
      block.formSettings.fields.splice(index, 1)
      if (selectedItemId.value === fieldId) {
        selectedItemId.value = null
      }
      markAsChanged()
    }
  }

  function reorderFormFields(blockId: string, fromIndex: number, toIndex: number) {
    const block = blocks.value.find((b) => b.id === blockId)
    if (!block || block.type !== 'form' || !block.formSettings) return

    const [field] = block.formSettings.fields.splice(fromIndex, 1)
    if (field) {
      block.formSettings.fields.splice(toIndex, 0, field)
      markAsChanged()
    }
  }

  function updateFormField(blockId: string, fieldId: string, updates: Partial<FormField>) {
    const block = blocks.value.find((b) => b.id === blockId)
    if (!block || block.type !== 'form' || !block.formSettings) return

    const field = block.formSettings.fields.find((f) => f.id === fieldId)
    if (field) {
      Object.assign(field, updates)
      markAsChanged()
    }
  }

  function updateFormSectionSettings(blockId: string, settings: Partial<FormSectionSettings>) {
    const block = blocks.value.find((b) => b.id === blockId)
    if (!block || block.type !== 'form' || !block.formSettings) return

    block.formSettings = { ...block.formSettings, ...settings }
    markAsChanged()
  }

  // Header section actions
  function updateHeaderSettings(blockId: string, settings: Partial<HeaderSectionSettings>) {
    const block = blocks.value.find((b) => b.id === blockId)
    if (!block || block.type !== 'header' || !block.headerSettings) return

    block.headerSettings = { ...block.headerSettings, ...settings }
    markAsChanged()
  }

  function addHeaderNavLink(blockId: string) {
    const block = blocks.value.find((b) => b.id === blockId)
    if (!block || block.type !== 'header' || !block.headerSettings) return null

    const link = createHeaderNavLink()
    block.headerSettings.navLinks.push(link)
    selectedItemId.value = link.id
    markAsChanged()
    return link
  }

  function deleteHeaderNavLink(blockId: string, linkId: string) {
    const block = blocks.value.find((b) => b.id === blockId)
    if (!block || block.type !== 'header' || !block.headerSettings) return

    const index = block.headerSettings.navLinks.findIndex((l) => l.id === linkId)
    if (index !== -1) {
      block.headerSettings.navLinks.splice(index, 1)
      if (selectedItemId.value === linkId) {
        selectedItemId.value = null
      }
      markAsChanged()
    }
  }

  function reorderHeaderNavLinks(blockId: string, fromIndex: number, toIndex: number) {
    const block = blocks.value.find((b) => b.id === blockId)
    if (!block || block.type !== 'header' || !block.headerSettings) return

    const [link] = block.headerSettings.navLinks.splice(fromIndex, 1)
    if (link) {
      block.headerSettings.navLinks.splice(toIndex, 0, link)
      markAsChanged()
    }
  }

  function updateHeaderNavLink(blockId: string, linkId: string, updates: Partial<HeaderNavLink>) {
    const block = blocks.value.find((b) => b.id === blockId)
    if (!block || block.type !== 'header' || !block.headerSettings) return

    const link = block.headerSettings.navLinks.find((l) => l.id === linkId)
    if (link) {
      Object.assign(link, updates)
      markAsChanged()
    }
  }

  // Footer section actions
  function updateFooterSettings(blockId: string, settings: Partial<FooterSectionSettings>) {
    const block = blocks.value.find((b) => b.id === blockId)
    if (!block || block.type !== 'footer' || !block.footerSettings) return

    block.footerSettings = { ...block.footerSettings, ...settings }
    markAsChanged()
  }

  function addFooterLink(blockId: string) {
    const block = blocks.value.find((b) => b.id === blockId)
    if (!block || block.type !== 'footer' || !block.footerSettings) return null

    const link = createFooterLink()
    block.footerSettings.links.push(link)
    selectedItemId.value = link.id
    markAsChanged()
    return link
  }

  function deleteFooterLink(blockId: string, linkId: string) {
    const block = blocks.value.find((b) => b.id === blockId)
    if (!block || block.type !== 'footer' || !block.footerSettings) return

    const index = block.footerSettings.links.findIndex((l) => l.id === linkId)
    if (index !== -1) {
      block.footerSettings.links.splice(index, 1)
      if (selectedItemId.value === linkId) {
        selectedItemId.value = null
      }
      markAsChanged()
    }
  }

  function reorderFooterLinks(blockId: string, fromIndex: number, toIndex: number) {
    const block = blocks.value.find((b) => b.id === blockId)
    if (!block || block.type !== 'footer' || !block.footerSettings) return

    const [link] = block.footerSettings.links.splice(fromIndex, 1)
    if (link) {
      block.footerSettings.links.splice(toIndex, 0, link)
      markAsChanged()
    }
  }

  function updateFooterLink(blockId: string, linkId: string, updates: Partial<FooterLink>) {
    const block = blocks.value.find((b) => b.id === blockId)
    if (!block || block.type !== 'footer' || !block.footerSettings) return

    const link = block.footerSettings.links.find((l) => l.id === linkId)
    if (link) {
      Object.assign(link, updates)
      markAsChanged()
    }
  }

  function addFooterSocialLink(blockId: string, platform: FooterSocialLink['platform'] = 'twitter') {
    const block = blocks.value.find((b) => b.id === blockId)
    if (!block || block.type !== 'footer' || !block.footerSettings) return null

    const link = createFooterSocialLink(platform)
    block.footerSettings.socialLinks.push(link)
    selectedItemId.value = link.id
    markAsChanged()
    return link
  }

  function deleteFooterSocialLink(blockId: string, linkId: string) {
    const block = blocks.value.find((b) => b.id === blockId)
    if (!block || block.type !== 'footer' || !block.footerSettings) return

    const index = block.footerSettings.socialLinks.findIndex((l) => l.id === linkId)
    if (index !== -1) {
      block.footerSettings.socialLinks.splice(index, 1)
      if (selectedItemId.value === linkId) {
        selectedItemId.value = null
      }
      markAsChanged()
    }
  }

  function reorderFooterSocialLinks(blockId: string, fromIndex: number, toIndex: number) {
    const block = blocks.value.find((b) => b.id === blockId)
    if (!block || block.type !== 'footer' || !block.footerSettings) return

    const [link] = block.footerSettings.socialLinks.splice(fromIndex, 1)
    if (link) {
      block.footerSettings.socialLinks.splice(toIndex, 0, link)
      markAsChanged()
    }
  }

  function updateFooterSocialLink(blockId: string, linkId: string, updates: Partial<FooterSocialLink>) {
    const block = blocks.value.find((b) => b.id === blockId)
    if (!block || block.type !== 'footer' || !block.footerSettings) return

    const link = block.footerSettings.socialLinks.find((l) => l.id === linkId)
    if (link) {
      Object.assign(link, updates)
      markAsChanged()
    }
  }

  // Page settings actions
  function updatePageSettings(settings: Partial<PageSettings>) {
    pageSettings.value = { ...pageSettings.value, ...settings }
    markAsChanged()
  }

  // Theme actions
  function applyTheme(themeId: string) {
    const theme = getThemeById(themeId)
    if (!theme) return

    // Apply page settings
    pageSettings.value = { ...theme.pageSettings }

    // Replace all blocks with theme blocks
    blocks.value = [...theme.blocks]

    // Clear selection
    selectedBlockId.value = null
    selectedItemId.value = null
    markAsChanged()
  }

  // Project actions
  async function loadProject(projectId: string, forceReload = false): Promise<boolean> {
    // Skip if already loaded and not forcing reload
    if (currentProjectId.value === projectId && !forceReload) return true

    isLoading.value = true
    try {
      const projectsStore = useProjectsStore()
      const content = await projectsStore.fetchProjectContent(projectId)

      currentProjectId.value = projectId
      if (content) {
        // Deep clone to avoid reference issues
        blocks.value = JSON.parse(JSON.stringify(content.blocks))
        pageSettings.value = JSON.parse(JSON.stringify(content.pageSettings))
      } else {
        blocks.value = []
        pageSettings.value = getDefaultPageSettings()
      }
      selectedBlockId.value = null
      selectedItemId.value = null
      hasUnsavedChanges.value = false
      return true
    } catch (e) {
      console.error('Failed to load project:', e)
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function saveProject(): Promise<boolean> {
    if (!currentProjectId.value) {
      console.log('saveProject: No currentProjectId, skipping save')
      return false
    }

    // Cancel any pending auto-save since we're saving now
    cancelAutoSave()

    console.log('saveProject: Saving project', currentProjectId.value, 'with', blocks.value.length, 'blocks')

    isSaving.value = true
    try {
      const projectsStore = useProjectsStore()
      const success = await projectsStore.saveProjectContent(currentProjectId.value, {
        blocks: blocks.value,
        pageSettings: pageSettings.value,
      })

      if (success) {
        hasUnsavedChanges.value = false
        lastSavedAt.value = new Date().toISOString()
        console.log('saveProject: Save successful at', lastSavedAt.value)
      } else {
        console.error('saveProject: Save failed')
        toast.error('Failed to save changes')
      }
      return success
    } catch (e) {
      console.error('Failed to save project:', e)
      toast.error('Failed to save changes')
      return false
    } finally {
      isSaving.value = false
    }
  }

  function getProjectContent(): ProjectContent {
    return {
      blocks: blocks.value,
      pageSettings: pageSettings.value,
    }
  }

  function setProjectContent(content: ProjectContent) {
    blocks.value = content.blocks
    pageSettings.value = content.pageSettings
    hasUnsavedChanges.value = false
  }

  function resetEditor() {
    currentProjectId.value = null
    blocks.value = []
    pageSettings.value = getDefaultPageSettings()
    selectedBlockId.value = null
    selectedItemId.value = null
    hasUnsavedChanges.value = false
  }

  // Mark changes when modifying content (alias for external use)
  function markUnsavedChanges() {
    hasUnsavedChanges.value = true
    scheduleAutoSave()
  }

  return {
    // State
    currentProjectId,
    blocks,
    pageSettings,
    selectedBlockId,
    selectedItemId,
    isLoading,
    isSaving,
    hasUnsavedChanges,
    viewport,
    isSidebarCollapsed,
    isInspectorCollapsed,
    autoSaveEnabled,
    lastSavedAt,
    // Getters
    selectedBlock,
    selectedItem,
    selectedPostItem,
    selectedLinkItem,
    selectedProductItem,
    selectedFormField,
    selectedHeaderNavLink,
    selectedFooterLink,
    selectedFooterSocialLink,
    viewportWidth,
    // Helpers
    isProtectedBlock,
    // Viewport actions
    setViewport,
    // Panel actions
    toggleSidebar,
    toggleInspector,
    // Auto-save actions
    cancelAutoSave,
    // Project actions
    loadProject,
    saveProject,
    getProjectContent,
    setProjectContent,
    resetEditor,
    markUnsavedChanges,
    // Block actions
    addBlock,
    deleteBlock,
    duplicateBlock,
    reorderBlocks,
    selectBlock,
    addBlockItem,
    deleteBlockItem,
    duplicateItem,
    reorderBlockItems,
    updateBlockStyles,
    updateBlockItemSettings,
    updateBlockItemStyles,
    updateBlockName,
    // Post item actions
    addPostItem,
    deletePostItem,
    reorderPostItems,
    updatePostItem,
    updatePostSectionSettings,
    // Link item actions
    addLinkItem,
    deleteLinkItem,
    reorderLinkItems,
    updateLinkItem,
    updateLinkSectionSettings,
    // Product item actions
    addProductItem,
    deleteProductItem,
    reorderProductItems,
    updateProductItem,
    updateProductSectionSettings,
    // Form field actions
    addFormField,
    deleteFormField,
    reorderFormFields,
    updateFormField,
    updateFormSectionSettings,
    // Header actions
    updateHeaderSettings,
    addHeaderNavLink,
    deleteHeaderNavLink,
    reorderHeaderNavLinks,
    updateHeaderNavLink,
    // Footer actions
    updateFooterSettings,
    addFooterLink,
    deleteFooterLink,
    reorderFooterLinks,
    updateFooterLink,
    addFooterSocialLink,
    deleteFooterSocialLink,
    reorderFooterSocialLinks,
    updateFooterSocialLink,
    // Page settings actions
    updatePageSettings,
    // Theme actions
    applyTheme,
  }
})
