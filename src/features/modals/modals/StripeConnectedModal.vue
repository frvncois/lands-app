<script setup lang="ts">
import BaseButton from '@/shared/ui/BaseButton.vue'
import BaseModal from '@/shared/ui/BaseModal.vue'
import { CreditCardIcon } from '@heroicons/vue/24/outline'

defineEmits<{ close: []; startSelling: [] }>()
</script>

<template>
  <BaseModal overlay="dark" max-width="max-w-sm" padding="p-8" @close="$emit('close')">
    <div class="flex flex-col items-center gap-5 text-center">

      <div class="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
        <CreditCardIcon class="h-7 w-7 text-emerald-600" />
      </div>

      <div>
        <h3 class="text-lg font-semibold text-gray-900">Stripe connected!</h3>
        <p class="text-sm text-gray-400 mt-1.5 leading-relaxed">
          Your Stripe account is now linked. You can sell products and offer exclusive content directly from your land.
        </p>
      </div>

      <div class="flex flex-col gap-2 w-full">
        <BaseButton variant="solid" size="md" class="w-full justify-center" @click="$emit('startSelling')">
          Start selling
        </BaseButton>
        <BaseButton variant="outline" size="md" class="w-full justify-center" @click="$emit('close')">
          Close
        </BaseButton>
      </div>

    </div>
  </BaseModal>
</template>
