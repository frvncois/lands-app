import type { SectionBlueprint } from '../types'

// ============================================
// FOOD & HOSPITALITY BLUEPRINTS
// ============================================

// --- HEROES ---
export const restaurantHero: SectionBlueprint = {
  id: 'restaurant-hero',
  type: 'hero',
  variant: 'overlay',
  dataOverrides: {
    headline: 'Restaurant Name',
    subheadline: 'Fine Dining Experience',
    primaryCTA: { label: 'Reserve a Table', url: '#' },
    secondaryCTA: { label: 'View Menu', url: '#' },
  },
}

export const cafeHero: SectionBlueprint = {
  id: 'cafe-hero',
  type: 'hero',
  variant: 'split',
  dataOverrides: {
    headline: 'Café Name',
    subheadline: 'Coffee & Good Vibes',
    primaryCTA: { label: 'Order Online', url: '#' },
  },
}

export const barHero: SectionBlueprint = {
  id: 'bar-hero',
  type: 'hero',
  variant: 'overlay',
  dataOverrides: {
    headline: 'Bar Name',
    subheadline: 'Craft Cocktails & Great Company',
    primaryCTA: { label: 'See Drinks Menu', url: '#' },
  },
}

export const bistroHero: SectionBlueprint = {
  id: 'bistro-hero',
  type: 'hero',
  variant: 'split',
  dataOverrides: {
    headline: 'Bistro Name',
    subheadline: 'Casual French Dining',
    primaryCTA: { label: 'Book a Table', url: '#' },
  },
}

export const foodTruckHero: SectionBlueprint = {
  id: 'food-truck-hero',
  type: 'hero',
  variant: 'stacked',
  dataOverrides: {
    headline: 'Food Truck Name',
    subheadline: 'Street Food Done Right',
    primaryCTA: { label: 'Find Us Today', url: '#' },
  },
}

export const bakeryHero: SectionBlueprint = {
  id: 'bakery-hero',
  type: 'hero',
  variant: 'split',
  dataOverrides: {
    headline: 'Bakery Name',
    subheadline: 'Fresh Baked Daily',
    primaryCTA: { label: 'Order Now', url: '#' },
  },
}

export const cateringHero: SectionBlueprint = {
  id: 'catering-hero',
  type: 'hero',
  variant: 'split',
  dataOverrides: {
    headline: 'Catering Company',
    subheadline: 'Events Made Delicious',
    primaryCTA: { label: 'Get a Quote', url: '#' },
  },
}

export const ghostKitchenHero: SectionBlueprint = {
  id: 'ghost-kitchen-hero',
  type: 'hero',
  variant: 'stacked',
  dataOverrides: {
    headline: 'Kitchen Name',
    subheadline: 'Delivery Only • Order Now',
    primaryCTA: { label: 'Order on Uber Eats', url: '#' },
    secondaryCTA: { label: 'Order on DoorDash', url: '#' },
  },
}

export const wineryHero: SectionBlueprint = {
  id: 'winery-hero',
  type: 'hero',
  variant: 'overlay',
  dataOverrides: {
    headline: 'Winery Name',
    subheadline: 'Estate Wines Since 1985',
    primaryCTA: { label: 'Book a Tasting', url: '#' },
    secondaryCTA: { label: 'Shop Wines', url: '#' },
  },
}

export const popupRestaurantHero: SectionBlueprint = {
  id: 'popup-restaurant-hero',
  type: 'hero',
  variant: 'overlay',
  dataOverrides: {
    headline: 'Pop-up Name',
    subheadline: 'Limited Time Only • Dec 15-20',
    primaryCTA: { label: 'Get Tickets', url: '#' },
  },
}

// --- FOOD-SPECIFIC SECTIONS ---
export const menuSection: SectionBlueprint = {
  id: 'menu-section',
  type: 'menu',
  variant: 'list',
  dataOverrides: {
    headline: 'Our Menu',
    useCase: 'menu',
  },
}

export const menuSimple: SectionBlueprint = {
  id: 'menu-simple',
  type: 'menu',
  variant: 'split',
  dataOverrides: {
    headline: 'Menu',
    useCase: 'menu',
  },
}

export const drinksMenu: SectionBlueprint = {
  id: 'drinks-menu',
  type: 'menu',
  variant: 'list',
  dataOverrides: {
    headline: 'Drinks',
    useCase: 'menu',
  },
}

export const hoursLocation: SectionBlueprint = {
  id: 'hours-location',
  type: 'contact',
  variant: 'split',
  dataOverrides: {
    headline: 'Visit Us',
    subheadline: 'Hours & Location',
  },
}

export const reservationCta: SectionBlueprint = {
  id: 'reservation-cta',
  type: 'cta',
  variant: 'stacked',
  dataOverrides: {
    headline: 'Make a Reservation',
    paragraph: 'Book your table online or call us directly',
    primaryCTA: { label: 'Reserve Now', url: '#' },
  },
}

export const foodGallery: SectionBlueprint = {
  id: 'food-gallery',
  type: 'gallery',
  variant: 'masonry',
  dataOverrides: {
    headline: 'Our Food',
  },
}

export const deliveryPlatforms: SectionBlueprint = {
  id: 'delivery-platforms',
  type: 'links',
  variant: 'grid',
  dataOverrides: {
    headline: 'Order Delivery',
    items: [
      { label: 'Uber Eats', url: '#' },
      { label: 'DoorDash', url: '#' },
      { label: 'Grubhub', url: '#' },
      { label: 'Direct Order', url: '#' },
    ],
  },
}

export const cateringServices: SectionBlueprint = {
  id: 'catering-services',
  type: 'services',
  variant: 'list',
  dataOverrides: {
    headline: 'Our Services',
    useCase: 'faq',
    items: [
      { headline: 'Corporate Events', content: 'Lunch meetings to large conferences' },
      { headline: 'Weddings', content: 'Your special day, our special touch' },
      { headline: 'Private Parties', content: 'Birthdays, anniversaries & more' },
    ],
  },
}

export const wineList: SectionBlueprint = {
  id: 'wine-list',
  type: 'products',
  variant: 'grid',
  dataOverrides: {
    headline: 'Our Wines',
  },
}

export const eventSpace: SectionBlueprint = {
  id: 'event-space',
  type: 'cards',
  variant: 'grid',
  dataOverrides: {
    headline: 'Private Events',
    paragraph: 'Host your next event with us',
  },
}

export const truckSchedule: SectionBlueprint = {
  id: 'truck-schedule',
  type: 'events',
  variant: 'list',
  dataOverrides: {
    headline: 'Find Us This Week',
    useCase: 'event',
  },
}

// ============================================
// EXPORT ALL
// ============================================

export const foodBlueprints: SectionBlueprint[] = [
  restaurantHero,
  cafeHero,
  barHero,
  bistroHero,
  foodTruckHero,
  bakeryHero,
  cateringHero,
  ghostKitchenHero,
  wineryHero,
  popupRestaurantHero,
  menuSection,
  menuSimple,
  drinksMenu,
  hoursLocation,
  reservationCta,
  foodGallery,
  deliveryPlatforms,
  cateringServices,
  wineList,
  eventSpace,
  truckSchedule,
]
