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
import type { ListItem } from '@/features/sections/types/links'
import { useLinksActions } from '@/features/editor/composables/useLinksActions'
import { useSectionSnapshot } from '@/features/editor/composables/useSectionSnapshot'
import { useThemePreset } from '@/features/theme/composables/useThemePreset'
import { sortByPosition, generateReorderPosition } from '@/shared/lib/position'

const props = defineProps<{ section: Section }>()
const emit = defineEmits<{ 'editing-change': [isEditing: boolean] }>()

const { isStructureTheme } = useThemePreset()

const { addLinksItem: addLinksItemAction, updateLinksItem, deleteLinksItem, reorderLinksItem } = useLinksActions()
const { capture: captureSubItem, restore: restoreSubItem } = useSectionSnapshot(() => props.section)
const { contentField } = useSectionForm(() => props.section)

const listSectionTitle = contentField('title', '')
const listSectionDescription = contentField('description', '')

watch(() => props.section.id, closeEditItem)

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
  reorderLinksItem(props.section.id, moved.id, generateReorderPosition(listItems.value, oldIndex, newIndex))
}

function handleDelete(node: TreeNode) {
  deleteLinksItem(props.section.id, node.id)
}

function handleDuplicate(node: TreeNode) {
  const item = listItems.value.find((i) => i.id === node.id)
  if (!item) return
  addLinksItemAction(props.section.id, { title: item.title, subtitle: item.subtitle, url: item.url, description: item.description, icon: item.icon })
}

function handleSettings(node: TreeNode) {
  const item = listItems.value.find((i) => i.id === node.id)
  if (item) openEditItem(item)
}

// ─── Sub-item editing ───
const editingItem = ref<ListItem | null>(null)
const editTitle = ref('')
const editSubtitle = ref('')
const editUrl = ref('')
const editDescription = ref('')
const editIcon = ref('')
const editIconType = ref<'image' | 'lucide' | 'none'>('none')
const editIconName = ref('')

function openEditItem(item: ListItem) {
  captureSubItem()
  editingItem.value = item
  editTitle.value = item.title
  editSubtitle.value = item.subtitle
  editUrl.value = item.url
  editDescription.value = item.description
  editIcon.value = item.icon
  editIconType.value = item.icon_type ?? 'none'
  editIconName.value = item.icon_name ?? ''
  emit('editing-change', true)
}

function closeEditItem() {
  editingItem.value = null
  emit('editing-change', false)
}

function syncItem() {
  if (!editingItem.value) return
  updateLinksItem(props.section.id, editingItem.value.id, {
    title: editTitle.value,
    subtitle: editSubtitle.value,
    url: editUrl.value,
    description: editDescription.value,
    icon: editIcon.value,
    icon_type: editIconType.value,
    icon_name: editIconName.value,
  })
}

function cancelSubItem() {
  restoreSubItem()
  closeEditItem()
}

function saveSubItem() {
  closeEditItem()
}

function addLinksItem() {
  captureSubItem()
  const newItem = addLinksItemAction(props.section.id, { title: 'New item', subtitle: '', url: 'https://', description: '', icon: '' })
  if (newItem) {
    editingItem.value = newItem
    editTitle.value = newItem.title
    editSubtitle.value = newItem.subtitle
    editUrl.value = newItem.url
    editDescription.value = newItem.description
    editIcon.value = newItem.icon
    editIconType.value = newItem.icon_type ?? 'none'
    editIconName.value = newItem.icon_name ?? ''
    emit('editing-change', true)
  }
}

defineExpose({ addLinksItem, cancelSubItem, saveSubItem })
</script>

<template>
  <Transition :name="editingItem ? 'modal-forward' : 'modal-back'" mode="out-in">

    <!-- Item list view -->
    <div v-if="!editingItem" key="links" class="flex flex-col gap-4 p-2 pr-0">
      <BaseInput size="sm" label="Title" v-model="listSectionTitle" placeholder="My Items" />
      <BaseInput size="sm" type="textarea" label="Description" v-model="listSectionDescription" placeholder="Add a short description…" />
      <div class="flex flex-col gap-2">
        <span class="text-xs font-medium text-gray-500">Links</span>
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
      <BaseButton variant="outline" size="sm" class="w-full" @click="addLinksItem">+ Add item</BaseButton>
    </div>

    <!-- Item edit form -->
    <div v-else key="edit" class="flex flex-col gap-4 p-2 pr-0">
      <BaseIconPicker
        :icon-type="editIconType"
        :icon-name="editIconName"
        :image-url="editIcon"
        @update:iconType="editIconType = $event; syncItem()"
        @update:iconName="editIconName = $event; syncItem()"
        @update:imageUrl="editIcon = $event; syncItem()"
      />
      <BaseInput size="sm" label="Title" v-model="editTitle" @update:modelValue="syncItem" />
      <BaseInput size="sm" label="Subtitle" v-model="editSubtitle" @update:modelValue="syncItem" />
      <BaseInput size="sm" label="URL" v-model="editUrl" placeholder="https://..." @update:modelValue="syncItem" />
      <BaseInput v-if="!isStructureTheme" size="sm" type="textarea" label="Description" v-model="editDescription" @update:modelValue="syncItem" />
    </div>

  </Transition>
</template>
