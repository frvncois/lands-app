<script setup lang="ts">
import { computed } from 'vue'
import BaseButton from '@/shared/ui/BaseButton.vue'
import { useLandStore } from '@/features/lands/stores/land'

const landStore = useLandStore()

const permanentUrl = computed(() => {
  const id = landStore.activeLand?.id
  return id ? `https://lands.app/${id}` : ''
})

const qrUrl = computed(() =>
  `https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=000000&bgcolor=ffffff&data=${encodeURIComponent(permanentUrl.value)}`
)
</script>

<template>
  <div class="flex flex-col items-center gap-4 p-6">
    <div class="rounded-xl overflow-hidden border border-gray-100 p-2">
      <img :src="qrUrl" alt="QR Code" class="h-40 w-40" />
    </div>
    <p class="text-xs text-gray-400 text-center leading-relaxed">
      This QR code always points to your project — even if you change your handle.
    </p>
    <a :href="qrUrl" download="qr-code.png" class="w-full">
      <BaseButton variant="outline" size="sm" class="w-full justify-center">Download PNG</BaseButton>
    </a>
  </div>
</template>
