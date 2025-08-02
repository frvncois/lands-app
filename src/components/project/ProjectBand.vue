<script setup>
import { ref, computed, watch } from 'vue'
import { useProjectStore } from '@/stores/projects' // Import the store
import InputNormal from '@/components/input/InputNormal.vue'
import ButtonSubmit from '@/components/button/ButtonMain.vue'
import ButtonMain from '@/components/button/ButtonMain.vue'
import UploadIcon from '@/assets/icons/UploadIcon.vue'
import { fetchArtistData } from '@/services/guano'

const props = defineProps(['projectData'])
const emit = defineEmits(['project-data-updated', 'continue-to-themes'])

// Initialize the store
const projectStore = useProjectStore()

const projectName = ref(props.projectData?.name || '')
const projectUrl = ref(props.projectData?.url || '')
const tempProject = ref({
  design: {
    theme: props.projectData?.design?.theme || null
  }
})

const isFetching = ref(false)
const fetchStatus = ref('')
const fetchedData = ref(null)
const fetchSteps = ref([])
const currentStep = ref(0)

// Define the fetching steps for visual feedback
const steps = [
  { id: 1, label: 'Searching artist...', icon: '🔍', status: 'waiting' },
  { id: 2, label: 'Found artist details', icon: '🎤', status: 'waiting' },
  { id: 3, label: 'Fetching releases...', icon: '📀', status: 'waiting' },
  { id: 4, label: 'Getting track details...', icon: '🎵', status: 'waiting' },
  { id: 5, label: 'Downloading cover art...', icon: '🎨', status: 'waiting' },
  { id: 6, label: 'Processing social links...', icon: '🔗', status: 'waiting' },
  { id: 7, label: 'Finalizing data...', icon: '✨', status: 'waiting' }
]

// Computed property to check if we can fetch data
const canFetchData = computed(() => {
  return projectName.value.trim().length > 0 && !isFetching.value
})

// Computed property to check if we can create project
const canCreateProject = computed(() => {
  return projectName.value.trim().length > 0 && !isFetching.value
})

async function fetchMusicBrainzData() {
  if (!canFetchData.value) return
  
  isFetching.value = true
  fetchedData.value = null
  fetchSteps.value = [...steps] // Reset steps
  currentStep.value = 0
  fetchStatus.value = 'Searching MusicBrainz database...'
  
  try {
    // Step 1: Searching artist
    updateStepStatus(0, 'loading', 'Searching MusicBrainz database...')
    await sleep(500) // Show loading animation
    
    // Step 2: Artist found
    updateStepStatus(1, 'loading', 'Processing artist information...')
    await sleep(300)
    
    // Step 3: Fetching releases
    updateStepStatus(2, 'loading', 'Getting releases list...')
    await sleep(200)
    
    const result = await fetchArtistData(projectName.value)
    
    if (result.success) {
      // Step 4: Track details
      updateStepStatus(3, 'loading', 'Processing track information...')
      await sleep(400)
      
      // Step 5: Cover art
      updateStepStatus(4, 'loading', 'Downloading album artwork...')
      await sleep(600)
      
      // Step 6: Social links
      updateStepStatus(5, 'loading', 'Processing social media links...')
      await sleep(300)
      
      // Step 7: Finalizing
      updateStepStatus(6, 'complete', `Successfully imported data!`)
      
      fetchedData.value = result.data
      fetchStatus.value = `✅ Found data for "${result.selectedArtist.name}" - ${result.data.releases.length} releases, ${result.data.socials.length} social links`
      
      console.log('📦 Fetched data ready for project creation:', result.data)
    } else {
      updateStepStatus(currentStep.value, 'error', `❌ ${result.error}`)
      fetchStatus.value = `❌ ${result.error}`
      fetchedData.value = null
    }
  } catch (error) {
    updateStepStatus(currentStep.value, 'error', `❌ Error: ${error.message}`)
    fetchStatus.value = `❌ Error: ${error.message}`
    fetchedData.value = null
    console.error('Fetch error:', error)
  } finally {
    isFetching.value = false
  }
}

// Update step status with animation
function updateStepStatus(stepIndex, status, message = '') {
  if (stepIndex < fetchSteps.value.length) {
    // Mark previous steps as complete
    for (let i = 0; i < stepIndex; i++) {
      if (fetchSteps.value[i].status !== 'error') {
        fetchSteps.value[i].status = 'complete'
      }
    }
    
    fetchSteps.value[stepIndex].status = status
    if (message) {
      fetchSteps.value[stepIndex].message = message
    }
    currentStep.value = stepIndex
  }
}

// Helper function for delays
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function handleContinue() {
  const projectData = {
    name: projectName.value,
    url: projectUrl.value,
    design: tempProject.value.design,
    fetchedData: fetchedData.value,
    type: 'music-artist'
  }
  
  console.log('📋 Passing data to themes step:', projectData)
  
  emit('continue-to-themes', projectData)
}

function clearFetchedData() {
  fetchedData.value = null
  fetchStatus.value = ''
  fetchSteps.value = []
  currentStep.value = 0
}

// Remove individual items from fetched data
function removeRelease(index) {
  if (fetchedData.value?.releases) {
    fetchedData.value.releases.splice(index, 1)
    updateProjectData() // Emit changes to parent
  }
}

function removeSocial(index) {
  if (fetchedData.value?.socials) {
    fetchedData.value.socials.splice(index, 1)
    updateProjectData() // Emit changes to parent
  }
}

// Helper function to extract year from date
function getYear(dateString) {
  if (!dateString) return 'Unknown'
  return dateString.split('-')[0] || 'Unknown'
}

// Emit data updates to parent
function updateProjectData() {
  const projectData = {
    name: projectName.value,
    url: projectUrl.value, 
    design: tempProject.value.design,
    fetchedData: fetchedData.value
  }
  
  emit('project-data-updated', projectData)
}

// Watch for changes and emit updates
watch([projectName, projectUrl, () => tempProject.value.design.theme], updateProjectData)
</script>

<template>
  <ul class="form">

    <ul class="form">
      <InputNormal 
        label="Artist/Band name" 
        placeholder="Enter band or artist name" 
        v-model="projectName"
      />
      
      <li class="fetch">
        <ButtonMain 
          :label="isFetching ? 'Fetching...' : 'Fetch Data from web'"
          :buttonStyle="'light'"
          :disabled="!canFetchData"
          @click="fetchMusicBrainzData"
        />
        
        <ul class="fetching">
          <li
            v-if="fetchSteps[currentStep]"
            class="step active"
          >
            <div class="step-icon">
              <span v-if="fetchSteps[currentStep].status === 'loading'" class="spinner">⏳</span>
              <span v-else-if="fetchSteps[currentStep].status === 'complete'" class="check">✅</span>
              <span v-else-if="fetchSteps[currentStep].status === 'error'" class="error">❌</span>
              <span v-else class="waiting">{{ fetchSteps[currentStep].icon }}</span>
            </div>
            <div class="step-content">
              <span v-if="fetchSteps[currentStep].message" class="step-message">{{ fetchSteps[currentStep].message }}</span>
            </div>
          </li>
        </ul>
        
        <!-- Detailed Fetched Data Preview -->
        <ul v-if="fetchedData" class="items">
          
          <!-- Releases Section -->
          <ul v-if="fetchedData.releases?.length > 0" class="releases">
              <li 
                v-for="(release, index) in fetchedData.releases" 
                :key="release.musicbrainzId"
                class="release"
              >
                <div class="image">
                  <img 
                    v-if="release.img" 
                    :src="release.img" 
                    :alt="release.name"
                    @error="$event.target.style.display = 'none'"
                  />
                  <div v-else class="no-image">
                    <UploadIcon/>
                    <p>no image found</p>
                  </div>
                </div>
                <ul class="content">
                  <li>
                    <h2>{{ release.name }}</h2>
                    <label>{{ getYear(release.description?.split('Released: ')[1]) }}</label>
                  </li>
                  <li>
                    <h4 class="item-tracks" v-if="release.tracks?.length">{{ release.tracks.length }} tracks</h4>
                    <button @click="removeRelease(index)" class="remove-btn">Remove ×</button>
                  </li>
                </ul>
              </li>
            </ul>
          
          <!-- Socials Section -->
          <div v-if="fetchedData.socials?.length > 0" class="socials">
            <h5>🔗 Social Links</h5>
            <div class="items-list">
              <div 
                v-for="(social, index) in fetchedData.socials" 
                :key="social.musicbrainzId + index"
                class="item-card social-card"
              >
                <div class="item-info">
                  <h6>{{ social.name }}</h6>
                  <p class="item-url">{{ social.url }}</p>
                </div>
                <button @click="removeSocial(index)" class="remove-btn">×</button>
              </div>
            </div>
          </div>
          
        </ul>
      </li>
    </ul>

  </ul>
</template>

<style scoped>
ul.form {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: var(--space-lg);
  
  > li.header {
    padding-bottom: var(--space-lg);
    border-bottom: 1px solid var(--border);
  
  }
  
  li.item {
    display: grid;
    grid-template-columns: 0.15fr 1fr 0.15fr;
    align-items: center;
    gap: var(--space-md);
    cursor: pointer;
    padding: var(--space-rg);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border);
    transition: all var(--transition-smooth);
    
    > .icon {
      display: flex;
      align-items: center;
      justify-content: center;
      aspect-ratio: 1;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
    }
    
    > .content {
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);

      
      > p {
        color: var(--details);
        font-size: var(--font-sm);
        font-family: 'mono';
        text-transform: uppercase;
      }
    }
    
    > .actions {
      display: flex;
      justify-content: flex-end;
      margin-right: var(--space-md);
    }
    
    &:hover {
      background: var(--card);
      transform: scale(1.01);
      border-color: var(--focus);
    }
  }

ul.releases {
  display: flex;
  gap: var(--space-md);
  flex-direction: column;
  > li {
    display: flex;
    > .image {
      aspect-ratio: 1;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      width: 10em;
      overflow: hidden;
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;
      color: var(--details);
      > img {
        object-fit: cover;
        height: 100%;
        width: 100%;
      }
      & p {
      font-family: 'mono';
      text-transform: uppercase;
      font-size: var(--font-sm);
      }
    }
    > ul.content {
      padding: var(--space-md);
      flex: 1;
      justify-content: space-between;
      > li {
        display: flex;
        gap: var(--space-sm);
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
      }
    }
  }
}

  ul.items {
    display: flex;
    gap: var(--space-rg);
    flex-direction: column;
    max-height: 30vh;
    overflow: scroll;
  }
  
  .fetch-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    padding: var(--space-md);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background: var(--modal);
  }
  

  
  .step {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-md);
    border-radius: var(--radius-lg);
    background: var(--card);
    border: 1px solid var(--border);
    animation: slideInScale 0.4s ease;
  }
  
  .step-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 1px solid var(--border);
    flex-shrink: 0;
    
    .spinner {
      animation: spin 1s linear infinite;
    }
    
    .check {
      animation: bounce 0.6s ease;
    }
    
    .error {
      animation: shake 0.6s ease;
    }
  }
  
  .step-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
    
    .step-label {
      font-weight: 500;
      color: var(--text-primary);
      font-size: var(--font-sm);
    }
    
    .step-message {
      font-size: var(--font-xs);
      color: var(--light);
      font-family: 'mono';
      text-transform: uppercase;
    }
  }
  

  
  .fetch-status {
    padding: var(--space-sm);
    border-radius: var(--radius-sm);
    font-size: var(--font-sm);
    font-family: 'mono';
    animation: fadeIn 0.3s ease;
    
    &.success {
      background: var(--success-bg, #e8f5e8);
      color: var(--success-text, #2e7d32);
      border: 1px solid var(--success, #4caf50);
    }
    
    &.error {
      background: var(--error-bg, #ffebee);
      color: var(--error-text, #c62828);
      border: 1px solid var(--danger, #f44336);
    }
  }
  
  .fetched-preview {
    padding: var(--space-md);
    background: var(--bg-secondary);
    border-radius: var(--radius-md);
    border: 1px solid var(--border);
    animation: fadeInUp 0.5s ease;
    
    .preview-header {
      margin-bottom: var(--space-md);
      
      h4 {
        margin: 0 0 var(--space-sm) 0;
        font-size: var(--font-md);
        color: var(--text-primary);
      }
      
      .preview-stats {
        display: flex;
        gap: var(--space-md);
        align-items: center;
        
        .stat {
          font-size: var(--font-xs);
          color: var(--text-secondary);
          background: var(--bg);
          padding: var(--space-xs) var(--space-sm);
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
          
          &.animate-in {
            animation: popIn 0.5s ease;
          }
        }
        
        .clear-btn {
          margin-left: auto;
          padding: var(--space-xs) var(--space-sm);
          font-size: var(--font-xs);
          background: transparent;
          color: var(--danger);
          border: 1px solid var(--danger);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 0.2s ease;
          
          &:hover {
            background: var(--danger);
            color: white;
          }
        }
      }
    }
    
    .items-section {
      margin-bottom: var(--space-lg);
      
      h5 {
        margin: 0 0 var(--space-md) 0;
        font-size: var(--font-sm);
        color: var(--text-primary);
        font-weight: 600;
      }
    }
    
    .items-grid {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
    }
    
    .items-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
    }
    
    .item-card {
      position: relative;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: var(--space-sm);
      transition: all 0.2s ease;
      
      &:hover {
        border-color: var(--primary);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        
        .remove-btn {
          opacity: 1;
        }
      }
    }
    
    .release-card {
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
      
      .item-image {
        border-radius: var(--radius-sm);
        overflow: hidden;
        background: var(--border);
        display: flex;
        align-items: center;
        justify-content: center;
        
        img {
          width: 100%;
          height: 10px;
          object-fit: cover;
        }
      }
    }
    
    .social-card {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      
      .social-icon {
        width: 40px;
        height: 40px;
        border-radius: var(--radius-sm);
        background: var(--bg-secondary);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
        flex-shrink: 0;
      }
    }
    
    .item-info {
      flex: 1;
      
      h6 {
        margin: 0 0 var(--space-xs) 0;
        font-size: var(--font-sm);
        color: var(--text-primary);
        font-weight: 500;
        line-height: 1.3;
      }
      
      .item-year {
        margin: 0;
        font-size: var(--font-xs);
        color: var(--text-secondary);
        font-weight: 600;
      }
      
      .item-tracks {
        margin: var(--space-xs) 0 0 0;
        font-size: var(--font-xs);
        color: var(--text-secondary);
      }
      
      .item-url {
        margin: 0;
        font-size: var(--font-xs);
        color: var(--text-secondary);
        word-break: break-all;
      }
    }
    
    .remove-btn {
      position: absolute;
      top: var(--space-xs);
      right: var(--space-xs);
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--danger);
      color: white;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--font-sm);
      font-weight: bold;
      opacity: 0;
      transition: all 0.2s ease;
      
      &:hover {
        background: var(--danger-hover, #d32f2f);
        transform: scale(1.1);
      }
    }
  }
}

ul.form {
    padding-bottom: var(--space-lg);
    display: flex;
    flex-direction: column;
    gap: var(--space-rg);
    > li.fetch {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
    }
}



/* Animations */
@keyframes slideInScale {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-3px); }
  75% { transform: translateX(3px); }
}

@keyframes shimmer {
  0% { 
    background: linear-gradient(90deg, var(--primary) 0%, rgba(0, 122, 204, 0.5) 50%, var(--primary) 100%);
    background-size: 200% 100%;
    background-position: -200% 0;
  }
  100% { 
    background-position: 200% 0;
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes popIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>