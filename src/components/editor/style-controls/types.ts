export interface SliderControl {
  type: 'slider'
  key: string
  label: string
  min: number
  max: number
  step?: number
  unit?: string
}

export interface ColorControl {
  type: 'color'
  key: string
  label: string
}

export interface SelectControl {
  type: 'select'
  key: string
  label: string
  options: { value: string; label: string }[]
}

export type StyleControl = SliderControl | ColorControl | SelectControl

export interface StyleGroupConfig {
  icon: string
  title: string
  controls: StyleControl[]
}
