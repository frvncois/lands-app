<script setup lang="ts">
import { ref, computed } from 'vue'
import { useProjectStore } from '@/stores/project'
import { planHasFeature } from '@/types/project'
import { useProjectSettings } from './useProjectSettings'
import PlanUpgrade from '@/components/modal/PlanUpgrade.vue'
import { Card, Badge, Button } from '@/components/ui'

const projectStore = useProjectStore()
const settings = computed(() => projectStore.settings)
const projectId = computed(() => projectStore.currentProjectId || '')

const { currentPlan } = useProjectSettings()
const showUpgradeModal = ref(false)

const features = [
  { key: 'landsDomain', label: 'Lands subdomain (yoursite.lands.app)', always: true },
  { key: 'customDomain', label: 'Custom domain support', always: false },
  { key: 'noWatermark', label: 'No Lands watermark', always: false },
  { key: 'analytics', label: 'Full analytics dashboard', always: false },
  { key: 'integrations', label: 'All integrations (email, payments, etc.)', always: false },
  { key: 'collaborators', label: 'Team collaboration', always: false },
  { key: 'customFonts', label: 'Custom Google Fonts', always: false },
] as const
</script>

<template>
  <Card>
    <Card.Header
      title="Plan"
      icon="lni-credit-card-multiple"
    />
    <Card.Content class="space-y-4">
      <!-- Current Plan Display -->
      <div class="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-foreground">{{ currentPlan.name }}</span>
            <Badge
              v-if="settings.plan === 'pro'"
              variant="success"
              size="xs"
            >
              Active
            </Badge>
          </div>
          <p class="text-xs text-muted-foreground mt-0.5">
            {{ currentPlan.description }}
          </p>
        </div>
        <div class="text-right">
          <p class="text-lg font-semibold text-foreground">
            {{ currentPlan.price === 0 ? 'Free' : `$${currentPlan.price}` }}
          </p>
          <p
            v-show="currentPlan.price > 0"
            class="text-xs text-muted-foreground"
          >
            /month
          </p>
        </div>
      </div>

      <!-- Plan Features -->
      <div class="space-y-2">
        <p class="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Plan includes
        </p>
        <div class="grid grid-cols-1 gap-2">
          <div
            v-for="feature in features"
            :key="feature.key"
            class="flex items-center gap-3 text-sm rounded-2xl p-3.5"
            :class="feature.always || planHasFeature(settings.plan, feature.key) ? 'text-foreground bg-muted/50' : 'text-muted-foreground bg-muted/20 opacity-60'"
          >
            <div
              class="rounded-full p-1"
              :class="feature.always || planHasFeature(settings.plan, feature.key) ? 'bg-green-500/10 text-green-600 border border-green-500/20' : 'bg-muted border border-border'"
            >
              <svg
                class="w-4 h-4"
                :class="feature.always || planHasFeature(settings.plan, feature.key) ? 'text-green-500' : 'text-muted-foreground'"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            {{ feature.label }}
          </div>
        </div>
      </div>

      <!-- Upgrade Button (only for free plan) -->
      <div
        v-show="settings.plan === 'free'"
        class="pt-2"
      >
        <Button
          class="w-full"
          @click="showUpgradeModal = true"
        >
          Upgrade to Pro - $6/month
        </Button>
      </div>

      <!-- Manage Subscription (for pro plan) -->
      <div
        v-show="settings.plan !== 'free'"
        class="pt-2"
      >
        <Button
          variant="outline"
          class="w-full"
        >
          Manage Subscription
        </Button>
      </div>
    </Card.Content>

    <PlanUpgrade
      v-model:open="showUpgradeModal"
      :project-id="projectId"
    />
  </Card>
</template>
