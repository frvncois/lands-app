<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useEditorStore } from '@/stores/editor'
import { useProjectsStore } from '@/stores/projects'
import { useProjectStore } from '@/stores/project'
import { LAYOUT_STYLES, type LayoutStyle } from '@/lib/layouts'
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

// Layout style (from wizard)
const currentLayoutStyleId = computed(() => pageSettings.value.layoutStyleId || 'minimal')

function selectLayoutStyle(style: LayoutStyle) {
  editorStore.updatePageSettings({ layoutStyleId: style.id })
}

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
</script>

<template>
  <div>
    <!-- Layout Style -->
    <InspectorSection title="Layout Style" icon="layout-stack">
      <div class="grid grid-cols-3 gap-1.5">
        <button
          v-for="style in LAYOUT_STYLES"
          :key="style.id"
          class="flex flex-col gap-1.5 p-2 rounded-lg border transition-colors text-center"
          :class="currentLayoutStyleId === style.id
            ? 'border-primary bg-primary/5'
            : 'border-sidebar-border hover:border-primary/50 hover:bg-accent/50'"
          @click="selectLayoutStyle(style)"
        >
          <!-- Visual preview -->
          <div class="w-full aspect-[4/3] bg-muted/50 rounded overflow-hidden p-1">
            <div class="w-full h-full flex flex-col gap-0.5">
              <div
                class="h-1 bg-foreground/20"
                :class="{
                  'rounded-none': style.borderRadius === 'none',
                  'rounded-sm': style.borderRadius === 'sm' || style.borderRadius === 'md',
                  'rounded': style.borderRadius === 'lg' || style.borderRadius === 'xl',
                  'rounded-full': style.borderRadius === '2xl' || style.borderRadius === 'full',
                }"
              />
              <div class="flex-1 flex gap-0.5">
                <div
                  class="flex-1 bg-foreground/10"
                  :class="{
                    'rounded-none': style.borderRadius === 'none',
                    'rounded-sm': style.borderRadius === 'sm' || style.borderRadius === 'md',
                    'rounded': style.borderRadius === 'lg' || style.borderRadius === 'xl',
                    'rounded-full': style.borderRadius === '2xl' || style.borderRadius === 'full',
                  }"
                />
                <div
                  class="w-1/3 bg-foreground/15"
                  :class="{
                    'rounded-none': style.borderRadius === 'none',
                    'rounded-sm': style.borderRadius === 'sm' || style.borderRadius === 'md',
                    'rounded': style.borderRadius === 'lg' || style.borderRadius === 'xl',
                    'rounded-full': style.borderRadius === '2xl' || style.borderRadius === 'full',
                  }"
                />
              </div>
            </div>
          </div>
          <span class="text-[10px] font-medium text-foreground truncate">{{ style.name.split(' & ')[0] }}</span>
        </button>
      </div>
    </InspectorSection>

    <!-- Color Palette -->
    <InspectorSection title="Color Palette" icon="style-color">
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
    </InspectorSection>

    <!-- Typography Style -->
    <InspectorSection title="Typography" icon="content-heading">
      <InspectorField label="Base Size" horizontal>
        <SliderInput
          :model-value="pageSettings.baseFontSize || '16'"
          :min="12"
          :max="24"
          :step="1"
          unit="px"
          @update:model-value="updatePageSetting('baseFontSize', $event)"
        />
      </InspectorField>
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

      <!-- Google Fonts -->
      <InspectorField label="Google Fonts">
        <div class="space-y-2">
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
      </InspectorField>

      <!-- Custom Font Upload (Pro only) -->
      <template v-if="canUseCustomFonts">
        <InspectorField label="Custom Fonts">
          <div class="space-y-2">
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
        </InspectorField>
      </template>
      <!-- Pro upgrade prompt for custom font uploads -->
      <div v-else class="p-3 bg-muted/50 rounded-lg">
        <div class="flex items-center gap-2 mb-2">
          <Icon name="style-font" class="text-sm" />
          <span class="text-xs font-medium text-foreground">Custom Fonts</span>
          <span class="text-[10px] px-1.5 py-0.5 bg-amber-500/10 text-amber-600 rounded-full font-medium">Pro</span>
        </div>
        <p class="text-[11px] text-muted-foreground mb-2">
          Upload your own custom fonts with Pro.
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

    <!-- Custom Code (Pro only) -->
    <template v-if="canUseCustomCode">
      <InspectorSection title="Custom CSS" icon="style-code">
        <InspectorField label="Styles">
          <textarea
            :value="pageSettings.customCSS || ''"
            placeholder="/* Add your custom CSS here */&#10;.my-class {&#10;  color: red;&#10;}"
            rows="6"
            class="w-full px-3 py-2 text-xs font-mono bg-secondary border border-sidebar-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            @input="updatePageSetting('customCSS', ($event.target as HTMLTextAreaElement).value)"
          />
        </InspectorField>
        <p class="px-3 text-[10px] text-muted-foreground">
          Custom styles will be injected into the page &lt;head&gt;.
        </p>
      </InspectorSection>

      <InspectorSection title="Custom Scripts" icon="style-code">
        <InspectorField label="Header Script">
          <textarea
            :value="pageSettings.customHeaderScript || ''"
            placeholder="<!-- Scripts added to <head> -->&#10;<script>&#10;  // Your code here&#10;</script>"
            rows="5"
            class="w-full px-3 py-2 text-xs font-mono bg-secondary border border-sidebar-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            @input="updatePageSetting('customHeaderScript', ($event.target as HTMLTextAreaElement).value)"
          />
        </InspectorField>
        <InspectorField label="Footer Script">
          <textarea
            :value="pageSettings.customFooterScript || ''"
            placeholder="<!-- Scripts added before </body> -->&#10;<script>&#10;  // Your code here&#10;</script>"
            rows="5"
            class="w-full px-3 py-2 text-xs font-mono bg-secondary border border-sidebar-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            @input="updatePageSetting('customFooterScript', ($event.target as HTMLTextAreaElement).value)"
          />
        </InspectorField>
        <p class="px-3 text-[10px] text-muted-foreground">
          Add tracking codes, analytics, or custom JavaScript.
        </p>
      </InspectorSection>
    </template>
    <!-- Pro upgrade prompt for custom code -->
    <div v-else class="mx-3 mb-3 p-3 bg-muted/50 rounded-lg">
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
