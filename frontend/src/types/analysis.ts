export type Priority = 'HIGH' | 'MEDIUM' | 'LOW'
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

export interface FeatureDto {
  name: string
  description: string
  priority: Priority
  notes: string | null
}

export interface UserStoryDto {
  role: string
  action: string
  benefit: string
  acceptanceCriteria: string[]
  notes: string | null
}

export interface TodoItemDto {
  task: string
  category: string
  priority: Priority
  estimatedEffort: string
  notes: string | null
}

export interface ApiDraftDto {
  method: HttpMethod
  path: string
  description: string
  requestBody: string | null
  responseBody: string | null
  notes: string | null
}

export interface DbDraftDto {
  tableName: string
  columns: string[]
  notes: string | null
}

export interface ChecklistItemDto {
  item: string
  category: string
  uncertain: boolean
}

export interface PrdAnalysisResponse {
  id: number
  features: FeatureDto[]
  userStories: UserStoryDto[]
  todos: TodoItemDto[]
  apiDrafts: ApiDraftDto[]
  dbDrafts: DbDraftDto[]
  testChecklist: ChecklistItemDto[]
  releaseChecklist: ChecklistItemDto[]
  uncertainItems: string[]
  readmeDraft: string | null
  createdAt: string | number[]
}
