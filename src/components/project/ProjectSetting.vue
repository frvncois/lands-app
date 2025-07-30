<script setup>
import { ref, computed, watch } from 'vue'
import InputNormal from '@/components/input/InputNormal.vue'
import InputBoolean from '@/components/input/InputBoolean.vue'
import CollaboratorsList from '@/components/collaborator/CollaboratorsList.vue'
import PlanSelector from '@/components/project/ProjectSubscription.vue'
import { useProjectStore } from '@/stores/projects'
import { validateUrl, checkUrlAvailability} from '@/utils/urlValidation.js'

const props = defineProps(['project'])
const projectStore = useProjectStore()

// URL validation state
const urlValidation = ref({ isValid: true, errors: [], warnings: [] })
const urlAvailability = ref({ available: true, message: '' })
const urlSuggestions = ref([])
const isCheckingUrl = ref(false)

// Domain validation state
const domainValidation = ref({ isValid: true, errors: [], warnings: [] })
const domainStatus = ref({ verified: false, message: '' })
const isCheckingDomain = ref(false)

// Computed URL status
const urlStatus = computed(() => {
  if (!urlValidation.value.isValid) {
    return { type: 'error', message: urlValidation.value.errors[0] }
  }
  if (!urlAvailability.value.available) {
    return { type: 'error', message: urlAvailability.value.message }
  }
  if (urlAvailability.value.available && props.project.settings.url) {
    return { type: 'success', message: 'URL is available' }
  }
  return { type: 'neutral', message: '' }
})

// Watch URL changes for validation
watch(() => props.project.settings.url, (newUrl) => {
  if (newUrl) {
    validateProjectUrl(newUrl)
  } else {
    urlValidation.value = { isValid: true, errors: [], warnings: [] }
    urlAvailability.value = { available: true, message: '' }
    urlSuggestions.value = []
  }
}, { immediate: true })

// Watch domain changes for validation
watch(() => props.project.settings.customDomain, (newDomain) => {
  if (newDomain) {
    validateCustomDomain(newDomain)
  } else {
    domainValidation.value = { isValid: true, errors: [], warnings: [] }
    domainStatus.value = { verified: false, message: '' }
  }
}, { immediate: true })

function validateProjectUrl(url) {
  // Validate format
  urlValidation.value = validateUrl(url)
  
  if (urlValidation.value.isValid) {
    // Check availability
    isCheckingUrl.value = true
    
    // Simulate API delay (replace with actual API call later)
    setTimeout(() => {
      urlAvailability.value = checkUrlAvailability(
        urlValidation.value.cleanUrl, 
        projectStore.projects.filter(p => p.id !== props.project.id)
      )
      
      // Generate suggestions if URL is taken
      if (!urlAvailability.value.available) {
        urlSuggestions.value = generateUrlSuggestions(
          props.project.name || 'project',
          projectStore.projects
        )
      } else {
        urlSuggestions.value = []
      }
      
      isCheckingUrl.value = false
    }, 500)
  } else {
    urlAvailability.value = { available: true, message: '' }
    urlSuggestions.value = []
    isCheckingUrl.value = false
  }
}

function validateCustomDomain(domain) {
  // Basic domain validation
  domainValidation.value = validateDomain(domain)
  
  if (domainValidation.value.isValid) {
    // Check domain status
    isCheckingDomain.value = true
    
    // Simulate API delay (replace with actual domain verification API)
    setTimeout(() => {
      // Mock domain verification result
      domainStatus.value = {
        verified: false,
        message: 'Domain verification pending'
      }
      
      isCheckingDomain.value = false
    }, 800)
  } else {
    domainStatus.value = { verified: false, message: '' }
    isCheckingDomain.value = false
  }
}

function validateDomain(domain) {
  const errors = []
  
  // Basic domain format validation
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i
  
  if (!domain || domain.trim() === '') {
    return { isValid: true, errors: [] } // Empty is valid (optional field)
  }
  
  if (!domainRegex.test(domain)) {
    errors.push('Invalid domain format')
  }
  
  if (domain.length > 253) {
    errors.push('Domain name too long')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    // Could add a toast notification here
    console.log('Copied to clipboard:', text)
  }).catch(err => {
    console.error('Failed to copy:', err)
  })
}

function getUrlStatusType() {
  if (!props.project.settings.url) return null
  if (isCheckingUrl.value) return 'loading'
  if (!urlValidation.value.isValid) return 'error'
  if (!urlAvailability.value.available) return 'error'
  if (urlAvailability.value.available) return 'success'
  return null
}

function getUrlStatusMessage() {
  if (!props.project.settings.url) return ''
  if (isCheckingUrl.value) return 'Checking availability...'
  if (!urlValidation.value.isValid) return urlValidation.value.errors[0]
  if (!urlAvailability.value.available) return urlAvailability.value.message
  if (urlAvailability.value.available) return 'URL is available'
  return ''
}

function getDomainStatusType() {
  if (!props.project.settings.customDomain) return null
  if (isCheckingDomain.value) return 'loading'
  if (!domainValidation.value.isValid) return 'error'
  if (domainStatus.value.verified) return 'success'
  if (!domainStatus.value.verified && domainValidation.value.isValid) return 'warning'
  return null
}

function getDomainStatusMessage() {
  if (!props.project.settings.customDomain) return ''
  if (isCheckingDomain.value) return 'Verifying domain...'
  if (!domainValidation.value.isValid) return domainValidation.value.errors[0]
  if (domainStatus.value.verified) return 'Domain verified and connected'
  if (!domainStatus.value.verified && domainValidation.value.isValid) return domainStatus.value.message
  return ''
}

// Initialize project settings if they don't exist
if (!props.project.settings.hasOwnProperty('protected')) {
  props.project.settings.protected = false
}
if (!props.project.settings.hasOwnProperty('password')) {
  props.project.settings.password = ''
}
if (!props.project.settings.hasOwnProperty('requireEmail')) {
  props.project.settings.requireEmail = false
}
if (!props.project.settings.hasOwnProperty('customDomain')) {
  props.project.settings.customDomain = ''
}
</script>

<template>
  <ul v-if="props.project" class="list">

      <InputNormal 
        label="Lands URL" 
        placeholder="your-project-name"
        v-model="props.project.settings.url"
        :status-type="getUrlStatusType()"
        :status-message="getUrlStatusMessage()"
      />
      
      <ul class="items">
        <InputNormal 
          label="Custom Domain" 
          placeholder="www.yoursite.com"
          v-model="props.project.settings.customDomain"
          :status-type="getDomainStatusType()"
          :status-message="getDomainStatusMessage()"
        />
        
        <div v-if="props.project.settings.customDomain && domainValidation.isValid && !isCheckingDomain" class="domain-status">
          <!-- DNS Instructions -->
          <div class="dns-instructions">
            <h4>DNS Configuration Required</h4>
            <p>Add these DNS records to your domain provider:</p>
            
            <div class="dns-records">
              <div class="dns-record">
                <div class="record-header">
                  <span class="record-type">CNAME</span>
                  <span class="record-label">Main Domain</span>
                </div>
                <div class="record-details">
                  <div class="record-field">
                    <label>Name/Host:</label>
                    <code>www</code>
                    <button class="copy-btn" @click="copyToClipboard('www')">📋</button>
                  </div>
                  <div class="record-field">
                    <label>Value/Target:</label>
                    <code>{{ props.project.settings.url }}.lands.app</code>
                    <button class="copy-btn" @click="copyToClipboard(`${props.project.settings.url}.lands.app`)">📋</button>
                  </div>
                </div>
              </div>
              
              <div class="dns-record">
                <div class="record-header">
                  <span class="record-type">A</span>
                  <span class="record-label">Root Domain (Optional)</span>
                </div>
                <div class="record-details">
                  <div class="record-field">
                    <label>Name/Host:</label>
                    <code>@</code>
                    <button class="copy-btn" @click="copyToClipboard('@')">📋</button>
                  </div>
                  <div class="record-field">
                    <label>Value/Target:</label>
                    <code>192.168.1.100</code>
                    <button class="copy-btn" @click="copyToClipboard('192.168.1.100')">📋</button>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="dns-help">
              <p><strong>Need help?</strong> DNS changes can take up to 24-48 hours to propagate worldwide.</p>
              <button class="verify-btn">Verify Domain</button>
              <button class="help-btn">Domain Setup Guide</button>
            </div>
          </div>
        </div>
      </ul>

      <ul class="items">
        <InputBoolean 
          label="Published" 
          details="Make your project visible to the public"
          v-model="props.project.settings.published" 
        />
        
        <InputBoolean 
          label="Protect by password" 
          details="Require a password to view your project"
          v-model="props.project.settings.protected" 
        />
        
        <InputNormal 
          v-if="props.project.settings.protected"
          label="Password" 
          placeholder="Enter project password"
          type="password"
          v-model="props.project.settings.password" 
        />
        
        <InputBoolean 
          label="Require email" 
          details="Users must provide email to access your project"
          v-model="props.project.settings.requireEmail" 
        />
      </ul>

      <ul class="items">
        <PlanSelector
          :project="props.project"
        />
      </ul>

      <ul class="items">
        <CollaboratorsList :projectId="props.project.id" />
      </ul>

  </ul>
</template>


<style scoped>
ul.list {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  margin-top: var(--space-lg);
  > ul.items{
    padding-top: var(--space-lg);
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    border-top: 1px solid var(--border);
  }
}
</style>