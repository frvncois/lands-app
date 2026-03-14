<script setup lang="ts">
import { computed, ref } from 'vue'
import { CheckIcon, XMarkIcon, RectangleStackIcon, SparklesIcon, CreditCardIcon, DocumentTextIcon } from '@heroicons/vue/24/outline'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import { useLandStore } from '@/stores/land'
import { landService } from '@/services/land.service'
import { useToast } from '@/composables/useToast'
import { PLAN_DETAILS } from '@/types/plan'
import type { LandPlan } from '@/types/plan'

const landStore = useLandStore()
const { addToast } = useToast()

// ─── Billing period ───
const billing = ref<'monthly' | 'yearly'>('monthly')

const PRICE_MONTHLY = PLAN_DETAILS.paid.price_monthly  // 10 CAD
const PRICE_YEARLY  = PLAN_DETAILS.paid.price_yearly   // 90 CAD

// ─── Feature comparison ───
interface FeatureRow { label: string; free: string | boolean; paid: string | boolean }

const FEATURE_ROWS: FeatureRow[] = [
  { label: 'Projects',                    free: '2 free projects',  paid: 'Unlimited' },
  { label: 'Sections',                    free: true,               paid: true },
  { label: 'Analytics',                   free: 'Basic',            paid: 'Advanced' },
  { label: 'Subdomain (*.lands.app)',     free: true,               paid: true },
  { label: 'Custom domain',              free: false,              paid: true },
  { label: 'Collections per section',    free: 'Max 2',            paid: 'Unlimited' },
  { label: 'Items per collection',       free: 'Max 10',           paid: 'Unlimited' },
  { label: 'Campaign integrations',      free: false,              paid: true },
  { label: 'Collaborators',              free: false,              paid: true },
  { label: 'Remove Lands branding',      free: false,              paid: true },
  { label: 'Priority support',           free: false,              paid: true },
]

const FEATURES: Record<LandPlan, string[]> = {
  free: ['2 free projects', 'Unlimited sections', 'Basic analytics', 'lands.app subdomain', 'Max 2 collections / Max 10 items'],
  paid: ['Unlimited projects', 'Unlimited sections', 'Advanced analytics', 'Custom domain', 'Unlimited collections & items', 'Campaign integrations', 'Collaborators', 'Remove Lands branding', 'Priority support'],
}

async function upgrade(landId: string) {
  landStore.updateLand(landId, { plan: 'paid' })
  try {
    await landService.updateLand(landId, { plan: 'paid' })
    addToast('Plan upgraded successfully')
  } catch {
    landStore.updateLand(landId, { plan: 'free' })
    addToast('Failed to upgrade plan — please try again', 'error')
  }
}

async function downgrade(landId: string) {
  landStore.updateLand(landId, { plan: 'free' })
  try {
    await landService.updateLand(landId, { plan: 'free' })
    addToast('Plan downgraded')
  } catch {
    landStore.updateLand(landId, { plan: 'paid' })
    addToast('Failed to downgrade plan — please try again', 'error')
  }
}

// ─── Billing ───
const cardName = ref('')
const cardNumber = ref('')
const cardExpiry = ref('')
const cardCvc = ref('')
const isSavingCard = ref(false)

async function saveCard() {
  if (!cardNumber.value || !cardName.value) {
    addToast('Please fill in all card details', 'error')
    return
  }
  isSavingCard.value = true
  try {
    // TODO: integrate with Stripe payment method API
    await new Promise(resolve => setTimeout(resolve, 800))
    addToast('Card saved successfully')
  } finally {
    isSavingCard.value = false
  }
}

// ─── Invoices (mock) ───
const invoices = [
  { id: 'INV-0004', date: 'Mar 1, 2026', description: 'Paid plan — my-portfolio', amount: '$10.00', status: 'Paid' },
  { id: 'INV-0003', date: 'Feb 1, 2026', description: 'Paid plan — my-portfolio', amount: '$10.00', status: 'Paid' },
  { id: 'INV-0002', date: 'Jan 1, 2026', description: 'Paid plan — my-portfolio', amount: '$10.00', status: 'Paid' },
  { id: 'INV-0001', date: 'Dec 1, 2025', description: 'Paid plan — my-portfolio', amount: '$10.00', status: 'Paid' },
]

const totalMonthly = computed(() =>
  landStore.lands.filter((l) => l.plan === 'paid').length * PRICE_MONTHLY
)
</script>

<template>
  <section class="h-full overflow-y-auto">
  <section class="max-w-2xl m-auto pt-4 space-y-8">

    <h1 class="text-2xl">Plans</h1>

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

    <!-- ── Billing Information ── -->
    <div class="flex flex-col gap-4 pt-8 pb-8">
      <div class="flex items-center gap-3">
        <div class="shrink-0 flex items-center justify-center h-8 w-8 rounded-xl bg-gray-100">
          <CreditCardIcon class="h-4 w-4 text-gray-600" />
        </div>
        <div>
          <h2 class="text-base font-semibold text-gray-900">Billing information</h2>
          <p class="text-xs text-gray-400">Your payment method</p>
        </div>
      </div>
      <BaseInput size="lg" label="Name on card" placeholder="John Doe" v-model="cardName" />
      <BaseInput size="lg" label="Card number" placeholder="4242 4242 4242 4242" v-model="cardNumber" />
      <div class="flex gap-4">
        <BaseInput size="lg" label="Expiry" placeholder="MM / YY" v-model="cardExpiry" />
        <BaseInput size="lg" label="CVC" placeholder="123" v-model="cardCvc" />
      </div>
      <div>
        <BaseButton variant="solid" size="md" :disabled="isSavingCard" @click="saveCard">
          {{ isSavingCard ? 'Saving…' : 'Save card' }}
        </BaseButton>
      </div>
    </div>

    <!-- ── Invoices ── -->
    <div class="flex flex-col gap-4 pt-8 pb-8">
      <div class="flex items-center gap-3">
        <div class="shrink-0 flex items-center justify-center h-8 w-8 rounded-xl bg-gray-100">
          <DocumentTextIcon class="h-4 w-4 text-gray-600" />
        </div>
        <div>
          <h2 class="text-base font-semibold text-gray-900">Invoices</h2>
          <p class="text-xs text-gray-400">Your billing history</p>
        </div>
      </div>
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
  </section>
</template>
