<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseToggle from '../ui/BaseToggle.vue'
import BaseInput from '../ui/BaseInput.vue'
import type { CollectionSettings } from '@/types/section'
import { useEditorActions } from '@/composables/useEditorActions'

const props = defineProps<{ sectionId: string; settings: CollectionSettings }>()

const { updateSectionSettings } = useEditorActions()

const monetized = ref(props.settings.monetized ?? false)
const paymentType = ref<'monthly' | 'one_time'>(props.settings.payment_type ?? 'one_time')
const price = ref<string>(props.settings.price?.toString() ?? '')

watch(() => props.settings, (s) => {
  monetized.value = s.monetized ?? false
  paymentType.value = s.payment_type ?? 'one_time'
  price.value = s.price?.toString() ?? ''
}, { deep: true })

function save() {
  updateSectionSettings(props.sectionId, {
    monetized: monetized.value,
    payment_type: paymentType.value,
    price: price.value ? parseFloat(price.value) : undefined,
  })
}
</script>

<template>
  <div class="flex flex-col gap-4">

    <BaseToggle size="sm" label="Activate" description="Charge users to access this collection" v-model="monetized" @update:modelValue="save" />

    <template v-if="monetized">

      <div class="flex flex-col gap-2">
        <p class="text-xs font-medium text-gray-500">Billing</p>
        <div class="flex gap-1">
          <button
            v-for="opt in [{ value: 'one_time', label: 'One time' }, { value: 'monthly', label: 'Monthly' }]"
            :key="opt.value"
            class="flex-1 py-1.5 text-xs rounded-lg border transition-colors"
            :class="paymentType === opt.value
              ? 'border-gray-900 bg-gray-900 text-white'
              : 'border-gray-200 text-gray-600 hover:border-gray-400'"
            @click="paymentType = opt.value as 'monthly' | 'one_time'; save()"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <BaseInput size="sm" label="Price" v-model="price" placeholder="0.00" @update:modelValue="save" />

    </template>

  </div>
</template>
