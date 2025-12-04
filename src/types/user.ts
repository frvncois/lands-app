// User Profile
export interface UserProfile {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: string
}

// User Preferences
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  emailNotifications: boolean
  marketingEmails: boolean
}

// User Settings (combined)
export interface UserSettings {
  profile: UserProfile
  preferences: UserPreferences
}

// Default user settings
export function getDefaultUserSettings(): UserSettings {
  return {
    profile: {
      id: '',
      email: '',
      name: '',
      avatar: '',
      createdAt: new Date().toISOString(),
    },
    preferences: {
      theme: 'system',
      emailNotifications: true,
      marketingEmails: false,
    },
  }
}
