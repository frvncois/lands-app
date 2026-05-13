import { ref } from 'vue'
import { useLandStore } from '@/stores/land'
import { stripeService } from '@/services/stripe.service'
import { useToast } from '@/composables/useToast'

export function useStripeConnect() {
  const landStore = useLandStore()
  const { addToast } = useToast()
  const isConnecting = ref(false)

  function connectStripe() {
    const landId = landStore.activeLand?.id
    if (!landId) return
    try {
      isConnecting.value = true
      window.location.href = stripeService.connectUrl(landId)
    } catch {
      isConnecting.value = false
      addToast('Stripe is not configured — set VITE_STRIPE_CLIENT_ID', 'error')
    }
  }

  return { connectStripe, isConnecting }
}
