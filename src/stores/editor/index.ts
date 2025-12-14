// Editor store composables
export { useHistory, type HistorySnapshot, type UseHistoryOptions } from './useHistory'
export { useClipboard, type UseClipboardOptions } from './useClipboard'
export { useSharedStyles, type UseSharedStylesOptions } from './useSharedStyles'
export { useTranslations, type UseTranslationsOptions } from './useTranslations'
export { useCollaboration, type UseCollaborationOptions } from './useCollaboration'
export { useItemListOperations, type ItemListOptions } from './useItemListOperations'
export { useInteractions, type UseInteractionsOptions } from './useInteractions'

// Helpers
export {
  MAX_LAYOUT_NESTING_DEPTH,
  deepClone,
  findBlockInTree,
  findParentInTree,
  isLayoutBlockType,
  hasDepthRestriction,
  isProtectedBlockType,
  buildBlockIndex,
  buildBlockIndexes,
} from './helpers'
