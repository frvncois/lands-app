# Modal System Documentation

## Overview

The unified modal system provides consistent, reusable modal components with built-in features like scroll locking, ESC key handling, backdrop management, and v-model support.

## Architecture

```
src/components/ui/Modal/
├── Modal.vue              # Base modal component with flexible slots
├── ConfirmModal.vue       # Confirmation dialogs with optional input validation
├── FormModal.vue          # Form submission modals
├── PickerModal.vue        # Large selection modals with search/filters
├── FloatingPanel.vue      # Bottom-positioned floating panels
├── useModal.ts            # Composable for modal state management
├── modal.types.ts         # TypeScript type definitions
├── modal.constants.ts     # Shared constants (z-index, sizes, etc.)
└── index.ts               # Centralized exports
```

---

## Available Components

### 1. Modal (Base Component)

**Use for:** Custom modals that don't fit the specialized variants.

**Features:**
- Flexible header, content, and footer slots
- Multiple size options
- Backdrop blur effects
- Scroll lock management
- ESC key and backdrop click handling
- Loading/persistent states

**Example:**

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui'

const isOpen = ref(false)
</script>

<template>
  <Modal
    v-model:open="isOpen"
    size="md"
    title="Custom Modal"
    description="Optional description text"
    backdrop="blur"
  >
    <!-- Content -->
    <div class="space-y-4">
      <p>Your modal content here</p>
    </div>

    <!-- Footer -->
    <template #footer>
      <Button variant="ghost" @click="isOpen = false">Cancel</Button>
      <Button @click="handleSubmit">Confirm</Button>
    </template>
  </Modal>
</template>
```

**Props:**

```typescript
interface ModalProps {
  open: boolean                      // Modal visibility
  size?: ModalSize                   // 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'full' | 'screen'
  variant?: ModalVariant             // 'default' | 'drawer' | 'fullscreen' | 'floating'
  position?: ModalPosition           // 'center' | 'top' | 'bottom-right' | 'bottom-left'
  backdrop?: ModalBackdrop           // 'default' | 'blur' | 'dark' | 'none'
  closable?: boolean                 // Show close button (default: true)
  closeOnBackdrop?: boolean          // Close on backdrop click (default: true)
  closeOnEscape?: boolean            // Close on ESC key (default: true)
  persistent?: boolean               // Prevent closing (for loading states)
  scrollBehavior?: 'inside' | 'outside'  // Scroll behavior
  title?: string                     // Optional header title
  description?: string               // Optional header description
}
```

**Events:**

```typescript
emit('update:open', value: boolean)  // v-model support
emit('close')                        // When modal closes
```

**Slots:**

```typescript
#header      // Custom header content
#default     // Main content area
#footer      // Footer actions
```

---

### 2. ConfirmModal

**Use for:** Destructive actions requiring user confirmation (delete, unpublish, leave, etc.)

**Features:**
- Warning/danger/info variants with colored icons
- Optional typed input validation (user must type exact text)
- Loading states
- Built-in confirm/cancel buttons

**Example:**

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ConfirmModal } from '@/components/ui/Modal'

const showDeleteModal = ref(false)
const isDeleting = ref(false)

async function handleDelete() {
  isDeleting.value = true
  try {
    await deleteProject()
    showDeleteModal.value = false
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <ConfirmModal
    v-model:open="showDeleteModal"
    title="Delete Project"
    message="This will permanently delete your project and all of its data. This action cannot be undone."
    confirm-text="Delete Project"
    confirm-input="delete my project"  <!-- User must type this to confirm -->
    variant="danger"
    :loading="isDeleting"
    @confirm="handleDelete"
  />
</template>
```

**Props:**

```typescript
interface ConfirmModalProps {
  open: boolean
  title: string                      // Modal title
  message: string                    // Confirmation message
  confirmText?: string               // Confirm button text (default: 'Confirm')
  cancelText?: string                // Cancel button text (default: 'Cancel')
  variant?: ConfirmVariant           // 'danger' | 'warning' | 'info'
  loading?: boolean                  // Show loading state
  confirmInput?: string              // Require user to type this text
  // Plus all base ModalProps except 'size' and 'variant'
}
```

**Variants:**

| Variant | Icon | Use Case |
|---------|------|----------|
| `danger` | 🗑️ trash | Permanent deletions, destructive actions |
| `warning` | ⚠️ alert | Potentially dangerous actions with undo |
| `info` | ℹ️ info | Important confirmations, non-destructive |

---

### 3. FormModal

**Use for:** Forms requiring user input and submission.

**Features:**
- Built-in form wrapper with submit handling
- Submit/cancel buttons
- Loading and disabled states
- Auto-focuses on first input

**Example:**

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { FormModal } from '@/components/ui/Modal'
import { Input, FormField, Alert } from '@/components/ui'

const isOpen = ref(false)
const isSubmitting = ref(false)
const email = ref('')
const error = ref('')

async function handleSubmit() {
  if (!email.value.trim()) {
    error.value = 'Email is required'
    return
  }

  isSubmitting.value = true
  try {
    await inviteUser(email.value)
    isOpen.value = false
  } catch (e) {
    error.value = e.message
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <FormModal
    v-model:open="isOpen"
    title="Invite User"
    description="Send an invitation to collaborate"
    submit-text="Send Invite"
    :loading="isSubmitting"
    @submit="handleSubmit"
  >
    <div class="space-y-4">
      <FormField label="Email address">
        <Input
          v-model="email"
          type="email"
          placeholder="colleague@example.com"
          :disabled="isSubmitting"
        />
      </FormField>

      <Alert v-if="error" variant="error">{{ error }}</Alert>
    </div>
  </FormModal>
</template>
```

**Props:**

```typescript
interface FormModalProps extends ModalProps {
  title: string
  description?: string
  submitText?: string                // Submit button text (default: 'Submit')
  cancelText?: string                // Cancel button text (default: 'Cancel')
  loading?: boolean                  // Show loading state on submit button
  disabled?: boolean                 // Disable submit button
}
```

---

### 4. PickerModal

**Use for:** Selecting from a large set of options (icons, images, templates, etc.)

**Features:**
- Large modal size (4xl)
- Built-in filter/search area
- Scrollable content area
- Selection state tracking
- Footer info area

**Example:**

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { PickerModal } from '@/components/ui/Modal'
import { Input, Icon } from '@/components/ui'

const isOpen = ref(false)
const searchQuery = ref('')
const selectedIcon = ref<string | null>(null)

const filteredIcons = computed(() => {
  // Filter logic
})

function handleConfirm() {
  if (selectedIcon.value) {
    emit('select', selectedIcon.value)
    isOpen.value = false
  }
}
</script>

<template>
  <PickerModal
    v-model:open="isOpen"
    title="Select Icon"
    subtitle="Choose from 1,400+ icons"
    confirm-text="Select Icon"
    :has-selection="!!selectedIcon"
    @confirm="handleConfirm"
  >
    <!-- Filters -->
    <template #filters>
      <Input
        v-model="searchQuery"
        placeholder="Search icons..."
        class="flex-1"
      />
      <select v-model="category">
        <option value="all">All Categories</option>
        <!-- ... -->
      </select>
    </template>

    <!-- Content -->
    <div class="grid grid-cols-8 gap-2">
      <button
        v-for="icon in filteredIcons"
        :key="icon"
        @click="selectedIcon = icon"
      >
        <Icon :name="icon" />
      </button>
    </div>

    <!-- Footer info -->
    <template #footer-info>
      <span class="text-xs text-muted-foreground">
        {{ filteredIcons.length }} icons found
      </span>
    </template>
  </PickerModal>
</template>
```

**Props:**

```typescript
interface PickerModalProps extends ModalProps {
  title: string
  subtitle?: string                  // Description below title
  confirmText?: string               // Confirm button text (default: 'Select')
  cancelText?: string                // Cancel button text (default: 'Cancel')
  loading?: boolean                  // Loading state
  hasSelection?: boolean             // Enable/disable confirm button
}
```

**Slots:**

```typescript
#filters       // Search/filter controls above content
#default       // Main content area (scrollable)
#footer-info   // Left side of footer (e.g., result count)
```

---

### 5. FloatingPanel

**Use for:** Chat interfaces, support widgets, notifications.

**Features:**
- Fixed positioning (bottom-right/bottom-left)
- No backdrop
- Slide-up animation
- Customizable width
- Does not lock scroll

**Example:**

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { FloatingPanel } from '@/components/ui/Modal'
import { Button, Icon, Input } from '@/components/ui'

const isOpen = ref(false)
const message = ref('')

function sendMessage() {
  // Send message logic
  message.value = ''
}
</script>

<template>
  <FloatingPanel
    v-model:open="isOpen"
    position="bottom-right"
    width="380px"
  >
    <template #default="{ close }">
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b">
        <h3 class="font-semibold">Support Chat</h3>
        <button @click="close">
          <Icon name="lni-xmark" />
        </button>
      </div>

      <!-- Messages -->
      <div class="flex-1 overflow-y-auto p-4">
        <!-- Message list -->
      </div>

      <!-- Input -->
      <div class="p-4 border-t">
        <div class="flex gap-2">
          <Input v-model="message" placeholder="Type a message..." />
          <Button @click="sendMessage">Send</Button>
        </div>
      </div>
    </template>
  </FloatingPanel>
</template>
```

**Props:**

```typescript
interface FloatingPanelProps {
  open: boolean
  position?: 'bottom-right' | 'bottom-left'  // Position (default: 'bottom-right')
  width?: string                              // Custom width (default: '380px')
}
```

**Scoped Slot:**

```typescript
#default="{ close }"   // Access to close function
```

---

## useModal Composable

**Use for:** Custom modal logic and state management.

**Example:**

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useModal, useModalState } from '@/components/ui/Modal'

// Simple state management
const { isOpen, open, close, toggle } = useModalState()

// Advanced usage with options
const isModalOpen = ref(false)
const { close: closeModal, handleBackdropClick } = useModal(isModalOpen, {
  closeOnEscape: true,
  closeOnBackdrop: true,
  lockScroll: true,
  persistent: false,
  onClose: () => console.log('Modal closed'),
  onOpen: () => console.log('Modal opened')
})
</script>
```

**API:**

```typescript
// useModalState - Simple state helper
function useModalState(initialValue = false) {
  return {
    isOpen: Ref<boolean>
    open: () => void
    close: () => void
    toggle: () => void
  }
}

// useModal - Advanced modal management
function useModal(isOpen: Ref<boolean>, options?: UseModalOptions) {
  return {
    close: () => void
    handleBackdropClick: () => void
    isClosing: Ref<boolean>
  }
}

interface UseModalOptions {
  closeOnEscape?: boolean      // Default: true
  closeOnBackdrop?: boolean    // Default: true
  lockScroll?: boolean         // Default: true
  persistent?: boolean         // Default: false
  onClose?: () => void
  onOpen?: () => void
}
```

---

## Constants

### Modal Sizes

```typescript
const MODAL_SIZES = {
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
}
```

### Z-Index Layers

```typescript
const Z_INDEX = {
  dropdown: 50,
  sticky: 100,
  popover: 1000,
  modal: 2000,
  modalBackdrop: 1999,
  toast: 3000,
  tooltip: 4000,
  tour: 5000,
}
```

---

## Best Practices

### 1. Choose the Right Component

| Use Case | Component |
|----------|-----------|
| Delete/destructive action | `ConfirmModal` |
| Form with submit/cancel | `FormModal` |
| Choose from many options | `PickerModal` |
| Chat/support interface | `FloatingPanel` |
| Custom layout | `Modal` (base) |

### 2. State Management

**✅ Do:**
```vue
<script setup lang="ts">
const showModal = ref(false)
</script>

<template>
  <Button @click="showModal = true">Open</Button>
  <ConfirmModal v-model:open="showModal" ... />
</template>
```

**❌ Don't:**
```vue
<!-- Don't manually manage open state without v-model -->
<ConfirmModal :open="showModal" ... />
```

### 3. Loading States

**✅ Do:**
```vue
<ConfirmModal
  :loading="isDeleting"
  :persistent="isDeleting"  <!-- Prevent closing while loading -->
  @confirm="handleDelete"
/>
```

### 4. Form Validation

**✅ Do:**
```vue
<FormModal
  :disabled="!isValid"
  @submit="handleSubmit"
>
  <Input v-model="email" :error="emailError" />
</FormModal>
```

### 5. Reset State on Close

**✅ Do:**
```vue
<script setup lang="ts">
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    // Reset form
    email.value = ''
    error.value = ''
  }
})
</script>
```

---

## Migration Guide

### From Old Modal.vue

**Before:**
```vue
<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-[9999]">
      <div class="absolute inset-0 bg-black/50" @click="close" />
      <div class="relative bg-card rounded-lg p-6">
        <h2>{{ title }}</h2>
        <div>{{ content }}</div>
        <button @click="close">Cancel</button>
        <button @click="confirm">Confirm</button>
      </div>
    </div>
  </Teleport>
</template>
```

**After:**
```vue
<template>
  <ConfirmModal
    v-model:open="open"
    :title="title"
    :message="content"
    @confirm="confirm"
  />
</template>
```

### Common Patterns

#### 1. Delete Confirmation

```vue
<ConfirmModal
  v-model:open="showDelete"
  title="Delete Item"
  message="This action cannot be undone."
  confirm-input="delete"
  variant="danger"
  :loading="isDeleting"
  @confirm="handleDelete"
/>
```

#### 2. Form Submission

```vue
<FormModal
  v-model:open="showForm"
  title="Edit Profile"
  :loading="isSaving"
  @submit="handleSave"
>
  <FormField label="Name">
    <Input v-model="name" />
  </FormField>
</FormModal>
```

#### 3. Custom Modal with Complex Footer

```vue
<Modal v-model:open="showCustom" size="lg">
  <div>Content</div>

  <template #footer>
    <div class="w-full space-y-3">
      <Button variant="default" class="w-full" @click="action1">
        Primary Action
      </Button>
      <Button variant="outline" class="w-full" @click="action2">
        Secondary Action
      </Button>
      <Button variant="ghost" class="w-full" @click="close">
        Cancel
      </Button>
    </div>
  </template>
</Modal>
```

---

## TypeScript Support

All components are fully typed with TypeScript:

```typescript
import type {
  ModalProps,
  ConfirmModalProps,
  FormModalProps,
  PickerModalProps,
  FloatingPanelProps,
  ModalSize,
  ModalVariant,
  ConfirmVariant,
} from '@/components/ui/Modal'
```

---

## Accessibility

All modal components include:

- ✅ `role="dialog"`
- ✅ `aria-modal="true"`
- ✅ `aria-labelledby` (linked to title)
- ✅ `aria-describedby` (linked to description)
- ✅ Keyboard navigation (ESC to close)
- ✅ Focus trap (keyboard focus stays within modal)
- ✅ Scroll lock on body
- ✅ Proper z-index layering

---

## Examples in Codebase

See these files for real-world examples:

- **ConfirmModal:** `src/components/modal/AccountDelete.vue`
- **FormModal:** `src/components/modal/InviteCollaborator.vue`
- **PickerModal:** `src/components/modal/LucideIconPicker.vue`
- **FloatingPanel:** `src/components/modal/SupportChat.vue`
- **Custom Modal:** `src/components/modal/ProjectPublished.vue`

---

## Troubleshooting

### Modal doesn't close on ESC

```vue
<!-- Make sure closeOnEscape is not set to false -->
<Modal v-model:open="isOpen" :closeOnEscape="true" />
```

### Modal stays open during loading

```vue
<!-- Use persistent prop -->
<ConfirmModal :loading="isLoading" :persistent="isLoading" />
```

### Content overflows

```vue
<!-- Use scrollBehavior -->
<Modal v-model:open="isOpen" scrollBehavior="inside" />
```

### Z-index conflicts

All modals use `Z_INDEX.modal = 2000` from constants. If you need custom z-index, wrap in a portal:

```vue
<div style="z-index: 3000">
  <Modal ... />
</div>
```
