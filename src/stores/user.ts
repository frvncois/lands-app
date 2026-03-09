import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { User } from '@/types/user'

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = ref(false)
  const isLoading = ref(false)

  const fullName = computed(() => {
    if (!user.value) return ''
    return `${user.value.first_name} ${user.value.last_name}`.trim()
  })

  const initials = computed(() => {
    if (!user.value) return '?'
    const f = user.value.first_name?.charAt(0) || ''
    const l = user.value.last_name?.charAt(0) || ''
    return `${f}${l}`.toUpperCase() || '?'
  })

  function setUser(userData: User) {
    user.value = userData
    isAuthenticated.value = true
  }

  function clearUser() {
    user.value = null
    isAuthenticated.value = false
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    fullName,
    initials,
    setUser,
    clearUser,
  }
})
