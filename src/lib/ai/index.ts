/**
 * AI Module
 *
 * Centralized AI training and context management.
 */

export * from './schema'
export * from './examples'
export * from './intent'

import { BLOCK_SCHEMA, STYLE_PROPERTIES, ANIMATION_SCHEMA, COMMON_ICONS, FONT_SIZES, BLOCK_TYPES } from './schema'
import { findRelevantExamples, AI_EXAMPLES } from './examples'
import { detectIntent, buildSchemaContextForIntent, QUICK_REFERENCE, type DetectedIntent } from './intent'

/**
 * Build the complete AI context based on user message
 */
export function buildAIContext(message: string): {
  intent: DetectedIntent
  schemaContext: string
  quickReference: string
} {
  const intent = detectIntent(message)
  const schemaContext = buildSchemaContextForIntent(intent)

  // Pick the right quick reference based on intent
  let quickReference = ''
  if (intent.category === 'create_section' || intent.category === 'create_list') {
    quickReference = QUICK_REFERENCE.createSection
  } else if (intent.category === 'add_items') {
    quickReference = QUICK_REFERENCE.addChildren + '\n\nOR\n\n' + QUICK_REFERENCE.duplicateBlock
  } else if (intent.category === 'update_block' || intent.category === 'update_styles') {
    quickReference = QUICK_REFERENCE.updateBlock
  }

  return {
    intent,
    schemaContext,
    quickReference,
  }
}

/**
 * Generate a compact schema summary for the system prompt
 */
export function getCompactSchema(): string {
  const parts: string[] = []

  parts.push('## BLOCK TYPES')
  parts.push(`Layout (can have children): ${BLOCK_TYPES.layout.join(', ')}`)
  parts.push(`Content (no children): ${BLOCK_TYPES.content.join(', ')}`)
  parts.push('')

  // Compact block reference
  parts.push('## BLOCK QUICK REFERENCE')
  for (const [type, schema] of Object.entries(BLOCK_SCHEMA)) {
    const s = schema as { description: string; canHaveChildren: boolean; settings: Record<string, unknown> }
    const requiredSettings = Object.entries(s.settings)
      .filter(([_, v]) => (v as { required?: boolean }).required)
      .map(([k]) => k)

    parts.push(`- **${type}**: ${s.description}`)
    if (requiredSettings.length > 0) {
      parts.push(`  Required: ${requiredSettings.join(', ')}`)
    }
  }
  parts.push('')

  // Compact style reference
  parts.push('## STYLE QUICK REFERENCE')
  parts.push('- padding/margin: { top, bottom, left, right } as px strings')
  parts.push('- gap: px string (e.g., "24")')
  parts.push('- fontSize: px string or named (sm, base, lg, xl, 2xl, 3xl, 4xl)')
  parts.push('- fontWeight: normal | medium | semibold | bold')
  parts.push('- color/backgroundColor: hex string (#ffffff)')
  parts.push('- borderRadius: px string')
  parts.push('- border: { width, color, radius, style }')
  parts.push('- flexDirection: row | column')
  parts.push('- justifyContent: flex-start | center | flex-end | space-between')
  parts.push('- alignItems: flex-start | center | flex-end | stretch')
  parts.push('')

  return parts.join('\n')
}

/**
 * Get all examples formatted for the system prompt
 */
export function getAllExamplesForPrompt(): string {
  const parts: string[] = []

  parts.push('## WORKING EXAMPLES')
  parts.push('')

  // Group by category
  const sections = AI_EXAMPLES.filter(e => e.category === 'section')
  const lists = AI_EXAMPLES.filter(e => e.category === 'list')

  if (sections.length > 0) {
    parts.push('### SECTION EXAMPLES')
    for (const example of sections.slice(0, 3)) { // Limit to avoid huge prompts
      parts.push(`**${example.name}** (keywords: ${example.keywords.slice(0, 5).join(', ')})`)
      parts.push('```json')
      parts.push(JSON.stringify({ message: `Created ${example.name}`, actions: example.actions }, null, 2))
      parts.push('```')
      parts.push('')
    }
  }

  if (lists.length > 0) {
    parts.push('### LIST ITEM EXAMPLES')
    for (const example of lists) {
      parts.push(`**${example.name}** (keywords: ${example.keywords.slice(0, 5).join(', ')})`)
      parts.push('```json')
      parts.push(JSON.stringify({ message: `Added ${example.name}`, actions: example.actions }, null, 2))
      parts.push('```')
      parts.push('')
    }
  }

  return parts.join('\n')
}
