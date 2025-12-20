<script setup lang="ts">
import { computed } from 'vue'
import { getGoalsForUseCase, type UseCaseCategory } from '@/lib/layouts'

const props = defineProps<{
  useCase: UseCaseCategory
}>()

const description = defineModel<string>('description', { required: true })
const goalId = defineModel<string | null>('goalId', { required: true })

// Get goals specific to the selected use case
const availableGoals = computed(() => getGoalsForUseCase(props.useCase))
</script>

<template>
  <div class="space-y-6">
    <!-- Description -->
    <div class="space-y-2">
      <label class="text-sm font-medium text-foreground">
        Describe your project
        <span class="text-muted-foreground font-normal">(optional)</span>
      </label>
      <textarea
        v-model="description"
        class="w-full h-24 px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        placeholder="I'm building a landing page for my new e-book about productivity tips..."
      />
      <p class="text-xs text-muted-foreground">
        This helps us suggest the best sections for your page
      </p>
    </div>

    <!-- Goal Selection -->
    <div class="space-y-3">
      <label class="text-sm font-medium text-foreground">What's your main goal?</label>
      <div class="grid grid-cols-2 gap-3">
        <button
          v-for="g in availableGoals"
          :key="g.id"
          type="button"
          class="flex items-center gap-3 p-4 rounded-xl border-2 transition-all hover:bg-muted text-left"
          :class="goalId === g.id
            ? 'border-primary bg-primary/5'
            : 'border-border'"
          @click="goalId = g.id"
        >
          <div
            class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            :class="goalId === g.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'"
          >
            <i :class="g.icon" class="text-lg" />
          </div>
          <div>
            <p class="text-sm font-medium text-foreground">{{ g.name }}</p>
            <p class="text-xs text-muted-foreground">{{ g.description }}</p>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>
