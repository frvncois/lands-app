import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import AudioBlockView from './AudioBlockView.vue'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    audioBlock: {
      setAudioBlock: (options: { src: string }) => ReturnType
    }
  }
}

export const AudioBlock = Node.create({
  name: 'audioBlock',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-audio-block]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes({ 'data-audio-block': '' }, HTMLAttributes)]
  },

  addNodeView() {
    return VueNodeViewRenderer(AudioBlockView)
  },

  addCommands() {
    return {
      setAudioBlock: (options) => ({ commands }) =>
        commands.insertContent({ type: this.name, attrs: options }),
    }
  },
})
