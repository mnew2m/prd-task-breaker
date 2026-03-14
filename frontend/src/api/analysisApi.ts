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
  analyze(request: PrdAnalysisRequest, signal?: AbortSignal): Promise<PrdAnalysisResponse> {
    return apiClient.post<PrdAnalysisResponse>('/analysis', request, { signal }).then(r => r.data)
  },

  getById(id: number): Promise<PrdAnalysisResponse> {
    return apiClient.get<PrdAnalysisResponse>(`/analysis/${id}`).then(r => r.data)
  },

  getRecent(limit = 3): Promise<PrdAnalysisResponse[]> {
    return apiClient.get<PrdAnalysisResponse[]>('/analysis', { params: { limit } }).then(r => r.data)
  },

  submitFeedback(id: number, useful: boolean): Promise<PrdAnalysisResponse> {
    return apiClient.patch<PrdAnalysisResponse>(`/analysis/${id}/feedback`, { useful }).then(r => r.data)
  }
}
