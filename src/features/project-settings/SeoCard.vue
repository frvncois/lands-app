<script setup lang="ts">
import { ref, computed } from 'vue'
import { useProjectStore } from '@/stores/project'
import ProjectUpload from '@/components/modal/ProjectUpload.vue'
import { Card, Input, Textarea, FormField } from '@/components/ui'

const projectStore = useProjectStore()
const settings = computed(() => projectStore.settings)
const projectId = computed(() => projectStore.currentProjectId || '')

const showOgImageUpload = ref(false)
const showFaviconUpload = ref(false)

function handleOgImageUploaded(url: string) {
  projectStore.updateSEO({ ogImage: url })
}

function handleFaviconUploaded(url: string) {
  projectStore.updateSEO({ favicon: url })
}

function removeOgImage() {
  projectStore.updateSEO({ ogImage: '' })
}

function removeFavicon() {
  projectStore.updateSEO({ favicon: '' })
}
</script>

<template>
  <Card>
    <Card.Header title="SEO" icon="app-seo" />
    <Card.Content class="space-y-4">
      <FormField label="Meta Title">
        <Input
          :model-value="settings.seo.metaTitle"
          placeholder="Page title for search engines"
          @update:model-value="projectStore.updateSEO({ metaTitle: $event as string })"
        />
      </FormField>

      <FormField label="Meta Description">
        <Textarea
          :model-value="settings.seo.metaDescription"
          placeholder="Brief description for search results..."
          :rows="2"
          @update:model-value="projectStore.updateSEO({ metaDescription: $event })"
        />
      </FormField>

      <FormField label="Keywords">
        <Input
          :model-value="settings.seo.keywords"
          placeholder="keyword1, keyword2, keyword3"
          @update:model-value="projectStore.updateSEO({ keywords: $event as string })"
        />
      </FormField>

      <div class="grid grid-cols-2 gap-3">
        <FormField label="OG Image">
          <div class="space-y-2">
            <!-- Image preview -->
            <div
              v-if="settings.seo.ogImage"
              class="relative group rounded-md overflow-hidden border border-border"
            >
              <img
                :src="settings.seo.ogImage"
                alt="OG Image"
                class="w-full h-20 object-cover"
              />
              <!-- Overlay actions -->
              <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  class="w-7 h-7 bg-background/90 backdrop-blur-sm border border-border rounded-full flex items-center justify-center text-foreground hover:bg-background transition-colors"
                  title="Replace image"
                  @click="showOgImageUpload = true"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
                <button
                  type="button"
                  class="w-7 h-7 bg-destructive/90 backdrop-blur-sm border border-destructive rounded-full flex items-center justify-center text-destructive-foreground hover:bg-destructive transition-colors"
                  title="Remove image"
                  @click="removeOgImage"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            <!-- Upload button (when no image) -->
            <button
              v-else
              type="button"
              class="w-full h-20 border border-dashed border-border rounded-md flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors"
              @click="showOgImageUpload = true"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span class="text-xs">Upload OG Image</span>
            </button>
          </div>
        </FormField>

        <FormField label="Favicon">
          <div class="space-y-2">
            <!-- Image preview -->
            <div
              v-if="settings.seo.favicon"
              class="relative group rounded-md overflow-hidden border border-border"
            >
              <div class="w-full h-20 flex items-center justify-center bg-muted/50">
                <img
                  :src="settings.seo.favicon"
                  alt="Favicon"
                  class="w-10 h-10 object-contain"
                />
              </div>
              <!-- Overlay actions -->
              <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  class="w-7 h-7 bg-background/90 backdrop-blur-sm border border-border rounded-full flex items-center justify-center text-foreground hover:bg-background transition-colors"
                  title="Replace favicon"
                  @click="showFaviconUpload = true"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
                <button
                  type="button"
                  class="w-7 h-7 bg-destructive/90 backdrop-blur-sm border border-destructive rounded-full flex items-center justify-center text-destructive-foreground hover:bg-destructive transition-colors"
                  title="Remove favicon"
                  @click="removeFavicon"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            <!-- Upload button (when no image) -->
            <button
              v-else
              type="button"
              class="w-full h-20 border border-dashed border-border rounded-md flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors"
              @click="showFaviconUpload = true"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span class="text-xs">Upload Favicon</span>
            </button>
          </div>
        </FormField>
      </div>
    </Card.Content>

    <!-- OG Image Upload Modal -->
    <ProjectUpload
      v-model:open="showOgImageUpload"
      :project-id="projectId"
      @uploaded="handleOgImageUploaded"
    />

    <!-- Favicon Upload Modal -->
    <ProjectUpload
      v-model:open="showFaviconUpload"
      :project-id="projectId"
      @uploaded="handleFaviconUploaded"
    />
  </Card>
</template>
