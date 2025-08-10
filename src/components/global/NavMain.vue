<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import LandsLogo from '@/assets/LandsLogo.vue'
import ProjectsIcon from '@/assets/icons/ProjectsIcon.vue'
import IntegrationsIcon from '@/assets/icons/IntegrationsIcon.vue'
import TeamIcon from '@/assets/icons/TeamIcon.vue'
import AccountIcon from '@/assets/icons/AccountIcon.vue'
import LogoutIcon from '@/assets/icons/LogoutIcon.vue'

const props = defineProps({
  user: {
    type: Object,
    default: null
  },
  profile: {
    type: Object,
    default: null
  },
  projects: {
    type: Array,
    default: () => []
  },
  currentProject: {
    type: Object,
    default: null
  },
  userStore: {
    type: Object,
    default: null
  }
})

const router = useRouter()
const route = useRoute()

// Use userStore from props (passed from App.vue) or import directly
const userStore = props.userStore || useUserStore()

// Theme toggle state
const currentTheme = ref(document.body.getAttribute('data-theme') || 'dark')

async function handleLogout() {
  try {
    await userStore.signOut()
  } catch (error) {
    console.error('Logout failed:', error)
    router.push('/')
  }
}

function toggleTheme() {
  const newTheme = currentTheme.value === 'dark' ? 'light' : 'dark'
  currentTheme.value = newTheme
  document.body.setAttribute('data-theme', newTheme)
  
  // Save to localStorage
  localStorage.setItem('theme', newTheme)
}

// Load saved theme on mount
function loadSavedTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark'
  currentTheme.value = savedTheme
  document.body.setAttribute('data-theme', savedTheme)
}

// Load theme when component mounts
loadSavedTheme()
</script>

<template>
  <nav>
    <ul>
      <li>
        <div class="is-logo">
          <LandsLogo />
        </div>
      </li>
      <li>
        <router-link
          class="is-item"
          active-class=""
          exact-active-class=""
          :class="{ active: route.path === '/' || route.path.startsWith('/projects/') }"
          to="/"
        >
          <ProjectsIcon />
          <h2>Projects</h2>
        </router-link>
      </li>
      <li>
        <router-link 
          class="is-item" 
          active-class="" 
          exact-active-class="" 
          :class="{ active: route.path === '/team' }" 
          to="/team"
        >
          <TeamIcon />
          <h2>Team</h2>
        </router-link>
      </li>
      <li>
        <router-link 
          class="is-item" 
          active-class="" 
          exact-active-class="" 
          :class="{ active: route.path === '/integrations' }" 
          to="/integrations"
        >
          <IntegrationsIcon />
          <h2>Integrations</h2>
        </router-link>
      </li>
    </ul>
    <ul>
      <!-- Theme Toggle Button -->
      <li>
        <a class="is-item theme-toggle" @click="toggleTheme">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle v-if="currentTheme === 'dark'" cx="12" cy="12" r="5"/>
            <line v-if="currentTheme === 'dark'" x1="12" y1="1" x2="12" y2="3"/>
            <line v-if="currentTheme === 'dark'" x1="12" y1="21" x2="12" y2="23"/>
            <line v-if="currentTheme === 'dark'" x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line v-if="currentTheme === 'dark'" x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line v-if="currentTheme === 'dark'" x1="1" y1="12" x2="3" y2="12"/>
            <line v-if="currentTheme === 'dark'" x1="21" y1="12" x2="23" y2="12"/>
            <line v-if="currentTheme === 'dark'" x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line v-if="currentTheme === 'dark'" x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            <path v-if="currentTheme === 'light'" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
          <h2>{{ currentTheme === 'dark' ? 'Light' : 'Dark' }}</h2>
        </a>
      </li>
      <li>
        <router-link 
          class="is-item" 
          active-class="" 
          exact-active-class="" 
          :class="{ active: route.path === '/account' }" 
          to="/account"
        >
          <AccountIcon />
          <h2>Account</h2>
        </router-link>
      </li>
      <li>
        <a class="is-item" 
          @click="handleLogout">
          <LogoutIcon />
          <h2>Logout</h2>
        </a>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
  nav {
    position: fixed;
    top: var(--space-md);
    bottom: var(--space-md);
    left: var(--space-md);
    z-index: 2;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 4em;
    white-space: nowrap;
    border-radius: var(--radius-lg);
    border: 1px solid var(--border);
    background: var(--nav);
    backdrop-filter: blur(10px);
    overflow: hidden;
    transition: width var(--transition-smooth);

    & ul {
      display: flex;
      flex-direction: column;

      & .is-item {
        display: flex;
        align-items: center;
        gap: var(--space-rg);
        text-decoration: none;
        color: var(--light);
        overflow: hidden;
        cursor: pointer;
        transition: 
          background-color var(--transition-smooth),
          border-color var(--transition-smooth);

        > svg {
          width: 1.35em;
          height: 1.25em;
          flex-shrink: 0;
        }

        &.active {
          background: var(--current);
          border-color: var(--border);
        }

        &:hover {
          background: var(--current);
        }
        
        &.theme-toggle:hover {
          background: var(--dark-hover);
        }
      }

      &:first-child {
        padding: 1.5em 0.5em;
        gap: 0.5em;

        & .is-item {
          padding: 0.75em;
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
        }
      }

      &:last-child {
          margin: var(--space-sm);
          gap: var(--space-sm);
        & .is-item {
          padding: var(--space-rg);
          border-radius: var(--radius-md);

          &:hover {
            background: var(--dark-hover);
          }
        }
      }
    }

    & h2 {
      font-size: var(--font-sm);
      font-family: 'mono';
      text-transform: uppercase;
      opacity: 0;
      transform: translateX(-0.75em);
      transition: opacity var(--transition-smooth),
                  transform var(--transition-smooth);
    }

    & .is-logo {
      display: flex;
      align-items: center;
      color: var(--light);
      gap: 1em;
      padding: 0.75em;
      margin-bottom: 2.5em;

      > svg {
        width: 1.5em;
        height: 1.5em;
        flex-shrink: 0;
      }
    }

    &:hover {
      width: 12em;

      & h2 {
        opacity: 1;
        transform: translateX(0em);
      }
    }
  }
</style>