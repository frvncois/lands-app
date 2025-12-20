/**
 * Block Inspector Components
 *
 * Inspector components for each block type.
 * Used with defineAsyncComponent for lazy loading in DesignerInspector.
 */

// Content blocks
export { default as HeadingInspector } from './HeadingInspector.vue'
export { default as TextInspector } from './TextInspector.vue'
export { default as ImageInspector } from './ImageInspector.vue'
export { default as VideoInspector } from './VideoInspector.vue'
export { default as ButtonInspector } from './ButtonInspector.vue'
export { default as IconInspector } from './IconInspector.vue'
export { default as VariantsInspector } from './VariantsInspector.vue'

// Layout blocks
export { default as ContainerInspector } from './ContainerInspector.vue'
export { default as StackInspector } from './StackInspector.vue'
export { default as CanvasInspector } from './CanvasInspector.vue'
