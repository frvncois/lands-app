<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { PlusIcon, TrashIcon, ArrowLeftIcon, DocumentTextIcon, ListBulletIcon, RectangleStackIcon, ShoppingBagIcon, CreditCardIcon, PuzzlePieceIcon } from '@heroicons/vue/24/outline'

import BaseInput from '../ui/BaseInput.vue'
import BaseToggle from '../ui/BaseToggle.vue'
import BaseButton from '../ui/BaseButton.vue'
import BaseUpload from '../ui/BaseUpload.vue'
import BaseItem from '../ui/BaseItem.vue'
import BaseCard from '../ui/BaseCard.vue'
import BaseTree from '../ui/BaseTree.vue'
import type { TreeNode } from '../ui/BaseTree.vue'
import CollectionItemContentModal from './CollectionItemContentModal.vue'
import SetupCampaignModal from './SetupCampaignModal.vue'
import type { Section, HeaderContent, HeaderSettings, ContentMediaContent, ContentMediaButton, CampaignContent, CampaignSettings, FooterContent, FooterSettings } from '@/types/section'
import type { CollectionItem, Collection } from '@/types/collection'
import type { Store, StoreItem } from '@/types/store'
import type { ListItem } from '@/types/list'
import { useEditorActions } from '@/composables/useEditorActions'
import { useLandStore } from '@/stores/land'
import { useAppModals } from '@/stores/appModals'
import { useCampaignStore } from '@/stores/campaign'
import { sortByPosition, generatePositionBefore, generatePositionAfter, generatePositionBetween } from '@/lib/utils/position'
import { sectionPrimitives } from '@/sections/index'

const sectionLabelMap = Object.fromEntries(sectionPrimitives.map((p) => [p.id, p.label]))
const landStore = useLandStore()
const appModals = useAppModals()
const campaignStore = useCampaignStore()

const props = defineProps<{ section: Section; hideHeader?: boolean }>()
const emit = defineEmits<{ close: [], 'editing-change': [isEditing: boolean] }>()

const {
  updateSectionContent, updateSectionSettings, restoreSectionSnapshot,
  addListItem, updateListItem, deleteListItem, reorderListItem,
  updateCollection, addCollectionItem, updateCollectionItem, deleteCollectionItem, reorderCollectionItem,
  updateStore, addStoreItem, updateStoreItem, deleteStoreItem, reorderStoreItem,
} = useEditorActions()

// ─── Header ───
const headerTitle = ref('')
const headerSubtitle = ref('')
const headerCoverMediaValue = ref('')
const headerLogoUrl = ref('')
function saveHeaderContent() {
  updateSectionContent(props.section.id, {
    title: headerTitle.value,
    subtitle: headerSubtitle.value,
    logo: headerLogoUrl.value,
  })
}

function saveHeaderSettings() {
  updateSectionSettings(props.section.id, {
    cover_media_value: headerCoverMediaValue.value,
  })
}

// ─── Content + Media ───
const cmMediaType = ref<'image' | 'video'>('image')
const cmMediaUrl = ref('')
const cmTitle = ref('')
const cmSubtitle = ref('')
const cmBody = ref('')
const cmButtons = ref<ContentMediaButton[]>([])

function saveCm() {
  updateSectionContent(props.section.id, {
    media_type: cmMediaType.value,
    media_url: cmMediaUrl.value,
    title: cmTitle.value,
    subtitle: cmSubtitle.value,
    body: cmBody.value,
    buttons: cmButtons.value,
  })
}

function addCmButton() {
  cmButtons.value.push({ id: crypto.randomUUID(), label: 'Button', url: '' })
  saveCm()
}

function removeCmButton(id: string) {
  cmButtons.value = cmButtons.value.filter((b) => b.id !== id)
  saveCm()
}

// ─── List ───
const listSectionTitle = ref('')
function saveListSectionTitle() {
  updateSectionContent(props.section.id, { title: listSectionTitle.value })
}

const listItems = computed(() => sortByPosition(((props.section.content as any)?.items ?? []) as ListItem[]))

const listTreeNodes = computed<TreeNode[]>(() =>
  listItems.value.map((item) => ({
    id: item.id,
    label: item.title,
    icon: DocumentTextIcon,
  }))
)

function handleListReorder(oldIndex: number, newIndex: number) {
  if (oldIndex === newIndex) return
  const items = listItems.value
  const moved = items[oldIndex]
  if (!moved) return
  const remaining = items.filter((_, i) => i !== oldIndex)
  const prevPos = remaining[newIndex - 1]?.position ?? null
  const nextPos = remaining[newIndex]?.position ?? null
  const newPosition = prevPos === null
    ? generatePositionBefore(nextPos)
    : nextPos === null
      ? generatePositionAfter(prevPos)
      : generatePositionBetween(prevPos, nextPos)
  reorderListItem(props.section.id, moved.id, newPosition)
}

function handleListDelete(node: TreeNode) {
  deleteListItem(props.section.id, node.id)
}

function handleListDuplicate(node: TreeNode) {
  const item = listItems.value.find((i) => i.id === node.id)
  if (!item) return
  addListItem(props.section.id, { title: item.title, subtitle: item.subtitle, url: item.url, description: item.description, icon: item.icon })
}

function handleListSettings(node: TreeNode) {
  const item = listItems.value.find((i) => i.id === node.id)
  if (item) openEditListItem(item)
}

const editingListItem = ref<ListItem | null>(null)
const editListTitle = ref('')
const editListSubtitle = ref('')
const editListUrl = ref('')
const editListDescription = ref('')
const editListIcon = ref('')

function openEditListItem(item: ListItem) {
  takeSubItemSnapshot()
  editingListItem.value = item
  editListTitle.value = item.title
  editListSubtitle.value = item.subtitle
  editListUrl.value = item.url
  editListDescription.value = item.description
  editListIcon.value = item.icon
}

function closeEditListItem() {
  editingListItem.value = null
}

function syncListItem() {
  if (!editingListItem.value) return
  updateListItem(props.section.id, editingListItem.value.id, {
    title: editListTitle.value,
    subtitle: editListSubtitle.value,
    url: editListUrl.value,
    description: editListDescription.value,
    icon: editListIcon.value,
  })
}

// ─── Collection ───
const collectionTitle = ref('')
function saveCollectionTitle() {
  if (!collection.value) return
  updateCollection(props.section.id, collection.value.id, { title: collectionTitle.value })
}

const collection = computed(() => ((props.section.content as any)?.collections?.[0] ?? null) as Collection | null)
const collectionItems = computed(() => collection.value ? sortByPosition(collection.value.items) : [])

const collectionTreeNodes = computed<TreeNode[]>(() =>
  collectionItems.value.map((item) => ({
    id: item.id,
    label: item.title,
    icon: RectangleStackIcon,
  }))
)

function handleCollectionReorder(oldIndex: number, newIndex: number) {
  if (oldIndex === newIndex || !collection.value) return
  const items = collectionItems.value
  const moved = items[oldIndex]
  if (!moved) return
  const remaining = items.filter((_, i) => i !== oldIndex)
  const prevPos = remaining[newIndex - 1]?.position ?? null
  const nextPos = remaining[newIndex]?.position ?? null
  const newPosition = prevPos === null
    ? generatePositionBefore(nextPos)
    : nextPos === null
      ? generatePositionAfter(prevPos)
      : generatePositionBetween(prevPos, nextPos)
  reorderCollectionItem(props.section.id, collection.value.id, moved.id, newPosition)
}

function handleCollectionDelete(node: TreeNode) {
  if (!collection.value) return
  deleteCollectionItem(props.section.id, collection.value.id, node.id)
}

function handleCollectionDuplicate(node: TreeNode) {
  const item = collectionItems.value.find((i) => i.id === node.id)
  if (item) duplicateItem(item)
}

function handleCollectionSettings(node: TreeNode) {
  const item = collectionItems.value.find((i) => i.id === node.id)
  if (item) openEditItem(item)
}

const editingItem = ref<CollectionItem | null>(null)
const editTitle = ref('')
const editSubtitle = ref('')
const editDescription = ref('')
const editCollectionMediaUrl = ref('')
const editContent = ref('')
const editExternalUrl = ref('')
const editRedirectEnabled = ref(false)
const showContentEditor = ref(false)
const showSetupCampaignModal = ref(false)

function openEditItem(item: CollectionItem) {
  takeSubItemSnapshot()
  editingItem.value = item
  editTitle.value = item.title
  editSubtitle.value = item.subtitle
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

function syncCollectionItem() {
  if (!editingItem.value || !collection.value) return
  updateCollectionItem(props.section.id, collection.value.id, editingItem.value.id, {
    title: editTitle.value,
    subtitle: editSubtitle.value,
    description: editDescription.value,
    media_url: editCollectionMediaUrl.value,
    content: editContent.value,
    external_url: editRedirectEnabled.value ? editExternalUrl.value : '',
  })
}

function duplicateItem(item: CollectionItem) {
  if (!collection.value) return
  addCollectionItem(props.section.id, collection.value.id, {
    title: item.title, subtitle: item.subtitle, description: item.description, media_url: item.media_url,
    content: item.content, external_url: item.external_url,
  })
}

function deleteItem(item: CollectionItem) {
  if (!collection.value) return
  deleteCollectionItem(props.section.id, collection.value.id, item.id)
}

function addItem() {
  if (!collection.value) return
  takeSubItemSnapshot()
  const newItem = addCollectionItem(props.section.id, collection.value.id, { title: 'New item', subtitle: '', description: '', media_url: '', content: '', external_url: '' })
  if (newItem) {
    editingItem.value = newItem
    editTitle.value = newItem.title
    editSubtitle.value = newItem.subtitle
    editDescription.value = newItem.description
    editCollectionMediaUrl.value = newItem.media_url
    editContent.value = newItem.content
    editExternalUrl.value = newItem.external_url
    editRedirectEnabled.value = false
  }
}

function addListItemAction() {
  takeSubItemSnapshot()
  const newItem = addListItem(props.section.id, { title: 'New item', subtitle: '', url: 'https://', description: '', icon: '' })
  if (newItem) {
    editingListItem.value = newItem
    editListTitle.value = newItem.title
    editListSubtitle.value = newItem.subtitle
    editListUrl.value = newItem.url
    editListDescription.value = newItem.description
    editListIcon.value = newItem.icon
  }
}

// ─── Store ───
const storeTitle = ref('')
function saveStoreTitle() {
  if (!store.value) return
  updateStore(props.section.id, store.value.id, { title: storeTitle.value })
}

const store = computed(() => ((props.section.content as any)?.stores?.[0] ?? null) as Store | null)
const storeItems = computed(() => store.value ? sortByPosition(store.value.items) : [])

const storeTreeNodes = computed<TreeNode[]>(() =>
  storeItems.value.map((item) => ({
    id: item.id,
    label: item.title,
    icon: ShoppingBagIcon,
  }))
)

function handleStoreReorder(oldIndex: number, newIndex: number) {
  if (oldIndex === newIndex || !store.value) return
  const items = storeItems.value
  const moved = items[oldIndex]
  if (!moved) return
  const remaining = items.filter((_, i) => i !== oldIndex)
  const prevPos = remaining[newIndex - 1]?.position ?? null
  const nextPos = remaining[newIndex]?.position ?? null
  const newPosition = prevPos === null
    ? generatePositionBefore(nextPos)
    : nextPos === null
      ? generatePositionAfter(prevPos)
      : generatePositionBetween(prevPos, nextPos)
  reorderStoreItem(props.section.id, store.value.id, moved.id, newPosition)
}

function handleStoreDelete(node: TreeNode) {
  if (!store.value) return
  deleteStoreItem(props.section.id, store.value.id, node.id)
}

function handleStoreDuplicate(node: TreeNode) {
  const item = storeItems.value.find((i) => i.id === node.id)
  if (!item || !store.value) return
  addStoreItem(props.section.id, store.value.id, {
    title: item.title, description: item.description, image: item.image,
    price: item.price, variants: JSON.parse(JSON.stringify(item.variants)),
    inventory: item.inventory, product_type: item.product_type, file_url: item.file_url,
  })
}

function handleStoreSettings(node: TreeNode) {
  const item = storeItems.value.find((i) => i.id === node.id)
  if (item) openEditStoreItem(item)
}

// ─── Monetize ───
const monetizePrice = ref('')
function saveMonetizePrice() {
  if (!collection.value) return
  updateCollection(props.section.id, collection.value.id, { price: parseFloat(monetizePrice.value) || 0 })
}

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
  takeSubItemSnapshot()
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

function syncStoreItem() {
  if (!editingStoreItem.value || !store.value) return
  if (editingStoreItem.value.type === 'membership') {
    updateStoreItem(props.section.id, store.value.id, editingStoreItem.value.id, {
      title: storeEditTitle.value,
      description: storeEditDescription.value,
      image: storeEditImage.value,
      file_url: storeEditFileUrl.value,
      product_type: 'digital',
      price: 0,
      inventory: 0,
      variants: [],
    })
  } else {
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
  }
}

function addStoreVariant() {
  storeEditVariants.value.push({ id: crypto.randomUUID(), name: '', options: [{ value: '', inventory: 0 }] })
  syncStoreItem()
}

function addStoreVariantOption(variantIndex: number) {
  storeEditVariants.value[variantIndex]?.options.push({ value: '', inventory: 0 })
  syncStoreItem()
}

function removeStoreVariantOption(variantIndex: number, optionIndex: number) {
  storeEditVariants.value[variantIndex]?.options.splice(optionIndex, 1)
  syncStoreItem()
}

function removeStoreVariant(index: number) {
  storeEditVariants.value.splice(index, 1)
  syncStoreItem()
}

function addStoreItemAction() {
  if (!store.value) return
  takeSubItemSnapshot()
  const newItem = addStoreItem(props.section.id, store.value.id, { title: 'New item', description: '', image: '', price: 0, variants: [], inventory: 0, product_type: 'physical', file_url: '' })
  if (newItem) {
    editingStoreItem.value = newItem
    storeEditTitle.value = newItem.title
    storeEditDescription.value = newItem.description
    storeEditImage.value = newItem.image
    storeEditPrice.value = ''
    storeEditProductType.value = newItem.product_type
    storeEditInventory.value = ''
    storeEditFileUrl.value = ''
    storeEditVariants.value = []
  }
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
}

const snapshot = ref<SectionSnapshot | null>(null)
const subItemSnapshot = ref<SectionSnapshot | null>(null)

function currentSnapshot(): SectionSnapshot {
  return {
    content: JSON.parse(JSON.stringify(props.section.content ?? {})),
    settings_json: JSON.parse(JSON.stringify(props.section.settings_json ?? {})),
    style_variant: props.section.style_variant,
  }
}

function takeSnapshot() {
  snapshot.value = currentSnapshot()
}

function takeSubItemSnapshot() {
  subItemSnapshot.value = currentSnapshot()
}

// ─── Sync ───
function syncFromSection() {
  if (props.section.type === 'list') {
    listSectionTitle.value = (props.section.content as any)?.title ?? ''
  }
  if (props.section.type === 'collection') {
    collectionTitle.value = (props.section.content as any)?.collections?.[0]?.title ?? ''
  }
  if (props.section.type === 'store') {
    const s = (props.section.content as any)?.stores?.[0] as Store | undefined
    storeTitle.value = s?.title ?? ''
  }
  if (props.section.type === 'monetize') {
    const c = (props.section.content as any)?.collections?.[0]
    collectionTitle.value = c?.title ?? ''
    monetizePrice.value = c?.price != null ? c.price.toString() : ''
  }
  if (props.section.type === 'header') {
    const c = props.section.content as HeaderContent | null
    const s = props.section.settings_json as HeaderSettings
    headerTitle.value = c?.title ?? ''
    headerSubtitle.value = c?.subtitle ?? ''
    headerLogoUrl.value = c?.logo ?? ''
    headerCoverMediaValue.value = s?.cover_media_value ?? ''
  }
  if (props.section.type === 'content_media') {
    const c = props.section.content as ContentMediaContent | null
    cmMediaType.value = c?.media_type ?? 'image'
    cmMediaUrl.value = c?.media_url ?? ''
    cmTitle.value = c?.title ?? ''
    cmSubtitle.value = c?.subtitle ?? ''
    cmBody.value = c?.body ?? ''
    cmButtons.value = c?.buttons ? JSON.parse(JSON.stringify(c.buttons)) : []
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
})

// ─── Save / Cancel ───
function handleSave() {
  emit('close')
}

function handleCancel() {
  if (snapshot.value) {
    restoreSectionSnapshot(props.section.id, snapshot.value)
  }
  emit('close')
}

// ─── Computed edit state ───
const isEditingSubItem = computed(() => !!(editingItem.value || editingListItem.value || editingStoreItem.value))

function closeSubItem() {
  if (subItemSnapshot.value) {
    restoreSectionSnapshot(props.section.id, subItemSnapshot.value)
  }
  subItemSnapshot.value = null
  if (editingItem.value) closeEditItem()
  else if (editingListItem.value) closeEditListItem()
  else if (editingStoreItem.value) closeEditStoreItem()
}

function saveSubItem() {
  // Data is already in store (real-time). Update global snapshot so "Back" doesn't revert this item.
  takeSnapshot()
  subItemSnapshot.value = null
  if (editingItem.value) closeEditItem()
  else if (editingListItem.value) closeEditListItem()
  else if (editingStoreItem.value) closeEditStoreItem()
}

watch(isEditingSubItem, (val) => emit('editing-change', val))

defineExpose({ handleSave, handleCancel, cancelSubItem: closeSubItem, saveSubItem, addItem, addListItem: addListItemAction, addStoreItem: addStoreItemAction })
</script>

<template>
  <!-- Panel header -->
  <div v-if="!props.hideHeader" class="flex items-center justify-between p-4 border-b border-gray-200">
    <div class="flex items-center gap-2">
      <button v-if="isEditingSubItem" class="text-gray-400 hover:text-gray-700" @click="closeSubItem">
        <ArrowLeftIcon class="h-4 w-4" />
      </button>
      <Transition name="modal-fade" mode="out-in">
        <h2 :key="isEditingSubItem ? 'edit' : section.type" class="text-sm font-semibold text-gray-900">
          {{ isEditingSubItem ? 'Edit item' : (sectionLabelMap[section.type] ?? section.type) }}
        </h2>
      </Transition>
    </div>
    <div class="flex items-center gap-1">
      <BaseButton variant="outline" size="xs" @click="handleCancel">Cancel</BaseButton>
      <BaseButton variant="solid" size="xs" @click="handleSave">Save</BaseButton>
    </div>
  </div>

  <div class="max-h-[70vh] overflow-y-auto overflow-x-hidden">
  <Transition :name="isEditingSubItem ? 'modal-forward' : 'modal-back'" mode="out-in">
  <div :key="isEditingSubItem ? 'edit' : 'list'" class="flex flex-col gap-2 p-2">

      <!-- ── Header ── -->
      <template v-if="section.type === 'header'">
        <div class="flex flex-col gap-4 p-2 pr-0">
          <BaseUpload type="image" size="sm" label="Logo" v-model="headerLogoUrl" @update:modelValue="saveHeaderContent" />
          <BaseUpload type="image" size="sm" label="Cover image" v-model="headerCoverMediaValue" @update:modelValue="saveHeaderSettings" />
          <BaseInput size="sm" label="Title" v-model="headerTitle" @update:modelValue="saveHeaderContent" />
          <BaseInput size="sm" label="Subtitle" v-model="headerSubtitle" @update:modelValue="saveHeaderContent" />
        </div>
      </template>

      <!-- ── Content + Media ── -->
      <template v-else-if="section.type === 'content_media'">
        <!-- Media type toggle -->
         
        <div class="flex flex-col gap-4 p-2 pr-0">
          <div class="flex gap-2">
            <button
              v-for="opt in [{ value: 'image', label: 'Image' }, { value: 'video', label: 'Video' }]"
              :key="opt.value"
              class="flex-1 py-1 text-xs rounded-lg border transition-colors"
              :class="cmMediaType === opt.value
                ? 'border-gray-900 bg-gray-900 text-white'
                : 'border-gray-200 text-gray-600 hover:border-gray-400'"
              @click="cmMediaType = opt.value as 'image' | 'video'; saveCm()"
            >
              {{ opt.label }}
            </button>
          </div>
          <BaseUpload v-if="cmMediaType === 'image'" type="image" size="sm" v-model="cmMediaUrl" @update:modelValue="saveCm" />
          <BaseInput v-else size="sm" label="Video URL" v-model="cmMediaUrl" placeholder="YouTube or Vimeo URL" @update:modelValue="saveCm" />
          <BaseInput size="sm" label="Title" v-model="cmTitle" placeholder="Your headline" @update:modelValue="saveCm" />
          <BaseInput size="sm" label="Subtitle" v-model="cmSubtitle" placeholder="Eyebrow text" @update:modelValue="saveCm" />
          <BaseInput size="sm" type="textarea" label="Body" v-model="cmBody" placeholder="Supporting text" @update:modelValue="saveCm" />
          <div class="flex flex-col gap-2">
            <div class="flex justify-between">
              <p class="text-xs font-medium text-gray-500">Links</p>
              <button
                class="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800"
                @click="addCmButton"
              >
                <PlusIcon class="h-3.5 w-3.5" /> Add link
              </button>
            </div>
            <div class="flex flex-col gap-2">
              <p v-if="!cmButtons.length" class="text-xs text-gray-400">No links added</p>
              <div v-for="btn in cmButtons" :key="btn.id" class="flex items-center gap-1">
                <BaseInput size="sm" label="" v-model="btn.label" placeholder="Label" class="flex-1" @update:modelValue="saveCm" />
                <BaseInput size="sm" label="" v-model="btn.url" placeholder="https://..." class="flex-1" @update:modelValue="saveCm" />
                <button class="text-gray-400 hover:text-red-500 shrink-0" @click="removeCmButton(btn.id)">
                  <TrashIcon class="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- ── List — items list ── -->
      <template v-else-if="section.type === 'list' && !editingListItem">
        <div class="flex flex-col gap-4 p-2 pr-0">
          <BaseInput size="sm" label="Section title" v-model="listSectionTitle" placeholder="My Items" @update:modelValue="saveListSectionTitle" />
          <div class="flex flex-col gap-2">
            <span class="text-xs font-medium text-gray-500">List items</span>
            <div v-if="listItems.length === 0" class="flex flex-col gap-4 p-8 bg-gray-50 items-center rounded-xl">
              <p class="text-xs text-gray-300">No items yet</p>
            </div>
            <BaseTree
              v-else
              :nodes="listTreeNodes"
              @settings="handleListSettings"
              @delete="handleListDelete"
              @duplicate="handleListDuplicate"
              @reorder="handleListReorder"
            />
          </div>
            <BaseButton variant="outline" size="sm" class="w-full" @click="addListItemAction">+ Add item</BaseButton>
        </div>
      </template>

      <!-- ── List — item edit form ── -->
      <template v-else-if="section.type === 'list' && editingListItem">
        <div class="flex flex-col gap-4 p-2 pr-0">
          <BaseInput size="sm" label="Title" v-model="editListTitle" @update:modelValue="syncListItem" />
          <BaseInput size="sm" label="Subtitle" v-model="editListSubtitle" @update:modelValue="syncListItem" />
          <BaseInput size="sm" label="URL" v-model="editListUrl" placeholder="https://..." @update:modelValue="syncListItem" />
          <BaseInput size="sm" type="textarea" label="Description" v-model="editListDescription" @update:modelValue="syncListItem" />
        </div>
      </template>

      <!-- ── Collection — items list ── -->
      <template v-else-if="section.type === 'collection' && !editingItem">
        
        <div class="flex flex-col gap-4 p-2 pr-0">
        <BaseInput size="sm" label="Collection title" v-model="collectionTitle" placeholder="My Collection" @update:modelValue="saveCollectionTitle" />
        <div class="flex flex-col gap-2">
          <span class="text-xs font-medium text-gray-500">Collection items</span>
          <div v-if="collectionItems.length === 0" class="flex flex-col gap-4 p-8 bg-gray-50 items-center rounded-xl">
            <p class="text-xs text-gray-400">No items yet</p>
          </div>
          <BaseTree
            v-else
            :nodes="collectionTreeNodes"
            @settings="handleCollectionSettings"
            @delete="handleCollectionDelete"
            @duplicate="handleCollectionDuplicate"
            @reorder="handleCollectionReorder"
          />
          </div>
          <BaseButton variant="outline" size="sm" class="w-full" @click="addItem">+ Add item</BaseButton>
        </div>
      </template>

            <!-- ── Collection — item edit form ── -->
      <template v-else-if="section.type === 'collection' && editingItem">
        <div class="flex flex-col gap-4 p-2 pr-0">
          <BaseUpload type="image" size="sm" label="Cover" v-model="editCollectionMediaUrl" @update:modelValue="syncCollectionItem" />
          <BaseInput size="sm" label="Title" v-model="editTitle" @update:modelValue="syncCollectionItem" />
          <BaseInput size="sm" label="Subtitle" v-model="editSubtitle" @update:modelValue="syncCollectionItem" />
          <BaseInput size="sm" type="textarea" label="Description" v-model="editDescription" @update:modelValue="syncCollectionItem" />
          <BaseToggle size="sm" label="Redirect to URL" v-model="editRedirectEnabled" @update:modelValue="(v) => { if (!v) editExternalUrl = ''; syncCollectionItem() }">
            <BaseInput size="sm" label="URL" v-model="editExternalUrl" placeholder="https://..." @update:modelValue="syncCollectionItem" />
          </BaseToggle>
          <BaseItem v-if="!editRedirectEnabled" :icon="DocumentTextIcon" title="Content" :description="editContent ? 'Has content' : 'Add rich text, images and more'" action="Edit" @action="showContentEditor = true" />
          <CollectionItemContentModal
            v-if="showContentEditor"
            v-model="editContent"
            @close="showContentEditor = false; syncCollectionItem()"
          />
        </div>
      </template>

      <!-- ── Store — items list ── -->
      <template v-else-if="section.type === 'store' && !editingStoreItem">
        <div class="flex flex-col gap-4 p-2 pr-0">
          <template v-if="landStore.isStripeConnected">
            <BaseInput size="sm" label="Title" v-model="storeTitle" placeholder="My Store" @update:modelValue="saveStoreTitle" />
            <div class="flex flex-col gap-2">
              <span class="text-xs font-medium text-gray-500">Products</span>
              <div v-if="storeItems.length === 0" class="flex flex-col gap-4 p-8 bg-gray-50 items-center rounded-xl">
                <p class="text-xs text-gray-400">No products yet</p>
              </div>
              <BaseTree
                v-else
                :nodes="storeTreeNodes"
                @settings="handleStoreSettings"
                @delete="handleStoreDelete"
                @duplicate="handleStoreDuplicate"
                @reorder="handleStoreReorder"
              />
            </div>
            <BaseButton variant="outline" size="sm" class="w-full" @click="addStoreItemAction">+ Add item</BaseButton>
          </template>
          <BaseCard :icon="ShoppingBagIcon" title="Store">
            <template v-if="!landStore.isStripeConnected && storeItems.length === 0">
              Sell your products directly from your landing page. Connect your Stripe account and start adding your products.
            </template>
            <template v-else-if="landStore.isStripeConnected && storeItems.length === 0">
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
              <BaseButton v-if="!landStore.isStripeConnected" size="sm" variant="solid" class="w-full justify-center" @click="appModals.openIntegrations('sell_monetize')">Connect your Stripe account</BaseButton>
              <BaseButton v-else size="sm" variant="outline" class="w-full justify-center" @click="appModals.openDashboardDetail('orders')">View orders</BaseButton>
            </template>
          </BaseCard>
        </div>
      </template>

      <!-- ── Monetize — items list ── -->
      <template v-else-if="section.type === 'monetize' && !editingItem">
        <div class="flex flex-col gap-4 p-2 pr-0">
          <template v-if="landStore.isStripeConnected">
            <BaseInput size="sm" label="Collection title" v-model="collectionTitle" placeholder="Exclusive Content" @update:modelValue="saveCollectionTitle" />
            <BaseInput size="sm" label="Price ($/month)" v-model="monetizePrice" placeholder="9.00" @update:modelValue="saveMonetizePrice" />
            <div class="flex flex-col gap-2">
              <span class="text-xs font-medium text-gray-500">Items</span>
              <div v-if="collectionItems.length === 0" class="flex flex-col gap-4 p-8 bg-gray-50 items-center rounded-xl">
                <p class="text-xs text-gray-400">No items yet</p>
              </div>
              <BaseTree
                v-else
                :nodes="collectionTreeNodes"
                @settings="handleCollectionSettings"
                @delete="handleCollectionDelete"
                @duplicate="handleCollectionDuplicate"
                @reorder="handleCollectionReorder"
              />
            </div>
            <BaseButton variant="outline" size="sm" class="w-full" @click="addItem">+ Add item</BaseButton>
          </template>
          <BaseCard :icon="CreditCardIcon" title="Monetize">
            <template v-if="!landStore.isStripeConnected && collectionItems.length === 0">
              Earn money by offering monthly subscriptions to your visitors to access the content of this collection. Connect your Stripe account and start adding exclusive content to this collection.
            </template>
            <template v-else-if="landStore.isStripeConnected && collectionItems.length === 0">
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
              <BaseButton v-if="!landStore.isStripeConnected" size="sm" variant="solid" class="w-full justify-center" @click="appModals.openIntegrations('sell_monetize')">Connect your Stripe account</BaseButton>
              <BaseButton v-else size="sm" variant="outline" class="w-full justify-center" @click="appModals.openDashboardDetail('monetize')">View details</BaseButton>
            </template>
          </BaseCard>
        </div>
      </template>

      <!-- ── Monetize — item edit form ── -->
      <template v-else-if="section.type === 'monetize' && editingItem">
        <div class="flex flex-col gap-4 p-2 pr-0">
          <BaseUpload type="image" size="sm" label="Cover" v-model="editCollectionMediaUrl" @update:modelValue="syncCollectionItem" />
          <BaseInput size="sm" label="Title" v-model="editTitle" @update:modelValue="syncCollectionItem" />
          <BaseInput size="sm" label="Subtitle" v-model="editSubtitle" @update:modelValue="syncCollectionItem" />
          <BaseInput size="sm" type="textarea" label="Description" v-model="editDescription" @update:modelValue="syncCollectionItem" />
          <BaseToggle size="sm" label="Redirect to URL" v-model="editRedirectEnabled" @update:modelValue="(v) => { if (!v) editExternalUrl = ''; syncCollectionItem() }">
            <BaseInput size="sm" label="URL" v-model="editExternalUrl" placeholder="https://..." @update:modelValue="syncCollectionItem" />
          </BaseToggle>
          <BaseItem v-if="!editRedirectEnabled" :icon="DocumentTextIcon" title="Content" :description="editContent ? 'Has content' : 'Add rich text, images and more'" action="Edit" @action="showContentEditor = true" />
          <CollectionItemContentModal v-if="showContentEditor" v-model="editContent" @close="showContentEditor = false; syncCollectionItem()" />
        </div>
      </template>


      <!-- ── Store — item edit form (product) ── -->
      <template v-else-if="section.type === 'store' && editingStoreItem">
        <div class="flex flex-col gap-4 p-2 pr-02">
        <BaseUpload type="image" size="sm" label="Cover" v-model="storeEditImage" @update:modelValue="syncStoreItem" />
        <BaseInput size="sm" label="Title" v-model="storeEditTitle" @update:modelValue="syncStoreItem" />
        <BaseInput size="sm" type="textarea" label="Description" v-model="storeEditDescription" @update:modelValue="syncStoreItem" />
        <BaseInput size="sm" label="Price" v-model="storeEditPrice" placeholder="0.00" @update:modelValue="syncStoreItem" />

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
            @click="storeEditProductType = opt.value as 'physical' | 'digital'; syncStoreItem()"
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
                <BaseInput size="sm" label="Name" v-model="variant.name" placeholder="e.g. Size" class="flex-1" @update:modelValue="syncStoreItem" />
                <button class="text-gray-400 hover:text-red-500 mt-4 shrink-0" @click="removeStoreVariant(vi)">
                  <TrashIcon class="h-3.5 w-3.5" />
                </button>
              </div>
              <div v-for="(opt, oi) in variant.options" :key="oi" class="flex items-center gap-2">
                <input v-model="opt.value" type="text" placeholder="Option" class="flex-1 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-gray-400" @input="syncStoreItem" />
                <input v-model.number="opt.inventory" type="number" min="0" placeholder="Qty" class="w-16 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-gray-400" @input="syncStoreItem" />
                <button class="text-gray-400 hover:text-red-500 shrink-0" @click="removeStoreVariantOption(vi, oi)">
                  <TrashIcon class="h-3.5 w-3.5" />
                </button>
              </div>
              <button class="text-xs text-gray-400 hover:text-gray-700 text-left" @click="addStoreVariantOption(vi)">+ Add option</button>
            </div>
          </div>
          <div class="pt-1 border-t border-gray-100">
            <BaseInput size="sm" label="Inventory total" v-model="storeEditInventory" placeholder="0" @update:modelValue="syncStoreItem" />
          </div>
        </template>

        <!-- Digital: file upload only -->
        <BaseUpload v-if="storeEditProductType === 'digital'" type="file" size="sm" label="File" v-model="storeEditFileUrl" @update:modelValue="syncStoreItem" />
        </div>
      </template>

      <!-- ── Footer ── -->
      <template v-else-if="section.type === 'footer'">
        <div class="flex flex-col gap-4 p-2 pr-0">
          <BaseUpload type="image" size="sm" label="Cover image" v-model="footerCoverMediaValue" @update:modelValue="saveFooterSettings" />
          <BaseInput size="sm" label="Title" v-model="footerTitle" @update:modelValue="saveFooterContent" />
          <BaseInput size="sm" label="Subtitle" v-model="footerSubtitle" @update:modelValue="saveFooterContent" />
        </div>
      </template>

      <!-- ── Campaign ── -->
      <template v-else-if="section.type === 'campaign'">
        <div class="flex flex-col gap-4 p-2 pr-0">
          <template v-if="campaignStore.isConnected">
            <BaseInput size="sm" label="Title" v-model="campaignTitle" @update:modelValue="saveCampaignContent" />
            <BaseInput size="sm" label="Description" v-model="campaignDescription" @update:modelValue="saveCampaignContent" />
            <BaseInput size="sm" label="Button label" v-model="campaignButtonLabel" @update:modelValue="saveCampaignContent" />
            <BaseInput size="sm" label="Email placeholder" v-model="campaignPlaceholder" @update:modelValue="saveCampaignContent" />
            <div class="border-t border-gray-100 pt-3">
              <BaseToggle size="sm" label="Name field" description="Add a name field above the email" v-model="campaignShowNameField" @update:modelValue="saveCampaignSettings" />
            </div>
          </template>
          <BaseCard :icon="PuzzlePieceIcon" title="Campaign">
            <template v-if="!campaignStore.isConnected">
              Grow your audience by integrating Mailchimp, FloDesk or Brevo.
            </template>
            <template v-else>
              <div class="grid grid-cols-2 gap-2">
                <div class="rounded-xl bg-white border border-gray-100 p-3 space-y-0.5">
                  <p class="text-xs text-gray-400">Subscribers</p>
                  <p class="text-xl font-semibold text-gray-900 leading-tight">0</p>
                  <p class="text-xs text-gray-400">total</p>
                </div>
                <div class="rounded-xl bg-white border border-gray-100 p-3 space-y-0.5">
                  <p class="text-xs text-gray-400">New</p>
                  <p class="text-xl font-semibold text-gray-900 leading-tight">0</p>
                  <p class="text-xs text-gray-400">this month</p>
                </div>
              </div>
            </template>
            <template #actions>
              <BaseButton v-if="!campaignStore.isConnected" size="sm" variant="solid" class="w-full justify-center" @click="showSetupCampaignModal = true">Set up Campaign</BaseButton>
              <BaseButton v-else size="sm" variant="outline" class="w-full justify-center" @click="appModals.openDashboardDetail('campaign')">View details</BaseButton>
            </template>
          </BaseCard>
        </div>
      </template>

    </div>
  </Transition>
  </div>

  <Teleport to="body">
    <Transition name="modal-center">
      <SetupCampaignModal v-if="showSetupCampaignModal" @close="showSetupCampaignModal = false" />
    </Transition>
  </Teleport>
</template>
