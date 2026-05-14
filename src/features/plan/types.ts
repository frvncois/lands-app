const LAND_PLANS = {
  free: 'free',
  paid: 'paid',
} as const

export type LandPlan = typeof LAND_PLANS[keyof typeof LAND_PLANS]

export interface PlanDetails {
  label: string
  price_monthly: number   // CAD/month
  price_yearly: number    // CAD/year
  max_lands: number       // -1 = unlimited
  collaborators: boolean
  campaign: boolean
  custom_domain: boolean
  max_sections: number                 // -1 = unlimited (excludes header/footer)
  max_collection_sections: number      // -1 = unlimited; caps collection/store section count
  max_collections_per_section: number  // -1 = unlimited; sub-collections within one section
  max_items_per_collection: number     // -1 = unlimited
}

export const PLAN_DETAILS: Record<LandPlan, PlanDetails> = {
  free: {
    label: 'Free',
    price_monthly: 0,
    price_yearly: 0,
    max_lands: 2,
    collaborators: false,
    campaign: false,
    custom_domain: false,
    max_sections: 6,
    max_collection_sections: 2,
    max_collections_per_section: 2,
    max_items_per_collection: 10,
  },
  paid: {
    label: 'Paid',
    price_monthly: 10,
    price_yearly: 90,
    max_lands: -1,
    collaborators: true,
    campaign: true,
    custom_domain: true,
    max_sections: 25,
    max_collection_sections: -1,
    max_collections_per_section: -1,
    max_items_per_collection: -1,
  },
}
