<script setup lang="ts">
import { ref, computed } from 'vue'
import { ShoppingBagIcon } from '@heroicons/vue/24/outline'
import BaseInput from '../../ui/BaseInput.vue'
import BaseButton from '../../ui/BaseButton.vue'
import BaseTree from '../../ui/BaseTree.vue'
import BaseCard from '../../ui/BaseCard.vue'
import type { TreeNode } from '../../ui/BaseTree.vue'
import ItemEditorSettings from './ItemEditorSettings.vue'
import type { Section } from '@/types/section'
import type { Store, StoreItem } from '@/types/store'
import { useStoreActions } from '@/composables/useStoreActions'

import { useLandStore } from '@/stores/land'
import { useAppModals } from '@/stores/appModals'
import { useStripeConnect } from '@/composables/useStripeConnect'
import { sortByPosition, generateReorderPosition } from '@/lib/utils/position'

const props = defineProps<{ section: Section }>()

const landStore = useLandStore()
const appModals = useAppModals()
const { updateStore, addStoreItem: addStoreItemAction, deleteStoreItem, reorderStoreItem } = useStoreActions()
const { connectStripe, isConnecting: isConnectingStripe } = useStripeConnect()

const store = computed(() => ((props.section.content as any)?.stores?.[0] ?? null) as Store | null)
const storeItems = computed(() => store.value ? sortByPosition(store.value.items) : [])

const storeTitle = computed({
  get: () => store.value?.title ?? '',
  set: (v: string) => { if (store.value) updateStore(props.section.id, store.value.id, { title: v }) },
})

const storeDescription = computed({
  get: () => store.value?.description ?? '',
  set: (v: string) => { if (store.value) updateStore(props.section.id, store.value.id, { description: v }) },
})


const storeTreeNodes = computed<TreeNode[]>(() =>
  storeItems.value.map((item) => ({
    id: item.id,
    label: item.title,
    icon: ShoppingBagIcon,
    imageUrl: item.image || undefined,
  }))
)

function handleReorder(oldIndex: number, newIndex: number) {
  if (oldIndex === newIndex || !store.value) return
  const moved = storeItems.value[oldIndex]
  if (!moved) return
  reorderStoreItem(props.section.id, store.value.id, moved.id, generateReorderPosition(storeItems.value, oldIndex, newIndex))
}

function handleDelete(node: TreeNode) {
  if (!store.value) return
  deleteStoreItem(props.section.id, store.value.id, node.id)
}

function handleDuplicate(node: TreeNode) {
  const item = storeItems.value.find((i) => i.id === node.id)
  if (!item || !store.value) return
  addStoreItemAction(props.section.id, store.value.id, {
    title: item.title, description: item.description, image: item.image,
    price: item.price, variants: JSON.parse(JSON.stringify(item.variants)),
    inventory: item.inventory, product_type: item.product_type, file_url: item.file_url,
  })
}

function handleSettings(node: TreeNode) {
  const item = storeItems.value.find((i) => i.id === node.id)
  if (item) openEditStoreItem(item)
}

const itemEditorStoreItem = ref<StoreItem | null>(null)

function openEditStoreItem(item: StoreItem) {
  itemEditorStoreItem.value = item
}

function addStoreItem() {
  if (!store.value) return
  const newItem = addStoreItemAction(props.section.id, store.value.id, { title: 'New item', description: '', image: '', price: 0, variants: [], inventory: 0, product_type: 'physical', file_url: '' })
  if (newItem) {
    itemEditorStoreItem.value = newItem
  }
}

defineExpose({ addStoreItem })
</script>

<template>
  <div class="flex flex-col gap-4 p-2 pr-0">
    <!-- Not connected -->
    <template v-if="!landStore.isStripeConnected">
      <div class="rounded-xl border border-gray-200 flex flex-col items-center gap-4 py-8 px-4 text-center">
        <div class="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center">
          <ShoppingBagIcon class="h-5 w-5 text-gray-900" />
        </div>
        <p class="text-sm font-semibold text-gray-900">Store</p>
        <p class="text-xs text-gray-400 leading-relaxed">Sell your products directly from your landing page. Connect your Stripe account and start adding your products.</p>
        <BaseButton variant="solid" size="sm" :disabled="isConnectingStripe" @click="connectStripe">
          <Transition name="stripe-btn" mode="out-in">
            <span v-if="isConnectingStripe" key="loading" class="flex items-center gap-1.5"><span class="stripe-spinner" /> Connecting…</span>
            <span v-else key="idle" class="flex items-center gap-1.5">Connect Stripe</span>
          </Transition>
        </BaseButton>
      </div>
    </template>

    <!-- Connected -->
    <template v-else>
      <BaseInput size="sm" label="Title" v-model="storeTitle" placeholder="My Store" />
      <BaseInput size="sm" type="textarea" label="Description" v-model="storeDescription" placeholder="Describe your store…" />
      <div class="flex flex-col gap-2">
        <span class="text-xs font-medium text-gray-500">Products</span>
        <div v-if="storeItems.length === 0" class="flex flex-col gap-4 p-8 bg-gray-50 items-center rounded-xl">
          <p class="text-xs text-gray-400">No products yet</p>
        </div>
        <BaseTree
          v-else
          :nodes="storeTreeNodes"
          @settings="handleSettings"
          @delete="handleDelete"
          @duplicate="handleDuplicate"
          @reorder="handleReorder"
        />
      </div>
      <BaseButton variant="outline" size="sm" class="w-full" @click="addStoreItem">+ Add item</BaseButton>
      <BaseCard :icon="ShoppingBagIcon" title="Store">
        <template v-if="storeItems.length === 0">
          Start adding your products to this store.
        </template>
        <template v-else>
          <div class="grid grid-cols-2 gap-2">
            <div class="rounded-xl bg-white border border-gray-100 p-3 space-y-0.5">
              <p class="text-xs text-gray-400">Orders</p>
              <p class="text-xl font-semibold text-gray-900 leading-tight">0</p>
              <p class="text-xs text-gray-400">total</p>
            </div>
            <div class="rounded-xl bg-white border border-gray-100 p-3 space-y-0.5">
              <p class="text-xs text-gray-400">Revenue</p>
              <p class="text-xl font-semibold text-gray-900 leading-tight">$0</p>
              <p class="text-xs text-gray-400">this month</p>
            </div>
          </div>
        </template>
        <template #actions>
          <BaseButton size="sm" variant="outline" class="w-full justify-center" @click="appModals.openDashboardDetail('orders')">View orders</BaseButton>
        </template>
      </BaseCard>
    </template>
  </div>
  <ItemEditorSettings
    v-if="itemEditorStoreItem && store"
    type="store"
    :item="itemEditorStoreItem"
    :section-id="section.id"
    :store-id="store.id"
    @close="itemEditorStoreItem = null"
  />
</template>

<style scoped>
.stripe-btn-enter-active, .stripe-btn-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.stripe-btn-enter-from { opacity: 0; transform: scale(0.9); }
.stripe-btn-leave-to   { opacity: 0; transform: scale(1.05); }

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

@keyframes spin { to { transform: rotate(360deg); } }
</style>
