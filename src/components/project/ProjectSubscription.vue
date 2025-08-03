<script setup>
import { ref } from 'vue'
import { plans } from '@/data/plans.js'
import ButtonMain from '@/components/button/ButtonMain.vue'

const props = defineProps(['project'])
const emit = defineEmits(['close'])
const selectedPlan = ref(props.project?.settings.plan || 'free')

function selectPlan(planId) {
  if (planId === props.project?.settings.plan) {
    // Current plan clicked, do nothing
    return
  }
  
  selectedPlan.value = planId
  const plan = plans.find(p => p.id === planId)
  
  if (plan.id === 'free') {
    // Change to free plan
    if (props.project) {
      props.project.settings.plan = 'free'
      props.project.settings.stripeSubscriptionId = null
    }
    emit('close')
  } else {
    // Redirect to Stripe checkout
    redirectToStripe(plan)
  }
}

async function redirectToStripe(plan) {
  try {
    const response = await fetch('http://localhost:3000/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        priceId: plan.stripePriceId,
        projectId: props.project?.id,
        successUrl: `${window.location.origin}/project/${props.project?.id}?payment=success`,
        cancelUrl: `${window.location.origin}/project/${props.project?.id}?payment=cancelled`
      })
    })
    const { url } = await response.json()
    window.location.href = url
  } catch (error) {
    console.error('Error creating checkout session:', error)
    alert('Error processing payment. Please try again.')
  }
}

function formatPrice(price) {
  return price === 0 ? '$0' : `$${price}/m`
}

function getPlanButtonStyle(planId) {
  return planId === props.project?.settings.plan ? 'disabled' : 'light'
}

function getPlanButtonLabel(planId) {
  return planId === props.project?.settings.plan ? 'Current Plan' : 'Change Plan'
}
</script>

<template>
  <li>
    <label>Current plan</label>
    <ul class="plans">

      <li
        v-for="plan in plans"
        :key="plan.id"
        class="item"
        :class="{ selected: plan.id === props.project?.settings.plan }"
      >
        <h3>{{ plan.name }}</h3>

        <div class="content">
          <label v-for="feature in plan.features" :key="feature">
            {{ feature }}
          </label>
        </div>

        <div class="actions">
                              <span class="plan-price">
            {{ formatPrice(plan.price) }}
          </span>
          <ButtonMain 
            :label="getPlanButtonLabel(plan.id)"
            :button-style="getPlanButtonStyle(plan.id)"
            @click="selectPlan(plan.id)"
          />
        </div>


      </li>
    </ul>
  </li>
</template>

<style scoped>

li.list {
  gap: var(--space-rg);
  padding: var(--space-lg) 0;

}

ul.plans {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin-top: var(--space-rg);
  li {
    display: grid;
    grid-template-columns: 0.25fr 1fr 0.15fr;
    align-items: stretch;
    gap: var(--space-rg);
    cursor: pointer;
    padding: var(--space-md);
    border-radius: var(--radius-md);
    border: 1px solid var(--border);
    transition: all var(--transition-smooth);
    background: var(--card);
  
    > .content {
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
      
      > p {
        color: var(--details);
        font-size: var(--font-sm);
        font-family: 'mono';
        text-transform: uppercase;
      }
    }
    
    > .actions {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
      justify-content: space-between;
      align-items: flex-end;
    }
  }
}
</style>