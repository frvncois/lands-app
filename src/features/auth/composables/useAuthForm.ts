import { ref } from 'vue'

export function useAuthForm() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  function setLoading(v: boolean) {
    isLoading.value = v
    if (v) error.value = null
  }

  function setError(msg: string) {
    error.value = msg
    isLoading.value = false
  }

  function clearError() {
    error.value = null
  }

  async function runAction<T>(fn: () => Promise<T>): Promise<T | null> {
    setLoading(true)
    try {
      return await fn()
    } catch (e) {
      setError((e as Error).message)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { isLoading, error, setLoading, setError, clearError, runAction }
}
