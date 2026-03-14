<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAppModals } from '@/stores/appModals'
import {
  MegaphoneIcon,
  CurrencyDollarIcon,
  QuestionMarkCircleIcon,
  ShoppingBagIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  ChartBarIcon,
} from '@heroicons/vue/24/outline'
import BaseChart from '@/components/ui/BaseChart.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import { visitData, totalViews, avgPerDay } from '@/lib/mock/analytics'
import AnalyticsDetail from './detail/AnalyticsDetail.vue'
import OrdersDetail from './detail/OrdersDetail.vue'
import SellDetail from './detail/SellDetail.vue'
import CampaignDetail from './detail/CampaignDetail.vue'
import MonetizeDetail from './detail/MonetizeDetail.vue'
type DetailKey = 'analytics' | 'orders' | 'sell' | 'campaign' | 'monetize'

const appModals = useAppModals()
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
  <aside class="w-72 h-full flex flex-col overflow-hidden">
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
      <div v-else key="main" class="flex flex-col h-full px-2 overflow-y-auto gap-2">

        <!-- Stats -->
        <BaseCard variant="spaced" title="Overview" class="shrink-0 card-appear" style="animation-delay: 0ms">
          <div class="grid grid-cols-2 gap-2">
            <div class="rounded-lg bg-gray-50 p-3 space-y-0.5">
              <p class="text-xs text-gray-400">Views</p>
              <p class="text-lg font-semibold text-gray-900 leading-tight">{{ totalViews.toLocaleString() }}</p>
              <p class="text-xs text-gray-400">last 30 days</p>
            </div>
            <div class="rounded-lg bg-gray-50 p-3 space-y-0.5">
              <p class="text-xs text-gray-400">Revenue</p>
              <p class="text-lg font-semibold text-gray-900 leading-tight">$0</p>
              <p class="text-xs text-gray-400">this month</p>
            </div>
          </div>
        </BaseCard>

        <!-- Analytics -->
        <BaseCard variant="spaced" :icon="ChartBarIcon" title="Analytics" class="shrink-0 card-appear" style="animation-delay: 60ms">
          <template #header-action>
            <button
              class="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors"
              @click="openDetail('analytics')"
            >
              View more <ArrowRightIcon class="h-3 w-3" />
            </button>
          </template>
          <BaseChart :data="visitData" :height="80" />
          <p class="text-xs text-gray-400 mt-2">{{ avgPerDay }} avg. views/day</p>
        </BaseCard>

        <!-- Orders -->
        <BaseCard variant="spaced" :icon="ShoppingBagIcon" title="Orders" class="shrink-0 card-appear" style="animation-delay: 120ms">
          <template #header-action>
            <button
              class="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors"
              @click="openDetail('orders')"
            >
              View more <ArrowRightIcon class="h-3 w-3" />
            </button>
          </template>
          <p class="text-xs text-gray-400">No orders yet.</p>
        </BaseCard>

        <!-- Monetize -->
        <BaseCard variant="spaced" :icon="CurrencyDollarIcon" title="Monetize" class="shrink-0 card-appear" style="animation-delay: 180ms">
          <template #header-action>
            <button
              class="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors"
              @click="openDetail('monetize')"
            >
              View more <ArrowRightIcon class="h-3 w-3" />
            </button>
          </template>
          <p class="text-xs text-gray-400">0 subscribers</p>
        </BaseCard>

        <!-- Campaign -->
        <BaseCard variant="spaced" :icon="MegaphoneIcon" title="Campaign" class="shrink-0 card-appear" style="animation-delay: 240ms">
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

        <!-- Support -->
        <div class="p-2 mt-auto shrink-0">
          <BaseButton variant="outline" size="sm" class="w-full justify-center">
            <QuestionMarkCircleIcon class="h-4 w-4" />
            Get support
          </BaseButton>
        </div>

      </div>
    </Transition>
  </aside>
</template>

<style scoped>
.card-appear {
  animation: card-fade-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes card-fade-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
