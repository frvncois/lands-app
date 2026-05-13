<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useSectionForm } from '@/features/editor/composables/useSectionForm'
import { DocumentTextIcon } from '@heroicons/vue/24/outline'
import BaseInput from '@/shared/ui/BaseInput.vue'
import BaseButton from '@/shared/ui/BaseButton.vue'
import BaseTree from '@/shared/ui/BaseTree.vue'
import BaseIconPicker from '@/shared/ui/BaseIconPicker.vue'
import type { TreeNode } from '@/shared/ui/BaseTree.vue'
import type { Section } from '@/features/sections/types'
import type { ListItem } from '@/features/sections/types/list'
import { useListActions } from '@/features/editor/composables/useListActions'
import { useSectionSnapshot } from '@/features/editor/composables/useSectionSnapshot'
import { useThemePreset } from '@/features/theme/composables/useThemePreset'
import { sortByPosition, generateReorderPosition } from '@/shared/lib/position'

const props = defineProps<{ section: Section }>()
const emit = defineEmits<{ 'editing-change': [isEditing: boolean] }>()

const { isStructureTheme } = useThemePreset()

const { addListItem: addListItemAction, updateListItem, deleteListItem, reorderListItem } = useListActions()
const { capture: captureSubItem, restore: restoreSubItem } = useSectionSnapshot(() => props.section)
const { contentField } = useSectionForm(() => props.section)

const listSectionTitle = contentField('title', '')
const listSectionDescription = contentField('description', '')

watch(() => props.section.id, closeEditListItem)

const listItems = computed(() => sortByPosition(((props.section.content as any)?.items ?? []) as ListItem[]))

const listTreeNodes = computed<TreeNode[]>(() =>
  listItems.value.map((item) => ({
    id: item.id,
    label: item.title,
    icon: DocumentTextIcon,
  }))
)

function handleReorder(oldIndex: number, newIndex: number) {
  if (oldIndex === newIndex) return
  const moved = listItems.value[oldIndex]
  if (!moved) return
  reorderListItem(props.section.id, moved.id, generateReorderPosition(listItems.value, oldIndex, newIndex))
}

function handleDelete(node: TreeNode) {
  deleteListItem(props.section.id, node.id)
}

function handleDuplicate(node: TreeNode) {
  const item = listItems.value.find((i) => i.id === node.id)
  if (!item) return
  addListItemAction(props.section.id, { title: item.title, subtitle: item.subtitle, url: item.url, description: item.description, icon: item.icon })
}

function handleSettings(node: TreeNode) {
  const item = listItems.value.find((i) => i.id === node.id)
  if (item) openEditListItem(item)
}

// ─── Sub-item editing ───
const editingListItem = ref<ListItem | null>(null)
const editListTitle = ref('')
const editListSubtitle = ref('')
const editListUrl = ref('')
const editListDescription = ref('')
const editListIcon = ref('')
const editListIconType = ref<'image' | 'lucide' | 'none'>('none')
const editListIconName = ref('')

function openEditListItem(item: ListItem) {
  captureSubItem()
  editingListItem.value = item
  editListTitle.value = item.title
  editListSubtitle.value = item.subtitle
  editListUrl.value = item.url
  editListDescription.value = item.description
  editListIcon.value = item.icon
  editListIconType.value = item.icon_type ?? 'none'
  editListIconName.value = item.icon_name ?? ''
  emit('editing-change', true)
}

function closeEditListItem() {
  editingListItem.value = null
  emit('editing-change', false)
}

function syncListItem() {
  if (!editingListItem.value) return
  updateListItem(props.section.id, editingListItem.value.id, {
    title: editListTitle.value,
    subtitle: editListSubtitle.value,
    url: editListUrl.value,
    description: editListDescription.value,
    icon: editListIcon.value,
    icon_type: editListIconType.value,
    icon_name: editListIconName.value,
  })
}

function cancelSubItem() {
  restoreSubItem()
  closeEditListItem()
}

function saveSubItem() {
  closeEditListItem()
}

function addListItem() {
  captureSubItem()
  const newItem = addListItemAction(props.section.id, { title: 'New item', subtitle: '', url: 'https://', description: '', icon: '' })
  if (newItem) {
    editingListItem.value = newItem
    editListTitle.value = newItem.title
    editListSubtitle.value = newItem.subtitle
    editListUrl.value = newItem.url
    editListDescription.value = newItem.description
    editListIcon.value = newItem.icon
    editListIconType.value = newItem.icon_type ?? 'none'
    editListIconName.value = newItem.icon_name ?? ''
    emit('editing-change', true)
  }
}

defineExpose({ addListItem, cancelSubItem, saveSubItem })
</script>

<template>
  <Transition :name="editingListItem ? 'modal-forward' : 'modal-back'" mode="out-in">

    <!-- Item list view -->
    <div v-if="!editingListItem" key="list" class="flex flex-col gap-4 p-2 pr-0">
      <BaseInput size="sm" label="Title" v-model="listSectionTitle" placeholder="My Items" />
      <BaseInput size="sm" type="textarea" label="Description" v-model="listSectionDescription" placeholder="Add a short description…" />
      <div class="flex flex-col gap-2">
        <span class="text-xs font-medium text-gray-500">List items</span>
        <div v-if="listItems.length === 0" class="flex flex-col gap-4 p-8 bg-gray-50 items-center rounded-xl">
          <p class="text-xs text-gray-300">No items yet</p>
        </div>
        <BaseTree
          v-else
          :nodes="listTreeNodes"
          @settings="handleSettings"
          @delete="handleDelete"
          @duplicate="handleDuplicate"
          @reorder="handleReorder"
        />
      </div>
      <BaseButton variant="outline" size="sm" class="w-full" @click="addListItem">+ Add item</BaseButton>
    </div>

    <!-- Item edit form -->
    <div v-else key="edit" class="flex flex-col gap-4 p-2 pr-0">
      <BaseIconPicker
        :icon-type="editListIconType"
        :icon-name="editListIconName"
        :image-url="editListIcon"
        @update:iconType="editListIconType = $event; syncListItem()"
        @update:iconName="editListIconName = $event; syncListItem()"
        @update:imageUrl="editListIcon = $event; syncListItem()"
      />
      <BaseInput size="sm" label="Title" v-model="editListTitle" @update:modelValue="syncListItem" />
      <BaseInput size="sm" label="Subtitle" v-model="editListSubtitle" @update:modelValue="syncListItem" />
      <BaseInput size="sm" label="URL" v-model="editListUrl" placeholder="https://..." @update:modelValue="syncListItem" />
      <BaseInput v-if="!isStructureTheme" size="sm" type="textarea" label="Description" v-model="editListDescription" @update:modelValue="syncListItem" />
    </div>

  </Transition>
</template>
