<script setup>
import { ref, computed } from 'vue'
import { themes } from '@/components/theme/ThemeList.js'
import { generateTheme } from '@/services/llmService.js'
import ButtonMain from '@/components/button/ButtonMain.vue'

const props = defineProps({
  project: {
    type: Object,
    required: true
  },
  userStore: {
    type: Object,
    default: null
  }
})

// Ensure design object exists
const projectDesign = computed(() => {
  if (!props.project.design) {
    props.project.design = {}
  }
  return props.project.design
})

const selectTheme = (theme) => {
  console.log('🎨 Selecting theme:', theme.title, 'ID:', theme.id)
  
  // Ensure design object exists before setting properties
  if (!props.project.design) {
    props.project.design = {}
  }
  
  // Store the theme ID for persistence
  props.project.design.themeId = theme.id
  
  // Also store the theme object for immediate use (will be lost on refresh)
  props.project.design.theme = theme
  
  console.log('🎨 Theme stored in user.js store')
  
  // Optional: Save to localStorage for drafts
  saveToLocalStorage(theme)
}

function saveToLocalStorage(theme) {
  try {
    const projectId = props.project.id
    if (!projectId) return
    
    const draftKey = `project_draft_${projectId}`
    const existingDraft = localStorage.getItem(draftKey)
    
    let draftData = {}
    if (existingDraft) {
      draftData = JSON.parse(existingDraft)
    }
    
    // Update design in draft
    draftData.design = {
      ...draftData.design,
      themeId: theme.id,
      theme: theme
    }
    
    draftData.lastModified = new Date().toISOString()
    
    localStorage.setItem(draftKey, JSON.stringify(draftData))
    console.log('💾 Theme saved to localStorage (not database)')
  } catch (error) {
    console.error('❌ Error saving to localStorage:', error)
  }
}

// Get current selected theme ID safely
const currentThemeId = computed(() => {
  return projectDesign.value?.themeId || projectDesign.value?.theme?.id || null
})

const allThemes = themes

// AI Theme Generation
const aiInstruction = ref('')
const isGenerating = ref(false)
const generatedTheme = ref(null)
const showAiSection = ref(false)
const generationError = ref('')
const viewCode = ref(false)

const canGenerate = computed(() => {
  return aiInstruction.value.trim().length > 5 && !isGenerating.value
})

async function generateAITheme() {
  if (!canGenerate.value) return
  
  isGenerating.value = true
  generationError.value = ''
  
  try {
    console.log('🎨 Generating AI theme...')
    
    const result = await generateTheme(aiInstruction.value, props.project)
    
    if (result.success) {
      generatedTheme.value = {
        id: `ai-${Date.now()}`,
        title: `AI: ${aiInstruction.value.substring(0, 30)}...`,
        code: result.code,
        contentTypes: result.contentTypes,
        isAI: true
      }
      
      // Add to project design
      if (props.project && props.project.design) {
        props.project.design.aiTheme = generatedTheme.value
        props.project.design.themeId = generatedTheme.value.id
        // Don't set selectedTheme here, let user click to select
      }
      
      console.log('✅ AI theme generated successfully')
    }
    
  } catch (error) {
    console.error('❌ Theme generation failed:', error)
    generationError.value = error.message || 'Failed to generate theme'
  } finally {
    isGenerating.value = false
  }
}

function clearAITheme() {
  generatedTheme.value = null
  aiInstruction.value = ''
  generationError.value = ''
  showAiSection.value = false
  
  // Clear from project design
  if (props.project?.design) {
    delete props.project.design.aiTheme
    if (String(props.project.design.themeId).startsWith('ai-')) {
      props.project.design.themeId = null
    }
  }
}

function copyCode() {
  if (generatedTheme.value?.code) {
    navigator.clipboard.writeText(generatedTheme.value.code)
    console.log('📋 Code copied to clipboard')
  }
}
</script>

<template>
    <!-- Your Original Themes Structure - UNCHANGED -->
    <ul class="themes" v-if="props.project">
      <li
        v-for="theme in allThemes"
        :key="theme.id"
        class="item"
        @click="selectTheme(theme)"
        :class="['activate', { active: currentThemeId === theme.id }]"
      >
        <div class="icon">
          <component :is="theme.icon"/>
        </div>
        <div class="details">
          <label>{{ theme.title }}</label>
        </div>
      </li>
    </ul>

    <!-- AI Generated Theme - NEW SECTION AFTER YOUR THEMES -->
    <ul class="themes" v-if="generatedTheme">
      <li
        class="item"
        @click="selectTheme(generatedTheme)"
        :class="['activate', { active: currentThemeId === generatedTheme.id }]"
      >
        <div class="icon ai-icon">
          <div class="robot-icon">🤖</div>
        </div>
        <div class="details">
          <label>{{ generatedTheme.title }}</label>
          <button @click.stop="clearAITheme" class="clear-btn">×</button>
        </div>
      </li>
    </ul>

    <!-- AI Theme Generator Section -->
    <ul class="themes-ai">
      <li 
        @click="showAiSection = !showAiSection" 
        class="toggle-ai"
        :class="{ active: showAiSection }"
      >
        Generate Custom Theme
      </li>
      
      <div v-if="showAiSection" class="ai-section">
        <div class="ai-input-group">
          <textarea 
            v-model="aiInstruction"
            placeholder="e.g., Create a dark theme with neon accents for an electronic music artist..."
            rows="3"
            :disabled="isGenerating"
          />
          
          <div class="ai-actions">
            <ButtonMain
              @click="generateAITheme"
              :disabled="!canGenerate"
              :label="isGenerating ? 'Generating...' : 'Generate Theme'"
              :style="isGenerating ? 'disabled' : 'primary'"
            />
          </div>
        </div>
        
        <!-- Error Display -->
        <div v-if="generationError" class="error-message">
          ⚠️ {{ generationError }}
        </div>
        
        <!-- Generation Status -->
        <div v-if="isGenerating" class="generation-status">
          <div class="loading-spinner"></div>
          <p>Crafting your custom theme...</p>
        </div>
        
        <!-- Generated Code Display -->
        <div v-if="generatedTheme" class="generated-code">
          <h4>Generated Theme Code:</h4>
          <div class="code-actions">
            <button @click="copyCode" class="copy-btn">📋 Copy Code</button>
            <button @click="viewCode = !viewCode" class="toggle-btn">
              {{ viewCode ? 'Hide Code' : 'Show Code' }}
            </button>
          </div>
          
          <div v-if="viewCode" class="code-display">
            <pre><code>{{ generatedTheme.code }}</code></pre>
          </div>
        </div>
      </div>
    </ul>
</template>

<style scoped>
/* Your Original Styles - UNCHANGED */
ul.themes {
  display: flex;
  flex-direction: row;
  gap: var(--space-rg);
  padding: var(--space-lg) 0;
}

ul.themes-ai {
  display: flex;
  flex-direction: column;
  gap: var(--space-rg);
}

ul.themes li.item {
  display: flex;
  flex-direction: column;
  gap: var(--space-rg);
  cursor: pointer;
  padding: var(--space-rg);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  transition: all var(--transition-smooth);
  background: var(--card);
  aspect-ratio: 1;
  flex: 1;
  text-align: center;
  box-shadow: var(--shadow-sm);
}

ul.themes li.item .icon {
  border-radius: var(--radius-rg);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
  overflow: hidden;
  aspect-ratio: 1;
}

ul.themes li.item.active {
  display: none;
  background: var(--active);
  border-color: var(--active-border);
}

ul.themes li.item.active:hover {
  background: var(--active);
  border-color: var(--active-border);
}

ul.themes li.item:hover {
  background: var(--dark-hover);
  border-color: var(--focus);
  box-shadow: var(--shadow-md);
}

/* AI Theme Styles - NEW */
ul.ai-themes {
  display: flex;
  flex-direction: row;
}

ul.ai-themes li.ai-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-rg);
  cursor: pointer;
  padding: var(--space-rg);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  transition: all var(--transition-smooth);
  background: var(--card);
  aspect-ratio: 1;
  flex: 1;
  text-align: center;
  box-shadow: var(--shadow-sm);
}

.ai-icon {
  border-radius: var(--radius-rg);
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #9333ea, #7c3aed);
  overflow: hidden;
  aspect-ratio: 1;
}

.robot-icon {
  font-size: 24px;
  color: white;
}

.clear-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: none;
  background: rgba(0,0,0,0.5);
  color: white;
  cursor: pointer;
  font-size: 12px;
}

.toggle-ai {
  display: flex;
  flex-direction: column;
  gap: var(--space-rg);
  cursor: pointer;
  padding: var(--space-lg);
  border-radius: var(--radius-md);
  font-family: 'mono';
  text-transform: uppercase;
  font-size: var(--font-sm);
  border: 1px solid var(--border);
  transition: all var(--transition-smooth);
  background: var(--card);
  flex: 1;
  text-align: center;
  box-shadow: var(--shadow-sm);
  &:hover {
      background: var(--dark-hover);
      border-color: var(--focus);
      box-shadow: var(--shadow-md);
  }
}



.ai-input-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.ai-input-group label {
  font-weight: 600;
  color: var(--text-primary);
}

.ai-input-group textarea {
  padding: var(--space-md);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  resize: vertical;
  font-family: inherit;
}

.ai-input-group textarea:focus {
  outline: none;
  border-color: var(--accent);
}

.ai-actions {
  display: flex;
  justify-content: flex-end;
}

.error-message {
  padding: var(--space-md);
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: var(--radius-sm);
  color: #dc2626;
  font-size: var(--font-sm);
}

.generation-status {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  background: var(--info);
  border: 1px solid var(--info-border);
  color: var(--info-txt);
  border-radius: var(--radius-rg);
  font-family: 'mono';
  font-size: var(--font-sm);
  text-transform: uppercase;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 1px solid var(--info-txt);
  border-top: 2px solid var(--info-border);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.generated-code {
  display: none;
  margin-top: var(--space-lg);
  padding: var(--space-lg);
  border: 2px solid var(--ai-accent, #9333ea);
  border-radius: var(--radius-md);
  background: var(--ai-bg, #faf5ff);
}

.generated-code h4 {
  margin: 0 0 var(--space-md) 0;
  color: var(--ai-accent, #9333ea);
}

.code-actions {
  display: flex;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.copy-btn, .toggle-btn {
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--ai-accent, #9333ea);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--ai-accent, #9333ea);
  cursor: pointer;
  font-size: var(--font-sm);
}

.copy-btn:hover, .toggle-btn:hover {
  background: var(--ai-accent, #9333ea);
  color: white;
}

.code-display {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: #1e1e1e;
}

.code-display pre {
  margin: 0;
  padding: var(--space-md);
  color: #d4d4d4;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  line-height: 1.4;
  white-space: pre-wrap;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  ul.themes, ul.ai-themes {
    flex-direction: column;
  }
}
</style>