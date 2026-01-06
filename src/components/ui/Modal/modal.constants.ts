export const MODAL_SIZES: Record<string, string> = {
  'xs': 'max-w-xs',       // 320px
  'sm': 'max-w-sm',       // 384px
  'md': 'max-w-md',       // 448px
  'lg': 'max-w-lg',       // 512px
  'xl': 'max-w-xl',       // 576px
  '2xl': 'max-w-2xl',     // 672px
  '3xl': 'max-w-3xl',     // 768px
  '4xl': 'max-w-4xl',     // 896px
  'full': 'max-w-6xl',    // 1152px
  'screen': 'max-w-none w-full h-full',
} as const

export const Z_INDEX = {
  dropdown: 50,
  sticky: 100,
  popover: 1000,
  modal: 2000,
  modalBackdrop: 1999,
  toast: 3000,
  tooltip: 4000,
  tour: 5000,
} as const

export const BACKDROP_CLASSES: Record<string, string> = {
  'default': 'bg-black/50',
  'blur': 'bg-black/50 backdrop-blur-sm',
  'dark': 'bg-black/70',
  'none': 'bg-transparent pointer-events-none',
} as const

export const CONFIRM_VARIANTS = {
  danger: {
    icon: 'lni-trash-3',
    iconBg: 'bg-destructive/10',
    iconColor: 'text-destructive',
    buttonVariant: 'destructive',
  },
  warning: {
    icon: 'lni-warning',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-500',
    buttonVariant: 'warning',
  },
  info: {
    icon: 'lni-information',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-500',
    buttonVariant: 'default',
  },
} as const

export const MODAL_TRANSITIONS = {
  backdrop: {
    enterActiveClass: 'duration-200 ease-out',
    enterFromClass: 'opacity-0',
    enterToClass: 'opacity-100',
    leaveActiveClass: 'duration-150 ease-in',
    leaveFromClass: 'opacity-100',
    leaveToClass: 'opacity-0',
  },
  modal: {
    enterActiveClass: 'duration-200 ease-out',
    enterFromClass: 'opacity-0 scale-95',
    enterToClass: 'opacity-100 scale-100',
    leaveActiveClass: 'duration-150 ease-in',
    leaveFromClass: 'opacity-100 scale-100',
    leaveToClass: 'opacity-0 scale-95',
  },
  floating: {
    enterActiveClass: 'transition-all duration-200 ease-out',
    enterFromClass: 'opacity-0 translate-y-4 scale-95',
    enterToClass: 'opacity-100 translate-y-0 scale-100',
    leaveActiveClass: 'transition-all duration-150 ease-in',
    leaveFromClass: 'opacity-100 translate-y-0 scale-100',
    leaveToClass: 'opacity-0 translate-y-4 scale-95',
  },
} as const
