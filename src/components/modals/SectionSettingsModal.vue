<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { PlusIcon, TrashIcon, PencilIcon, DocumentDuplicateIcon, ArrowLeftIcon, CurrencyDollarIcon, DocumentTextIcon } from '@heroicons/vue/24/outline'
import BaseInput from '../ui/BaseInput.vue'
import BaseToggle from '../ui/BaseToggle.vue'
import BaseButton from '../ui/BaseButton.vue'
import BaseUpload from '../ui/BaseUpload.vue'
import BaseItem from '../ui/BaseItem.vue'
import RichTextEditor from '../ui/RichTextEditor.vue'
import CollectionMonetizePanel from './CollectionMonetizePanel.vue'
import CollectionItemContentModal from './CollectionItemContentModal.vue'
import type { Section, HeaderContent, HeaderSettings, TextContent, MediaContent, MediaItem, CampaignContent, CampaignSettings, FooterContent, FooterSettings } from '@/types/section'
import type { ListItem } from '@/types/list'
import type { CollectionItem, Collection } from '@/types/collection'
import type { Store, StoreItem } from '@/types/store'
import { useEditorActions } from '@/composables/useEditorActions'
import { mockState, getMockListItems, getMockCollections, getMockStores } from '@/lib/mock/provider'
import { sortByPosition } from '@/lib/utils/position'
import { renderMarkdown } from '@/lib/utils/markdown'

const props = defineProps<{ section: Section; hideHeader?: boolean }>()
const emit = defineEmits<{ close: [], 'editing-change': [isEditing: boolean], 'monetize-open': [value: boolean] }>()

const {
  updateSectionContent, updateSectionSettings, restoreSectionSnapshot,
  addListItem, updateListItem, deleteListItem,
  addMediaItem, updateMediaItem, deleteMediaItem,
  addCollectionItem, updateCollectionItem, deleteCollectionItem,
  addStoreItem, updateStoreItem, deleteStoreItem,
} = useEditorActions()

// ─── Header ───
const headerTitle = ref('')
const headerSubtitle = ref('')
const headerCoverMediaValue = ref('')

function saveHeaderContent() {
  updateSectionContent(props.section.id, { title: headerTitle.value, subtitle: headerSubtitle.value })
}

function saveHeaderSettings() {
  updateSectionSettings(props.section.id, {
    cover_media_type: 'image',
    cover_media_value: headerCoverMediaValue.value,
  })
}

// ─── Text ───
const textHtml = ref('')

function saveText() {
  updateSectionContent(props.section.id, { body: textHtml.value })
}

// ─── Media ───
const mediaItems = computed(() =>
  sortByPosition((props.section.content as MediaContent | null)?.items ?? [])
)

const editingMediaItem = ref<MediaItem | null>(null)
const editMediaType = ref<'image' | 'video'>('image')
const editMediaUrl = ref('')
const editMediaCaption = ref('')

function openEditMediaItem(item: MediaItem) {
  editingMediaItem.value = item
  editMediaType.value = item.media_type
  editMediaUrl.value = item.url
  editMediaCaption.value = item.caption
}

function closeEditMediaItem() {
  editingMediaItem.value = null
}

function saveMediaItem() {
  if (!editingMediaItem.value) return
  updateMediaItem(props.section.id, editingMediaItem.value.id, {
    media_type: editMediaType.value,
    url: editMediaUrl.value,
    caption: editMediaCaption.value,
  })
  closeEditMediaItem()
}

function duplicateMediaItem(item: MediaItem) {
  addMediaItem(props.section.id, { media_type: item.media_type, url: item.url, caption: item.caption })
}

// ─── List ───
const listItems = computed(() => sortByPosition(getMockListItems(props.section.id)))

const editingListItem = ref<ListItem | null>(null)
const editListTitle = ref('')
const editListUrl = ref('')
const editListDescription = ref('')
const editListIcon = ref('')

function openEditListItem(item: ListItem) {
  editingListItem.value = item
  editListTitle.value = item.title
  editListUrl.value = item.url
  editListDescription.value = item.description
  editListIcon.value = item.icon
}

function closeEditListItem() {
  editingListItem.value = null
}

function saveListItem() {
  if (!editingListItem.value) return
  updateListItem(props.section.id, editingListItem.value.id, {
    title: editListTitle.value,
    url: editListUrl.value,
    description: editListDescription.value,
    icon: editListIcon.value,
  })
  closeEditListItem()
}

function duplicateListItem(item: ListItem) {
  addListItem(props.section.id, { title: item.title, url: item.url, description: item.description, icon: item.icon })
}

// ─── Collection ───
const collection = computed(() => getMockCollections(props.section.id)[0] ?? null)
const collectionItems = computed(() => collection.value ? sortByPosition(collection.value.items) : [])
const collectionSettings = computed(() => props.section.settings_json as import('@/types/section').CollectionSettings)
const showMonetize = ref(false)

function openMonetize() { showMonetize.value = true }
function closeMonetize() { showMonetize.value = false }

const editingItem = ref<CollectionItem | null>(null)
const editTitle = ref('')
const editDescription = ref('')
const editCollectionMediaUrl = ref('')
const editContent = ref('')
const editExternalUrl = ref('')
const editRedirectEnabled = ref(false)
const showContentEditor = ref(false)

function openEditItem(item: CollectionItem) {
  editingItem.value = item
  editTitle.value = item.title
  editDescription.value = item.description
  editCollectionMediaUrl.value = item.media_url
  editContent.value = item.content
  editExternalUrl.value = item.external_url
  editRedirectEnabled.value = !!item.external_url
}

function closeEditItem() {
  editingItem.value = null
  showContentEditor.value = false
}

function saveItem() {
  if (!editingItem.value || !collection.value) return
  updateCollectionItem(props.section.id, collection.value.id, editingItem.value.id, {
    title: editTitle.value,
    description: editDescription.value,
    media_url: editCollectionMediaUrl.value,
    content: editContent.value,
    external_url: editExternalUrl.value,
  })
  closeEditItem()
}

function duplicateItem(item: CollectionItem) {
  if (!collection.value) return
  addCollectionItem(props.section.id, collection.value.id, {
    title: item.title, description: item.description, media_url: item.media_url,
    content: item.content, external_url: item.external_url,
  })
}

function deleteItem(item: CollectionItem) {
  if (!collection.value) return
  deleteCollectionItem(props.section.id, collection.value.id, item.id)
}

function addItem() {
  if (!collection.value) return
  const newItem = addCollectionItem(props.section.id, collection.value.id, { title: 'New item', description: '', media_url: '', content: '', external_url: '' })
  if (newItem) openEditItem(newItem)
}

// ─── Store ───
const store = computed(() => getMockStores(props.section.id)[0] ?? null)
const storeItems = computed(() => store.value ? sortByPosition(store.value.items) : [])

const editingStoreItem = ref<StoreItem | null>(null)
const storeEditTitle = ref('')
const storeEditDescription = ref('')
const storeEditImage = ref('')
const storeEditPrice = ref('')
const storeEditProductType = ref<'physical' | 'digital'>('physical')
const storeEditInventory = ref('')
const storeEditFileUrl = ref('')
const storeEditVariants = ref<{ id: string; name: string; options: { value: string; inventory: number }[] }[]>([])

function openEditStoreItem(item: StoreItem) {
  editingStoreItem.value = item
  storeEditTitle.value = item.title
  storeEditDescription.value = item.description
  storeEditImage.value = item.image
  storeEditPrice.value = item.price > 0 ? item.price.toString() : ''
  storeEditProductType.value = item.product_type
  storeEditInventory.value = item.inventory > 0 ? item.inventory.toString() : ''
  storeEditFileUrl.value = item.file_url
  storeEditVariants.value = item.variants.map((v) => ({ id: v.id, name: v.name, options: v.options.map((o) => ({ value: o.value, inventory: o.inventory })) }))
}

function closeEditStoreItem() {
  editingStoreItem.value = null
}

function saveStoreItem() {
  if (!editingStoreItem.value || !store.value) return
  updateStoreItem(props.section.id, store.value.id, editingStoreItem.value.id, {
    title: storeEditTitle.value,
    description: storeEditDescription.value,
    image: storeEditImage.value,
    price: parseFloat(storeEditPrice.value) || 0,
    product_type: storeEditProductType.value,
    inventory: storeEditProductType.value === 'physical' ? (parseInt(storeEditInventory.value) || 0) : 0,
    file_url: storeEditProductType.value === 'digital' ? storeEditFileUrl.value : '',
    variants: storeEditProductType.value === 'physical'
      ? storeEditVariants.value.map((v) => ({ id: v.id, name: v.name, options: v.options.filter((o) => o.value.trim()) }))
      : [],
  })
  closeEditStoreItem()
}

function addStoreVariant() {
  storeEditVariants.value.push({ id: crypto.randomUUID(), name: '', options: [{ value: '', inventory: 0 }] })
}

function addStoreVariantOption(variantIndex: number) {
  storeEditVariants.value[variantIndex]?.options.push({ value: '', inventory: 0 })
}

function removeStoreVariantOption(variantIndex: number, optionIndex: number) {
  storeEditVariants.value[variantIndex]?.options.splice(optionIndex, 1)
}

function removeStoreVariant(index: number) {
  storeEditVariants.value.splice(index, 1)
}

function addStoreItemAction() {
  if (!store.value) return
  const newItem = addStoreItem(props.section.id, store.value.id, { title: 'New item', description: '', image: '', price: 0, variants: [], inventory: 0, product_type: 'physical', file_url: '' })
  if (newItem) openEditStoreItem(newItem)
}

// ─── Campaign ───
const campaignTitle = ref('')
const campaignDescription = ref('')
const campaignButtonLabel = ref('')
const campaignPlaceholder = ref('')
const campaignShowNameField = ref(false)

function saveCampaignContent() {
  updateSectionContent(props.section.id, {
    title: campaignTitle.value,
    description: campaignDescription.value,
    button_label: campaignButtonLabel.value,
    placeholder: campaignPlaceholder.value,
  })
}

function saveCampaignSettings() {
  updateSectionSettings(props.section.id, { show_name_field: campaignShowNameField.value })
}

// ─── Footer ───
const footerTitle = ref('')
const footerSubtitle = ref('')
const footerCoverMediaValue = ref('')

function saveFooterContent() {
  updateSectionContent(props.section.id, { title: footerTitle.value, subtitle: footerSubtitle.value })
}

function saveFooterSettings() {
  updateSectionSettings(props.section.id, { cover_media_value: footerCoverMediaValue.value })
}

// ─── Snapshot ───
interface SectionSnapshot {
  content: unknown
  settings_json: unknown
  style_variant: string
  listItems: ListItem[]
  collections: Collection[]
  stores: Store[]
}

const snapshot = ref<SectionSnapshot | null>(null)

function takeSnapshot() {
  snapshot.value = {
    content: JSON.parse(JSON.stringify(props.section.content ?? null)),
    settings_json: JSON.parse(JSON.stringify(props.section.settings_json ?? {})),
    style_variant: props.section.style_variant,
    listItems: JSON.parse(JSON.stringify(getMockListItems(props.section.id))),
    collections: JSON.parse(JSON.stringify(getMockCollections(props.section.id))),
    stores: JSON.parse(JSON.stringify(getMockStores(props.section.id))),
  }
}

// ─── Sync ───
function syncFromSection() {
  if (props.section.type === 'header') {
    const c = props.section.content as HeaderContent | null
    const s = props.section.settings_json as HeaderSettings
    headerTitle.value = c?.title ?? ''
    headerSubtitle.value = c?.subtitle ?? ''
    headerCoverMediaValue.value = s?.cover_media_value ?? ''
  }
  if (props.section.type === 'text') {
    const raw = (props.section.content as TextContent | null)?.body ?? ''
    textHtml.value = raw.startsWith('<') ? raw : renderMarkdown(raw)
  }
  if (props.section.type === 'footer') {
    const c = props.section.content as FooterContent | null
    const s = props.section.settings_json as FooterSettings
    footerTitle.value = c?.title ?? ''
    footerSubtitle.value = c?.subtitle ?? ''
    footerCoverMediaValue.value = s?.cover_media_value ?? ''
  }
  if (props.section.type === 'campaign') {
    const c = props.section.content as CampaignContent | null
    const s = props.section.settings_json as CampaignSettings
    campaignTitle.value = c?.title ?? ''
    campaignDescription.value = c?.description ?? ''
    campaignButtonLabel.value = c?.button_label ?? ''
    campaignPlaceholder.value = c?.placeholder ?? ''
    campaignShowNameField.value = s?.show_name_field ?? false
  }
}

syncFromSection()
takeSnapshot()

watch(() => props.section.id, () => {
  syncFromSection()
  takeSnapshot()
  closeEditItem()
  closeEditListItem()
  closeEditMediaItem()
})

// ─── Save / Cancel ───
function handleSave() {
  emit('close')
}

function handleCancel() {
  if (snapshot.value) {
    restoreSectionSnapshot(props.section.id, snapshot.value)
    mockState.listItems[props.section.id] = snapshot.value.listItems
    mockState.collections[props.section.id] = snapshot.value.collections
    mockState.stores[props.section.id] = snapshot.value.stores
  }
  emit('close')
}

// ─── Computed edit state ───
const isEditingSubItem = computed(() => !!(editingItem.value || editingListItem.value || editingMediaItem.value || editingStoreItem.value))

function closeSubItem() {
  if (editingItem.value) closeEditItem()
  else if (editingListItem.value) closeEditListItem()
  else if (editingMediaItem.value) closeEditMediaItem()
  else if (editingStoreItem.value) closeEditStoreItem()
}

function saveSubItem() {
  if (editingItem.value) saveItem()
  else if (editingListItem.value) saveListItem()
  else if (editingStoreItem.value) saveStoreItem()
}

watch(isEditingSubItem, (val) => emit('editing-change', val))
watch(showMonetize, (val) => emit('monetize-open', val))

defineExpose({ handleSave, handleCancel, cancelSubItem: closeSubItem, saveSubItem, closeMonetize, addItem, addStoreItem: addStoreItemAction })
</script>

<template>
  <!-- Panel header -->
  <div v-if="!props.hideHeader" class="flex items-center justify-between p-4 border-b border-gray-200">
    <div class="flex items-center gap-2">
      <button v-if="isEditingSubItem" class="text-gray-400 hover:text-gray-700" @click="closeSubItem">
        <ArrowLeftIcon class="h-4 w-4" />
      </button>
      <Transition name="modal-fade" mode="out-in">
        <h2 :key="isEditingSubItem ? 'edit' : section.type" class="text-sm font-semibold text-gray-900 capitalize">
          {{ isEditingSubItem ? 'Edit item' : section.type }}
        </h2>
      </Transition>
    </div>
    <div class="flex items-center gap-1">
      <BaseButton variant="outline" size="xs" @click="handleCancel">Cancel</BaseButton>
      <BaseButton variant="solid" size="xs" @click="handleSave">Save</BaseButton>
    </div>
  </div>

  <div class="max-h-[70vh] overflow-y-auto overflow-x-hidden">
  <Transition :name="(isEditingSubItem || showMonetize) ? 'modal-forward' : 'modal-back'" mode="out-in">
  <div :key="showMonetize ? 'monetize' : isEditingSubItem ? 'edit' : 'list'" class="p-4 flex flex-col gap-3">

      <!-- ── Header ── -->
      <template v-if="section.type === 'header'">
        <BaseUpload
          type="image"
          size="sm"
          label="Cover image"
          v-model="headerCoverMediaValue"
          @update:modelValue="saveHeaderSettings"
        />
        <BaseInput size="sm" label="Title" v-model="headerTitle" @update:modelValue="saveHeaderContent" />
        <BaseInput size="sm" label="Subtitle" v-model="headerSubtitle" @update:modelValue="saveHeaderContent" />

      </template>

      <!-- ── Text ── -->
      <template v-else-if="section.type === 'text'">
        <RichTextEditor v-model="textHtml" @update:modelValue="saveText" />
      </template>

      <!-- ── Media — items list ── -->
      <template v-else-if="section.type === 'media' && !editingMediaItem">
        <div class="flex flex-col">
          <div
            v-for="item in mediaItems"
            :key="item.id"
            class="flex items-center justify-between gap-1 py-2 border-b border-gray-100 last:border-0"
          >
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium truncate capitalize">{{ item.media_type }}</p>
              <p class="text-xs text-gray-400 truncate">{{ item.url }}</p>
            </div>
            <div class="flex items-center shrink-0">
              <button class="text-gray-400 hover:text-gray-700 p-1" @click="openEditMediaItem(item)">
                <PencilIcon class="h-3.5 w-3.5" />
              </button>
              <button class="text-gray-400 hover:text-gray-700 p-1" @click="duplicateMediaItem(item)">
                <DocumentDuplicateIcon class="h-3.5 w-3.5" />
              </button>
              <button class="text-gray-400 hover:text-red-500 p-1" @click="deleteMediaItem(section.id, item.id)">
                <TrashIcon class="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
        <button
          class="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800"
          @click="addMediaItem(section.id, { media_type: 'image', url: '', caption: '' })"
        >
          <PlusIcon class="h-3.5 w-3.5" /> Add media
        </button>
      </template>

      <!-- ── Media — item edit form ── -->
      <template v-else-if="section.type === 'media' && editingMediaItem">
        <div class="flex gap-1 pb-3 border-b border-gray-100">
          <button
            v-for="opt in [{ value: 'image', label: 'Image' }, { value: 'video', label: 'Video' }]"
            :key="opt.value"
            class="flex-1 py-1 text-xs rounded-lg border transition-colors"
            :class="editMediaType === opt.value
              ? 'border-gray-900 bg-gray-900 text-white'
              : 'border-gray-200 text-gray-600 hover:border-gray-400'"
            @click="editMediaType = opt.value as 'image' | 'video'"
          >
            {{ opt.label }}
          </button>
        </div>
        <BaseUpload v-if="editMediaType === 'image'" type="image" size="sm" label="Image" v-model="editMediaUrl" />
        <BaseInput v-else size="sm" label="URL" v-model="editMediaUrl" placeholder="https://..." />
        <BaseInput size="sm" label="Caption" v-model="editMediaCaption" />
        <div class="flex gap-2 pt-1">
          <BaseButton class="flex-1" variant="outline" size="xs" @click="closeEditMediaItem">Cancel</BaseButton>
          <BaseButton class="flex-1" variant="solid" size="xs" @click="saveMediaItem">Save</BaseButton>
        </div>
      </template>

      <!-- ── List — items list ── -->
      <template v-else-if="section.type === 'list' && !editingListItem">
        <div class="flex flex-col">
          <div
            v-for="item in listItems"
            :key="item.id"
            class="flex items-center justify-between gap-1 py-2 border-b border-gray-100 last:border-0"
          >
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium truncate">{{ item.title }}</p>
              <p class="text-xs text-gray-400 truncate">{{ item.url }}</p>
            </div>
            <div class="flex items-center shrink-0">
              <button class="text-gray-400 hover:text-gray-700 p-1" @click="openEditListItem(item)">
                <PencilIcon class="h-3.5 w-3.5" />
              </button>
              <button class="text-gray-400 hover:text-gray-700 p-1" @click="duplicateListItem(item)">
                <DocumentDuplicateIcon class="h-3.5 w-3.5" />
              </button>
              <button class="text-gray-400 hover:text-red-500 p-1" @click="deleteListItem(section.id, item.id)">
                <TrashIcon class="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
        <button
          class="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800"
          @click="openEditListItem(addListItem(section.id, { title: 'New link', url: 'https://', description: '', icon: '' }))"
        >
          <PlusIcon class="h-3.5 w-3.5" /> Add link
        </button>
      </template>

      <!-- ── List — item edit form ── -->
      <template v-else-if="section.type === 'list' && editingListItem">
        <BaseInput size="sm" label="Title" v-model="editListTitle" />
        <BaseInput size="sm" label="URL" v-model="editListUrl" placeholder="https://..." />
        <BaseInput size="sm" label="Description" v-model="editListDescription" />
        <BaseUpload type="image" size="sm" label="Icon" v-model="editListIcon" />
      </template>

      <!-- ── Collection — monetize panel ── -->
      <template v-else-if="section.type === 'collection' && showMonetize">
        <CollectionMonetizePanel :section-id="section.id" :settings="collectionSettings" />
      </template>

      <!-- ── Collection — items list ── -->
      <template v-else-if="section.type === 'collection' && !editingItem">
        <div class="flex flex-col gap-1">
          <BaseItem
            v-for="item in collectionItems"
            :key="item.id"
            :title="item.title"
            :description="item.description || undefined"
            action="Edit"
            clickable
            @click="openEditItem(item)"
            @action="openEditItem(item)"
          />
        </div>
        <BaseItem :icon="CurrencyDollarIcon" title="Monetize collection" description="Charge users for access" action="Setup" @action="openMonetize" />
      </template>

      <!-- ── Store — items list ── -->
      <template v-else-if="section.type === 'store' && !editingStoreItem">
        <div class="flex flex-col gap-1">
          <BaseItem
            v-for="item in storeItems"
            :key="item.id"
            :title="item.title"
            :description="item.price > 0 ? `$${item.price.toFixed(2)}` : 'No price set'"
            action="Edit"
            clickable
            @click="openEditStoreItem(item)"
            @action="openEditStoreItem(item)"
          />
        </div>
      </template>

      <!-- ── Store — item edit form ── -->
      <template v-else-if="section.type === 'store' && editingStoreItem">
        <BaseInput size="sm" label="Title" v-model="storeEditTitle" />
        <BaseInput size="sm" label="Description" v-model="storeEditDescription" />
        <BaseUpload type="image" size="sm" label="Image" v-model="storeEditImage" />
        <BaseInput size="sm" label="Price" v-model="storeEditPrice" placeholder="0.00" />

        <!-- Product type -->
        <div class="flex gap-1">
          <button
            v-for="opt in [{ value: 'physical', label: 'Physical' }, { value: 'digital', label: 'Digital' }]"
            :key="opt.value"
            type="button"
            class="flex-1 py-1.5 text-xs rounded-lg border transition-colors"
            :class="storeEditProductType === opt.value
              ? 'border-gray-900 bg-gray-900 text-white'
              : 'border-gray-200 text-gray-600 hover:border-gray-400'"
            @click="storeEditProductType = opt.value as 'physical' | 'digital'"
          >
            {{ opt.label }}
          </button>
        </div>
        <!-- Physical: variants + inventory -->
        <template v-if="storeEditProductType === 'physical'">
          <div class="flex flex-col gap-2 pt-1 border-t border-gray-100">
            <div class="flex items-center justify-between">
              <p class="text-xs font-medium text-gray-500">Variants</p>
              <button class="text-xs text-gray-400 hover:text-gray-700" @click="addStoreVariant">+ Add</button>
            </div>
            <div v-for="(variant, vi) in storeEditVariants" :key="variant.id" class="flex flex-col gap-2 p-3 rounded-xl border border-gray-200">
              <div class="flex items-center gap-2">
                <BaseInput size="sm" label="Name" v-model="variant.name" placeholder="e.g. Size" class="flex-1" />
                <button class="text-gray-400 hover:text-red-500 mt-4 shrink-0" @click="removeStoreVariant(vi)">
                  <TrashIcon class="h-3.5 w-3.5" />
                </button>
              </div>
              <div v-for="(opt, oi) in variant.options" :key="oi" class="flex items-center gap-2">
                <input
                  v-model="opt.value"
                  type="text"
                  placeholder="Option"
                  class="flex-1 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-gray-400"
                />
                <input
                  v-model.number="opt.inventory"
                  type="number"
                  min="0"
                  placeholder="Qty"
                  class="w-16 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-gray-400"
                />
                <button class="text-gray-400 hover:text-red-500 shrink-0" @click="removeStoreVariantOption(vi, oi)">
                  <TrashIcon class="h-3.5 w-3.5" />
                </button>
              </div>
              <button class="text-xs text-gray-400 hover:text-gray-700 text-left" @click="addStoreVariantOption(vi)">+ Add option</button>
            </div>
          </div>
          <div class="pt-1 border-t border-gray-100">
            <BaseInput size="sm" label="Inventory total" v-model="storeEditInventory" placeholder="0" />
          </div>
        </template>

        <!-- Digital: file upload only -->
        <BaseUpload v-if="storeEditProductType === 'digital'" type="file" size="sm" label="File" v-model="storeEditFileUrl" />

        <div class="pt-1 border-t border-gray-100">
          <BaseButton variant="remove" size="sm" class="w-full" @click="deleteStoreItem(section.id, store!.id, editingStoreItem.id); closeEditStoreItem()">Delete item</BaseButton>
        </div>
      </template>

      <!-- ── Footer ── -->
      <template v-else-if="section.type === 'footer'">
        <BaseUpload type="image" size="sm" label="Cover image" v-model="footerCoverMediaValue" @update:modelValue="saveFooterSettings" />
        <BaseInput size="sm" label="Title" v-model="footerTitle" @update:modelValue="saveFooterContent" />
        <BaseInput size="sm" label="Subtitle" v-model="footerSubtitle" @update:modelValue="saveFooterContent" />
      </template>

      <!-- ── Campaign ── -->
      <template v-else-if="section.type === 'campaign'">
        <BaseInput size="sm" label="Title" v-model="campaignTitle" @update:modelValue="saveCampaignContent" />
        <BaseInput size="sm" label="Description" v-model="campaignDescription" @update:modelValue="saveCampaignContent" />
        <BaseInput size="sm" label="Button label" v-model="campaignButtonLabel" @update:modelValue="saveCampaignContent" />
        <BaseInput size="sm" label="Email placeholder" v-model="campaignPlaceholder" @update:modelValue="saveCampaignContent" />
        <div class="border-t border-gray-100 pt-3">
          <BaseToggle size="sm" label="Name field" description="Add a name field above the email" v-model="campaignShowNameField" @update:modelValue="saveCampaignSettings" />
        </div>
      </template>

      <!-- ── Collection — item edit form ── -->
      <template v-else-if="section.type === 'collection' && editingItem">
        <BaseInput size="sm" label="Title" v-model="editTitle" />
        <BaseInput size="sm" label="Description" v-model="editDescription" />
        <BaseUpload type="image" size="sm" label="Image" v-model="editCollectionMediaUrl" />

        <BaseToggle size="sm" label="Redirect to URL" v-model="editRedirectEnabled" @update:modelValue="(v) => { if (!v) editExternalUrl = '' }">
          <BaseInput size="sm" label="URL" v-model="editExternalUrl" placeholder="https://..." />
        </BaseToggle>
        <BaseItem v-if="!editRedirectEnabled" :icon="DocumentTextIcon" title="Content" :description="editContent ? 'Has content' : 'Add rich text, images and more'" action="Edit" @action="showContentEditor = true" />

        <CollectionItemContentModal
          v-if="showContentEditor"
          v-model="editContent"
          @close="showContentEditor = false"
        />

        <div class="pt-1 border-t border-gray-100">
          <BaseButton variant="remove" size="sm" class="w-full" @click="deleteItem(editingItem); closeEditItem()">Delete item</BaseButton>
        </div>
      </template>

    </div>
  </Transition>
  </div>
</template>
