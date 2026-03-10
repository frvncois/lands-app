<script setup lang="ts">
import { computed, ref } from 'vue'
import { CheckIcon } from '@heroicons/vue/24/outline'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import { useLandStore } from '@/stores/land'
import { PLAN_DETAILS } from '@/types/plan'
import type { LandPlan } from '@/types/plan'

const landStore = useLandStore()

// ─── Plans ───
const PRICE = 10 // USD/month (paid plan)

const FEATURES: Record<LandPlan, string[]> = {
  free: ['1 project', 'Unlimited sections', 'Basic analytics', 'lands.app subdomain'],
  paid: ['1 project', 'Unlimited sections', 'Advanced analytics', 'Custom domain', 'Plugins', 'Priority support', 'Remove Lands branding'],
}

function upgrade(landId: string) {
  landStore.updateLand(landId, { plan: 'paid' } as any)
}

function downgrade(landId: string) {
  landStore.updateLand(landId, { plan: 'free' } as any)
}

// ─── Billing ───
const cardName = ref('')
const cardNumber = ref('')
const cardExpiry = ref('')
const cardCvc = ref('')

// ─── Invoices (mock) ───
const invoices = [
  { id: 'INV-0004', date: 'Mar 1, 2026', description: 'Paid plan — my-portfolio', amount: '$10.00', status: 'Paid' },
  { id: 'INV-0003', date: 'Feb 1, 2026', description: 'Paid plan — my-portfolio', amount: '$10.00', status: 'Paid' },
  { id: 'INV-0002', date: 'Jan 1, 2026', description: 'Paid plan — my-portfolio', amount: '$10.00', status: 'Paid' },
  { id: 'INV-0001', date: 'Dec 1, 2025', description: 'Paid plan — my-portfolio', amount: '$10.00', status: 'Paid' },
]

const totalMonthly = computed(() =>
  landStore.lands.filter((l) => l.plan === 'paid').length * PRICE
)
</script>

<template>
  <section class="max-w-2xl m-auto pt-8 space-y-8 divide-y divide-gray-200 pb-16">

    <h1 class="text-2xl pb-8">Plans</h1>

    <!-- ── Active Plans ── -->
    <div class="flex flex-col gap-6 pt-8 pb-8">
      <div class="flex items-center justify-between">
        <h2>Active plans</h2>
        <p v-if="totalMonthly > 0" class="text-sm text-gray-500">${{ totalMonthly }}/month total</p>
      </div>

      <div class="flex flex-col gap-3">
        <div
          v-for="land in landStore.lands"
          :key="land.id"
          class="flex items-center justify-between gap-4 p-4 border border-gray-200 rounded-2xl"
        >
          <div class="flex items-center gap-3 min-w-0">
            <div class="h-8 w-8 rounded-lg bg-gray-100 shrink-0 overflow-hidden">
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
              {{ land.plan === 'paid' ? `Paid · $${PRICE}/mo` : 'Free' }}
            </span>
            <BaseButton
              v-if="land.plan === 'free'"
              size="sm"
              variant="solid"
              @click="upgrade(land.id)"
            >
              Upgrade
            </BaseButton>
            <BaseButton
              v-else
              size="sm"
              variant="outline"
              @click="downgrade(land.id)"
            >
              Downgrade
            </BaseButton>
          </div>
        </div>

        <p v-if="landStore.lands.length === 0" class="text-sm text-gray-400">No projects yet.</p>
      </div>
    </div>

    <!-- ── Plan Comparison ── -->
    <div class="flex flex-col gap-6 pt-8 pb-8">
      <h2>Plans</h2>
      <div class="grid grid-cols-2 gap-4">
        <div
          v-for="(plan, key) in PLAN_DETAILS"
          :key="key"
          class="flex flex-col gap-4 p-5 border rounded-2xl"
          :class="key === 'paid' ? 'border-gray-900 bg-gray-50' : 'border-gray-200'"
        >
          <div>
            <div class="flex items-baseline gap-1.5">
              <span class="text-xl font-semibold text-gray-900">{{ key === 'paid' ? `$${PRICE}` : 'Free' }}</span>
              <span v-if="key === 'paid'" class="text-sm text-gray-400">/month</span>
            </div>
            <p class="text-sm font-medium text-gray-900 mt-1">{{ plan.label }} plan</p>
          </div>
          <ul class="flex flex-col gap-2">
            <li
              v-for="feature in FEATURES[key]"
              :key="feature"
              class="flex items-center gap-2 text-xs text-gray-600"
            >
              <CheckIcon class="h-3.5 w-3.5 text-gray-400 shrink-0" />
              {{ feature }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- ── Billing Information ── -->
    <div class="flex flex-col gap-4 pt-8 pb-8">
      <h2>Billing information</h2>
      <BaseInput size="lg" label="Name on card" placeholder="John Doe" v-model="cardName" />
      <BaseInput size="lg" label="Card number" placeholder="4242 4242 4242 4242" v-model="cardNumber" />
      <div class="flex gap-4">
        <BaseInput size="lg" label="Expiry" placeholder="MM / YY" v-model="cardExpiry" />
        <BaseInput size="lg" label="CVC" placeholder="123" v-model="cardCvc" />
      </div>
      <div>
        <BaseButton variant="solid" size="md">Save card</BaseButton>
      </div>
    </div>

    <!-- ── Invoices ── -->
    <div class="flex flex-col gap-4 pt-8 pb-8">
      <h2>Invoices</h2>
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-xs text-gray-400 border-b border-gray-100">
            <th class="pb-2 font-medium">Invoice</th>
            <th class="pb-2 font-medium">Date</th>
            <th class="pb-2 font-medium">Description</th>
            <th class="pb-2 font-medium text-right">Amount</th>
            <th class="pb-2 font-medium text-right">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="inv in invoices"
            :key="inv.id"
            class="border-b border-gray-100 last:border-0"
          >
            <td class="py-3 text-xs text-gray-400 font-mono">{{ inv.id }}</td>
            <td class="py-3 text-xs text-gray-500">{{ inv.date }}</td>
            <td class="py-3 text-xs text-gray-600">{{ inv.description }}</td>
            <td class="py-3 text-xs text-gray-900 text-right font-medium">{{ inv.amount }}</td>
            <td class="py-3 text-right">
              <span class="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{{ inv.status }}</span>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="invoices.length === 0" class="text-sm text-gray-400">No invoices yet.</p>
    </div>

  </section>
</template>
