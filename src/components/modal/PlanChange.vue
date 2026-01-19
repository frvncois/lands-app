<script setup lang="ts">
import { ref } from 'vue'
import { Modal, Button } from '@/components/ui'
import type { Project, ProjectPlan } from '@/types/project'

interface Props {
  open: boolean
  project: Project | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:open': [value: boolean]
  'changed': [plan: ProjectPlan]
}>()

const isUpdatingPlan = ref(false)

const planOptions: { value: ProjectPlan; label: string; price: string; features: string[] }[] = [
  {
    value: 'free',
    label: 'Free',
    price: '$0/mo',
    features: ['1 project', 'Basic analytics', 'Community support'],
  },
  {
    value: 'pro',
    label: 'Pro',
    price: '$6/mo',
    features: ['Unlimited projects', 'Advanced analytics', 'Custom domains', 'Priority support'],
  },
]

function close() {
  emit('update:open', false)
}

async function updatePlan(plan: ProjectPlan) {
  if (!props.project || props.project.plan === plan) return

  isUpdatingPlan.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    emit('changed', plan)
    close()
  } finally {
    isUpdatingPlan.value = false
  }
}
</script>

<template>
  <Modal
    :open="open && !!project"
    size="lg"
    :closable="!isUpdatingPlan"
    @update:open="close"
  >
    <template #header>
      <div>
        <h2 class="text-lg font-semibold text-foreground">
          Change Plan
        </h2>
        <p class="text-sm text-muted-foreground mt-1">
          Select a plan for <span class="font-medium text-foreground">{{ project?.title }}</span>
        </p>
      </div>
    </template>

    <div class="grid grid-cols-2 gap-4">
      <button
        v-for="plan in planOptions"
        :key="plan.value"
        class="relative p-4 rounded-lg border text-left transition-all"
        :class="project?.plan === plan.value
          ? 'border-primary bg-primary/5 ring-2 ring-primary'
          : 'border-border hover:border-muted-foreground/50'"
        :disabled="isUpdatingPlan"
        @click="updatePlan(plan.value)"
      >
        <div
          v-if="project?.plan === plan.value"
          class="absolute top-2 right-2"
        >
          <Icon
            name="checkmark-circle"
            class="text-lg text-primary"
          />
        </div>
        <p class="text-sm font-semibold text-foreground">
          {{ plan.label }}
        </p>
        <p class="text-lg font-bold text-foreground mt-1">
          {{ plan.price }}
        </p>
        <ul class="mt-3 space-y-1.5">
          <li
            v-for="feature in plan.features"
            :key="feature"
            class="flex items-center gap-2 text-xs text-muted-foreground"
          >
            <Icon
              name="checkmark"
              class="text-xs text-primary shrink-0"
            />
            {{ feature }}
          </li>
        </ul>
      </button>
    </div>

    <template #footer>
      <Button
        variant="ghost"
        :disabled="isUpdatingPlan"
        @click="close"
      >
        Cancel
      </Button>
    </template>
  </Modal>
</template>
