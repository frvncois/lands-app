<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import InputNormal from '@/components/input/InputNormal.vue'
import InputBoolean from '@/components/input/InputBoolean.vue'
import CollaboratorsList from '@/components/collaborator/CollaboratorsList.vue'
import PlanSelector from '@/components/project/ProjectSubscription.vue'
import { validateUrl, checkUrlAvailability} from '@/utils/urlValidation.js'

const props = defineProps({
  project: {
    type: Object,
    required: true
  },
  userStore: {
    type: Object,
    required: true
  }
})

// URL validation state
const urlValidation = ref({ isValid: true, errors: [], warnings: [] })
const urlAvailability = ref({ available: true, message: '' })
const urlSuggestions = ref([])
const isCheckingUrl = ref(false)

// Domain validation state
const domainValidation = ref({ isValid: true, errors: [], warnings: [] })
const domainStatus = ref({ verified: false, message: '' })
const isCheckingDomain = ref(false)

// Get projects from user store for URL validation
const allProjects = computed(() => props.userStore.projects || [])

// FIXED: Safe initialization function (not in computed)
function initializeProjectSettings() {
  if (!props.project.settings) {
    props.project.settings = {}
  }
  
  // Initialize default values if they don't exist
  const defaults = {
    protected: false,
    password: '',
    requireEmail: false,
    customDomain: '',
    url: '',
    published: false
  }
  
  let needsUpdate = false
  Object.keys(defaults).forEach(key => {
    if (!props.project.settings.hasOwnProperty(key)) {
      props.project.settings[key] = defaults[key]
      needsUpdate = true
    }
  })
  
  if (needsUpdate) {
    console.log('⚙️ Project settings initialized with defaults')
  }
}

// FIXED: Read-only computed for settings (no mutations)
const projectSettings = computed(() => {
  return props.project.settings || {}
})

// Computed URL status
const urlStatus = computed(() => {
  if (!urlValidation.value.isValid) {
    return { type: 'error', message: urlValidation.value.errors[0] }
  }
  if (!urlAvailability.value.available) {
    return { type: 'error', message: urlAvailability.value.message }
  }
  if (urlAvailability.value.available && projectSettings.value.url) {
    return { type: 'success', message: 'URL is available' }
  }
  return { type: 'neutral', message: '' }
})

// Computed domain status
const domainStatusComputed = computed(() => {
  if (!projectSettings.value.customDomain) return null
  if (isCheckingDomain.value) return 'loading'
  if (!domainValidation.value.isValid) return 'error'
  if (domainStatus.value.verified) return 'success'
  if (!domainStatus.value.verified && domainValidation.value.isValid) return 'warning'
  return null
})

// Watch URL changes for validation
watch(() => projectSettings.value.url, (newUrl) => {
  if (newUrl) {
    validateProjectUrl(newUrl)
  } else {
    urlValidation.value = { isValid: true, errors: [], warnings: [] }
    urlAvailability.value = { available: true, message: '' }
    urlSuggestions.value = []
  }
}, { immediate: true })

// Watch domain changes for validation
watch(() => projectSettings.value.customDomain, (newDomain) => {
  if (newDomain) {
    validateCustomDomain(newDomain)
  } else {
    domainValidation.value = { isValid: true, errors: [], warnings: [] }
    domainStatus.value = { verified: false, message: '' }
  }
}, { immediate: true })

// URL validation functions
function validateProjectUrl(url) {
  // Validate format
  urlValidation.value = validateUrl(url)
  
  if (urlValidation.value.isValid) {
    // Check availability against other projects
    isCheckingUrl.value = true
    
    nextTick(() => {
      checkUrlAvailability(url, allProjects.value, props.project.id)
        .then(result => {
          urlAvailability.value = result
          if (!result.available && result.suggestions) {
            urlSuggestions.value = result.suggestions
          }
        })
        .catch(error => {
          console.error('❌ URL availability check failed:', error)
          urlAvailability.value = { available: false, message: 'Could not check availability' }
        })
        .finally(() => {
          isCheckingUrl.value = false
        })
    })
  }
}

function validateCustomDomain(domain) {
  // Basic domain validation
  const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  
  if (!domainRegex.test(domain)) {
    domainValidation.value = {
      isValid: false,
      errors: ['Please enter a valid domain name'],
      warnings: []
    }
    return
  }
  
  domainValidation.value = { isValid: true, errors: [], warnings: [] }
  
  // Check domain verification status
  isCheckingDomain.value = true
  
  // Simulate domain verification check
  setTimeout(() => {
    domainStatus.value = {
      verified: false,
      message: 'DNS records need to be configured'
    }
    isCheckingDomain.value = false
  }, 1000)
}

// Save project settings using the store
async function saveProjectSettings() {
  try {
    const result = await props.userStore.updateProject(props.project.id, {
      settings: projectSettings.value
    })
    
    if (result.success) {
      console.log('✅ Project settings saved')
    } else {
      console.error('❌ Failed to save settings:', result.error)
    }
  } catch (error) {
    console.error('❌ Error saving settings:', error)
  }
}

// Auto-save when settings change
let saveTimeout = null
watch(projectSettings, () => {
  // Debounce the save operation
  clearTimeout(saveTimeout)
  saveTimeout = setTimeout(saveProjectSettings, 1000)
}, { deep: true })

// Status helper functions
function getUrlStatusType() {
  if (!projectSettings.value.url) return null
  if (isCheckingUrl.value) return 'loading'
  return urlStatus.value.type === 'neutral' ? null : urlStatus.value.type
}

function getUrlStatusMessage() {
  if (!projectSettings.value.url) return ''
  if (isCheckingUrl.value) return 'Checking availability...'
  return urlStatus.value.message
}

function getDomainStatusType() {
  return domainStatusComputed.value
}

function getDomainStatusMessage() {
  if (!projectSettings.value.customDomain) return ''
  if (isCheckingDomain.value) return 'Verifying domain...'
  if (!domainValidation.value.isValid) return domainValidation.value.errors[0]
  if (domainStatus.value.verified) return 'Domain verified and connected'
  if (!domainStatus.value.verified && domainValidation.value.isValid) return domainStatus.value.message
  return ''
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).catch(err => {
    console.error('Failed to copy:', err)
  })
}

function verifyDomain() {
  if (!projectSettings.value.customDomain) return
  validateCustomDomain(projectSettings.value.customDomain)
}

// FIXED: Initialize on mount instead of in computed
onMounted(() => {
  initializeProjectSettings()
  console.log('⚙️ ProjectSetting component initialized')
})
</script>

<template>
  <ul v-if="props.project" class="list">
    <!-- Project URL Settings -->
    <InputNormal 
      label="Lands URL" 
      placeholder="your-project-name"
      v-model="projectSettings.url"
      :status-type="getUrlStatusType()"
      :status-message="getUrlStatusMessage()"
    />
    
    <InputNormal 
      label="Custom Domain" 
      placeholder="www.yoursite.com"
      v-model="projectSettings.customDomain"
      :status-type="getDomainStatusType()"
      :status-message="getDomainStatusMessage()"
    />
    
    <!-- DNS Configuration Instructions -->
    <ul class="items" v-if="projectSettings.customDomain && domainValidation.isValid && !isCheckingDomain">
      <div class="domain-status">
        <div class="dns-instructions">
          <h4>DNS Configuration Required</h4>
          <p>Add these DNS records to your domain provider:</p>
          
          <div class="dns-records">
            <div class="dns-record">
              <strong>CNAME Record:</strong>
              <code>www.{{ projectSettings.customDomain }}</code> → <code>lands.dev</code>
              <button class="copy-btn" @click="copyToClipboard('lands.dev')">Copy</button>
            </div>
            <div class="dns-record">
              <strong>A Record:</strong>
              <code>{{ projectSettings.customDomain }}</code> → <code>185.199.108.153</code>
              <button class="copy-btn" @click="copyToClipboard('185.199.108.153')">Copy</button>
            </div>
          </div>
          
          <div class="dns-help">
            <p>Once you've added these records, it may take up to 24 hours for changes to propagate.</p>
            <button class="verify-btn" @click="verifyDomain">Verify Domain</button>
          </div>
        </div>
      </div>
    </ul>
    
    <!-- Privacy Settings -->
    <ul class="items">
      <InputBoolean
        label="Password Protection"
        description="Require a password to view this project"
        v-model="projectSettings.protected"
      />
      
      <InputNormal 
        v-if="projectSettings.protected"
        label="Password"
        placeholder="Enter password"
        type="password"
        v-model="projectSettings.password"
      />
      
      <InputBoolean
        label="Require Email"
        description="Collect visitor email addresses"
        v-model="projectSettings.requireEmail"
      />
    </ul>
    
    <!-- Plan and Collaborators -->
    <ul class="items">
      <PlanSelector 
        :project="props.project"
        :user-store="userStore"
      />

    </ul>
  </ul>
</template>

<!-- Styles remain the same -->

<style scoped>
ul.list {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

ul.items {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding-bottom: var(--space-lg);
  border-bottom: 1px solid var(--border);
}

ul.items:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.domain-status {
  padding: var(--space-md);
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  margin-top: var(--space-sm);
}

.dns-instructions {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.dns-instructions h4 {
  margin: 0;
  color: var(--text-primary);
}

.dns-records {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.dns-record {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm);
  background: var(--background);
  border-radius: var(--radius-sm);
  font-family: monospace;
  font-size: var(--font-sm);
}

.dns-record code {
  background: var(--code-background);
  padding: 2px 6px;
  border-radius: 3px;
}

.copy-btn, .verify-btn, .help-btn {
  padding: var(--space-xs) var(--space-sm);
  background: var(--button-background);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: var(--font-xs);
  transition: background-color var(--transition-smooth);
}

.copy-btn:hover, .verify-btn:hover, .help-btn:hover {
  background: var(--button-hover);
}

.dns-help {
  margin-top: var(--space-md);
  padding-top: var(--space-md);
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.dns-help p {
  margin: 0;
  font-size: var(--font-sm);
  color: var(--text-secondary);
}
</style>