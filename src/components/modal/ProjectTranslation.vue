<script setup lang="ts">
/**
 * PROJECT TRANSLATION MODAL
 *
 * Manage translations for the project:
 * - Set default language
 * - Add/remove translation languages
 */

import { ref, computed, watch } from 'vue'
import { useEditorStore } from '@/stores/editor'
import { Modal } from '@/components/ui/Modal'
import { Button, Icon, Popover, Combobox } from '@/components/ui'
import type { ComboboxItem } from '@/components/ui/Combobox.vue'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const editor = useEditorStore()

// Language options (without flags)
const LANGUAGE_OPTIONS: Record<string, string> = {
  en: 'English',
  fr: 'Français',
  es: 'Español',
  de: 'Deutsch',
  it: 'Italiano',
  pt: 'Português',
  nl: 'Nederlands',
  pl: 'Polski',
  ru: 'Русский',
  ja: '日本語',
  zh: '中文',
  ko: '한국어',
  ar: 'العربية',
}

// Local state for the modal
const selectedDefaultLanguage = ref('en')
const selectedLanguages = ref<string[]>([])

// Initialize state when modal opens
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    if (editor.translationSettings) {
      selectedDefaultLanguage.value = editor.translationSettings.defaultLanguage
      selectedLanguages.value = [...editor.translationSettings.languages]
    } else {
      selectedDefaultLanguage.value = 'en'
      selectedLanguages.value = []
    }
  }
})

// Get language label
function getLanguageLabel(code: string): string {
  return LANGUAGE_OPTIONS[code] || code
}

// Combobox items for default language selection
const defaultLanguageItems = computed<ComboboxItem[]>(() => {
  return Object.entries(LANGUAGE_OPTIONS).map(([code, label]) => ({
    value: code,
    label: label,
  }))
})

// Combobox items for adding translation languages (excludes default and already added)
const availableLanguageItems = computed<ComboboxItem[]>(() => {
  return Object.entries(LANGUAGE_OPTIONS)
    .filter(([code]) =>
      code !== selectedDefaultLanguage.value &&
      !selectedLanguages.value.includes(code)
    )
    .map(([code, label]) => ({
      value: code,
      label: label,
    }))
})

// Add a language
function addLanguage(code: string) {
  if (!selectedLanguages.value.includes(code)) {
    selectedLanguages.value.push(code)
  }
}

// Remove a language
function removeLanguage(code: string) {
  const index = selectedLanguages.value.indexOf(code)
  if (index !== -1) {
    selectedLanguages.value.splice(index, 1)
  }
}

// Change default language
function setDefaultLanguage(code: string) {
  // If the new default was a translation, remove it from translations
  const index = selectedLanguages.value.indexOf(code)
  if (index !== -1) {
    selectedLanguages.value.splice(index, 1)
  }
  selectedDefaultLanguage.value = code
}

// Save changes
function save() {
  if (!editor.translationSettings) {
    // Initialize translations
    editor.initializeTranslations(selectedDefaultLanguage.value)
  } else {
    // Update default language if changed
    if (selectedDefaultLanguage.value !== editor.translationSettings.defaultLanguage) {
      editor.setDefaultLanguage(selectedDefaultLanguage.value)
    }
  }

  // Add new languages
  for (const lang of selectedLanguages.value) {
    if (!editor.translationSettings?.languages.includes(lang)) {
      editor.addLanguage(lang)
    }
  }

  // Remove languages that were removed
  if (editor.translationSettings) {
    const toRemove = editor.translationSettings.languages.filter(
      lang => !selectedLanguages.value.includes(lang)
    )
    for (const lang of toRemove) {
      editor.removeLanguage(lang)
    }
  }

  emit('update:open', false)
}
</script>

<template>
  <Modal
    :open="open"
    title="Translations"
    @update:open="emit('update:open', $event)"
  >
    <div class="space-y-6">
      <!-- Default Language -->
      <div>
        <label class="block text-sm font-medium text-foreground mb-2">
          Default Language
        </label>
        <p class="text-xs text-muted-foreground mb-3">
          This is the primary language of your content.
        </p>
        <Popover
          align="left"
          width="w-64"
        >
          <template #trigger="{ toggle }">
            <button
              class="flex items-center justify-between w-full h-10 px-3 text-sm bg-secondary border border-transparent rounded-lg text-foreground transition-colors hover:bg-accent/50"
              @click="toggle"
            >
              <span>{{ getLanguageLabel(selectedDefaultLanguage) }}</span>
              <Icon
                name="chevron-down"
                :size="14"
                class="text-muted-foreground"
              />
            </button>
          </template>
          <template #default="{ close }">
            <Combobox
              :items="defaultLanguageItems"
              search-placeholder="Search languages..."
              empty-text="No languages found"
              @select="(value) => { setDefaultLanguage(value); close() }"
            />
          </template>
        </Popover>
      </div>

      <!-- Added Translations -->
      <div>
        <label class="block text-sm font-medium text-foreground mb-2">
          Translations
        </label>
        <p class="text-xs text-muted-foreground mb-3">
          Add languages to translate your content into.
        </p>

        <!-- List of added translations -->
        <div
          v-if="selectedLanguages.length > 0"
          class="space-y-2 mb-4"
        >
          <div
            v-for="code in selectedLanguages"
            :key="code"
            class="flex items-center justify-between px-3 py-2 rounded-lg bg-secondary"
          >
            <span class="text-sm font-medium">{{ getLanguageLabel(code) }}</span>
            <button
              class="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              @click="removeLanguage(code)"
            >
              <Icon
                name="close"
                :size="14"
              />
            </button>
          </div>
        </div>

        <!-- Add language dropdown -->
        <Popover
          v-if="availableLanguageItems.length > 0"
          align="left"
          width="w-64"
        >
          <template #trigger="{ toggle }">
            <button
              class="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-dashed border-border hover:border-primary/50 text-muted-foreground hover:text-foreground transition-colors"
              @click="toggle"
            >
              <Icon
                name="plus"
                :size="14"
              />
              <span>Add Language</span>
            </button>
          </template>
          <template #default="{ close }">
            <Combobox
              :items="availableLanguageItems"
              search-placeholder="Search languages..."
              empty-text="No languages found"
              @select="(value) => { addLanguage(value); close() }"
            />
          </template>
        </Popover>

        <p
          v-else-if="selectedLanguages.length > 0"
          class="text-xs text-muted-foreground"
        >
          All available languages have been added.
        </p>
      </div>

      <!-- Info -->
      <div class="p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
        <p class="font-medium text-foreground mb-1">
          How translations work:
        </p>
        <ul class="space-y-1 list-disc list-inside">
          <li>Only text and image content is translated</li>
          <li>Layout, styles, and structure remain the same</li>
          <li>Switch between languages using the dropdown in the header</li>
        </ul>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <Button
          variant="secondary"
          @click="emit('update:open', false)"
        >
          Cancel
        </Button>
        <Button @click="save">
          Save Changes
        </Button>
      </div>
    </template>
  </Modal>
</template>
