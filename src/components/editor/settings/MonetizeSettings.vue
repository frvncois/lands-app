<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { CreditCardIcon, RectangleStackIcon } from '@heroicons/vue/24/outline'
import BaseInput from '../../ui/BaseInput.vue'
import BaseButton from '../../ui/BaseButton.vue'
import BaseUpload from '../../ui/BaseUpload.vue'
import BaseTree from '../../ui/BaseTree.vue'
import BaseCard from '../../ui/BaseCard.vue'
import type { TreeNode } from '../../ui/BaseTree.vue'
import ItemEditorSettings from './ItemEditorSettings.vue'
import type { Section } from '@/types/section'
import type { CollectionItem, Collection } from '@/types/collection'
import { useEditorActions } from '@/composables/useEditorActions'
import { useLandStore } from '@/stores/land'
import { useAppModals } from '@/stores/appModals'
import { useToast } from '@/composables/useToast'
import { stripeService } from '@/services/stripe.service'
import { sortByPosition, generateReorderPosition } from '@/lib/utils/position'

const props = defineProps<{ section: Section }>()

const landStore = useLandStore()
const appModals = useAppModals()
const { addToast } = useToast()
const { updateCollection, addCollectionItem, deleteCollectionItem, reorderCollectionItem } = useEditorActions()

const isConnectingStripe = ref(false)
const collectionTitle = ref('')
const monetizeSubtitle = ref('')
const monetizeDescription = ref('')
const monetizeCoverUrl = ref('')
const monetizePrice = ref('')
const monetizeBillingPeriod = ref<'monthly' | 'yearly'>('monthly')

const collection = computed(() => ((props.section.content as any)?.collections?.[0] ?? null) as Collection | null)
const collectionItems = computed(() => collection.value ? sortByPosition(collection.value.items) : [])

function sync() {
  const c = (props.section.content as any)?.collections?.[0]
  collectionTitle.value = c?.title ?? ''
  monetizeSubtitle.value = c?.subtitle ?? ''
  monetizeDescription.value = c?.description ?? ''
  monetizeCoverUrl.value = c?.cover_url ?? ''
  monetizePrice.value = c?.price != null ? c.price.toString() : ''
  monetizeBillingPeriod.value = c?.billing_period ?? 'monthly'
}

sync()
watch(() => props.section.id, sync)

function saveTitle() {
  if (!collection.value) return
  updateCollection(props.section.id, collection.value.id, { title: collectionTitle.value })
}
function saveSubtitle() {
  if (!collection.value) return
  updateCollection(props.section.id, collection.value.id, { subtitle: monetizeSubtitle.value })
}
function saveDescription() {
  if (!collection.value) return
  updateCollection(props.section.id, collection.value.id, { description: monetizeDescription.value })
}
function saveCover(url: string) {
  if (!collection.value) return
  updateCollection(props.section.id, collection.value.id, { cover_url: url })
}
function savePrice() {
  if (!collection.value) return
  updateCollection(props.section.id, collection.value.id, { price: parseFloat(monetizePrice.value) || 0 })
}
function saveBillingPeriod(period: 'monthly' | 'yearly') {
  if (!collection.value) return
  monetizeBillingPeriod.value = period
  updateCollection(props.section.id, collection.value.id, { billing_period: period })
}

function connectStripe() {
  const landId = landStore.activeLand?.id
  if (!landId) return
  try {
    isConnectingStripe.value = true
    window.location.href = stripeService.connectUrl(landId)
  } catch {
    isConnectingStripe.value = false
    addToast('Stripe is not configured — set VITE_STRIPE_CLIENT_ID', 'error')
  }
}

const collectionTreeNodes = computed<TreeNode[]>(() =>
  collectionItems.value.map((item) => ({
    id: item.id,
    label: item.title,
    icon: RectangleStackIcon,
    imageUrl: item.media_url || undefined,
  }))
)

function handleReorder(oldIndex: number, newIndex: number) {
  if (oldIndex === newIndex || !collection.value) return
  const moved = collectionItems.value[oldIndex]
  if (!moved) return
  reorderCollectionItem(props.section.id, collection.value.id, moved.id, generateReorderPosition(collectionItems.value, oldIndex, newIndex))
}

function handleDelete(node: TreeNode) {
  if (!collection.value) return
  deleteCollectionItem(props.section.id, collection.value.id, node.id)
}

function handleDuplicate(node: TreeNode) {
  const item = collectionItems.value.find((i) => i.id === node.id)
  if (item) duplicateItem(item)
}

function handleSettings(node: TreeNode) {
  const item = collectionItems.value.find((i) => i.id === node.id)
  if (item) openEditItem(item)
}

const itemEditorCollectionItem = ref<CollectionItem | null>(null)

function openEditItem(item: CollectionItem) {
  itemEditorCollectionItem.value = item
}

function duplicateItem(item: CollectionItem) {
  if (!collection.value) return
  addCollectionItem(props.section.id, collection.value.id, {
    title: item.title, subtitle: item.subtitle, description: item.description, media_url: item.media_url,
    content: item.content, external_url: item.external_url,
  })
}

function addItem() {
  if (!collection.value) return
  const newItem = addCollectionItem(props.section.id, collection.value.id, { title: 'New item', subtitle: '', description: '', media_url: '', content: '', external_url: '' })
  if (newItem) {
    itemEditorCollectionItem.value = newItem
  }
}

defineExpose({ addItem })
</script>

<template>
  <div class="flex flex-col gap-4 p-2 pr-0">
    <!-- Not connected -->
    <template v-if="!landStore.isStripeConnected">
      <div class="rounded-xl border border-gray-200 flex flex-col items-center gap-4 py-8 px-4 text-center">
        <div class="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center">
          <CreditCardIcon class="h-5 w-5 text-gray-900" />
        </div>
        <p class="text-sm font-semibold text-gray-900">Sell &amp; Monetize</p>
        <p class="text-xs text-gray-400 leading-relaxed">Connect your Stripe account and start selling exclusive content and memberships.</p>
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
      <BaseUpload type="image" size="sm" label="Cover" v-model="monetizeCoverUrl" @update:modelValue="saveCover" />
      <BaseInput size="sm" label="Title" v-model="collectionTitle" placeholder="Exclusive Content" @update:modelValue="saveTitle" />
      <BaseInput size="sm" label="Subtitle" v-model="monetizeSubtitle" placeholder="For your biggest fans" @update:modelValue="saveSubtitle" />
      <div class="flex flex-col gap-1.5">
        <span class="text-xs font-medium text-gray-500">Description</span>
        <textarea
          v-model="monetizeDescription"
          placeholder="What members get access to…"
          rows="3"
          class="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50 resize-none outline-none focus:border-gray-400 transition-colors placeholder:text-gray-300"
          @input="saveDescription"
        />
      </div>
      <div class="flex flex-col gap-1.5">
        <span class="text-xs font-medium text-gray-500">Price</span>
        <div class="flex gap-2">
          <BaseInput label="" size="sm" v-model="monetizePrice" placeholder="9.00" class="flex-1" @update:modelValue="savePrice" />
          <div class="flex rounded-xl border border-gray-200 overflow-hidden text-xs font-medium">
            <button
              class="px-3 py-1.5 transition-colors"
              :class="monetizeBillingPeriod === 'monthly' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'"
              @click="saveBillingPeriod('monthly')"
            >Monthly</button>
            <button
              class="px-3 py-1.5 transition-colors border-l border-gray-200"
              :class="monetizeBillingPeriod === 'yearly' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'"
              @click="saveBillingPeriod('yearly')"
            >Yearly</button>
          </div>
        </div>
      </div>
      <div class="flex flex-col gap-2">
        <span class="text-xs font-medium text-gray-500">Items</span>
        <div v-if="collectionItems.length === 0" class="flex flex-col gap-4 p-8 bg-gray-50 items-center rounded-xl">
          <p class="text-xs text-gray-400">No items yet</p>
        </div>
        <BaseTree
          v-else
          :nodes="collectionTreeNodes"
          @settings="handleSettings"
          @delete="handleDelete"
          @duplicate="handleDuplicate"
          @reorder="handleReorder"
        />
      </div>
      <BaseButton variant="outline" size="sm" class="w-full" @click="addItem">+ Add item</BaseButton>
      <BaseCard :icon="CreditCardIcon" title="Monetize">
        <template v-if="collectionItems.length === 0">
          Start adding your exclusive content to this collection.
        </template>
        <template v-else>
          <div class="grid grid-cols-2 gap-2">
            <div class="rounded-xl bg-white border border-gray-100 p-3 space-y-0.5">
              <p class="text-xs text-gray-400">Subscribers</p>
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
          <BaseButton size="sm" variant="outline" class="w-full justify-center" @click="appModals.openDashboardDetail('monetize')">View details</BaseButton>
        </template>
      </BaseCard>
    </template>
  </div>
  <ItemEditorSettings
    v-if="itemEditorCollectionItem && collection"
    type="monetize"
    :item="itemEditorCollectionItem"
    :section-id="section.id"
    :collection-id="collection.id"
    @close="itemEditorCollectionItem = null"
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
