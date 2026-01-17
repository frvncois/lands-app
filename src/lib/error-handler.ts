/**
 * ERROR HANDLER
 *
 * Centralized error handling utility.
 * Provides consistent error messages and logging.
 */

import { useToast } from '@/stores/toast'

// Custom error class with user-friendly messages
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public userMessage: string,
    public recoverable: boolean = true
  ) {
    super(message)
    this.name = 'AppError'
  }
}

// Error codes for categorization
export const ErrorCodes = {
  // Auth errors
  AUTH_FAILED: 'AUTH_FAILED',
  AUTH_EXPIRED: 'AUTH_EXPIRED',
  AUTH_RATE_LIMITED: 'AUTH_RATE_LIMITED',

  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',

  // Data errors
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  CONFLICT: 'CONFLICT',

  // Permission errors
  PERMISSION_DENIED: 'PERMISSION_DENIED',

  // Generic
  UNKNOWN: 'UNKNOWN',
} as const

export type ErrorCode = keyof typeof ErrorCodes

// User-friendly messages for common errors
const ERROR_MESSAGES: Record<string, string> = {
  'Invalid login credentials': 'Incorrect email or password. Please try again.',
  'Email not confirmed': 'Please check your email and confirm your account.',
  'User already registered': 'An account with this email already exists.',
  'Password should be at least 6 characters': 'Password must be at least 6 characters.',
  'fetch failed': 'Unable to connect. Please check your internet connection.',
  'Failed to fetch': 'Unable to connect. Please check your internet connection.',
  'NetworkError': 'Network error. Please check your connection.',
  'rate limit': 'Too many requests. Please wait a moment and try again.',
}

/**
 * Get user-friendly message for an error
 */
function getUserMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.userMessage
  }

  if (error instanceof Error) {
    // Check for known error messages
    for (const [key, message] of Object.entries(ERROR_MESSAGES)) {
      if (error.message.toLowerCase().includes(key.toLowerCase())) {
        return message
      }
    }
    return error.message
  }

  return 'Something went wrong. Please try again.'
}

/**
 * Handle an error with toast notification and logging
 */
export function handleError(
  error: unknown,
  context: string,
  options: {
    showToast?: boolean
    toastTitle?: string
  } = {}
): void {
  const { showToast = true, toastTitle = 'Error' } = options
  const toast = useToast()

  // Get user-friendly message
  const userMessage = getUserMessage(error)

  // Show toast notification
  if (showToast) {
    toast.error(toastTitle, userMessage)
  }

  // Log to console
  if (import.meta.env.DEV) {
    console.error(`[${context}]`, error)
  } else {
    // In production, log minimal info
    console.error(`[${context}] ${userMessage}`)
  }
}

/**
 * Create a typed AppError
 */
export function createError(
  code: ErrorCode,
  message: string,
  userMessage?: string
): AppError {
  return new AppError(
    message,
    code,
    userMessage || 'Something went wrong',
    code !== 'PERMISSION_DENIED'
  )
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase()
    return msg.includes('fetch') ||
           msg.includes('network') ||
           msg.includes('timeout') ||
           msg.includes('abort')
  }
  return false
}

/**
 * Check if error is an auth error
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase()
    return msg.includes('auth') ||
           msg.includes('login') ||
           msg.includes('credential') ||
           msg.includes('token') ||
           msg.includes('session')
  }
  return false
}
