<script setup lang="ts">
import { computed } from 'vue'

export interface ChartPoint {
  label: string
  value: number
}

const props = withDefaults(defineProps<{
  data: ChartPoint[]
  color?: string
  height?: number
}>(), {
  color: '#18181B',
  height: 80,
})

const W = 280
const H = computed(() => props.height)
const PAD = { top: 8, right: 4, bottom: 20, left: 4 }

const chartW = computed(() => W - PAD.left - PAD.right)
const chartH = computed(() => H.value - PAD.top - PAD.bottom)

const min = computed(() => Math.min(...props.data.map(d => d.value)))
const max = computed(() => Math.max(...props.data.map(d => d.value)))
const range = computed(() => max.value - min.value || 1)

function x(i: number) {
  return PAD.left + (i / (props.data.length - 1)) * chartW.value
}
function y(v: number) {
  return PAD.top + (1 - (v - min.value) / range.value) * chartH.value
}

const linePath = computed(() =>
  props.data.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(d.value).toFixed(1)}`).join(' ')
)

const areaPath = computed(() => {
  const bottom = PAD.top + chartH.value
  const start = `M${x(0).toFixed(1)},${bottom}`
  const line = props.data.map((d, i) => `L${x(i).toFixed(1)},${y(d.value).toFixed(1)}`).join(' ')
  const end = `L${x(props.data.length - 1).toFixed(1)},${bottom}Z`
  return `${start} ${line} ${end}`
})

// Show x-axis labels: first, middle, last
const xLabels = computed(() => {
  const n = props.data.length
  const indices = [0, Math.floor(n / 2), n - 1]
  return indices.map(i => ({ label: props.data[i]!.label, x: x(i) }))
})
</script>

<template>
  <svg :viewBox="`0 0 ${W} ${H}`" class="w-full overflow-visible" :style="{ height: `${height}px` }">
    <defs>
      <linearGradient :id="`area-fill`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" :stop-color="color" stop-opacity="0.12" />
        <stop offset="100%" :stop-color="color" stop-opacity="0" />
      </linearGradient>
    </defs>

    <!-- Area fill -->
    <path :d="areaPath" :fill="`url(#area-fill)`" />

    <!-- Line -->
    <path :d="linePath" fill="none" :stroke="color" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" />

    <!-- X-axis labels -->
    <text
      v-for="l in xLabels"
      :key="l.label"
      :x="l.x"
      :y="H"
      text-anchor="middle"
      class="fill-gray-400"
      style="font-size: 9px; font-family: inherit"
    >{{ l.label }}</text>
  </svg>
</template>
