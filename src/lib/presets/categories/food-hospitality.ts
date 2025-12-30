import type { PresetCategory, UseCasePreset } from '../types'

// ============================================
// USE CASE PRESETS
// ============================================

export const restaurantPreset: UseCasePreset = {
  id: 'restaurant',
  name: 'Restaurant',
  description: 'Showcase your menu and accept reservations',
  icon: 'dinner',
  categoryId: 'food-hospitality',
  themeId: 'modern',
  sections: [
    'centeredHeader',
    'restaurant-hero',
    'menu-section',
    'food-gallery',
    'reservation-cta',
    'hours-location',
    'default-footer',
  ],
  tags: ['restaurant', 'dining', 'food', 'reservations'],
}

export const cafePreset: UseCasePreset = {
  id: 'cafe-coffee-shop',
  name: 'Café / Coffee Shop',
  description: 'Cozy vibes, great coffee, and your menu',
  icon: 'coffee-cup',
  categoryId: 'food-hospitality',
  themeId: 'modern',
  sections: [
    'centeredHeader',
    'cafe-hero',
    'menu-simple',
    'food-gallery',
    'hours-location',
    'default-footer',
  ],
  tags: ['cafe', 'coffee', 'shop', 'bakery'],
}

export const barPubPreset: UseCasePreset = {
  id: 'bar-pub',
  name: 'Bar / Pub',
  description: 'Drinks menu, events, and atmosphere',
  icon: 'glass',
  categoryId: 'food-hospitality',
  themeId: 'bold',
  sections: [
    'centeredHeader',
    'bar-hero',
    'drinks-menu',
    'food-gallery',
    'hours-location',
    'default-footer',
  ],
  tags: ['bar', 'pub', 'drinks', 'cocktails', 'nightlife'],
}

export const bistroPreset: UseCasePreset = {
  id: 'bistro',
  name: 'Bistro',
  description: 'Casual dining with a refined touch',
  icon: 'restaurant',
  categoryId: 'food-hospitality',
  themeId: 'modern',
  sections: [
    'centeredHeader',
    'bistro-hero',
    'menu-section',
    'food-gallery',
    'reservation-cta',
    'hours-location',
    'default-footer',
  ],
  tags: ['bistro', 'french', 'casual', 'dining'],
}

export const foodTruckPreset: UseCasePreset = {
  id: 'food-truck',
  name: 'Food Truck',
  description: 'Your menu and where to find you',
  icon: 'car',
  categoryId: 'food-hospitality',
  themeId: 'bold',
  sections: [
    'simple-header',
    'food-truck-hero',
    'menu-simple',
    'truck-schedule',
    'food-gallery',
    'social-links',
    'default-footer',
  ],
  tags: ['food truck', 'street food', 'mobile', 'catering'],
}

export const bakeryPreset: UseCasePreset = {
  id: 'bakery',
  name: 'Bakery',
  description: 'Fresh baked goods and online orders',
  icon: 'cake',
  categoryId: 'food-hospitality',
  themeId: 'modern',
  sections: [
    'centeredHeader',
    'bakery-hero',
    'menu-simple',
    'food-gallery',
    'hours-location',
    'default-footer',
  ],
  tags: ['bakery', 'bread', 'pastry', 'cakes', 'desserts'],
}

export const cateringPreset: UseCasePreset = {
  id: 'catering-service',
  name: 'Catering Service',
  description: 'Services, menus, and booking inquiries',
  icon: 'delivery',
  categoryId: 'food-hospitality',
  themeId: 'modern',
  sections: [
    'centeredHeader',
    'catering-hero',
    'catering-services',
    'menu-section',
    'food-gallery',
    'faq-section',
    'contact-section',
    'default-footer',
  ],
  tags: ['catering', 'events', 'weddings', 'corporate'],
}

export const ghostKitchenPreset: UseCasePreset = {
  id: 'ghost-kitchen',
  name: 'Ghost Kitchen',
  description: 'Delivery-only concept with ordering links',
  icon: 'home',
  categoryId: 'food-hospitality',
  themeId: 'bold',
  sections: [
    'simple-header',
    'ghost-kitchen-hero',
    'menu-simple',
    'delivery-platforms',
    'food-gallery',
    'default-footer',
  ],
  tags: ['ghost kitchen', 'delivery', 'virtual restaurant'],
}

export const wineryBreweryPreset: UseCasePreset = {
  id: 'winery-brewery',
  name: 'Winery / Brewery',
  description: 'Tastings, tours, and shop your products',
  icon: 'wine',
  categoryId: 'food-hospitality',
  themeId: 'modern',
  sections: [
    'centeredHeader',
    'winery-hero',
    'wine-list',
    'food-gallery',
    'event-space',
    'hours-location',
    'contact-section',
    'default-footer',
  ],
  tags: ['winery', 'brewery', 'wine', 'beer', 'tasting'],
}

export const popupRestaurantPreset: UseCasePreset = {
  id: 'popup-restaurant',
  name: 'Pop-up Restaurant',
  description: 'Limited-time dining experience',
  icon: 'calendar',
  categoryId: 'food-hospitality',
  themeId: 'bold',
  sections: [
    'simple-header',
    'popup-restaurant-hero',
    'menu-section',
    'food-gallery',
    'subscribe-newsletter',
    'default-footer',
  ],
  tags: ['popup', 'pop-up', 'limited', 'exclusive', 'dining'],
}

// ============================================
// CATEGORY DEFINITION
// ============================================

export const foodHospitalityCategory: PresetCategory = {
  id: 'food-hospitality',
  name: 'Food & Hospitality',
  description: 'Restaurants, cafés, bars, and food businesses',
  icon: 'dinner',
  order: 2,
  useCases: [
    'restaurant',
    'cafe-coffee-shop',
    'bar-pub',
    'bistro',
    'food-truck',
    'bakery',
    'catering-service',
    'ghost-kitchen',
    'winery-brewery',
    'popup-restaurant',
  ],
}

// ============================================
// EXPORT ALL PRESETS
// ============================================

export const foodPresets = {
  restaurantPreset,
  cafePreset,
  barPubPreset,
  bistroPreset,
  foodTruckPreset,
  bakeryPreset,
  cateringPreset,
  ghostKitchenPreset,
  wineryBreweryPreset,
  popupRestaurantPreset,
}
