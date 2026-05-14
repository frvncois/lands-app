<script setup lang="ts">
import { ArrowLeftIcon, CreditCardIcon } from '@heroicons/vue/24/outline'
import BaseButton from '@/shared/ui/BaseButton.vue'
import { useDashboardDetail, type DetailKey } from '@/features/dashboard/composables/useDashboardDetail'
import AnalyticsDetail from './detail/AnalyticsDetail.vue'
import OrdersDetail from './detail/OrdersDetail.vue'
import SellDetail from './detail/SellDetail.vue'
import CampaignDetail from './detail/CampaignDetail.vue'

const { activeDetail, closeDetail } = useDashboardDetail()

const detailTitles: Record<DetailKey, string> = {
  analytics: 'Analytics',
  orders: 'Orders',
  sell: 'Sell',
  campaign: 'Campaign',
}

function openStripePortal() {
  window.open('https://dashboard.stripe.com', '_blank')
}
</script>

<template>
  <div v-if="activeDetail" class="flex flex-col h-full">
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
        v-if="activeDetail === 'orders'"
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
    </div>
  </div>
</template>
