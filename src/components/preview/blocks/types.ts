import type { SectionBlock } from '@/types/editor'

/**
 * Standard props interface for all block preview components
 * Each block component receives these props from PreviewSection.vue
 */
export interface BlockComponentProps {
  /** The block data */
  block: SectionBlock
  /** Index of this block in parent's children */
  index: number
  /** Total number of siblings */
  total: number
  /** Whether this block is selected */
  isSelected: boolean
  /** Whether this block is hovered */
  isHovered: boolean
  /** Computed CSS styles for the block */
  styles: Record<string, string>
}
