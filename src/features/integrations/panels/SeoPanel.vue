<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseInput from '@/shared/ui/BaseInput.vue'
import BaseUpload from '@/shared/ui/BaseUpload.vue'
import { useLandStore } from '@/features/lands/stores/land'
import { landService } from '@/features/lands/services/land.service'
import { addToast } from '@/shared/composables/useToast'
import { debounce } from '@/shared/lib/debounce'

const landStore = useLandStore()

const metaTitle = ref(landStore.activeLand?.meta_title ?? '')
const metaDescription = ref(landStore.activeLand?.meta_description ?? '')
const ogImage = ref(landStore.activeLand?.og_image ?? '')

watch(() => landStore.activeLand, (land) => {
  metaTitle.value = land?.meta_title ?? ''
  metaDescription.value = land?.meta_description ?? ''
  ogImage.value = land?.og_image ?? ''
})

const save = debounce(async () => {
  const land = landStore.activeLand
  if (!land) return
  const updates = {
    meta_title: metaTitle.value || null,
    meta_description: metaDescription.value || null,
    og_image: ogImage.value || null,
  }
  landStore.updateLand(land.id, updates)
  try {
    await landService.updateLand(land.id, updates)
  } catch {
    addToast('Failed to save SEO settings', 'error')
  }
})
</script>

<template>
  <div class="flex flex-col gap-4 p-4">
    <BaseInput
      size="sm"
      label="Meta title"
      v-model="metaTitle"
      :placeholder="landStore.activeLand?.title ?? 'Page title'"
      @update:modelValue="save"
    />
    <div class="flex flex-col gap-1.5">
      <BaseInput
        size="sm"
        type="textarea"
        label="Meta description"
        v-model="metaDescription"
        placeholder="A short description of your page (recommended: 150–160 characters)"
        @update:modelValue="save"
      />
      <p class="text-[10px] text-right" :class="metaDescription.length > 160 ? 'text-red-400' : 'text-gray-300'">
        {{ metaDescription.length }} / 160
      </p>
    </div>
    <BaseUpload
      size="sm"
      label="Social image (OG)"
      v-model="ogImage"
      @update:modelValue="save"
    />
    <p class="text-[10px] text-gray-400 leading-relaxed">
      The social image appears when your page is shared on social media. Recommended size: 1200 × 630px.
    </p>
  </div>
</template>
