import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Land } from '@/types/land'
import { useThemeStore } from '@/stores/theme'

export const useLandStore = defineStore('land', () => {
  const lands = ref<Land[]>([])
  const activeLandId = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const activeLand = computed(() => {
    if (!activeLandId.value) return null
    return lands.value.find((l) => l.id === activeLandId.value) || null
  })

  const landCount = computed(() => lands.value.length)

  // Free: max 2 lands total. Account-level plan upgrade (not per-land) should unlock this.
  // TODO: replace with account-level `plan_tier` from users table once that column exists.
  const canCreateLand = computed(() => lands.value.length < 2)
  const isStripeConnected = computed(() => !!activeLand.value?.stripe_account_id)

  function setLands(data: Land[]) {
    lands.value = data
    if (!activeLandId.value && data.length > 0) {
      activeLandId.value = data[0]?.id ?? null
    }
  }

  function setActiveLand(id: string) {
    activeLandId.value = id
    const land = lands.value.find((l) => l.id === id)
    if (land?.theme) {
      useThemeStore().setTheme(land.theme)
    }
  }

  function addLand(land: Land) {
    lands.value.push(land)
    activeLandId.value = land.id
  }

  function updateLand(id: string, data: Partial<Land>) {
    const index = lands.value.findIndex((l) => l.id === id)
    if (index !== -1) {
      lands.value[index] = { ...lands.value[index], ...data } as Land
    }
  }

  function removeLand(id: string) {
    lands.value = lands.value.filter((l) => l.id !== id)
    if (activeLandId.value === id) {
      activeLandId.value = lands.value[0]?.id || null
    }
  }

  function clearLands() {
    lands.value = []
    activeLandId.value = null
  }

  return {
    lands,
    activeLandId,
    activeLand,
    landCount,
    canCreateLand,
    isStripeConnected,
    isLoading,
    error,
    setLands,
    setActiveLand,
    addLand,
    updateLand,
    removeLand,
    clearLands,
  }
})
