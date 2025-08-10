import MinimalIcon from '@/assets/icons/MinimalIcon.vue'
import CreativeIcon from '@/assets/icons/CreativeIcon.vue'
import BoldIcon from '@/assets/icons/BoldIcon.vue'
import ThemeMinimal from '@/components/theme/ThemeMinimal.vue'
import ThemeCreative from '@/components/theme/ThemeCreative.vue'

export const themes = [
  {
    id: 1,
    title: 'Minimal',
    type: 'Minimal',
    component: ThemeMinimal,
    icon: MinimalIcon
  },
  {
    id: 2,
    title: 'Creative',
    type: 'Creative',
    component: ThemeCreative,
    icon: CreativeIcon
  },
  {
    id: 3,
    title: 'Bold',
    type: 'Bold',
    component: 'All',
    icon: BoldIcon
  }
]