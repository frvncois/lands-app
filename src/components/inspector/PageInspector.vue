<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useEditorStore } from '@/stores/editor'
import { useProjectsStore } from '@/stores/projects'
import { useProjectStore } from '@/stores/project'
import { generateId } from '@/lib/editor-utils'
import { planHasFeature } from '@/types/project'
import type { PageSettings, GoogleFont } from '@/types/editor'

import InspectorSection from './InspectorSection.vue'
import InspectorField from './InspectorField.vue'
import TextInput from './TextInput.vue'
import ImageInput from './ImageInput.vue'
import SliderInput from './SliderInput.vue'
import SelectInput from './SelectInput.vue'
import ColorInput from './ColorInput.vue'
import ToggleInput from './ToggleInput.vue'
import Popover from '@/components/ui/Popover.vue'
import Icon from '@/components/ui/Icon.vue'
import ProjectFont from '@/components/modal/ProjectFont.vue'
import PlanUpgrade from '@/components/modal/PlanUpgrade.vue'

const editorStore = useEditorStore()
const projectsStore = useProjectsStore()
const projectStore = useProjectStore()
const route = useRoute()

// Project plan checks
const projectId = computed(() => route.params.projectId as string)
const currentProject = computed(() => projectsStore.getProjectById(projectId.value))
const canUseCustomFonts = computed(() => {
  if (!currentProject.value) return false
  return planHasFeature(currentProject.value.plan, 'customFonts')
})
const canUseCustomCode = computed(() => {
  if (!currentProject.value) return false
  return planHasFeature(currentProject.value.plan, 'customCode')
})

const pageSettings = computed(() => editorStore.pageSettings)
const seoSettings = computed(() => projectStore.settings.seo)

// Font options
const fontFamilyOptions = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Lato', label: 'Lato' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'system-ui', label: 'System' },
]

const combinedFontOptions = computed(() => {
  const customFonts = pageSettings.value.customFonts || []
  const googleFonts = pageSettings.value.googleFonts || []

  const customOptions = customFonts.map(font => ({
    value: font.name,
    label: `${font.name} (Custom)`
  }))

  const googleOptions = googleFonts.map(font => ({
    value: font.family,
    label: font.family
  }))

  return [...fontFamilyOptions, ...googleOptions, ...customOptions]
})

// Google Fonts modal state
const showGoogleFontsModal = ref(false)
const showUpgradeModal = ref(false)

// Font upload ref and handlers
const fontInputRef = ref<HTMLInputElement | null>(null)

function updatePageSetting<K extends keyof PageSettings>(key: K, value: PageSettings[K]) {
  editorStore.updatePageSettings({ [key]: value })
}

function handleGoogleFontsUpdate(fonts: GoogleFont[]) {
  updatePageSetting('googleFonts', fonts)
}

function removeGoogleFont(family: string) {
  const currentFonts = pageSettings.value.googleFonts || []
  updatePageSetting('googleFonts', currentFonts.filter(f => f.family !== family))
}

function triggerFontUpload() {
  fontInputRef.value?.click()
}

async function handleFontUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const fontName = file.name.replace(/\.(woff2?|ttf|otf)$/i, '')
  const fontUrl = URL.createObjectURL(file)

  const newFont = {
    id: generateId(),
    name: fontName,
    url: fontUrl
  }

  const currentFonts = pageSettings.value.customFonts || []
  updatePageSetting('customFonts', [...currentFonts, newFont])
  input.value = ''
}

function removeCustomFont(fontId: string) {
  const currentFonts = pageSettings.value.customFonts || []
  const updatedFonts = currentFonts.filter(f => f.id !== fontId)
  updatePageSetting('customFonts', updatedFonts)

  const removedFont = currentFonts.find(f => f.id === fontId)
  if (removedFont && pageSettings.value.fontFamily === removedFont.name) {
    updatePageSetting('fontFamily', 'Inter')
  }
}

// Preview helpers
function getColorPalettePreview(): string {
  return 'Edit'
}

function getFontFamilyPreview(): string {
  const headingFont = pageSettings.value.headingFontFamily || 'Inter'
  const textFont = pageSettings.value.fontFamily || 'Inter'
  if (headingFont === textFont) return headingFont
  return `${headingFont} / ${textFont}`
}

function getBaseSizePreview(): string {
  return `${pageSettings.value.baseFontSize || '16'}px`
}
</script>

<template>
  <div>
    <!-- Style Section -->
    <InspectorSection title="Style" icon="style-color">
      <!-- Color Palette -->
      <InspectorField label="Color Palette" horizontal>
        <Popover align="right" width="w-64">
          <template #trigger="{ toggle }">
            <button
              class="flex items-center gap-1.5 px-2 py-1 text-xs rounded-md bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/80 transition-colors"
              @click="toggle"
            >
              <div class="flex -space-x-1">
                <div
                  class="w-3 h-3 rounded-full border border-background"
                  :style="{ backgroundColor: pageSettings.backgroundColor || '#ffffff' }"
                />
                <div
                  class="w-3 h-3 rounded-full border border-background"
                  :style="{ backgroundColor: pageSettings.primaryColor || '#171717' }"
                />
                <div
                  class="w-3 h-3 rounded-full border border-background"
                  :style="{ backgroundColor: pageSettings.accentColor || '#3b82f6' }"
                />
              </div>
              <span class="truncate">{{ getColorPalettePreview() }}</span>
            </button>
          </template>
          <div class="p-4 space-y-3">
            <InspectorField label="Background" horizontal>
              <ColorInput
                :model-value="pageSettings.backgroundColor || '#ffffff'"
                swatch-only
                @update:model-value="updatePageSetting('backgroundColor', $event)"
              />
            </InspectorField>
            <InspectorField label="Text" horizontal>
              <ColorInput
                :model-value="pageSettings.textColor || '#171717'"
                swatch-only
                @update:model-value="updatePageSetting('textColor', $event)"
              />
            </InspectorField>
            <InspectorField label="Primary" horizontal>
              <ColorInput
                :model-value="pageSettings.primaryColor || '#171717'"
                swatch-only
                @update:model-value="updatePageSetting('primaryColor', $event)"
              />
            </InspectorField>
            <InspectorField label="Secondary" horizontal>
              <ColorInput
                :model-value="pageSettings.secondaryColor || '#f5f5f5'"
                swatch-only
                @update:model-value="updatePageSetting('secondaryColor', $event)"
              />
            </InspectorField>
            <InspectorField label="Accent" horizontal>
              <ColorInput
                :model-value="pageSettings.accentColor || '#3b82f6'"
                swatch-only
                @update:model-value="updatePageSetting('accentColor', $event)"
              />
            </InspectorField>
          </div>
        </Popover>
      </InspectorField>

      <!-- Font Family -->
      <InspectorField label="Font Family" horizontal>
        <Popover align="right" width="w-72">
          <template #trigger="{ toggle }">
            <button
              class="flex items-center gap-1.5 px-2 py-1 text-xs rounded-md bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/80 transition-colors"
              @click="toggle"
            >
              <Icon name="style-font" :size="12" class="text-muted-foreground" />
              <span class="truncate max-w-24">{{ getFontFamilyPreview() }}</span>
            </button>
          </template>
          <div class="p-4 space-y-3">
            <InspectorField label="Headings">
              <SelectInput
                :options="combinedFontOptions"
                :model-value="pageSettings.headingFontFamily || 'Inter'"
                @update:model-value="updatePageSetting('headingFontFamily', $event)"
              />
            </InspectorField>
            <InspectorField label="Text">
              <SelectInput
                :options="combinedFontOptions"
                :model-value="pageSettings.fontFamily || 'Inter'"
                @update:model-value="updatePageSetting('fontFamily', $event)"
              />
            </InspectorField>

            <!-- Divider -->
            <div class="border-t border-border" />

            <!-- Google Fonts -->
            <div class="space-y-2">
              <div class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                Google Fonts
              </div>
              <div
                v-for="font in pageSettings.googleFonts || []"
                :key="font.family"
                class="flex items-center gap-2 p-2 bg-secondary rounded-md"
              >
                <span class="flex-1 text-xs text-foreground truncate">{{ font.family }}</span>
                <span class="text-[10px] text-muted-foreground capitalize">{{ font.category }}</span>
                <button
                  type="button"
                  class="p-1 text-muted-foreground hover:text-destructive transition-colors"
                  @click="removeGoogleFont(font.family)"
                >
                  <Icon name="xmark" class="text-xs" />
                </button>
              </div>
              <button
                type="button"
                class="flex items-center justify-center gap-2 w-full py-2 text-xs text-muted-foreground hover:text-foreground border border-dashed border-border rounded-md hover:bg-secondary/50 transition-colors"
                @click="showGoogleFontsModal = true"
              >
                <Icon name="app-google" class="text-xs" />
                Browse Google Fonts
              </button>
            </div>

            <!-- Custom Font Upload (Pro only) -->
            <template v-if="canUseCustomFonts">
              <div class="border-t border-border" />
              <div class="space-y-2">
                <div class="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                  Custom Fonts
                </div>
                <div
                  v-for="font in pageSettings.customFonts || []"
                  :key="font.id"
                  class="flex items-center gap-2 p-2 bg-secondary rounded-md"
                >
                  <span class="flex-1 text-xs text-foreground truncate">{{ font.name }}</span>
                  <button
                    type="button"
                    class="p-1 text-muted-foreground hover:text-destructive transition-colors"
                    @click="removeCustomFont(font.id)"
                  >
                    <Icon name="xmark" class="text-xs" />
                  </button>
                </div>
                <button
                  type="button"
                  class="flex items-center justify-center gap-2 w-full py-2 text-xs text-muted-foreground hover:text-foreground border border-dashed border-border rounded-md hover:bg-secondary/50 transition-colors"
                  @click="triggerFontUpload"
                >
                  <Icon name="upload" class="text-xs" />
                  Upload Font
                </button>
                <input
                  ref="fontInputRef"
                  type="file"
                  accept=".woff,.woff2,.ttf,.otf"
                  class="hidden"
                  @change="handleFontUpload"
                />
              </div>
            </template>
            <!-- Pro upgrade prompt for custom font uploads -->
            <template v-else>
              <div class="border-t border-border" />
              <div class="p-2 bg-muted/50 rounded-lg">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-xs font-medium text-foreground">Custom Fonts</span>
                  <span class="text-[10px] px-1.5 py-0.5 bg-amber-500/10 text-amber-600 rounded-full font-medium">Pro</span>
                </div>
                <p class="text-[10px] text-muted-foreground mb-1">
                  Upload your own custom fonts.
                </p>
                <button
                  type="button"
                  class="text-[10px] text-primary hover:underline"
                  @click="showUpgradeModal = true"
                >
                  Upgrade to Pro
                </button>
              </div>
            </template>
          </div>
        </Popover>
      </InspectorField>

      <!-- Base Size -->
      <InspectorField label="Base Size" horizontal>
        <Popover align="right" width="w-48">
          <template #trigger="{ toggle }">
            <button
              class="flex items-center gap-1.5 px-2 py-1 text-xs rounded-md bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/80 transition-colors"
              @click="toggle"
            >
              <Icon name="content-heading" :size="12" class="text-muted-foreground" />
              <span class="truncate">{{ getBaseSizePreview() }}</span>
            </button>
          </template>
          <div class="p-4">
            <InspectorField label="Base Font Size" horizontal>
              <SliderInput
                :model-value="pageSettings.baseFontSize || '16'"
                :min="12"
                :max="24"
                :step="1"
                unit="px"
                @update:model-value="updatePageSetting('baseFontSize', $event)"
              />
            </InspectorField>
          </div>
        </Popover>
      </InspectorField>

      <!-- Smooth Scroll -->
      <div class="px-3 py-2">
        <ToggleInput
          :model-value="pageSettings.smoothScroll || false"
          label="Smooth Scroll"
          @update:model-value="updatePageSetting('smoothScroll', $event)"
        />
      </div>
    </InspectorSection>

    <!-- SEO Settings -->
    <InspectorSection title="SEO" icon="app-seo">
      <InspectorField label="Meta Title">
        <TextInput
          :model-value="seoSettings.metaTitle || ''"
          placeholder="Page title for search engines"
          @update:model-value="projectStore.updateSEO({ metaTitle: $event })"
        />
      </InspectorField>
      <InspectorField label="Meta Description">
        <textarea
          :value="seoSettings.metaDescription || ''"
          placeholder="Brief description for search results..."
          rows="2"
          class="w-full px-3 py-2 text-xs bg-secondary border border-sidebar-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          @input="projectStore.updateSEO({ metaDescription: ($event.target as HTMLTextAreaElement).value })"
        />
      </InspectorField>
      <InspectorField label="Keywords">
        <TextInput
          :model-value="seoSettings.keywords || ''"
          placeholder="keyword1, keyword2, keyword3"
          @update:model-value="projectStore.updateSEO({ keywords: $event })"
        />
      </InspectorField>
      <InspectorField label="OG Image">
        <ImageInput
          :model-value="seoSettings.ogImage || ''"
          placeholder="Social share image URL"
          hide-search
          @update:model-value="projectStore.updateSEO({ ogImage: $event })"
        />
      </InspectorField>
      <InspectorField label="Favicon">
        <ImageInput
          :model-value="seoSettings.favicon || ''"
          placeholder="Favicon URL"
          hide-search
          @update:model-value="projectStore.updateSEO({ favicon: $event })"
        />
      </InspectorField>
    </InspectorSection>

    <!-- Custom Code -->
    <InspectorSection title="Custom Code" icon="style-code">
      <template v-if="canUseCustomCode">
        <InspectorField label="Custom CSS">
          <textarea
            :value="pageSettings.customCSS || ''"
            placeholder="/* Add your custom CSS here */&#10;.my-class {&#10;  color: red;&#10;}"
            rows="5"
            class="w-full px-3 py-2 text-xs font-mono bg-secondary border border-sidebar-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            @input="updatePageSetting('customCSS', ($event.target as HTMLTextAreaElement).value)"
          />
        </InspectorField>
        <InspectorField label="Header Script">
          <textarea
            :value="pageSettings.customHeaderScript || ''"
            placeholder="<!-- Scripts added to <head> -->"
            rows="4"
            class="w-full px-3 py-2 text-xs font-mono bg-secondary border border-sidebar-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            @input="updatePageSetting('customHeaderScript', ($event.target as HTMLTextAreaElement).value)"
          />
        </InspectorField>
        <InspectorField label="Footer Script">
          <textarea
            :value="pageSettings.customFooterScript || ''"
            placeholder="<!-- Scripts added before </body> -->"
            rows="4"
            class="w-full px-3 py-2 text-xs font-mono bg-secondary border border-sidebar-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            @input="updatePageSetting('customFooterScript', ($event.target as HTMLTextAreaElement).value)"
          />
        </InspectorField>
        <p class="px-3 text-[10px] text-muted-foreground">
          Add tracking codes, analytics, or custom styles.
        </p>
      </template>
      <!-- Pro upgrade prompt for custom code -->
      <div v-else class="p-3">
        <div class="flex items-center gap-2 mb-2">
          <Icon name="style-code" class="text-sm" />
          <span class="text-xs font-medium text-foreground">Custom Code</span>
          <span class="text-[10px] px-1.5 py-0.5 bg-amber-500/10 text-amber-600 rounded-full font-medium">Pro</span>
        </div>
        <p class="text-[11px] text-muted-foreground mb-2">
          Add custom CSS and JavaScript to your page with Pro.
        </p>
        <button
          type="button"
          class="text-[11px] text-primary hover:underline"
          @click="showUpgradeModal = true"
        >
          Upgrade to Pro
        </button>
      </div>
    </InspectorSection>
  </div>

  <!-- Google Fonts Modal -->
  <ProjectFont
    :open="showGoogleFontsModal"
    :selected-fonts="pageSettings.googleFonts || []"
    @update:open="showGoogleFontsModal = $event"
    @update:selected-fonts="handleGoogleFontsUpdate"
  />

  <!-- Plan Upgrade Modal -->
  <PlanUpgrade
    :open="showUpgradeModal"
    :project-id="projectId"
    @update:open="showUpgradeModal = $event"
  />
</template>
