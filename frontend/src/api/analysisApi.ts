import axios from 'axios'
import type { PrdAnalysisResponse } from '../types/analysis'
import type { PrdAnalysisRequest } from '../types/api'

const apiClient = axios.create({
  baseURL: (import.meta.env.VITE_API_URL ?? '') + '/api/v1',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const analysisApi = {
  analyze(request: PrdAnalysisRequest): Promise<PrdAnalysisResponse> {
    return apiClient.post<PrdAnalysisResponse>('/analysis', request).then(r => r.data)
  },

  getById(id: number): Promise<PrdAnalysisResponse> {
    return apiClient.get<PrdAnalysisResponse>(`/analysis/${id}`).then(r => r.data)
  },

  getRecent(limit = 20): Promise<PrdAnalysisResponse[]> {
    return apiClient.get<PrdAnalysisResponse[]>('/analysis', { params: { limit } }).then(r => r.data)
  }
}
