import {
  Link, Star, Heart, Bookmark, Globe, Mail, Phone, MapPin, Calendar, Clock,
  Search, Download, ExternalLink, FileText, Video, Music, Image, ShoppingBag,
  Tag, Gift, Zap, Coffee, Smile, Award, Briefcase, Code, Pen, Camera, Mic, Headphones,
  Instagram, Twitter, Youtube, Linkedin, Github, Facebook, Twitch,
} from 'lucide-vue-next'
import type { Component } from 'vue'

export interface LucideIconDef {
  name: string
  label: string
  group: string
  component: Component
}

export const LUCIDE_ICONS: LucideIconDef[] = [
  // General
  { name: 'Link', label: 'Link', group: 'General', component: Link },
  { name: 'Star', label: 'Star', group: 'General', component: Star },
  { name: 'Heart', label: 'Heart', group: 'General', component: Heart },
  { name: 'Bookmark', label: 'Bookmark', group: 'General', component: Bookmark },
  { name: 'Globe', label: 'Globe', group: 'General', component: Globe },
  { name: 'Mail', label: 'Mail', group: 'General', component: Mail },
  { name: 'Phone', label: 'Phone', group: 'General', component: Phone },
  { name: 'MapPin', label: 'Location', group: 'General', component: MapPin },
  { name: 'Calendar', label: 'Calendar', group: 'General', component: Calendar },
  { name: 'Clock', label: 'Clock', group: 'General', component: Clock },
  { name: 'Search', label: 'Search', group: 'General', component: Search },
  { name: 'Download', label: 'Download', group: 'General', component: Download },
  { name: 'ExternalLink', label: 'External', group: 'General', component: ExternalLink },
  { name: 'FileText', label: 'Document', group: 'General', component: FileText },
  { name: 'Video', label: 'Video', group: 'General', component: Video },
  { name: 'Music', label: 'Music', group: 'General', component: Music },
  { name: 'Image', label: 'Image', group: 'General', component: Image },
  { name: 'ShoppingBag', label: 'Shop', group: 'General', component: ShoppingBag },
  { name: 'Tag', label: 'Tag', group: 'General', component: Tag },
  { name: 'Gift', label: 'Gift', group: 'General', component: Gift },
  { name: 'Zap', label: 'Zap', group: 'General', component: Zap },
  { name: 'Coffee', label: 'Coffee', group: 'General', component: Coffee },
  { name: 'Smile', label: 'Smile', group: 'General', component: Smile },
  { name: 'Award', label: 'Award', group: 'General', component: Award },
  { name: 'Briefcase', label: 'Work', group: 'General', component: Briefcase },
  { name: 'Code', label: 'Code', group: 'General', component: Code },
  { name: 'Pen', label: 'Pen', group: 'General', component: Pen },
  { name: 'Camera', label: 'Camera', group: 'General', component: Camera },
  { name: 'Mic', label: 'Mic', group: 'General', component: Mic },
  { name: 'Headphones', label: 'Headphones', group: 'General', component: Headphones },
  // Social
  { name: 'Instagram', label: 'Instagram', group: 'Social', component: Instagram },
  { name: 'Twitter', label: 'Twitter / X', group: 'Social', component: Twitter },
  { name: 'Youtube', label: 'YouTube', group: 'Social', component: Youtube },
  { name: 'Linkedin', label: 'LinkedIn', group: 'Social', component: Linkedin },
  { name: 'Github', label: 'GitHub', group: 'Social', component: Github },
  { name: 'Facebook', label: 'Facebook', group: 'Social', component: Facebook },
  { name: 'Twitch', label: 'Twitch', group: 'Social', component: Twitch },
]

// Map from icon name to component for use in section renderers
export const LUCIDE_ICON_MAP: Record<string, Component> = Object.fromEntries(
  LUCIDE_ICONS.map(i => [i.name, i.component])
)
