<script setup lang="ts">
import { ref, watch } from 'vue'
import { supabase } from '@/lib/supabase'
import { Icon, Spinner } from '@/components/ui'
import { USE_CASES, type UseCaseCategory } from '@/lib/layouts'

const title = defineModel<string>('title', { required: true })
const slug = defineModel<string>('slug', { required: true })
const useCase = defineModel<UseCaseCategory | null>('useCase', { required: true })

// Slug validation
const isCheckingSlug = ref(false)
const slugAvailable = ref<boolean | null>(null)
const slugError = ref<string | null>(null)

let slugCheckTimer: ReturnType<typeof setTimeout> | null = null

async function checkSlugAvailability(slugValue: string) {
  if (!slugValue || slugValue.length < 2) {
    slugAvailable.value = null
    slugError.value = slugValue ? 'Slug must be at least 2 characters' : null
    return
  }

  if (!/^[a-z0-9-]+$/.test(slugValue)) {
    slugAvailable.value = false
    slugError.value = 'Only lowercase letters, numbers, and hyphens allowed'
    return
  }

  isCheckingSlug.value = true
  slugError.value = null

  try {
    const { data, error } = await supabase
      .from('projects')
      .select('id')
      .eq('slug', slugValue)
      .maybeSingle()

    if (error) throw error

    slugAvailable.value = !data
    slugError.value = data ? 'This slug is already taken' : null
  } catch (e) {
    console.error('Error checking slug:', e)
    slugError.value = 'Could not verify slug availability'
    slugAvailable.value = null
  } finally {
    isCheckingSlug.value = false
  }
}

watch(slug, (newSlug) => {
  slugAvailable.value = null
  slugError.value = null

  if (slugCheckTimer) clearTimeout(slugCheckTimer)

  if (newSlug) {
    slugCheckTimer = setTimeout(() => {
      checkSlugAvailability(newSlug)
    }, 300)
  }
})
</script>

<template>
  <div class="space-y-6">
    <!-- Project Name -->
    <div class="space-y-2">
      <label class="text-sm font-medium text-foreground">Project name</label>
      <input
        v-model="title"
        type="text"
        class="w-full h-11 px-4 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        placeholder="My awesome project"
        autofocus
      />
    </div>

    <!-- Project Slug -->
    <div class="space-y-2">
      <label class="text-sm font-medium text-foreground">Project URL</label>
      <div class="flex items-center">
        <span class="h-11 px-4 bg-muted border border-r-0 border-border rounded-l-lg flex items-center text-sm text-muted-foreground">
          lands.so/
        </span>
        <div class="relative flex-1">
          <input
            v-model="slug"
            type="text"
            class="w-full h-11 px-4 pr-10 bg-background border rounded-r-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            :class="[
              slugError ? 'border-destructive' : slugAvailable === true ? 'border-green-500' : 'border-border'
            ]"
            placeholder="my-project"
          />
          <div class="absolute right-3 top-1/2 -translate-y-1/2">
            <Spinner v-if="isCheckingSlug" class="w-4 h-4" />
            <Icon v-else-if="slugAvailable === true" name="checkmark" class="w-4 h-4 text-green-500" />
            <Icon v-else-if="slugError" name="xmark" class="w-4 h-4 text-destructive" />
          </div>
        </div>
      </div>
      <p v-if="slugError" class="text-xs text-destructive">{{ slugError }}</p>
    </div>

    <!-- Use Case Selection -->
    <div class="space-y-3">
      <label class="text-sm font-medium text-foreground">What type of page are you building?</label>
      <div class="grid grid-cols-3 sm:grid-cols-4 gap-3">
        <button
          v-for="uc in USE_CASES"
          :key="uc.id"
          type="button"
          class="flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all hover:bg-muted"
          :class="useCase === uc.id
            ? 'border-primary bg-primary/5'
            : 'border-border'"
          @click="useCase = uc.id"
        >
          <div
            class="w-10 h-10 rounded-lg flex items-center justify-center"
            :class="useCase === uc.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'"
          >
            <i :class="uc.icon" class="text-lg" />
          </div>
          <span class="text-xs font-medium text-foreground text-center">{{ uc.name }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
