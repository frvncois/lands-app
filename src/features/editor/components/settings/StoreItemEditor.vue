<script setup lang="ts">
import { ref, watch } from 'vue'
import { TrashIcon, PlusIcon } from '@heroicons/vue/24/outline'
import BaseInput from '@/shared/ui/BaseInput.vue'
import BaseUpload from '@/shared/ui/BaseUpload.vue'
import { useStoreActions } from '@/features/editor/composables/useStoreActions'
import type { StoreItem } from '@/features/sections/types/store'

interface EditableVariant {
  id: string
  title: string
  type: string
  price: string
  image: string
  inventory: string
}

const props = defineProps<{
  item: StoreItem
  sectionId: string
  storeId: string
}>()

defineExpose({ save })

const { updateStoreItem } = useStoreActions()

const mainImage = ref('')
const gallery = ref<string[]>([])
const title = ref('')
const details = ref('')
const price = ref('')
const variants = ref<EditableVariant[]>([])

watch(() => props.item, (item) => {
  mainImage.value = item.image
  gallery.value = item.gallery ? [...item.gallery] : []
  title.value = item.title
  details.value = item.description
  price.value = item.price > 0 ? item.price.toString() : ''
  variants.value = item.variants.map(v => ({
    id: v.id, title: v.title, type: v.type, image: v.image,
    price: v.price > 0 ? v.price.toString() : '',
    inventory: v.inventory > 0 ? v.inventory.toString() : '',
  }))
}, { immediate: true })

// ─── Gallery ───
function addGallerySlot() { gallery.value.push('') }
function removeGalleryImage(i: number) { gallery.value.splice(i, 1) }

// ─── Variants ───
function addVariant() {
  variants.value.push({ id: crypto.randomUUID(), title: '', type: '', price: '', image: '', inventory: '' })
}
function removeVariant(i: number) { variants.value.splice(i, 1) }

function save() {
  updateStoreItem(props.sectionId, props.storeId, props.item.id, {
    title: title.value,
    description: details.value,
    image: mainImage.value,
    gallery: gallery.value.filter(Boolean),
    price: parseFloat(price.value) || 0,
    variants: variants.value.map(v => ({
      id: v.id, title: v.title, type: v.type, image: v.image,
      price: parseFloat(v.price) || 0,
      inventory: parseInt(v.inventory) || 0,
    })),
    inventory: props.item.inventory,
    product_type: props.item.product_type,
    file_url: props.item.file_url,
  })
}
</script>

<template>
  <div class="flex flex-1 min-h-0">
    <!-- Left: images -->
    <div class="w-64 shrink-0 border-r border-gray-100 p-4 space-y-3 overflow-y-auto">
      <div class="space-y-2">
        <p class="text-xs font-medium text-gray-500">Main image</p>
        <BaseUpload type="image" size="sm" label="" v-model="mainImage" />
      </div>

      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <p class="text-xs font-medium text-gray-500">Gallery</p>
          <button class="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700" @click="addGallerySlot">
            <PlusIcon class="h-3 w-3" /> Add
          </button>
        </div>
        <div v-for="(_, i) in gallery" :key="i" class="relative">
          <BaseUpload type="image" size="sm" label="" v-model="gallery[i]" />
          <button
            class="absolute top-1 right-1 text-gray-400 hover:text-red-500 bg-white rounded-full p-0.5"
            @click="removeGalleryImage(i)"
          >
            <TrashIcon class="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>

    <!-- Right: fields -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4">
      <BaseInput size="sm" label="Title" v-model="title" />
      <BaseInput size="sm" type="textarea" label="Details" v-model="details" placeholder="Product description…" />
      <BaseInput size="sm" label="Base price" v-model="price" placeholder="0.00" />

      <!-- Variants -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <p class="text-xs font-medium text-gray-500">Variants</p>
          <button class="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700" @click="addVariant">
            <PlusIcon class="h-3 w-3" /> Add
          </button>
        </div>
        <div v-for="(variant, i) in variants" :key="variant.id" class="flex flex-col gap-2 p-3 rounded-xl border border-gray-200">
          <div class="flex items-start gap-2">
            <div class="flex-1 space-y-2">
              <div class="grid grid-cols-2 gap-2">
                <BaseInput size="sm" label="Name" v-model="variant.title" placeholder="Size: Large" />
                <BaseInput size="sm" label="Type" v-model="variant.type" placeholder="Size" />
              </div>
              <div class="grid grid-cols-2 gap-2">
                <BaseInput size="sm" label="Price" v-model="variant.price" placeholder="0.00" />
                <BaseInput size="sm" label="Inventory" v-model="variant.inventory" placeholder="0" />
              </div>
              <BaseUpload type="image" size="sm" label="Image" v-model="variant.image" />
            </div>
            <button class="text-gray-400 hover:text-red-500 mt-5 shrink-0" @click="removeVariant(i)">
              <TrashIcon class="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <p v-if="!variants.length" class="text-xs text-gray-400">No variants added</p>
      </div>
    </div>
  </div>
</template>
