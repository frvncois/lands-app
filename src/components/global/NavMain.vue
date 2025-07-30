<script setup>
import { useRouter, useRoute } from 'vue-router'
import { useAccountStore } from '@/stores/account'
import LandsLogo from '@/assets/LandsLogo.vue'
import ProjectsIcon from '@/assets/icons/ProjectsIcon.vue'
import IntegrationsIcon from '@/assets/icons/IntegrationsIcon.vue'
import TeamIcon from '@/assets/icons/TeamIcon.vue'
import AccountIcon from '@/assets/icons/AccountIcon.vue'
import LogoutIcon from '@/assets/icons/LogoutIcon.vue'

const router = useRouter()
const route = useRoute()
const accountStore = useAccountStore()

function handleLogout() {
  accountStore.logout()
  router.push('/')
}
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