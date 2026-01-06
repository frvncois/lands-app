export type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'full' | 'screen'

export type ModalVariant = 'default' | 'drawer' | 'fullscreen' | 'floating'

export type ModalPosition = 'center' | 'top' | 'bottom-right' | 'bottom-left'

export type ModalBackdrop = 'default' | 'blur' | 'dark' | 'none'

export type ConfirmVariant = 'danger' | 'warning' | 'info'

export interface ModalProps {
  open: boolean
  size?: ModalSize
  variant?: ModalVariant
  position?: ModalPosition
  backdrop?: ModalBackdrop
  closable?: boolean
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
  persistent?: boolean
  scrollBehavior?: 'inside' | 'outside'
  title?: string
  description?: string
}

export interface ConfirmModalProps extends Omit<ModalProps, 'size' | 'variant'> {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: ConfirmVariant
  loading?: boolean
  confirmInput?: string
}

export interface FormModalProps extends ModalProps {
  title: string
  description?: string
  submitText?: string
  cancelText?: string
  loading?: boolean
  disabled?: boolean
}

export interface PickerModalProps extends ModalProps {
  title: string
  subtitle?: string
  confirmText?: string
  cancelText?: string
  loading?: boolean
  hasSelection?: boolean
}

export interface WizardModalProps {
  open: boolean
  currentStep: number
  totalSteps: number
  stepTitle: string
  canGoBack?: boolean
  canContinue?: boolean
  loading?: boolean
}

export interface FloatingPanelProps {
  open: boolean
  position?: 'bottom-right' | 'bottom-left'
  width?: string
}
