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

export const eventSubscribe: SectionBlueprint = {
  id: 'event-subscribe',
  type: 'subscribe',
  variant: 'stacked',
  dataOverrides: {
    headline: 'Stay Updated',
    paragraph: 'Subscribe for event updates and announcements.',
    emailPlaceholder: 'Your email',
    submitButton: { label: 'Subscribe', url: '#' },
  },
}

export const eventsBlueprints: SectionBlueprint[] = [
  eventHero,
  eventSubscribe,
]
