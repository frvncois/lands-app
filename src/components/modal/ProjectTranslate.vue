<script setup lang="ts">
import { ref, computed } from 'vue'
import { Modal, Button, Select, Icon } from '@/components/ui'
import { useEditorStore } from '@/stores/editor'
import { languages, getLanguageByCode } from '@/lib/languages'
import type { LanguageCode } from '@/types/editor'

interface Props {
  open: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const editorStore = useEditorStore()

const selectedLanguage = ref<LanguageCode | ''>('')
const selectedDefaultLanguage = ref<LanguageCode>(editorStore.translations.defaultLanguage)

// Languages available to add (not already added)
const availableLanguages = computed(() => {
  const existing = new Set(editorStore.availableTranslations)
  existing.add(editorStore.translations.defaultLanguage) // Can't add default as translation
  return languages.filter(l => !existing.has(l.code))
})

// All languages for default language selection
const allLanguageOptions = computed(() => {
  return languages.map(l => ({
    value: l.code,
    label: l.name,
  }))
})

// Language options for adding new translation
const languageOptions = computed(() => {
  return availableLanguages.value.map(l => ({
    value: l.code,
    label: l.name,
  }))
})

function handleAddTranslation() {
  if (!selectedLanguage.value) return

  editorStore.addTranslation(selectedLanguage.value)
  selectedLanguage.value = ''
}

function handleRemoveTranslation(langCode: LanguageCode) {
  editorStore.removeTranslation(langCode)
}

function handleDefaultLanguageChange(value: string | number) {
  selectedDefaultLanguage.value = value as LanguageCode
  editorStore.setDefaultLanguage(value as LanguageCode)
}

function close() {
  emit('update:open', false)
}
</script>

<template>
  <Modal
    :open="open"
    title="Translations"
    description="Manage languages for your site"
    @update:open="emit('update:open', $event)"
  >
    <div class="space-y-6">
      <!-- Default Language -->
      <div class="space-y-2">
        <label class="text-sm font-medium text-foreground">Default Language</label>
        <p class="text-xs text-muted-foreground mb-2">
          This is the primary language of your site content
        </p>
        <Select
          :model-value="selectedDefaultLanguage"
          :options="allLanguageOptions"
          placeholder="Select default language"
          @update:model-value="handleDefaultLanguageChange"
        />
      </div>

      <!-- Existing Translations -->
      <div v-if="editorStore.availableTranslations.length > 0" class="space-y-2">
        <label class="text-sm font-medium text-foreground">Translations</label>
        <div class="space-y-2">
          <div
            v-for="langCode in editorStore.availableTranslations"
            :key="langCode"
            class="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
          >
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium">{{ getLanguageByCode(langCode)?.name }}</span>
              <span class="text-xs text-muted-foreground">({{ getLanguageByCode(langCode)?.nativeName }})</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              @click="handleRemoveTranslation(langCode)"
            >
              <Icon name="trash-3" class="text-destructive" />
            </Button>
          </div>
        </div>
      </div>

      <!-- Add Translation -->
      <div class="space-y-2">
        <label class="text-sm font-medium text-foreground">Add Translation</label>
        <div class="flex gap-2">
          <div class="flex-1">
            <Select
              v-model="selectedLanguage"
              :options="languageOptions"
              placeholder="Select language to add"
            />
          </div>
          <Button
            :disabled="!selectedLanguage"
            @click="handleAddTranslation"
          >
            Add
          </Button>
        </div>
      </div>

      <!-- Info -->
      <div class="p-3 bg-muted/30 rounded-lg text-xs text-muted-foreground">
        <p class="font-medium text-foreground mb-1">How translations work:</p>
        <ul class="space-y-1 list-disc list-inside">
          <li>Translations only affect text content (headings, text, buttons, etc.)</li>
          <li>Layout, styles, and structure remain the same across all languages</li>
          <li>Switch between languages in the editor to edit translations</li>
        </ul>
      </div>
    </div>

    <!-- Footer -->
    <template #footer>
      <div class="flex justify-end">
        <Button variant="outline" @click="close">
          Done
        </Button>
      </div>
    </template>
  </Modal>
</template>
