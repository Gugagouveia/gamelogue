export const DEFAULT_PAGINATION = {
  PAGE: 1,
  LIMIT: 20,
} as const

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const
