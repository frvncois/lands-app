import { ref, computed, type Ref } from 'vue'
import type {
  SectionBlock,
  LanguageCode,
  ProjectTranslations,
  BlockTranslation,
  HeaderSettings,
  FooterSettings,
  FormSettings,
} from '@/types/editor'
import { DEFAULT_LANGUAGE } from '@/lib/languages'

export interface UseTranslationsOptions {
  blocks: Ref<SectionBlock[]>
  onBeforeChange: () => void
}

export function useTranslations(options: UseTranslationsOptions) {
  const { blocks, onBeforeChange } = options

  // Translation state
  const translations = ref<ProjectTranslations>({
    defaultLanguage: DEFAULT_LANGUAGE,
    languages: {},
  })
  const currentLanguage = ref<LanguageCode | null>(null)

  // Computed: list of available translation languages (excluding default)
  const availableTranslations = computed(() => {
    return Object.keys(translations.value.languages) as LanguageCode[]
  })

  // Computed: check if currently editing a translation
  const isEditingTranslation = computed(() => currentLanguage.value !== null)

  /**
   * Set the default language
   */
  function setDefaultLanguage(langCode: LanguageCode) {
    onBeforeChange()
    translations.value.defaultLanguage = langCode
  }

  /**
   * Copy all translatable content from blocks to a translation
   */
  function copyContentToTranslation(langCode: LanguageCode) {
    if (!translations.value.languages[langCode]) return

    const langTranslations = translations.value.languages[langCode]

    function extractTranslations(blockList: SectionBlock[]) {
      for (const block of blockList) {
        const translation: BlockTranslation = {}
        const settings = block.settings as Record<string, unknown>

        switch (block.type) {
          case 'heading':
          case 'text':
            if (settings.content) translation.content = settings.content as string
            break
          case 'image':
            if (settings.alt) translation.alt = settings.alt as string
            if (settings.caption) translation.caption = settings.caption as string
            break
          case 'button':
            if (settings.label) translation.label = settings.label as string
            break
          case 'header':
            const headerSettings = settings as unknown as HeaderSettings
            if (headerSettings.navLinks) {
              translation.navLinks = headerSettings.navLinks.map(l => ({ id: l.id, label: l.label }))
            }
            if (headerSettings.ctaButton?.label) {
              translation.ctaButtonLabel = headerSettings.ctaButton.label
            }
            break
          case 'footer':
            const footerSettings = settings as unknown as FooterSettings
            if (footerSettings.copyrightText) translation.copyrightText = footerSettings.copyrightText
            if (footerSettings.links) {
              translation.footerLinks = footerSettings.links.map(l => ({ id: l.id, label: l.label }))
            }
            break
          case 'form':
            const formSettings = settings as unknown as FormSettings
            if (formSettings.successMessage) translation.successMessage = formSettings.successMessage
            if (formSettings.errorMessage) translation.errorMessage = formSettings.errorMessage
            break
          case 'form-input':
          case 'form-textarea':
          case 'form-select':
          case 'form-radio':
          case 'form-checkbox':
            if (settings.label) translation.label = settings.label as string
            if (settings.placeholder) translation.placeholder = settings.placeholder as string
            break
          case 'form-button':
            if (settings.label) translation.label = settings.label as string
            break
        }

        // Only store if there's translatable content
        if (Object.keys(translation).length > 0) {
          langTranslations.blocks[block.id] = translation
        }

        // Process children
        if (block.children) {
          extractTranslations(block.children)
        }
      }
    }

    extractTranslations(blocks.value)
  }

  /**
   * Add a new translation language
   */
  function addTranslation(langCode: LanguageCode) {
    if (translations.value.languages[langCode]) return

    onBeforeChange()

    // Initialize with empty translations
    translations.value.languages[langCode] = {
      blocks: {},
    }

    // Copy current content as initial translation values
    copyContentToTranslation(langCode)
  }

  /**
   * Remove a translation language
   */
  function removeTranslation(langCode: LanguageCode) {
    if (!translations.value.languages[langCode]) return

    onBeforeChange()
    delete translations.value.languages[langCode]

    // If currently viewing this language, switch back to default
    if (currentLanguage.value === langCode) {
      currentLanguage.value = null
    }
  }

  /**
   * Switch to editing a specific language (null = default/source)
   */
  function setCurrentLanguage(langCode: LanguageCode | null) {
    currentLanguage.value = langCode
  }

  /**
   * Get translated content for a block in the current language
   */
  function getTranslatedContent(blockId: string, field: keyof BlockTranslation): string | undefined {
    if (!currentLanguage.value) return undefined
    const langTranslations = translations.value.languages[currentLanguage.value]
    if (!langTranslations) return undefined
    const blockTranslation = langTranslations.blocks[blockId]
    if (!blockTranslation) return undefined
    return blockTranslation[field] as string | undefined
  }

  /**
   * Update translation for a specific block field
   */
  function updateBlockTranslation(blockId: string, field: keyof BlockTranslation, value: string) {
    if (!currentLanguage.value) return

    onBeforeChange()

    let langTranslations = translations.value.languages[currentLanguage.value]

    // Create language entry if it doesn't exist
    if (!langTranslations) {
      translations.value.languages[currentLanguage.value] = { blocks: {} }
      langTranslations = translations.value.languages[currentLanguage.value]!
    }

    // Create block entry if it doesn't exist
    if (!langTranslations.blocks[blockId]) {
      langTranslations.blocks[blockId] = {}
    }

    // Update the field
    langTranslations.blocks[blockId] = {
      ...langTranslations.blocks[blockId],
      [field]: value,
    }
  }

  /**
   * Get translated nav link label for header
   */
  function getTranslatedNavLinkLabel(blockId: string, linkId: string): string | undefined {
    if (!currentLanguage.value) return undefined
    const langTranslations = translations.value.languages[currentLanguage.value]
    if (!langTranslations) return undefined
    const blockTranslation = langTranslations.blocks[blockId]
    if (!blockTranslation?.navLinks) return undefined
    const link = blockTranslation.navLinks.find(l => l.id === linkId)
    return link?.label
  }

  /**
   * Update translated nav link label for header
   */
  function updateTranslatedNavLinkLabel(blockId: string, linkId: string, label: string) {
    if (!currentLanguage.value) return

    onBeforeChange()

    const langTranslations = translations.value.languages[currentLanguage.value]
    if (!langTranslations) return

    if (!langTranslations.blocks[blockId]) {
      langTranslations.blocks[blockId] = {}
    }

    const blockTranslation = langTranslations.blocks[blockId]
    if (!blockTranslation.navLinks) {
      blockTranslation.navLinks = []
    }

    const existingLink = blockTranslation.navLinks.find(l => l.id === linkId)
    if (existingLink) {
      existingLink.label = label
    } else {
      blockTranslation.navLinks.push({ id: linkId, label })
    }
  }

  /**
   * Get translated footer link label
   */
  function getTranslatedFooterLinkLabel(blockId: string, linkId: string): string | undefined {
    if (!currentLanguage.value) return undefined
    const langTranslations = translations.value.languages[currentLanguage.value]
    if (!langTranslations) return undefined
    const blockTranslation = langTranslations.blocks[blockId]
    if (!blockTranslation?.footerLinks) return undefined
    const link = blockTranslation.footerLinks.find(l => l.id === linkId)
    return link?.label
  }

  /**
   * Update translated footer link label
   */
  function updateTranslatedFooterLinkLabel(blockId: string, linkId: string, label: string) {
    if (!currentLanguage.value) return

    onBeforeChange()

    const langTranslations = translations.value.languages[currentLanguage.value]
    if (!langTranslations) return

    if (!langTranslations.blocks[blockId]) {
      langTranslations.blocks[blockId] = {}
    }

    const blockTranslation = langTranslations.blocks[blockId]
    if (!blockTranslation.footerLinks) {
      blockTranslation.footerLinks = []
    }

    const existingLink = blockTranslation.footerLinks.find(l => l.id === linkId)
    if (existingLink) {
      existingLink.label = label
    } else {
      blockTranslation.footerLinks.push({ id: linkId, label })
    }
  }

  /**
   * Reset translations to initial state
   */
  function resetTranslations() {
    translations.value = {
      defaultLanguage: DEFAULT_LANGUAGE,
      languages: {},
    }
    currentLanguage.value = null
  }

  /**
   * Load translations from content
   */
  function loadTranslations(data: ProjectTranslations | undefined) {
    if (data) {
      translations.value = data
    } else {
      resetTranslations()
    }
    currentLanguage.value = null
  }

  /**
   * Get current translations data for saving
   */
  function getTranslationsData(): ProjectTranslations {
    return translations.value
  }

  return {
    translations,
    currentLanguage,
    availableTranslations,
    isEditingTranslation,
    setDefaultLanguage,
    addTranslation,
    removeTranslation,
    setCurrentLanguage,
    getTranslatedContent,
    updateBlockTranslation,
    getTranslatedNavLinkLabel,
    updateTranslatedNavLinkLabel,
    getTranslatedFooterLinkLabel,
    updateTranslatedFooterLinkLabel,
    resetTranslations,
    loadTranslations,
    getTranslationsData,
  }
}
