<script setup lang="ts">
import { ref, watch } from 'vue'
import { PlusIcon, TrashIcon, DocumentTextIcon } from '@heroicons/vue/24/outline'
import BaseInput from '@/shared/ui/BaseInput.vue'
import BaseButton from '@/shared/ui/BaseButton.vue'
import BaseItem from '@/shared/ui/BaseItem.vue'
import BaseLinkPicker from '@/shared/ui/BaseLinkPicker.vue'
import CollectionItemContentSettings from '../CollectionItemContentSettings.vue'
import type { FooterSection, ContentMediaButton } from '@/features/sections/types'
import { useSectionForm } from '@/features/editor/composables/useSectionForm'

const props = defineProps<{ section: FooterSection }>()

const { contentField, patchContent } = useSectionForm(() => props.section)

const footerDescription = contentField('description', '')
const footerPrivacyPolicy = contentField('privacy_policy', '')
const footerTermsConditions = contentField('terms_conditions', '')
const footerButtons = ref<ContentMediaButton[]>([])
const showPrivacyEditor = ref(false)
const showTermsEditor = ref(false)

function syncButtons() {
  footerButtons.value = props.section.content?.buttons ? [...props.section.content.buttons] : []
}
syncButtons()
watch(() => props.section.id, syncButtons)

function saveButtons() {
  patchContent({ buttons: footerButtons.value })
}

function addLink() {
  if (footerButtons.value.length >= 6) return
  footerButtons.value.push({ id: crypto.randomUUID(), label: 'Button', url: '' })
  saveButtons()
}

function removeLink(id: string) {
  footerButtons.value = footerButtons.value.filter((b) => b.id !== id)
  saveButtons()
}
</script>

<template>
  <div class="flex flex-col gap-4 p-2 pr-0">
    <BaseInput size="sm" type="textarea" label="Description" v-model="footerDescription" placeholder="A short description…" />
    <div class="flex flex-col gap-2">
      <div class="flex justify-between items-center">
        <p class="text-xs font-medium text-gray-500">Links</p>
        <BaseButton v-if="footerButtons.length < 6" variant="outline" size="xs" @click="addLink">
          <PlusIcon class="h-3 w-3" /> Add link
        </BaseButton>
      </div>
      <p v-if="!footerButtons.length" class="text-xs text-gray-400">No links added</p>
      <div v-for="btn in footerButtons" :key="btn.id" class="flex items-center gap-1">
        <BaseLinkPicker v-model:label="btn.label" v-model:url="btn.url" @update:label="saveButtons" @update:url="saveButtons" />
        <button class="text-gray-400 hover:text-red-500 shrink-0" @click="removeLink(btn.id)">
          <TrashIcon class="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
    <div class="flex flex-col gap-2">
      <p class="text-xs font-medium text-gray-500">Content</p>
      <BaseItem :icon="DocumentTextIcon" title="Privacy Policy" :description="footerPrivacyPolicy ? 'Has content' : 'Add your privacy policy'" action="Edit" @action="showPrivacyEditor = true" />
      <BaseItem :icon="DocumentTextIcon" title="Terms & Conditions" :description="footerTermsConditions ? 'Has content' : 'Add your terms'" action="Edit" @action="showTermsEditor = true" />
    </div>
    <CollectionItemContentSettings v-if="showPrivacyEditor" v-model="footerPrivacyPolicy" title="Privacy Policy" @close="showPrivacyEditor = false" />
    <CollectionItemContentSettings v-if="showTermsEditor" v-model="footerTermsConditions" title="Terms & Conditions" @close="showTermsEditor = false" />
  </div>
</template>
