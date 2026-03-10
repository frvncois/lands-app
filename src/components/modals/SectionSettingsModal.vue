<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { PlusIcon, TrashIcon, PencilIcon, DocumentDuplicateIcon, ArrowLeftIcon, DocumentTextIcon } from '@heroicons/vue/24/outline'

import BaseInput from '../ui/BaseInput.vue'
import BaseToggle from '../ui/BaseToggle.vue'
import BaseButton from '../ui/BaseButton.vue'
import BaseUpload from '../ui/BaseUpload.vue'
import BaseItem from '../ui/BaseItem.vue'
import RichTextEditor from '../ui/RichTextEditor.vue'
import CollectionItemContentModal from './CollectionItemContentModal.vue'
import type { Section, HeaderContent, HeaderSettings, TextContent, MediaContent, ContentMediaContent, ContentMediaButton, CampaignContent, CampaignSettings, FooterContent, FooterSettings } from '@/types/section'
import type { CollectionItem, Collection } from '@/types/collection'
import type { Store, StoreItem } from '@/types/store'
import type { ListItem } from '@/types/list'
import { useEditorActions } from '@/composables/useEditorActions'
import { sortByPosition } from '@/lib/utils/position'
import { renderMarkdown } from '@/lib/utils/markdown'
import { sectionPrimitives } from '@/sections/index'

const sectionLabelMap = Object.fromEntries(sectionPrimitives.map((p) => [p.id, p.label]))

const props = defineProps<{ section: Section; hideHeader?: boolean }>()
const emit = defineEmits<{ close: [], 'editing-change': [isEditing: boolean] }>()

const {
  updateSectionContent, updateSectionSettings, restoreSectionSnapshot,
  addListItem, updateListItem, deleteListItem,
  updateCollection, addCollectionItem, updateCollectionItem, deleteCollectionItem,
  updateStore, addStoreItem, updateStoreItem, deleteStoreItem,
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
const mediaType = ref<'image' | 'video'>('image')
const mediaUrl = ref('')
const mediaCaption = ref('')

function saveMedia() {
  updateSectionContent(props.section.id, {
    media_type: mediaType.value,
    url: mediaUrl.value,
    caption: mediaCaption.value,
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

const listItems = computed(() => sortByPosition((props.section.content as any)?.items ?? []))

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
const collectionTitle = ref('')
function saveCollectionTitle() {
  if (!collection.value) return
  updateCollection(props.section.id, collection.value.id, { title: collectionTitle.value })
}

const collection = computed(() => ((props.section.content as any)?.collections?.[0] ?? null) as Collection | null)
const collectionItems = computed(() => collection.value ? sortByPosition(collection.value.items) : [])
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
const storeTitle = ref('')
function saveStoreTitle() {
  if (!store.value) return
  updateStore(props.section.id, store.value.id, { title: storeTitle.value })
}

const store = computed(() => ((props.section.content as any)?.stores?.[0] ?? null) as Store | null)
const storeItems = computed(() => store.value ? sortByPosition(store.value.items) : [])
const storeMode = ref<'products' | 'membership'>('products')
const storeMembershipPrice = ref('')

function saveStoreMode() {
  if (!store.value) return
  updateStore(props.section.id, store.value.id, { mode: storeMode.value })
}

function saveStoreMembershipPrice() {
  if (!store.value) return
  updateStore(props.section.id, store.value.id, { membership_price: parseFloat(storeMembershipPrice.value) || 0 })
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
}

const snapshot = ref<SectionSnapshot | null>(null)

function takeSnapshot() {
  snapshot.value = {
    content: JSON.parse(JSON.stringify(props.section.content ?? {})),
    settings_json: JSON.parse(JSON.stringify(props.section.settings_json ?? {})),
    style_variant: props.section.style_variant,
  }
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
    storeMode.value = s?.mode ?? 'products'
    storeMembershipPrice.value = s?.membership_price ? s.membership_price.toString() : ''
  }
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
  if (props.section.type === 'media') {
    const c = props.section.content as MediaContent | null
    mediaType.value = c?.media_type ?? 'image'
    mediaUrl.value = c?.url ?? ''
    mediaCaption.value = c?.caption ?? ''
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
  if (editingItem.value) closeEditItem()
  else if (editingListItem.value) closeEditListItem()
  else if (editingStoreItem.value) closeEditStoreItem()
}

function saveSubItem() {
  if (editingItem.value) saveItem()
  else if (editingListItem.value) saveListItem()
  else if (editingStoreItem.value) saveStoreItem()
}

watch(isEditingSubItem, (val) => emit('editing-change', val))

defineExpose({ handleSave, handleCancel, cancelSubItem: closeSubItem, saveSubItem, addItem, addStoreItem: addStoreItemAction })
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
  <div :key="isEditingSubItem ? 'edit' : 'list'" class="p-4 flex flex-col gap-3">

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

      <!-- ── Media ── -->
      <template v-else-if="section.type === 'media'">
        <div class="flex gap-1 pb-3 border-b border-gray-100">
          <button
            v-for="opt in [{ value: 'image', label: 'Image' }, { value: 'video', label: 'Video' }]"
            :key="opt.value"
            class="flex-1 py-1 text-xs rounded-lg border transition-colors"
            :class="mediaType === opt.value
              ? 'border-gray-900 bg-gray-900 text-white'
              : 'border-gray-200 text-gray-600 hover:border-gray-400'"
            @click="mediaType = opt.value as 'image' | 'video'; saveMedia()"
          >
            {{ opt.label }}
          </button>
        </div>
        <BaseUpload v-if="mediaType === 'image'" type="image" size="sm" label="Image" v-model="mediaUrl" @update:modelValue="saveMedia" />
        <BaseInput v-else size="sm" label="Video URL" v-model="mediaUrl" placeholder="YouTube or Vimeo URL" @update:modelValue="saveMedia" />
        <BaseInput size="sm" label="Caption" v-model="mediaCaption" placeholder="Optional caption" @update:modelValue="saveMedia" />
      </template>

      <!-- ── Content + Media ── -->
      <template v-else-if="section.type === 'content_media'">
        <!-- Media type toggle -->
        <div class="flex gap-1 pb-3 border-b border-gray-100">
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
        <BaseUpload v-if="cmMediaType === 'image'" type="image" size="sm" label="Image" v-model="cmMediaUrl" @update:modelValue="saveCm" />
        <BaseInput v-else size="sm" label="Video URL" v-model="cmMediaUrl" placeholder="YouTube or Vimeo URL" @update:modelValue="saveCm" />

        <div class="border-t border-gray-100 pt-3 flex flex-col gap-3">
          <BaseInput size="sm" label="Subtitle" v-model="cmSubtitle" placeholder="Eyebrow text" @update:modelValue="saveCm" />
          <BaseInput size="sm" label="Title" v-model="cmTitle" placeholder="Your headline" @update:modelValue="saveCm" />
          <BaseInput size="sm" label="Body" v-model="cmBody" placeholder="Supporting text" @update:modelValue="saveCm" />
        </div>

        <!-- Buttons -->
        <div class="border-t border-gray-100 pt-3 flex flex-col gap-2">
          <p class="text-xs font-medium text-gray-500">Buttons</p>
          <div v-for="btn in cmButtons" :key="btn.id" class="flex items-center gap-2">
            <BaseInput size="sm" v-model="btn.label" placeholder="Label" class="flex-1" @update:modelValue="saveCm" />
            <BaseInput size="sm" v-model="btn.url" placeholder="https://..." class="flex-1" @update:modelValue="saveCm" />
            <button class="text-gray-400 hover:text-red-500 shrink-0" @click="removeCmButton(btn.id)">
              <TrashIcon class="h-3.5 w-3.5" />
            </button>
          </div>
          <button
            class="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800"
            @click="addCmButton"
          >
            <PlusIcon class="h-3.5 w-3.5" /> Add button
          </button>
        </div>
      </template>

      <!-- ── List — items list ── -->
      <template v-else-if="section.type === 'list' && !editingListItem">
        <BaseInput size="sm" label="Section title" v-model="listSectionTitle" placeholder="My Links" @update:modelValue="saveListSectionTitle" />
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

      <!-- ── Collection — items list ── -->
      <template v-else-if="section.type === 'collection' && !editingItem">
        <BaseInput size="sm" label="Collection title" v-model="collectionTitle" placeholder="My Collection" @update:modelValue="saveCollectionTitle" />
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
      </template>

      <!-- ── Store — items list ── -->
      <template v-else-if="section.type === 'store' && !editingStoreItem">
        <BaseInput size="sm" label="Title" v-model="storeTitle" placeholder="My Store" @update:modelValue="saveStoreTitle" />

        <!-- Mode toggle -->
        <div class="flex gap-1">
          <button
            v-for="opt in [{ value: 'products', label: 'Products' }, { value: 'membership', label: 'Membership' }]"
            :key="opt.value"
            type="button"
            class="flex-1 py-1.5 text-xs rounded-lg border transition-colors"
            :class="storeMode === opt.value
              ? 'border-gray-900 bg-gray-900 text-white'
              : 'border-gray-200 text-gray-600 hover:border-gray-400'"
            @click="storeMode = opt.value as 'products' | 'membership'; saveStoreMode()"
          >
            {{ opt.label }}
          </button>
        </div>

        <!-- Membership price -->
        <BaseInput v-if="storeMode === 'membership'" size="sm" label="Monthly price" v-model="storeMembershipPrice" placeholder="0.00" @update:modelValue="saveStoreMembershipPrice" />

        <!-- Items list -->
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

      <!-- ── Store — item edit form (membership) ── -->
      <template v-else-if="section.type === 'store' && editingStoreItem && editingStoreItem.type === 'membership'">
        <BaseInput size="sm" label="Title" v-model="storeEditTitle" />
        <BaseInput size="sm" label="Description" v-model="storeEditDescription" />
        <BaseUpload type="image" size="sm" label="Image" v-model="storeEditImage" />
        <BaseUpload type="file" size="sm" label="File" v-model="storeEditFileUrl" />
        <div class="pt-1 border-t border-gray-100">
          <BaseButton variant="remove" size="sm" class="w-full" @click="deleteStoreItem(section.id, store!.id, editingStoreItem.id); closeEditStoreItem()">Delete item</BaseButton>
        </div>
      </template>

      <!-- ── Store — item edit form (product) ── -->
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
                <input v-model="opt.value" type="text" placeholder="Option" class="flex-1 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-gray-400" />
                <input v-model.number="opt.inventory" type="number" min="0" placeholder="Qty" class="w-16 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-gray-400" />
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
