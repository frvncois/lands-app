<script setup lang="ts">
import { ref, computed } from 'vue'
import { RectangleStackIcon } from '@heroicons/vue/24/outline'
import BaseInput from '../../ui/BaseInput.vue'
import BaseButton from '../../ui/BaseButton.vue'
import BaseTree from '../../ui/BaseTree.vue'
import type { TreeNode } from '../../ui/BaseTree.vue'
import ItemEditorSettings from './ItemEditorSettings.vue'
import type { Section } from '@/types/section'
import type { CollectionItem, Collection } from '@/types/collection'
import { useEditorActions } from '@/composables/useEditorActions'
import { useThemePreset } from '@/composables/useThemePreset'
import { sortByPosition, generateReorderPosition } from '@/lib/utils/position'

const props = defineProps<{ section: Section }>()

const { isMinimalTheme } = useThemePreset()

const { updateCollection, addCollectionItem, deleteCollectionItem, reorderCollectionItem } = useEditorActions()

const collection = computed(() => ((props.section.content as any)?.collections?.[0] ?? null) as Collection | null)
const collectionItems = computed(() => collection.value ? sortByPosition(collection.value.items) : [])

const collectionTitle = computed({
  get: () => collection.value?.title ?? '',
  set: (v: string) => { if (collection.value) updateCollection(props.section.id, collection.value.id, { title: v }) },
})

const collectionDescription = computed({
  get: () => collection.value?.description ?? '',
  set: (v: string) => { if (collection.value) updateCollection(props.section.id, collection.value.id, { description: v }) },
})

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
    <BaseInput size="sm" label="Title" v-model="collectionTitle" placeholder="My Collection" />
    <BaseInput v-if="isMinimalTheme" size="sm" type="textarea" label="Description" v-model="collectionDescription" placeholder="A short description…" />
    <div class="flex flex-col gap-2">
      <span class="text-xs font-medium text-gray-500">Collection items</span>
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
  </div>
  <ItemEditorSettings
    v-if="itemEditorCollectionItem && collection"
    type="collection"
    :item="itemEditorCollectionItem"
    :section-id="section.id"
    :collection-id="collection.id"
    @close="itemEditorCollectionItem = null"
  />
</template>
