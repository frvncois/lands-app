import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import FileBlockView from './FileBlockView.vue'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fileBlock: {
      setFileBlock: (options: { src: string; filename: string }) => ReturnType
    }
  }
}

export const FileBlock = Node.create({
  name: 'fileBlock',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      filename: { default: 'File' },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-file-block]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes({ 'data-file-block': '' }, HTMLAttributes)]
  },

  addNodeView() {
    return VueNodeViewRenderer(FileBlockView)
  },

  addCommands() {
    return {
      setFileBlock: (options) => ({ commands }) =>
        commands.insertContent({ type: this.name, attrs: options }),
    }
  },
})
