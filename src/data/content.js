// Import your custom icon components
import BasicIcon from '@/assets/icons/BasicIcon.vue'
import LinksIcon from '@/assets/icons/LinksIcon.vue'
import SocialIcon from '@/assets/icons/SocialIcon.vue'
import PostIcon from '@/assets/icons/PostIcon.vue'
import ReleasesIcon from '@/assets/icons/ReleasesIcon.vue'
import ShowsIcon from '@/assets/icons/ShowsIcon.vue'
import MerchIcon from '@/assets/icons/MerchIcon.vue'

export const contentComponents = [
  {
    id: 'basic',
    name: 'Basic Info',
    component: 'ContentBasic',
    description: 'Project name and description',
    icon: BasicIcon,
    dataKey: null // Uses name and description directly
  },
  {
    id: 'links',
    name: 'Links',
    component: 'ContentLinks',
    description: 'External links and resources',
    icon: LinksIcon,
    dataKey: 'links'
  },
  {
    id: 'posts',
    name: 'Posts',
    component: 'ContentPosts',
    description: 'Blog posts and updates',
    icon: PostIcon,
    dataKey: 'posts'
  },
  {
    id: 'releases',
    name: 'Releases',
    component: 'ContentReleases',
    description: 'Music releases and albums',
    icon: ReleasesIcon,
    dataKey: 'releases'
  },
  {
    id: 'shows',
    name: 'Shows',
    component: 'ContentShows',
    description: 'Live performances and events',
    icon: ShowsIcon,
    dataKey: 'shows'
  },
  {
    id: 'merch',
    name: 'Merch',
    component: 'ContentMerch',
    description: 'Merchandise and products',
    icon: MerchIcon,
    dataKey: 'merch'
  }
]