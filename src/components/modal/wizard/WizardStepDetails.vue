<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Input from '@/components/ui/Input.vue'

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50)
}

const props = defineProps<{
  projectName: string
  projectDescription: string
  referenceUrl: string
}>()

const emit = defineEmits<{
  'update:projectName': [value: string]
  'update:projectDescription': [value: string]
  'update:referenceUrl': [value: string]
}>()

// Local state for input values
const name = ref(props.projectName)
const description = ref(props.projectDescription)
const url = ref(props.referenceUrl)

// Watch for prop changes
watch(() => props.projectName, (value) => name.value = value)
watch(() => props.projectDescription, (value) => description.value = value)
watch(() => props.referenceUrl, (value) => url.value = value)

// Emit changes
watch(name, (value) => emit('update:projectName', value))
watch(description, (value) => emit('update:projectDescription', value))
watch(url, (value) => emit('update:referenceUrl', value))

// Generate slug preview
const slugPreview = computed(() => {
  if (!name.value.trim()) return ''
  return generateSlug(name.value)
})

// URL validation
const isValidUrl = computed(() => {
  if (!url.value.trim()) return true // Empty is valid (optional)
  try {
    const urlObj = new URL(url.value)
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch {
    return false
  }
})

const urlError = computed(() => {
  if (url.value.trim() && !isValidUrl.value) {
    return 'Please enter a valid URL starting with http:// or https://'
  }
  return ''
})
</script>

<template>
  <div class="space-y-6">
    <p class="text-sm text-muted-foreground">
      Tell us about your project. We'll use this information to generate relevant content and structure.
    </p>

    <!-- Project Name -->
    <div class="space-y-2">
      <label class="block">
        <span class="text-sm font-medium text-foreground">
          Project Name
          <span class="text-destructive">*</span>
        </span>
        <Input
          v-model="name"
          type="text"
          placeholder="e.g., My Awesome Product"
          class="mt-1.5"
          required
        />
      </label>

      <!-- Slug preview -->
      <div v-if="slugPreview" class="flex items-center gap-2 text-xs text-muted-foreground">
        <span>URL:</span>
        <code class="px-2 py-0.5 bg-muted rounded font-mono">
          lands.app/{{ slugPreview }}
        </code>
      </div>
    </div>

    <!-- Project Description -->
    <div class="space-y-2">
      <label class="block">
        <span class="text-sm font-medium text-foreground">
          Project Description
          <span class="text-xs text-muted-foreground ml-1">(optional)</span>
        </span>
        <textarea
          v-model="description"
          rows="4"
          class="mt-1.5 w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          placeholder="Describe what your project is about, who it's for, and what makes it unique..."
        />
      </label>
      <p class="text-xs text-muted-foreground">
        A detailed description helps our AI generate more relevant content
      </p>
    </div>

    <!-- Reference URL -->
    <div class="space-y-2">
      <label class="block">
        <span class="text-sm font-medium text-foreground">
          Reference URL
          <span class="text-xs text-muted-foreground ml-1">(optional)</span>
        </span>
        <Input
          v-model="url"
          type="url"
          placeholder="https://example.com"
          class="mt-1.5"
          :class="{ 'border-destructive': urlError }"
        />
      </label>

      <!-- URL validation error -->
      <p v-if="urlError" class="text-xs text-destructive">
        {{ urlError }}
      </p>

      <!-- Helper text -->
      <p v-else class="text-xs text-muted-foreground">
        Provide a website for inspiration. Our AI will analyze its content and style to create relevant sections.
      </p>
    </div>

    <!-- Info box -->
    <div class="p-4 bg-muted/50 border border-border rounded-lg">
      <div class="flex gap-3">
        <div class="flex-shrink-0 mt-0.5">
          <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="flex-1 space-y-1">
          <p class="text-sm font-medium text-foreground">AI Content Generation</p>
          <p class="text-xs text-muted-foreground leading-relaxed">
            Based on your inputs, our AI will generate relevant headlines, descriptions, and structure for your landing page. You can edit everything later.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
