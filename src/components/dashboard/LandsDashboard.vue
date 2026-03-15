<script setup lang="ts">
import { ref, watch, computed, onMounted, nextTick } from 'vue'
import { useAppModals } from '@/stores/appModals'
import { useLandStore } from '@/stores/land'
import { useEditorStore } from '@/stores/editor'
import { usePlan } from '@/composables/usePlan'
import { useRouter } from 'vue-router'
import { stripeService } from '@/services/stripe.service'
import { useToast } from '@/composables/useToast'
import {
  MegaphoneIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  ArrowTopRightOnSquareIcon,
  PencilSquareIcon,
  ChartBarIcon,
  PlusIcon,
  CreditCardIcon,
  Squares2X2Icon,
  SparklesIcon,
} from '@heroicons/vue/24/outline'
import BaseChart from '@/components/ui/BaseChart.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import { visitData, totalViews, avgPerDay } from '@/lib/mock/analytics'
import NumberFlow from '@number-flow/vue'

import AnalyticsDetail from './detail/AnalyticsDetail.vue'
import OrdersDetail from './detail/OrdersDetail.vue'
import SellDetail from './detail/SellDetail.vue'
import CampaignDetail from './detail/CampaignDetail.vue'
import MonetizeDetail from './detail/MonetizeDetail.vue'
type DetailKey = 'analytics' | 'orders' | 'sell' | 'campaign' | 'monetize'

const appModals = useAppModals()
const landStore = useLandStore()

const displayViews = ref(0)
const displayRevenue = ref(0)

function triggerCountUp() {
  displayViews.value = 0
  displayRevenue.value = 0
  setTimeout(() => {
    displayViews.value = totalViews
  }, 300)
}

onMounted(triggerCountUp)

// Only enable the switch transition after the initial activeLandId is settled,
// so cards don't animate twice on first load (mount + data arrival).
const switchEnabled = ref(false)
const stopInitWatch = watch(() => landStore.activeLandId, (id) => {
  if (id) {
    nextTick(() => { switchEnabled.value = true })
    stopInitWatch()
  }
})

watch(() => landStore.activeLandId, triggerCountUp)
const editorStore = useEditorStore()
const { canUseCampaign, isPaid } = usePlan()
const router = useRouter()
const { addToast } = useToast()

const activeDetail = ref<DetailKey | null>(null)
const direction = ref<'forward' | 'back'>('forward')

watch(() => appModals.dashboardDetail, (detail) => {
  if (detail) {
    direction.value = 'forward'
    activeDetail.value = detail
    appModals.dashboardDetail = null
  }
})

const detailTitles: Record<DetailKey, string> = {
  analytics: 'Analytics',
  orders: 'Orders',
  sell: 'Sell & Monetize',
  campaign: 'Campaign',
  monetize: 'Monetize',
}

// ─── Derived state ───

const hasStoreItems = computed(() => {
  const sections = landStore.activeLand?.sections ?? []
  return sections
    .filter((s) => s.type === 'store')
    .some((s) => {
      const stores = (s.content as { stores?: { items: unknown[] }[] } | null)?.stores ?? []
      return stores.some((st) => st.items.length > 0)
    })
})

const hasMonetizeItems = computed(() => {
  const sections = landStore.activeLand?.sections ?? []
  return sections
    .filter((s) => s.type === 'monetize')
    .some((s) => {
      const stores = (s.content as { stores?: { items: unknown[] }[] } | null)?.stores ?? []
      return stores.some((st) => st.items.length > 0)
    })
})

const hasCampaignSection = computed(() =>
  (landStore.activeLand?.sections ?? []).some((s) => s.type === 'campaign')
)

// ─── Actions ───

function goToEditor() {
  editorStore.enterEditMode()
}

function viewLive() {
  const handle = landStore.activeLand?.handle
  if (handle) window.open(`https://${handle}.lands.app`, '_blank')
}

const isConnectingStripe = ref(false)

function connectStripe() {
  const landId = landStore.activeLand?.id
  if (!landId) return
  try {
    isConnectingStripe.value = true
    window.location.href = stripeService.connectUrl(landId)
  } catch {
    isConnectingStripe.value = false
    addToast('Stripe is not configured', 'error')
  }
}

function openDetail(key: DetailKey) {
  direction.value = 'forward'
  activeDetail.value = key
}

function closeDetail() {
  direction.value = 'back'
  activeDetail.value = null
}
</script>

<template>
  <aside class="w-72 h-full flex flex-col overflow-hidden relative">
    <Transition name="modal-fade">
      <div v-if="landStore.isLoading" class="absolute inset-0 bg-white z-10" />
    </Transition>
    <Transition :name="direction === 'forward' ? 'modal-forward' : 'modal-back'" mode="out-in">

      <!-- ── Detail view ── -->
      <div v-if="activeDetail" :key="activeDetail" class="flex flex-col h-full">
        <!-- Detail header -->
        <div class="flex items-center gap-2 p-1 shrink-0">
          <button
            class="flex items-center justify-center h-6 w-6 rounded-full hover:bg-gray-200 transition-colors text-gray-500 shrink-0"
            @click="closeDetail"
          >
            <ArrowLeftIcon class="h-3.5 w-3.5" />
          </button>
          <p class="text-xs font-medium text-gray-700">{{ detailTitles[activeDetail] }}</p>
        </div>
        <!-- Detail content -->
        <div class="flex-1 overflow-y-auto">
          <AnalyticsDetail v-if="activeDetail === 'analytics'" />
          <OrdersDetail v-else-if="activeDetail === 'orders'" />
          <SellDetail v-else-if="activeDetail === 'sell'" />
          <CampaignDetail v-else-if="activeDetail === 'campaign'" />
          <MonetizeDetail v-else-if="activeDetail === 'monetize'" />
        </div>
      </div>

      <!-- ── Main dashboard view ── -->
      <Transition v-else :name="switchEnabled ? 'dashboard-switch' : ''" mode="out-in">
      <div :key="landStore.activeLandId ?? 'none'" class="dashboard-scroll flex flex-col h-full pl-2 pr-4 overflow-y-auto gap-2">

        <!-- Stats -->
        <BaseCard variant="spaced" title="Overview" class="shrink-0 card-appear" style="animation-delay: 0ms">
          <template #header-action>
            <div class="flex items-center gap-1.5">
              <span
                class="text-xs font-medium px-2 py-0.5 rounded-full"
                :class="landStore.activeLand?.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'"
              >
                {{ landStore.activeLand?.is_published ? 'Published' : 'Not published' }}
              </span>
            </div>
          </template>
          <div class="flex gap-2 mb-3">
            <div class="flex-1 rounded-lg bg-white p-3 space-y-0.5">
              <p class="text-xs text-gray-400">Views</p>
              <NumberFlow :value="displayViews" class="text-lg font-semibold text-gray-900 leading-tight" />
              <p class="text-xs text-gray-400">last 30 days</p>
            </div>
            <div class="flex-1 rounded-lg bg-white p-3 space-y-0.5">
              <p class="text-xs text-gray-400">Revenue</p>
              <NumberFlow :value="displayRevenue" :format="{ style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }" class="text-lg font-semibold text-gray-900 leading-tight" />
              <p class="text-xs text-gray-400">this month</p>
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <BaseButton
              v-if="landStore.activeLand?.is_published"
              variant="outline" size="sm" class="flex-1 justify-center"
              @click="viewLive"
            >
              <ArrowTopRightOnSquareIcon class="h-3.5 w-3.5" /> View live
            </BaseButton>
            <BaseButton variant="solid" size="sm" class="flex-1 justify-center" @click="goToEditor">
              <PencilSquareIcon class="h-3.5 w-3.5" /> Edit & Publish
            </BaseButton>
          </div>
        </BaseCard>


        <!-- Analytics -->
        <BaseCard variant="spaced" :icon="ChartBarIcon" title="Analytics" class="shrink-0 card-appear" style="animation-delay: 100ms">
          <template #header-action>
            <button
              class="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors"
              @click="openDetail('analytics')"
            >
              View more <ArrowRightIcon class="h-3 w-3" />
            </button>
          </template>
          <BaseChart :data="visitData" :height="80" />
          <p class="text-xs text-gray-400 mt-4">{{ avgPerDay }} avg. views/day</p>
        </BaseCard>



        <!-- Sell & Monetize (no Stripe) -->
        <div v-if="!landStore.isStripeConnected" class="shrink-0 card-appear rounded-xl border border-gray-200 flex flex-col items-center gap-3 py-8 px-4 text-center" style="animation-delay: 200ms">
          <div class="h-10 w-10 rounded-2xl bg-gray-100 flex items-center justify-center">
            <CurrencyDollarIcon class="h-4 w-4 text-gray-400" />
          </div>
          <div class="flex flex-col gap-1">
            <p class="text-sm font-semibold text-gray-900">Sell & Monetize</p>
            <p class="text-xs text-gray-400 leading-relaxed">Connect your Stripe account and start selling products, classes and exclusive content.</p>
          </div>
          <BaseButton variant="solid" size="sm" :disabled="isConnectingStripe" @click="connectStripe">
            <Transition name="stripe-btn" mode="out-in">
              <span v-if="isConnectingStripe" key="loading" class="flex items-center gap-1.5">
                <span class="stripe-spinner" />
                Connecting…
              </span>
              <span v-else key="idle" class="flex items-center gap-1.5">
                <CreditCardIcon class="h-3.5 w-3.5" /> Connect Stripe
              </span>
            </Transition>
          </BaseButton>
        </div>

        <!-- Orders (Stripe connected) -->
        <BaseCard v-if="landStore.isStripeConnected" variant="spaced" :icon="ShoppingBagIcon" title="Orders" class="shrink-0 card-appear" style="animation-delay: 200ms">
          <template #header-action>
            <button
              v-if="hasStoreItems"
              class="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors"
              @click="openDetail('orders')"
            >
              View more <ArrowRightIcon class="h-3 w-3" />
            </button>
          </template>
          <template v-if="hasStoreItems">
            <p class="text-xs text-gray-400">No orders yet.</p>
          </template>
          <template v-else>
            <p class="text-xs text-gray-500 leading-relaxed mb-3">Add products and start selling online.</p>
            <BaseButton variant="solid" size="sm" class="w-full justify-center" @click="goToEditor">
              <PlusIcon class="h-3.5 w-3.5" /> Add product
            </BaseButton>
          </template>
        </BaseCard>

        <!-- Monetize (Stripe connected) -->
        <BaseCard v-if="landStore.isStripeConnected" variant="spaced" :icon="CurrencyDollarIcon" title="Monetize" class="shrink-0 card-appear" style="animation-delay: 300ms">
          <template #header-action>
            <button
              v-if="hasMonetizeItems"
              class="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors"
              @click="openDetail('monetize')"
            >
              View more <ArrowRightIcon class="h-3 w-3" />
            </button>
          </template>
          <template v-if="hasMonetizeItems">
            <p class="text-xs text-gray-400">0 subscribers</p>
          </template>
          <template v-else>
            <p class="text-xs text-gray-500 leading-relaxed mb-3">Offer memberships or paid content and earn recurring revenue.</p>
            <BaseButton variant="solid" size="sm" class="w-full justify-center" @click="goToEditor">
              <PlusIcon class="h-3.5 w-3.5" /> Add offering
            </BaseButton>
          </template>
        </BaseCard>

        <!-- Upgrade card (free plan only) -->
        <div v-if="landStore.activeLand && !isPaid" class="flex-1 shrink-0 card-appear rounded-xl border border-gray-200 justify-center px-8 py-4 flex flex-col items-center gap-4 text-center" style="animation-delay: 400ms">
          <div class="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center">
            <SparklesIcon class="h-5 w-5 text-gray-700" />
          </div>
          <p class="text-sm font-semibold text-gray-900">Upgrade to Pro</p>
          <div class="flex flex-wrap justify-center gap-1.5">
            <span class="text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">Marketing</span>
            <span class="text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">Custom Domain</span>
            <span class="text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">Unlimited</span>
          </div>
          <BaseButton variant="solid" size="sm" class="w-full justify-center" @click="router.push('/dashboard/plans')">
            Upgrade — $10/mo
          </BaseButton>
        </div>

        <!-- Campaign: not set up -->
        <div v-if="canUseCampaign && !hasCampaignSection" class="shrink-0 card-appear rounded-xl border border-gray-200 flex flex-col items-center gap-3 py-8 px-4 text-center" style="animation-delay: 500ms">
          <div class="h-10 w-10 rounded-2xl bg-gray-100 flex items-center justify-center">
            <MegaphoneIcon class="h-4 w-4 text-gray-400" />
          </div>
          <div class="flex flex-col gap-1">
            <p class="text-sm font-semibold text-gray-900">Grow your audience</p>
            <p class="text-xs text-gray-400 leading-relaxed">Add a Campaign section to your land and connect Mailchimp, Flodesk or Brevo to capture emails.</p>
          </div>
          <BaseButton variant="solid" size="sm" @click="goToEditor">
            <Squares2X2Icon class="h-3.5 w-3.5" /> Go to editor
          </BaseButton>
        </div>

        <!-- Campaign: active -->
        <BaseCard v-if="canUseCampaign && hasCampaignSection" variant="spaced" :icon="MegaphoneIcon" title="Campaign" class="shrink-0 card-appear" style="animation-delay: 500ms">
          <template #header-action>
            <button
              class="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors"
              @click="openDetail('campaign')"
            >
              View more <ArrowRightIcon class="h-3 w-3" />
            </button>
          </template>
          <p class="text-xs text-gray-400">0 subscribers</p>
        </BaseCard>



      </div>
      </Transition>
    </Transition>
  </aside>
</template>

<style scoped>
.dashboard-scroll {
  scrollbar-width: none;
}
.dashboard-scroll::-webkit-scrollbar {
  display: none;
}

.dashboard-switch-enter-active {
  transition: opacity 0.35s ease, transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.dashboard-switch-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.dashboard-switch-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.dashboard-switch-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.card-appear {
  animation: card-fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes card-fade-up {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Stripe button content swap */
.stripe-btn-enter-active,
.stripe-btn-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.stripe-btn-enter-from { opacity: 0; transform: scale(0.9); }
.stripe-btn-leave-to   { opacity: 0; transform: scale(1.05); }

/* Spinner */
.stripe-spinner {
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 1.5px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  opacity: 0.6;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
