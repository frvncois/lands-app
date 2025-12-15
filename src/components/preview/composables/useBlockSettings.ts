import { computed, type Ref } from 'vue'
import type {
  SectionBlock,
  ContainerSettings,
  GridSettings,
  StackSettings,
  DividerSettings,
  HeadingSettings,
  TextSettings,
  ImageSettings,
  VideoSettings,
  ButtonSettings,
  IconSettings,
  VariantsSettings,
  FormSettings,
  FormLabelSettings,
  FormInputSettings,
  FormTextareaSettings,
  FormSelectSettings,
  FormRadioSettings,
  FormCheckboxSettings,
  FormButtonSettings,
  CanvasSettings,
  IconStyles,
  VariantsStyles,
  FormLabelStyles,
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
  const dividerSettings = computed(() =>
    block.value.type === 'divider' ? block.value.settings as DividerSettings : null
  )

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

  // Form block settings
  const formSettings = computed(() =>
    block.value.type === 'form' ? block.value.settings as FormSettings : null
  )

  const formLabelSettings = computed(() =>
    block.value.type === 'form-label' ? block.value.settings as FormLabelSettings : null
  )

  const formLabelStyles = computed(() =>
    block.value.type === 'form-label' ? block.value.styles as FormLabelStyles : null
  )

  const formInputSettings = computed(() =>
    block.value.type === 'form-input' ? block.value.settings as FormInputSettings : null
  )

  const formTextareaSettings = computed(() =>
    block.value.type === 'form-textarea' ? block.value.settings as FormTextareaSettings : null
  )

  const formSelectSettings = computed(() =>
    block.value.type === 'form-select' ? block.value.settings as FormSelectSettings : null
  )

  const formRadioSettings = computed(() =>
    block.value.type === 'form-radio' ? block.value.settings as FormRadioSettings : null
  )

  const formCheckboxSettings = computed(() =>
    block.value.type === 'form-checkbox' ? block.value.settings as FormCheckboxSettings : null
  )

  const formButtonSettings = computed(() =>
    block.value.type === 'form-button' ? block.value.settings as FormButtonSettings : null
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
    dividerSettings,
    headingSettings,
    textSettings,
    imageSettings,
    videoSettings,
    buttonSettings,
    iconSettings,
    iconStyles,
    variantsSettings,
    variantsStyles,

    // Form blocks
    formSettings,
    formLabelSettings,
    formLabelStyles,
    formInputSettings,
    formTextareaSettings,
    formSelectSettings,
    formRadioSettings,
    formCheckboxSettings,
    formButtonSettings,

    // Utility
    isBlockHidden,
  }
}
