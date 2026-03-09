export const LAND_PLANS = {
  free: 'free',
  paid: 'paid',
} as const

export type LandPlan = typeof LAND_PLANS[keyof typeof LAND_PLANS]

export interface PlanDetails {
  label: string
  price: number // USD per month
  plugins: boolean
  custom_domain: boolean
}

export const PLAN_DETAILS: Record<LandPlan, PlanDetails> = {
  free: {
    label: 'Free',
    price: 0,
    plugins: false,
    custom_domain: false,
  },
  paid: {
    label: 'Paid',
    price: 4,
    plugins: true,
    custom_domain: true,
  },
}
