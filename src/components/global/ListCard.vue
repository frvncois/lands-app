<script setup>
import ButtonMain from '@/components/button/ButtonMain.vue'
import { formatRelativeTime } from '@/utils/time.js'

const props = defineProps({
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

const emit = defineEmits(['edit', 'move-up', 'move-down'])

function getFieldValue(item, field) {
  return item[field] || ''
}

function handleEdit(index) {
  emit('edit', index)
}

function handleMoveUp(index) {
  emit('move-up', index)
}

function handleMoveDown(index) {
  emit('move-down', index)
}
</script>

<template>
  <ul v-if="items.length > 0" class="list">
    <li 
      v-for="(item, index) in items" 
      :key="`${contentType}-${item.order}-${index}`" 
      class="item"
    >
      <div v-if="showImage" class="cover">
        <img 
          v-if="getFieldValue(item, imageField)" 
          :src="getFieldValue(item, imageField)" 
          :alt="`${contentType} cover`" 
          class="link-cover" 
        />
      </div>
      <div class="content">
        <div>
          <h3>{{ getFieldValue(item, titleField) || emptyTitle }}</h3>
          <h4 v-if="getFieldValue(item, subtitleField)">
            {{ getFieldValue(item, subtitleField) }}
          </h4>
        </div>
        <div class="actions">
          <ButtonMain label="Edit" buttonStyle="light" @click="handleEdit(index)"/>
        </div>
      </div>
      <div class="details">
        <div class="timestamps">
          <label v-if="!item.updatedAt && item.createdAt">
            Created {{ formatRelativeTime(item.createdAt) }}
          </label>
          <label v-if="item.updatedAt">
            Updated {{ formatRelativeTime(item.updatedAt) }}
          </label>
        </div>
        <div class="reorder-controls">
          <button 
            type="button"
            @click="handleMoveUp(index)"
            :disabled="index === 0"
            class="reorder-btn"
            title="Move up"
          >
            ↑
          </button>
          <button 
            type="button"
            @click="handleMoveDown(index)"
            :disabled="index === items.length - 1"
            class="reorder-btn"
            title="Move down"
          >
            ↓
          </button>
        </div>
      </div>
    </li>
  </ul>
  
  <ul v-else class="empty">
    <p>No {{ contentType }} added yet</p>
  </ul>
</template>

<style scoped>
ul.list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

li.item {
      display: flex;
      flex-direction: column;
      border-radius: var(--radius-md);
      gap: var(--space-rg);
      border: 1px solid var(--border);
      background: var(--card);
      
      & .cover {
        aspect-ratio: 16 / 9;
        border-radius: var(--radius-rg);
        border: 1px solid var(--border);
        margin: var(--space-rg) var(--space-rg) 0 var(--space-rg);
        overflow: hidden;
        position: relative;
        
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
        padding: 0 var(--space-rg);
        
        > div {
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
          
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
    }

ul.empty {
  text-align: center;
  padding: var(--space-lg);
  color: var(--details);
  border: 1px dashed var(--border);
  border-radius: var(--radius-md);
}
</style>