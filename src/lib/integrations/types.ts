/**
 * Integration System Types
 *
 * This module defines the types for a scalable integration system that supports
 * both OAuth and API key-based authentication methods.
 */

import type { SectionType } from '@/types/sections'

// Authentication methods supported by integrations
export type IntegrationAuthMethod = 'oauth' | 'api_key' | 'webhook'

// Integration categories
export type IntegrationCategory = 'email' | 'payment' | 'automation' | 'analytics' | 'calendar' | 'music'

// OAuth token data (stored encrypted in database)
export interface OAuthTokenData {
  accessToken: string
  refreshToken?: string
  expiresAt?: string
  scope?: string
}

// Connected account info (displayed to user)
export interface ConnectedAccountInfo {
  id: string
  email?: string
  name?: string
  avatar?: string
}

// Integration connection status
export interface IntegrationConnection {
  id: string
  projectId: string
  providerId: string
  isConnected: boolean
  connectedAt?: string
  accountInfo?: ConnectedAccountInfo
  // Additional provider-specific settings (not secrets)
  settings: Record<string, string>
}

// Base integration definition
export interface IntegrationDefinition {
  id: string
  name: string
  description: string
  category: IntegrationCategory
  authMethod: IntegrationAuthMethod
  icon?: string
  docsUrl?: string
  /** Which sections can use this integration, or 'global' for all */
  boundTo: SectionType[] | 'global'
  /** Status for UI display */
  status?: 'available' | 'coming-soon' | 'beta'
  // For OAuth integrations
  oauth?: {
    authUrl: string
    scopes: string[]
  }
  // For API key integrations (fields to show in config form)
  configFields?: IntegrationConfigField[]
  // Settings fields (non-secret configuration)
  settingsFields?: IntegrationSettingField[]
}

// Config field for API key integrations
export interface IntegrationConfigField {
  key: string
  label: string
  type: 'text' | 'password' | 'url'
  placeholder: string
  required: boolean
  helpText?: string
}

// Settings field (non-secret configuration)
export interface IntegrationSettingField {
  key: string
  label: string
  type: 'text' | 'select'
  placeholder?: string
  options?: { value: string; label: string }[]
  helpText?: string
}

// Integration handler interface (implemented by each provider)
export interface IntegrationHandler {
  // Get the definition
  getDefinition(): IntegrationDefinition

  // Initiate OAuth flow (returns redirect URL)
  initiateOAuth?(projectId: string, redirectUri: string): Promise<string>

  // Handle OAuth callback
  handleOAuthCallback?(code: string, state: string): Promise<OAuthTokenData>

  // Validate API key connection
  validateApiKey?(config: Record<string, string>): Promise<boolean>

  // Get connected account info
  getAccountInfo?(connection: IntegrationConnection): Promise<ConnectedAccountInfo | null>

  // Execute an action (e.g., add subscriber, create payment link)
  executeAction?(
    connection: IntegrationConnection,
    action: string,
    data: Record<string, unknown>
  ): Promise<unknown>
}
