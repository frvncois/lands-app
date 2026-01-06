// Components
export { default as Modal } from './Modal.vue'
export { default as ConfirmModal } from './ConfirmModal.vue'
export { default as FormModal } from './FormModal.vue'
export { default as PickerModal } from './PickerModal.vue'
export { default as FloatingPanel } from './FloatingPanel.vue'

// Composables
export { useModal, useModalState } from './useModal'

// Types
export type {
  ModalSize,
  ModalVariant,
  ModalPosition,
  ModalBackdrop,
  ModalProps,
  ConfirmModalProps,
  ConfirmVariant,
  FormModalProps,
  PickerModalProps,
  WizardModalProps,
  FloatingPanelProps,
} from './modal.types'

// Constants
export { MODAL_SIZES, Z_INDEX, BACKDROP_CLASSES, CONFIRM_VARIANTS } from './modal.constants'
