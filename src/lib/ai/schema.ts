/**
 * AI Schema Documentation
 *
 * Complete documentation of all block types, settings, and styles
 * for the AI assistant to understand the app structure.
 */

// ============================================
// BLOCK TYPES SCHEMA
// ============================================

export const BLOCK_TYPES = {
  // Layout blocks (can have children)
  layout: ['container', 'stack', 'grid', 'canvas'],
  // Content blocks (no children)
  content: ['heading', 'text', 'image', 'video', 'button', 'icon'],
} as const

export const BLOCK_SCHEMA = {
  // ============================================
  // CONTAINER - Section wrapper
  // ============================================
  container: {
    description: 'Main section wrapper. Use as the root of any section.',
    canHaveChildren: true,
    settings: {
      maxWidth: { type: 'string', description: 'Max width (e.g., "1200px", "100%")', default: '1200px' },
      height: { type: 'string', description: 'Height (e.g., "auto", "100vh", "500px")', default: 'auto' },
      htmlTag: { type: 'enum', values: ['section', 'div'], default: 'section' },
      backgroundType: { type: 'enum', values: ['color', 'image', 'video'], default: 'color' },
      backgroundImage: { type: 'string', description: 'URL for background image' },
      backgroundVideo: { type: 'string', description: 'URL for background video' },
      backgroundImageOpacity: { type: 'number', min: 0, max: 100, default: 100 },
      backgroundImageBlur: { type: 'number', min: 0, max: 20, default: 0 },
      backgroundImageOverlay: { type: 'hex', description: 'Overlay color' },
      backgroundImageOverlayOpacity: { type: 'number', min: 0, max: 100, default: 50 },
    },
    styles: {
      padding: { type: 'spacing', description: '{ top, bottom, left, right } in px strings' },
      margin: { type: 'spacing' },
      backgroundColor: { type: 'hex' },
      flexDirection: { type: 'enum', values: ['row', 'column', 'row-reverse', 'column-reverse'], default: 'column' },
      justifyContent: { type: 'enum', values: ['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly'], default: 'flex-start' },
      alignItems: { type: 'enum', values: ['flex-start', 'center', 'flex-end', 'stretch', 'baseline'], default: 'center' },
      gap: { type: 'string', description: 'Gap between children in px', default: '24' },
      borderRadius: { type: 'string', description: 'Border radius in px' },
      border: { type: 'border', description: '{ width, color, radius, style, sides }' },
    },
  },

  // ============================================
  // STACK - Flexible row/column layout
  // ============================================
  stack: {
    description: 'Flexible layout for horizontal or vertical arrangements. Perfect for navbars, card layouts, lists.',
    canHaveChildren: true,
    settings: {
      direction: { type: 'enum', values: ['horizontal', 'vertical'], default: 'vertical', description: 'Layout direction' },
      gap: { type: 'string', description: 'Gap between items in px', default: '16' },
      align: { type: 'enum', values: ['start', 'center', 'end', 'stretch'], default: 'stretch' },
      width: { type: 'string', description: 'Width (e.g., "100%", "auto", "300px")' },
      height: { type: 'string', description: 'Height' },
      htmlTag: { type: 'enum', values: ['div', 'header', 'nav', 'footer', 'article'], default: 'div' },
      backgroundType: { type: 'enum', values: ['color', 'image', 'video'], default: 'color' },
      backgroundImage: { type: 'string' },
    },
    styles: {
      padding: { type: 'spacing' },
      margin: { type: 'spacing' },
      backgroundColor: { type: 'hex' },
      flexDirection: { type: 'enum', values: ['row', 'column', 'row-reverse', 'column-reverse'] },
      justifyContent: { type: 'enum', values: ['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly'] },
      alignItems: { type: 'enum', values: ['flex-start', 'center', 'flex-end', 'stretch', 'baseline'] },
      flexWrap: { type: 'enum', values: ['nowrap', 'wrap', 'wrap-reverse'], default: 'nowrap' },
      gap: { type: 'string' },
      borderRadius: { type: 'string' },
      border: { type: 'border' },
      width: { type: 'string' },
      height: { type: 'string' },
    },
  },

  // ============================================
  // GRID - Grid layout
  // ============================================
  grid: {
    description: 'CSS Grid layout for multi-column arrangements. Great for card grids, galleries, pricing tables.',
    canHaveChildren: true,
    settings: {
      columns: { type: 'number', min: 1, max: 12, default: 3, description: 'Number of columns' },
      tabletColumns: { type: 'number', min: 1, max: 12, description: 'Columns on tablet' },
      mobileColumns: { type: 'number', min: 1, max: 12, description: 'Columns on mobile' },
      gap: { type: 'string', default: '24', description: 'Gap between items' },
      rowGap: { type: 'string', description: 'Vertical gap (overrides gap for rows)' },
      width: { type: 'string' },
      height: { type: 'string' },
      columnWidths: { type: 'array', description: 'Custom column widths as fr values [1, 2, 1]' },
      rows: { type: 'number', description: 'Explicit number of rows' },
    },
    styles: {
      padding: { type: 'spacing' },
      margin: { type: 'spacing' },
      backgroundColor: { type: 'hex' },
      justifyItems: { type: 'enum', values: ['start', 'center', 'end', 'stretch'] },
      alignItems: { type: 'enum', values: ['flex-start', 'center', 'flex-end', 'stretch'] },
      gap: { type: 'string' },
      borderRadius: { type: 'string' },
    },
  },

  // ============================================
  // CANVAS - Absolute positioning container
  // ============================================
  canvas: {
    description: 'Free-form container with absolute positioning. For creative layouts where elements overlap.',
    canHaveChildren: true,
    settings: {
      width: { type: 'string', default: '100%' },
      height: { type: 'string', default: '500px' },
      aspectRatio: { type: 'enum', values: ['1:1', '4:3', '3:4', '16:9', '9:16', 'auto'] },
      childPositions: { type: 'object', description: 'Position data for each child { desktop: { childId: { x, y, width, height, zIndex } } }' },
      backgroundType: { type: 'enum', values: ['color', 'image', 'video'] },
      backgroundImage: { type: 'string' },
    },
    styles: {
      padding: { type: 'spacing' },
      backgroundColor: { type: 'hex' },
      borderRadius: { type: 'string' },
    },
  },

  // ============================================
  // HEADING - Text heading (h1-h6)
  // ============================================
  heading: {
    description: 'Heading text block. Use for titles, section headers.',
    canHaveChildren: false,
    settings: {
      content: { type: 'string', required: true, description: 'The heading text (supports HTML)' },
      level: { type: 'enum', values: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'], default: 'h2', description: 'Heading level' },
    },
    styles: {
      fontSize: { type: 'string', description: 'Font size (e.g., "32", "2xl", "48px")', default: '32' },
      fontWeight: { type: 'enum', values: ['normal', 'medium', 'semibold', 'bold'], default: 'bold' },
      fontFamily: { type: 'string', description: 'Font family name' },
      fontStyle: { type: 'enum', values: ['normal', 'italic'], default: 'normal' },
      textDecoration: { type: 'enum', values: ['none', 'underline', 'line-through'], default: 'none' },
      textTransform: { type: 'enum', values: ['none', 'capitalize', 'uppercase', 'lowercase'], default: 'none' },
      color: { type: 'hex', description: 'Text color' },
      lineHeight: { type: 'string', default: '1.2' },
      letterSpacing: { type: 'string', description: 'Letter spacing (e.g., "-0.02em", "1px")' },
      alignment: { type: 'enum', values: ['left', 'center', 'right'], default: 'left' },
      padding: { type: 'spacing' },
      margin: { type: 'spacing' },
    },
  },

  // ============================================
  // TEXT - Paragraph text
  // ============================================
  text: {
    description: 'Paragraph text block. Use for descriptions, body content.',
    canHaveChildren: false,
    settings: {
      content: { type: 'string', required: true, description: 'The text content (supports HTML/rich text)' },
      maxWidth: { type: 'string', description: 'Max width for readability' },
    },
    styles: {
      fontSize: { type: 'string', default: '16', description: 'Font size in px or named size' },
      fontWeight: { type: 'enum', values: ['normal', 'medium', 'semibold', 'bold'], default: 'normal' },
      fontFamily: { type: 'string' },
      fontStyle: { type: 'enum', values: ['normal', 'italic'], default: 'normal' },
      color: { type: 'hex' },
      lineHeight: { type: 'string', default: '1.6' },
      letterSpacing: { type: 'string' },
      alignment: { type: 'enum', values: ['left', 'center', 'right'], default: 'left' },
      padding: { type: 'spacing' },
      margin: { type: 'spacing' },
    },
  },

  // ============================================
  // IMAGE - Image block
  // ============================================
  image: {
    description: 'Image block. Supports various aspect ratios and effects.',
    canHaveChildren: false,
    settings: {
      src: { type: 'string', required: true, description: 'Image URL' },
      alt: { type: 'string', required: true, description: 'Alt text for accessibility' },
      caption: { type: 'string', description: 'Optional caption' },
      captionPosition: { type: 'enum', values: ['below', 'overlay'], default: 'below' },
      linkUrl: { type: 'string', description: 'Make image clickable' },
      linkNewTab: { type: 'boolean', default: false },
      overlay: { type: 'hex', description: 'Color overlay' },
      overlayOpacity: { type: 'number', min: 0, max: 100, default: 50 },
    },
    styles: {
      width: { type: 'string', default: '100%' },
      height: { type: 'string', default: 'auto' },
      objectFit: { type: 'enum', values: ['cover', 'contain', 'fill', 'none'], default: 'cover' },
      borderRadius: { type: 'string', default: '0' },
      aspectRatio: { type: 'enum', values: ['1:1', '4:3', '3:4', '16:9', '9:16', '3:2', '2:3', 'auto'], default: 'auto' },
      mask: { type: 'enum', values: ['none', 'circle', 'rounded', 'blob-1', 'blob-2', 'blob-3', 'hexagon', 'diamond', 'arch'], default: 'none' },
      // Image adjustments
      brightness: { type: 'number', min: 0, max: 200, default: 100 },
      contrast: { type: 'number', min: 0, max: 200, default: 100 },
      saturation: { type: 'number', min: 0, max: 200, default: 100 },
      grayscale: { type: 'number', min: 0, max: 100, default: 0 },
    },
  },

  // ============================================
  // VIDEO - Video block
  // ============================================
  video: {
    description: 'Video block. Supports YouTube, Vimeo, and direct URLs.',
    canHaveChildren: false,
    settings: {
      src: { type: 'string', required: true, description: 'Video URL (YouTube, Vimeo, or file)' },
      thumbnail: { type: 'string', description: 'Custom thumbnail image URL' },
      autoplay: { type: 'boolean', default: false },
      loop: { type: 'boolean', default: false },
      muted: { type: 'boolean', default: true, description: 'Mute video (required for autoplay)' },
      controls: { type: 'boolean', default: true },
    },
    styles: {
      aspectRatio: { type: 'enum', values: ['1:1', '4:3', '16:9', '9:16', 'auto'], default: '16:9' },
      maxWidth: { type: 'string' },
      borderRadius: { type: 'string', default: '0' },
      mask: { type: 'enum', values: ['none', 'circle', 'rounded'], default: 'none' },
    },
  },

  // ============================================
  // BUTTON - CTA button
  // ============================================
  button: {
    description: 'Call-to-action button. Use for links, form submissions.',
    canHaveChildren: false,
    settings: {
      label: { type: 'string', required: true, description: 'Button text' },
      url: { type: 'string', required: true, description: 'Link URL' },
      newTab: { type: 'boolean', default: false },
      iconLeft: { type: 'string', description: 'Icon name to show before label' },
      iconRight: { type: 'string', description: 'Icon name to show after label' },
    },
    styles: {
      backgroundColor: { type: 'hex', description: 'Button background color' },
      textColor: { type: 'hex', description: 'Button text color' },
      hoverBackgroundColor: { type: 'hex' },
      hoverTextColor: { type: 'hex' },
      fontSize: { type: 'string', default: '16' },
      fontWeight: { type: 'enum', values: ['normal', 'medium', 'semibold', 'bold'], default: 'semibold' },
      padding: { type: 'spacing', description: 'Button padding' },
      borderRadius: { type: 'string', default: '8' },
      border: { type: 'border' },
      gap: { type: 'string', default: '8', description: 'Gap between icon and label' },
      width: { type: 'string', description: 'Button width (e.g., "auto", "100%", "200px")' },
    },
  },

  // ============================================
  // ICON - Icon block
  // ============================================
  icon: {
    description: 'Icon block. Uses Lineicons library.',
    canHaveChildren: false,
    settings: {
      icon: { type: 'string', required: true, description: 'Icon name from Lineicons (e.g., "arrow-right", "star", "checkmark")' },
      size: { type: 'string', default: '24', description: 'Icon size in px' },
      linkUrl: { type: 'string', description: 'Make icon clickable' },
      linkNewTab: { type: 'boolean', default: false },
    },
    styles: {
      color: { type: 'hex', description: 'Icon color' },
      backgroundColor: { type: 'hex', description: 'Background color' },
      backgroundShape: { type: 'enum', values: ['none', 'circle', 'square'], default: 'none' },
      backgroundPadding: { type: 'string', default: '12', description: 'Padding around icon when using background' },
      borderRadius: { type: 'string' },
    },
  },
} as const

// ============================================
// COMMON STYLE PROPERTIES
// ============================================

export const STYLE_PROPERTIES = {
  spacing: {
    description: 'Object with { top, bottom, left, right } as string px values',
    example: '{ "top": "24", "bottom": "24", "left": "16", "right": "16" }',
  },
  border: {
    description: 'Border object',
    properties: {
      width: 'Border width in px (e.g., "1")',
      color: 'Border color (hex)',
      radius: 'Border radius in px',
      style: 'solid | dashed | dotted',
      sides: 'Which sides to apply (e.g., "top,bottom")',
    },
    example: '{ "width": "1", "color": "#e5e5e5", "radius": "8", "style": "solid" }',
  },
  shadow: {
    description: 'Box shadow object',
    properties: {
      enabled: 'boolean',
      x: 'Horizontal offset',
      y: 'Vertical offset',
      blur: 'Blur radius',
      spread: 'Spread radius',
      color: 'Shadow color (hex)',
      opacity: 'Shadow opacity (0-1)',
    },
    example: '{ "enabled": true, "x": "0", "y": "4", "blur": "12", "spread": "0", "color": "#000000", "opacity": 0.1 }',
  },
  gradient: {
    description: 'Gradient background',
    properties: {
      type: 'linear | radial',
      angle: 'Angle for linear gradient (0-360)',
      stops: 'Array of { color, position }',
    },
    example: '{ "type": "linear", "angle": 135, "stops": [{ "color": "#6366f1", "position": 0 }, { "color": "#8b5cf6", "position": 100 }] }',
  },
}

// ============================================
// ANIMATION TYPES
// ============================================

export const ANIMATION_SCHEMA = {
  presets: [
    'fade-in', 'fade-up', 'fade-down', 'fade-left', 'fade-right',
    'zoom-in', 'zoom-out', 'scale-up', 'scale-down',
    'slide-up', 'slide-down', 'slide-left', 'slide-right',
    'rotate-in', 'bounce-in', 'blur-in',
  ],
  triggers: ['load', 'inView', 'hover'],
  easings: [
    'linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out',
    'ease-out-back', 'ease-out-elastic', 'ease-out-bounce',
  ],
  example: {
    type: 'appear',
    enabled: true,
    preset: 'fade-up',
    duration: 500,
    delay: 0,
    easing: 'ease-out',
    trigger: 'inView',
    once: true,
  },
}

// ============================================
// COMMON ICON NAMES (Lineicons)
// ============================================

export const COMMON_ICONS = {
  arrows: ['arrow-right', 'arrow-left', 'arrow-up', 'arrow-down', 'chevron-right', 'chevron-left', 'chevron-up', 'chevron-down'],
  actions: ['checkmark', 'xmark', 'plus', 'minus', 'search-1', 'menu', 'close'],
  social: ['twitter', 'instagram', 'facebook', 'linkedin', 'youtube', 'tiktok', 'github', 'discord'],
  ui: ['star', 'heart', 'bookmark', 'share', 'link', 'external-link', 'download', 'upload'],
  objects: ['envelope', 'phone', 'map-pin', 'calendar', 'clock', 'user', 'users', 'briefcase', 'home'],
  media: ['play', 'pause', 'volume', 'image', 'video', 'camera', 'mic'],
  misc: ['sparkles', 'bolt', 'fire', 'globe-1', 'shield', 'lock', 'unlock', 'settings', 'trash-1'],
}

// ============================================
// FONT SIZES (Named + px values)
// ============================================

export const FONT_SIZES = {
  named: {
    'xs': '12px',
    'sm': '14px',
    'base': '16px',
    'lg': '18px',
    'xl': '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px',
    '6xl': '60px',
  },
  description: 'Can use named sizes (xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl) or px values as strings (e.g., "18", "24")',
}
