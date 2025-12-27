export interface AccordionLabelOverrides {
  itemsLabel: string
  fieldLabels: Record<string, string>
}

const DEFAULT_LABELS: AccordionLabelOverrides = {
  itemsLabel: 'Accordion Items',
  fieldLabels: {
    headline: 'Title',
    content: 'Content',
  },
}

const ACCORDION_LABELS: Record<string, AccordionLabelOverrides> = {
  accordion: DEFAULT_LABELS,
  faq: {
    itemsLabel: 'Questions',
    fieldLabels: {
      headline: 'Question',
      content: 'Answer',
    },
  },
  menu: {
    itemsLabel: 'Menu Items',
    fieldLabels: {
      headline: 'Category',
      content: 'Description',
      subheadline: 'Item name',
      details: 'Description',
      price: 'Price',
    },
  },
  events: {
    itemsLabel: 'Events',
    fieldLabels: {
      headline: 'Event name',
      content: 'Details',
      datetime: 'Date / Time',
      location: 'Location',
      price: 'Pricing',
    },
  },
  services: {
    itemsLabel: 'Services',
    fieldLabels: {
      headline: 'Service name',
      content: 'Service description',
    },
  },
}

const ACCORDION_SECTION_TYPES = new Set(['accordion', 'faq', 'menu', 'events', 'services'])

export function getAccordionLabels(sectionType?: string | null): AccordionLabelOverrides {
  if (!sectionType) return DEFAULT_LABELS
  return ACCORDION_LABELS[sectionType] || DEFAULT_LABELS
}

export function isAccordionSectionType(type?: string | null): boolean {
  if (!type) return false
  return ACCORDION_SECTION_TYPES.has(type)
}
