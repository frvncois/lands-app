<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { Button, Icon } from '@/components/ui'
import PlanUpgrade from '@/components/modal/PlanUpgrade.vue'

const route = useRoute()
const projectId = computed(() => route.params.projectId as string)
const showUpgradeModal = ref(false)
</script>

<template>
  <div class="flex items-center justify-center py-20">
    <div class="text-center max-w-md">
      <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
        <Icon
          name="app-integration"
          :size="32"
          class="text-primary"
        />
      </div>
      <h3 class="text-xl font-semibold text-foreground mb-2">
        Unlock Integrations
      </h3>
      <p class="text-sm text-muted-foreground mb-6">
        Upgrade to Pro to connect third-party services and supercharge your project.
      </p>
      <div class="space-y-3 text-left mb-6">
        <div class="flex items-center gap-3 text-sm text-foreground bg-muted/50 rounded-2xl p-3.5">
          <div class="bg-green-500/10 text-green-600 border border-green-500/20 rounded-full p-1">
            <svg
              class="w-4 h-4 text-green-500"
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
          Email marketing (Mailchimp, ConvertKit, Buttondown)
        </div>
        <div class="flex items-center gap-3 text-sm text-foreground bg-muted/50 rounded-2xl p-3.5">
          <div class="bg-green-500/10 text-green-600 border border-green-500/20 rounded-full p-1">
            <svg
              class="w-4 h-4 text-green-500"
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
          Payments (Stripe, Gumroad, Lemon Squeezy)
        </div>
        <div class="flex items-center gap-3 text-sm text-foreground bg-muted/50 rounded-2xl p-3.5">
          <div class="bg-green-500/10 text-green-600 border border-green-500/20 rounded-full p-1">
            <svg
              class="w-4 h-4 text-green-500"
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
          Automation (Zapier, Custom Webhooks)
        </div>
        <div class="flex items-center gap-3 text-sm text-foreground bg-muted/50 rounded-2xl p-3.5">
          <div class="bg-green-500/10 text-green-600 border border-green-500/20 rounded-full p-1">
            <svg
              class="w-4 h-4 text-green-500"
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
          Form submissions to your integrations
        </div>
      </div>
      <Button
        size="sm"
        @click="showUpgradeModal = true"
      >
        Upgrade to Pro - $6/month
      </Button>
    </div>
  </div>

  <PlanUpgrade
    v-model:open="showUpgradeModal"
    :project-id="projectId"
  />
</template>
