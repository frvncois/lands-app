<script setup lang="ts">
import { ref, watch, computed, onMounted, nextTick } from 'vue'
import { useAppModals } from '@/stores/appModals'
import { useLandStore } from '@/stores/land'
import { useEditorStore } from '@/stores/editor'
import { usePlan } from '@/composables/usePlan'
import { useCampaignStore } from '@/stores/campaign'
import { useRouter } from 'vue-router'
import { useStripeConnect } from '@/composables/useStripeConnect'
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
  ShareIcon,
} from '@heroicons/vue/24/outline'
import BaseChart from '@/components/ui/BaseChart.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import ShareModal from '@/components/modals/ShareModal.vue'
import SetupCampaignSettings from '@/components/editor/settings/SetupCampaignSettings.vue'
import { visitData, totalViews, avgPerDay } from '@/lib/mock/analytics'
import { orderStats } from '@/lib/mock/orders'
import { monetizeStats } from '@/lib/mock/monetize'
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
const displayOrderNew = ref(0)
const displayOrderShipped = ref(0)
const displayMonetizeSubscribers = ref(0)
const displayMonetizeRevenue = ref(0)

function triggerCountUp() {
  displayViews.value = 0
  displayRevenue.value = 0
  displayOrderNew.value = 0
  displayOrderShipped.value = 0
  displayMonetizeSubscribers.value = 0
  displayMonetizeRevenue.value = 0
  setTimeout(() => {
    displayViews.value = totalViews
    displayOrderNew.value = orderStats.new
    displayOrderShipped.value = orderStats.shipped
    displayMonetizeSubscribers.value = monetizeStats.subscribers
    displayMonetizeRevenue.value = monetizeStats.revenueMonthly
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
const campaignStore = useCampaignStore()
const router = useRouter()
const { connectStripe, isConnecting: isConnectingStripe } = useStripeConnect()
const showShare = ref(false)
const showCampaignModal = ref(false)

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

const hasMonetizeItems = computed(() =>
  (landStore.activeLand?.sections ?? []).some((s) => s.type === 'monetize')
)

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


function openDetail(key: DetailKey) {
  direction.value = 'forward'
  activeDetail.value = key
  appModals.activeDashboardDetail = key
}

function openStripePortal() {
  window.open('https://dashboard.stripe.com', '_blank')
}

function closeDetail() {
  direction.value = 'back'
  activeDetail.value = null
  appModals.activeDashboardDetail = null
}
</script>

<template>
  <aside class="w-full h-full flex flex-col overflow-hidden relative min-w-72">
    <Transition name="modal-fade">
      <div v-if="showShare" class="fixed inset-0 z-40" @click="showShare = false" />
    </Transition>
    <Transition name="modal-grow">
      <ShareModal v-if="showShare" @close="showShare = false" />
    </Transition>
    <Transition name="modal-center">
      <SetupCampaignSettings v-if="showCampaignModal" @close="showCampaignModal = false" />
    </Transition>
    <Transition name="modal-fade">
      <div v-if="landStore.isLoading" class="absolute inset-0 bg-white z-10" />
    </Transition>
    <Transition :name="direction === 'forward' ? 'modal-forward' : 'modal-back'" mode="out-in">

      <!-- ── Detail view ── -->
      <div v-if="activeDetail" :key="activeDetail" class="flex flex-col h-full">
        <!-- Detail header -->
        <div class="flex items-center justify-between gap-2 p-4 shrink-0">
          <div class="flex items-center gap-2">
            <button
              class="flex items-center justify-center h-6 w-6 rounded-full hover:bg-gray-200 transition-colors text-gray-500 shrink-0"
              @click="closeDetail"
            >
              <ArrowLeftIcon class="h-3.5 w-3.5" />
            </button>
            <p class="text-xs font-medium text-gray-700">{{ detailTitles[activeDetail] }}</p>
          </div>
          <BaseButton
            v-if="activeDetail === 'orders' || activeDetail === 'monetize'"
            variant="outline"
            size="sm"
            @click="openStripePortal"
          >
            <CreditCardIcon class="h-3.5 w-3.5" />
            Stripe Dashboard
          </BaseButton>
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
        <BaseCard variant="naked" title="Overview" class="shrink-0 card-appear" style="animation-delay: 0ms">
          <template #header-action>
            <div class="flex items-center gap-1.5">
              <BaseBadge :variant="landStore.activeLand?.is_published ? 'success' : 'warning'" size="xs" dot>
                {{ landStore.activeLand?.is_published ? 'Published' : 'Not published' }}
              </BaseBadge>
            </div>
          </template>
          <div class="flex gap-2 mb-2">
            <div class="flex-1 rounded-lg bg-gray-50 p-3 space-y-0.5">
              <p class="text-xs text-gray-400">Views</p>
              <NumberFlow :value="displayViews" class="text-lg font-semibold text-gray-900 leading-tight" />
              <p class="text-xs text-gray-400">last 30 days</p>
            </div>
            <div class="flex-1 rounded-lg bg-gray-50 p-3 space-y-0.5">
              <p class="text-xs text-gray-400">Revenue</p>
              <NumberFlow :value="displayRevenue" :format="{ style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }" class="text-lg font-semibold text-gray-900 leading-tight" />
              <p class="text-xs text-gray-400">this month</p>
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <BaseButton variant="solid" size="sm" class="flex-1 justify-center bg-indigo-600" @click="goToEditor">
              <PencilSquareIcon class="h-3.5 w-3.5" /> Edit & Publish
            </BaseButton>
            <div v-if="landStore.activeLand?.is_published" class="flex gap-2">
              <BaseButton variant="outline" size="sm" class="flex-1 justify-center" @click="viewLive">
                <ArrowTopRightOnSquareIcon class="h-3.5 w-3.5" /> View Live
              </BaseButton>
              <BaseButton variant="outline" size="sm" class="justify-center" @click="showShare = !showShare">
                <ShareIcon class="h-3.5 w-3.5" /> Share
              </BaseButton>
            </div>
          </div>
        </BaseCard>


        <!-- Analytics -->
        <BaseCard variant="spaced" :icon="ChartBarIcon" title="Analytics" class="shrink-0 card-appear" style="animation-delay: 100ms">
          <template #header-action>
            <button
              class="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors"
              @click="openDetail('analytics')"
            >
              View More <ArrowRightIcon class="h-3 w-3" />
            </button>
          </template>
          <BaseChart :data="visitData" :height="80" />
        </BaseCard>



        <!-- Sell & Monetize (no Stripe) -->
        <div v-if="!landStore.isStripeConnected" class="shrink-0 card-appear rounded-xl border border-gray-200 flex flex-col justify-center items-center gap-3 py-8 px-4 text-center" style="animation-delay: 200ms">
          <div class="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center">
            <CurrencyDollarIcon class="h-5 w-5 text-gray-900" />
          </div>
            <p class="text-sm font-semibold text-gray-900">Sell & Monetize</p>
            <p class="text-xs text-gray-400 leading-relaxed">Connect your Stripe account and start selling products, classes and exclusive content.</p>
          <BaseButton variant="solid" size="sm" :disabled="isConnectingStripe" @click="connectStripe">
            <Transition name="stripe-btn" mode="out-in">
              <span v-if="isConnectingStripe" key="loading" class="flex items-center gap-1.5">
                <span class="stripe-spinner" />
                Connecting…
              </span>
              <span v-else key="idle" class="flex items-center gap-1.5">
                Connect Stripe
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
              View More <ArrowRightIcon class="h-3 w-3" />
            </button>
          </template>
          <template v-if="hasStoreItems">
            <div class="flex gap-2">
              <div class="flex-1 rounded-lg bg-white p-2 space-y-0.5">
                <p class="text-xs text-gray-400">New</p>
                <NumberFlow :value="displayOrderNew" class="text-lg font-semibold text-gray-900 leading-tight" />
              </div>
              <div class="flex-1 rounded-lg bg-white p-2 space-y-0.5">
                <p class="text-xs text-gray-400">Shipped</p>
                <NumberFlow :value="displayOrderShipped" class="text-lg font-semibold text-gray-900 leading-tight" />
              </div>
            </div>
          </template>
          <template v-else>
            <p class="text-xs text-gray-500 leading-relaxed mb-4">Add products and start selling online.</p>
            <BaseButton variant="solid" size="sm" class="w-full justify-center" @click="goToEditor">
              <PlusIcon class="h-3.5 w-3.5" /> Add Product
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
              View More <ArrowRightIcon class="h-3 w-3" />
            </button>
          </template>
          <template v-if="hasMonetizeItems">
            <div class="flex gap-2">
              <div class="flex-1 rounded-lg bg-white p-2 space-y-0.5">
                <p class="text-xs text-gray-400">Subscribers</p>
                <NumberFlow :value="displayMonetizeSubscribers" class="text-lg font-semibold text-gray-900 leading-tight" />
                <p class="text-xs text-gray-400">total</p>
              </div>
              <div class="flex-1 rounded-lg bg-white p-2 space-y-0.5">
                <p class="text-xs text-gray-400">Revenue</p>
                <NumberFlow :value="displayMonetizeRevenue" :format="{ style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }" class="text-lg font-semibold text-gray-900 leading-tight" />
                <p class="text-xs text-gray-400">this month</p>
              </div>
            </div>
          </template>
          <template v-else>
            <p class="text-xs text-gray-500 leading-relaxed mb-4">Offer memberships or paid content and earn recurring revenue.</p>
            <BaseButton variant="solid" size="sm" class="w-full justify-center" @click="goToEditor">
              <PlusIcon class="h-3.5 w-3.5" /> Add Content
            </BaseButton>
          </template>
        </BaseCard>

        <!-- Upgrade card (free plan only) -->
        <div v-if="landStore.activeLand && !isPaid" class="flex-1 shrink-0 card-appear rounded-xl border bg-gray-50 border-gray-200 justify-center p-8 flex flex-col items-center gap-2 text-center" style="animation-delay: 400ms">
          <div class="h-10 w-10 rounded-full bg-gray-900 flex items-center justify-center">
            <SparklesIcon class="h-5 w-5 text-gray-100" />
          </div>
          <p class="text-sm font-semibold text-gray-900">Upgrade to Pro</p>
          <div class="flex flex-wrap justify-center gap-1.5">
            <p class="text-xs text-gray-500 leading-relaxed mb-2">Unlimited content, Analtyics, Campaign, Collaborators, Custom domain, and more</p>
          </div>
          <BaseButton variant="solid" size="sm" @click="appModals.openUpgrade()">
            Upgrade Plan
          </BaseButton>
        </div>

        <!-- Campaign: no provider connected -->
        <div v-if="canUseCampaign && !campaignStore.isConnected" class="shrink-0 flex-1 card-appear rounded-xl border border-gray-200 flex flex-col items-center justify-center gap-2 p-4 text-center" style="animation-delay: 500ms">
          <div class="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center">
            <MegaphoneIcon class="h-4 w-4 text-gray-900" />
          </div>
          <div class="flex flex-col gap-1">
            <p class="text-sm font-semibold text-gray-900">Connect email provider</p>
            <p class="text-xs text-gray-400 leading-relaxed">Connect Mailchimp, Flodesk, Brevo and more to start capturing subscribers.</p>
          </div>
          <BaseButton variant="solid" size="sm" @click="showCampaignModal = true">
            Set up Campaign
          </BaseButton>
        </div>

        <!-- Campaign: connected -->
        <BaseCard v-else-if="canUseCampaign && campaignStore.isConnected" variant="spaced" :icon="MegaphoneIcon" title="Campaign" class="shrink-0 card-appear" style="animation-delay: 500ms">
          <template #header-action>
            <button
              class="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors"
              @click="openDetail('campaign')"
            >
              View More <ArrowRightIcon class="h-3 w-3" />
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
