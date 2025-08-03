<script setup>
import { ref, computed, watch } from 'vue'
import InputNormal from '@/components/input/InputNormal.vue'
import ButtonSubmit from '@/components/button/ButtonMain.vue'
import ButtonMain from '@/components/button/ButtonMain.vue'
import UploadIcon from '@/assets/icons/UploadIcon.vue'
import { fetchArtistData } from '@/services/guano'

const props = defineProps({
  projectData: {
    type: Object,
    default: () => ({})
  },
  userStore: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['project-data-updated', 'continue-to-themes'])

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

// Helper function to simulate delay
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Update step status
function updateStepStatus(stepIndex, status, message = '') {
  if (stepIndex >= 0 && stepIndex < fetchSteps.value.length) {
    fetchSteps.value[stepIndex].status = status
    if (message) {
      fetchSteps.value[stepIndex].message = message
    }
    currentStep.value = stepIndex
  }
}

// Extract year from release data
function getYear(dateString) {
  if (!dateString) return ''
  const year = dateString.match(/\d{4}/)
  return year ? year[0] : ''
}

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
      updateStepStatus(6, 'complete', 'All data loaded successfully!')
      
      fetchedData.value = result.data
      fetchStatus.value = 'Data loaded successfully!'
      
      // Emit the updated project data with fetched information
      const updatedProjectData = {
        ...props.projectData,
        name: projectName.value,
        url: projectUrl.value,
        fetchedData: result.data,
        releases: result.data.releases || [],
        socials: result.data.socials || []
      }
      
      emit('project-data-updated', updatedProjectData)
      
    } else {
      updateStepStatus(currentStep.value, 'error', result.error || 'Failed to fetch data')
      fetchStatus.value = result.error || 'Failed to fetch artist data'
    }
    
  } catch (error) {
    console.error('❌ Fetch error:', error)
    updateStepStatus(currentStep.value, 'error', 'Connection failed')
    fetchStatus.value = 'Failed to connect to MusicBrainz'
  } finally {
    isFetching.value = false
  }
}

function continueToThemes() {
  const updatedProjectData = {
    ...props.projectData,
    name: projectName.value,
    url: projectUrl.value,
    fetchedData: fetchedData.value
  }
  
  emit('continue-to-themes', updatedProjectData)
}

// Watch for changes and emit updates
watch([projectName, projectUrl], () => {
  const updatedProjectData = {
    ...props.projectData,
    name: projectName.value,
    url: projectUrl.value,
    fetchedData: fetchedData.value
  }
  
  emit('project-data-updated', updatedProjectData)
})
</script>

<template>
  <ul class="form">
    <!-- Project Details Input -->
    <li class="header">
      <h2>Set up your music project</h2>
      <p>Enter your artist/band name to automatically fetch releases and social links</p>
    </li>
    
    <ul class="items">
      <InputNormal 
        label="Artist/Band Name" 
        placeholder="Enter your artist or band name"
        v-model="projectName"
      />
      
      <InputNormal 
        label="Project URL" 
        placeholder="Optional: custom URL slug"
        v-model="projectUrl"
      />
    </ul>
    
    <!-- Fetch Data Section -->
    <li class="fetch-section" v-if="projectName.trim().length > 0">
      <h5>Automatically populate content</h5>
      <p>We can search for your releases, social links, and cover art automatically.</p>
      
      <ButtonMain
        :label="isFetching ? 'Fetching...' : 'Fetch Data from web'"
        :buttonStyle="'light'"
        :disabled="!canFetchData"
        @click="fetchMusicBrainzData"
      />
      
      <!-- Fetching Progress -->
      <ul class="fetching" v-if="isFetching || fetchedData">
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
    </li>
    
    <!-- Fetched Data Preview -->
    <li v-if="fetchedData" class="fetched-data">
      <h5>Found {{ (fetchedData.releases?.length || 0) + (fetchedData.socials?.length || 0) }} items</h5>
      
      <!-- Releases Section -->
      <div v-if="fetchedData.releases?.length > 0" class="data-section">
        <h5>Releases ({{ fetchedData.releases.length }})</h5>
        <ul class="releases">
          <li 
            v-for="(release, index) in fetchedData.releases.slice(0, 3)" 
            :key="release.musicbrainzId || index"
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
                <h3>{{ release.name }}</h3>
                <label>{{ getYear(release.description?.split('Released: ')[1]) }}</label>
              </li>
              <li>
                <h4 class="item-tracks" v-if="release.tracks?.length">{{ release.tracks.length }} tracks</h4>
              </li>
            </ul>
          </li>
          
          <li v-if="fetchedData.releases.length > 3" class="more-indicator">
            <p>+ {{ fetchedData.releases.length - 3 }} more releases</p>
          </li>
        </ul>
      </div>
      
      <!-- Social Links Section -->
      <div v-if="fetchedData.socials?.length > 0" class="data-section">
        <h5>Social Links ({{ fetchedData.socials.length }})</h5>
        <ul class="socials">
          <li 
            v-for="(social, index) in fetchedData.socials.slice(0, 4)" 
            :key="social.url || index"
            class="social"
          >
            <div class="social-icon">{{ social.icon || '🔗' }}</div>
            <div class="social-info">
              <h4>{{ social.title }}</h4>
              <p>{{ social.url }}</p>
            </div>
          </li>
          
          <li v-if="fetchedData.socials.length > 4" class="more-indicator">
            <p>+ {{ fetchedData.socials.length - 4 }} more links</p>
          </li>
        </ul>
      </div>
    </li>
  </ul>
</template>

<style scoped>
ul.form {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  padding: var(--space-lg);
}

li.header {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

li.header h2 {
  margin: 0;
  font-size: var(--font-xl);
  font-weight: 700;
  color: var(--text-primary);
}

li.header p {
  margin: 0;
  font-size: var(--font-sm);
  color: var(--text-secondary);
  font-family: 'mono';
  text-transform: uppercase;
}

ul.items {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
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

.fetch-section h5 {
  margin: 0;
  font-size: var(--font-md);
  font-weight: 600;
  color: var(--text-primary);
}

.fetch-section p {
  margin: 0;
  font-size: var(--font-sm);
  color: var(--text-secondary);
}

ul.fetching {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  margin-top: var(--space-md);
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
}

.step-icon .spinner {
  animation: spin 1s linear infinite;
}

.step-icon .check {
  animation: bounce 0.6s ease;
}

.step-icon .error {
  animation: shake 0.6s ease;
}

.step-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.step-message {
  font-size: var(--font-sm);
  color: var(--text-secondary);
}

/* Fetched Data Styles */
.fetched-data {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  padding: var(--space-md);
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
}

.fetched-data h5 {
  margin: 0;
  font-size: var(--font-md);
  font-weight: 600;
  color: var(--text-primary);
}

.data-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.data-section h5 {
  margin: 0;
  font-size: var(--font-sm);
  font-weight: 600;
  color: var(--text-primary);
  text-transform: uppercase;
  font-family: 'mono';
}

/* Releases Styles */
ul.releases {
  display: flex;
  gap: var(--space-md);
  flex-direction: column;
}

ul.releases > li.release {
  display: flex;
  gap: var(--space-md);
  padding: var(--space-sm);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--background);
}

ul.releases .image {
  aspect-ratio: 1;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  width: 80px;
  overflow: hidden;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: var(--details);
  background: var(--card);
}

ul.releases .image > img {
  object-fit: cover;
  height: 100%;
  width: 100%;
}

ul.releases .image .no-image {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
}

ul.releases .image .no-image p {
  font-family: 'mono';
  text-transform: uppercase;
  font-size: var(--font-xs);
  margin: 0;
}

ul.releases .content {
  padding: var(--space-sm);
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

ul.releases .content > li {
  display: flex;
  gap: var(--space-sm);
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

ul.releases .content h3 {
  margin: 0;
  font-size: var(--font-md);
  font-weight: 600;
  color: var(--text-primary);
}

ul.releases .content label {
  font-size: var(--font-sm);
  color: var(--text-secondary);
  font-family: 'mono';
  text-transform: uppercase;
}

ul.releases .content h4 {
  margin: 0;
  font-size: var(--font-sm);
  color: var(--text-accent);
  font-weight: 500;
}

/* Social Links Styles */
ul.socials {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

ul.socials > li.social {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-sm);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--background);
}

.social-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  background: var(--card);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
  border: 1px solid var(--border);
}

.social-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.social-info h4 {
  margin: 0;
  font-size: var(--font-sm);
  font-weight: 600;
  color: var(--text-primary);
}

.social-info p {
  margin: 0;
  font-size: var(--font-xs);
  color: var(--text-secondary);
  font-family: 'mono';
}

.more-indicator {
  text-align: center;
  padding: var(--space-sm);
  color: var(--text-secondary);
  font-style: italic;
}

.more-indicator p {
  margin: 0;
  font-size: var(--font-sm);
}

/* Animations */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes bounce {
  0%, 20%, 60%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  80% { transform: translateY(-5px); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

@keyframes slideInScale {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.9);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>