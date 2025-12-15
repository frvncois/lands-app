<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useEditorStore } from '@/stores/editor'
import { Icon } from '@/components/ui'

const props = defineProps<{
  modelValue?: string
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editorStore = useEditorStore()

const isOpen = ref(false)
const inputValue = ref(props.modelValue || '')
const dropdownRef = ref<HTMLElement | null>(null)

// Get container blocks for section anchors
const sectionBlocks = computed(() => {
  return editorStore.blocks.filter(block =>
    block.type === 'container' || block.type === 'stack' || block.type === 'grid'
  ).map(block => ({
    id: block.id,
    name: block.name || `${block.type.charAt(0).toUpperCase() + block.type.slice(1)}`,
    type: 'section' as const,
  }))
})

// All link options
const linkOptions = computed(() => {
  const options: Array<{
    id: string
    name: string
    type: 'preset' | 'section'
    icon?: string
    prefix?: string
  }> = [
    { id: 'url', name: 'External URL', type: 'preset', icon: 'world', prefix: '' },
    { id: 'email', name: 'Email address', type: 'preset', icon: 'envelope', prefix: 'mailto:' },
    { id: 'phone', name: 'Phone number', type: 'preset', icon: 'phone', prefix: 'tel:' },
  ]

  // Add sections
  sectionBlocks.value.forEach(section => {
    options.push({
      id: section.id,
      name: section.name,
      type: 'section',
      icon: 'arrow-down',
      prefix: '#',
    })
  })

  return options
})

// Get display value for the input
const displayValue = computed(() => {
  if (!props.modelValue) return ''

  // Check if it's a section anchor
  if (props.modelValue.startsWith('#')) {
    const sectionId = props.modelValue.slice(1)
    const section = sectionBlocks.value.find(s => s.id === sectionId)
    if (section) return `Scroll to: ${section.name}`
  }

  // Check for mailto/tel
  if (props.modelValue.startsWith('mailto:')) {
    return props.modelValue.replace('mailto:', '')
  }
  if (props.modelValue.startsWith('tel:')) {
    return props.modelValue.replace('tel:', '')
  }

  return props.modelValue
})

// Filter options based on input
const filteredOptions = computed(() => {
  if (!inputValue.value) return linkOptions.value

  const search = inputValue.value.toLowerCase()
  return linkOptions.value.filter(opt =>
    opt.name.toLowerCase().includes(search)
  )
})

// Has sections
const hasSections = computed(() => sectionBlocks.value.length > 0)

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  inputValue.value = target.value
  emit('update:modelValue', target.value)
  isOpen.value = true
}

function handleFocus() {
  isOpen.value = true
  inputValue.value = displayValue.value
}

function handleBlur() {
  // Delay to allow click on dropdown items
  setTimeout(() => {
    isOpen.value = false
  }, 150)
}

function selectOption(option: typeof linkOptions.value[0]) {
  if (option.type === 'section') {
    // Section anchor
    emit('update:modelValue', `#${option.id}`)
    inputValue.value = `Scroll to: ${option.name}`
  } else if (option.type === 'preset') {
    // Preset - set prefix and focus input for user to complete
    if (option.prefix) {
      emit('update:modelValue', option.prefix)
      inputValue.value = option.prefix
    } else {
      inputValue.value = ''
      emit('update:modelValue', '')
    }
  }
  isOpen.value = false
}

function handleClickOutside(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div ref="dropdownRef" class="relative w-full">
    <!-- Input field -->
    <div class="relative">
      <input
        type="text"
        :value="displayValue"
        :placeholder="placeholder || 'Enter URL or select...'"
        class="w-full pl-8 pr-2.5 py-1.5 text-xs bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring/25 focus:bg-background transition-colors"
        spellcheck="false"
        autocomplete="off"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
      />
      <Icon
        name="world"
        :size="12"
        class="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
      />
    </div>

    <!-- Dropdown -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute top-full left-0 right-0 mt-1 bg-popover backdrop-blur-sm border border-border/75 rounded-lg shadow-lg z-50 max-h-56 overflow-y-auto origin-top"
      >
        <!-- Link types -->
        <div class="p-1 border-b border-border/50">
          <div class="px-2 py-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
            Link type
          </div>
          <button
            v-for="opt in filteredOptions.filter(o => o.type === 'preset')"
            :key="opt.id"
            type="button"
            class="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-md transition-colors cursor-pointer text-left hover:bg-accent/75"
            @mousedown.prevent="selectOption(opt)"
          >
            <Icon :name="opt.icon || 'world'" :size="12" class="text-muted-foreground" />
            <span>{{ opt.name }}</span>
          </button>
        </div>

        <!-- Sections -->
        <div v-if="hasSections" class="p-1">
          <div class="px-2 py-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
            Scroll to section
          </div>
          <button
            v-for="opt in filteredOptions.filter(o => o.type === 'section')"
            :key="opt.id"
            type="button"
            class="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-md transition-colors cursor-pointer text-left hover:bg-accent/75"
            @mousedown.prevent="selectOption(opt)"
          >
            <Icon name="arrow-down" :size="12" class="text-muted-foreground" />
            <span>{{ opt.name }}</span>
          </button>
        </div>

        <!-- Empty state for sections -->
        <div v-else class="p-1 border-t border-border/50">
          <div class="px-2 py-2 text-xs text-muted-foreground text-center">
            No sections to scroll to
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
