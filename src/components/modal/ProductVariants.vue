<script setup lang="ts">
import { ref, watch } from 'vue'
import type {
  VariantsSettings,
  VariantOptionType,
  VariantOptionValue,
  ProductVariant,
} from '@/types/designer'
import { generateId } from '@/lib/designer-utils'
import { Button, Input } from '@/components/ui'
import Modal from '@/components/ui/Modal.vue'
import ColorInput from '@/components/inspector/ColorInput.vue'

const props = defineProps<{
  open: boolean
  settings: VariantsSettings
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'update:settings': [settings: VariantsSettings]
}>()

// Local copy of settings
const localSettings = ref<VariantsSettings>({ ...props.settings })

// Sync when modal opens
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    localSettings.value = JSON.parse(JSON.stringify(props.settings))
  }
})

// Save and close
function save() {
  emit('update:settings', localSettings.value)
  emit('update:open', false)
}

// Option Type management
function addOptionType() {
  localSettings.value.optionTypes.push({
    id: generateId(),
    name: 'Option',
    displayStyle: 'buttons',
    values: [{ id: generateId(), value: 'Value 1' }],
  })
}

function removeOptionType(index: number) {
  localSettings.value.optionTypes.splice(index, 1)
}

function addOptionValue(optIdx: number) {
  const optionType = localSettings.value.optionTypes[optIdx]
  if (!optionType) return
  optionType.values.push({
    id: generateId(),
    value: `Value ${optionType.values.length + 1}`,
  })
}

function removeOptionValue(optIdx: number, valIdx: number) {
  const optionType = localSettings.value.optionTypes[optIdx]
  if (!optionType) return
  optionType.values.splice(valIdx, 1)
}

// Variant management
function addVariant() {
  // Create empty option values based on current option types
  const optionValues: Record<string, string> = {}
  for (const optType of localSettings.value.optionTypes) {
    const firstValue = optType.values[0]
    if (firstValue) {
      optionValues[optType.name] = firstValue.value
    }
  }
  localSettings.value.variants.push({
    id: generateId(),
    optionValues,
    price: '$99.00',
    buyLink: '#',
  })
}

function removeVariant(index: number) {
  localSettings.value.variants.splice(index, 1)
}

// Generate all combinations
function generateAllVariants() {
  const optionTypes = localSettings.value.optionTypes
  if (optionTypes.length === 0) return

  // Get all values for each option type
  const allValues = optionTypes.map((ot: VariantOptionType) => ot.values.map((v: VariantOptionValue) => ({ name: ot.name, value: v.value })))

  // Generate cartesian product
  function cartesian(arrays: { name: string; value: string }[][]): Record<string, string>[] {
    if (arrays.length === 0) return [{}]
    const [first, ...rest] = arrays
    if (!first) return [{}]
    const restProduct = cartesian(rest)
    const result: Record<string, string>[] = []
    for (const item of first) {
      for (const combo of restProduct) {
        result.push({ ...combo, [item.name]: item.value })
      }
    }
    return result
  }

  const combinations = cartesian(allValues)

  // Create variants for combinations that don't exist
  const existingKeys = new Set(
    localSettings.value.variants.map((v: ProductVariant) => JSON.stringify(v.optionValues))
  )

  for (const combo of combinations) {
    const key = JSON.stringify(combo)
    if (!existingKeys.has(key)) {
      localSettings.value.variants.push({
        id: generateId(),
        optionValues: combo,
        price: '$99.00',
        buyLink: '#',
      })
    }
  }
}
</script>

<template>
  <Modal :open="open" size="full" @update:open="emit('update:open', $event)">
    <template #header>
      <h2 class="text-lg font-semibold">Manage Variants</h2>
      <p class="text-sm text-muted-foreground mt-1">
        Define option types (Color, Size, etc.) and their variant combinations
      </p>
    </template>

    <div class="grid grid-cols-2 gap-6 max-h-[60vh] overflow-hidden">
      <!-- Left: Option Types -->
      <div class="space-y-4 overflow-y-auto pr-2">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-medium">Option Types</h3>
          <Button size="sm" variant="outline" @click="addOptionType">
            <Icon name="plus" class="mr-1" /> Add Option
          </Button>
        </div>

        <div class="space-y-3">
          <div
            v-for="(optionType, optIdx) in localSettings.optionTypes"
            :key="optionType.id"
            class="p-4 bg-secondary/50 rounded-lg space-y-3"
          >
            <div class="flex items-center gap-2">
              <Input
                v-model="optionType.name"
                placeholder="Option name (e.g., Color, Size)"
                class="flex-1"
              />
              <button
                class="p-2 text-muted-foreground hover:text-destructive transition-colors"
                @click="removeOptionType(optIdx)"
              >
                <Icon name="trash-3" />
              </button>
            </div>

            <div class="flex items-center gap-2">
              <span class="text-xs text-muted-foreground">Display:</span>
              <select
                v-model="optionType.displayStyle"
                class="text-xs px-2 py-1 border border-input rounded bg-background"
              >
                <option value="buttons">Buttons</option>
                <option value="swatches">Color Swatches</option>
                <option value="dropdown">Dropdown</option>
              </select>
            </div>

            <div class="space-y-2">
              <div class="text-xs text-muted-foreground">Values:</div>
              <div class="flex flex-wrap gap-2">
                <div
                  v-for="(val, valIdx) in optionType.values"
                  :key="val.id"
                  class="flex items-center gap-1 px-2 py-1 bg-background rounded border border-border"
                >
                  <input
                    v-model="val.value"
                    class="w-16 text-xs bg-transparent outline-none"
                    placeholder="Value"
                  />
                  <ColorInput
                    v-if="optionType.displayStyle === 'swatches'"
                    v-model="val.colorHex"
                    swatch-only
                    class="!w-4 !h-4"
                  />
                  <button
                    class="text-muted-foreground hover:text-destructive"
                    @click="removeOptionValue(optIdx, valIdx)"
                  >
                    <Icon name="xmark" class="text-xs" />
                  </button>
                </div>
                <button
                  class="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground border border-dashed border-border rounded"
                  @click="addOptionValue(optIdx)"
                >
                  <Icon name="plus" class="text-xs" /> Add
                </button>
              </div>
            </div>
          </div>

          <p v-if="localSettings.optionTypes.length === 0" class="text-sm text-muted-foreground text-center py-4">
            No option types yet. Add one to get started.
          </p>
        </div>
      </div>

      <!-- Right: Variants -->
      <div class="space-y-4 overflow-y-auto pr-2">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-medium">Variants ({{ localSettings.variants.length }})</h3>
          <div class="flex gap-2">
            <Button size="sm" variant="outline" @click="generateAllVariants">
              <Icon name="grid-3" class="mr-1" /> Generate All
            </Button>
            <Button size="sm" variant="outline" @click="addVariant">
              <Icon name="plus" class="mr-1" /> Add
            </Button>
          </div>
        </div>

        <div class="space-y-2">
          <div
            v-for="(variant, varIdx) in localSettings.variants"
            :key="variant.id"
            class="p-3 bg-secondary/50 rounded-lg space-y-2"
          >
            <div class="flex items-center justify-between">
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="(value, key) in variant.optionValues"
                  :key="key"
                  class="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded"
                >
                  {{ key }}: {{ value }}
                </span>
                <span v-if="Object.keys(variant.optionValues).length === 0" class="text-xs text-muted-foreground">
                  No options set
                </span>
              </div>
              <button
                class="p-1 text-muted-foreground hover:text-destructive"
                @click="removeVariant(varIdx)"
              >
                <Icon name="trash-3" class="text-xs" />
              </button>
            </div>

            <!-- Option selectors for this variant -->
            <div class="grid grid-cols-2 gap-2">
              <div v-for="optType in localSettings.optionTypes" :key="optType.id">
                <label class="text-[10px] text-muted-foreground">{{ optType.name }}</label>
                <select
                  v-model="variant.optionValues[optType.name]"
                  class="w-full text-xs px-2 py-1 border border-input rounded bg-background"
                >
                  <option v-for="val in optType.values" :key="val.id" :value="val.value">
                    {{ val.value }}
                  </option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="text-[10px] text-muted-foreground">Price</label>
                <Input v-model="variant.price" placeholder="$99.00" class="h-8 text-xs" />
              </div>
              <div>
                <label class="text-[10px] text-muted-foreground">Buy Link</label>
                <Input v-model="variant.buyLink" placeholder="https://..." class="h-8 text-xs" />
              </div>
            </div>

            <div>
              <label class="text-[10px] text-muted-foreground">Image URL (optional)</label>
              <Input v-model="variant.image" placeholder="https://..." class="h-8 text-xs" />
            </div>
          </div>

          <p v-if="localSettings.variants.length === 0" class="text-sm text-muted-foreground text-center py-4">
            No variants yet. Add option types first, then generate variants.
          </p>
        </div>
      </div>
    </div>

    <template #footer>
      <Button variant="outline" @click="emit('update:open', false)">Cancel</Button>
      <Button @click="save">Save Changes</Button>
    </template>
  </Modal>
</template>
