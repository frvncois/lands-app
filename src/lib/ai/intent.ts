/**
 * AI Intent Detection
 *
 * Analyzes user messages to determine intent and inject relevant context.
 */

import { BLOCK_SCHEMA, STYLE_PROPERTIES, ANIMATION_SCHEMA, COMMON_ICONS, FONT_SIZES } from './schema'
import { findRelevantExamples, type AIExample } from './examples'

// ============================================
// INTENT TYPES
// ============================================

export type IntentCategory =
  | 'create_section'    // User wants to create a new section
  | 'create_list'       // User wants to create a list/grid
  | 'add_items'         // User wants to add items to existing container
  | 'update_block'      // User wants to modify an existing block
  | 'update_styles'     // User wants to change styles
  | 'add_animation'     // User wants to add animation
  | 'translate'         // User wants to translate content
  | 'analyze'           // User wants analysis/suggestions
  | 'general'           // General question or unclear intent

export interface DetectedIntent {
  category: IntentCategory
  confidence: number // 0-1
  keywords: string[]
  // Relevant block types based on intent
  relevantBlockTypes: string[]
  // Whether we need full schema or just relevant parts
  needsFullSchema: boolean
  // Matching examples
  examples: AIExample[]
}

// ============================================
// INTENT PATTERNS
// ============================================

const INTENT_PATTERNS: Record<IntentCategory, { patterns: string[]; blockTypes: string[] }> = {
  create_section: {
    patterns: [
      'create', 'build', 'make', 'add section', 'new section',
      'hero', 'header', 'footer', 'about', 'contact', 'pricing', 'features',
      'testimonials', 'faq', 'cta', 'call to action', 'landing',
    ],
    blockTypes: ['container', 'stack', 'grid', 'heading', 'text', 'button', 'image', 'icon'],
  },
  create_list: {
    patterns: [
      'list', 'grid', 'cards', 'items', 'accordion', 'faq list',
      'feature list', 'testimonial list', 'menu', 'gallery',
    ],
    blockTypes: ['stack', 'grid', 'heading', 'text', 'image', 'icon'],
  },
  add_items: {
    patterns: [
      'add more', 'add item', 'add another', 'duplicate', 'copy',
      'create copies', 'make more', 'add children', 'insert',
    ],
    blockTypes: ['stack', 'heading', 'text', 'icon', 'button', 'image'],
  },
  update_block: {
    patterns: [
      'change', 'update', 'modify', 'edit', 'set', 'make it',
      'text', 'content', 'label', 'url', 'link', 'image', 'icon',
    ],
    blockTypes: [],
  },
  update_styles: {
    patterns: [
      'style', 'color', 'font', 'size', 'spacing', 'padding', 'margin',
      'background', 'border', 'radius', 'shadow', 'align', 'center',
      'bigger', 'smaller', 'larger', 'bold', 'italic',
    ],
    blockTypes: [],
  },
  add_animation: {
    patterns: [
      'animate', 'animation', 'fade', 'slide', 'zoom', 'bounce',
      'entrance', 'effect', 'motion', 'transition',
    ],
    blockTypes: [],
  },
  translate: {
    patterns: [
      'translate', 'translation', 'language', 'french', 'spanish',
      'german', 'italian', 'portuguese', 'chinese', 'japanese',
    ],
    blockTypes: [],
  },
  analyze: {
    patterns: [
      'analyze', 'review', 'check', 'improve', 'suggest', 'seo',
      'feedback', 'optimize', 'better', 'enhance',
    ],
    blockTypes: [],
  },
  general: {
    patterns: [],
    blockTypes: [],
  },
}

// ============================================
// DETECT INTENT
// ============================================

export function detectIntent(message: string): DetectedIntent {
  const messageLower = message.toLowerCase()
  const words = messageLower.split(/\s+/)

  let bestCategory: IntentCategory = 'general'
  let bestScore = 0
  const matchedKeywords: string[] = []

  // Score each intent category
  for (const [category, { patterns }] of Object.entries(INTENT_PATTERNS) as [IntentCategory, { patterns: string[] }][]) {
    let score = 0
    const categoryKeywords: string[] = []

    for (const pattern of patterns) {
      if (messageLower.includes(pattern)) {
        score += pattern.split(' ').length * 2 // Multi-word patterns score higher
        categoryKeywords.push(pattern)
      }
    }

    if (score > bestScore) {
      bestScore = score
      bestCategory = category
      matchedKeywords.length = 0
      matchedKeywords.push(...categoryKeywords)
    }
  }

  // Get relevant block types
  const relevantBlockTypes = INTENT_PATTERNS[bestCategory].blockTypes

  // Find matching examples
  const examples = findRelevantExamples(message, 2)

  // Determine if we need full schema
  const needsFullSchema = ['create_section', 'create_list', 'add_items'].includes(bestCategory)

  return {
    category: bestCategory,
    confidence: Math.min(1, bestScore / 10),
    keywords: matchedKeywords,
    relevantBlockTypes,
    needsFullSchema,
    examples,
  }
}

// ============================================
// BUILD CONTEXT FOR INTENT
// ============================================

export function buildSchemaContextForIntent(intent: DetectedIntent): string {
  // Keep context minimal to avoid token limits
  // The base system prompt already has comprehensive documentation
  // Only add the most relevant example here

  const example = intent.examples[0]
  if (!example) {
    return ''
  }

  // Only include the single most relevant example (compact)
  return `USE THIS TEMPLATE:\n${JSON.stringify({ message: `Created ${example.name}`, actions: example.actions })}`
}

// ============================================
// QUICK REFERENCE FOR COMMON OPERATIONS
// ============================================

export const QUICK_REFERENCE = {
  createSection: `
To create a new section, use create_section action:
{
  "type": "create_section",
  "section": {
    "name": "Section Name",
    "container": { "settings": {...}, "styles": {...} },
    "children": [...]
  }
}`,

  addChildren: `
To add items to an existing container, use add_children action:
{
  "type": "add_children",
  "blockId": "selected",
  "children": [
    { "type": "stack", "name": "Item", "settings": {...}, "styles": {...}, "children": [...] }
  ]
}`,

  updateBlock: `
To update an existing block, use update_block action:
{
  "type": "update_block",
  "blockId": "selected",
  "settings": { "content": "New text" },
  "styles": { "color": "#6366f1" }
}`,

  duplicateBlock: `
To duplicate a block with different content per copy:
{
  "type": "duplicate_block",
  "blockId": "selected",
  "count": 3,
  "childUpdates": [
    [{ "path": [0, 0], "settings": { "content": "Text 1" } }],
    [{ "path": [0, 0], "settings": { "content": "Text 2" } }],
    [{ "path": [0, 0], "settings": { "content": "Text 3" } }]
  ]
}`,
}
