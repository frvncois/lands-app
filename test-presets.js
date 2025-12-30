// Test script to verify subscribe blueprints and presets
import { getBlueprint, getTemplateFromPreset, getAllBlueprints } from './src/lib/presets/index.ts'

console.log('\n=== TESTING SUBSCRIBE BLUEPRINTS ===\n')

// Test 1: Check if subscribe blueprints exist
const subscribeBlueprints = [
  'subscribe-newsletter',
  'subscribe-stacked',
  'subscribe-split',
  'subscribe-section',
  'waitlist-subscribe',
  'music-subscribe',
  'fan-club-subscribe',
  'launch-subscribe',
  'drop-subscribe',
  'event-subscribe',
  'community-subscribe',
  'newsletter-subscribe',
]

console.log('Checking blueprints...')
subscribeBlueprints.forEach(id => {
  const bp = getBlueprint(id)
  if (bp) {
    console.log(`✓ ${id}: type=${bp.type}, variant=${bp.variant}`)
  } else {
    console.log(`✗ ${id}: NOT FOUND`)
  }
})

// Test 2: Check presets that use subscribe
console.log('\n=== TESTING PRESETS WITH SUBSCRIBE ===\n')

const presetsWithSubscribe = [
  'artist-band',
  'album-presave',
  'music-festival',
  'podcast',
  'saas-waitlist',
  'changelog',
  'creator-hub',
  'preorders',
  'popup-restaurant',
  'popup-shop',
  'community-group',
]

presetsWithSubscribe.forEach(id => {
  const template = getTemplateFromPreset(id)
  if (template) {
    const subscribeSections = template.sections.filter(s => s.type === 'subscribe')
    if (subscribeSections.length > 0) {
      console.log(`✓ ${id}: Has ${subscribeSections.length} subscribe section(s)`)
    } else {
      console.log(`✗ ${id}: NO SUBSCRIBE SECTIONS FOUND`)
      console.log(`  Sections:`, template.sections.map(s => s.type).join(', '))
    }
  } else {
    console.log(`✗ ${id}: TEMPLATE NOT FOUND`)
  }
})

// Test 3: List all blueprints with subscribe type
console.log('\n=== ALL SUBSCRIBE BLUEPRINTS ===\n')
const allBps = getAllBlueprints()
const allSubscribeBps = allBps.filter(bp => bp.type === 'subscribe')
console.log(`Found ${allSubscribeBps.length} subscribe blueprints:`)
allSubscribeBps.forEach(bp => {
  console.log(`  - ${bp.id}`)
})

console.log('\n=== TEST COMPLETE ===\n')
