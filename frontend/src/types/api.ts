export interface ApiError {
  status: number
  error: string
  message: string
  timestamp: string
}

export interface PrdAnalysisRequest {
  prdContent: string
}
