<script setup lang="ts">
import type { FunctionalComponent } from 'vue'
import BaseButton from '../ui/BaseButton.vue'
import BaseChart from '../ui/BaseChart.vue'
import CollaboratorsPanel from '../plugins/CollaboratorsPanel.vue'
import CampaignPanel from '../plugins/CampaignPanel.vue'
import StorePanel from '../plugins/StorePanel.vue'
import { visitData, totalViews, avgPerDay, referrers, topClicked } from '@/lib/mock/analytics'

export interface Plugin {
  id: string
  title: string
  description: string
  icon: FunctionalComponent
}

defineProps<{ plugin: Plugin; hideHeader?: boolean }>()
defineEmits<{ back: []; save: [] }>()

const maxClicks = topClicked[0]!.clicks
</script>

<template>
  <!-- Panel header -->
  <div v-if="!hideHeader" class="flex items-center justify-between p-4 border-b border-gray-200">
    <div class="flex items-center gap-2">
      <button class="text-gray-400 hover:text-gray-700 transition-colors" @click="$emit('back')">
        <component :is="plugin.icon" class="h-4 w-4" />
      </button>
      <h2 class="text-sm font-semibold text-gray-900">{{ plugin.title }}</h2>
    </div>
    <div class="flex items-center gap-1">
      <template v-if="['analytics', 'collaborators', 'campaign', 'store'].includes(plugin.id)">
        <BaseButton variant="outline" size="xs" @click="$emit('back')">Back</BaseButton>
      </template>
      <template v-else>
        <BaseButton variant="outline" size="xs" @click="$emit('back')">Cancel</BaseButton>
        <BaseButton variant="solid" size="xs" @click="$emit('save')">Save</BaseButton>
      </template>
    </div>
  </div>

  <div class="flex flex-col max-h-[70vh] overflow-y-auto" :class="!['collaborators', 'campaign', 'store'].includes(plugin.id) && 'p-4 gap-5'">

    <!-- ── Analytics ── -->
    <template v-if="plugin.id === 'analytics'">

      <!-- Visits chart -->
      <div class="flex flex-col gap-2">
        <p class="text-xs font-medium text-gray-500">Visits — last 30 days</p>
        <BaseChart :data="visitData" color="#18181B" :height="80" />
      </div>

      <!-- Summary stats -->
      <div class="grid grid-cols-2 gap-2">
        <div class="flex flex-col gap-0.5 p-3 rounded-xl bg-gray-50 border border-gray-100">
          <p class="text-xs text-gray-400">Total views</p>
          <p class="text-lg font-semibold text-gray-900">{{ totalViews.toLocaleString() }}</p>
        </div>
        <div class="flex flex-col gap-0.5 p-3 rounded-xl bg-gray-50 border border-gray-100">
          <p class="text-xs text-gray-400">Avg / day</p>
          <p class="text-lg font-semibold text-gray-900">{{ avgPerDay.toLocaleString() }}</p>
        </div>
      </div>

      <!-- Referrers -->
      <div class="flex flex-col gap-2">
        <p class="text-xs font-medium text-gray-500">Where clicks come from</p>
        <div class="flex flex-col gap-2">
          <div v-for="r in referrers" :key="r.label" class="flex flex-col gap-1">
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-700">{{ r.label }}</span>
              <span class="text-xs text-gray-400">{{ r.value }}%</span>
            </div>
            <div class="h-1 w-full rounded-full bg-gray-100 overflow-hidden">
              <div class="h-full rounded-full bg-gray-900 transition-all" :style="{ width: `${r.value}%` }" />
            </div>
          </div>
        </div>
      </div>

      <!-- Most clicked -->
      <div class="flex flex-col gap-2">
        <p class="text-xs font-medium text-gray-500">Most clicked</p>
        <div class="flex flex-col gap-1.5">
          <div v-for="item in topClicked" :key="item.label" class="flex items-center gap-2">
            <span class="text-xs text-gray-700 w-20 shrink-0 truncate">{{ item.label }}</span>
            <div class="flex-1 h-1 rounded-full bg-gray-100 overflow-hidden">
              <div class="h-full rounded-full bg-gray-900" :style="{ width: `${(item.clicks / maxClicks) * 100}%` }" />
            </div>
            <span class="text-xs text-gray-400 w-8 text-right shrink-0">{{ item.clicks }}</span>
          </div>
        </div>
      </div>

    </template>

    <!-- ── Campaign ── -->
    <template v-else-if="plugin.id === 'campaign'">
      <CampaignPanel />
    </template>

    <!-- ── Collaborators ── -->
    <template v-else-if="plugin.id === 'collaborators'">
      <CollaboratorsPanel />
    </template>

    <!-- ── Store ── -->
    <template v-else-if="plugin.id === 'store'">
      <StorePanel />
    </template>

    <!-- ── Monetize ── -->
    <template v-else-if="plugin.id === 'monetize'">
      <div class="flex flex-col gap-5">
        <p class="text-xs text-neutral-400 leading-tight">
          Turn your Land into a source of income. Monetize collections, individual items, or services by setting a price and connecting your Stripe account. Payments are handled securely, and buyers receive instant access to what they purchased.
        </p>
        <div class="flex flex-col gap-2">
          <BaseButton variant="solid" size="sm">Connect Stripe</BaseButton>
          <BaseButton variant="outline" size="sm">Learn more</BaseButton>
        </div>
      </div>
    </template>

    <!-- ── Other plugins — placeholder ── -->
    <template v-else>
      <p class="text-xs text-gray-400">{{ plugin.description }}</p>
      <p class="text-xs text-gray-300 italic">Settings coming soon.</p>
    </template>

  </div>
</template>
