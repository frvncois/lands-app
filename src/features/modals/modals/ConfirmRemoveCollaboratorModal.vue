<script setup lang="ts">
import { UserMinusIcon } from '@heroicons/vue/24/outline'
import BaseButton from '@/shared/ui/BaseButton.vue'
import BaseModal from '@/shared/ui/BaseModal.vue'

defineProps<{ email: string }>()
defineEmits<{ confirm: []; cancel: [] }>()
</script>

<template>
  <BaseModal max-width="max-w-sm" @close="$emit('cancel')">
    <div class="flex flex-col gap-5">

      <div class="flex flex-col gap-1">
        <div class="flex items-center gap-2 text-red-500 mb-1">
          <UserMinusIcon class="h-5 w-5" />
          <h3 class="text-base font-semibold">Remove collaborator</h3>
        </div>
        <p class="text-sm text-gray-500">
          <span class="font-medium text-gray-700">{{ email }}</span> will lose access to this project immediately.
        </p>
      </div>

      <div class="flex justify-end gap-2">
        <BaseButton variant="outline" size="sm" @click="$emit('cancel')">Cancel</BaseButton>
        <BaseButton variant="remove" size="sm" @click="$emit('confirm')">Remove</BaseButton>
      </div>

    </div>
  </BaseModal>
</template>
