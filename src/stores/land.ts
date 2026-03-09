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

  const canCreateLand = computed(() => lands.value.length < 100)

  function setLands(data: Land[]) {
    lands.value = data
    if (!activeLandId.value && data.length > 0) {
      activeLandId.value = data[0]!.id
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
