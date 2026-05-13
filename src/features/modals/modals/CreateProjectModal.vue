<script setup lang="ts">
import { ref, computed } from 'vue'
import { XMarkIcon, ArrowLeftIcon } from '@heroicons/vue/24/outline'
import BaseButton from '@/shared/ui/BaseButton.vue'
import BaseModal from '@/shared/ui/BaseModal.vue'
import { addToast } from '@/shared/composables/useToast'
import { THEME_PRESET_DEFINITIONS } from '@/features/theme/presets'
import { PURPOSE_OPTIONS } from '@/features/sections/purpose-defaults'
import { THEME_PRESETS, type ThemePreset } from '@/features/theme/types'
import { useLandCreator } from '@/features/onboarding/composables/useLandCreator'
const emit = defineEmits<{ close: [] }>()
const { title, handle, onHandleInput, selectedPurpose, isLoading, error, create } = useLandCreator()

// ─── Step state ───
const step = ref(1)
const TOTAL_STEPS = 4

// ─── Step 3: Palette ───
interface Palette {
  id: string
  label: string
  main: string
  accent: string
  surface: string
}

const PALETTES: Palette[] = [
  { id: 'ink',     label: 'Ink & Mist',   main: '#18181B', accent: '#6366F1', surface: '#F4F4F5' },
  { id: 'ocean',   label: 'Ocean',        main: '#0F172A', accent: '#0EA5E9', surface: '#F0F9FF' },
  { id: 'sunset',  label: 'Sunset',       main: '#4C1D95', accent: '#F97316', surface: '#FFF7ED' },
  { id: 'forest',  label: 'Forest',       main: '#14532D', accent: '#84CC16', surface: '#F7FEE7' },
  { id: 'rose',    label: 'Rose',         main: '#881337', accent: '#F43F5E', surface: '#FFF1F2' },
  { id: 'sand',    label: 'Sand & Stone', main: '#78350F', accent: '#B45309', surface: '#FFFBEB' },
]

const selectedPalette = ref<string | null>(null)

// ─── Step 4: Theme ───
const selectedTheme = ref<ThemePreset | null>(null)
const THEME_OPTIONS = Object.values(THEME_PRESETS)

// ─── Validation ───
const handleError = computed(() => {
  const h = handle.value.trim()
  if (h.length === 0) return ''
  if (h.length < 2) return 'Handle must be at least 2 characters'
  if (h.length > 63) return 'Handle must be 63 characters or fewer'
  return ''
})

const stepValid = computed(() => {
  if (step.value === 1) return title.value.trim().length > 0 && handle.value.trim().length >= 2 && handle.value.trim().length <= 63 && !handleError.value
  if (step.value === 2) return selectedPurpose.value !== null
  if (step.value === 3) return selectedTheme.value !== null
  if (step.value === 4) return selectedPalette.value !== null
  return false
})

// ─── Creation ───
async function doCreate() {
  if (!stepValid.value) return
  const palette = PALETTES.find((p) => p.id === selectedPalette.value)!
  const themeDef = THEME_PRESET_DEFINITIONS[selectedTheme.value!]
  const theme = {
    theme_preset: selectedTheme.value!,
    font_title: themeDef.defaults.font_title,
    font_body: themeDef.defaults.font_body,
    color_main: palette.main,
    color_accent: palette.accent,
    color_surface: palette.surface,
  }
  try {
    await create({ title: title.value.trim(), handle: handle.value.trim(), purposeId: selectedPurpose.value!, theme })
    addToast('Project created')
    emit('close')
  } catch {
    addToast('Failed to create project', 'error')
    // error ref already updated by useLandCreator
  }
}

function next() {
  if (step.value < TOTAL_STEPS) step.value++
  else doCreate()
}

function back() {
  if (step.value > 1) step.value--
}
</script>

<template>
  <BaseModal max-width="max-w-[480px]" padding="" @close="emit('close')">
    <div>

      <!-- Header -->
      <div class="flex items-center justify-between px-6 pt-6 pb-4">
        <div class="flex items-center gap-3">
          <button
            v-if="step > 1"
            class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
            @click="back"
          >
            <ArrowLeftIcon class="h-4 w-4" />
          </button>
          <h3 class="text-base font-semibold text-gray-900">
            <span v-if="step === 1">Create new Land</span>
            <span v-else-if="step === 2">What's it for?</span>
            <span v-else-if="step === 3">Choose a theme</span>
            <span v-else-if="step === 4">Pick a palette</span>
          </h3>
        </div>
        <button class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100" @click="$emit('close')">
          <XMarkIcon class="h-5 w-5" />
        </button>
      </div>

      <!-- Progress bar -->
      <div class="px-6 mb-5">
        <div class="flex gap-1.5">
          <div
            v-for="n in TOTAL_STEPS"
            :key="n"
            class="h-1 flex-1 rounded-full transition-colors duration-300"
            :class="n <= step ? 'bg-gray-900' : 'bg-gray-100'"
          />
        </div>
      </div>

      <!-- Step 1: Title & Handle -->
      <div v-if="step === 1" class="px-6 pb-6 space-y-4">
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-gray-700">Project title</label>
          <input
            v-model="title"
            type="text"
            placeholder="My awesome project"
            autofocus
            class="w-full px-4 py-3 text-base border border-gray-200 rounded-xl bg-white transition-colors placeholder:text-gray-400 focus:outline-none focus:border-gray-400 focus:ring-4 focus:ring-black/[0.04]"
          />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-gray-700">URL handle</label>
          <div
            class="flex items-center border rounded-xl overflow-hidden focus-within:ring-4 transition-all"
            :class="handleError ? 'border-red-300 focus-within:border-red-400 focus-within:ring-red-100' : 'border-gray-200 focus-within:border-gray-400 focus-within:ring-black/[0.04]'"
          >
            <input
              :value="handle"
              type="text"
              placeholder="my-project"
              class="flex-1 px-3 py-3 text-base bg-white placeholder:text-gray-400 focus:outline-none"
              @input="onHandleInput"
            />
            <span class="px-3 py-3 text-sm text-gray-400 bg-gray-50 border-l border-gray-200 shrink-0">.lands.app</span>
          </div>
          <p v-if="handleError" class="text-xs text-red-500">{{ handleError }}</p>
        </div>
      </div>

      <!-- Step 2: Purpose -->
      <div v-else-if="step === 2" class="px-6 pb-6">
        <div class="grid grid-cols-1 gap-2">
          <button
            v-for="option in PURPOSE_OPTIONS"
            :key="option.id"
            type="button"
            class="flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all"
            :class="selectedPurpose === option.id
              ? 'border-gray-900 bg-gray-50 ring-2 ring-gray-900/10'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'"
            @click="selectedPurpose = option.id"
          >
            <div class="shrink-0 flex items-center justify-center h-8 w-8 rounded-lg bg-gray-200">
              <component :is="option.icon" class="h-4 w-4 text-gray-600" />
            </div>
            <div class="flex flex-col min-w-0">
              <span class="text-sm font-medium text-gray-900">{{ option.label }}</span>
              <span class="text-xs text-gray-500">{{ option.description }}</span>
            </div>
          </button>
        </div>
      </div>

      <!-- Step 3: Theme -->
      <div v-else-if="step === 3" class="px-6 pb-6">
        <div class="flex flex-col gap-2">
          <button
            v-for="themeKey in THEME_OPTIONS"
            :key="themeKey"
            type="button"
            class="flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all"
            :class="selectedTheme === themeKey
              ? 'border-gray-900 bg-gray-50 ring-2 ring-gray-900/10'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'"
            @click="selectedTheme = themeKey"
          >
            <div class="flex flex-col">
              <span class="text-sm font-medium text-gray-900">{{ THEME_PRESET_DEFINITIONS[themeKey].label }}</span>
              <span class="text-xs text-gray-500">{{ THEME_PRESET_DEFINITIONS[themeKey].description }}</span>
            </div>
            <div class="flex gap-1 shrink-0 ml-3">
              <div
                class="w-4 h-4 rounded-full border border-black/10"
                :style="{ backgroundColor: THEME_PRESET_DEFINITIONS[themeKey].defaults.color_main }"
              />
              <div
                class="w-4 h-4 rounded-full border border-black/10"
                :style="{ backgroundColor: THEME_PRESET_DEFINITIONS[themeKey].defaults.color_accent }"
              />
            </div>
          </button>
        </div>
      </div>

      <!-- Step 4: Palette -->
      <div v-else-if="step === 4" class="px-6 pb-6">
        <div class="grid grid-cols-2 gap-3">
          <button
            v-for="palette in PALETTES"
            :key="palette.id"
            type="button"
            class="flex flex-col gap-2 p-3 rounded-xl border text-left transition-all"
            :class="selectedPalette === palette.id
              ? 'border-gray-900 ring-2 ring-gray-900/10'
              : 'border-gray-200 hover:border-gray-300'"
            @click="selectedPalette = palette.id"
          >
            <div class="flex gap-1.5 h-8">
              <div class="flex-1 rounded-md" :style="{ backgroundColor: palette.surface }" />
              <div class="w-8 rounded-md" :style="{ backgroundColor: palette.main }" />
              <div class="w-8 rounded-md" :style="{ backgroundColor: palette.accent }" />
            </div>
            <span class="text-xs font-medium text-gray-700">{{ palette.label }}</span>
          </button>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 pb-6">
        <p v-if="error" class="text-sm text-red-500 mb-2">{{ error }}</p>
        <BaseButton
          variant="solid"
          class="w-full"
          :disabled="!stepValid || isLoading"
          @click="next"
        >
          <span v-if="step < TOTAL_STEPS">Continue</span>
          <span v-else>{{ isLoading ? 'Creating…' : 'Create project' }}</span>
        </BaseButton>
      </div>

    </div>
  </BaseModal>
</template>
