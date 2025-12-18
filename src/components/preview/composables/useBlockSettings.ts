import { computed, type Ref } from 'vue'
import type {
  SectionBlock,
  ContainerSettings,
  GridSettings,
  StackSettings,
  HeadingSettings,
  TextSettings,
  ImageSettings,
  VideoSettings,
  ButtonSettings,
  IconSettings,
  VariantsSettings,
  CanvasSettings,
  IconStyles,
  VariantsStyles,
} from '@/types/editor'

/**
 * Composable for extracting typed block settings and styles
 * Provides type-safe access to settings based on block type
 */
export function useBlockSettings(block: Ref<SectionBlock>) {
  // Layout block settings
  const containerSettings = computed(() =>
    block.value.type === 'container' ? block.value.settings as ContainerSettings : null
  )

  const gridSettings = computed(() =>
    block.value.type === 'grid' ? block.value.settings as GridSettings : null
  )

  const stackSettings = computed(() =>
    block.value.type === 'stack' ? block.value.settings as StackSettings : null
  )

  const canvasSettings = computed(() =>
    block.value.type === 'canvas' ? block.value.settings as CanvasSettings : null
  )

  // Content block settings
  const headingSettings = computed(() =>
    block.value.type === 'heading' ? block.value.settings as HeadingSettings : null
  )

  const textSettings = computed(() =>
    block.value.type === 'text' ? block.value.settings as TextSettings : null
  )

  const imageSettings = computed(() =>
    block.value.type === 'image' ? block.value.settings as ImageSettings : null
  )

  const videoSettings = computed(() =>
    block.value.type === 'video' ? block.value.settings as VideoSettings : null
  )

  const buttonSettings = computed(() =>
    block.value.type === 'button' ? block.value.settings as ButtonSettings : null
  )

  const iconSettings = computed(() =>
    block.value.type === 'icon' ? block.value.settings as IconSettings : null
  )

  const iconStyles = computed(() =>
    block.value.type === 'icon' ? block.value.styles as IconStyles : null
  )

  const variantsSettings = computed(() =>
    block.value.type === 'variants' ? block.value.settings as VariantsSettings : null
  )

  const variantsStyles = computed(() =>
    block.value.type === 'variants' ? block.value.styles as VariantsStyles : null
  )

  // Check if block is hidden
  const isBlockHidden = computed(() => {
    const settings = block.value.settings as Record<string, unknown>
    return !!settings.isHidden
  })

  return {
    // Layout blocks
    containerSettings,
    gridSettings,
    stackSettings,
    canvasSettings,

    // Content blocks
    headingSettings,
    textSettings,
    imageSettings,
    videoSettings,
    buttonSettings,
    iconSettings,
    iconStyles,
    variantsSettings,
    variantsStyles,

    // Utility
    isBlockHidden,
  }
}
