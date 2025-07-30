<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  activeTab: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['tab-change'])
const ulRef = ref(null)

function selectTab(tabId) {
  emit('tab-change', tabId)
}

function updateUnderlinePosition() {
  if (!ulRef.value) return
  const activeItem = ulRef.value.querySelector('li.active')
  if (!activeItem) return
  const ulRect = ulRef.value.getBoundingClientRect()
  const itemRect = activeItem.getBoundingClientRect()
  const left = itemRect.left - ulRect.left
  const width = itemRect.width
  ulRef.value.style.setProperty('--left', `${left}px`)
  ulRef.value.style.setProperty('--width', `${width}px`)
}

function handleMouseEnter(event) {
  const ulRect = ulRef.value.getBoundingClientRect()
  const itemRect = event.target.getBoundingClientRect()
  const left = itemRect.left - ulRect.left
  const width = itemRect.width
  ulRef.value.style.setProperty('--left', `${left}px`)
  ulRef.value.style.setProperty('--width', `${width}px`)
}

function handleMouseLeave() {
  updateUnderlinePosition()
}

watch(() => props.activeTab, async () => {
  await nextTick()
  updateUnderlinePosition()
})

onMounted(async () => {
  await nextTick()
  updateUnderlinePosition()
})
</script>

<template>
  <transition name="nav-fade" mode="out-in" appear>
    <ul ref="ulRef" key="nav-tabs">
      <li
        v-for="item in items"
        :key="item.id"
        :class="{ active: activeTab === item.id }"
        @click="selectTab(item.id)"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
      >
        {{ item.label }}
      </li>
    </ul>
  </transition>
</template>

<style scoped>
ul {
  display: flex;
  gap: var(--space-lg);
  border-bottom: 1px solid var(--border);
  position: relative;
  --left: 0px;
  --width: 0px;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: var(--left);
    width: var(--width);
    height: 1px;
    background: var(--light);
    transition:
      left var(--transition-smooth),
      width var(--transition-smooth);
  }
}

li {
  padding: var(--space-rg) 0;
  border-bottom: 1px solid transparent;
  cursor: pointer;
  user-select: none;
  
  &:hover {
    border-bottom: 1px solid transparent;
  }
  
  &.active {
    border-bottom: 1px solid transparent;
  }
}

.nav-fade-enter-active {
  transition: all var(--transition-smooth);
}

.nav-fade-leave-active {
  transition: all var(--transition-smooth);
}

.nav-fade-enter-from {
  opacity: 1;
  transform: translateY(-0.5em);
}

.nav-fade-leave-to {
  opacity: 1;
  transform: translateY(-0.5em);
}
</style>