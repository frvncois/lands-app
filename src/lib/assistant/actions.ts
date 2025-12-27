import { useProjectsStore } from '@/stores/projects'
import { createSectionInstance } from '@/lib/section-registry'
import { PROJECT_CATEGORIES } from './categories'
import type { SubcategoryOption } from './types'
import type { SectionInstance } from '@/types/sections'

export function getSubcategory(categoryId: string, subcategoryId: string): SubcategoryOption | undefined {
  const category = PROJECT_CATEGORIES.find(c => c.id === categoryId)
  if (!category) return undefined
  return category.subcategories.find(s => s.id === subcategoryId)
}

export async function createProjectFromAssistant(flowData: {
  categoryId: string
  subcategoryId: string
  projectName: string
  themeId: string
}): Promise<string | null> {
  const projectsStore = useProjectsStore()

  // Get subcategory configuration
  const subcategory = getSubcategory(flowData.categoryId, flowData.subcategoryId)
  if (!subcategory) {
    console.error('Subcategory not found:', flowData.subcategoryId)
    return null
  }

  // Create the project
  const project = await projectsStore.createProject(flowData.projectName)
  if (!project) {
    console.error('Failed to create project')
    return null
  }

  try {
    // Build sections from subcategory presets
    const sections: SectionInstance[] = []

    for (const preset of subcategory.sections) {
      // Generate unique ID for section
      const sectionId = `${preset.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      // Create section instance with default data
      const instance = createSectionInstance(preset.type, sectionId)
      if (!instance) {
        console.warn('Failed to create section instance for type:', preset.type)
        continue
      }

      // Override variant if specified in preset
      if (preset.variant) {
        instance.variant = preset.variant
      }

      // Apply placeholders to section data
      applyPlaceholders(instance, subcategory.placeholders, flowData.projectName)

      sections.push(instance)
    }

    // Save project content with theme and sections
    const success = await projectsStore.saveProjectContent(project.id, {
      themeId: flowData.themeId,
      sections,
      meta: {
        title: flowData.projectName,
        description: subcategory.placeholders.subheadline.replace('{name}', flowData.projectName)
      }
    })

    if (!success) {
      console.error('Failed to save project content')
      return null
    }

    return project.id
  } catch (error) {
    console.error('Error creating project from assistant:', error)
    return null
  }
}

function applyPlaceholders(
  section: SectionInstance,
  placeholders: {
    headline: string
    subheadline: string
    paragraph?: string
    ctaLabel?: string
  },
  projectName: string
) {
  const data = section.data as Record<string, unknown>

  // Replace {name} token with project name
  const headline = placeholders.headline.replace('{name}', projectName)
  const subheadline = placeholders.subheadline.replace('{name}', projectName)

  // Apply to common fields that exist in the section
  if ('headline' in data) {
    data.headline = headline
  }
  if ('subheadline' in data) {
    data.subheadline = subheadline
  }
  if ('paragraph' in data && placeholders.paragraph) {
    data.paragraph = placeholders.paragraph.replace('{name}', projectName)
  }

  // Handle CTA labels
  if (placeholders.ctaLabel) {
    const ctaLabel = placeholders.ctaLabel.replace('{name}', projectName)

    // Primary CTA
    if ('primaryCTA' in data && data.primaryCTA && typeof data.primaryCTA === 'object') {
      (data.primaryCTA as Record<string, unknown>).label = ctaLabel
    }

    // Button label (for cards, etc.)
    if ('items' in data && Array.isArray(data.items)) {
      data.items.forEach((item: Record<string, unknown>) => {
        if ('buttonLabel' in item) {
          item.buttonLabel = ctaLabel
        }
      })
    }
  }

  // Special handling for header section
  if (section.type === 'header' && 'title' in data) {
    data.title = projectName
  }

  // Special handling for footer section
  if (section.type === 'footer') {
    if ('text' in data) {
      data.text = `© ${new Date().getFullYear()} ${projectName}. All rights reserved.`
    }
  }
}
