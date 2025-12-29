import type { SectionBlueprint } from '../types'

export const eventHero: SectionBlueprint = {
  id: 'event-hero',
  type: 'hero',
  variant: 'overlay',
  dataOverrides: {
    headline: 'Event Name',
    subheadline: 'Date • Location',
    primaryCTA: { label: 'Get Tickets', url: '#' },
  },
}

export const eventsBlueprints: SectionBlueprint[] = [
  eventHero,
]
