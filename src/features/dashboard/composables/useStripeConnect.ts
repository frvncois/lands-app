import { ref } from 'vue'
import { useLandStore } from '@/features/lands/stores/land'
import { stripeService } from '@/features/integrations/services/stripe.service'
import { addToast } from '@/shared/composables/useToast'

export function useStripeConnect() {
  const landStore = useLandStore()
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
