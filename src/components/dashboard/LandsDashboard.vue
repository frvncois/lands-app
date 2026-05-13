<script setup lang="ts">
import { ref, watch, computed, onMounted, nextTick } from 'vue'
import { useDashboardDetail } from '@/composables/useDashboardDetail'
import { useLandStore } from '@/stores/land'
import { useEditorStore } from '@/stores/editor'
import { usePlan } from '@/composables/usePlan'
import {
  CurrencyDollarIcon,
  ShoppingBagIcon,
  ArrowTopRightOnSquareIcon,
  PencilSquareIcon,
  ChartBarIcon,
  PlusIcon,
  ShareIcon,
} from '@heroicons/vue/24/outline'
import BaseChart from '@/components/ui/BaseChart.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import ShareModal from '@/components/modals/ShareModal.vue'
import SetupCampaignSettings from '@/components/editor/settings/SetupCampaignSettings.vue'
import { visitData, totalViews } from '@/lib/mock/analytics'
import { orderStats } from '@/lib/mock/orders'
import { monetizeStats } from '@/lib/mock/monetize'
import NumberFlow from '@number-flow/vue'
import { useCountUpStats } from '@/composables/useCountUpStats'

import MetricCard from '@/components/dashboard/cards/MetricCard.vue'
import ConnectStripeCard from '@/components/dashboard/cards/ConnectStripeCard.vue'
import UpgradeCard from '@/components/dashboard/cards/UpgradeCard.vue'
import CampaignCard from '@/components/dashboard/cards/CampaignCard.vue'
import DashboardDetail from '@/components/dashboard/DashboardDetail.vue'

const { activeDetail, direction, openDetail } = useDashboardDetail()
const landStore = useLandStore()

// displayRevenue is intentionally excluded: it was always 0 (never set in triggerCountUp) — dead animation
const displayRevenue = ref(0)
const { display: countUp, trigger: triggerCountUp } = useCountUpStats({
  views: totalViews,
  orderNew: orderStats.new,
  orderShipped: orderStats.shipped,
  monetizeSubscribers: monetizeStats.subscribers,
  monetizeRevenue: monetizeStats.revenueMonthly,
})
const { views: displayViews, orderNew: displayOrderNew, orderShipped: displayOrderShipped, monetizeSubscribers: displayMonetizeSubscribers, monetizeRevenue: displayMonetizeRevenue } = countUp

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
const showShare = ref(false)
const showCampaignModal = ref(false)

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

const hasMonetizeItems = computed(() => (landStore.activeLand?.sections ?? []).some((s) => s.type === 'monetize'))

// ─── Actions ───

function goToEditor() {
  editorStore.enterEditMode()
}

function viewLive() {
  const handle = landStore.activeLand?.handle
  if (handle) window.open(`https://${handle}.lands.app`, '_blank')
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
      <DashboardDetail v-if="activeDetail" :key="activeDetail" />

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
        <MetricCard :icon="ChartBarIcon" title="Analytics" :animation-delay="100" show-view-more @view-more="openDetail('analytics')">
          <BaseChart :data="visitData" :height="80" />
        </MetricCard>

        <!-- Sell & Monetize (no Stripe) -->
        <ConnectStripeCard v-if="!landStore.isStripeConnected" />

        <!-- Orders (Stripe connected) -->
        <MetricCard v-if="landStore.isStripeConnected" :icon="ShoppingBagIcon" title="Orders" :animation-delay="200" :show-view-more="hasStoreItems" @view-more="openDetail('orders')">
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
        </MetricCard>

        <!-- Monetize (Stripe connected) -->
        <MetricCard v-if="landStore.isStripeConnected" :icon="CurrencyDollarIcon" title="Monetize" :animation-delay="300" :show-view-more="hasMonetizeItems" @view-more="openDetail('monetize')">
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
        </MetricCard>

        <!-- Upgrade card (free plan only) -->
        <UpgradeCard v-if="landStore.activeLand && !isPaid" />

        <!-- Campaign -->
        <CampaignCard v-if="canUseCampaign" @setup-campaign="showCampaignModal = true" />

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
</style>
