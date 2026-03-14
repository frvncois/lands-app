import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { CampaignConnection } from '@/types/campaign'

export const useCampaignStore = defineStore('campaign', () => {
  const connection = ref<Partial<CampaignConnection>>({})

  function setConnection(c: Partial<CampaignConnection>) {
    connection.value = c
  }

  function clearConnection() {
    connection.value = {}
  }

  const isConnected = computed(() => !!connection.value.provider)

  return { connection, setConnection, clearConnection, isConnected }
})
