<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { MagnifyingGlassIcon, ChevronDownIcon, ShoppingBagIcon } from '@heroicons/vue/24/outline'
import NumberFlow from '@number-flow/vue'
import BaseBadge from '@/shared/ui/BaseBadge.vue'
import { orderStats, recentOrders } from '@/shared/mock/orders'
import type { Order } from '@/shared/mock/orders'

type FilterStatus = 'All' | 'New' | 'Shipped' | 'Delivered'

const activeFilter = ref<FilterStatus>('All')
const search = ref('')
const expandedId = ref<string | null>(null)

const displayNew = ref(0)
const displayShipped = ref(0)
const displayDelivered = ref(0)

onMounted(() => {
  setTimeout(() => {
    displayNew.value = orderStats.new
    displayShipped.value = orderStats.shipped
    displayDelivered.value = orderStats.delivered
  }, 200)
})

const filters: FilterStatus[] = ['All', 'New', 'Shipped', 'Delivered']

const filteredOrders = computed(() => {
  let list = recentOrders
  if (activeFilter.value !== 'All') list = list.filter(o => o.status === activeFilter.value)
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter(o =>
      o.customer.toLowerCase().includes(q) ||
      o.item.toLowerCase().includes(q) ||
      o.id.toLowerCase().includes(q)
    )
  }
  return list
})

const statusVariant: Record<Order['status'], 'info' | 'warning' | 'success'> = {
  New: 'info',
  Shipped: 'warning',
  Delivered: 'success',
}

function toggle(id: string) {
  expandedId.value = expandedId.value === id ? null : id
}
</script>

<template>
  <div class="flex flex-col gap-4 p-4">

    <!-- Stat tiles -->
    <div class="grid grid-cols-3 gap-2">
      <div class="rounded-xl bg-white border border-gray-100 p-3 space-y-0.5">
        <p class="text-xs text-gray-400">New</p>
        <NumberFlow :value="displayNew" class="text-xl font-semibold text-gray-900 leading-tight" />
      </div>
      <div class="rounded-xl bg-white border border-gray-100 p-3 space-y-0.5">
        <p class="text-xs text-gray-400">Shipped</p>
        <NumberFlow :value="displayShipped" class="text-xl font-semibold text-gray-900 leading-tight" />
      </div>
      <div class="rounded-xl bg-white border border-gray-100 p-3 space-y-0.5">
        <p class="text-xs text-gray-400">Delivered</p>
        <NumberFlow :value="displayDelivered" class="text-xl font-semibold text-gray-900 leading-tight" />
      </div>
    </div>

    <!-- Search -->
    <div class="relative">
      <MagnifyingGlassIcon class="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
      <input
        v-model="search"
        type="text"
        placeholder="Search orders…"
        class="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-xl bg-white placeholder:text-gray-400 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-black/[0.04]"
      />
    </div>

    <!-- Filters -->
    <div class="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
      <button
        v-for="f in filters"
        :key="f"
        class="flex-1 px-2 py-1 text-xs font-medium rounded-lg transition-colors"
        :class="activeFilter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
        @click="activeFilter = f"
      >
        {{ f }}
      </button>
    </div>

    <!-- Orders list -->
    <div class="rounded-xl bg-white border border-gray-100 overflow-hidden">
      <div v-if="filteredOrders.length" class="flex flex-col divide-y divide-gray-100">
        <div v-for="order in filteredOrders" :key="order.id">

          <!-- Row -->
          <button
            class="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 transition-colors text-left"
            @click="toggle(order.id)"
          >
            <div class="min-w-0">
              <p class="text-xs font-medium text-gray-900 truncate">{{ order.customer }}</p>
              <p class="text-xs text-gray-400 truncate">{{ order.item }} · {{ order.id }}</p>
            </div>
            <div class="flex items-center gap-2 shrink-0 ml-2">
              <span class="text-xs font-medium text-gray-900">{{ order.amount }}</span>
              <BaseBadge :variant="statusVariant[order.status]" size="xs">{{ order.status }}</BaseBadge>
              <ChevronDownIcon
                class="h-3.5 w-3.5 text-gray-400 transition-transform duration-200"
                :class="expandedId === order.id ? 'rotate-180' : ''"
              />
            </div>
          </button>

          <!-- Accordion detail -->
          <Transition name="accordion">
            <div v-if="expandedId === order.id" class="px-3 pb-3 flex flex-col gap-2 bg-gray-50 border-t border-gray-100">
              <div class="pt-2 grid grid-cols-2 gap-x-4 gap-y-1.5">
                <div>
                  <p class="text-[10px] text-gray-400 uppercase tracking-wide">Email</p>
                  <p class="text-xs text-gray-700 truncate">{{ order.email }}</p>
                </div>
                <div>
                  <p class="text-[10px] text-gray-400 uppercase tracking-wide">Date</p>
                  <p class="text-xs text-gray-700">{{ order.date }}</p>
                </div>
                <div>
                  <p class="text-[10px] text-gray-400 uppercase tracking-wide">Qty</p>
                  <p class="text-xs text-gray-700">{{ order.quantity }}</p>
                </div>
                <div>
                  <p class="text-[10px] text-gray-400 uppercase tracking-wide">Total</p>
                  <p class="text-xs font-medium text-gray-900">{{ order.amount }}</p>
                </div>
                <div class="col-span-2">
                  <p class="text-[10px] text-gray-400 uppercase tracking-wide">Ship to</p>
                  <p class="text-xs text-gray-700">{{ order.address }}</p>
                </div>
                <div v-if="order.notes" class="col-span-2">
                  <p class="text-[10px] text-gray-400 uppercase tracking-wide">Notes</p>
                  <p class="text-xs text-gray-500 italic">{{ order.notes }}</p>
                </div>
              </div>
            </div>
          </Transition>

        </div>
      </div>

      <!-- Empty -->
      <div v-else class="flex flex-col items-center gap-2 py-8 text-center">
        <div class="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center">
          <ShoppingBagIcon class="h-5 w-5 text-gray-400" />
        </div>
        <p class="text-xs text-gray-400">No orders found.</p>
      </div>
    </div>

  </div>
</template>

<style scoped>
.accordion-enter-active { transition: opacity 0.2s ease, max-height 0.25s cubic-bezier(0.16, 1, 0.3, 1); max-height: 300px; }
.accordion-leave-active { transition: opacity 0.15s ease, max-height 0.2s ease; }
.accordion-enter-from  { opacity: 0; max-height: 0; }
.accordion-leave-to    { opacity: 0; max-height: 0; }
</style>
