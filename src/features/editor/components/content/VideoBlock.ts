import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import VideoBlockView from './VideoBlockView.vue'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    videoBlock: {
      setVideoBlock: (options: { src: string }) => ReturnType
    }
  }
}

export const VideoBlock = Node.create({
  name: 'videoBlock',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-video-block]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes({ 'data-video-block': '' }, HTMLAttributes)]
  },

  addNodeView() {
    return VueNodeViewRenderer(VideoBlockView)
  },

  addCommands() {
    return {
      setVideoBlock: (options) => ({ commands }) =>
        commands.insertContent({ type: this.name, attrs: options }),
    }
  },
})
