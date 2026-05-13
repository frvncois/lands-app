import { ref } from 'vue'

const signingIn = ref(false)

export function useAuthAnimation() {
  function triggerSigningIn() {
    signingIn.value = true
  }

  return { signingIn, triggerSigningIn }
}
