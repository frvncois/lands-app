<script setup lang="ts">
import { ref, computed, watch, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowRightIcon, ArrowLeftIcon,
  ChevronDownIcon, ArrowRightStartOnRectangleIcon,
  CheckIcon,
} from '@heroicons/vue/24/outline'
import LandsLogo from '@/assets/LandsLogo.vue'
import BaseFont from '@/shared/ui/BaseFont.vue'
import BaseColorInput from '@/shared/ui/BaseColorInput.vue'
import { useUserStore } from '@/features/auth/stores/user'
import authService from '@/features/auth/services/auth.service'
import { THEME_PRESET_DEFINITIONS } from '@/features/theme/presets'
import { THEME_PRESETS, type ThemePreset } from '@/features/theme/types'
import { useLandCreator } from '@/features/onboarding/composables/useLandCreator'
import { useGoogleFont } from '@/features/onboarding/composables/useGoogleFont'

const router = useRouter()
const userStore = useUserStore()
const { title, handle, onHandleInput, isLoading, error, create } = useLandCreator()

const accountOpen = ref(false)
async function logout() { accountOpen.value = false; await authService.logout(); router.push('/auth') }

const step = ref(1)
const TOTAL_STEPS = 2

const selectedTheme = ref<ThemePreset>(THEME_PRESETS.minimal)
const THEME_OPTIONS = Object.values(THEME_PRESETS)

const colorMain = ref(''), colorAccent = ref(''), colorSurface = ref('')
const fontTitle = ref(''), fontBody = ref('')

watch(selectedTheme, (theme) => {
  const def = THEME_PRESET_DEFINITIONS[theme].defaults
  colorMain.value = def.color_main
  colorAccent.value = def.color_accent
  colorSurface.value = def.color_surface
  fontTitle.value = def.font_title
  fontBody.value = def.font_body
}, { immediate: true })

useGoogleFont(fontTitle, fontBody, selectedTheme as Ref<ThemePreset | null>)

const stepValid = computed(() =>
  step.value !== 1 || (title.value.trim().length > 0 && handle.value.trim().length > 0)
)

async function doCreate() {
  const theme = {
    theme_preset: selectedTheme.value,
    font_title: fontTitle.value,
    font_body: fontBody.value,
    color_main: colorMain.value,
    color_accent: colorAccent.value,
    color_surface: colorSurface.value,
  }
  try {
    await create({ title: title.value.trim(), handle: handle.value.trim(), theme })
    sessionStorage.setItem('lands_tour_pending', 'true')
    router.push('/dashboard')
  } catch { /* error ref already updated by useLandCreator */ }
}

function next() {
  if (!stepValid.value) return
  if (step.value < TOTAL_STEPS) step.value++
  else doCreate()
}
function back() { if (step.value > 1) step.value-- }

const previewStyle = computed(() => ({
  '--preview-main': colorMain.value, '--preview-accent': colorAccent.value, '--preview-surface': colorSurface.value,
  '--preview-font-title': fontTitle.value, '--preview-font-body': fontBody.value,
}))
const currentThemeDef = computed(() => THEME_PRESET_DEFINITIONS[selectedTheme.value])
</script>

<template>
  <div class="flex w-screen h-screen overflow-hidden">

    <!-- ─── Left panel ─── -->
    <div class="w-[520px] shrink-0 flex flex-col h-full overflow-y-auto bg-white">
      <div class="flex flex-col flex-1 p-12 lg:p-16">

        <!-- Logo + account menu -->
        <div class="flex items-center justify-between mb-12">
          <LandsLogo class="h-8 text-gray-900" />

          <div class="relative">
            <button
              class="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-sm text-gray-600"
              @click="accountOpen = !accountOpen"
            >
              <div class="flex items-center justify-center w-5 h-5 rounded-full bg-gray-900 text-white text-[10px] font-semibold shrink-0">
                {{ userStore.initials }}
              </div>
              <span class="max-w-[140px] truncate">{{ userStore.fullName || userStore.user?.email || 'Account' }}</span>
              <ChevronDownIcon class="h-3.5 w-3.5 text-gray-400 shrink-0 transition-transform" :class="accountOpen ? 'rotate-180' : ''" />
            </button>

            <Transition name="dropdown">
              <div
                v-if="accountOpen"
                class="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden"
              >
                <button
                  class="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  @click="logout"
                >
                  <ArrowRightStartOnRectangleIcon class="h-4 w-4" />
                  Log out
                </button>
              </div>
            </Transition>

            <!-- Backdrop -->
            <div v-if="accountOpen" class="fixed inset-0 z-40" @click="accountOpen = false" />
          </div>
        </div>

        <!-- Progress bar -->
        <div class="flex gap-1.5 mb-10">
          <div
            v-for="n in TOTAL_STEPS"
            :key="n"
            class="h-1 flex-1 rounded-full transition-all duration-500"
            :class="n <= step ? 'bg-gray-900' : 'bg-gray-100'"
          />
        </div>

        <!-- ─── Step 1: Name ─── -->
        <div v-if="step === 1" class="flex flex-col gap-8 flex-1">
          <div>
            <h1 class="text-2xl font-semibold text-gray-900 mb-1">Name your land</h1>
            <p class="text-sm text-gray-500">This is your personal corner of the internet.</p>
          </div>

          <div class="space-y-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-700">Project title</label>
              <input
                v-model="title"
                type="text"
                placeholder="e.g. Jane Smith"
                autofocus
                class="w-full px-4 py-3 text-base border border-gray-200 rounded-xl bg-white transition-colors placeholder:text-gray-400 focus:outline-none focus:border-gray-400 focus:ring-4 focus:ring-black/[0.04]"
              />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-gray-700">URL</label>
              <div class="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-gray-400 focus-within:ring-4 focus-within:ring-black/[0.04] transition-all">
                <input
                  :value="handle"
                  type="text"
                  placeholder="jane-smith"
                  class="flex-1 px-3 py-3 text-base bg-white placeholder:text-gray-400 focus:outline-none"
                  @input="onHandleInput"
                />
                <span class="px-3 py-3 text-sm text-gray-400 bg-gray-50 border-l border-gray-200 shrink-0">.lands.app</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ─── Step 2: Theme + Colors & Fonts ─── -->
        <div v-else-if="step === 2" class="flex flex-col gap-8 flex-1">
          <div>
            <h1 class="text-2xl font-semibold text-gray-900 mb-1">Choose your style</h1>
            <p class="text-sm text-gray-500">Pick a theme and personalise the colors and fonts.</p>
          </div>

          <!-- Theme picker -->
          <div class="flex flex-col gap-3">
            <p class="text-sm font-medium text-gray-700">Theme</p>
            <button
              v-for="themeKey in THEME_OPTIONS"
              :key="themeKey"
              type="button"
              class="flex items-center gap-4 px-4 py-4 rounded-xl border text-left transition-all"
              :class="selectedTheme === themeKey
                ? 'border-gray-900 bg-gray-50 ring-2 ring-gray-900/10'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'"
              @click="selectedTheme = themeKey"
            >
              <div class="flex gap-1.5 shrink-0">
                <div
                  class="w-8 h-8 rounded-lg border border-black/10"
                  :style="{ backgroundColor: THEME_PRESET_DEFINITIONS[themeKey].defaults.color_surface }"
                />
                <div
                  class="w-8 h-8 rounded-lg border border-black/10"
                  :style="{ backgroundColor: THEME_PRESET_DEFINITIONS[themeKey].defaults.color_main }"
                />
                <div
                  class="w-8 h-8 rounded-lg border border-black/10"
                  :style="{ backgroundColor: THEME_PRESET_DEFINITIONS[themeKey].defaults.color_accent }"
                />
              </div>
              <div class="flex flex-col min-w-0">
                <span class="text-sm font-medium text-gray-900">{{ THEME_PRESET_DEFINITIONS[themeKey].label }}</span>
                <span class="text-xs text-gray-500">{{ THEME_PRESET_DEFINITIONS[themeKey].description }}</span>
              </div>
              <CheckIcon v-if="selectedTheme === themeKey" class="ml-auto h-4 w-4 text-gray-900 shrink-0" />
            </button>
          </div>

          <!-- Colors -->
          <div class="space-y-1">
            <p class="text-sm font-medium text-gray-700 mb-2">Colors</p>
            <div class="border border-gray-200 rounded-xl px-4 divide-y divide-gray-100">
              <BaseColorInput
                v-for="slot in currentThemeDef.colorSlots"
                :key="slot.key"
                :label="slot.label"
                :model-value="slot.key === 'color_main' ? colorMain : slot.key === 'color_accent' ? colorAccent : colorSurface"
                @update:model-value="slot.key === 'color_main' ? colorMain = $event : slot.key === 'color_accent' ? colorAccent = $event : colorSurface = $event"
              />
            </div>
          </div>

          <!-- Title font -->
          <div class="space-y-2">
            <p class="text-sm font-medium text-gray-700">Title font</p>
            <div class="grid grid-cols-4 gap-2">
              <BaseFont
                v-for="opt in currentThemeDef.pairings"
                :key="opt.id"
                :label="opt.label"
                :titleFont="opt.titleFont"
                :bodyFont="opt.bodyFont"
                :titleGoogleFont="opt.titleGoogleFont"
                :bodyGoogleFont="opt.bodyGoogleFont"
                :active="fontTitle === opt.titleFont"
                @click="fontTitle = opt.titleFont"
              />
            </div>
          </div>

          <!-- Body font -->
          <div class="space-y-2">
            <p class="text-sm font-medium text-gray-700">Body font</p>
            <div class="grid grid-cols-4 gap-2">
              <BaseFont
                v-for="opt in currentThemeDef.pairings"
                :key="opt.id"
                :label="opt.label"
                :titleFont="opt.titleFont"
                :bodyFont="opt.bodyFont"
                :titleGoogleFont="opt.titleGoogleFont"
                :bodyGoogleFont="opt.bodyGoogleFont"
                :active="fontBody === opt.bodyFont"
                @click="fontBody = opt.bodyFont"
              />
            </div>
          </div>
        </div>

        <!-- ─── Navigation ─── -->
        <div class="mt-8 flex items-center gap-3">
          <button
            v-if="step > 1"
            class="flex items-center justify-center w-11 h-11 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors shrink-0"
            @click="back"
          >
            <ArrowLeftIcon class="h-4 w-4" />
          </button>

          <button
            class="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl font-medium text-sm transition-all"
            :class="stepValid
              ? 'bg-gray-900 text-white hover:bg-gray-800'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'"
            :disabled="!stepValid || isLoading"
            @click="next"
          >
            <span v-if="step < TOTAL_STEPS">Continue</span>
            <span v-else>{{ isLoading ? 'Creating your land…' : 'Create my land' }}</span>
            <ArrowRightIcon v-if="step < TOTAL_STEPS" class="h-4 w-4" />
          </button>
        </div>

        <p v-if="error" class="mt-3 text-sm text-red-500 text-center">{{ error }}</p>

      </div>
    </div>

    <!-- ─── Right panel: live preview ─── -->
    <div class="flex-1 bg-gray-950 flex items-center justify-center p-10 overflow-hidden relative">
      <div class="w-full max-w-sm" :style="previewStyle as any">
        <!-- Mini landing page mockup -->
        <div
          class="rounded-2xl overflow-hidden shadow-2xl border border-white/10"
          :style="{ backgroundColor: colorSurface }"
        >
          <!-- Nav bar -->
          <div class="flex items-center justify-between px-5 py-3 border-b" :style="{ borderColor: colorMain + '18' }">
            <div class="flex gap-1.5">
              <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: colorMain + '40' }" />
              <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: colorMain + '40' }" />
              <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: colorMain + '40' }" />
            </div>
            <div class="flex gap-3">
              <div class="w-10 h-1.5 rounded-full" :style="{ backgroundColor: colorMain + '30' }" />
              <div class="w-8 h-1.5 rounded-full" :style="{ backgroundColor: colorMain + '30' }" />
              <div class="w-12 h-1.5 rounded-full" :style="{ backgroundColor: colorMain + '30' }" />
            </div>
            <div class="w-16 h-5 rounded-lg" :style="{ backgroundColor: colorAccent }" />
          </div>

          <!-- Hero -->
          <div class="px-6 py-8 text-center">
            <div
              class="w-12 h-12 rounded-full mx-auto mb-4 border-2"
              :style="{ backgroundColor: colorMain + '15', borderColor: colorMain + '25' }"
            />
            <h2
              class="text-xl font-bold mb-2 leading-tight"
              :style="{ fontFamily: fontTitle, color: colorMain }"
            >{{ title || 'Your Name' }}</h2>
            <p
              class="text-xs mb-5 leading-relaxed"
              :style="{ fontFamily: fontBody, color: colorMain + 'aa' }"
            >A short tagline about what you do</p>
            <div class="flex gap-2 justify-center">
              <div
                class="px-4 py-2 rounded-lg text-xs font-medium text-white"
                :style="{ backgroundColor: colorAccent, fontFamily: fontBody }"
              >Get in touch</div>
              <div
                class="px-4 py-2 rounded-lg text-xs font-medium border"
                :style="{ color: colorMain, borderColor: colorMain + '30', fontFamily: fontBody }"
              >Learn more</div>
            </div>
          </div>

          <!-- Content blocks -->
          <div class="px-6 pb-6 space-y-2">
            <div
              class="h-1.5 rounded-full w-3/4"
              :style="{ backgroundColor: colorMain + '20' }"
            />
            <div
              class="h-1.5 rounded-full w-full"
              :style="{ backgroundColor: colorMain + '15' }"
            />
            <div
              class="h-1.5 rounded-full w-5/6"
              :style="{ backgroundColor: colorMain + '15' }"
            />
          </div>

          <!-- Bottom section -->
          <div
            class="flex items-center justify-between px-6 py-4 border-t"
            :style="{ borderColor: colorMain + '12', backgroundColor: colorMain + '06' }"
          >
            <div class="flex gap-2">
              <div class="w-6 h-6 rounded-md" :style="{ backgroundColor: colorAccent + '30' }" />
              <div class="w-6 h-6 rounded-md" :style="{ backgroundColor: colorMain + '15' }" />
              <div class="w-6 h-6 rounded-md" :style="{ backgroundColor: colorMain + '15' }" />
            </div>
            <div class="h-1.5 rounded-full w-16" :style="{ backgroundColor: colorMain + '20' }" />
          </div>
        </div>

        <!-- Theme label -->
        <div class="mt-4 text-center">
          <span class="text-xs text-gray-500 font-medium tracking-wide uppercase">{{ currentThemeDef.label }} theme</span>
        </div>
      </div>

      <!-- Decorative background dots -->
      <div class="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
        <div
          v-for="i in 20"
          :key="i"
          class="absolute w-1 h-1 rounded-full bg-white/40"
          :style="{
            left: `${(i * 47) % 100}%`,
            top: `${(i * 31 + 10) % 100}%`,
            opacity: 0.2 + (i % 5) * 0.1,
          }"
        />
      </div>
    </div>

  </div>
</template>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
