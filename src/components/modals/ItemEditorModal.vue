<script setup lang="ts">
import { ref, watch, computed, onMounted, nextTick } from 'vue'
import { TrashIcon } from '@heroicons/vue/24/outline'
import BaseButton from '../ui/BaseButton.vue'
import BaseInput from '../ui/BaseInput.vue'
import BaseUpload from '../ui/BaseUpload.vue'
import ContentEditor from '../editor/content/ContentEditor.vue'
import { useEditorActions } from '@/composables/useEditorActions'
import type { CollectionItem } from '@/types/collection'
import type { StoreItem } from '@/types/store'

const props = defineProps<{
  type: 'collection' | 'monetize' | 'store'
  item: CollectionItem | StoreItem
  sectionId: string
  collectionId?: string
  storeId?: string
}>()

const emit = defineEmits<{ close: [] }>()

const visible = ref(false)
onMounted(() => nextTick(() => { visible.value = true }))

function dismiss() {
  visible.value = false
  setTimeout(() => emit('close'), 220)
}

const { updateCollectionItem, updateStoreItem } = useEditorActions()

const isStore = computed(() => props.type === 'store')

// ─── Collection / Monetize local state ───
const colMediaUrl = ref('')
const colTitle = ref('')
const colSubtitle = ref('')
const colContent = ref('')

// ─── Store local state ───
const storeImage = ref('')
const storeTitle = ref('')
const storeDescription = ref('')
const storePrice = ref('')
const storeProductType = ref<'physical' | 'digital'>('physical')
const storeInventory = ref('')
const storeFileUrl = ref('')
const storeVariants = ref<{ id: string; name: string; options: { value: string; inventory: number }[] }[]>([])
const storeContent = ref('')

watch(() => props.item, (item) => {
  if (props.type === 'store') {
    const s = item as StoreItem
    storeImage.value = s.image
    storeTitle.value = s.title
    storeDescription.value = s.description
    storePrice.value = s.price > 0 ? s.price.toString() : ''
    storeProductType.value = s.product_type
    storeInventory.value = s.inventory > 0 ? s.inventory.toString() : ''
    storeFileUrl.value = s.file_url
    storeVariants.value = s.variants.map(v => ({
      id: v.id, name: v.name,
      options: v.options.map(o => ({ value: o.value, inventory: o.inventory })),
    }))
    storeContent.value = s.content ?? ''
  } else {
    const c = item as CollectionItem
    colMediaUrl.value = c.media_url
    colTitle.value = c.title
    colSubtitle.value = c.subtitle
    colContent.value = c.content
  }
}, { immediate: true })

const headerLabel = computed(() => {
  if (props.type === 'store') return 'Product'
  if (props.type === 'monetize') return 'Monetize item'
  return 'Collection item'
})

const headerTitle = computed(() => isStore.value ? storeTitle.value : colTitle.value)

function save() {
  if (props.type === 'store' && props.storeId) {
    const s = props.item as StoreItem
    updateStoreItem(props.sectionId, props.storeId, s.id, {
      title: storeTitle.value,
      description: storeDescription.value,
      image: storeImage.value,
      price: parseFloat(storePrice.value) || 0,
      product_type: storeProductType.value,
      inventory: storeProductType.value === 'physical' ? (parseInt(storeInventory.value) || 0) : 0,
      file_url: storeProductType.value === 'digital' ? storeFileUrl.value : '',
      variants: storeProductType.value === 'physical'
        ? storeVariants.value.map(v => ({ id: v.id, name: v.name, options: v.options.filter(o => o.value.trim()) }))
        : [],
      content: storeContent.value,
    })
  } else if (props.collectionId) {
    const c = props.item as CollectionItem
    updateCollectionItem(props.sectionId, props.collectionId, c.id, {
      title: colTitle.value,
      subtitle: colSubtitle.value,
      media_url: colMediaUrl.value,
      content: colContent.value,
    })
  }
  dismiss()
}

function addVariant() {
  storeVariants.value.push({ id: crypto.randomUUID(), name: '', options: [{ value: '', inventory: 0 }] })
}
function addVariantOption(vi: number) {
  storeVariants.value[vi]?.options.push({ value: '', inventory: 0 })
}
function removeVariantOption(vi: number, oi: number) {
  storeVariants.value[vi]?.options.splice(oi, 1)
}
function removeVariant(i: number) {
  storeVariants.value.splice(i, 1)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="item-modal">
    <div v-if="visible" class="fixed inset-0 z-[70] flex items-center justify-center p-6">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="dismiss" />
      <div class="item-modal-panel relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl flex flex-col" style="max-height: 90vh">

        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <p class="text-[10px] font-medium uppercase tracking-widest text-gray-400 mb-0.5">{{ headerLabel }}</p>
            <h2 class="text-sm font-semibold text-gray-900 truncate max-w-xs">{{ headerTitle || 'Untitled' }}</h2>
          </div>
          <div class="flex items-center gap-2">
            <BaseButton variant="outline" size="sm" @click="dismiss">Cancel</BaseButton>
            <BaseButton variant="solid" size="sm" @click="save">Save</BaseButton>
          </div>
        </div>

        <!-- Body -->
        <div class="flex flex-1 min-h-0">

          <!-- Left panel: fields -->
          <div class="w-72 shrink-0 border-r border-gray-100 overflow-y-auto p-4 space-y-4">

            <!-- Collection / Monetize fields -->
            <template v-if="!isStore">
              <BaseUpload type="image" size="sm" label="Cover" v-model="colMediaUrl" />
              <BaseInput size="sm" label="Title" v-model="colTitle" />
              <BaseInput size="sm" label="Subtitle" v-model="colSubtitle" />
            </template>

            <!-- Store fields -->
            <template v-else>
              <BaseUpload type="image" size="sm" label="Cover" v-model="storeImage" />
              <BaseInput size="sm" label="Title" v-model="storeTitle" />
              <BaseInput size="sm" type="textarea" label="Description" v-model="storeDescription" />
              <BaseInput size="sm" label="Price" v-model="storePrice" placeholder="0.00" />

              <!-- Product type toggle -->
              <div class="flex gap-1">
                <button
                  v-for="opt in [{ value: 'physical', label: 'Physical' }, { value: 'digital', label: 'Digital' }]"
                  :key="opt.value"
                  type="button"
                  class="flex-1 py-1.5 text-xs rounded-lg border transition-colors"
                  :class="storeProductType === opt.value
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-200 text-gray-600 hover:border-gray-400'"
                  @click="storeProductType = opt.value as 'physical' | 'digital'"
                >{{ opt.label }}</button>
              </div>

              <!-- Physical: variants + inventory -->
              <template v-if="storeProductType === 'physical'">
                <div class="flex flex-col gap-2 pt-1 border-t border-gray-100">
                  <div class="flex items-center justify-between">
                    <p class="text-xs font-medium text-gray-500">Variants</p>
                    <button class="text-xs text-gray-400 hover:text-gray-700" @click="addVariant">+ Add</button>
                  </div>
                  <div v-for="(variant, vi) in storeVariants" :key="variant.id" class="flex flex-col gap-2 p-3 rounded-xl border border-gray-200">
                    <div class="flex items-center gap-2">
                      <BaseInput size="sm" label="Name" v-model="variant.name" placeholder="e.g. Size" class="flex-1" />
                      <button class="text-gray-400 hover:text-red-500 mt-4 shrink-0" @click="removeVariant(vi)">
                        <TrashIcon class="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div v-for="(opt, oi) in variant.options" :key="oi" class="flex items-center gap-2">
                      <input v-model="opt.value" type="text" placeholder="Option" class="flex-1 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-gray-400" />
                      <input v-model.number="opt.inventory" type="number" min="0" placeholder="Qty" class="w-16 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-gray-400" />
                      <button class="text-gray-400 hover:text-red-500 shrink-0" @click="removeVariantOption(vi, oi)">
                        <TrashIcon class="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button class="text-xs text-gray-400 hover:text-gray-700 text-left" @click="addVariantOption(vi)">+ Add option</button>
                  </div>
                </div>
                <div class="pt-1 border-t border-gray-100">
                  <BaseInput size="sm" label="Inventory total" v-model="storeInventory" placeholder="0" />
                </div>
              </template>

              <!-- Digital: file upload -->
              <BaseUpload v-if="storeProductType === 'digital'" type="file" size="sm" label="File" v-model="storeFileUrl" />
            </template>
          </div>

          <!-- Right panel: content editor -->
          <div class="flex-1 overflow-y-auto">
            <ContentEditor v-if="isStore" v-model="storeContent" />
            <ContentEditor v-else v-model="colContent" />
          </div>

        </div>
      </div>
    </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.item-modal-enter-active,
.item-modal-leave-active {
  transition: opacity 200ms cubic-bezier(0.4, 0, 0.2, 1);
}
.item-modal-enter-active .item-modal-panel,
.item-modal-leave-active .item-modal-panel {
  transition: opacity 200ms cubic-bezier(0.4, 0, 0.2, 1),
              transform 200ms cubic-bezier(0.4, 0, 0.2, 1);
}
.item-modal-enter-from,
.item-modal-leave-to {
  opacity: 0;
}
.item-modal-enter-from .item-modal-panel,
.item-modal-leave-to .item-modal-panel {
  opacity: 0;
  transform: scale(0.96) translateY(8px);
}
</style>
