export const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: null,
    stripePriceId: null,
    features: [
      'Lands domain',
      'Watermark'
    ]
  },
  {
    id: 'basic', 
    name: 'Basic',
    price: 10,
    interval: 'month',
    stripePriceId: 'price_1RnNk2GbBhc0ZLgaRknNo32B',
    features: [
      'Analytics',
      'Custom domain',
    ]
  },
  {
    id: 'pro',
    name: 'Pro', 
    price: 20,
    interval: 'month',
    stripePriceId: 'price_1RnNkwGbBhc0ZLganF5Tuv5m',
    features: [
      'Audience', 
      'Analytics',
      'Translations',
    ]
  }
]