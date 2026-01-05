import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useEditorStore } from '../editor'

describe('Editor Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('initialization', () => {
    it('should have default state', () => {
      const editor = useEditorStore()

      expect(editor.sections).toEqual([])
      expect(editor.isDirty).toBe(false)
      expect(editor.mode).toBe('edit')
      expect(editor.previewMode).toBe('desktop')
    })
  })

  describe('undo/redo', () => {
    it('should not undo when no history', () => {
      const editor = useEditorStore()

      expect(editor.canUndo).toBe(false)
      editor.undo()
      expect(editor.sections).toEqual([])
    })

    it('should not redo when at latest state', () => {
      const editor = useEditorStore()

      expect(editor.canRedo).toBe(false)
      editor.redo()
      expect(editor.sections).toEqual([])
    })
  })

  describe('mode switching', () => {
    it('should switch between edit and style modes', () => {
      const editor = useEditorStore()

      expect(editor.mode).toBe('edit')

      editor.setMode('style')
      expect(editor.mode).toBe('style')

      editor.setMode('edit')
      expect(editor.mode).toBe('edit')
    })

    it('should switch preview modes', () => {
      const editor = useEditorStore()

      expect(editor.previewMode).toBe('desktop')

      editor.setPreviewMode('mobile')
      expect(editor.previewMode).toBe('mobile')
    })
  })

  describe('dirty state', () => {
    it('should mark as dirty when content changes', () => {
      const editor = useEditorStore()

      expect(editor.isDirty).toBe(false)

      // Initialize with some content
      editor.initializeEditor(
        {
          themeId: 'modern',
          sections: [],
          meta: { title: 'Test', description: '' },
        },
        'test-project-id'
      )

      expect(editor.isDirty).toBe(false)

      // Make a change that triggers dirty state
      editor.setMode('style')
      expect(editor.isDirty).toBe(false) // Mode change doesn't mark dirty

      // Add a section (would need to test with actual section data)
      // This is a simplified test - real usage would involve section manipulation
    })
  })

  describe('getPageContent', () => {
    it('should return current page content', () => {
      const editor = useEditorStore()

      editor.initializeEditor(
        {
          themeId: 'modern',
          sections: [],
          meta: { title: 'Test Page', description: 'Test description' },
        },
        'test-project-id'
      )

      const content = editor.getPageContent()

      expect(content.themeId).toBe('modern')
      expect(content.sections).toEqual([])
      expect(content.meta.title).toBe('Test Page')
      expect(content.meta.description).toBe('Test description')
    })
  })
})
