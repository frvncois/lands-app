<script setup lang="ts">
import { ref, watch } from 'vue'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'

const props = withDefaults(defineProps<{
  label: string
  modelValue?: string
  placeholder?: string
  type?: 'text' | 'email' | 'password' | 'slug' | 'textarea'
  size?: 'sm' | 'md' | 'lg'
}>(), {
  size: 'md',
  type: 'text',
})

const sizes = {
  sm: { label: 'text-xs', input: 'text-xs rounded-lg p-1.5', slug: 'text-xs rounded-lg px-1.5 py-1.5', eye: 'h-3.5 w-3.5 right-1.5' },
  md: { label: 'text-xs', input: 'text-sm rounded-xl p-2',   slug: 'text-sm rounded-xl px-2 py-2',     eye: 'h-4 w-4 right-2' },
  lg: { label: 'text-xs', input: 'text-base rounded-xl p-3', slug: 'text-base rounded-xl px-3 py-3',   eye: 'h-5 w-5 right-3' },
}

const visible = ref(false)
const internal = ref(props.modelValue ?? '')

watch(() => props.modelValue, v => { internal.value = v ?? '' })

function onInput(e: Event) {
  internal.value = (e.target as HTMLInputElement).value
  emit('update:modelValue', internal.value)
}

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <div class="flex flex-col gap-2 flex-1">
    <span v-if="label" class="text-xs font-medium text-gray-500" :class="sizes[size].label">{{ label }}</span>
    <div class="relative">
      <div v-if="type === 'slug'" class="flex items-center border border-gray-300 focus-within:border-gray-400 focus-within:ring-4 focus-within:ring-gray-900/5 transition-colors" :class="sizes[size].slug">
        <input
          class="flex-1 min-w-0 bg-transparent outline-none text-gray-900 placeholder:text-gray-300"
          type="text"
          :value="internal"
          :placeholder="placeholder"
          @input="onInput"
        />
        <span class="shrink-0 text-gray-400 pl-0.5">.lands.app</span>
      </div>
      <textarea
        v-else-if="type === 'textarea'"
        class="w-full text-gray-900 bg-transparent border border-gray-300 focus:border-gray-400 focus:ring-4 focus:ring-gray-900/5 outline-none transition-colors placeholder:text-gray-300 resize-none"
        :class="sizes[size].input"
        rows="3"
        :value="internal"
        :placeholder="placeholder"
        @input="onInput"
      />
      <input
        v-else-if="type !== 'password'"
        class="w-full text-gray-900 bg-transparent border border-gray-300 focus:border-gray-400 focus:ring-4 focus:ring-gray-900/5 outline-none transition-colors placeholder:text-gray-300"
        :class="sizes[size].input"
        :type="type"
        :value="internal"
        :placeholder="placeholder"
        @input="onInput"
      />
      <template v-else>
        <input
          v-show="!visible"
          type="password"
          class="w-full text-gray-900 bg-transparent border border-gray-300 focus:border-gray-400 focus:ring-4 focus:ring-gray-900/5 outline-none transition-colors placeholder:text-gray-300 pr-9"
          :class="sizes[size].input"
          :value="internal"
          :placeholder="placeholder"
          @input="onInput"
        />
        <input
          v-show="visible"
          type="text"
          class="w-full text-gray-900 bg-transparent border border-gray-300 focus:border-gray-400 focus:ring-4 focus:ring-gray-900/5 outline-none transition-colors placeholder:text-gray-300 pr-9"
          :class="sizes[size].input"
          :value="internal"
          :placeholder="placeholder"
          @input="onInput"
        />
        <button
          type="button"
          class="absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          :class="sizes[size].eye"
          @click="visible = !visible"
        >
          <EyeSlashIcon v-if="visible" class="w-full h-full" />
          <EyeIcon v-else class="w-full h-full" />
        </button>
      </template>
    </div>
  </div>
</template>
