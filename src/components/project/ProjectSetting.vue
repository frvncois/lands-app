<script setup>
import { ref, computed, watch } from 'vue'
import InputNormal from '@/components/input/InputNormal.vue'
import InputBoolean from '@/components/input/InputBoolean.vue'
import CollaboratorsList from '@/components/collaborator/CollaboratorsList.vue'
import PlanSelector from '@/components/project/ProjectSubscription.vue'
import { useProjectStore } from '@/stores/projects'
import { useTeamStore } from '@/stores/team'
import { validateUrl, checkUrlAvailability} from '@/utils/urlValidation.js'

const props = defineProps(['project'])
const projectStore = useProjectStore()
const teamStore = useTeamStore()

// URL validation state
const urlValidation = ref({ isValid: true, errors: [], warnings: [] })
const urlAvailability = ref({ available: true, message: '' })
const urlSuggestions = ref([])
const isCheckingUrl = ref(false)

// Domain validation state
const domainValidation = ref({ isValid: true, errors: [], warnings: [] })
const domainStatus = ref({ verified: false, message: '' })
const isCheckingDomain = ref(false)

// Team data for CollaboratorsList
const collaborators = computed(() => teamStore.getAllCollaborators())
const projects = computed(() => projectStore.projects || [])

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
      
      // Generate suggestions if not available
      if (!urlAvailability.value.available) {
        urlSuggestions.value = generateUrlSuggestions(urlValidation.value.cleanUrl)
      } else {
        urlSuggestions.value = []
      }
      
      isCheckingUrl.value = false
    }, 1000)
  }
}

function generateUrlSuggestions(baseUrl) {
  return [
    `${baseUrl}-site`,
    `${baseUrl}-project`, 
    `${baseUrl}-official`,
    `${baseUrl}-2024`,
    `${baseUrl}-music`
  ]
}

function validateCustomDomain(domain) {
  domainValidation.value = validateDomain(domain)
  
  if (domainValidation.value.isValid) {
    isCheckingDomain.value = true
    
    // Simulate domain verification check
    setTimeout(() => {
      // For demo purposes, randomly determine if domain is verified
      const isVerified = Math.random() > 0.5
      
      domainStatus.value = {
        verified: isVerified,
        message: isVerified 
          ? 'Domain is properly configured and verified'
          : 'Domain configuration pending - check DNS settings'
      }
      
      isCheckingDomain.value = false
    }, 1500)
  }
}

function validateDomain(domain) {
  const errors = []
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

// Team management functions
function updateCollaborator(collaboratorId, collaboratorData) {
  const { name, email, selectedProjects } = collaboratorData
  
  // Update account info
  teamStore.addAccountInfo(collaboratorId, { name, email })
  
  // Get current projects and update
  const currentProjects = teamStore.getProjectsByCollaborator(collaboratorId)
  
  // Remove from projects not selected
  currentProjects.forEach(projectId => {
    if (!selectedProjects.includes(projectId)) {
      teamStore.removeCollaboratorFromProject(projectId, collaboratorId)
    }
  })
  
  // Add to newly selected projects
  selectedProjects.forEach(projectId => {
    if (!currentProjects.includes(projectId)) {
      teamStore.addCollaboratorToProject(projectId, collaboratorId)
    }
  })
  
  console.log('Collaborator updated:', { name, email, projects: selectedProjects })
}

function removeCollaborator(collaboratorId) {
  // Remove from all projects
  const projects = teamStore.getProjectsByCollaborator(collaboratorId)
  projects.forEach(projectId => {
    teamStore.removeCollaboratorFromProject(projectId, collaboratorId)
  })
  
  // Remove account info
  teamStore.removeAccountInfo(collaboratorId)
  
  console.log('Collaborator removed:', collaboratorId)
}

function getProjectsByCollaborator(collaboratorId) {
  return teamStore.getProjectsByCollaborator(collaboratorId)
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
    <InputNormal 
        label="Custom Domain" 
        placeholder="www.yoursite.com"
        v-model="props.project.settings.customDomain"
        :status-type="getDomainStatusType()"
        :status-message="getDomainStatusMessage()"
    />
    
    <ul class="items">

      
      <div v-if="props.project.settings.customDomain && domainValidation.isValid && !isCheckingDomain" class="domain-status">
        <!-- DNS Instructions -->
        <div class="dns-instructions">
          <h4>DNS Configuration Required</h4>
          <p>Add these DNS records to your domain provider:</p>
          
          <div class="dns-records">
            <div class="dns-record">
              <strong>CNAME Record:</strong>
              <code>www.{{ props.project.settings.customDomain }}</code>
              <span>→</span>
              <code>{{ props.project.settings.url }}.lands.dev</code>
              <button @click="copyToClipboard(`www.${props.project.settings.customDomain}`)" class="copy-btn">Copy</button>
            </div>
            
            <div class="dns-record">
              <strong>A Record:</strong>
              <code>{{ props.project.settings.customDomain }}</code>
              <span>→</span>
              <code>76.76.19.19</code>
              <button @click="copyToClipboard('76.76.19.19')" class="copy-btn">Copy</button>
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

    <ul class="form">
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

      <PlanSelector
        :project="props.project"
      />

    <ul class="items">
      <CollaboratorsList 
        :projectId="props.project.id"
        :collaborators="collaborators"
        :projects="projects"
        :get-projects-by-collaborator="getProjectsByCollaborator"
        @update="updateCollaborator"
        @remove="removeCollaborator"
      />
    </ul>
  </ul>
</template>

<style scoped>
ul.list {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);

}

.domain-status {
  margin-top: var(--space-md);
  padding: var(--space-md);
  background: var(--surface);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
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