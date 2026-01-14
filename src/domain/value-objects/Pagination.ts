export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginationResult {
  page: number
  limit: number
  total: number
  pages: number
}
