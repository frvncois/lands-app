/**
 * SECTION VALIDATION SCRIPT
 * Ensures section registry and publish function are in sync
 * Run before deploy to catch mismatches
 */

import { sectionRegistry } from '../src/lib/section-registry'

// List of section types supported in publish function
// Extracted from supabase/functions/publish-project/index.ts switch statement
const PUBLISH_SECTIONS = [
  'hero',
  'cards',
  'cta',
  'links',
  'accordion',
  'faq',
  'menu',
  'services',
  'gallery',
  'products',
  'events',
  'contact',
  'subscribe',
  'header',
  'footer',
  // Legacy types (kept for backwards compatibility)
  'text',
  'media-text',
]

const registryTypes = Array.from(sectionRegistry.keys())
const publishTypes = PUBLISH_SECTIONS

// Find sections in registry but not in publish
const missingInPublish = registryTypes.filter(t => !publishTypes.includes(t))

// Find sections in publish but not in registry (legacy or removed)
const missingInRegistry = publishTypes.filter(t => !registryTypes.includes(t))

let hasErrors = false

if (missingInPublish.length) {
  console.error('❌ ERROR: Publish missing section types:')
  missingInPublish.forEach(type => console.error(`  - ${type}`))
  hasErrors = true
}

if (missingInRegistry.length) {
  console.warn('⚠️  WARNING: Publish has legacy types not in registry:')
  missingInRegistry.forEach(type => console.warn(`  - ${type}`))
}

if (hasErrors) {
  throw new Error(
    `Publish missing section types:\n${missingInPublish.join('\n')}`
  )
}

console.log('✔ Sections in sync')
console.log(`  Registry: ${registryTypes.length} types`)
console.log(`  Publish: ${publishTypes.length} types`)
