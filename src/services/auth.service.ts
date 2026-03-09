import { mockState } from '@/lib/mock/provider'
import { createMockUser } from '@/lib/mock/generators'
import { buildMinimalMockLand } from '@/lib/mock/landBuilder'
import { toSlug } from '@/lib/utils/slug'
import type { User } from '@/types/user'
import type { Land } from '@/types/land'
import type { LandTheme } from '@/types/theme'

function delay(ms = 600): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const KNOWN_EMAILS = ['jane@lands.app', 'test@lands.app']

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  first_name: string
  last_name: string
  email: string
  password: string
}

export interface AuthResult {
  user: User
  lands: Land[]
  needsOnboarding: boolean
}

export interface OnboardingPayload {
  handle: string
  title: string
  themeDefaults: Omit<LandTheme, 'id' | 'land_id'>
}

const authService = {
  async login(payload: LoginPayload): Promise<AuthResult> {
    await delay()
    if (!KNOWN_EMAILS.includes(payload.email)) {
      throw new Error('No account found with this email.')
    }
    if (payload.password.length < 6) {
      throw new Error('Invalid password.')
    }
    return {
      user: mockState.user,
      lands: mockState.lands,
      needsOnboarding: false,
    }
  },

  async register(payload: RegisterPayload): Promise<AuthResult> {
    await delay()
    if (KNOWN_EMAILS.includes(payload.email)) {
      throw new Error('An account with this email already exists.')
    }
    const user = createMockUser({
      first_name: payload.first_name,
      last_name: payload.last_name,
      email: payload.email,
    })
    return {
      user,
      lands: [],
      needsOnboarding: true,
    }
  },

  async forgotPassword(_email: string): Promise<void> {
    await delay()
    // Always succeeds silently (mock)
  },

  async resetPassword(token: string, _password: string): Promise<void> {
    await delay()
    if (!token) {
      throw new Error('This reset link is invalid or has expired.')
    }
  },

  async completeOnboarding(userId: string, payload: OnboardingPayload): Promise<Land> {
    await delay()
    const { land } = buildMinimalMockLand({
      user_id: userId,
      handle: toSlug(payload.handle),
      title: payload.title,
    })
    land.theme = { ...land.theme, ...payload.themeDefaults }
    mockState.lands.push(land)
    return land
  },

  async logout(): Promise<void> {
    await delay(200)
  },
}

export default authService
