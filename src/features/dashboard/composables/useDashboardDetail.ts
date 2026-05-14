import { ref } from 'vue'

export type DetailKey = 'analytics' | 'orders' | 'sell' | 'campaign'

// ─── Module-level singleton state ───
const activeDetail = ref<DetailKey | null>(null)
const direction = ref<'forward' | 'back'>('forward')

export function useDashboardDetail() {
  function openDetail(key: DetailKey) {
    direction.value = 'forward'
    activeDetail.value = key
  }

  function closeDetail() {
    direction.value = 'back'
    activeDetail.value = null
  }

  return { activeDetail, direction, openDetail, closeDetail }
}
