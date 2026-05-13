import type { ChartPoint } from '@/shared/ui/BaseChart.vue'

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toLocaleDateString('en', { month: 'short', day: 'numeric' })
}

// Visits past 30 days with a realistic curve
const BASE = 120
const raw = Array.from({ length: 30 }, (_, i) => {
  const trend = Math.sin((i / 30) * Math.PI) * 80
  const noise = (Math.random() - 0.5) * 60
  return Math.max(10, Math.round(BASE + trend + noise))
})

export const visitData: ChartPoint[] = raw.map((value, i) => ({
  label: daysAgo(29 - i),
  value,
}))

export const totalViews = visitData.reduce((s, d) => s + d.value, 0)
export const avgPerDay = Math.round(totalViews / visitData.length)

export const referrers = [
  { label: 'Direct',    value: 38 },
  { label: 'Twitter',   value: 24 },
  { label: 'Google',    value: 19 },
  { label: 'LinkedIn',  value: 12 },
  { label: 'Other',     value: 7 },
]

export const topClicked = [
  { label: 'GitHub',        clicks: 142 },
  { label: 'Portfolio',     clicks: 97 },
  { label: 'Newsletter',    clicks: 63 },
  { label: 'Twitter',       clicks: 51 },
  { label: 'Dribbble',      clicks: 34 },
]
