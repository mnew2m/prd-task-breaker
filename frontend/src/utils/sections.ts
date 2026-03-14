export type GridSectionKey =
  | 'features'
  | 'userStories'
  | 'todos'
  | 'apiDrafts'
  | 'dbDrafts'
  | 'testChecklist'
  | 'releaseChecklist'
  | 'uncertainItems'

export const SECTION_LABELS: Record<GridSectionKey, string> = {
  features: '기능 목록',
  userStories: '유저 스토리',
  todos: 'TODO',
  apiDrafts: 'API 초안',
  dbDrafts: 'DB 초안',
  testChecklist: '테스트 체크리스트',
  releaseChecklist: '릴리즈 체크리스트',
  uncertainItems: '불확실 항목',
}

export const DEFAULT_SECTION_ORDER: GridSectionKey[] = [
  'features', 'userStories', 'todos', 'apiDrafts',
  'dbDrafts', 'testChecklist', 'releaseChecklist', 'uncertainItems',
]
