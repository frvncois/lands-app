import { ref, type Ref } from 'vue'

export function useCountUpStats<K extends string>(
  values: Record<K, number>
): { display: Record<K, Ref<number>>; trigger: () => void } {
  const display = {} as Record<K, Ref<number>>
  for (const key of Object.keys(values) as K[]) {
    display[key] = ref(0)
  }

  function trigger() {
    for (const key of Object.keys(values) as K[]) {
      display[key].value = 0
    }
    setTimeout(() => {
      for (const [key, value] of Object.entries(values) as [K, number][]) {
        display[key].value = value
      }
    }, 300)
  }

  return { display, trigger }
}
