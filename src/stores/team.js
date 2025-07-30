import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTeamStore = defineStore('team', () => {
  const projectCollaborators = ref([])
  const accountsInfo = ref({})

  function addCollaboratorToProject(projectId, accountId) {
    const existing = projectCollaborators.value.find(pc => pc.projectId === projectId)
    if (existing) {
      if (!existing.accountIds.includes(accountId)) {
        existing.accountIds.push(accountId)
      }
    } else {
      projectCollaborators.value.push({
        projectId,
        accountIds: [accountId]
      })
    }
  }

  function removeCollaboratorFromProject(projectId, accountId) {
    const existing = projectCollaborators.value.find(pc => pc.projectId === projectId)
    if (existing) {
      existing.accountIds = existing.accountIds.filter(id => id !== accountId)
    }
  }

  function getCollaboratorsByProject(projectId) {
    const projectCollab = projectCollaborators.value.find(pc => pc.projectId === projectId)
    return projectCollab ? projectCollab.accountIds : []
  }

  function addAccountInfo(accountId, info) {
    accountsInfo.value[accountId] = info
  }

  function getAccountInfo(accountId) {
    return accountsInfo.value[accountId] || { name: 'Unknown', email: '' }
  }

  function removeAccountInfo(accountId) {
    delete accountsInfo.value[accountId]
  }

  function getAllCollaborators() {
    return Object.keys(accountsInfo.value).map(accountId => ({
      accountId,
      ...accountsInfo.value[accountId]
    }))
  }

  function getProjectsByCollaborator(accountId) {
    return projectCollaborators.value
      .filter(pc => pc.accountIds.includes(accountId))
      .map(pc => pc.projectId)
  }

  function reset() {
    projectCollaborators.value = []
    accountsInfo.value = {}
  }

  return {
    projectCollaborators,
    accountsInfo,
    addCollaboratorToProject,
    removeCollaboratorFromProject,
    getCollaboratorsByProject,
    addAccountInfo,
    getAccountInfo,
    removeAccountInfo,
    getAllCollaborators,
    getProjectsByCollaborator,
    reset
  }
}, {
  persist: true
})