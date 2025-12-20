<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@/components/ui'
import {
  getRecommendedSections,
  CONTENT_SECTIONS,
  type UseCaseCategory,
} from '@/lib/layouts'

const props = defineProps<{
  useCase: UseCaseCategory
  goalId: string
}>()

const sections = defineModel<string[]>('sections', { required: true })

const recommendedData = computed(() =>
  getRecommendedSections(props.useCase, props.goalId)
)

const available = computed(() => recommendedData.value.available)
const recommended = computed(() => recommendedData.value.recommended)

function toggleSection(sectionId: string) {
  const index = sections.value.indexOf(sectionId)
  if (index >= 0) {
    sections.value.splice(index, 1)
  } else {
    sections.value.push(sectionId)
  }
}

function isSelected(sectionId: string) {
  return sections.value.includes(sectionId)
}

function isRecommended(sectionId: string) {
  return recommended.value.includes(sectionId)
}

// Move section up/down
function moveSection(sectionId: string, direction: 'up' | 'down') {
  const index = sections.value.indexOf(sectionId)
  if (index < 0) return

  const newIndex = direction === 'up' ? index - 1 : index + 1
  if (newIndex < 0 || newIndex >= sections.value.length) return

  const temp = sections.value[newIndex]!
  sections.value[newIndex] = sections.value[index]!
  sections.value[index] = temp
}

function getSectionInfo(sectionId: string) {
  return CONTENT_SECTIONS.find(s => s.id === sectionId)
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <p class="text-sm text-muted-foreground">
        Select and reorder sections for your page
      </p>
      <div class="flex items-center gap-2 text-xs">
        <span class="px-2 py-1 bg-primary/10 text-primary rounded">Recommended</span>
      </div>
    </div>

    <!-- Selected Sections (Sortable) -->
    <div v-if="sections.length > 0" class="space-y-2 mb-4">
      <p class="text-sm font-medium text-foreground">Your Sections</p>
      <div class="space-y-1.5">
        <div
          v-for="(sectionId, index) in sections"
          :key="sectionId"
          class="flex items-center gap-3 p-3 bg-muted rounded-lg"
        >
          <span class="w-6 h-6 flex items-center justify-center text-xs font-medium bg-background rounded">
            {{ index + 1 }}
          </span>
          <i
            :class="getSectionInfo(sectionId)?.icon"
            class="text-muted-foreground"
          />
          <span class="flex-1 text-sm font-medium">
            {{ getSectionInfo(sectionId)?.name }}
          </span>
          <div class="flex items-center gap-1">
            <button
              class="p-1 hover:bg-background rounded disabled:opacity-30"
              :disabled="index === 0"
              @click="moveSection(sectionId, 'up')"
            >
              <Icon name="arrow-up" class="w-4 h-4" />
            </button>
            <button
              class="p-1 hover:bg-background rounded disabled:opacity-30"
              :disabled="index === sections.length - 1"
              @click="moveSection(sectionId, 'down')"
            >
              <Icon name="arrow-down" class="w-4 h-4" />
            </button>
            <button
              class="p-1 hover:bg-destructive/10 hover:text-destructive rounded"
              @click="toggleSection(sectionId)"
            >
              <Icon name="xmark" class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Available Sections -->
    <div class="space-y-2">
      <p class="text-sm font-medium text-foreground">Add Sections</p>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <button
          v-for="section in available"
          :key="section.id"
          type="button"
          class="flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left"
          :class="[
            isSelected(section.id)
              ? 'border-primary bg-primary/5 opacity-50'
              : 'border-border hover:border-primary/50 hover:bg-muted',
            isRecommended(section.id) && !isSelected(section.id) ? 'ring-2 ring-primary/20' : ''
          ]"
          :disabled="isSelected(section.id)"
          @click="toggleSection(section.id)"
        >
          <div
            class="w-8 h-8 rounded flex items-center justify-center shrink-0"
            :class="isSelected(section.id) ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'"
          >
            <i :class="section.icon" class="text-sm" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-medium truncate">{{ section.name }}</p>
            <p class="text-xs text-muted-foreground truncate">{{ section.description }}</p>
          </div>
          <Icon
            v-if="isRecommended(section.id) && !isSelected(section.id)"
            name="star"
            class="w-4 h-4 text-primary shrink-0"
          />
        </button>
      </div>
    </div>
  </div>
</template>
