<script setup lang="ts">
import { ref } from 'vue'
import { CheckIcon, SparklesIcon, CreditCardIcon } from '@heroicons/vue/24/outline'
import BaseButton from '@/shared/ui/BaseButton.vue'
import { useLandStore } from '@/features/lands/stores/land'
import { addToast } from '@/shared/composables/useToast'
import { stripeService } from '@/features/integrations/services/stripe.service'
import { PLAN_DETAILS } from '@/features/plan/types'
import type { LandPlan } from '@/features/plan/types'

const landStore = useLandStore()

// ─── Billing period ───
const billing = ref<'monthly' | 'yearly'>('monthly')

const PRICE_MONTHLY = PLAN_DETAILS.paid.price_monthly  // 10 CAD
const PRICE_YEARLY  = PLAN_DETAILS.paid.price_yearly   // 90 CAD

const FEATURES: Record<LandPlan, string[]> = {
  free: ['2 free projects', 'Unlimited sections', 'Basic analytics', 'lands.app subdomain', 'Max 2 collections / Max 10 items'],
  paid: ['Unlimited projects', 'Unlimited sections', 'Advanced analytics', 'Custom domain', 'Unlimited collections & items', 'Campaign integrations', 'Collaborators', 'Remove Lands branding', 'Priority support'],
}

const isRedirecting = ref<string | null>(null)

async function upgrade(landId: string) {
  isRedirecting.value = `upgrade-${landId}`
  try {
    const url = await stripeService.createSubscriptionCheckout(landId, billing.value)
    window.location.href = url
  } catch {
    addToast('Failed to start checkout — please try again', 'error')
    isRedirecting.value = null
  }
}

async function openBillingPortal(landId: string) {
  isRedirecting.value = `portal-${landId}`
  try {
    const url = await stripeService.createBillingPortal(landId)
    window.location.href = url
  } catch {
    addToast('Failed to open billing portal — please try again', 'error')
    isRedirecting.value = null
  }
}
</script>

<template>
  <section class="h-full overflow-y-auto">
  <section class="max-w-2xl m-auto pt-4 space-y-8">

    <div>
      <h1 class="text-2xl">Plans</h1>
      <p class="text-sm text-gray-400 mt-1">Choose the plan that fits your needs. Upgrade or downgrade anytime.</p>
    </div>

    <!-- ── Active Plans ── -->

    <!-- ── Plans ── -->
    <div class="flex flex-col gap-4 pt-8 pb-8">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="shrink-0 flex items-center justify-center h-8 w-8 rounded-xl bg-gray-100">
            <SparklesIcon class="h-4 w-4 text-gray-600" />
          </div>
          <div>
            <h2 class="text-base font-semibold text-gray-900">Plans</h2>
            <p class="text-xs text-gray-400">Compare features across plans</p>
          </div>
        </div>

        <!-- Billing toggle -->
        <div class="flex items-center gap-1 p-1 bg-gray-100 rounded-xl text-xs font-medium">
          <button
            class="px-3 py-1.5 rounded-lg transition-colors"
            :class="billing === 'monthly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
            @click="billing = 'monthly'"
          >
            Monthly
          </button>
          <button
            class="px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
            :class="billing === 'yearly' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
            @click="billing = 'yearly'"
          >
            Yearly
            <span class="text-[10px] font-semibold text-green-600 bg-green-100 px-1.5 py-0.5 rounded-md">-25%</span>
          </button>
        </div>
      </div>

      <!-- Pricing cards -->
      <div class="grid grid-cols-2 gap-4">
        <!-- Free -->
        <div class="flex flex-col gap-4 p-5 border border-gray-200 rounded-2xl">
          <div>
            <span class="text-xl font-semibold text-gray-900">Free</span>
            <p class="text-sm font-medium text-gray-500 mt-1">Free plan</p>
          </div>
          <ul class="flex flex-col gap-2">
            <li v-for="f in FEATURES.free" :key="f" class="flex items-start gap-2 text-xs text-gray-600">
              <CheckIcon class="h-3.5 w-3.5 text-gray-400 shrink-0 mt-0.5" />{{ f }}
            </li>
          </ul>
        </div>

        <!-- Paid -->
        <div class="flex flex-col gap-4 p-5 border border-gray-900 bg-gray-50 rounded-2xl">
          <div>
            <div class="flex items-baseline gap-1.5">
              <span class="text-xl font-semibold text-gray-900">
                {{ billing === 'monthly' ? `$${PRICE_MONTHLY}` : `$${PRICE_YEARLY}` }}
              </span>
              <span class="text-sm text-gray-400">{{ billing === 'monthly' ? '/mo' : '/yr' }} CAD</span>
            </div>
            <p class="text-sm font-medium text-gray-900 mt-1">Paid plan</p>
            <p v-if="billing === 'yearly'" class="text-xs text-green-600 mt-0.5">$7.50/mo — save $30/year</p>
          </div>
          <ul class="flex flex-col gap-2">
            <li v-for="f in FEATURES.paid" :key="f" class="flex items-start gap-2 text-xs text-gray-600">
              <CheckIcon class="h-3.5 w-3.5 text-gray-400 shrink-0 mt-0.5" />{{ f }}
            </li>
          </ul>
        </div>
      </div>

      <!-- Feature comparison table -->
      <div class="flex flex-col gap-2">
        <div
          v-for="land in landStore.lands"
          :key="land.id"
          class="flex items-center justify-between gap-4 p-4 border border-gray-200 rounded-2xl"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div class="h-8 w-8 rounded-lg bg-gray-200 shrink-0 overflow-hidden">
              <img v-if="land.avatar_image" :src="land.avatar_image" class="w-full h-full object-cover" />
            </div>
            <div class="min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{{ land.title }}</p>
              <p class="text-xs text-gray-400 truncate">{{ land.handle }}.lands.app</p>
            </div>
          </div>

          <div class="flex items-center gap-3 shrink-0">
            <span
              class="text-xs font-medium px-2.5 py-1 rounded-full"
              :class="land.plan === 'paid'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600'"
            >
              {{ land.plan === 'paid' ? `Paid · $${PRICE_MONTHLY}/mo` : 'Free' }}
            </span>
            <BaseButton
              v-if="land.plan === 'free'"
              size="sm"
              variant="solid"
              :disabled="isRedirecting === `upgrade-${land.id}`"
              @click="upgrade(land.id)"
            >
              {{ isRedirecting === `upgrade-${land.id}` ? 'Redirecting…' : 'Upgrade' }}
            </BaseButton>
            <BaseButton
              v-else
              size="sm"
              variant="outline"
              :disabled="isRedirecting === `portal-${land.id}`"
              @click="openBillingPortal(land.id)"
            >
              {{ isRedirecting === `portal-${land.id}` ? 'Loading…' : 'Manage' }}
            </BaseButton>
          </div>
        </div>

        <p v-if="landStore.lands.length === 0" class="text-sm text-gray-400">No projects yet.</p>
      </div>
    </div>

    <!-- ── Billing portal ── -->
    <div class="flex flex-col gap-4 pt-8 pb-8">
      <div class="flex items-center gap-3">
        <div class="shrink-0 flex items-center justify-center h-8 w-8 rounded-xl bg-gray-100">
          <CreditCardIcon class="h-4 w-4 text-gray-600" />
        </div>
        <div>
          <h2 class="text-base font-semibold text-gray-900">Billing</h2>
          <p class="text-xs text-gray-400">Manage your payment method and view invoices</p>
        </div>
      </div>
      <div v-if="landStore.lands.some(l => l.plan === 'paid')">
        <BaseButton
          variant="outline"
          size="md"
          :disabled="!!isRedirecting"
          @click="openBillingPortal(landStore.lands.find(l => l.plan === 'paid')!.id)"
        >
          {{ isRedirecting ? 'Loading…' : 'Open billing portal' }}
        </BaseButton>
        <p class="text-xs text-gray-400 mt-2">View invoices, update your payment method, or cancel your subscription.</p>
      </div>
      <p v-else class="text-sm text-gray-400">No active paid plans. Upgrade a project to access billing.</p>
    </div>

  </section>
  </section>
</template>
