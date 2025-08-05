<script setup>
import { computed } from 'vue'
import ButtonMain from '@/components/button/ButtonMain.vue'
import { formatRelativeTime } from '@/utils/time.js'
import { supabase } from '@/services/supabase.js'

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    required: true
  },
  items: {
    type: Array,
    required: true
  },
  contentType: {
    type: String,
    required: true
  },
  // Field mappings for different content types
  titleField: {
    type: String,
    default: 'name'
  },
  subtitleField: {
    type: String,
    default: 'url'
  },
  imageField: {
    type: String,
    default: 'img'
  },
  emptyTitle: {
    type: String,
    default: 'Untitled Item'
  },
  showImage: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['edit', 'move-up', 'move-down', 'delete'])

function getFieldValue(field) {
  return props.item[field] || ''
}

// ✅ NEW: Convert storage paths to public URLs
const imageUrl = computed(() => {
  const imagePath = getFieldValue(props.imageField)
  
  if (!imagePath) return ''
  
  // If it's already a full URL (http/https), return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  
  // If it's a storage path (/projects/...), convert to public URL
  if (imagePath.startsWith('/projects/')) {
    const storagePath = imagePath.replace('/projects/', '')
    const { data } = supabase.storage
      .from('projects')
      .getPublicUrl(storagePath)
    
    return data.publicUrl
  }
  
  // If it's base64 or other format, return as-is
  return imagePath
})

function handleEdit() {
  emit('edit', props.index)
}

function handleMoveUp() {
  emit('move-up', props.index)
}

function handleMoveDown() {
  emit('move-down', props.index)
}

function handleDelete() {
  emit('delete', props.index)
}
</script>

<template>
  <!-- FIXED: Render single item only, no v-for loop -->
  <li class="item">
    <div v-if="showImage" class="cover">
      <img 
        v-if="imageUrl" 
        :src="imageUrl" 
        :alt="`${contentType} cover`" 
        class="link-cover" 
      />
    </div>
    <div class="content">
      <div>
        <h3>{{ getFieldValue(titleField) || emptyTitle }}</h3>
        <h4 v-if="getFieldValue(subtitleField)">
          {{ getFieldValue(subtitleField) }}
        </h4>
      </div>
      <div class="actions">
        <ButtonMain label="Edit" buttonStyle="light" @click="handleEdit"/>
      </div>
    </div>
    <div class="details">
      <div class="timestamps">
        <label v-if="item.updated_at">
          Updated {{ formatRelativeTime(item.updated_at) }}
        </label>
        <label v-else-if="item.created_at">
          Created {{ formatRelativeTime(item.created_at) }}
        </label>
        <label v-else>
          Just created
        </label>
      </div>
      <div class="reorder-controls">
        <button 
          type="button"
          @click="handleMoveUp"
          :disabled="index === 0"
          class="reorder-btn"
          title="Move up"
        >
          ↑
        </button>
        <button 
          type="button"
          @click="handleMoveDown"
          :disabled="index === items.length - 1"
          class="reorder-btn"
          title="Move down"
        >
          ↓
        </button>
      </div>
    </div>
  </li>
</template>

<style scoped>
li.item {
      display: flex;
      flex-direction: column;
      border-radius: var(--radius-md);
      border: 1px solid var(--border);
      background: var(--card);
      box-shadow: var(--shadow-sm);
      transition: all var(--transition-smooth);
      
      & .cover {
        aspect-ratio: 16 / 9;
        border-radius: var(--radius-rg);
        border: 1px solid var(--border);
        margin: var(--space-md) var(--space-md) 0 var(--space-md);
        overflow: hidden;
        position: relative;
        &:empty {
          display: none;
        }
        
        > img {
          position: absolute;
          height: 100%;
          width: 100%;
          object-fit: cover;
        }
      }
      
      & .content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--space-md);
        
        > div {
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
          
          > h4 {
            font-size: var(--font-sm);
            font-family: 'mono';
            text-transform: uppercase;
            color: var(--details);
          }
        }

        > .actions {
          flex-direction: row;
        }
      }
      
      & .details {
        border-top: 1px solid var(--border);
        padding: var(--space-sm) var(--space-rg);
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: relative;
        
        > .timestamps {
          display: flex;
          gap: var(--space-sm);
        }
        
        > .reorder-controls {
          display: flex;
          gap: var(--space-xs);
          
          > .reorder-btn {
            background: transparent;
            border: 1px solid var(--border);
            border-radius: var(--radius-sm);
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 12px;
            color: var(--details);
            transition: all var(--transition-smooth);
            
            &:hover:not(:disabled) {
              background: var(--dark-hover);
              border-color: var(--focus);
              color: var(--focus);
            }
            
            &:disabled {
              opacity: 0.3;
              cursor: not-allowed;
            }
          }
        }
      }

      &:hover {
        border: 1px solid var(--focus);
      }
}
</style>