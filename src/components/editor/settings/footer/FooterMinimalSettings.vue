<script setup lang="ts">
import { ref, watch } from 'vue'
import { PlusIcon, TrashIcon, DocumentTextIcon } from '@heroicons/vue/24/outline'
import BaseInput from '../../../ui/BaseInput.vue'
import BaseButton from '../../../ui/BaseButton.vue'
import BaseItem from '../../../ui/BaseItem.vue'
import BaseLinkPicker from '../../../ui/BaseLinkPicker.vue'
import CollectionItemContentSettings from '../CollectionItemContentSettings.vue'
import type { Section, FooterContent, ContentMediaButton } from '@/types/section'
import { useEditorActions } from '@/composables/useEditorActions'

const props = defineProps<{ section: Section }>()

const { updateSectionContent } = useEditorActions()

const footerDescription = ref('')
const footerButtons = ref<ContentMediaButton[]>([])
const footerPrivacyPolicy = ref('')
const footerTermsConditions = ref('')
const showPrivacyEditor = ref(false)
const showTermsEditor = ref(false)

function sync() {
  const c = props.section.content as FooterContent | null
  footerDescription.value = c?.description ?? ''
  footerButtons.value = c?.buttons ? [...c.buttons] : []
  footerPrivacyPolicy.value = c?.privacy_policy ?? ''
  footerTermsConditions.value = c?.terms_conditions ?? ''
}

sync()
watch(() => props.section.id, sync)

function saveContent() {
  updateSectionContent(props.section.id, {
    description: footerDescription.value,
    buttons: footerButtons.value,
    privacy_policy: footerPrivacyPolicy.value,
    terms_conditions: footerTermsConditions.value,
  })
}

function addLink() {
  if (footerButtons.value.length >= 6) return
  footerButtons.value.push({ id: crypto.randomUUID(), label: 'Button', url: '' })
  saveContent()
}

function removeLink(id: string) {
  footerButtons.value = footerButtons.value.filter((b) => b.id !== id)
  saveContent()
}
</script>

<template>
  <div class="flex flex-col gap-4 p-2 pr-0">
    <BaseInput size="sm" type="textarea" label="Description" v-model="footerDescription" placeholder="A short description…" @update:modelValue="saveContent" />
    <div class="flex flex-col gap-2">
      <div class="flex justify-between items-center">
        <p class="text-xs font-medium text-gray-500">Links</p>
        <BaseButton v-if="footerButtons.length < 6" variant="outline" size="xs" @click="addLink">
          <PlusIcon class="h-3 w-3" /> Add link
        </BaseButton>
      </div>
      <p v-if="!footerButtons.length" class="text-xs text-gray-400">No links added</p>
      <div v-for="btn in footerButtons" :key="btn.id" class="flex items-center gap-1">
        <BaseLinkPicker v-model:label="btn.label" v-model:url="btn.url" @update:label="saveContent" @update:url="saveContent" />
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
    <CollectionItemContentSettings v-if="showPrivacyEditor" v-model="footerPrivacyPolicy" title="Privacy Policy" @close="showPrivacyEditor = false; saveContent()" />
    <CollectionItemContentSettings v-if="showTermsEditor" v-model="footerTermsConditions" title="Terms & Conditions" @close="showTermsEditor = false; saveContent()" />
  </div>
</template>
